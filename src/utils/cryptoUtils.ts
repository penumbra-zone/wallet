import CryptoJS from 'crypto-js';

// Используется для осложнения подбора пароля перебором
function strengthenPassword(password: string, rounds = 5000) {
  while (rounds-- > 0) {
    password = CryptoJS.SHA256(password).toString();
  }
  return password;
}

export function encryptSeed(str: string, pass: string) {
  const strongPass = strengthenPassword(pass);
  return CryptoJS.AES.encrypt(str, strongPass).toString();
}

export function decryptSeed(str: string, pass: string) {
  const strongPass = strengthenPassword(pass);
  const decrypted = CryptoJS.AES.decrypt(str, strongPass);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
