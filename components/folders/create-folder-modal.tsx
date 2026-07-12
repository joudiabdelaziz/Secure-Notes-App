'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createFolder } from '@/lib/actions/folders'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface CreateFolderModalProps {
  open: boolean
  onClose: () => void
}

export function CreateFolderModal({ open, onClose }: CreateFolderModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Folder name is required.')
      return
    }

    setLoading(true)
    try {
      const result = await createFolder({ name: name.trim() })
      if (!result.success) {
        setError(result.error)
        return
      }
      toast.success(`Folder "${name.trim()}" created`)
      setName('')
      onClose()
      router.refresh()
    } catch {
      setError('Failed to create folder. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setName('')
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Folder">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-danger-400">
            {error}
          </p>
        )}
        <Input
          id="folder-name"
          label="Folder name"
          placeholder="e.g. Work, Personal, Ideas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={undefined}
          autoFocus
          maxLength={100}
          required
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  )
}
