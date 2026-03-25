import { NextResponse } from 'next/server'

export function proxy(request) {
  const token = request.cookies.get('dbs_token')?.value
  const { pathname } = request.nextUrl

  console.log(`[Proxy] Path: ${pathname}, Auth: ${!!token}`)

  // Define public and private paths
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin-login')
  const isPublicFile = pathname.match(/\.(.*)$/)
  
  // Logic:
  // 1. If trying to access dashboard WITHOUT token -> redirect to /login
  if (!token && !isAuthPage && !isPublicFile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If trying to access /login WITH token -> redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  return NextResponse.next()
}

// Middleware poke
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
