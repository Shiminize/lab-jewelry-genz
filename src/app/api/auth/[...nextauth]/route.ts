/**
 * NextAuth.js API Route Handler
 * Handles all authentication routes: signin, signout, callback, etc.
 * Implements CLAUDE_RULES.md security headers and rate limiting
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Security headers as per CLAUDE_RULES.md
const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://connect.facebook.net https://appleid.cdn-apple.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https: http:;
    connect-src 'self' https://accounts.google.com https://graph.facebook.com https://appleid.apple.com;
    frame-src https://accounts.google.com https://www.facebook.com https://appleid.apple.com;
    form-action 'self';
    base-uri 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim()
}

// Only add HSTS in production
if (process.env.NODE_ENV === 'production') {
  securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
}

// Rate limiting for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function addRateLimitHeaders(headers: Headers, ip: string) {
  const limit = 5 // 5 requests per minute for auth
  const windowMs = 60 * 1000 // 1 minute
  const now = Date.now()
  const key = `auth:${ip}`
  
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    headers.set('X-RateLimit-Limit', limit.toString())
    headers.set('X-RateLimit-Remaining', (limit - 1).toString())
    headers.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString())
    return true
  }
  
  if (record.count >= limit) {
    headers.set('X-RateLimit-Limit', limit.toString())
    headers.set('X-RateLimit-Remaining', '0')
    headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    headers.set('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString())
    return false
  }
  
  record.count++
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', (limit - record.count).toString())
  headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
  return true
}

// NextAuth handler
const handler = NextAuth(authOptions)

// Wrapper to add security headers and rate limiting
async function wrappedHandler(request: Request, context: { params: { nextauth: string[] } }) {
  // Get client IP for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
  
  // Create response headers
  const responseHeaders = new Headers()
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    responseHeaders.set(key, value)
  })
  
  // Check rate limit for authentication requests
  const isAuthRequest = context.params.nextauth[0] === 'signin' || 
                       context.params.nextauth[0] === 'signup' ||
                       context.params.nextauth[0] === 'callback'
  
  if (isAuthRequest && !addRateLimitHeaders(responseHeaders, ip)) {
    // Rate limit exceeded
    const errorResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.',
        details: []
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '1.0.0'
      }
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 429,
      headers: responseHeaders
    })
  }
  
  try {
    // Call NextAuth handler
    const response = await handler(request, context)
    
    // Add security headers to NextAuth response
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Add rate limit headers if they were set
    responseHeaders.forEach((value, key) => {
      if (key.startsWith('X-RateLimit') || key === 'Retry-After') {
        response.headers.set(key, value)
      }
    })
    
    return response
  } catch (error) {
    console.error('NextAuth handler error:', error)
    
    // Return error in API envelope format
    const errorResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'An error occurred during authentication. Please try again.',
        details: []
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '1.0.0'
      }
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: responseHeaders
    })
  }
}

// Export for both GET and POST methods
export { wrappedHandler as GET, wrappedHandler as POST }