import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateToken } from './lib/server-auth'
import { routeAccessMap } from './lib/settings'

function checkRouteAccess(path: string, userRole: string): boolean {
  for (const [pattern, roles] of Object.entries(routeAccessMap)) {
    if (new RegExp(`^${pattern}$`).test(path)) {
      return roles.includes(userRole)
    }
  }
  return false
}

export function middleware(request: NextRequest) {
  // Always allow static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get('auth-token')
  const isAuthPage = request.nextUrl.pathname === '/sign-in'
  const isHomePage = request.nextUrl.pathname === '/'

  // Handle auth page and home page separately
  if (isAuthPage || isHomePage) {
    if (authToken) {
      const decoded = validateToken(authToken.value)
      if (decoded) {
        return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
      }
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.cookies.delete('auth-token')
      return response
    }
    return NextResponse.next()
  }

  // Handle protected routes
  if (!authToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const decoded = validateToken(authToken.value)
  if (!decoded) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Check role-based access
  if (!checkRouteAccess(request.nextUrl.pathname, decoded.role)) {
    console.log(`Access denied: ${decoded.role} cannot access ${request.nextUrl.pathname}`)
    return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
