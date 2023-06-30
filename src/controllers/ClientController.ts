import { createGrpcWebTransport } from '@bufbuild/connect-web'
import { createPromiseClient } from '@bufbuild/connect'
import { ExtensionStorage } from '../storage'
import ObservableStore from 'obs-store'
import { WalletController } from './WalletController'
import {
	ASSET_TABLE_NAME,
	CHAIN_PARAMETERS_TABLE_NAME,
	extension,
	FMD_PARAMETERS_TABLE_NAME,
	NCT_COMMITMENTS_TABLE_NAME,
	NCT_FORGOTTEN_TABLE_NAME,
	NCT_HASHES_TABLE_NAME,
	NCT_POSITION_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
	SWAP_TABLE_NAME,
	TRANSACTION_BY_NULLIFIER_TABLE_NAME,
	TRANSACTION_TABLE_NAME,
} from '../lib'
import { RemoteConfigController } from './RemoteConfigController'
import { NetworkController } from './NetworkController'
import { IndexedDb } from '../utils'
import { WasmViewConnector } from '../utils/WasmViewConnector'
import {
	ChainParametersRequest,
	CompactBlockRangeRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb'
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb'
import { ObliviousQueryService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-es/penumbra/client/v1alpha1/client_connect'
import { CurrentAccountController } from './CurrentAccountController'

export type Transaction = {
	blockHeight: bigint
	txBytes: string
	txHash: string
}

export class ClientController {
	private store
	private indexedDb: IndexedDb
	private configApi
	private wasmViewConnector: WasmViewConnector
	//abort all grpc request
	private abortController: AbortController

	constructor({
		extensionStorage,
		indexedDb,
		getAccountFullViewingKey,
		setNetworks,
		getNetwork,
		getNetworkConfig,
		wasmViewConnector,
		getAccountSpendingKey,
		getCustomGRPC,
		resetBalance,
	}: {
		extensionStorage: ExtensionStorage
		indexedDb: IndexedDb
		wasmViewConnector: WasmViewConnector
		getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword']
		getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword']
		setNetworks: RemoteConfigController['setNetworks']
		getNetwork: NetworkController['getNetwork']
		getNetworkConfig: RemoteConfigController['getNetworkConfig']
		getCustomGRPC: NetworkController['getCustomGRPC']
		resetBalance: CurrentAccountController['resetWallet']
	}) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				lastSavedBlock: {
					mainnet: 0,
					testnet: 0,
				},
				lastBlockHeight: {
					mainnet: 0,
					testnet: 0,
				},
			})
		)
		this.configApi = {
			getAccountFullViewingKey,
			setNetworks,
			getNetwork,
			getNetworkConfig,
			getAccountSpendingKey,
			getCustomGRPC,
			resetBalance,
		}
		extensionStorage.subscribe(this.store)
		this.indexedDb = indexedDb
		this.wasmViewConnector = wasmViewConnector
	}

	async saveChainParameters() {
		try {
			const savedChainParameters = await this.indexedDb.getAllValue(
				CHAIN_PARAMETERS_TABLE_NAME
			)

			if (savedChainParameters.length) return

			const baseUrl = this.getGRPC()

			const transport = createGrpcWebTransport({
				baseUrl,
			})

			const client = createPromiseClient(ObliviousQueryService, transport)

			const chainParametersRequest = new ChainParametersRequest()

			const chainParameters = await client.chainParameters(
				chainParametersRequest
			)

			await this.indexedDb.putValue(
				CHAIN_PARAMETERS_TABLE_NAME,
				JSON.parse(chainParameters.chainParameters.toJsonString())
			)

			await this.configApi.setNetworks(
				chainParameters.chainParameters.chainId,
				this.configApi.getNetwork()
			)
		} catch (error) {
			console.error(error.message)
		}
	}

	async getCompactBlockRange() {
		let fvk
		try {
			fvk = this.configApi.getAccountFullViewingKey()
		} catch {}
		if (!fvk) return

		const chainId = this.getChainId()
		const baseUrl = this.getGRPC()
		const lastBlock = await this.getLastExistBlock()

		const transport = createGrpcWebTransport({
			baseUrl,
		})

		const client = createPromiseClient(ObliviousQueryService, transport)

		const compactBlockRangeRequest = new CompactBlockRangeRequest()

		compactBlockRangeRequest.chainId = chainId
		compactBlockRangeRequest.startHeight = BigInt(
			this.store.getState().lastSavedBlock[this.configApi.getNetwork()] === 0
				? 0
				: this.store.getState().lastSavedBlock[this.configApi.getNetwork()] + 1
		)
		compactBlockRangeRequest.keepAlive = true
		this.abortController = new AbortController()
		try {
			for await (const response of client.compactBlockRange(
				compactBlockRangeRequest,
				{
					signal: this.abortController.signal,
				}
			)) {
				await this.wasmViewConnector.handleNewCompactBlock(
					response.compactBlock,
					fvk
				)

				if (Number(response.compactBlock.height) < lastBlock) {
					if (Number(response.compactBlock.height) % 1000 === 0) {
						const updates = await this.wasmViewConnector.loadUpdates()

						Promise.all([
							await this.indexedDb.putBulkValue(
								NCT_COMMITMENTS_TABLE_NAME,
								updates.storeCommitments
							),
							await this.indexedDb.putBulkValue(
								NCT_HASHES_TABLE_NAME,
								updates.storeHashes
							),
							await this.indexedDb.putValueWithId(
								NCT_POSITION_TABLE_NAME,
								updates.setPosition,
								'position'
							),
							updates.setForgotten &&
								(await this.indexedDb.putValueWithId(
									NCT_FORGOTTEN_TABLE_NAME,
									updates.setForgotten,
									'forgotten'
								)),
						]).then(() => {
							const oldState = this.store.getState().lastSavedBlock
							const lastSavedBlock = {
								...oldState,
								[this.configApi.getNetwork()]: Number(
									response.compactBlock.height
								),
							}

							this.store.updateState({
								lastSavedBlock,
							})
						})
					}
				} else {
					const updates = await this.wasmViewConnector.loadUpdates()

					Promise.all([
						await this.indexedDb.putBulkValue(
							NCT_COMMITMENTS_TABLE_NAME,
							updates.storeCommitments
						),
						await this.indexedDb.putBulkValue(
							NCT_HASHES_TABLE_NAME,
							updates.storeHashes
						),
						await this.indexedDb.putValueWithId(
							NCT_POSITION_TABLE_NAME,
							updates.setPosition,
							'position'
						),
						updates.setForgotten &&
							(await this.indexedDb.putValueWithId(
								NCT_FORGOTTEN_TABLE_NAME,
								updates.setForgotten,
								'forgotten'
							)),
					]).then(() => {
						const oldState = this.store.getState().lastSavedBlock
						const lastSavedBlock = {
							...oldState,
							[this.configApi.getNetwork()]: Number(
								response.compactBlock.height
							),
						}
						const oldLastBlockHeight = this.store.getState().lastBlockHeight
						const lastBlockHeight = {
							...oldLastBlockHeight,
							[this.configApi.getNetwork()]: Number(
								response.compactBlock.height
							),
						}

						this.store.updateState({
							lastBlockHeight,
							lastSavedBlock,
						})
					})
				}
			}
		} catch (error) {
			if (this.abortController.signal.aborted) {
				if (
					this.abortController.signal.reason === 'reset wallet' ||
					this.abortController.signal.reason === 'change grpc'
				) {
					await this.indexedDb.clearAllTables()
					await this.resetWallet()
					await this.configApi.resetBalance()
				}
			}
		}
	}

	async broadcastTx(tx_bytes_hex: string) {
		const tendermint = this.getTendermint()

		const broadcastResponse = await fetch(tendermint, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				method: 'broadcast_tx_sync',
				params: [tx_bytes_hex],
				id: 31221,
			}),
		})
		const content = await broadcastResponse.json()

		return content
	}

	async getLastExistBlock() {
		const tendermint = this.getTendermint()

		const response = await fetch(`${tendermint}/abci_info`, {
			headers: {
				'Cache-Control': 'no-cache',
			},
		})
		const data = await response.json()

		const lastBlock = Number(data.result.response.last_block_height)
		const oldLastBlockHeight = this.store.getState().lastBlockHeight

		const lastBlockHeight = {
			...oldLastBlockHeight,
			[this.configApi.getNetwork()]: lastBlock,
		}

		this.store.updateState({ lastBlockHeight })

		return lastBlock
	}

	byteArrayToLong = function (/*byte[]*/ byteArray) {
		var value = 0
		for (var i = byteArray.length - 1; i >= 0; i--) {
			value = value * 256 + byteArray[i]
		}

		return value
	}

	async resetWallet() {
		this.store.updateState({
			lastSavedBlock: {
				mainnet: 0,
				testnet: 0,
			},
			lastBlockHeight: {
				mainnet: 0,
				testnet: 0,
			},
		})
	}

	requireScanning(compactBlock: CompactBlock) {
		return (
			compactBlock.statePayloads != null &&
			compactBlock.statePayloads.length != 0
		)
	}

	toHexString(bytes: any) {
		return bytes.reduce(
			(str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
			''
		)
	}

	abortGrpcRequest(reason?: string) {
		this.abortController.abort(reason)
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

	getChainId() {
		const { chainId } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]
		return chainId
	}
}
