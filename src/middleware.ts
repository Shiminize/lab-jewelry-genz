/**
 * Next.js Middleware for Security Headers and CSRF Protection
 * Implements CLAUDE_RULES.md security requirements
 * Applies to all routes and API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// CSRF token generation and validation
const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

function generateCSRFToken(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return Buffer.from(`${timestamp}-${random}`).toString('base64url')
}

function validateCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [timestamp] = decoded.split('-')
    const tokenAge = Date.now() - parseInt(timestamp)
    
    // Token expires after 1 hour
    return tokenAge < 60 * 60 * 1000
  } catch {
    return false
  }
}

// Security headers configuration
function getSecurityHeaders(request: NextRequest): Record<string, string> {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const baseHeaders: Record<string, string> = {
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Content Type Options
    'X-Content-Type-Options': 'nosniff',
    
    // Frame Options
    'X-Frame-Options': 'DENY',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'interest-cohort=()',
      'payment=(self)',
      'usb=()',
      'serial=()',
      'bluetooth=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'fullscreen=(self)',
      'picture-in-picture=(self)'
    ].join(', ')
  }

  // Add HSTS only in production
  if (isProduction) {
    baseHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://connect.facebook.net https://appleid.cdn-apple.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://accounts.google.com https://graph.facebook.com https://appleid.apple.com https://api.stripe.com",
    "frame-src https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://js.stripe.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content"
  ]

  // In development, allow unsafe-eval for hot reloading
  if (isDevelopment) {
    cspDirectives[1] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://connect.facebook.net https://appleid.cdn-apple.com"
    cspDirectives.push("upgrade-insecure-requests")
  } else {
    cspDirectives.push("upgrade-insecure-requests")
  }

  baseHeaders['Content-Security-Policy'] = cspDirectives.join('; ')

  return baseHeaders
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
  return 'unknown'
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname, search } = request.nextUrl
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/api/auth')
  const isStaticFile = pathname.startsWith('/_next') || 
                      pathname.startsWith('/images') || 
                      pathname.startsWith('/favicon') ||
                      pathname.includes('.')

  // Skip middleware for static files
  if (isStaticFile) {
    return response
  }

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders(request)
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Get client IP for rate limiting
  const clientIP = getClientIP(request)

  // Apply rate limiting based on route type
  let rateLimitConfig = { limit: 100, windowMs: 60 * 1000 } // Default: 100/min

  if (isAuthRoute) {
    rateLimitConfig = { limit: 10, windowMs: 60 * 1000 } // Auth: 10/min
  } else if (isApiRoute) {
    if (pathname.includes('/user/') || pathname.includes('/profile')) {
      rateLimitConfig = { limit: 50, windowMs: 60 * 1000 } // User ops: 50/min
    } else if (pathname.includes('/orders')) {
      rateLimitConfig = { limit: 5, windowMs: 60 * 1000 } // Orders: 5/min
    } else if (pathname.includes('/admin')) {
      rateLimitConfig = { limit: 200, windowMs: 60 * 1000 } // Admin: 200/min
    }
  }

  // Check rate limit
  const rateLimitKey = `${isApiRoute ? 'api' : 'page'}:${clientIP}`
  if (!checkRateLimit(rateLimitKey, rateLimitConfig.limit, rateLimitConfig.windowMs)) {
    // Rate limit exceeded
    const record = rateLimitStore.get(rateLimitKey)
    if (!record) return response
    const retryAfter = Math.ceil((record.resetTime - Date.now()) / 1000)
    
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.limit.toString())
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    response.headers.set('Retry-After', retryAfter.toString())
    
    if (isApiRoute) {
      // Return JSON error for API routes
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down.',
            details: []
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: '1.0.0'
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries())
          }
        }
      )
    } else {
      // Redirect to rate limit page for web routes
      return NextResponse.redirect(new URL('/rate-limit', request.url))
    }
  }

  // Add rate limit headers to successful responses
  const record = rateLimitStore.get(rateLimitKey)
  if (record) {
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.limit.toString())
    response.headers.set('X-RateLimit-Remaining', (rateLimitConfig.limit - record.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
  }

  // CSRF Protection for state-changing API requests
  if (isApiRoute && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Skip CSRF for auth routes (NextAuth handles its own CSRF)
    if (!isAuthRoute) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionCsrfToken = request.cookies.get('csrf-token')?.value
      
      // Check if CSRF token is present and valid
      if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              code: 'CSRF_TOKEN_MISSING',
              message: 'CSRF token missing or invalid',
              details: []
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              version: '1.0.0'
            }
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(response.headers.entries())
            }
          }
        )
      }
      
      // Validate CSRF token
      if (!validateCSRFToken(csrfToken)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              code: 'CSRF_TOKEN_INVALID',
              message: 'CSRF token expired or invalid',
              details: []
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              version: '1.0.0'
            }
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(response.headers.entries())
            }
          }
        )
      }
    }
  }

  // Generate and set CSRF token for GET requests to pages (not API)
  if (!isApiRoute && request.method === 'GET') {
    const existingToken = request.cookies.get('csrf-token')?.value
    
    if (!existingToken || !validateCSRFToken(existingToken)) {
      const newToken = generateCSRFToken()
      response.cookies.set('csrf-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour
      })
    }
  }

  // Security logging for suspicious activity
  const isBot = request.headers.get('user-agent')?.toLowerCase().includes('bot')
  const hasSuspiciousHeaders = request.headers.get('x-forwarded-for')?.split(',').length > 3
  
  if (isBot || hasSuspiciousHeaders) {
    console.log(`Suspicious request: ${request.method} ${pathname} from ${clientIP}`)
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}