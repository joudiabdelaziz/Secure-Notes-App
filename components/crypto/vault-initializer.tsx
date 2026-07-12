'use client'

import { useState, useEffect } from 'react'
import { hasKey, getSessionPassphrase, setKey } from '@/lib/crypto/key-store'
import { deriveKey } from '@/lib/crypto/key-derivation'
import { decrypt } from '@/lib/crypto/encryption'
import { PassphraseUnlockModal } from './passphrase-unlock-modal'

interface VaultInitializerProps {
  userId: string
  sampleNote?: {
    ciphertext: string
    iv: string
  }
}

export function VaultInitializer({ userId, sampleNote }: VaultInitializerProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // If vault is already unlocked in-memory, do nothing
    if (hasKey()) return

    // If there are no notes in the database, the user doesn't need to unlock.
    // They will be prompted to set up their passphrase when they create a note.
    if (!sampleNote) return

    // Check if passphrase is cached in sessionStorage (tab refresh recovery)
    const cachedPassphrase = getSessionPassphrase()
    if (cachedPassphrase) {
      const autoUnlock = async () => {
        try {
          const key = await deriveKey(cachedPassphrase, userId)
          await decrypt(sampleNote.ciphertext, sampleNote.iv, key)
          setKey(key)
        } catch {
          // Stale cache — show unlock prompt
          setOpen(true)
        }
      }
      void autoUnlock()
    } else {
      // No cache — show unlock prompt immediately on entry
      setOpen(true)
    }
  }, [userId, sampleNote])

  if (!open || hasKey() || !sampleNote) return null

  return (
    <PassphraseUnlockModal
      open={open}
      userId={userId}
      testCiphertext={sampleNote.ciphertext}
      testIv={sampleNote.iv}
      onSuccess={() => setOpen(false)}
    />
  )
}
