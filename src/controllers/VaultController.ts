import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { WalletController } from './WalletController';

export class VaultController {
  store;
  private wallet;
  private identity;

  constructor({
    extensionStorage,
    wallet,
  }: {
    extensionStorage: ExtensionStorage;
    wallet: WalletController;
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState(
        { isLocked: null, isInitialized: null },
        { isLocked: !extensionStorage.getInitSession().password }
      )
    );
    extensionStorage.subscribe(this.store);

    this.wallet = wallet;

    const { vault } = wallet.store.getState().WalletController;
    if (vault) {
      this.store.updateState({ isInitialized: true });
    }
  }

  private get isLocked() {
    return this.store.getState().isLocked;
  }

  private set isLocked(value) {
    if (this.isLocked !== value) {
      this.store.updateState({ isLocked: value });
    }
  }

  private get isInitialized() {
    return this.store.getState().isInitialized;
  }

  private set isInitialized(value) {
    if (this.isInitialized !== value) {
      this.store.updateState({ isInitialized: value });
    }
  }

  init(password: string) {
    this.wallet.initVault(password);

    this.isLocked = false;
    this.isInitialized = true;
    
  }

  lock() {
    this.wallet.lock();
    // this.identity.lock();

    this.isLocked = true;
  }

  unlock(password: string) {
    this.wallet.unlock(password);

    this.isLocked = false;
  }
}
