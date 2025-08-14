/**
 * Forgot Password API Route
 * Handles password reset requests with email
 * Implements CLAUDE_RULES.md API envelope format and rate limiting
 */

import { NextRequest } from 'next/server'
import { ForgotPasswordSchema } from '@/types/auth'
import { generatePasswordResetToken, getUserByEmail } from '@/lib/user-service'
import { sendPasswordResetEmail } from '@/lib/email-service'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Rate limiting: 3 password reset requests per 15 minutes per IP
const RATE_LIMIT_CONFIG = {
  limit: 3,
  windowMs: 15 * 60 * 1000 // 15 minutes
}

async function forgotPasswordHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  
  // Check rate limit
  const rateLimit = await checkRateLimit(`forgot-password:${clientIP}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many password reset requests. Please try again later.',
      [],
      429,
      rateLimit
    )
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, ForgotPasswordSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const { email } = validation.data
  
  try {
    // Generate password reset token (this will return null if user doesn't exist)
    const resetToken = await generatePasswordResetToken(email)
    
    // Always return success to prevent email enumeration attacks
    // Even if the email doesn't exist, we return success
    if (resetToken) {
      // Get user details for the email
      const user = await getUserByEmail(email)
      if (user && user.firstName) {
        // Send password reset email
        await sendPasswordResetEmail(email, resetToken, {
          firstName: user.firstName
        })
      }
    }
    
    return createSuccessResponse({
      message: 'If an account with that email exists, we have sent a password reset link.',
      email: email,
      note: 'Please check your email and follow the instructions to reset your password.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    
    // Always return success to prevent information disclosure
    return createSuccessResponse({
      message: 'If an account with that email exists, we have sent a password reset link.',
      email: email,
      note: 'Please check your email and follow the instructions to reset your password.'
    })
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(forgotPasswordHandler)
export const OPTIONS = handleCORS