import type { Database } from './database'

export type FolderRow = Database['public']['Tables']['folders']['Row']

export interface Folder extends FolderRow {
  // Derived / client-side fields
  noteCount?: number
}
