export type WalletAccount = {
  name: string;
} & ({ type: 'seed' } | { type: 'encodedSeed' });

export type PreferencesAccount = WalletAccount & {
  lastUsed?: number;
};
