/**
 * AES-GCM encryption and decryption utilities.
 *
 * Security model:
 * - Algorithm: AES-GCM with a 256-bit key
 * - IV: 96-bit (12 bytes), cryptographically random per encrypt call
 *   A fresh IV is REQUIRED for each encryption to maintain AES-GCM's
 *   security guarantees.  Reusing an IV with the same key is catastrophic.
 * - Ciphertext and IV are Base64-encoded for storage in the database.
 * - The IV is NOT secret and is stored alongside the ciphertext.
 *
 * The plaintext (note body) is encoded as UTF-8 before encryption and
 * decoded from UTF-8 after decryption.
 */

import { arrayBufferToBase64, base64ToArrayBuffer, decodeText } from './utils'

export interface EncryptResult {
  /** Base64-encoded ciphertext (includes AES-GCM authentication tag) */
  ciphertext: string
  /** Base64-encoded 96-bit initialisation vector */
  iv: string
}

/**
 * Encrypt a plaintext string with AES-GCM.
 *
 * @param plaintext - The note body to encrypt
 * @param key       - A CryptoKey derived via deriveKey()
 * @returns         An EncryptResult containing base64 ciphertext and IV
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
): Promise<EncryptResult> {
  // Generate a fresh, cryptographically random IV for every encryption.
  const ivArray = crypto.getRandomValues(new Uint8Array(12))
  // Ensure we have a concrete ArrayBuffer (not SharedArrayBuffer)
  const iv = ivArray.buffer.slice(0) as ArrayBuffer

  const encodedPlaintext = new TextEncoder().encode(plaintext)
  const plaintextBuffer = encodedPlaintext.buffer.slice(
    encodedPlaintext.byteOffset,
    encodedPlaintext.byteOffset + encodedPlaintext.byteLength,
  ) as ArrayBuffer

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBuffer,
  )

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv),
  }
}

/**
 * Decrypt a ciphertext string with AES-GCM.
 *
 * @param ciphertext - Base64-encoded ciphertext from encrypt()
 * @param iv         - Base64-encoded IV from encrypt()
 * @param key        - The same CryptoKey used during encryption
 * @returns          The decrypted plaintext string
 * @throws           {DecryptionError} If decryption fails (wrong key, tampered data)
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  try {
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) as ArrayBuffer },
      key,
      base64ToArrayBuffer(ciphertext) as ArrayBuffer,
    )
    return decodeText(new Uint8Array(plaintextBuffer))
  } catch {
    // AES-GCM authentication tag verification failed.
    // This happens when: wrong key, corrupted ciphertext, or tampered data.
    throw new DecryptionError(
      'Decryption failed. This is usually caused by an incorrect passphrase.',
    )
  }
}

/** Typed error for decryption failures — enables targeted error handling in the UI. */
export class DecryptionError extends Error {
  readonly name = 'DecryptionError'
  constructor(message: string) {
    super(message)
  }
}
