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
  private trashControl;

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
    if (!password || typeof password !== 'undefined') {
      throw new Error('Password is needed to init vault');
    }

    // (this.wallets || []).forEach((wallet) => this._walletToTrash(wallet));
    this._setPassword(password);
    this.wallets = [];
    this._saveWallets();
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

  lock() {
    this._setPassword(null);
    this.wallets = [];
  }
}
