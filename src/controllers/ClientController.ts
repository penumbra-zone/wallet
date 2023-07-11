import { createGrpcWebTransport } from '@bufbuild/connect-web'
import { createPromiseClient } from '@bufbuild/connect'
import { ExtensionStorage } from '../storage'
import ObservableStore from 'obs-store'
import { WalletController } from './WalletController'
import {
	CHAIN_PARAMETERS_TABLE_NAME,
	NCT_COMMITMENTS_TABLE_NAME,
	NCT_FORGOTTEN_TABLE_NAME,
	NCT_HASHES_TABLE_NAME,
	NCT_POSITION_TABLE_NAME,
	extension,
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
import EventEmitter from 'events'

export type Transaction = {
	blockHeight: bigint
	txBytes: string
	txHash: string
}

export class ClientController extends EventEmitter {
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
		deleteViewServer,
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
		deleteViewServer: WasmViewConnector['resetWallet']
	}) {
		super()
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				lastSavedBlock: {
					mainnet: undefined,
					testnet: undefined,
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
			deleteViewServer,
		}
		extensionStorage.subscribe(this.store)
		this.indexedDb = indexedDb
		this.wasmViewConnector = wasmViewConnector

		extension.alarms.onAlarm.addListener(({ name }) => {
			if (name === 'connection') {
				this.checkInternetConnection()
			}
		})
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

		await this.wasmViewConnector.setViewServer(fvk)

		const lastSavedBlockHeight =
			this.store.getState().lastSavedBlock[this.configApi.getNetwork()]

		let isRigthSync

		try {
			isRigthSync =
				lastSavedBlockHeight === undefined
					? false
					: await this.wasmViewConnector.checkLastNctRoot(lastSavedBlockHeight)
		} catch (error) {
			this.checkInternetConnection()
			return
		}

		console.log({isRigthSync});
		

		const chainId = this.getChainId()

		const compactBlockRangeRequest = new CompactBlockRangeRequest()

		if (isRigthSync) {
			compactBlockRangeRequest.chainId = chainId
			compactBlockRangeRequest.startHeight = BigInt(
				lastSavedBlockHeight === undefined ? 0 : lastSavedBlockHeight + 1
			)
			compactBlockRangeRequest.keepAlive = true
		} else {
			await this.resetWallet()
			compactBlockRangeRequest.chainId = chainId
			compactBlockRangeRequest.startHeight = BigInt(0)
			compactBlockRangeRequest.keepAlive = true
			await this.indexedDb.clearAllTables(CHAIN_PARAMETERS_TABLE_NAME)
			await this.wasmViewConnector.setViewServer(fvk)
		}

		const baseUrl = this.getGRPC()
		const lastBlock = await this.getLastExistBlock()

		const transport = createGrpcWebTransport({
			baseUrl,
		})

		const client = createPromiseClient(ObliviousQueryService, transport)

		let height

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
					Number(response.compactBlock.height) >= lastBlock
				)

				if (Number(response.compactBlock.height) < lastBlock) {
					if (Number(response.compactBlock.height) % 1000 === 0) {
						await this.saveUpdates().then(() => {
							this.saveLastBlock(Number(response.compactBlock.height))
						})
					}
					height = Number(response.compactBlock.height)
				} else {
					await this.saveUpdates().then(() => {
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

						height = undefined
					})
				}
			}
		} catch (error) {
			console.error(error)

			if (
				error.message === 'Sync error' ||
				error.message === '[unknown] network error' ||
				error.message === '[unknown] Failed to fetch'
			) {
				this.abortGrpcRequest('sync error')
			}

			if (this.abortController.signal.aborted) {
				if (
					this.abortController.signal.reason === 'reset wallet' ||
					this.abortController.signal.reason === 'change grpc'
				) {
					this.abortController.signal.reason === 'reset wallet'
						? this.emit('abort with clear')
						: this.emit('abort with balance and db clear')
				} else if (this.abortController.signal.reason === 'sync error') {
					this.checkInternetConnection()
				} else {
					if (height === undefined) {
						this.emit('abort without clear')
					} else {
						await this.saveUpdates().then(async () => {
							await this.saveLastBlock(height)
							this.emit('abort without clear')
						})
					}
				}
			}
		}
	}

	async saveUpdates() {
		const updates = await this.wasmViewConnector.loadUpdates()

		await this.indexedDb.putBulkValue(
			NCT_COMMITMENTS_TABLE_NAME,
			updates.storeCommitments
		)
		await this.indexedDb.putBulkValue(
			NCT_HASHES_TABLE_NAME,
			updates.storeHashes
		)
		await this.indexedDb.putValueWithId(
			NCT_POSITION_TABLE_NAME,
			updates.setPosition,
			'position'
		)
		updates.setForgotten &&
			(await this.indexedDb.putValueWithId(
				NCT_FORGOTTEN_TABLE_NAME,
				updates.setForgotten,
				'forgotten'
			))
	}

	saveLastBlock(height: number) {
		const oldState = this.store.getState().lastSavedBlock

		const lastSavedBlock = {
			...oldState,
			[this.configApi.getNetwork()]: Number(height),
		}

		this.store.updateState({
			lastSavedBlock,
		})
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
		try {
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
		} catch (error) {
			console.error(error.message)
		}
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
				mainnet: undefined,
				testnet: undefined,
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
		if (this.abortController) this.abortController.abort(reason)
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

	async checkInternetConnection() {
		extension.alarms.create('connection', {
			delayInMinutes: 5 / 60,
		})
		try {
			const response = await fetch(this.getGRPC(), { method: 'HEAD' })

			if (response.ok) {
				extension.alarms.clear('connection')
				this.saveChainParameters()
				this.getCompactBlockRange()
			} else {
				console.error('Internet connection is not available.')
			}
		} catch (error) {
			return Promise.reject('No internet connection')
		}
	}
}
