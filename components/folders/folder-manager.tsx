'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateFolder, deleteFolder } from '@/lib/actions/folders'
import { CreateFolderModal } from './create-folder-modal'
import { ConfirmModal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { Folder } from '@/types/folders'

interface FolderManagerProps {
  folders: Folder[]
}

export function FolderManager({ folders }: FolderManagerProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRename(folder: Folder) {
    if (!editName.trim() || editName.trim() === folder.name) {
      setEditingId(null)
      return
    }
    setLoading(true)
    try {
      const result = await updateFolder(folder.id, { name: editName.trim() })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Folder renamed')
      setEditingId(null)
      router.refresh()
    } catch {
      toast.error('Failed to rename folder.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    try {
      const result = await deleteFolder(deletingId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Folder deleted. Notes moved to "All Notes".')
      setDeleteConfirmOpen(false)
      setDeletingId(null)
      router.refresh()
    } catch {
      toast.error('Failed to delete folder.')
    } finally {
      setLoading(false)
    }
  }

  const deletingFolder = folders.find((f) => f.id === deletingId)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-text-muted">{folders.length} folder{folders.length !== 1 ? 's' : ''}</span>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Folder
        </Button>
      </div>

      {folders.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          }
          title="No folders yet"
          description="Create a folder to organise your encrypted notes."
          action={
            <Button onClick={() => setCreateOpen(true)}>Create Folder</Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface hover:border-border-subtle transition-colors"
            >
              <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>

              {editingId === folder.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(folder)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(folder)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none border-b border-primary-500"
                  maxLength={100}
                />
              ) : (
                <span className="flex-1 text-sm text-text-primary truncate">
                  {folder.name}
                </span>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(folder.id)
                    setEditName(folder.name)
                  }}
                  aria-label={`Rename ${folder.name}`}
                  className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setDeletingId(folder.id)
                    setDeleteConfirmOpen(true)
                  }}
                  aria-label={`Delete ${folder.name}`}
                  className="p-1.5 rounded-md text-text-muted hover:text-danger-400 hover:bg-danger-600/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateFolderModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeletingId(null) }}
        onConfirm={handleDelete}
        title="Delete folder?"
        description={`"${deletingFolder?.name}" will be deleted. Notes inside will be moved to All Notes.`}
        confirmLabel="Delete Folder"
        loading={loading}
      />
    </>
  )
}
