import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientController,
  IdleController,
  NetworkController,
  NetworkName,
  PreferencesController,
  RemoteConfigController,
  VaultController,
  WalletController,
} from './controllers';
import { extension, PortStream, setupDnode, TabsManager } from './lib';
import { ExtensionStorage, StorageLocalState } from './storage';
import { PENUMBRAWALLET_DEBUG } from './ui/appConfig';
import { IndexedDb } from './utils';
import { CreateWalletInput, ISeedWalletInput } from './wallets';

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

  backgroundService.clientController.getCompactBlockRange();

  const tabsManager = new TabsManager({ extensionStorage });
  backgroundService.on('Show tab', async (url, name) => {
    backgroundService.emit('closePopupWindow');
    return tabsManager.getOrCreate(url, name);
  });

  backgroundService.walletController.on('wallet create', async () => {
    await backgroundService.clientController.saveAssets();
    await backgroundService.clientController.getChainParams();

    await backgroundService.clientController.getCompactBlockRange();
  });

  backgroundService.walletController.on('wallet unlock', async () => {
    await backgroundService.clientController.saveAssets();
    await backgroundService.clientController.getChainParams();
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
  extensionStorage;
  idleController;
  vaultController;
  walletController;
  networkController;
  remoteConfigController;
  preferencesController;
  clientController;
  indexedDb;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();
    this.extensionStorage = extensionStorage;

    this.remoteConfigController = new RemoteConfigController({
      extensionStorage: this.extensionStorage,
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

    this.idleController = new IdleController({
      extensionStorage: this.extensionStorage,
      vaultController: this.vaultController,
    });

    this.clientController = new ClientController({
      extensionStorage: this.extensionStorage,
      getAccountFullViewingKey: () =>
        this.walletController.getAccountFullViewingKeyWithoutPassword(),
      setNetworks: (networkName: string, type: NetworkName) =>
        this.remoteConfigController.setNetworks(networkName, type),
      getNetwork: () => this.networkController.getNetwork(),
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
    });

    this.indexedDb = new IndexedDb()
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
      getChainParams: async () => this.clientController.getChainParams(),
      resetWallet: async () => this.walletController.resetWallet(),
      setCustomGRPC: async (
        url: string | null | undefined,
        network: NetworkName
      ) => this.networkController.setCustomGRPC(url, network),
      setCustomTendermint: async (
        url: string | null | undefined,
        network: NetworkName
      ) => this.networkController.setCustomTendermint(url, network),
      getAllValueIndexedDB: async (tableName: string) =>
        this.indexedDb.getAllValue(tableName),
    };
  }
  getInpageApi(origin: string, connectionId: string) {
    return {
      publicState: async () => {
        return this._publicState(origin);
      },
    };
  }

  getState<K extends keyof StorageLocalState>(params?: K | K[]) {
    const state = this.extensionStorage.getState(params);

    return { ...state };
  }

  _publicState(originReq: string) {
    let account;
    const { selectedAccount, isInitialized, isLocked } = this.getState();
    if (selectedAccount) {
      account = {
        ...selectedAccount,
        balance: 0,
      };
    }
    return {
      version: extension.runtime.getManifest().version,
      isInitialized,
      isLocked,
      account,
    };
  }
}

export type __BackgroundUiApiDirect = ReturnType<BackgroundService['getApi']>;
