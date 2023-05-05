import { base64_to_bech32, ViewServer } from 'penumbra-wasm'
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
	CurrentAccountController,
	NetworkController,
	RemoteConfigController,
	Transaction,
} from '../controllers'
import {
	AssetId,
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
import { SpecificQueryService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb'
import { AssetInfoRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb'

export type StoredTree = {
	last_position: number
	last_forgotten: number
	hashes: StoredHash[]
	commitments: StoredCommitment[]
}

export type StoredHash = {
	position: number
	height: number
	hash: Uint8Array
}

export type StoredCommitment = {
	position: number
	commitment: Uint8Array
}

export type ScanResult = {
	height
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

export class WasmViewConnector {
	private indexedDb
	private viewClient
	private configApi

	constructor({
		indexedDb,
		updateAssetBalance,
		getNetworkConfig,
		getNetwork,
		getCustomGRPC,
	}: {
		indexedDb: IndexedDb
		updateAssetBalance: CurrentAccountController['updateAssetBalance']
		getNetworkConfig: RemoteConfigController['getNetworkConfig']
		getNetwork: NetworkController['getNetwork']
		getCustomGRPC: NetworkController['getCustomGRPC']
	}) {
		this.indexedDb = indexedDb
		this.configApi = {
			updateAssetBalance,
			getNetworkConfig,
			getNetwork,
			getCustomGRPC,
		}
	}

	async updateNotes(nullifier: Nullifier, height: bigint) {
		const result = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME)

		for (const note of result) {
			if (JSON.stringify(note.nullifier) == JSON.stringify(nullifier)) {
				note.heightSpent = String(height)
				await this.indexedDb.putValueWithId(
					SPENDABLE_NOTES_TABLE_NAME,
					note,
					note.noteCommitment.inner
				)
				await this.configApi.updateAssetBalance(
					note.note.value.assetId.inner,
					Number(note.note.value.amount.lo) * -1
				)
			}
		}
	}

	async handleNewCompactBlock(block: CompactBlock, fvk, transport) {
		if (this.viewClient == undefined) {
			let storedTree = await this.loadStoredTree()
			// todo зробоити ViewServer глобальним, щоб
			this.viewClient = new ViewServer(fvk, 719n, storedTree)
		}
		let result: ScanResult = await this.viewClient.scan_block_without_updates(
			block.toJson()
		)

		await this.handleScanResult(result)

		if (block.nullifiers.length > 0) {
			for (const nullifier of block.nullifiers) {
				await this.updateNotes(nullifier, block.height)
			}
		}
		if (block.fmdParameters !== undefined)
			await this.saveFmdParameters(
				JSON.parse(block.fmdParameters.toJsonString())
			)

		// let ntcRoot = this.viewClient.get_nct_root();
		//
		// const client = createPromiseClient(SpecificQueryService, transport);
		//
		// const keyValueRequest : KeyValueRequest = new KeyValueRequest();
		// keyValueRequest.key = "shielded_pool/anchor/" + block.height
		// let keyValue = await client.keyValue(keyValueRequest);
		//
		// let decodeNctRoot = decode_nct_root(this.toHexString(keyValue.value));
		//
		// // if (decodeNctRoot.inner != decodeNctRoot.inner ) {

		// // }
		//
		// const delay = ms => new Promise(res => setTimeout(res, ms));
	}

	public async loadStoredTree(): Promise<StoredTree> {
		const nctPosition = await this.indexedDb.getValue(
			NCT_POSITION_TABLE_NAME,
			'position'
		)

		const nctForgotten = await this.indexedDb.getValue(
			NCT_FORGOTTEN_TABLE_NAME,
			'forgotten'
		)

		const nctHashes: StoredHash[] = await this.indexedDb.getAllValue(
			NCT_HASHES_TABLE_NAME
		)

		const nctCommitments: StoredCommitment[] = await this.indexedDb.getAllValue(
			NCT_COMMITMENTS_TABLE_NAME
		)

		return {
			commitments: nctCommitments,
			hashes: nctHashes,
			last_forgotten: nctForgotten,
			last_position: nctPosition,
		}
	}

	public async loadUpdates() {
		if (this.viewClient == undefined) {
			console.error('View client is undefined')
		} else {
			let storedTree = await this.loadStoredTree()
			let updates = await this.viewClient.get_updates(
				storedTree.last_position,
				storedTree.last_forgotten
			)
			await this.handleScanResult(updates)
		}
	}

	async handleScanResult(scanResult: ScanResult) {
		if (scanResult.nct_updates !== undefined) {
			if (scanResult.nct_updates.set_forgotten !== undefined) {
				await this.updateForgotten(scanResult.nct_updates.set_forgotten)
			}
			if (scanResult.nct_updates.set_position !== undefined) {
				await this.updatePosition(scanResult.nct_updates.set_position)
			}
			for (const commitment of scanResult.nct_updates.store_commitments) {
				await this.storeCommitment(commitment)
			}
			for (const hash of scanResult.nct_updates.store_hashes) {
				await this.storeHash(hash)
			}
			if (scanResult.nct_updates.delete_ranges.length > 0) {
			}
		}

		if (scanResult.new_notes.length > 0 || scanResult.new_swaps.length > 0)
			for (const note of scanResult.new_notes) {
				await this.storeNote(note)
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

	async storeNote(note) {
		let storedNote = await this.indexedDb.getValue(
			SPENDABLE_NOTES_TABLE_NAME,
			note.noteCommitment.inner
		)

		if (storedNote == undefined) {
			await this.indexedDb.putValueWithId(
				SPENDABLE_NOTES_TABLE_NAME,
				note,
				note.noteCommitment.inner
			)
			await this.configApi.updateAssetBalance(
				note.note.value.assetId.inner,
				Number(note.note.value.amount.lo)
			)

			await this.storeAsset(note.note.value.assetId)

			try {
				await this.saveTransaction(base64ToBytes(note.source.inner))
			} catch (e) {
				console.error('tx save failed ', e)
			}
		} else console.debug('note already stored', note.noteCommitment.inner)
	}

	async storeAsset(assetId) {
		const chainId = this.getChainId()
		const baseUrl = this.getGRPC()

		const transport = createGrpcWebTransport({
			baseUrl,
		})

		const client = createPromiseClient(SpecificQueryService, transport)

		const assetInfoRequest = new AssetInfoRequest()
		assetInfoRequest.chainId = chainId
		const asset = new AssetId()
		asset.inner = base64ToBytes(assetId.inner)
		assetInfoRequest.assetId = asset

		const assetResponse = await client.assetInfo(assetInfoRequest)

		if (!assetResponse.asset) {
			await this.indexedDb.putValue(ASSET_TABLE_NAME, {
				id: assetId,
				denom: { denom: base64_to_bech32('passet', assetId.inner) },
			})
		} else {
			let assetJson = assetResponse.asset.toJsonString()
			await this.indexedDb.putValue(ASSET_TABLE_NAME, {
				...JSON.parse(assetJson),
			})
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

	async saveTransaction(sourceHex: Uint8Array) {
		const tendermint = this.getTendermint()

		const txHash = this.toHexString(sourceHex)

		// check sourceHex is transaction
		if (
			!String(txHash)
				.slice(0, 46)
				.split('')
				.filter(i => Boolean(Number(i))).length
		)
			return

		const response = await fetch(`${tendermint}/tx?hash=0x${txHash}`, {
			headers: {
				'Cache-Control': 'no-cache',
			},
		})
		const data = await response.json()

		if (data.result !== undefined) {
			const tx: Transaction = {
				txHash,
				txBytes: data.result.tx,
				blockHeight: data.result.height,
			}

			await this.indexedDb.putValue(TRANSACTION_TABLE_NAME, tx)
		}
	}

	async storeSwap(swap) {
		let storedSwap = await this.indexedDb.getValue(
			SWAP_TABLE_NAME,
			swap.swapCommitment.inner
		)
		if (storedSwap == undefined)
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
			fmdParameters,
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
		if (this.viewClient) {
			this.viewClient.free()
		}
		this.viewClient = undefined
	}
}
