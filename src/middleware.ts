import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const expectedToken = process.env.ADMIN_DASHBOARD_TOKEN
    if (!expectedToken) {
      console.warn('ADMIN_DASHBOARD_TOKEN not configured; dashboard guard disabled.')
      return NextResponse.next()
    }

    const hasBypass = request.cookies.get('glow_admin_token')?.value === expectedToken
    if (!hasBypass) {
      const redirectUrl = new URL('/dashboard/login', request.url)
      redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
