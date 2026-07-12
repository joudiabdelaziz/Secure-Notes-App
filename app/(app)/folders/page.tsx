import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFolders } from '@/lib/actions/folders'
import { FolderManager } from '@/components/folders/folder-manager'

export const metadata: Metadata = {
  title: 'Manage Folders',
  robots: { index: false },
}

export default async function FoldersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const foldersResult = await getFolders()
  const folders = foldersResult.success ? foldersResult.data : []

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Manage Folders</h1>
        <p className="text-sm text-text-muted mt-1">
          Organise your encrypted notes into folders.
        </p>
      </div>
      <FolderManager folders={folders} />
    </div>
  )
}
