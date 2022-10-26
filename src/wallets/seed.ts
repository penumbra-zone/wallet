import {
  generate_spend_key,
  get_full_viewing_key,
} from 'penumbra-web-assembly';
import { WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export interface ISeedWalletInput {
  seed: string;
  name: string;
}

export class SeedWallet extends Wallet<WalletPrivateDataOfType<'seed'>> {
  constructor({ seed, name }: ISeedWalletInput) {
    super({
      seed,
      type: 'seed',
      name,
    });
  }

  getAccount() {
    return {
      type: this.data.type,
      name: this.data.name,
    } as any;
  }

  getSeed() {
    return this.data.seed;
  }

  getSpendKey() {
    return generate_spend_key(this.getSeed());
  }

  getFullViewingKey() {
    return get_full_viewing_key(this.getSpendKey());
  }
}
