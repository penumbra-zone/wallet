import { ClientController, WalletController } from '../controllers'
import { ExtensionStorage } from '../storage'
import { IndexedDb } from '../utils'
import {
	AddressByIndexRequest,
	AssetsRequest,
	AssetsResponse,
	BalancesRequest,
	BalancesResponse,
	ChainParametersRequest,
	ChainParametersResponse,
	EphemeralAddressRequest,
	FMDParametersRequest,
	FMDParametersResponse,
	NoteByCommitmentRequest,
	NoteByCommitmentResponse,
	NotesRequest,
	NotesResponse,
	StatusRequest,
	StatusResponse,
	StatusStreamRequest,
	StatusStreamResponse,
	TransactionInfoByHashRequest,
	TransactionInfoRequest,
	TransactionInfoResponse,
	TransactionPlannerRequest,
	WitnessRequest,
	WitnessResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'
import {
	ASSET_TABLE_NAME,
	CHAIN_PARAMETERS_TABLE_NAME,
	FMD_PARAMETERS_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
	SWAP_TABLE_NAME,
	TRANSACTION_TABLE_NAME,
} from '../lib'
import { WasmViewConnector } from '../utils/WasmViewConnector'
import { bytesToBase64 } from '../utils/base64'
import { bech32m } from 'bech32'

import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { penumbraWasm } from '../utils/wrapperPenumbraWasm'
import { SwapClaimPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/dex/v1alpha1/dex_pb'

const areEqual = (first, second) =>
	first.length === second.length &&
	first.every((value, index) => value === second[index])

export class ViewProtocolService {
	private indexedDb
	private extensionStorage
	private getLastExistBlock
	private getTransaction
	private getAccountAddresByIndex
	private getAccountFullViewingKey

	constructor({
		indexedDb,
		extensionStorage,
		getLastExistBlock,
		getTransaction,
		getAccountAddresByIndex,
		getAccountFullViewingKey,
	}: {
		indexedDb: IndexedDb
		extensionStorage: ExtensionStorage
		getLastExistBlock: ClientController['getLastExistBlock']
		getTransaction: WasmViewConnector['getTransaction']
		getAccountAddresByIndex: WalletController['getAccountAddresByIndex']
		getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword']
	}) {
		this.indexedDb = indexedDb
		this.extensionStorage = extensionStorage
		this.getLastExistBlock = getLastExistBlock
		this.getTransaction = getTransaction
		this.getAccountAddresByIndex = getAccountAddresByIndex
		this.getAccountFullViewingKey = getAccountFullViewingKey
	}

	async getBalances(request?: BalancesRequest): Promise<BalancesResponse[]> {
		const { balance } = await this.extensionStorage.getState('balance')

		let assets
		if (request.assetIdFilter) {
			assets = [
				await this.indexedDb.getValue(
					ASSET_TABLE_NAME,
					request.assetIdFilter.inner
				),
			]
		} else {
			assets = await this.indexedDb.getAllValue(ASSET_TABLE_NAME)
		}

		const res = assets.map(asset => {
			const balanceDetail: number = balance[asset.penumbraAssetId.inner] || 0
			return new BalancesResponse().fromJson({
				//TODO add account fields
				balance: {
					amount: {
						lo: balanceDetail,
						//TODO add hi
					},
					assetId: {
						inner: asset.penumbraAssetId.inner,
						altBech32m: asset.display,
						altBaseDenom: asset.base,
					},
				},
			})
		})

		return res
	}

	async getStatus(request?: StatusRequest): Promise<StatusResponse> {
		const { lastSavedBlock } = await this.extensionStorage.getState(
			'lastSavedBlock'
		)
		const lasBlock = await this.getLastExistBlock()
		return new StatusResponse().fromJson({
			syncHeight: lastSavedBlock.testnet,
			catchingUp: lastSavedBlock.testnet === lasBlock,
		})
	}

	async getStatusStream(
		request?: StatusStreamRequest
	): Promise<StatusStreamResponse> {
		const { lastSavedBlock } = await this.extensionStorage.getState(
			'lastSavedBlock'
		)
		const lasBlock = await this.getLastExistBlock()

		return new StatusStreamResponse().fromJson({
			syncHeight: lastSavedBlock.testnet || 0,
			latestKnownBlockHeight: lasBlock,
		})
	}

	async getAssets(request?: AssetsRequest): Promise<AssetsResponse[]> {
		const assets = await this.indexedDb.getAllValue(ASSET_TABLE_NAME)

		const response = assets.map(i => {
			return new AssetsResponse().fromJson({ denomMetadata: i })
		})

		return response
	}

	async getChainParameters(
		request?: ChainParametersRequest
	): Promise<ChainParametersResponse> {
		const chainParameters = await this.indexedDb.getAllValue(
			CHAIN_PARAMETERS_TABLE_NAME
		)
		const response = new ChainParametersResponse().fromJson({
			parameters: chainParameters[0],
		})
		return response
	}

	async getNotes(request?: NotesRequest): Promise<NotesResponse[]> {
		const notes = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME)
		return notes.map(i => new NotesResponse().fromJson({ noteRecord: i }))
	}

	async getNoteByCommitment(request: object) {
		const decodeRequest = new NoteByCommitmentRequest().fromBinary(
			new Uint8Array(Object.values(request))
		)

		const notes = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME)

		const selectedNote = notes.find(i => {
			return areEqual(
				i.noteCommitment.inner,
				decodeRequest.noteCommitment.inner
			)
		})

		if (!selectedNote) {
			throw new Error('Note doesn`t exist')
		}
		return new NoteByCommitmentResponse({
			spendableNote: { ...selectedNote, noteCommitmentHex: undefined },
		}).toBinary()
	}

	async getTransactionInfo(
		request?: TransactionInfoRequest
	): Promise<TransactionInfoResponse[]> {
		const transactions = await this.indexedDb.getAllValue(
			TRANSACTION_TABLE_NAME
		)

		const response: TransactionInfoResponse[] = transactions
			.sort((a, b) => {
				return Number(a.height) - Number(b.height)
			})
			.map(txInfo => {
				return new TransactionInfoResponse().fromJson({
					txInfo,
				})
			})

		//TODO filter by request.startHeight and request.endHeight

		return response
	}

	async getTransactionInfoByHash(request: string) {
		const req = new TransactionInfoByHashRequest().fromJsonString(request)
		const id = req.id.toJson() as { hash: string }

		let tx = await this.indexedDb.getValue(TRANSACTION_TABLE_NAME, id.hash)

		if (!tx) {
			tx = await this.getTransaction(id.hash)
		}

		return {
			txInfo: tx || {},
		}
	}

	async getFMDParameters(
		request?: FMDParametersRequest
	): Promise<FMDParametersResponse> {
		const fmd = await this.indexedDb.getAllValue(FMD_PARAMETERS_TABLE_NAME)

		return new FMDParametersResponse().fromJson({
			parameters: fmd[0],
		})
	}

	async getWitness(request?: WitnessRequest) {
		return new WitnessResponse({}).toBinary()
	}

	async getTransactionPlanner(req?: string) {
		try {
			const request = new TransactionPlannerRequest().fromJsonString(req)

			let wasmPlanner = new penumbraWasm.WasmPlanner()

			let accountAddressByIndex = await this.getAccountAddresByIndex(0)

			let address = {
				altBech32m: accountAddressByIndex,
			}

			if (request.fee) {
				wasmPlanner.fee(request.fee)
			}

			if (request.memo) {
				wasmPlanner.memo(request.memo.toJson())
			}
			for (const output of request.outputs) {
				output.address.inner = undefined
				wasmPlanner.output(output.value.toJson(), output.address.toJson())
			}

			for (const swap of request.swaps) {
				const asset = await this.indexedDb.getValue(
					ASSET_TABLE_NAME,
					bytesToBase64(swap.targetAsset.inner)
				)

				let accountAddressByIndex = await this.getAccountAddresByIndex(0)

				let address = new Address({
					altBech32m: accountAddressByIndex,
				})

				wasmPlanner.swap(
					swap.value.toJson(),
					asset,
					swap.fee.toJson(),
					address.toJson()
				)
			}

			if (request.swapClaims) {
				for (const swapClaim of request.swapClaims) {
					await wasmPlanner.swap_claim(swapClaim.swapCommitment.toJson())
				}
			}

			let transactionPlan = await wasmPlanner.plan(address)

			return {
				plan: transactionPlan,
			}
		} catch (e) {
			console.error(e)
		}
	}

	async getAddressByIndex(request: string) {
		const req = new AddressByIndexRequest().fromJsonString(request)
		const address = await this.getAccountAddresByIndex(req.addressIndex.account)

		const decodeAddress = bech32m.decode(address, 160)

		return {
			address: {
				inner: bytesToBase64(
					new Uint8Array(bech32m.fromWords(decodeAddress.words))
				),
				altBech32m: address,
			},
		}
	}

	async getEphemeralAddress(request: string) {
		const req = new EphemeralAddressRequest().fromJsonString(request)

		const address: { inner: string } = penumbraWasm.get_ephemeral_address(
			await this.getAccountFullViewingKey(),
			Number(req.addressIndex.account)
		)

		const altBech32m = bech32m.encode(
			'penumbrav2t',
			bech32m.toWords(new Address().fromJson(address).inner),
			160
		)

		return {
			address: {
				...address,
				altBech32m,
			},
		}
	}
}
