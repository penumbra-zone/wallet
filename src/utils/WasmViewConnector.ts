import {
	base64_to_bech32,
	decode_nct_root,
	decode_transaction,
	transaction_info,
	ViewServer,
} from 'penumbra-wasm'
import { createGrpcWebTransport } from '@bufbuild/connect-web'
import { createPromiseClient } from '@bufbuild/connect'
import {
	SpendableNoteRecord,
	SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'
import {
	CompactBlock,
	FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb'
import { base64ToBytes } from './base64'
import {
	NetworkController,
	RemoteConfigController,
	Transaction,
	WalletController,
} from '../controllers'
import {
	AssetId,
	DenomMetadata,
	DenomUnit,
	Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { IndexedDb } from './IndexedDb'
import {
	ASSET_TABLE_NAME,
	FMD_PARAMETERS_TABLE_NAME,
	NCT_COMMITMENTS_TABLE_NAME,
	NCT_FORGOTTEN_TABLE_NAME,
	NCT_HASHES_TABLE_NAME,
	NCT_POSITION_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
	SWAP_TABLE_NAME,
	TRANSACTION_TABLE_NAME,
} from '../lib'
import {
	DenomMetadataByIdRequest,
	KeyValueRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb'
import { SpecificQueryService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-es/penumbra/client/v1alpha1/client_connect'
import { PositionState } from '@buf/penumbra-zone_penumbra.grpc_web/penumbra/core/dex/v1alpha1/dex_pb'
import PositionStateEnum = PositionState.PositionStateEnum
import { PENUMBRAWALLET_DEBUG } from '../ui/appConfig'
import EventEmitter from 'events'

export type ScanResult = {
	height: number
	nct_updates: NctUpdates
	new_notes: SpendableNoteRecord[]
	new_swaps: SwapRecord[]
}

export type NctUpdates = {
	delete_ranges: []
	set_forgotten
	set_position
	store_commitments: []
	store_hashes: []
}

export class WasmViewConnector extends EventEmitter {
	private indexedDb: IndexedDb
	private viewServer: ViewServer
	private configApi

	constructor({
		indexedDb,
		getNetworkConfig,
		getNetwork,
		getCustomGRPC,
		getAccountFullViewingKey,
	}: {
		indexedDb: IndexedDb
		getNetworkConfig: RemoteConfigController['getNetworkConfig']
		getNetwork: NetworkController['getNetwork']
		getCustomGRPC: NetworkController['getCustomGRPC']
		getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword']
	}) {
		super()
		this.indexedDb = indexedDb
		this.configApi = {
			getNetworkConfig,
			getNetwork,
			getCustomGRPC,
			getAccountFullViewingKey,
		}
	}

	getViewServer() {
		return this.viewServer
	}

	async updateNotes(nullifier: Nullifier, height: bigint) {
		const result: SpendableNoteRecord[] = await this.indexedDb.getAllValue(
			SPENDABLE_NOTES_TABLE_NAME
		)

		for (const note of result) {
			if (JSON.stringify(note.nullifier) == JSON.stringify(nullifier)) {
				if (!note.heightSpent) {
					note.heightSpent = String(height) as any
					await this.indexedDb.putValueWithId(
						SPENDABLE_NOTES_TABLE_NAME,
						note,
						note.noteCommitment.inner
					)

					this.emit('update balance')
				}
			}
		}
	}

	async setViewServer(fvk: string) {
		const storedTree = await this.indexedDb.loadStoredTree()

		this.viewServer = new ViewServer(fvk, 719n, storedTree)
	}

	async checkLastNctRoot(block: number) {
		try {
			const transport = createGrpcWebTransport({
				baseUrl: this.getGRPC(),
			})

			const client = createPromiseClient(SpecificQueryService, transport)

			const keyValueRequest = new KeyValueRequest()
			keyValueRequest.key = `sct/anchor/${String(block)}`
			let keyValue = await client.keyValue(keyValueRequest)

			let decodeNctRoot = decode_nct_root(
				this.toHexString(keyValue.value.value)
			)

			const nctRoot = this.viewServer.get_nct_root()

			return decodeNctRoot.inner === nctRoot.inner
		} catch (error) {
			throw new Error('Sync error')
		}
	}

	async handleNewCompactBlock(block: CompactBlock, isActiveSync: boolean) {
		const result: ScanResult = await this.viewServer.scan_block_without_updates(
			block.toJson()
		)

		await this.handleScanResult(result)

		if (block.nullifiers.length) {
			for (const nullifier of block.nullifiers) {
				await this.updateNotes(nullifier, block.height)
			}
		}

		if (block.fmdParameters) await this.saveFmdParameters(block.fmdParameters)

		if (
			(!(Number(block.height) % 50000) || isActiveSync) &&
			PENUMBRAWALLET_DEBUG
		) {
			try {
				const transport = createGrpcWebTransport({
					baseUrl: this.getGRPC(),
				})

				const client = createPromiseClient(SpecificQueryService, transport)

				const keyValueRequest = new KeyValueRequest()
				keyValueRequest.key = `sct/anchor/${String(block.height)}`
				let keyValue = await client.keyValue(keyValueRequest)

				let decodeNctRoot = decode_nct_root(
					this.toHexString(keyValue.value.value)
				)

				const nctRoot = this.viewServer.get_nct_root()

				if (decodeNctRoot.inner !== nctRoot.inner) {
					console.log('unsync', block.height)
				}
			} catch (error) {
				throw new Error('Sync error')
			}
		}
	}

	public async loadUpdates() {
		if (!this.viewServer) {
			console.error('View client is undefined')
			return
		}

		const lastPosition = await this.indexedDb.getValue(
			NCT_POSITION_TABLE_NAME,
			'position'
		)

		const lastForgotten = await this.indexedDb.getValue(
			NCT_FORGOTTEN_TABLE_NAME,
			'forgotten'
		)

		const { nct_updates } = await this.viewServer.get_updates(
			lastPosition,
			lastForgotten
		)

		return {
			setForgotten: nct_updates.set_forgotten,
			setPosition: nct_updates.set_position,
			storeCommitments: nct_updates.store_commitments,
			storeHashes: nct_updates.store_hashes,
		}
	}

	async handleScanResult(scanResult: ScanResult) {
		if (scanResult.new_notes.length) {
			const uniqueTxs = new Set()

			for (const note of scanResult.new_notes) {
				const txHash = await this.storeNote(note)

				if (txHash) {
					uniqueTxs.add(txHash)
				}
			}

			for (const tx of uniqueTxs) {
				const response = await this.handleNoteSource(base64ToBytes(tx))

				if (response) {
					await this.storeLpnft(response.view)
					await this.indexedDb.putValue(TRANSACTION_TABLE_NAME, response)
				}
			}
		}

		for (const swap of scanResult.new_swaps) {
			await this.storeSwap(swap)
		}
	}

	async updateForgotten(setForgotten) {
		await this.indexedDb.putValueWithId(
			NCT_FORGOTTEN_TABLE_NAME,
			setForgotten,
			'forgotten'
		)
	}

	async updatePosition(setPosition) {
		await this.indexedDb.putValueWithId(
			NCT_POSITION_TABLE_NAME,
			setPosition,
			'position'
		)
	}

	async storeCommitment(commitment) {
		await this.indexedDb.putValue(NCT_COMMITMENTS_TABLE_NAME, commitment)
	}

	async storeHash(hash) {
		await this.indexedDb.putValue(NCT_HASHES_TABLE_NAME, hash)
	}

	async storeNote(note: SpendableNoteRecord) {
		const storedNote = await this.indexedDb.getValue(
			SPENDABLE_NOTES_TABLE_NAME,
			note.noteCommitment.inner
		)

		if (!storedNote) {
			await this.indexedDb.putValueWithId(
				SPENDABLE_NOTES_TABLE_NAME,
				note,
				note.noteCommitment.inner
			)

			this.emit('update balance')
		} else {
			console.debug('note already stored', note.noteCommitment.inner)
		}
		await this.storeAsset(note.note.value.assetId)
		return note.source.inner
	}

	async storeAsset(assetId) {
		const currentAsset = await this.indexedDb.getValue(
			ASSET_TABLE_NAME,
			assetId.inner
		)

		if (currentAsset) return

		const chainId = this.getChainId()
		const baseUrl = this.getGRPC()

		const transport = createGrpcWebTransport({
			baseUrl,
		})

		try {
			const client = createPromiseClient(SpecificQueryService, transport)

			const denomMetadataByIdRequest = new DenomMetadataByIdRequest()
			denomMetadataByIdRequest.chainId = chainId
			const asset = new AssetId()
			asset.inner = base64ToBytes(assetId.inner)
			denomMetadataByIdRequest.assetId = asset

			const demomResponse = await client.denomMetadataById(
				denomMetadataByIdRequest
			)

			if (!demomResponse.denomMetadata) {
				const denom = base64_to_bech32('passet', assetId.inner)

				await this.indexedDb.putValue(ASSET_TABLE_NAME, {
					penumbraAssetId: asset.toJson(),
					base: denom,
					display: denom,
					denomUnits: [
						{
							denom,
						},
					],
				})
			} else {
				await this.indexedDb.putValue(
					ASSET_TABLE_NAME,
					demomResponse.denomMetadata.toJson() as object
				)
			}
		} catch (error) {
			throw new Error('Sync error')
		}
	}

	getChainId() {
		const { chainId } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]
		return chainId
	}

	getGRPC() {
		const customGrpc =
			this.configApi.getCustomGRPC()[this.configApi.getNetwork()]
		const { grpc: defaultGrpc } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]

		return customGrpc || defaultGrpc
	}

	getTendermint() {
		const { tendermint } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]
		return tendermint
	}

	async getTransaction(txHash: string) {
		const tendermint = this.getTendermint()
		try {
			let response = await fetch(`${tendermint}/tx?hash=0x${txHash}`, {
				headers: {
					'Cache-Control': 'no-cache',
				},
			})
			let data = await response.json()

			if (!data.result) {
				response = await fetch(`${tendermint}/tx?hash=0x${txHash}`, {
					headers: {
						'Cache-Control': 'no-cache',
					},
				})
				data = await response.json()
			}

			const transactionResponse: Transaction = {
				txHash,
				txBytes: data.result.tx,
				blockHeight: data.result.height,
			}

			const decodeTransaction = decode_transaction(transactionResponse.txBytes)

			const transactionInfo = await transaction_info(
				this.configApi.getAccountFullViewingKey(),
				decodeTransaction
			)

			return {
				height: Number(transactionResponse.blockHeight),
				id: { hash: transactionResponse.txHash },
				transaction: decodeTransaction,
				perspective: transactionInfo.txp,
				view: transactionInfo.txv,
			}
		} catch (e) {
			throw new Error('Sync error')
		}
	}

	async handleNoteSource(sourceHex: Uint8Array) {
		const txHash = this.toHexString(sourceHex)

		// check sourceHex is transaction
		if (
			!String(txHash)
				.slice(0, 46)
				.split('')
				.filter(i => Boolean(Number(i))).length
		)
			return

		const currentTx = await this.indexedDb.getValue(
			TRANSACTION_TABLE_NAME,
			txHash
		)

		if (currentTx) return

		const transaction = await this.getTransaction(txHash)

		return transaction
	}

	async storeLpnft(txv) {
		for (const actionView of txv.bodyView.actionViews) {
			if (actionView.positionOpen !== undefined) {
				let opened = this.viewServer.get_lpnft_asset(
					actionView.positionOpen.position,
					{ state: PositionStateEnum.POSITION_STATE_ENUM_OPENED }
				)

				await this.indexedDb.putValue(
					ASSET_TABLE_NAME,
					opened)


				let closed = this.viewServer.get_lpnft_asset(
					actionView.positionOpen.position,
					{ state: PositionStateEnum.POSITION_STATE_ENUM_CLOSED }
				)

				await this.indexedDb.putValue(
					ASSET_TABLE_NAME,
					closed
				)
				let withdrawn = this.viewServer.get_lpnft_asset(
					actionView.positionOpen.position,
					{ state: PositionStateEnum.POSITION_STATE_ENUM_WITHDRAWN }
				)
				await this.indexedDb.putValue(
					ASSET_TABLE_NAME,
					withdrawn
				)
				let claimed = this.viewServer.get_lpnft_asset(
					actionView.positionOpen.position,
					{ state: PositionStateEnum.POSITION_STATE_ENUM_CLAIMED }
				)
				await this.indexedDb.putValue(
					ASSET_TABLE_NAME,
					 claimed
				)
			}
		}
	}

	async storeSwap(swap) {
		let storedSwap = await this.indexedDb.getValue(
			SWAP_TABLE_NAME,
			swap.swapCommitment.inner
		)
		if (!storedSwap)
			await this.indexedDb.putValueWithId(
				SWAP_TABLE_NAME,
				swap,
				swap.swapCommitment.inner
			)
		else console.debug('swap already stored', swap.swapCommitment.inner)
	}

	async saveFmdParameters(fmdParameters: FmdParameters) {
		await this.indexedDb.putValueWithId(
			FMD_PARAMETERS_TABLE_NAME,
			JSON.parse(fmdParameters.toJsonString()),
			'fmd'
		)
	}

	convertCompactBlock(block: CompactBlock): CompactBlock {
		// let transparentInner = this.transparentInner(block)
		let convertedBlock = this.convertByteArraysToHex(block)

		return this.fixCaseField(convertedBlock)
	}

	fixCaseField(o) {
		for (let prop in o) {
			if (Array.isArray(o[prop])) {
				for (const element of o[prop]) {
					this.fixCaseField(element)
				}
			} else {
				if (typeof o[prop] === 'object') {
					this.fixCaseField(o[prop])
				} else {
					if (prop === 'case') {
						o[prop] = this.capitalizeFirstLetter(o[prop])
					}
				}
			}
		}
		return o
	}

	convertByteArraysToHex(o) {
		for (var prop in o) {
			if (Array.isArray(o[prop])) {
				for (const element of o[prop]) {
					this.convertByteArraysToHex(element)
				}
			} else {
				if (typeof o[prop] === 'object' && !(o[prop] instanceof Uint8Array)) {
					this.convertByteArraysToHex(o[prop])
				} else {
					if (o[prop] instanceof Uint8Array) {
						o[prop] = this.toHexString(o[prop])
					}
				}
			}
		}
		return o
	}

	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	toHexString(bytes: any) {
		return bytes.reduce(
			(str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
			''
		)
	}

	resetWallet() {
		if (this.viewServer) {
			this.viewServer.free()
		}
		this.viewServer = undefined
	}
}
