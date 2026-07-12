import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase server client that reads session from cookies.
 *
 * Must be called inside a Server Component, Route Handler, or Server Action
 * where `next/headers` is available.
 *
 * Handles both reading and writing cookies so that the session is
 * automatically refreshed when the access token expires.
 */
export async function createClient(): Promise<SupabaseClient<Database, 'public', 'public', Database['public']>> {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll() can be called from a Server Component where cookies
            // are read-only.  The middleware handles session refresh in that case.
          }
        },
      },
    },
  ) as unknown as SupabaseClient<Database, 'public', 'public', Database['public']>
}
