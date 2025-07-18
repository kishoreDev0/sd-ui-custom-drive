import CryptoJS from 'crypto-js';

// Use Vite env variable for the secret key
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'dev-fallback-key'; // Set VITE_ENCRYPTION_KEY in .env for production

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
}

export function decryptToken(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
} 