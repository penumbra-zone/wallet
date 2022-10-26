import { NetworkName } from '../controllers';

export interface SeedWalletInput {
  seed: string;
  name: string;
}

export interface EncodedSeedWalletInput {
  encodedSeed: string;
  name: string;
  network: NetworkName;
  networkCode: string;
}

export type CreateWalletInput =
  | ({ type: 'seed' } & SeedWalletInput)
  | ({ type: 'encodedSeed' } & EncodedSeedWalletInput);

export type WalletPrivateData = {
  name: string;
} & (
  | { type: 'seed'; seed: string }
  | { type: 'encodedSeed'; encodedSeed: string }
);

export type WalletPrivateDataOfType<T extends WalletPrivateData['type']> =
  Extract<WalletPrivateData, { type: T }>;
