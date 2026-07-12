import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { folderSchema } from '@/lib/validation/folders'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch folders.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

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

  const parsed = folderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { data, error } = await supabase
    .from('folders')
    .insert({ user_id: user.id, name: parsed.data.name })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create folder.' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
