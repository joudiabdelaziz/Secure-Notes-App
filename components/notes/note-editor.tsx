'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createNoteSchema, type CreateNoteInput } from '@/lib/validation/notes'
import { createNote, updateNote, deleteNote } from '@/lib/actions/notes'
import { encrypt, decrypt } from '@/lib/crypto/encryption'
import { getKey } from '@/lib/crypto/key-store'
import { PassphraseSetupModal } from '@/components/crypto/passphrase-setup-modal'
import { PassphraseUnlockModal } from '@/components/crypto/passphrase-unlock-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ConfirmModal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import type { NoteRow } from '@/types/notes'
import type { Folder } from '@/types/folders'

const MAX_BODY = 50_000

interface NoteEditorProps {
  /** Existing note for edit mode; undefined for new note */
  note?: NoteRow
  /** Decrypted body (only available if key was in memory at load time) */
  initialBody?: string
  folders: Folder[]
  userId: string
  isNewNote?: boolean
}

export function NoteEditor({
  note,
  initialBody = '',
  folders,
  userId,
  isNewNote = false,
}: NoteEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(initialBody)
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState<string | null>(note?.folder_id ?? null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateNoteInput, string>>>({})

  // Passphrase modal state
  const [needsSetup, setNeedsSetup] = useState(false)
  const [needsUnlock, setNeedsUnlock] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  // Sync editor fields and decrypt body when active note or key state changes
  useEffect(() => {
    if (isNewNote || !note) {
      setBody('')
      setTitle('')
      setTags([])
      setFolderId(null)
      return
    }

    // Set metadata in cleartext
    setTitle(note.title)
    setTags(note.tags)
    setFolderId(note.folder_id)

    const key = getKey()
    if (key) {
      const runDecrypt = async () => {
        try {
          const decrypted = await decrypt(note.ciphertext, note.iv, key)
          setBody(decrypted)
        } catch {
          toast.error('Failed to decrypt note body. Please verify your passphrase.')
        }
      }
      void runDecrypt()
    } else {
      setNeedsUnlock(true)
    }
  }, [note, isNewNote])

  // Use a mutable ref to hold the latest performSave logic to avoid re-binding event listener on keystrokes
  const performSaveRef = useRef(performSave)
  useEffect(() => {
    performSaveRef.current = performSave
  })

  // Ctrl + S (or Cmd + S) keyboard shortcut to save the note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void performSaveRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])


  const validate = useCallback((): boolean => {
    const result = createNoteSchema.safeParse({ title, body, tags, folder_id: folderId })
    if (!result.success) {
      const errors: Partial<Record<keyof CreateNoteInput, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateNoteInput
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      return false
    }
    setFieldErrors({})
    return true
  }, [title, body, tags, folderId])

  async function performSave() {
    if (!validate()) return

    const key = getKey()
    if (!key) {
      // No key — determine whether to show setup or unlock
      if (isNewNote && !note) {
        setNeedsSetup(true)
      } else {
        setNeedsUnlock(true)
      }
      setPendingSave(true)
      return
    }

    setSaving(true)
    try {
      // Encrypt body client-side — plaintext NEVER sent to server
      const { ciphertext, iv } = await encrypt(body, key)

      const payload = { title, ciphertext, iv, tags, folder_id: folderId }

      let result
      if (note) {
        result = await updateNote({ id: note.id, ...payload })
      } else {
        result = await createNote(payload)
      }

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(note ? 'Note saved' : 'Note created')
      if (isNewNote && result.success && 'data' in result) {
        router.push(`/notes/${result.data.id}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePassphraseReady() {
    setNeedsSetup(false)
    setNeedsUnlock(false)

    // Decrypt the note body immediately with the new key
    const key = getKey()
    if (key && note && !isNewNote) {
      try {
        const decrypted = await decrypt(note.ciphertext, note.iv, key)
        setBody(decrypted)
      } catch {
        toast.error('Failed to decrypt note body.')
      }
    }

    if (pendingSave) {
      setPendingSave(false)
      void performSave()
    }
  }

  async function handleDelete() {
    if (!note) return
    setDeleting(true)
    try {
      const result = await deleteNote(note.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Note deleted')
      router.push('/notes')
      router.refresh()
    } catch {
      toast.error('Failed to delete note.')
    } finally {
      setDeleting(false)
      setConfirmDeleteOpen(false)
    }
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
      if (newTag && !tags.includes(newTag) && tags.length < 20) {
        setTags([...tags, newTag])
        setTagInput('')
      }
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <>
      {/* Passphrase modals */}
      <PassphraseSetupModal
        open={needsSetup}
        userId={userId}
        onSuccess={handlePassphraseReady}
      />
      {needsUnlock && note && (
        <PassphraseUnlockModal
          open={needsUnlock}
          userId={userId}
          testCiphertext={note.ciphertext}
          testIv={note.iv}
          onSuccess={handlePassphraseReady}
        />
      )}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete note?"
        description={`"${title}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete Note"
        loading={deleting}
      />

      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            {note && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                className="text-danger-400 hover:text-danger-300 hover:bg-danger-600/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            )}
            <Button
              size="sm"
              loading={saving}
              onClick={performSave}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              }
            >
              Save Note
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {/* Title */}
          <Input
            id="note-title"
            label="Title"
            placeholder="Note title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title}
            className="text-base font-semibold"
            maxLength={300}
          />

          {/* Folder + Tags row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="note-folder" className="text-sm font-medium text-text-secondary block mb-1.5">
                Folder
              </label>
              <select
                id="note-folder"
                value={folderId ?? ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className={cn(
                  'h-10 w-full rounded-md border border-border bg-surface-elevated px-3 text-sm',
                  'text-text-primary focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                  'transition-colors',
                )}
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[220px]">
              <label htmlFor="tag-input" className="text-sm font-medium text-text-secondary block mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] rounded-md border border-border bg-surface-elevated px-2 py-1 items-center">
                {tags.map((tag) => (
                  <Badge key={tag} variant="primary" onRemove={() => removeTag(tag)}>
                    #{tag}
                  </Badge>
                ))}
                <input
                  id="tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length < 20 ? 'Add tag…' : 'Max 20 tags'}
                  disabled={tags.length >= 20}
                  className="flex-1 min-w-[80px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">Press Enter or comma to add</p>
              {fieldErrors.tags && (
                <p className="text-xs text-danger-400 mt-1" role="alert">{fieldErrors.tags}</p>
              )}
            </div>
          </div>

          {/* Body */}
          <Textarea
            id="note-body"
            label="Note"
            placeholder="Start writing your encrypted note…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            error={fieldErrors.body}
            showCount
            maxLength={MAX_BODY}
            className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed"
          />

          {/* Encryption badge */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-elevated border border-border w-fit">
            <span className="text-primary-400">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-xs text-text-muted">
              Encrypted with AES-GCM before saving · Your passphrase never leaves your device
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
