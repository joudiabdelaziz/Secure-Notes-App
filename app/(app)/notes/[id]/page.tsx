import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNoteById } from '@/lib/actions/notes'
import { getFolders } from '@/lib/actions/folders'
import { decrypt } from '@/lib/crypto/encryption'
import { getKey } from '@/lib/crypto/key-store'
import { NoteEditor } from '@/components/notes/note-editor'
import { getNotes } from '@/lib/actions/notes'
import { NoteList } from '@/components/notes/note-list'

interface NotePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getNoteById(id)
  return {
    title: result.success ? result.data.title : 'Note',
    robots: { index: false },  // Private content — never indexed
  }
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [noteResult, foldersResult, notesResult] = await Promise.all([
    getNoteById(id),
    getFolders(),
    getNotes(),
  ])

  if (!noteResult.success) notFound()

  const note = noteResult.data
  const folders = foldersResult.success ? foldersResult.data : []
  const notes = notesResult.success ? notesResult.data : []

  // Attempt to decrypt on the server — key won't be available here (server-side),
  // so this will always be undefined.  Decryption happens client-side in NoteEditor.
  // The key is intentionally never available on the server.
  let initialBody: string | undefined
  const serverKey = getKey()
  if (serverKey) {
    try {
      initialBody = await decrypt(note.ciphertext, note.iv, serverKey)
    } catch {
      // Graceful — NoteEditor will prompt for passphrase
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Note list panel */}
      <div className="hidden md:flex md:w-80 lg:w-96 border-r border-border flex-col overflow-hidden">
        <NoteList notes={notes} activeNoteId={id} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <NoteEditor
          note={note}
          initialBody={initialBody}
          folders={folders}
          userId={user.id}
        />
      </div>
    </div>
  )
}
