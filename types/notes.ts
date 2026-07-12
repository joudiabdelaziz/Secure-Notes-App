import type { Database } from './database'

export type NoteRow = Database['public']['Tables']['notes']['Row']

/** A note as it lives in the database — body is ciphertext */
export interface Note extends NoteRow {
  /** Decrypted body — only populated on the client after unlock */
  decryptedBody?: string
}

/** Shape used when creating/updating a note from the client */
export interface NotePayload {
  title: string
  ciphertext: string
  iv: string
  tags: string[]
  folder_id: string | null
}

/** Shape used in the notes list (no body needed) */
export type NoteListItem = Pick<
  NoteRow,
  'id' | 'title' | 'tags' | 'folder_id' | 'created_at' | 'updated_at'
>
