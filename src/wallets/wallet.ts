import { WalletAccount } from '../preferences';
import { WalletPrivateData } from './types';


export abstract class Wallet<TData extends WalletPrivateData> {
  readonly data: TData;
  constructor(data: TData) {
    this.data = data;
  }

  abstract getAccount(): WalletAccount;
  abstract getSeed(): string;
  //   getEncodedSeed() {
  //     return base58Encode(this.getSeed());
  //   }
  serialize() {
    return this.data;
  }
}
