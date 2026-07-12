'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { deriveKey } from '@/lib/crypto/key-derivation'
import { setKey, setSessionPassphrase, clearSessionPassphrase } from '@/lib/crypto/key-store'

interface PassphraseSetupModalProps {
  open: boolean
  userId: string
  onSuccess: () => void
}

function getStrength(p: string): number {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.min(s, 4)
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-primary-500', 'bg-success-500']

export function PassphraseSetupModal({
  open,
  userId,
  onSuccess,
}: PassphraseSetupModalProps) {
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const strength = getStrength(passphrase)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters.')
      return
    }
    if (passphrase !== confirm) {
      setError('Passphrases do not match.')
      return
    }

    setLoading(true)
    try {
      const key = await deriveKey(passphrase, userId)
      setKey(key)

      if (remember) {
        setSessionPassphrase(passphrase)
      } else {
        clearSessionPassphrase()
      }

      setPassphrase('')
      setConfirm('')
      onSuccess()
    } catch {
      setError('Failed to set up encryption. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {}} // Cannot close without setting passphrase
      preventBackdropClose
      title="Set Your Encryption Passphrase"
    >
      {/* Warning banner */}
      <div className="mb-5 rounded-lg border border-warning-600/40 bg-warning-600/10 px-4 py-3">
        <div className="flex gap-2.5">
          <span className="text-warning-400 mt-0.5 shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-warning-300">
              Critical: This passphrase cannot be recovered
            </p>
            <p className="text-xs text-warning-400/80 mt-1 leading-relaxed">
              Your passphrase encrypts all your notes locally using AES-GCM.
              We never see it, store it, or transmit it.{' '}
              <strong>If you forget it, your notes are permanently unreadable.</strong>{' '}
              This is a deliberate security feature, not a bug.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-danger-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Input
            id="passphrase-input"
            type={show ? 'text' : 'password'}
            label="Passphrase"
            placeholder="At least 8 characters"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoComplete="new-password"
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
          {/* Strength meter */}
          {passphrase.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength ? strengthColors[strength] : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted w-12 text-right">
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        <Input
          id="passphrase-confirm"
          type={show ? 'text' : 'password'}
          label="Confirm passphrase"
          placeholder="Same as above"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        <div className="flex items-center gap-2 mt-1">
          <input
            id="remember-setup-session"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-surface-elevated text-primary-600 focus:ring-primary-500 focus:ring-offset-background"
          />
          <label htmlFor="remember-setup-session" className="text-xs text-text-secondary select-none cursor-pointer">
            Remember passphrase in this tab (persists page refresh)
          </label>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          leftIcon={<span>🔐</span>}
        >
          Set Encryption Passphrase
        </Button>
      </form>
    </Modal>
  )
}
