'use client'

import { useState, useMemo } from 'react'
import { NoteCard } from './note-card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import type { NoteListItem } from '@/types/notes'

interface NoteListProps {
  notes: NoteListItem[]
  activeNoteId?: string
  activeFolderId?: string | null
  activeTag?: string | null
}

export function NoteList({
  notes,
  activeNoteId,
  activeFolderId,
  activeTag,
}: NoteListProps) {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    activeTag ? [activeTag] : [],
  )

  // Collect all unique tags from the filtered-by-folder set
  const folderNotes = useMemo(
    () =>
      activeFolderId
        ? notes.filter((n) => n.folder_id === activeFolderId)
        : notes,
    [notes, activeFolderId],
  )

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    folderNotes.forEach((n) => n.tags.forEach((t) => tags.add(t)))
    return [...tags].sort()
  }, [folderNotes])

  // Filter by search + selected tags
  const filtered = useMemo(() => {
    let result = folderNotes

    // Title search — plain string.includes(), no decryption needed (titles are cleartext)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((n) => n.title.toLowerCase().includes(q))
    }

    // Tag filter — AND logic
    if (selectedTags.length > 0) {
      result = result.filter((n) =>
        selectedTags.every((tag) => n.tags.includes(tag)),
      )
    }

    return result
  }, [folderNotes, search, selectedTags])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id="note-search"
            type="search"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface-elevated pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="transition-all duration-150"
              >
                <Badge
                  variant={selectedTags.includes(tag) ? 'primary' : 'default'}
                  className="cursor-pointer hover:opacity-80"
                >
                  #{tag}
                  {selectedTags.includes(tag) && (
                    <span className="ml-0.5">×</span>
                  )}
                </Badge>
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-text-muted hover:text-text-secondary underline transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Note count */}
      <div className="px-4 py-2 border-b border-border">
        <span className="text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title={
              search || selectedTags.length > 0
                ? 'No matching notes'
                : 'No notes yet'
            }
            description={
              search || selectedTags.length > 0
                ? 'Try a different search term or clear the filters.'
                : 'Create your first encrypted note using the button above.'
            }
          />
        ) : (
          filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              active={note.id === activeNoteId}
            />
          ))
        )}
      </div>
    </div>
  )
}
