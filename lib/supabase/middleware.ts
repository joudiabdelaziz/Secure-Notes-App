import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Refreshes the Supabase session and enforces route protection.
 *
 * Called from middleware.ts on every matched request.
 * - Unauthenticated users attempting to access /notes/* or /folders/*
 *   are redirected to /login.
 * - Authenticated users attempting to access /login or /signup
 *   are redirected to /notes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: must call getUser() (not getSession()) to validate the JWT
  // server-side and prevent spoofed cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Protected routes ──────────────────────────────────────
  const isProtectedRoute =
    pathname.startsWith('/notes') || pathname.startsWith('/folders')

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Auth routes (redirect away if already logged in) ──────
  const isAuthRoute =
    pathname === '/login' || pathname === '/signup'

  if (isAuthRoute && user) {
    const notesUrl = request.nextUrl.clone()
    notesUrl.pathname = '/notes'
    return NextResponse.redirect(notesUrl)
  }

  return supabaseResponse
}
