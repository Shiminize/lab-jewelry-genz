/**
 * Email Verification API Route
 * Handles email verification for new user registrations
 * Implements CLAUDE_RULES.md API envelope format
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyEmail } from '@/lib/user-service'
import { sendWelcomeEmail } from '@/lib/email-service'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Validation schema for verification request
const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

// Rate limiting: 10 verification attempts per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: 10,
  windowMs: 60 * 1000 // 1 minute
}

async function verifyEmailHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  
  // Check rate limit
  const rateLimit = await checkRateLimit(`verify:${clientIP}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many verification attempts. Please try again later.',
      [],
      429,
      rateLimit
    )
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, VerifyEmailSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const { token } = validation.data
  
  try {
    // Verify the email using the token
    const user = await verifyEmail(token)
    
    if (!user) {
      return createErrorResponse(
        'INVALID_TOKEN',
        'Invalid or expired verification token.',
        [],
        400
      )
    }
    
    // Send welcome email
    if (user.firstName && user.lastName) {
      await sendWelcomeEmail(user.email, {
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
    
    return createSuccessResponse({
      message: 'Email verified successfully! Welcome to GlowGlitch.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        status: user.status
      },
      nextSteps: [
        'Complete your profile to personalize your experience',
        'Browse our collection of lab-grown jewelry',
        'Use our 3D customizer to design unique pieces',
        'Join our creator program for exclusive benefits'
      ]
    })
  } catch (error) {
    console.error('Email verification error:', error)
    
    // Handle specific verification errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'INVALID_TOKEN':
          return createErrorResponse(
            'INVALID_TOKEN',
            'The verification link is invalid or has expired. Please request a new verification email.',
            [],
            400
          )
        case 'USER_NOT_FOUND':
          return createErrorResponse(
            'USER_NOT_FOUND',
            'User associated with this verification token was not found.',
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

// GET /api/auth/verify-email - Handle verification from email links
async function getVerifyEmailHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) {
    return createErrorResponse(
      'MISSING_TOKEN',
      'Verification token is required.',
      [],
      400
    )
  }
  
  // Create a fake request body for the main handler
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ token })
  })
  
  return verifyEmailHandler(mockRequest as NextRequest)
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(verifyEmailHandler)
export const GET = withErrorHandling(getVerifyEmailHandler)
export const OPTIONS = handleCORS