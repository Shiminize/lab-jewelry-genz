import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { JWT } from 'next-auth/jwt'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, getRateLimitHeaders, AUTH_ERRORS } from '@/lib/jwt-utils'
import { getClientIP, createErrorResponse } from '@/lib/api-utils'
import { generateCSRFToken } from '@/lib/security'
import { trackLatency } from '@/lib/metrics'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key'
const LEGACY_JWT_COOKIE_NAME = 'auth-token'
const NEXT_AUTH_COOKIE_NAMES = ['authjs.session-token', '__Secure-authjs.session-token'] as const

const PUBLIC_ROUTES = new Set([
  '/',
  '/aurora-demo',
  '/catalog',
  '/customizer',
  '/products',
  '/collections',
  '/support',
  '/style-guide',
  '/creators',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
])

const PUBLIC_ROUTE_PREFIXES = [
  '/collections',
  '/products',
  '/catalog',
  '/support',
  '/customizer',
  '/creators',
  '/style-guide',
  '/reset-password',
]

const PUBLIC_API_PREFIXES = [
  '/api/support',
  '/api/concierge',
  '/api/health',
  '/api/dev-analytics',
  '/api/products/validate-price',
  '/api/auth',
]

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/api/dashboard',
  '/api/admin',
  '/api/dev-analytics/collect-secure',
]

const STATIC_RESOURCES = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/public',
]

type AuthToken = JWT & {
  userId?: string
  role?: string
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  if (process.env.NEXT_DISABLE_MIDDLEWARE_AUTH === '1' || process.env.NEXT_DISABLE_MIDDLEWARE === '1') {
    return NextResponse.next()
  }

  try {
    // Skip middleware for static resources
    if (STATIC_RESOURCES.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    const isPublicRoute =
      PUBLIC_ROUTES.has(pathname) ||
      PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

    if (isPublicRoute) {
      const response = NextResponse.next()

      // Add monitoring headers for public routes
      const responseTime = Date.now() - startTime
      response.headers.set('X-Response-Time', `${responseTime}ms`)
      response.headers.set('X-Request-ID', `req_${Math.random().toString(36).slice(2)}`)

      return response
    }

    if (PUBLIC_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return NextResponse.next()
    }

    if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next()
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(
      `auth:${clientIP}`,
      300, // 300 requests per minute
      60 * 1000 // 1 minute window
    )

    if (!rateLimitResult.allowed) {
      const response = createErrorResponse(
        AUTH_ERRORS.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded',
        [],
        429,
        rateLimitResult
      )

      // Add rate limit headers
      const headers = getRateLimitHeaders(rateLimitResult)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    const token = (await getToken({ req: request, secret: JWT_SECRET })) as AuthToken | null

    if (!token) {
      return redirectToLogin(request, 'Authentication required')
    }

    const userId = typeof token.userId === 'string' ? token.userId : (typeof token.sub === 'string' ? token.sub : undefined)
    const email = typeof token.email === 'string' ? token.email : undefined
    const role = typeof token.role === 'string' ? token.role : 'customer'

    if (typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
      return redirectToLogin(request, 'Session expired')
    }

    if (!userId || !email) {
      return redirectToLogin(request, 'Invalid session data')
    }

    // Create response with user data in headers and rate limit info
    const response = NextResponse.next()

    // Add user info to request headers for use in server components
    response.headers.set('x-user-id', userId)
    response.headers.set('x-user-email', email)
    response.headers.set('x-user-role', role)
    response.headers.set('x-request-id', `req_${Math.random().toString(36).slice(2)}`)

    // Add CSRF token for state-changing requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const csrfToken = generateCSRFToken()
      response.headers.set('x-csrf-token', csrfToken)
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })
    }

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Role-based route protection
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/dashboard') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Add monitoring headers to authenticated responses
    const responseTime = Date.now() - startTime
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    response.headers.set('X-Request-ID', `req_${Math.random().toString(36).slice(2)}`)

    // Track latency for API routes
    if (pathname.startsWith('/api/')) {
      trackLatency(pathname, responseTime, 200)
    }

    return response

  } catch (error) {
    // Check if this is a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('⏰ Middleware timeout:', {
        error: error.message,
        pathname: request.nextUrl.pathname,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })

      return new NextResponse('Request timeout', { status: 408 })
    }

    console.error('Session verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      pathname: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    })
    return redirectToLogin(request, 'Invalid session')
  }
}

function redirectToLogin(request: NextRequest, message?: string) {
  const loginUrl = new URL('/login', request.url)

  // Preserve the original URL to redirect back after login
  loginUrl.searchParams.set('from', request.nextUrl.pathname)

  if (message) {
    loginUrl.searchParams.set('message', message)
  }

  const response = NextResponse.redirect(loginUrl)

  // Clear invalid/expired cookies with proper security settings
  const cookiesToClear = [LEGACY_JWT_COOKIE_NAME, ...NEXT_AUTH_COOKIE_NAMES]
  cookiesToClear.forEach((cookieName) => {
    response.cookies.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  })

  // Add security headers following CLAUDE_RULES.md
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that should be public
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
