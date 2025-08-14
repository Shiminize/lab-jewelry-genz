/**
 * User Registration API Route
 * Handles new user registration with email verification
 * Implements CLAUDE_RULES.md API envelope format and rate limiting
 */

import { NextRequest } from 'next/server'
import { RegisterSchema } from '@/types/auth'
import { createUser } from '@/lib/user-service'
import { sendVerificationEmail } from '@/lib/email-service'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Rate limiting: 5 registrations per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: 5,
  windowMs: 60 * 1000 // 1 minute
}

async function registerHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  
  // Check rate limit
  const rateLimit = await checkRateLimit(`register:${clientIP}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many registration attempts. Please try again later.',
      [],
      429,
      rateLimit
    )
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, RegisterSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const { email, password, firstName, lastName, acceptTerms, acceptMarketing, referralCode } = validation.data
  
  try {
    // Create user with email verification required
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      emailVerified: false,
      role: 'customer',
      status: 'pending-verification',
      referralCode
    })
    
    // Send verification email
    if (user.emailVerificationToken) {
      await sendVerificationEmail(user.email, user.emailVerificationToken, {
        firstName: user.firstName!,
        lastName: user.lastName!
      })
    }
    
    // Return success response (don't include sensitive user data)
    return createSuccessResponse(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        email: user.email,
        emailVerificationRequired: !user.emailVerified
      },
      undefined,
      201
    )
  } catch (error) {
    // Handle specific registration errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'USER_EXISTS':
          return createErrorResponse(
            'USER_EXISTS',
            'An account with this email address already exists.',
            [],
            409
          )
        default:
          throw error // Re-throw to be handled by withErrorHandling wrapper
      }
    }
    throw error
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(registerHandler)
export const OPTIONS = handleCORS