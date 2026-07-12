/**
 * Encoding / decoding utilities for the Web Crypto API.
 *
 * The SubtleCrypto API works with ArrayBuffers.  These helpers convert
 * between ArrayBuffer and Base64 (for storage) and between strings and
 * Uint8Array (for encryption input).
 *
 * All functions are pure and synchronous; they have no side effects.
 */

/** Convert an ArrayBuffer to a Base64 string for storage. */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** Convert a Base64 string back to an ArrayBuffer. */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/** Encode a UTF-8 string as a Uint8Array. */
export function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

/** Decode a Uint8Array as a UTF-8 string. */
export function decodeText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}
