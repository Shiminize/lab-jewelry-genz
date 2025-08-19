/**
 * Creator Application API Endpoint
 * Handles new creator applications according to the workflow guidelines
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { connectToDatabase } from '@/lib/mongoose'
import { Creator } from '@/lib/schemas/creator.schema'
import bcrypt from 'bcryptjs'

// Application schema validation per guidelines
const creatorApplicationSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  email: z.string().email('Valid email address required'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(), 
    youtube: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().url().optional()
  }).optional(),
  paymentInfo: z.object({
    method: z.enum(['paypal', 'bank', 'stripe']),
    details: z.string().min(1, 'Payment details are required')
  }),
  requestedCommissionRate: z.number().min(0).max(50).optional().default(10),
  audience: z.object({
    size: z.string(),
    demographics: z.string(),
    engagement: z.string()
  }).optional(),
  content: z.object({
    type: z.string(),
    frequency: z.string(),
    platforms: z.array(z.string())
  }).optional(),
  agreedToTerms: z.boolean().refine(val => val === true, 'Must agree to terms and conditions')
})

// POST - Creator Application Submission
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for applications (bypassed in development)
    if (process.env.NODE_ENV !== 'development') {
      const rateLimit = await checkAPIRateLimit(request, 'CREATOR_APPLY')
      if (!rateLimit.allowed) {
        return errorResponse('Too many applications. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = creatorApplicationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse('Invalid application data', 400, 'VALIDATION_ERROR', {
        details: validationResult.error.errors
      })
    }

    const { 
      displayName, 
      email, 
      bio, 
      socialLinks, 
      paymentInfo, 
      requestedCommissionRate,
      audience,
      content
    } = validationResult.data

    // Connect to database
    await connectToDatabase()

    // Check if email is already used by another creator
    const existingCreator = await Creator.findOne({ email })
    if (existingCreator) {
      return errorResponse('Email address is already registered as a creator', 409, 'EMAIL_EXISTS')
    }

    // Generate unique creator code
    let creatorCode: string
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      creatorCode = (Creator as any).generateCreatorCode()
      const existing = await Creator.findOne({ creatorCode })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return errorResponse('Failed to generate unique creator code', 500, 'CODE_GENERATION_FAILED')
    }

    // Encrypt payment details for security
    const encryptedPaymentDetails = await bcrypt.hash(paymentInfo.details, 12)

    // Auto-qualification check (simplified for demo)
    let autoApproved = false
    if (audience?.size && parseInt(audience.size) > 1000) {
      autoApproved = true
    }

    // Create creator application
    const creator = new Creator({
      // userId is not required for applications - will be set when user creates account if approved
      creatorCode: creatorCode!,
      displayName,
      email,
      bio,
      socialLinks: socialLinks || {},
      paymentInfo: {
        method: paymentInfo.method,
        details: encryptedPaymentDetails
      },
      status: autoApproved ? 'approved' : 'pending',
      commissionRate: requestedCommissionRate || 10,
      minimumPayout: 50, // Default $50 minimum
      metrics: {
        totalClicks: 0,
        totalSales: 0,
        totalCommission: 0,
        conversionRate: 0
      },
      settings: {
        emailNotifications: true,
        publicProfile: true,
        allowDirectMessages: true
      },
      notes: [
        `Application submitted with requested commission rate: ${requestedCommissionRate}%`,
        audience ? `Audience: ${audience.size} followers, ${audience.demographics}` : '',
        content ? `Content type: ${content.type}, Posts: ${content.frequency}` : ''
      ].filter(Boolean).join('\n'),
      ...(autoApproved && { approvedAt: new Date() })
    })

    await creator.save()

    // Calculate estimated review time
    const estimatedReviewTime = autoApproved ? 'Approved immediately' : '2-3 business days'

    // Prepare response (exclude sensitive data)
    const applicationResponse = {
      applicationId: creator._id,
      creatorCode: creator.creatorCode,
      status: creator.status,
      estimatedReviewTime,
      nextSteps: autoApproved ? [
        'Welcome email sent',
        'Creator dashboard access granted',
        'Start creating referral links'
      ] : [
        'Email verification sent', 
        'Application under review',
        'Decision notification via email'
      ]
    }

    // TODO: Send confirmation email
    // TODO: Notify admin team for manual review if not auto-approved

    return successResponse({
      message: autoApproved ? 'Congratulations! Your application has been approved.' : 'Creator application submitted successfully',
      creator: applicationResponse
    })

  } catch (error) {
    console.error('Creator application error:', error)
    return handleApiError(error)
  }
}

// GET - Check application status (for public use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const creatorCode = searchParams.get('code')

    if (!email && !creatorCode) {
      return errorResponse('Email or creator code required', 400, 'MISSING_PARAMETER')
    }

    await connectToDatabase()

    let creator
    if (email) {
      creator = await Creator.findOne({ email }).select('creatorCode displayName status createdAt approvedAt')
    } else if (creatorCode) {
      creator = await Creator.findOne({ creatorCode }).select('creatorCode displayName status createdAt approvedAt')
    }

    if (!creator) {
      return errorResponse('No application found with provided information', 404, 'APPLICATION_NOT_FOUND')
    }

    return successResponse({
      message: 'Application status retrieved',
      application: {
        creatorCode: creator.creatorCode,
        displayName: creator.displayName,
        status: creator.status,
        appliedAt: creator.createdAt,
        approvedAt: creator.approvedAt,
        statusMessage: getStatusMessage(creator.status)
      }
    })

  } catch (error) {
    console.error('Application status check error:', error)
    return handleApiError(error)
  }
}

// Helper function to get user-friendly status messages
function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Your application is under review. You should hear back within 2-3 business days.'
    case 'approved':
      return 'Congratulations! Your application has been approved. Check your email for next steps.'
    case 'suspended':
      return 'Your creator account has been temporarily suspended. Please contact support for details.'
    case 'inactive':
      return 'Your creator account is inactive. Please contact support to reactivate.'
    default:
      return 'Application status unknown. Please contact support.'
  }
}