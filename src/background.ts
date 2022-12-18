import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  ContactBookController,
  ClientController,
  IdleController,
  NetworkController,
  NetworkName,
  PreferencesController,
  RemoteConfigController,
  VaultController,
  WalletController,
  Contact,
  PermissionController,
  MessageController,
  PermissionType,
  PERMISSIONS,
} from './controllers';
import {
  extension,
  PortStream,
  setupDnode,
  TabsManager,
  WindowManager,
} from './lib';
import { MessageInput, MessageStoreItem } from './messages/types';
import { PreferencesAccount } from './preferences';
import { ViewProtocolService } from './services';
import { ExtensionStorage, StorageLocalState } from './storage';
import { PENUMBRAWALLET_DEBUG } from './ui/appConfig';
import { IndexedDb, TableName } from './utils';
import { CreateWalletInput, ISeedWalletInput } from './wallets';
import { FMDParametersRequest } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/view/v1alpha1/view_pb';

const bgPromise = setupBackgroundService();

extension.runtime.onConnect.addListener(async (remotePort) => {
  const bgService = await bgPromise;

  if (remotePort.name === 'contentscript') {
    bgService.setupPageConnection(remotePort);
  } else {
    bgService.setupUiConnection(remotePort);
  }
});

extension.runtime.onConnectExternal.addListener(async (remotePort) => {
  const bgService = await bgPromise;
  bgService.setupPageConnection(remotePort);
});

async function setupBackgroundService() {
  const extensionStorage = new ExtensionStorage();
  await extensionStorage.create();
  const backgroundService = new BackgroundService({
    extensionStorage,
  });

  // global access to service on debug
  if (PENUMBRAWALLET_DEBUG) {
    global.background = backgroundService;
  }

  const updateBadge = () => {
    const messages = backgroundService.messageController.getUnapproved();

    const msg = messages.length;
    const text = msg ? String(msg) : '';

    const action = extension.action || extension.browserAction;
    action.setBadgeText({ text });
    action.setBadgeBackgroundColor({ color: 'red' });
  };

  backgroundService.messageController.on('Update badge', updateBadge);
  updateBadge();

  backgroundService.clientController.getCompactBlockRange();

  // Notification window management
  const windowManager = new WindowManager({ extensionStorage });
  backgroundService.on(
    'Show notification',
    windowManager.showWindow.bind(windowManager)
  );
  backgroundService.on('Close notification', () => {
    windowManager.closeWindow();
  });
  backgroundService.on('Resize notification', (width, height) => {
    windowManager.resizeWindow(width, height);
  });

  const tabsManager = new TabsManager({ extensionStorage });
  backgroundService.on('Show tab', async (url, name) => {
    backgroundService.emit('closePopupWindow');
    return tabsManager.getOrCreate(url, name);
  });

  backgroundService.walletController.on('wallet create', async () => {
    await backgroundService.clientController.saveAssets();
    await backgroundService.clientController.saveChainParameters();

    await backgroundService.clientController.getCompactBlockRange();
  });

  backgroundService.walletController.on('wallet unlock', async () => {
    await backgroundService.clientController.saveAssets();
    await backgroundService.clientController.saveChainParameters();
    await backgroundService.clientController.getCompactBlockRange();
  });

  backgroundService.walletController.on('reset wallet', async () => {
    await backgroundService.remoteConfigController.resetWallet();
    await backgroundService.clientController.resetWallet();
    await backgroundService.networkController.resetWallet();
    await backgroundService.vaultController.lock();
    setTimeout(() => {
      extension.runtime.reload();
    }, 500);
  });

  return backgroundService;
}

class BackgroundService extends EventEmitter {
  extensionStorage: ExtensionStorage;
  idleController: IdleController;
  vaultController: VaultController;
  walletController: WalletController;
  networkController: NetworkController;
  remoteConfigController: RemoteConfigController;
  preferencesController: PreferencesController;
  clientController: ClientController;
  indexedDb: IndexedDb;
  viewProtocolService: ViewProtocolService;
  contactBookController: ContactBookController;
  permissionsController: PermissionController;
  messageController: MessageController;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.indexedDb = new IndexedDb();
    this.extensionStorage = extensionStorage;

    this.contactBookController = new ContactBookController({
      extensionStorage: this.extensionStorage,
    });

    this.remoteConfigController = new RemoteConfigController({
      extensionStorage: this.extensionStorage,
    });

    this.permissionsController = new PermissionController({
      extensionStorage: this.extensionStorage,
      remoteConfig: this.remoteConfigController,
      getSelectedAccount: () => this.preferencesController.getSelectedAccount(),
    });

    this.networkController = new NetworkController({
      extensionStorage: this.extensionStorage,
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
      getNetworks: () => this.remoteConfigController.getNetworks(),
    });

    this.preferencesController = new PreferencesController({
      extensionStorage: this.extensionStorage,
    });

    this.walletController = new WalletController({
      extensionStorage: this.extensionStorage,
    });

    this.vaultController = new VaultController({
      extensionStorage: this.extensionStorage,
      wallet: this.walletController,
    });

    this.messageController = new MessageController({
      extensionStorage: this.extensionStorage,
      getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
      setPermission: (origin: string, permission: PermissionType) =>
        this.permissionsController.setPermission(origin, permission),
    });

    this.idleController = new IdleController({
      extensionStorage: this.extensionStorage,
      vaultController: this.vaultController,
    });

    this.clientController = new ClientController({
      extensionStorage: this.extensionStorage,
      indexedDb: this.indexedDb,
      getAccountFullViewingKey: () =>
        this.walletController.getAccountFullViewingKeyWithoutPassword(),
      setNetworks: (networkName: string, type: NetworkName) =>
        this.remoteConfigController.setNetworks(networkName, type),
      getNetwork: () => this.networkController.getNetwork(),
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
    });

    this.viewProtocolService = new ViewProtocolService({
      indexedDb: this.indexedDb,
      extensionStorage: this.extensionStorage,
      getLastExistBlock: () => this.clientController.getLastExistBlock(),
    });
  }

  setupPageConnection(remotePort: chrome.runtime.Port) {
    const { sender } = remotePort;

    if (!sender || !sender.url) return;

    const origin = new URL(sender.url).hostname;
    const connectionId = uuidv4();
    const inpageApi = this.getInpageApi(origin, connectionId);
    const dnode = setupDnode(
      new PortStream(remotePort),
      inpageApi,
      'inpageApi'
    );
  }

  getState<K extends keyof StorageLocalState>(params?: K | K[]) {
    const state = this.extensionStorage.getState(params);
    return state;
  }

  getApi() {
    return {
      getState: async <K extends keyof StorageLocalState>(params?: K[]) =>
        this.getState(params),
      updateIdle: async () => this.idleController.update(),
      getNetworks: async () => this.networkController.getNetworks(),
      showTab: async (url: string, name: string) => {
        this.emit('Show tab', url, name);
      },
      initVault: async (password: string) => {
        this.vaultController.init(password);
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
      saveAssets: async () => this.clientController.saveAssets(),
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
      getAllValueIndexedDB: async (tableName: TableName) =>
        this.indexedDb.getAllValue(tableName),
      // addresses
      setContact: async (contact: Contact) =>
        this.contactBookController.setContact(contact),
      updateContact: async (contact: Contact, prevAddress: string) =>
        this.contactBookController.updateContact(contact, prevAddress),
      removeContact: async (address: string) =>
        this.contactBookController.removeContact(address),
      resizeNotificationWindow: async (width: number, height: number) =>
        this.emit('Resize notification', width, height),
      closeNotificationWindow: async () => {
        this.emit('Close notification');
      },
      reject: async (messageId: string, forever?: boolean) =>
        this.messageController.reject(messageId, forever),
      deleteMessage: async (id: string) =>
        this.messageController.deleteMessage(id),
      approve: async (messageId: string, account: PreferencesAccount) => {
        const message = await this.messageController.approve(
          messageId,
          account
        );
        return message.result;
      },
      deleteOrigin: async (origin: string) =>
        this.permissionsController.deletePermissions(origin),
      setPermission: async (origin: string, permission: PermissionType) =>
        this.permissionsController.setPermission(origin, permission),
      deletePermission: async (origin: string, permission: PermissionType) =>
        this.permissionsController.deletePermission(origin, permission),
    };
  }

  async validatePermission(origin: string, connectionId: string) {
    const { selectedAccount } = this.getState('selectedAccount');
    if (!selectedAccount) throw new Error('Add Keeper Wallet account');

    const canIUse = this.permissionsController.hasPermission(
      origin,
      PERMISSIONS.APPROVED
    );

    if (canIUse === null) {
      let messageId = this.permissionsController.getMessageIdAccess(origin);

      if (messageId) {
        try {
          const message = this.messageController.getMessageById(messageId);

          if (
            !message ||
            message.account.address !== selectedAccount.addressByIndex
          ) {
            messageId = null;
          }
        } catch (e) {
          messageId = null;
        }
      }

      if (!messageId) {
        const messageData: MessageInput = {
          origin,
          connectionId,
          title: null,
          options: {},
          broadcast: false,
          data: { origin },
          type: 'authOrigin',
          account: selectedAccount,
        };
        const result = await this.messageController.newMessage(messageData);
        messageId = result.id;

        this.permissionsController.setMessageIdAccess(origin, messageId);
      }
      this.emit('Show notification');

      await this.messageController
        .getMessageResult(messageId)
        .then(() => {
          this.messageController.setPermission(origin, PERMISSIONS.APPROVED);
        })
        .catch((e) => {
          if (e.data === 'rejected') {
            // user rejected single permission request
            this.permissionsController.setMessageIdAccess(origin, null);
          }
          return Promise.reject(e);
        });
    }
  }
  getInpageApi(origin: string, connectionId: string) {
    return {
      publicState: async () => {
        const { selectedAccount, isInitialized } = this.getState([
          'selectedAccount',
          'isInitialized',
        ]);

        if (!selectedAccount) {
          throw new Error(
            !isInitialized
              ? 'Init Penumbra Wallet and add account'
              : 'Add Penumbra Wallet account'
          );
        }

        await this.validatePermission(origin, connectionId);
        return await this._publicState(origin);
      },
      resourceIsApproved: async () => {
        return this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.APPROVED
        );
      },
      getAssets: async () => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_ASSETS
        );

        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getAssets();
      },
      getChainParameters: async () => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_CHAIN_PARAMETERS
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getChainParameters();
      },
      getNotes: async () => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_NOTES
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getNotes();
      },
      getStatus: async () => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_CHAIN_CURRENT_STATUS
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getStatus();
      },
      getTransactionHashes: async (
        startHeight?: number,
        endHeight?: number
      ) => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_TRANSACTION_HASHES
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getTransactionHashes(
          startHeight,
          endHeight
        );
      },
      getTransactionByHash: async (txHash: string) => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_TRANSACTION_BY_HASH
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getTransactionByHash(txHash);
      },
      getTransactions: async (startHeight?: number, endHeight?: number) => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_TRANSACTIONS
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getTransactions(startHeight, endHeight);
      },
      getNoteByCommitment: async (noteCommitment: string) => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_NOTE_BY_COMMITMENT
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getNoteByCommitment(noteCommitment);
      },
      getFmdParameters: async () => {
        const canIUse = this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.GET_FMD_PARAMETERS
        );
        if (!canIUse) {
          throw new Error('Access denied');
        }
        return this.viewProtocolService.getFMDParameters();
      },
    };
  }

  setupUiConnection(remotePort: chrome.runtime.Port) {
    const dnode = setupDnode(new PortStream(remotePort), this.getApi(), 'api');

    const remoteHandler = (remote: any) => {
      const closePopupWindow = remote.closePopupWindow.bind(remote);
      this.on('closePopupWindow', closePopupWindow);

      dnode.on('end', () => {
        this.removeListener('closePopupWindow', closePopupWindow);
      });
    };

    dnode.on('remote', remoteHandler);
  }

  _getCurrentNetwork(account: PreferencesAccount | undefined) {
    const networks = {
      grpc: this.networkController.getNetworkGRPC(),
      tendermint: this.networkController.getNetworkTendermint(),
    };
    return !account ? null : networks;
  }

  _publicState(originReq: string) {
    let account: PreferencesAccount | null = null;

    let msg: Array<{
      id: MessageStoreItem['id'];
      status: MessageStoreItem['status'];
      uid: MessageStoreItem['ext_uuid'];
    }> = [];

    const canIUse = this.permissionsController.hasPermission(
      originReq,
      PERMISSIONS.APPROVED
    );

    const { selectedAccount, isInitialized, isLocked, messages } =
      this.getState();

    if (selectedAccount && canIUse) {
      const addressByIndex = selectedAccount.addressByIndex;
      account = {
        ...selectedAccount,
        // balance: 0,
      };
      msg = messages
        .filter(
          ({ account, origin }) =>
            account.addressByIndex === addressByIndex && origin === originReq
        )
        .map(({ id, status, ext_uuid }) => ({ id, status, uid: ext_uuid }));
    }

    return {
      version: extension.runtime.getManifest().version,
      isInitialized,
      isLocked,
      account,
      network: this._getCurrentNetwork(selectedAccount),
      messages: msg,
    };
  }
}

export type __BackgroundUiApiDirect = ReturnType<BackgroundService['getApi']>;
