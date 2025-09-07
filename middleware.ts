import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, type JWTPayload } from 'jose'
import { checkRateLimit, getRateLimitHeaders, AUTH_ERRORS } from '@/lib/jwt-utils'
import { getClientIP, createErrorResponse } from '@/lib/api-utils'
import { generateCSRFToken } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_COOKIE_NAME = 'auth-token'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/products/validate-price', // Allow price validation without auth for security
]

const STATIC_RESOURCES = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/public',
]

interface CustomJWTPayload extends JWTPayload {
  userId?: string
  email?: string
  role?: string
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static resources
  if (STATIC_RESOURCES.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow public routes without authentication
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  try {
    // Apply rate limiting for auth endpoints
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(
      `auth:${clientIP}`,
      5, // 5 requests per minute
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
    
    // Get JWT from cookie
    const token = request.cookies.get(JWT_COOKIE_NAME)?.value

    if (!token) {
      return redirectToLogin(request, 'Authentication required')
    }

    // Verify JWT using jose (Edge Runtime compatible)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret) as { payload: CustomJWTPayload }

    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return redirectToLogin(request, 'Session expired')
    }
    
    // Validate required JWT fields
    if (!payload.userId || !payload.email) {
      return redirectToLogin(request, 'Invalid session data')
    }

    // Create response with user data in headers and rate limit info
    const response = NextResponse.next()
    
    // Add user info to request headers for use in server components
    response.headers.set('x-user-id', payload.userId || '')
    response.headers.set('x-user-email', payload.email || '')
    response.headers.set('x-user-role', payload.role || '')
    response.headers.set('x-request-id', crypto.randomUUID())
    
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
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/dashboard') && !['admin', 'user'].includes(payload.role || '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return response

  } catch (error) {
    console.error('JWT verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      pathname: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
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
  
  // Clear invalid/expired cookie with proper security settings
  response.cookies.set({
    name: JWT_COOKIE_NAME,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
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