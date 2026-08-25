import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware — admin session guard.
 *
 * Payload 3 + Next.js App Router has a known issue where the admin panel's
 * React client may not redirect to the login page after a successful logout.
 * The server clears the `payload-token` cookie, but the client-side Router
 * Cache continues to show the previous admin page.
 *
 * This middleware runs on the edge and checks for the authentication cookie
 * before the admin page is even rendered. If the cookie is missing, the
 * middleware redirects to `/admin/login` with a `redirect` query parameter
 * so Payload knows where to send the user after they log in again.
 *
 * This does NOT replace Payload's own auth — it is a belt-and-suspenders
 * redirect that ensures the browser navigates to the login page when the
 * session is gone, regardless of what the React client decides to do.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard the admin panel, not the login/logout pages themselves.
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/logout') ||
    pathname.startsWith('/admin/create-first-user')
  ) {
    return NextResponse.next()
  }

  // The cookie name Payload uses by default for auth collections.
  const token = request.cookies.get('payload-token')

  if (!token?.value) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  /*
   * Only run on admin routes. API routes, public pages, static assets, and
   * Next.js internals are excluded so they never pay the middleware cost.
   */
  matcher: ['/admin', '/admin/((?!api|_next|login|logout|create-first-user).*)'],
}
