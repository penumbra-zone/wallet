import { SeedWallet } from './seed';
import { CreateWalletInput } from './types';

export function createWallet(input: CreateWalletInput) {
  switch (input.type) {
    case 'seed':
      return new SeedWallet({
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
        seed: input.seed,
      });
    case 'encodedSeed':
      return;
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported wallet type: "${(input as any).type}"`);
  }
}
