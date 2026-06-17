import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getAppOrigin, getCanonicalHostRedirect, isProtectedAppPath } from '@/lib/domain-routing'

export async function middleware(request: NextRequest) {
  const earlyCanonicalRedirect = getCanonicalHostRedirect(request.nextUrl)
  if (earlyCanonicalRedirect && !(request.nextUrl.hostname === new URL(getAppOrigin()).hostname && request.nextUrl.pathname === '/')) {
    return NextResponse.redirect(earlyCanonicalRedirect)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const canonicalRedirect = getCanonicalHostRedirect(request.nextUrl, Boolean(user))
  if (canonicalRedirect) {
    return NextResponse.redirect(canonicalRedirect)
  }

  if (isProtectedAppPath(request.nextUrl.pathname) && !user) {
    const url = new URL('/auth', getAppOrigin())
    url.pathname = '/auth'
    url.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth page
  if (request.nextUrl.pathname === '/auth' && user) {
    const url = new URL('/dashboard', getAppOrigin())
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|cdn/|widget/).*)',
  ],
}
