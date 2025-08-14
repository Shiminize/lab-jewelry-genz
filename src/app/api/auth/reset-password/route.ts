/**
 * Reset Password API Route
 * Handles password reset with token validation
 * Implements CLAUDE_RULES.md API envelope format and rate limiting
 */

import { NextRequest } from 'next/server'
import { ResetPasswordSchema } from '@/types/auth'
import { resetPassword } from '@/lib/user-service'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Rate limiting: 5 password reset attempts per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: 5,
  windowMs: 60 * 1000 // 1 minute
}

async function resetPasswordHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  
  // Check rate limit
  const rateLimit = await checkRateLimit(`reset-password:${clientIP}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many password reset attempts. Please try again later.',
      [],
      429,
      rateLimit
    )
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, ResetPasswordSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const { token, password } = validation.data
  
  try {
    // Reset the password using the token
    const user = await resetPassword(token, password)
    
    if (!user) {
      return createErrorResponse(
        'INVALID_TOKEN',
        'Invalid or expired reset token.',
        [],
        400
      )
    }
    
    return createSuccessResponse({
      message: 'Password reset successfully! You can now sign in with your new password.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      nextSteps: [
        'Sign in with your new password',
        'Update your security preferences if needed',
        'Consider enabling two-factor authentication'
      ]
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
    // Handle specific reset errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'INVALID_TOKEN':
          return createErrorResponse(
            'INVALID_TOKEN',
            'The reset link is invalid or has expired. Please request a new password reset.',
            [],
            400
          )
        case 'USER_NOT_FOUND':
          return createErrorResponse(
            'USER_NOT_FOUND',
            'User associated with this reset token was not found.',
            [],
            404
          )
        default:
          throw error // Re-throw to be handled by withErrorHandling wrapper
      }
    }
    throw error
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(resetPasswordHandler)
export const OPTIONS = handleCORS