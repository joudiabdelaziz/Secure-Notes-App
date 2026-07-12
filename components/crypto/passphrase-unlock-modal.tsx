'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { deriveKey } from '@/lib/crypto/key-derivation'
import { setKey, setSessionPassphrase, getSessionPassphrase, clearSessionPassphrase } from '@/lib/crypto/key-store'
import { decrypt, DecryptionError } from '@/lib/crypto/encryption'

interface PassphraseUnlockModalProps {
  open: boolean
  userId: string
  /** A sample encrypted note to test the passphrase against */
  testCiphertext: string
  testIv: string
  onSuccess: () => void
}

export function PassphraseUnlockModal({
  open,
  userId,
  testCiphertext,
  testIv,
  onSuccess,
}: PassphraseUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-unlock on mount if we have a session passphrase cached
  useEffect(() => {
    const cachedPassphrase = getSessionPassphrase()
    if (cachedPassphrase && open) {
      const autoUnlock = async () => {
        setLoading(true)
        try {
          const key = await deriveKey(cachedPassphrase, userId)
          await decrypt(testCiphertext, testIv, key)
          setKey(key)
          onSuccess()
        } catch {
          // Stale or corrupted session cache — clear it
          clearSessionPassphrase()
        } finally {
          setLoading(false)
        }
      }
      void autoUnlock()
    }
  }, [open, userId, testCiphertext, testIv, onSuccess])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!passphrase.trim()) {
      setError('Please enter your passphrase.')
      return
    }

    setLoading(true)
    try {
      const key = await deriveKey(passphrase, userId)

      // Verify the passphrase by attempting to decrypt a known note.
      await decrypt(testCiphertext, testIv, key)

      // Passphrase is correct — store the key in memory.
      setKey(key)
      
      if (remember) {
        setSessionPassphrase(passphrase)
      } else {
        clearSessionPassphrase()
      }

      setPassphrase('')
      onSuccess()
    } catch (err) {
      if (err instanceof DecryptionError) {
        setError('Incorrect passphrase. Please try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {}} // Cannot dismiss without unlocking
      preventBackdropClose
      title="Unlock Your Notes"
      description="Enter your encryption passphrase to decrypt your notes."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Info banner */}
        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3">
          <div className="flex gap-2.5 items-start">
            <span className="text-primary-400 mt-0.5">🔒</span>
            <p className="text-xs text-text-muted leading-relaxed">
              Your key was cleared when you closed or refreshed the tab.
              Re-entering your passphrase re-derives the key in your browser —
              it is never sent to the server.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger-400 font-medium">
            {error}
          </p>
        )}

        <Input
          id="unlock-passphrase"
          type={show ? 'text' : 'password'}
          label="Passphrase"
          placeholder="Your encryption passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          autoComplete="current-password"
          autoFocus
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Hide passphrase' : 'Show passphrase'}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              {show ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        <div className="flex items-center gap-2 mt-1">
          <input
            id="remember-session"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-surface-elevated text-primary-600 focus:ring-primary-500 focus:ring-offset-background"
          />
          <label htmlFor="remember-session" className="text-xs text-text-secondary select-none cursor-pointer">
            Remember passphrase in this tab (persists page refresh)
          </label>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          leftIcon={<span>🔓</span>}
        >
          Unlock Notes
        </Button>
      </form>
    </Modal>
  )
}
