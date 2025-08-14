/**
 * API Utilities for GlowGlitch
 * Implements CLAUDE_RULES.md API envelope format and utilities
 * Updated with Redis-based rate limiting and 3D customizer CSP support
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import type { AuthApiResponse, RateLimitInfo } from '@/types/auth'
import { 
  checkIPRateLimit, 
  checkUserRateLimit, 
  RateLimitConfigs,
  type RateLimitResult 
} from './redis-rate-limiter'
import { initializeRedisRateLimit } from './redis-client'
import { generateRequestId as generateId, logger } from './logger'

// Generate request ID using structured logger
export function generateRequestId(): string {
  return generateId()
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  status: number = 200
): NextResponse {
  const response: AuthApiResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  }
  
  return NextResponse.json(response, { status })
}

// Error response helper
export function createErrorResponse(
  code: string,
  message: string,
  details: any[] = [],
  status: number = 400,
  rateLimit?: RateLimitInfo
): NextResponse {
  const response: AuthApiResponse = {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    },
    ...(rateLimit && { rateLimit })
  }
  
  const headers: Record<string, string> = {}
  
  if (rateLimit) {
    headers['X-RateLimit-Limit'] = rateLimit.limit.toString()
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString()
    headers['X-RateLimit-Reset'] = rateLimit.reset.toString()
    if (rateLimit.retryAfter) {
      headers['Retry-After'] = rateLimit.retryAfter.toString()
    }
  }
  
  return NextResponse.json(response, { status, headers })
}

// Validation error response
export function createValidationErrorResponse(error: ZodError): NextResponse {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))
  
  return createErrorResponse(
    'VALIDATION_ERROR',
    'Invalid input data',
    details,
    422
  )
}

// Rate limiting utilities using Redis-based system
export interface RateLimitConfig {
  limit: number
  windowMs: number
}

// Wrapper for IP-based rate limiting with CLAUDE_RULES configs
export async function checkAPIRateLimit(
  request: NextRequest,
  configName: keyof typeof RateLimitConfigs
): Promise<RateLimitResult> {
  // Initialize Redis on first use to avoid module loading issues
  initializeRedisRateLimit()
  
  const config = RateLimitConfigs[configName]
  return await checkIPRateLimit(request, config, configName)
}

// Wrapper for user-based rate limiting
export async function checkUserAPIRateLimit(
  userId: string,
  configName: keyof typeof RateLimitConfigs
): Promise<RateLimitResult> {
  // Initialize Redis on first use to avoid module loading issues
  initializeRedisRateLimit()
  
  const config = RateLimitConfigs[configName]
  return await checkUserRateLimit(userId, config, configName)
}

// Legacy function for backwards compatibility - now uses Redis
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitInfo & { allowed: boolean }> {
  try {
    const { checkRateLimit: redisCheckRateLimit } = await import('./redis-rate-limiter')
    const result = await redisCheckRateLimit(identifier, config, 'legacy')
    
    return {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.retryAfter,
      allowed: result.allowed
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return {
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.floor(Date.now() / 1000) + Math.ceil(config.windowMs / 1000),
      allowed: true
    }
  }
}

// Validate request body with Zod schema
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: createValidationErrorResponse(error) }
    }
    return {
      success: false,
      response: createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', [], 400)
    }
  }
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
  return 'unknown'
}

// CORS headers for API routes
export function getCORSHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://glowglitch.com' 
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  }
}

// Security headers for API routes with 3D customizer support
export function getSecurityHeaders(): Record<string, string> {
  // CSP policy that allows 3D WebGL customizer functionality
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "connect-src 'self' https://api.stripe.com https://www.google-analytics.com wss: ws:",
    "worker-src 'self' blob:",
    "frame-src https://js.stripe.com https://www.youtube.com",
    "frame-ancestors 'none'",
    // WebGL and 3D customizer specific directives
    "child-src 'self' blob:",
    "manifest-src 'self'"
  ].join('; ')

  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': cspPolicy,
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), accelerometer=()'
  }
  
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }
  
  return headers
}

// Add security and CORS headers to response
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const corsHeaders = getCORSHeaders()
  const securityHeaders = getSecurityHeaders()
  
  Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Handle preflight OPTIONS request
export function handleCORS(): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  return addSecurityHeaders(response)
}

// API route wrapper with error handling and structured logging
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operation: string = 'api_operation'
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    const request = args[0] as NextRequest
    const requestId = generateRequestId()
    
    try {
      // Log request start
      logger.info(`${operation} started`, {
        requestId,
        operation,
        method: request.method,
        path: new URL(request.url).pathname
      })
      
      const response = await handler(...args)
      const duration = Date.now() - startTime
      
      // Log successful response
      logger.info(`${operation} completed`, {
        requestId,
        operation,
        duration,
        statusCode: response.status
      })
      
      // Add request ID to response headers for correlation
      response.headers.set('X-Request-ID', requestId)
      
      return addSecurityHeaders(response)
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error with structured logging
      if (error instanceof Error) {
        logger.error(`${operation} failed: ${error.message}`, error, {
          requestId,
          operation,
          duration,
          method: request.method,
          path: new URL(request.url).pathname
        })
        
        // Handle specific error types
        switch (error.message) {
          case 'UNAUTHORIZED':
            return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
          case 'FORBIDDEN':
            return createErrorResponse('FORBIDDEN', 'Insufficient permissions', [], 403)
          case 'USER_NOT_FOUND':
            return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
          case 'USER_EXISTS':
            return createErrorResponse('USER_EXISTS', 'User already exists', [], 409)
          case 'INVALID_CREDENTIALS':
            return createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', [], 401)
          case 'EMAIL_NOT_VERIFIED':
            return createErrorResponse('EMAIL_NOT_VERIFIED', 'Please verify your email address', [], 401)
          case 'ACCOUNT_SUSPENDED':
            return createErrorResponse('ACCOUNT_SUSPENDED', 'Your account has been suspended', [], 401)
          case 'ACCOUNT_LOCKED':
            return createErrorResponse('ACCOUNT_LOCKED', 'Account temporarily locked due to multiple failed login attempts', [], 401)
          case 'INVALID_TOKEN':
            return createErrorResponse('INVALID_TOKEN', 'Invalid or expired token', [], 400)
          case 'INVALID_PASSWORD':
            return createErrorResponse('INVALID_PASSWORD', 'Current password is incorrect', [], 400)
          case 'DATABASE_ERROR':
            return createErrorResponse('DATABASE_ERROR', 'Internal server error', [], 500)
          default:
            return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', [], 500)
        }
      } else {
        logger.error(`${operation} failed with unknown error`, undefined, {
          requestId,
          operation,
          duration,
          error: { message: String(error) }
        })
      }
      
      return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', [], 500)
    }
  }
}

// Pagination helper
export function calculatePagination(page: number = 1, limit: number = 20, total: number) {
  const normalizedPage = Math.max(1, page)
  const normalizedLimit = Math.min(Math.max(1, limit), 50) // Max 50 items per page
  const totalPages = Math.ceil(total / normalizedLimit)
  const offset = (normalizedPage - 1) * normalizedLimit
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total,
    totalPages,
    offset,
    hasNext: normalizedPage < totalPages,
    hasPrev: normalizedPage > 1
  }
}