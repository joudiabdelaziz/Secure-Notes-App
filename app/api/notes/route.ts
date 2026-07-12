import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNoteServerSchema } from '@/lib/validation/notes'

/**
 * GET /api/notes
 * Returns all notes (id, title, tags, folder_id, timestamps) for the
 * authenticated user.  Body/ciphertext is excluded from the list view
 * to minimise payload size.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notes')
    .select('id, title, tags, folder_id, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[GET /api/notes]', error)
    return NextResponse.json({ error: 'Failed to fetch notes.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/**
 * POST /api/notes
 * Creates a new note.  Expects JSON body matching createNoteServerSchema.
 * user_id is always set from the server session — the client cannot supply it.
 */
export async function POST(request: Request) {
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

  const parsed = createNoteServerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: user.id, ...parsed.data })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/notes]', error)
    return NextResponse.json({ error: 'Failed to create note.' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
