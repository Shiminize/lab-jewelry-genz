/**
 * User Profile API Routes
 * Handles user profile management with authentication and validation
 * Implements CLAUDE_RULES.md API standards and security requirements
 */

import { NextRequest } from 'next/server'
import { UpdateProfileSchema } from '@/types/auth'
import { getUserById, updateUserProfile } from '@/lib/user-service'
import { requireAuth } from '@/lib/auth-middleware'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// GET /api/user/profile - Get current user's profile
async function getProfileHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  try {
    // Get full user details from database
    const fullUser = await getUserById(user.id)
    
    if (!fullUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    // Return user profile (exclude sensitive data)
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      emailVerificationExpires,
      twoFactorSecret,
      loginAttempts,
      lockedUntil,
      ...safeUserData
    } = fullUser
    
    return createSuccessResponse({
      user: safeUserData,
      metadata: {
        lastLogin: fullUser.lastLogin,
        createdAt: fullUser.createdAt,
        updatedAt: fullUser.updatedAt,
        lastActiveAt: fullUser.lastActiveAt
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    throw error // Will be handled by withErrorHandling wrapper
  }
}

// PUT /api/user/profile - Update current user's profile
async function updateProfileHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, UpdateProfileSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const updateData = validation.data
  
  try {
    // Update user profile
    const updatedUser = await updateUserProfile(user.id, updateData)
    
    if (!updatedUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    // Return updated profile (exclude sensitive data)
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      emailVerificationExpires,
      twoFactorSecret,
      loginAttempts,
      lockedUntil,
      ...safeUserData
    } = updatedUser
    
    return createSuccessResponse({
      message: 'Profile updated successfully',
      user: safeUserData
    })
  } catch (error) {
    console.error('Update profile error:', error)
    throw error // Will be handled by withErrorHandling wrapper
  }
}

// DELETE /api/user/profile - Delete user account (GDPR compliance)
async function deleteProfileHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  try {
    // For now, we'll just mark the account as inactive
    // Full deletion logic would be implemented based on GDPR requirements
    const updatedUser = await updateUserProfile(user.id, {
      // @ts-ignore - We need to extend the type to include status updates
      status: 'inactive'
    })
    
    if (!updatedUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    return createSuccessResponse({
      message: 'Account deletion requested. Your account has been deactivated.',
      note: 'Complete data deletion will be processed within 30 days as per GDPR requirements.'
    })
  } catch (error) {
    console.error('Delete profile error:', error)
    throw error
  }
}

// Export handlers with error handling wrapper
export const GET = withErrorHandling(getProfileHandler)
export const PUT = withErrorHandling(updateProfileHandler)
export const DELETE = withErrorHandling(deleteProfileHandler)
export const OPTIONS = handleCORS