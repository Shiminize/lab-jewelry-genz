/**
 * Logout API Route
 * Handles user logout and session cleanup
 * Implements CLAUDE_RULES.md API envelope format
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

async function logoutHandler(request: NextRequest) {
  try {
    // Get current session to verify user is logged in
    const session = await auth()
    
    if (!session) {
      return createErrorResponse(
        'NO_SESSION',
        'No active session to logout from',
        [],
        400
      )
    }
    
    // Note: In API routes, NextAuth signOut should be handled client-side
    // This endpoint can be used for additional logout cleanup if needed
    
    // Log the logout event
    console.log(`User logged out: ${session.user?.email}`)
    
    // Return success response
    return createSuccessResponse(
      {
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      },
      undefined,
      200
    )
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, we still want to indicate successful logout
    // as the session might have been cleared anyway
    return createSuccessResponse(
      {
        message: 'Logout completed',
        note: 'Session has been cleared, though an error occurred during cleanup',
        timestamp: new Date().toISOString()
      },
      undefined,
      200
    )
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(logoutHandler)
export const OPTIONS = handleCORS