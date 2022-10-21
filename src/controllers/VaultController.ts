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
        { locked: null, inititalized: null },
        { locked: !extensionStorage.getInitSession().password }
      )
    );
    extensionStorage.subscribe(this.store);

    this.wallet = wallet;

    const { vault } = wallet.store.getState().WalletController;
    if (vault) {
      this.store.updateState({ initialized: true });
    }
  }

  private get locked() {
    return this.store.getState().locked;
  }

  private set locked(value) {
    if (this.locked !== value) {
      this.store.updateState({ locked: value });
    }
  }

  private get initialized() {
    return this.store.getState().initialized;
  }

  private set initialized(value) {
    if (this.initialized !== value) {
      this.store.updateState({ initialized: value });
    }
  }

  init(password: string){
    this.wallet.initVault(password)

     this.locked = false;
     this.initialized = true;
  }
}
