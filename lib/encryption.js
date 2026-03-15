// lib/encryption.js
// AES-256-CBC encryption for sensitive payload fields (e.g. task descriptions)
// Uses Node.js built-in 'crypto' — no extra package needed

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Key must be exactly 32 bytes for AES-256
const KEY = Buffer.from((process.env.ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32));

/**
 * Encrypt a string value.
 * Returns a string in the format: iv:encryptedData (both hex-encoded)
 */
export function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16); // Fresh IV for every encryption
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a string that was produced by encrypt().
 * Returns the original plaintext string.
 */
export function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  const [ivHex, dataHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
