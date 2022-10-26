import { SeedWallet } from './seed';
import { CreateWalletInput } from './types';

export function createWallet(input: CreateWalletInput) {
  switch (input.type) {
    case 'seed':
      return new SeedWallet({
        seed: input.seed,
        name: input.name
      });
    case 'encodedSeed':
      return;
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported wallet type: "${(input as any).type}"`);
  }
}
