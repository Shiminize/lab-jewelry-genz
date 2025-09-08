/**
 * GDPR Data Export API Route
 * Handles user data export requests for GDPR compliance
 * Implements CLAUDE_RULES.md API standards and security requirements
 */

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { exportUserData } from '@/lib/user-service'
import {
  createSuccessResponse,
  createErrorResponse,
  getClientIP,
  checkRateLimit,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// Rate limiting: 2 data export requests per hour per user
const RATE_LIMIT_CONFIG = {
  limit: 2,
  windowMs: 60 * 60 * 1000 // 1 hour
}

async function exportDataHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  // Apply rate limiting per user
  const rateLimit = checkRateLimit(`export:${user.id}`, RATE_LIMIT_CONFIG)
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many data export requests. You can request data export twice per hour.',
      [],
      429,
      rateLimit
    )
  }
  
  try {
    // Export user data
    const exportData = await exportUserData(user.id)
    
    if (!exportData) {
      return createErrorResponse(
        'EXPORT_FAILED',
        'Failed to export user data. Please try again.',
        [],
        500
      )
    }
    
    // Log the data export request for compliance

    return createSuccessResponse({
      message: 'Your data has been exported successfully.',
      exportData,
      metadata: {
        exportedAt: exportData.exportedAt,
        format: exportData.format,
        dataTypes: [
          'Profile information',
          'Account settings and preferences',
          'Order history and transactions',
          'Product reviews and ratings',
          'Saved designs and customizations',
          'Communication preferences',
          'Login and activity logs (anonymized)'
        ]
      },
      compliance: {
        gdprArticle: 'Article 15 - Right of access by the data subject',
        retentionPeriod: 'As per our Privacy Policy and applicable law',
        contactInfo: 'privacy@glowglitch.com for any questions'
      },
      instructions: [
        'This export contains all personal data we have about you',
        'The data is provided in JSON format for easy processing',
        'If you have questions about this data, contact our privacy team',
        'This export does not include data that has been anonymized'
      ]
    })
  } catch (error) {
    console.error('Data export error:', error)
    
    // Log the failed export attempt

    throw error // Will be handled by withErrorHandling wrapper
  }
}

// Export handlers with error handling wrapper
export const POST = withErrorHandling(exportDataHandler)
export const OPTIONS = handleCORS