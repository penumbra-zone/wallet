import { ChainParametersRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb'
import {
	AssetsRequest,
	BalanceByAddressRequest,
	NotesRequest,
	TransactionInfoRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'
import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import EventEmitter from 'events'
import { nanoid } from 'nanoid'
import {
	ClientController,
	Contact,
	ContactBookController,
	CurrentAccountController,
	IdleController,
	MessageController,
	NetworkController,
	NetworkName,
	PermissionController,
	PERMISSIONS,
	PermissionType,
	PreferencesController,
	RemoteConfigController,
	VaultController,
	WalletController,
} from './controllers'
import { TransactionController } from './controllers/TransactionController'
import {
	ASSET_TABLE_NAME,
	extension,
	fromPort,
	handleMethodCallRequests,
	SPENDABLE_NOTES_TABLE_NAME,
	TabsManager,
	TRANSACTION_TABLE_NAME,
	WindowManager,
} from './lib'
import { MessageInputOfType, MessageStatus } from './messages/types'
import { PreferencesAccount } from './preferences'
import { ViewProtocolService } from './services'
import { ExtensionStorage, StorageLocalState } from './storage'
import { TransactionPlan } from './types/transaction'
import { PENUMBRAWALLET_DEBUG } from './ui/appConfig'
import { IndexedDb, TableName } from './utils'
import { WasmViewConnector } from './utils/WasmViewConnector'
import { CreateWalletInput, ISeedWalletInput } from './wallets'
import { decode_transaction, ViewServer } from 'penumbra-wasm'

const bgPromise = setupBackgroundService()

extension.runtime.onConnect.addListener(async remotePort => {
	const bgService = await bgPromise
	if (remotePort.name === 'contentscript') {
		bgService.setupPageConnection(remotePort)
	} else {
		bgService.setupUiConnection(remotePort)
	}
})

extension.runtime.onConnectExternal.addListener(async remotePort => {
	const bgService = await bgPromise
	bgService.setupPageConnection(remotePort)
})
type MessageSender = chrome.runtime.MessageSender;
const onMessage = async (message: any, sender: MessageSender) => {
  console.log("Background onMessage", message, sender);
  if (message.type === "BUF_TRANSPORT_REQUEST") {
    const { sequence, request, typeName } = message;
    const { sentence } = request;
    // TODO: select request by typeName, type response appropriately
    // const response = await client.say({sentence})
    // const modifiedResponse = new SayResponse({sentence:[...response.sentence].reverse().join("")})
		const bgService = await bgPromise

		const response = await bgService.viewProtocolService.getStatus()
    const responseMessage = {
      success: true,
      type: "BUF_TRANSPORT_RESPONSE",
      sequence,
      response: response.toJson(),
      typeName: response.getType().typeName,
    };

		console.log(responseMessage);
		
    console.log("Background response", responseMessage);
    chrome.tabs.sendMessage(sender?.tab?.id as number, responseMessage);
  } else {
    console.warn("Background unknown message type", message);
  }
};

extension.runtime.onMessage.addListener(onMessage)

async function setupBackgroundService() {
	const extensionStorage = new ExtensionStorage()
	await extensionStorage.create()
	const backgroundService = new BackgroundService({
		extensionStorage,
	})

	// global access to service on debug
	if (PENUMBRAWALLET_DEBUG) {
		global.background = backgroundService
	}

	const updateBadge = () => {
		const messages = backgroundService.messageController.getUnapproved()

		const msg = messages.length
		const text = msg ? String(msg) : ''

		const action = extension.action || extension.browserAction
		action.setBadgeText({ text })
		action.setBadgeBackgroundColor({ color: '#037DD6' })
	}

	backgroundService.messageController.on('Update badge', updateBadge)
	updateBadge()

	backgroundService.clientController.getCompactBlockRange()

	// Notification window management
	const windowManager = new WindowManager({ extensionStorage })
	backgroundService.on(
		'Show notification',
		windowManager.showWindow.bind(windowManager)
	)
	backgroundService.on('Close notification', () => {
		windowManager.closeWindow()
	})
	backgroundService.on('Resize notification', (width, height) => {
		windowManager.resizeWindow(width, height)
	})

	const tabsManager = new TabsManager({ extensionStorage })
	backgroundService.on('Show tab', async (url, name) => {
		backgroundService.emit('closePopupWindow')
		return tabsManager.getOrCreate(url, name)
	})

	backgroundService.walletController.on('wallet create', async () => {
		await backgroundService.clientController.saveChainParameters()
		await backgroundService.clientController.getCompactBlockRange()
	})

	backgroundService.walletController.on('wallet unlock', async () => {
		await backgroundService.clientController.saveChainParameters()
		await backgroundService.clientController.getCompactBlockRange()
	})

	backgroundService.walletController.on('reset wallet', async () => {
		await backgroundService.clientController.abortGrpcRequest()
		await backgroundService.remoteConfigController.resetWallet()
		await backgroundService.clientController.resetWallet()
		await backgroundService.networkController.resetWallet()
		await backgroundService.wasmViewConnector.resetWallet()
		await backgroundService.currentAccountController.resetWallet()
		await backgroundService.vaultController.lock()
	})

	backgroundService.networkController.on('change grpc', async () => {
		await backgroundService.clientController.abortGrpcRequest()
		await backgroundService.clientController.resetWallet()
		await backgroundService.clientController.saveChainParameters()
		await backgroundService.clientController.getCompactBlockRange()
	})

	return backgroundService
}

class BackgroundService extends EventEmitter {
	extensionStorage: ExtensionStorage
	idleController: IdleController
	vaultController: VaultController
	walletController: WalletController
	networkController: NetworkController
	remoteConfigController: RemoteConfigController
	preferencesController: PreferencesController
	clientController: ClientController
	indexedDb: IndexedDb
	viewProtocolService: ViewProtocolService
	contactBookController: ContactBookController
	permissionsController: PermissionController
	messageController: MessageController
	wasmViewConnector: WasmViewConnector
	transactionController: TransactionController
	currentAccountController: CurrentAccountController

	constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
		super()

		this.indexedDb = new IndexedDb()
		this.extensionStorage = extensionStorage

		this.contactBookController = new ContactBookController({
			extensionStorage: this.extensionStorage,
		})

		this.remoteConfigController = new RemoteConfigController({
			extensionStorage: this.extensionStorage,
		})

		this.permissionsController = new PermissionController({
			extensionStorage: this.extensionStorage,
			remoteConfig: this.remoteConfigController,
			getSelectedAccount: () => this.preferencesController.getSelectedAccount(),
		})

		this.networkController = new NetworkController({
			extensionStorage: this.extensionStorage,
			getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
			getNetworks: () => this.remoteConfigController.getNetworks(),
		})

		this.preferencesController = new PreferencesController({
			extensionStorage: this.extensionStorage,
		})

		this.walletController = new WalletController({
			extensionStorage: this.extensionStorage,
		})

		this.vaultController = new VaultController({
			extensionStorage: this.extensionStorage,
			wallet: this.walletController,
		})

		this.idleController = new IdleController({
			extensionStorage: this.extensionStorage,
			preferencesController: this.preferencesController,
			vaultController: this.vaultController,
		})

		this.wasmViewConnector = new WasmViewConnector({
			indexedDb: this.indexedDb,
			updateAssetBalance: (assetId: string, amount: number) =>
				this.currentAccountController.updateAssetBalance(assetId, amount),
			getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
			getNetwork: () => this.networkController.getNetwork(),
			getCustomGRPC: () => this.networkController.getCustomGRPC(),
		})

		this.transactionController = new TransactionController({
			indexedDb: this.indexedDb,
			getAccountFullViewingKey: () =>
				this.walletController.getAccountFullViewingKeyWithoutPassword(),
			getAccountSpendingKey: () =>
				this.walletController.getAccountSpendingKeyWithoutPassword(),
			setNetworks: (networkName: string, type: NetworkName) =>
				this.remoteConfigController.setNetworks(networkName, type),
			getNetwork: () => this.networkController.getNetwork(),
			getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
			getCustomGRPC: () => this.networkController.getCustomGRPC(),
		})

		this.messageController = new MessageController({
			extensionStorage: this.extensionStorage,
			getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
			setPermission: (origin: string, permission: PermissionType) =>
				this.permissionsController.setPermission(origin, permission),
			getTransactionMessageData: async (data: TransactionPlan) =>
				this.transactionController.getTransactionMessageData(data),
		})

		this.currentAccountController = new CurrentAccountController({
			extensionStorage: this.extensionStorage,
		})

		this.clientController = new ClientController({
			extensionStorage: this.extensionStorage,
			indexedDb: this.indexedDb,
			getAccountFullViewingKey: () =>
				this.walletController.getAccountFullViewingKeyWithoutPassword(),
			getAccountSpendingKey: () =>
				this.walletController.getAccountSpendingKeyWithoutPassword(),
			setNetworks: (networkName: string, type: NetworkName) =>
				this.remoteConfigController.setNetworks(networkName, type),
			getNetwork: () => this.networkController.getNetwork(),
			getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
			wasmViewConnector: this.wasmViewConnector,
			getCustomGRPC: () => this.networkController.getCustomGRPC(),
		})

		this.viewProtocolService = new ViewProtocolService({
			indexedDb: this.indexedDb,
			extensionStorage: this.extensionStorage,
			getLastExistBlock: () => this.clientController.getLastExistBlock(),
		})
	}

	setupPageConnection(sourcePort: chrome.runtime.Port) {
		let port: chrome.runtime.Port | null = sourcePort

		const { sender } = port

		if (!sender || !sender.url) return

		const origin = new URL(sender.url).hostname
		const connectionId = nanoid()
		const inpageApi = this.getInpageApi(origin, connectionId)

		const actionObj = {
			[ASSET_TABLE_NAME]: 'ASSETS',
			[SPENDABLE_NOTES_TABLE_NAME]: 'NOTES',
			[TRANSACTION_TABLE_NAME]: 'TRANSACTIONS',
		}

		this.indexedDb.addObserver((action, data) => {
			if (!port) return
			return port.postMessage({
				penumbraMethod: actionObj[action],
				origin,
				data,
			})
		})

		pipe(
			fromPort(port),
			handleMethodCallRequests(inpageApi, res => {
				return port.postMessage(res)
			}),
			subscribe({
				complete: () => {
					port = null
				},
			})
		)
	}

	getState<K extends keyof StorageLocalState>(params?: K | K[]) {
		const state = this.extensionStorage.getState(params)
		return state
	}

	getApi() {
		return {
			getState: async <K extends keyof StorageLocalState>(params?: K[]) =>
				this.getState(params),
			updateIdle: async () => this.idleController.update(),
			setIdleInterval: async (interval: number) =>
				this.idleController.setIdleInterval(interval),
			getNetworks: async () => this.networkController.getNetworks(),
			showTab: async (url: string, name: string) => {
				this.emit('Show tab', url, name)
			},
			initVault: async (password: string) => {
				this.vaultController.init(password)
			},
			lock: async () => this.vaultController.lock(),
			unlock: async (password: string) => this.vaultController.unlock(password),
			addWallet: async (account: CreateWalletInput) =>
				this.walletController.addWallet(account),
			selectAccount: async (lastAccount: ISeedWalletInput) =>
				this.preferencesController.selectAccount(lastAccount),
			getSelectedAccount: async () =>
				this.preferencesController.getSelectedAccount(),
			getAccountFullViewingKey: async (password: string) =>
				this.walletController.getAccountFullViewingKey(password),
			getAccountSpendingKey: async (password: string) =>
				this.walletController.getAccountSpendingKey(password),
			getAccountSeed: async (password: string) =>
				this.walletController.getAccountSeed(password),
			getCompactBlockRange: async () =>
				this.clientController.getCompactBlockRange(),
			saveChainParameters: async () =>
				this.clientController.saveChainParameters(),
			resetWallet: async () => this.walletController.resetWallet(),
			setCustomGRPC: async (
				url: string | null | undefined,
				network: NetworkName
			) => this.networkController.setCustomGRPC(url, network),
			setCustomTendermint: async (
				url: string | null | undefined,
				network: NetworkName
			) => this.networkController.setCustomTendermint(url, network),

			getValueById: async (tableName: TableName, id: string) =>
				this.indexedDb.getValue(tableName, id),
			setContact: async (contact: Contact) =>
				this.contactBookController.setContact(contact),
			updateContact: async (contact: Contact, prevAddress: string) =>
				this.contactBookController.updateContact(contact, prevAddress),
			removeContact: async (address: string) =>
				this.contactBookController.removeContact(address),
			resizeNotificationWindow: async (width: number, height: number) =>
				this.emit('Resize notification', width, height),
			closeNotificationWindow: async () => {
				this.emit('Close notification')
			},
			reject: async (messageId: string, forever?: boolean) =>
				this.messageController.reject(messageId),
			deleteMessage: async (id: string) =>
				this.messageController.deleteMessage(id),
			approve: async (messageId: string) => {
				const message = await this.messageController.approve(messageId)
				return message.result
			},
			deleteOrigin: async (origin: string) =>
				this.permissionsController.deletePermissions(origin),
			setPermission: async (origin: string, permission: PermissionType) =>
				this.permissionsController.setPermission(origin, permission),
			deletePermission: async (origin: string, permission: PermissionType) =>
				this.permissionsController.deletePermission(origin, permission),
			getTransactionPlan: async (
				destAddress: string,
				amount: number,
				assetId?: string
			) =>
				this.transactionController.getTransactionPlan(
					destAddress,
					amount,
					assetId || 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='
				),
			parseActions: async (transactionPlan: TransactionPlan) =>
				this.transactionController.getTransactionMessageData(transactionPlan),
			sendTransaction: async (sendPlan: TransactionPlan) =>
				this.transactionController.sendTransaction(sendPlan),
			clearMessages: async () => {
				this.messageController.clearMessages(),
					this.permissionsController.clearStore()
			},
			decryptTx: async bytes => {
				return decode_transaction(bytes)
			},
		}
	}

	async validatePermission(origin: string, connectionId: string) {
		const { selectedAccount, isInitialized } = this.getState([
			'selectedAccount',
			'isInitialized',
		])

		if (!selectedAccount) {
			this.emit('Show tab', '/accounts.html', 'accounts')
			return
		}

		const hasPermission = this.permissionsController.hasPermission(
			origin,
			PERMISSIONS.APPROVED
		)

		if (hasPermission) return { selectedAccount }

		if (hasPermission === false) throw 'API denied'

		let messageId = this.permissionsController.getMessageIdAccess(origin)

		if (messageId) {
			try {
				const message = this.messageController.getMessageById(messageId)

				if (
					!message ||
					message.account.addressByIndex !== selectedAccount.addressByIndex
				) {
					messageId = null
				}
				if (message.status === MessageStatus.Rejected) {
					messageId = null
				}
			} catch (e) {
				messageId = null
			}
		}

		if (!messageId) {
			const message = await this.messageController.newMessage({
				origin,
				connectionId,
				data: { origin },
				type: 'authOrigin',
				account: selectedAccount,
			})
			messageId = message.id

			this.permissionsController.setMessageIdAccess(origin, message.id)
		}
		this.emit('Show notification')

		try {
			await this.messageController.getMessageResult(messageId)
			this.messageController.setPermission(origin, PERMISSIONS.APPROVED)
		} catch (e) {
			if (e.data === MessageStatus.Rejected) {
				this.permissionsController.setMessageIdAccess(origin, null)
			}
			throw e
		}
		return { selectedAccount }
	}

	getInpageApi(origin: string, connectionId: string) {
		const showNotification = () => this.emit('Show notification')

		const commonMessageInput = { connectionId, origin }
		return {
			publicState: async () => {
				const { selectedAccount } = await this.validatePermission(
					origin,
					connectionId
				)

				const { isInitialized, isLocked, messages } = this.getState()
				
				if(isLocked){
					 return showNotification()
				}

				const fvk =
					this.walletController.getAccountFullViewingKeyWithoutPassword()

				return {
					account: {
						...selectedAccount,
						fvk,
					},
					isInitialized,
					isLocked,
					messages: messages
						.filter(
							message =>
								message.account.addressByIndex ===
									selectedAccount.addressByIndex && message.origin === origin
						)
						.map(message => ({
							id: message.id,
							status: message.status,
							uid: message.extUuid,
						})),
					network: this._getCurrentNetwork(selectedAccount),
					version: extension.runtime.getManifest().version,
				}
			},
			resourceIsApproved: async () => {
				return this.permissionsController.hasPermission(
					origin,
					PERMISSIONS.APPROVED
				)
			},
			signTransaction: async (
				data: MessageInputOfType<'transaction'>['data']
			) => {
				const { selectedAccount } = await this.validatePermission(
					origin,
					connectionId
				)

				const message = await this.messageController.newMessage({
					...commonMessageInput,
					account: selectedAccount,
					broadcast: false,
					data,
					type: 'transaction',
				})

				showNotification()
				return this.messageController.getMessageResult(message.id)
			},

			getAssets: async (request?: AssetsRequest) => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_ASSETS
				// )

				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getAssets()
			},
			getChainParameters: async (request?: ChainParametersRequest) => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_CHAIN_PARAMETERS
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getChainParameters()
			},
			getNotes: async (request?: NotesRequest) => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_NOTES
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getNotes()
			},
			getNoteByCommitment: async (request: object) => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_NOTE_BY_COMMITMENT
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getNoteByCommitment(request)
			},

			getStatus: async () => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_CHAIN_CURRENT_STATUS
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getStatus()
			},
			getStatusStream: async () => this.viewProtocolService.getStatusStream(),
			getTransactionInfo: async (request?: TransactionInfoRequest) => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_TRANSACTIONS
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getTransactionInfo(request)
			},

			getFmdParameters: async () => {
				// const canIUse = this.permissionsController.hasPermission(
				// 	origin,
				// 	PERMISSIONS.GET_FMD_PARAMETERS
				// )
				// if (!canIUse) {
				// 	throw new Error('Access denied')
				// }
				return this.viewProtocolService.getFMDParameters()
			},
			getBalanceByAddress: async (arg: BalanceByAddressRequest) =>
				this.viewProtocolService.getBalanceByAddress(arg),
		}
	}

	setupUiConnection(sourcePort: chrome.runtime.Port) {
		let port: chrome.runtime.Port | null = sourcePort
		const api = this.getApi()

		pipe(
			fromPort(port),
			handleMethodCallRequests(api, result => port?.postMessage(result)),
			subscribe({
				complete: () => {
					port = null
					// this.off('ledger:signRequest', ui.ledgerSignRequest)
					// this.off('closePopupWindow', ui.closePopupWindow)
				},
			})
		)
	}

	_getCurrentNetwork(account: PreferencesAccount | undefined) {
		const networks = {
			grpc: this.networkController.getNetworkGRPC(),
			tendermint: this.networkController.getNetworkTendermint(),
		}
		return !account ? null : networks
	}
}

export type __BackgroundUiApiDirect = ReturnType<BackgroundService['getApi']>

export type __BackgroundPageApiDirect = ReturnType<
	BackgroundService['getInpageApi']
>
