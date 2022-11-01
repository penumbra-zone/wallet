export type WalletAccount = {
  name: string;
  addressByIndex: string;
} & ({ type: 'seed' } | { type: 'encodedSeed' });

export type PreferencesAccount = WalletAccount & {
  lastUsed?: number;
};
