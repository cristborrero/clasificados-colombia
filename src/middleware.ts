import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware — proxy header normalisation & logout redirect.
 *
 * 1. Sanitises multi-value `x-forwarded-host`, `x-forwarded-proto` and `host` headers
 *    caused by chained reverse proxies (Cloudflare -> LiteSpeed -> Docker).
 * 2. Intercepts `/admin/logout` and immediately redirects to `/admin/login`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  let headersModified = false

  const forwardedHost = requestHeaders.get('x-forwarded-host')
  if (forwardedHost && forwardedHost.includes(',')) {
    const first = forwardedHost.split(',')[0]?.trim()
    if (first) {
      requestHeaders.set('x-forwarded-host', first)
      headersModified = true
    }
  }

  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  if (forwardedProto && forwardedProto.includes(',')) {
    const first = forwardedProto.split(',')[0]?.trim()
    if (first) {
      requestHeaders.set('x-forwarded-proto', first)
      headersModified = true
    }
  }

  const host = requestHeaders.get('host')
  if (host && host.includes(',')) {
    const first = host.split(',')[0]?.trim()
    if (first) {
      requestHeaders.set('host', first)
      headersModified = true
    }
  }

  // 1. If navigating to /admin/logout (Payload's post-logout landing route):
  // Immediately redirect to /admin/login and ensure the cookie is cleared.
  if (pathname === '/admin/logout' || pathname.startsWith('/admin/logout/')) {
    const loginUrl = new URL('/admin/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('payload-token')
    return response
  }

  if (headersModified) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


