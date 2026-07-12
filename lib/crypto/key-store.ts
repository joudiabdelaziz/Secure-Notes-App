/**
 * In-memory key store for the derived CryptoKey.
 *
 * Security design:
 * The encryption key is intentionally stored only in memory (a module-level
 * variable), NOT in localStorage or sessionStorage.
 *
 * Why not sessionStorage?
 *   sessionStorage is cleared when the tab is closed, but it IS accessible
 *   to any script running on the same origin. Keeping the key in a JS
 *   variable (not in the DOM's storage APIs) is a meaningful security
 *   improvement: the key cannot be extracted by XSS payloads that read
 *   storage directly.
 *
 * Consequence:
 *   The key is lost on page refresh or tab close. The user must re-enter
 *   their passphrase each time. This is documented as a deliberate security
 *   tradeoff in the UI and README.
 *
 * This module is a singleton — it is safe to import from multiple components.
 */

let encryptionKey: CryptoKey | null = null

/** Store the derived key in memory. */
export function setKey(key: CryptoKey): void {
  encryptionKey = key
}

/** Retrieve the in-memory key, or null if not set. */
export function getKey(): CryptoKey | null {
  return encryptionKey
}

/** Clear the key from memory (on logout). */
export function clearKey(): void {
  encryptionKey = null
  clearSessionPassphrase()
}

/** Check whether a key is currently loaded. */
export function hasKey(): boolean {
  return encryptionKey !== null
}

/** Cache the passphrase in sessionStorage (tab-scoped) to survive page refreshes if opted in. */
export function setSessionPassphrase(passphrase: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem('sn_session_vault_key', passphrase)
    } catch (e) {
      console.error('Failed to set session passphrase:', e)
    }
  }
}

/** Retrieve the cached session passphrase. */
export function getSessionPassphrase(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return window.sessionStorage.getItem('sn_session_vault_key')
    } catch {
      return null
    }
  }
  return null
}

/** Clear the cached session passphrase. */
export function clearSessionPassphrase(): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem('sn_session_vault_key')
    } catch {}
  }
}
