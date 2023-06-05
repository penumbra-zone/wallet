import { ClientController } from '../controllers'
import { ExtensionStorage } from '../storage'
import { IAsset } from '../types/asset'
import { IndexedDb } from '../utils'
import {
	AssetsRequest,
	AssetsResponse,
	BalanceByAddressRequest,
	BalanceByAddressResponse,
	ChainParametersRequest,
	ChainParametersResponse,
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
	TRANSACTION_TABLE_NAME,
} from '../lib'

const areEqual = (first, second) =>
	first.length === second.length &&
	first.every((value, index) => value === second[index])

export class ViewProtocolService {
	private indexedDb
	private extensionStorage
	private getLastExistBlock

	constructor({
		indexedDb,
		extensionStorage,
		getLastExistBlock,
	}: {
		indexedDb: IndexedDb
		extensionStorage: ExtensionStorage
		getLastExistBlock: ClientController['getLastExistBlock']
	}) {
		this.indexedDb = indexedDb
		this.extensionStorage = extensionStorage
		this.getLastExistBlock = getLastExistBlock
	}

	async getBalanceByAddress(
		request?: BalanceByAddressRequest
	): Promise<BalanceByAddressResponse[]> {
		const { balance } = await this.extensionStorage.getState('balance')
		const assets = await this.indexedDb.getAllValue(ASSET_TABLE_NAME)

		const res = Object.entries(balance).map((i: [string, number]) => {
			return new BalanceByAddressResponse().fromJson({
				amount: {
					lo: i[1],
					//TODO add hi
					// hi:
				},
				asset: {
					inner: assets.find(asset => asset.penumbraAssetId.inner === i[0]).penumbraAssetId.inner,
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
			syncHeight: lastSavedBlock.testnet,
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

		// if (request.startHeight && request.endHeight) {
		// 	return response.filter(
		// 		tx =>
		// 			Number(tx.txInfo.height) >= Number(request.startHeight) &&
		// 			Number(tx.txInfo.height) <= Number(request.endHeight)
		// 	)
		// }

		// if (request.startHeight && !request.endHeight) {
		// 	return response.filter(
		// 		tx => Number(tx.txInfo.height) >= Number(request.startHeight)
		// 	)
		// }

		// if (!request.startHeight && request.endHeight) {
		// 	return response.filter(
		// 		tx => Number(tx.txInfo.height) <= Number(request.endHeight)
		// 	)
		// }

		return response
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

	async getTransactionPlanner(request?: TransactionPlannerRequest) {
		// create wasm planner here
		//

		if (request.fee !== undefined) {
			// insert fee to planer
		}
		for (const output of request.outputs) {
			// insert output to planer
		}

		for (const delegate of request.delegations) {
			// insert delegatins to planner
		}
		for (const swaps of request.swaps) {
			console.warn('swaps planner rpc not implemented')
		}

		// build plan

		return new TransactionInfoResponse()
	}

	mapTransaction(decodeTransaction) {
		return {
			bindingSig: new TextEncoder().encode(decodeTransaction.binding_sig),
			anchor: {
				inner: new TextEncoder().encode(decodeTransaction.anchor),
			},
			body: {
				actions: decodeTransaction.body.actions.map(i => {
					return {
						action: {
							case: Object.keys(i.action)[0].toLowerCase(),
							value: {
								authSig: {
									inner: new TextEncoder().encode(
										(Object.values(i.action)[0] as any).auth_sig
									),
								},
								proof: new TextEncoder().encode(
									(Object.values(i.action)[0] as any).proof
								),
								body: {
									balanceCommitment: {
										inner: new TextEncoder().encode(
											(Object.values(i.action)[0] as any).body
												.balance_commitment
										),
									},
									nullifier: new TextEncoder().encode(
										(Object.values(i.action)[0] as any).body.nullifier
									),
									rk: new TextEncoder().encode(
										(Object.values(i.action)[0] as any).body.rk
									),
									wrappedMemoKey: new TextEncoder().encode(
										(Object.values(i.action)[0] as any).body.wrapped_memo_key
									),
									ovkWrappedKey: new TextEncoder().encode(
										(Object.values(i.action)[0] as any).body.ovk_wrapped_key
									),
									notePayload: {
										ephemeralKey: new TextEncoder().encode(
											(Object.values(i.action)[0] as any).body.note_payload
												?.ephemeral_key
										),
										encryptedNote: new TextEncoder().encode(
											(Object.values(i.action)[0] as any).body.note_payload
												?.encrypted_note
										),
										noteCommitment: {
											inner: new TextEncoder().encode(
												(Object.values(i.action)[0] as any).body.note_payload
													?.note_commitment
											),
										},
									},
								},
							},
						},
					}
				}),
				expiryHeight: BigInt(decodeTransaction.body.expiry_height),
				chainId: decodeTransaction.body.chain_id,
				fee: {
					assetId: {
						inner: new TextEncoder().encode(
							decodeTransaction.body.fee.asset_id
						),
					},
					amount: {
						lo: BigInt(decodeTransaction.body.fee.amount.lo),
						hi: BigInt(decodeTransaction.body.fee.amount.hi),
					},
				},
				fmdClues: decodeTransaction.body.fmd_clues.map(i => ({
					inner: new TextEncoder().encode(i),
				})),
				//wtf
				// encryptedMemo: decodeTransaction.body.encrypted_memo,
			},
		}
	}
}
