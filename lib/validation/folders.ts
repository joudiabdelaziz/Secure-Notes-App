import { z } from 'zod'
import { folderSchema } from '@/lib/validation/notes'

export { folderSchema }
export type FolderInput = z.infer<typeof folderSchema>
