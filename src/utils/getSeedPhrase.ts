const bip39 = require('bip39');

export const getSeedPhrase = () => {
  const mnemonic = bip39.generateMnemonic(256);
  return mnemonic;
};
