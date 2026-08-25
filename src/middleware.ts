import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware — admin session guard & logout redirect.
 *
 * Payload 3 + Next.js App Router renders a static "Has cerrado sesión correctamente"
 * screen at /admin/logout instead of redirecting directly to /admin/login.
 * Furthermore, client-side cached views may leave an unauthenticated user on a
 * stale admin route.
 *
 * This middleware:
 * 1. Intercepts `/admin/logout` and immediately redirects to `/admin/login`.
 * 2. Clears the `payload-token` cookie explicitly on the response.
 * 3. Enforces that any request to `/admin/*` without an active `payload-token`
 *    cookie is immediately redirected to `/admin/login`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. If navigating to /admin/logout (Payload's post-logout landing route):
  // Immediately redirect to /admin/login and ensure the cookie is cleared.
  if (pathname === '/admin/logout' || pathname.startsWith('/admin/logout/')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = ''

    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('payload-token')
    return response
  }

  // 2. Allow public auth views without checking for session token.
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname.startsWith('/admin/create-first-user') ||
    pathname.startsWith('/admin/forgot') ||
    pathname.startsWith('/admin/reset')
  ) {
    return NextResponse.next()
  }

  // 3. For any other /admin view: verify session token cookie.
  const token = request.cookies.get('payload-token')

  if (!token?.value) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  /*
   * Standard Next.js matcher for all admin subpaths.
   * Path filtering is handled cleanly inside the middleware function above.
   */
  matcher: ['/admin', '/admin/:path*'],
}

