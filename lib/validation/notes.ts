import { z } from 'zod'

const MAX_TITLE_LENGTH = 300
const MAX_BODY_LENGTH = 50_000
const MAX_TAG_LENGTH = 50
const MAX_TAGS = 20
const MAX_FOLDER_NAME_LENGTH = 100

export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(MAX_TAG_LENGTH, `Tag must be under ${MAX_TAG_LENGTH} characters`)
  .regex(/^[a-z0-9-_]+$/, 'Tags can only contain lowercase letters, numbers, hyphens, and underscores')

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(MAX_TITLE_LENGTH, `Title must be under ${MAX_TITLE_LENGTH} characters`),
  /** Plaintext body — validated before encryption on the client */
  body: z
    .string()
    .min(1, 'Note body cannot be empty')
    .max(MAX_BODY_LENGTH, `Note body must be under ${MAX_BODY_LENGTH.toLocaleString()} characters`),
  tags: z
    .array(tagSchema)
    .max(MAX_TAGS, `You can add at most ${MAX_TAGS} tags`),
  folder_id: z.string().uuid('Invalid folder ID').nullable(),
})

/** Shape sent to the server — body is replaced with encrypted fields */
export const createNoteServerSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(MAX_TITLE_LENGTH),
  ciphertext: z.string().min(1, 'Ciphertext is required'),
  iv: z.string().min(1, 'IV is required'),
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH))
    .max(MAX_TAGS)
    .default([]),
  folder_id: z.string().uuid().nullable().default(null),
})

export const updateNoteServerSchema = createNoteServerSchema.partial().extend({
  id: z.string().uuid('Invalid note ID'),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type CreateNoteServerInput = z.infer<typeof createNoteServerSchema>
export type UpdateNoteServerInput = z.infer<typeof updateNoteServerSchema>

export const folderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(MAX_FOLDER_NAME_LENGTH, `Folder name must be under ${MAX_FOLDER_NAME_LENGTH} characters`),
})

export type FolderInput = z.infer<typeof folderSchema>
