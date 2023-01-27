import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import { WalletAccount } from '../preferences';
import { ExtensionStorage } from '../storage';
import { ISeedWalletInput } from '../wallets';

export class PreferencesController extends EventEmitter {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        idleOptions: { type: '1h', interval: 60 * 60 * 1000 },
        accounts: [],
        selectedAccount: undefined,
      })
    );
    extensionStorage.subscribe(this.store);
  }

  getSelectedAccount() {
    return this.store.getState().selectedAccount;
  }

  selectAccount(selectedAccount: ISeedWalletInput) {
    this.store.updateState({
      selectedAccount,
    });
  }
}
