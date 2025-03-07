import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateToken } from './lib/server-auth'

export function middleware(request: NextRequest) {
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

  if (authToken) {
    const decoded = validateToken(authToken.value)
    if (decoded) {
      if (isHomePage || isAuthPage) {
        return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
      }
      return NextResponse.next()
    } else {
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  if (!isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
