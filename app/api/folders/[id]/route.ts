import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { folderSchema } from '@/lib/validation/folders'

const idSchema = z.string().uuid()

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const idParsed = idSchema.safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid folder ID.' }, { status: 400 })
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

  const parsed = folderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { data, error } = await supabase
    .from('folders')
    .update({ name: parsed.data.name })
    .eq('id', idParsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Folder not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update folder.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const idParsed = idSchema.safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid folder ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', idParsed.data)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete folder.' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
