
import { NetworkName } from '../controllers';
import { WalletAccount } from '../preferences';
import { WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export interface ISeedWalletInput {
  name: string;
  network: NetworkName;
  networkCode: string;
  seed: string;
}

export class SeedWallet extends Wallet<WalletPrivateDataOfType<'seed'>> {
  constructor({ name, network, networkCode, seed }: ISeedWalletInput) {
    super({
      address: 'address',
      name,
      network,
      networkCode,
      publicKey: 'publicKey',
      seed,
      type: 'seed',
    });
  }

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
    } as any;
  }

  getSeed() {
    return this.data.seed;
  }

  getPrivateKey() {
    return 'sed';
  }
}
