/**
 * Session API Route
 * Provides current session information with user details
 * Implements CLAUDE_RULES.md API envelope format
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserById } from '@/lib/user-service'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'
import type { AuthSession } from '@/types/auth'

async function getSessionHandler(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth() as AuthSession | null
    
    if (!session) {
      return createErrorResponse(
        'NO_SESSION',
        'No active session found',
        [],
        401
      )
    }
    
    // Get additional user details from database
    const user = await getUserById(session.user.id)
    
    if (!user) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User associated with session not found',
        [],
        404
      )
    }
    
    // Check if user account is still active
    if (user.status === 'suspended') {
      return createErrorResponse(
        'ACCOUNT_SUSPENDED',
        'Your account has been suspended',
        [],
        401
      )
    }
    
    if (user.status === 'inactive') {
      return createErrorResponse(
        'ACCOUNT_INACTIVE',
        'Your account is inactive',
        [],
        401
      )
    }
    
    // Return session with additional user details
    const sessionData = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        profileImage: user.profileImage,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phone: user.phone,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt
      },
      session: {
        expires: session.expires,
        accessToken: session.accessToken
      },
      permissions: {
        canAccessAdmin: user.role === 'admin',
        canAccessCreatorDashboard: user.role === 'creator' || user.role === 'admin',
        canCreateProducts: user.role === 'admin',
        canManageOrders: user.role === 'admin',
        canManageUsers: user.role === 'admin'
      }
    }
    
    return createSuccessResponse(sessionData)
  } catch (error) {
    console.error('Session error:', error)
    throw error // Will be handled by withErrorHandling wrapper
  }
}

async function updateSessionHandler(request: NextRequest) {
  try {
    // Get current session
    const session = await auth() as AuthSession | null
    
    if (!session) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        [],
        401
      )
    }
    
    // For session updates, we could implement session refresh logic here
    // For now, just return the current session
    return createSuccessResponse({
      message: 'Session refreshed successfully',
      expires: session.expires
    })
  } catch (error) {
    console.error('Session update error:', error)
    throw error
  }
}

// Export handlers with error handling wrapper
export const GET = withErrorHandling(getSessionHandler)
export const PUT = withErrorHandling(updateSessionHandler)
export const OPTIONS = handleCORS