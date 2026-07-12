'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { folderSchema } from '@/lib/validation/folders'
import type { Folder } from '@/types/folders'
import type { ActionResult } from './notes'

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
// List folders for the authenticated user
// ─────────────────────────────────────────────────────────────

export async function getFolders(): Promise<ActionResult<Folder[]>> {
  try {
    const { supabase } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return { success: true, data: data ?? [] }
  } catch (err) {
    console.error('[getFolders]', err)
    return { success: false, error: 'Failed to load folders. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Create a folder
// ─────────────────────────────────────────────────────────────

export async function createFolder(
  payload: unknown,
): Promise<ActionResult<Folder>> {
  const parsed = folderSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid folder data.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const { supabase, user } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/notes')
    revalidatePath('/folders')
    return { success: true, data }
  } catch (err) {
    console.error('[createFolder]', err)
    return { success: false, error: 'Failed to create folder. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Update a folder name
// ─────────────────────────────────────────────────────────────

export async function updateFolder(
  id: string,
  payload: unknown,
): Promise<ActionResult<Folder>> {
  const idValidation = z.string().uuid().safeParse(id)
  if (!idValidation.success) {
    return { success: false, error: 'Invalid folder ID.' }
  }

  const parsed = folderSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid folder data.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const { supabase } = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('folders')
      .update({ name: parsed.data.name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/notes')
    revalidatePath('/folders')
    return { success: true, data }
  } catch (err) {
    console.error('[updateFolder]', err)
    return { success: false, error: 'Failed to update folder. Please try again.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Delete a folder
// Notes with this folder_id will have folder_id set to NULL (ON DELETE SET NULL)
// ─────────────────────────────────────────────────────────────

export async function deleteFolder(id: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id)
  if (!idValidation.success) {
    return { success: false, error: 'Invalid folder ID.' }
  }

  try {
    const { supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/notes')
    revalidatePath('/folders')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[deleteFolder]', err)
    return { success: false, error: 'Failed to delete folder. Please try again.' }
  }
}
