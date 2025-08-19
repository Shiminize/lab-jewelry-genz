import { NextRequest, NextResponse } from 'next/server'
import { protectAdminRoute, AdminSecurityManager, type AdminPermission } from '@/lib/admin-security'

// Admin API middleware for security and access control
export async function withAdminAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  requiredPermission?: AdminPermission
): Promise<NextResponse> {
  try {
    // Apply admin route protection
    const authResult = await protectAdminRoute(request, requiredPermission)
    
    if (!authResult.isAuthorized) {
      // Log the security event
      AdminSecurityManager.logSecurityEvent({
        type: 'permission_denied',
        ip: AdminSecurityManager.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: authResult.error
      })

      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Access denied',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }

    // Log successful admin action
    AdminSecurityManager.logAdminAction({
      userId: authResult.user!.id,
      action: `${request.method} ${request.nextUrl.pathname}`,
      resource: 'admin-api',
      ip: AdminSecurityManager.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Call the actual handler with authenticated user
    return await handler(request, authResult.user)

  } catch (error) {
    console.error('Admin auth middleware error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Security check failed',
        code: 'SECURITY_ERROR'
      },
      { status: 500 }
    )
  }
}

// Rate limiting middleware specifically for admin APIs
export function withAdminRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
) {
  return (request: NextRequest): NextResponse | null => {
    if (!AdminSecurityManager.checkRateLimit(identifier, limit, windowMs)) {
      AdminSecurityManager.logSecurityEvent({
        type: 'rate_limit',
        ip: AdminSecurityManager.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Rate limit exceeded: ${limit} requests per ${windowMs}ms`
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
          }
        }
      )
    }

    return null // No rate limit hit, continue
  }
}

// Input validation middleware
export function withInputValidation(schema: any) {
  return async (request: NextRequest): Promise<{ isValid: boolean; data?: any; error?: string }> => {
    try {
      const body = await request.json()
      
      // Basic validation (in production, use a proper validation library like Zod)
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in body)) {
            return {
              isValid: false,
              error: `Missing required field: ${field}`
            }
          }
        }
      }

      // Sanitize inputs
      const sanitizedData = sanitizeInputs(body)
      
      return {
        isValid: true,
        data: sanitizedData
      }

    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON body'
      }
    }
  }
}

// Input sanitization
function sanitizeInputs(data: any): any {
  if (typeof data === 'string') {
    return data.trim().slice(0, 1000) // Limit string length
  }
  
  if (Array.isArray(data)) {
    return data.slice(0, 100).map(sanitizeInputs) // Limit array size
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[key] = sanitizeInputs(value)
      }
    }
    return sanitized
  }
  
  return data
}

// Security headers middleware
export function withSecurityHeaders(): NextResponse {
  const response = new NextResponse()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  )
  
  return response
}

// CSRF protection middleware
export function withCSRFProtection(request: NextRequest): NextResponse | null {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('admin-session')?.value
    
    // In production, implement proper CSRF token validation
    if (!csrfToken && request.method !== 'GET') {
      AdminSecurityManager.logSecurityEvent({
        type: 'suspicious_activity',
        ip: AdminSecurityManager.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: 'Missing CSRF token'
      })

      return NextResponse.json(
        {
          success: false,
          error: 'CSRF token required',
          code: 'CSRF_TOKEN_MISSING'
        },
        { status: 403 }
      )
    }
  }

  return null // No CSRF issue, continue
}