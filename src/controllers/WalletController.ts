import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { encryptSeed, decryptSeed } from '../utils';
import {
  createWallet,
  CreateWalletInput,
  Wallet,
  WalletPrivateData,
} from '../wallets';

function encrypt(object: unknown, password: string) {
  const jsonObj = JSON.stringify(object);
  return encryptSeed(jsonObj, password);
}

function decrypt(ciphertext: string, password: string) {
  try {
    const decryptedJson = decryptSeed(ciphertext, password);
    return JSON.parse(decryptedJson);
  } catch (error) {
    throw new Error('Invalid password');
  }
}

export class WalletController extends EventEmitter {
  store;
  private password: string | null | undefined;
  private _setSession;
  private wallets: Array<Wallet<WalletPrivateData>>;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        WalletController: { vault: undefined },
      })
    );
    extensionStorage.subscribe(this.store);

    this.password = extensionStorage.getInitSession().password;
    this._setSession = extensionStorage.setSession.bind(extensionStorage);

    this._restoreWallets(this.password);
  }

  initVault(password: string) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is needed to init vault');
    }

    this._setPassword(password);
    this.wallets = [];
    this._saveWallets();
  }

  unlock(password: string) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is needed to init vault');
    }
    this._restoreWallets(password);
    this._setPassword(password);
    this.emit('wallet unlock');
  }

  addWallet(options: CreateWalletInput) {
    if (this.wallets.length >= 1) {
      throw new Error('You should have only 1 wallet');
    }
    const wallet = this._createWallet({ ...options });

    this.wallets.push(wallet);
    this._saveWallets();

    this.emit('wallet create');
    return wallet.getAccount();
  }

  getAccounts() {
    return this.wallets.map((wallet) => wallet.getAccount());
  }

  lock() {
    this._setPassword(null);
    this.wallets = [];
  }

  getAccountFullViewingKey(password: string) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this.wallets[0].getFullViewingKey();
  }

  getAccountFullViewingKeyWithoutPassword() {
    try {
      return this.wallets[0].getFullViewingKey();
    } catch (error) {
      return '';
    }
  }

  getAccountSpendingKeyWithoutPassword() {
    try {
      return this.wallets[0].getSpendKey();
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  getAccountSeed(password: string) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this.wallets[0].getSeed();
  }

  resetWallet() {
    this.emit('reset wallet');
  }

  getAccountSpendingKey(password: string) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this.wallets[0].getSpendKey();
  }

  _restoreWallets(password: string | null | undefined) {
    const vault = this.store.getState().WalletController.vault;

    if (!vault || !password) return;

    const decryptedData = decrypt(vault, password) as CreateWalletInput[];
    this.wallets = decryptedData.map((user) => this._createWallet(user));
  }

  _createWallet(user: CreateWalletInput) {
    return createWallet(user);
  }

  _saveWallets() {
    const walletsData = this.wallets.map((wallet) => wallet.serialize());
    this.store.updateState({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      WalletController: { vault: encrypt(walletsData, this.password!) },
    });
  }

  _setPassword(password: string | null) {
    this.password = password;
    this._setSession({ password });
  }
}
