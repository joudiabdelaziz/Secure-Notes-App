import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNotes } from '@/lib/actions/notes'
import { getFolders } from '@/lib/actions/folders'
import { NoteList } from '@/components/notes/note-list'
import { EmptyState } from '@/components/ui/empty-state'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Notes',
  robots: { index: false },
}

interface NotesPageProps {
  searchParams: Promise<{ folder?: string; tag?: string }>
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { folder, tag } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [notesResult, foldersResult] = await Promise.all([
    getNotes(),
    getFolders(),
  ])

  if (!notesResult.success) {
    throw new Error(notesResult.error)
  }

  const notes = notesResult.success ? notesResult.data : []
  const folders = foldersResult.success ? foldersResult.data : []

  return (
    <div className="flex h-full overflow-hidden">
      {/* Note list panel */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col shrink-0 overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-sm font-semibold text-text-primary">
            {folder
              ? (folders.find((f) => f.id === folder)?.name ?? 'Folder')
              : tag
              ? `#${tag}`
              : 'All Notes'}
          </h1>
          <Link
            href="/notes/new"
            className="flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
            aria-label="Create new note"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
        </div>

        <NoteList
          notes={notes}
          activeFolderId={folder ?? null}
          activeTag={tag ?? null}
        />
      </div>

      {/* Empty detail panel — shown on desktop when no note is selected */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          }
          title="Select a note to read"
          description="Choose a note from the list, or create a new one."
          action={
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </Link>
          }
        />
      </div>
    </div>
  )
}
