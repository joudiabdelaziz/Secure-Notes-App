import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFolders } from '@/lib/actions/folders'
import { NoteEditor } from '@/components/notes/note-editor'

export const metadata: Metadata = {
  title: 'New Note',
  robots: { index: false },
}

export default async function NewNotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const foldersResult = await getFolders()
  const folders = foldersResult.success ? foldersResult.data : []

  return (
    <div className="flex h-full overflow-hidden">
      {/* Note list panel placeholder (empty on new note) */}
      <div className="hidden md:flex md:w-80 lg:w-96 border-r border-border items-center justify-center text-text-muted text-sm">
        Select or search for a note
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <NoteEditor
          folders={folders}
          userId={user.id}
          isNewNote
        />
      </div>
    </div>
  )
}
