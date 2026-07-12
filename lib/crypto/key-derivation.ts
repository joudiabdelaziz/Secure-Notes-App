/**
 * PBKDF2 key derivation from a user passphrase.
 *
 * Security model:
 * - Algorithm: PBKDF2 with SHA-256
 * - Iterations: 310,000  (NIST recommendation for SHA-256 as of 2023)
 * - Derived key: AES-GCM 256-bit
 * - Salt: deterministic, derived from `userId + ":secure-notes-v1"`
 *   This means: no extra DB column needed, the same user always gets
 *   the same key from the same passphrase, and the salt is unique
 *   per user (Supabase user IDs are UUIDs).
 *
 * Known limitation (documented in README):
 *   If a user's Supabase user_id changes (e.g. account migration),
 *   the derived salt will differ and all existing notes will be
 *   unreadable.  This is an extreme edge case not expected in normal
 *   operation.
 *
 * Passphrase-change limitation (documented in README):
 *   Changing the passphrase requires re-encrypting every note with the
 *   new key.  This is out of scope for V1.  Users should choose their
 *   passphrase carefully at setup.
 */

const PBKDF2_ITERATIONS = 310_000
const APP_SALT_SUFFIX = ':secure-notes-v1'

function encodeToArrayBuffer(text: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(text)
  // Slice to get a concrete ArrayBuffer (not SharedArrayBuffer)
  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength,
  ) as ArrayBuffer
}

/**
 * Derive an AES-GCM CryptoKey from a user passphrase and their Supabase user ID.
 *
 * @param passphrase - The user's secret passphrase (never sent to the server)
 * @param userId     - The user's Supabase UUID (used to create a unique salt)
 * @returns          A CryptoKey suitable for AES-GCM encrypt/decrypt
 */
export async function deriveKey(
  passphrase: string,
  userId: string,
): Promise<CryptoKey> {
  // Step 1: Import the passphrase as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodeToArrayBuffer(passphrase),
    { name: 'PBKDF2' },
    false,           // not extractable
    ['deriveKey'],
  )

  // Step 2: Build a deterministic salt from the user ID
  const salt = encodeToArrayBuffer(userId + APP_SALT_SUFFIX)

  // Step 3: Derive the AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,           // not extractable — key never leaves SubtleCrypto
    ['encrypt', 'decrypt'],
  )
}
