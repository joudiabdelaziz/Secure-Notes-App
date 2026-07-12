import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFolders } from '@/lib/actions/folders'
import { getNotes } from '@/lib/actions/notes'
import { Sidebar } from '@/components/layout/sidebar'
import { VaultInitializer } from '@/components/crypto/vault-initializer'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch folders and notes for sidebar
  const [foldersResult, notesResult] = await Promise.all([
    getFolders(),
    getNotes(),
  ])

  const folders = foldersResult.success ? foldersResult.data : []
  const notes = notesResult.success ? notesResult.data : []

  // Collect all unique tags across all notes
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort()

  // Fetch a sample note directly to initialize the vault unlock test note (keeps NoteListItem lightweight)
  const { data: sampleNotes } = await supabase
    .from('notes')
    .select('ciphertext, iv')
    .limit(1)

  const sampleNote = sampleNotes && sampleNotes.length > 0 ? sampleNotes[0] : undefined

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Vault auto unlocker/prompt */}
      <VaultInitializer userId={user.id} sampleNote={sampleNote} />

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col">
        <Sidebar
          folders={folders}
          allTags={allTags}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
          <span className="font-bold text-text-primary flex items-center gap-2">
            <span>🔒</span> SecureNotes
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
