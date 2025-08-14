/**
 * User Login API Route
 * Handles user authentication with rate limiting
 * Note: Primary authentication is handled by NextAuth, this is for additional login logic
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { LoginSchema } from '@/types/auth'
import { authOptions } from '@/lib/auth'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Rate limiting: 5 login attempts per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: 5,
  windowMs: 60 * 1000 // 1 minute
}

async function loginHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  
  // Check rate limit
  const rateLimit = await checkRateLimit(`login:${clientIP}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many login attempts. Please try again later.',
      [],
      429,
      rateLimit
    )
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, LoginSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const { email, password, rememberMe } = validation.data
  
  try {
    // For this API route, we'll return a note that NextAuth handles authentication
    // The actual sign-in should be done through NextAuth's built-in endpoints
    return createErrorResponse(
      'USE_NEXTAUTH',
      'Please use NextAuth sign-in endpoints for authentication. This endpoint is for additional login logic only.',
      ['Use POST /api/auth/signin/credentials for credential authentication'],
      400
    )
  } catch (error) {
    console.error('Login error:', error)
    
    // Handle specific login errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'INVALID_CREDENTIALS':
        case 'EMAIL_NOT_VERIFIED':
        case 'ACCOUNT_SUSPENDED':
        case 'ACCOUNT_LOCKED':
          throw error // Re-throw to be handled by withErrorHandling wrapper
        default:
          return createErrorResponse(
            'AUTHENTICATION_ERROR',
            'An error occurred during authentication. Please try again.',
            [],
            500
          )
      }
    }
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred. Please try again.',
      [],
      500
    )
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(loginHandler)
export const OPTIONS = handleCORS