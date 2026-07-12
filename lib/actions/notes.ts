'use server'

import { z } from 'zod'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createNoteServerSchema, updateNoteServerSchema } from '@/lib/validation/notes'
import type { NoteListItem, NoteRow } from '@/types/notes'

// ─────────────────────────────────────────────────────────────
// Type for structured Server Action responses
// ─────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ─────────────────────────────────────────────────────────────
// Helper — get authenticated user or throw
// ─────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────
// List notes for the authenticated user
// ─────────────────────────────────────────────────────────────

export async function getNotes(): Promise<ActionResult<NoteListItem[]>> {
  try {
    const { supabase } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, tags, folder_id, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data ?? [] }
  } catch (err) {
    console.error('[getNotes]', err)
    return { success: false, error: 'Failed to load notes. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Get a single note by ID
// ─────────────────────────────────────────────────────────────

export async function getNoteById(id: string): Promise<ActionResult<NoteRow>> {
  try {
    const { supabase } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Note not found.' }
      }
      throw error
    }

    return { success: true, data }
  } catch (err) {
    console.error('[getNoteById]', err)
    return { success: false, error: 'Failed to load note. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Create a new note
// ─────────────────────────────────────────────────────────────

export async function createNote(
  payload: unknown,
): Promise<ActionResult<NoteRow>> {
  const parsed = createNoteServerSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid note data.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const { supabase, user } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,   // Always set from the server; client cannot forge this
        ...parsed.data,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/notes')
    return { success: true, data }
  } catch (err) {
    console.error('[createNote]', err)
    return { success: false, error: 'Failed to create note. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Update an existing note
// ─────────────────────────────────────────────────────────────

export async function updateNote(
  payload: unknown,
): Promise<ActionResult<NoteRow>> {
  const parsed = updateNoteServerSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid update data.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { id, ...updates } = parsed.data

  try {
    const { supabase } = await getAuthenticatedUser()

    // RLS ensures the update only succeeds if auth.uid() = user_id.
    // Even if a client guesses another user's note ID, this query returns 0 rows.
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Note not found or access denied.' }
      }
      throw error
    }

    revalidatePath('/notes')
    revalidatePath(`/notes/${id}`)
    return { success: true, data }
  } catch (err) {
    console.error('[updateNote]', err)
    return { success: false, error: 'Failed to update note. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Delete a note
// ─────────────────────────────────────────────────────────────

export async function deleteNote(id: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id)
  if (!idValidation.success) {
    return { success: false, error: 'Invalid note ID.' }
  }

  try {
    const { supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/notes')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[deleteNote]', err)
    return { success: false, error: 'Failed to delete note. Please try again.' }
  }
}
