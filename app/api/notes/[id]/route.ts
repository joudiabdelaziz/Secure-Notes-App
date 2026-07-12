import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { updateNoteServerSchema } from '@/lib/validation/notes'

const idSchema = z.string().uuid()

/** GET /api/notes/[id] — Fetch a single note (full ciphertext included) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const idParsed = idSchema.safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid note ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', idParsed.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // RLS returns 0 rows for non-owned notes — we return 404.
      // This prevents user enumeration: an attacker cannot distinguish
      // "note does not exist" from "note belongs to another user."
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to fetch note.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/** PUT /api/notes/[id] — Update a note */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const idParsed = idSchema.safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid note ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = updateNoteServerSchema.safeParse({ id: idParsed.data, ...(body as Record<string, unknown>) })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { id: _id, ...updates } = parsed.data

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', idParsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update note.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/** DELETE /api/notes/[id] — Delete a note */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const idParsed = idSchema.safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid note ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', idParsed.data)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete note.' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
