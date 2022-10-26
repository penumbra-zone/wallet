import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  IdleController,
  NetworkController,
  PreferencesController,
  RemoteConfigController,
  VaultController,
  WalletController,
} from './controllers';
import { extension, PortStream, setupDnode, TabsManager } from './lib';
import { ExtensionStorage, StorageLocalState } from './storage';
import { KEEPERWALLET_DEBUG } from './ui/appConfig';
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
  if (KEEPERWALLET_DEBUG) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).background = backgroundService;
  }

  const tabsManager = new TabsManager({ extensionStorage });
  backgroundService.on('Show tab', async (url, name) => {
    backgroundService.emit('closePopupWindow');
    return tabsManager.getOrCreate(url, name);
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
      unlock: async (password: string) => this.vaultController.unlock(password),
      addWallet: async (account: CreateWalletInput) =>
        this.walletController.addWallet(account),
      selectAccount: async (lastAccount: ISeedWalletInput) =>
        this.preferencesController.selectAccount(lastAccount),
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
