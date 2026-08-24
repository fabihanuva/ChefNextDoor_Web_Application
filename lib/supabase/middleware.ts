import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Runs on every request (see root middleware.ts).
 * 1. Refreshes the Supabase session cookie.
 * 2. Blocks unauthenticated users from customer/chef routes.
 * 3. Redirects customers away from chef routes and vice versa.
 * 4. Guards /admin/* by checking membership in tbl_admin directly —
 *    NOT by role on tbl_users, since Admin is a standalone entity.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not run other code between createServerClient and this call
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const isCustomerRoute =
    path.startsWith('/browse') ||
    path.startsWith('/cart') ||
    path.startsWith('/checkout') ||
    path.startsWith('/orders') ||
    path.startsWith('/favorites') ||
    path.startsWith('/profile')

  const isChefRoute = path.startsWith('/chef')
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login'

  // --- Customer / Chef routes ---
  if (!user && (isCustomerRoute || isChefRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  if (user && (isCustomerRoute || isChefRoute)) {
    const role = user.user_metadata?.role as 'customer' | 'chef' | undefined

    if (isChefRoute && role !== 'chef') {
      const url = request.nextUrl.clone()
      url.pathname = '/browse'
      return NextResponse.redirect(url)
    }
    if (isCustomerRoute && role !== 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/chef/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // --- Admin routes (standalone entity, checked against tbl_admin) ---
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    const { data: admin } = await supabase
      .from('tbl_admin')
      .select('adm_id')
      .eq('adm_email', user.email)
      .single()

    if (!admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: always return supabaseResponse as-is (or a redirect built from it)
  return supabaseResponse
}
