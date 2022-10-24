import { NetworkName } from '../controllers';


export type WalletAccount = {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
  publickKey: string;
} & ({ type: 'seed' } | { type: 'encodedSeed' });

export type PreferencesAccount = WalletAccount & {
  lastUsed?: number;
};
