/**
 * Creator Management API Routes
 * Handles creator registration, profile management, and application approval
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Creator } from '@/lib/schemas/creator.schema'
import bcrypt from 'bcryptjs'

// Validation schemas
const createCreatorSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional(),
  paymentInfo: z.object({
    method: z.enum(['paypal', 'bank', 'stripe']),
    details: z.string().min(1, 'Payment details are required')
  }),
  agreedToTerms: z.boolean().refine(val => val === true, 'Must agree to terms')
})

const updateCreatorSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  profileImage: z.string().url().optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional(),
  paymentInfo: z.object({
    method: z.enum(['paypal', 'bank', 'stripe']),
    details: z.string().min(1)
  }).optional(),
  settings: z.object({
    emailNotifications: z.boolean().optional(),
    publicProfile: z.boolean().optional(),
    allowDirectMessages: z.boolean().optional()
  }).optional()
})

// POST - Apply to become a creator
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CREATOR_APPLY')
    if (!rateLimit.allowed) {
      return errorResponse('Too many applications', 429, 'RATE_LIMIT_EXCEEDED', null)
    }

    // Get authenticated user
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED', null)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCreatorSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse('Invalid application data', 400, 'VALIDATION_ERROR', {
        details: validationResult.error.errors
      }, 400)
    }

    const { displayName, bio, socialLinks, paymentInfo } = validationResult.data

    // Connect to database
    await connectDB()

    // Check if user is already a creator
    const existingCreator = await Creator.findOne({ userId: session.user.id })
    if (existingCreator) {
      return errorResponse('User is already a creator', 409, 'CREATOR_EXISTS', null)
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
      return errorResponse('Failed to generate unique creator code', 500, 'CODE_GENERATION_FAILED', null)
    }

    // Encrypt payment details
    const encryptedPaymentDetails = await bcrypt.hash(paymentInfo.details, 12)

    // Create creator application
    const creator = new Creator({
      userId: session.user.id,
      creatorCode: creatorCode!,
      displayName,
      email: session.user.email,
      bio,
      socialLinks: socialLinks || {},
      paymentInfo: {
        method: paymentInfo.method,
        details: encryptedPaymentDetails
      },
      status: 'pending',
      commissionRate: 10, // Default 10%
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
      }
    })

    await creator.save()

    // Remove sensitive information from response
    const creatorResponse = {
      id: creator._id,
      creatorCode: creator.creatorCode,
      displayName: creator.displayName,
      bio: creator.bio,
      socialLinks: creator.socialLinks,
      status: creator.status,
      commissionRate: creator.commissionRate,
      createdAt: creator.createdAt
    }

    return successResponse({
      message: 'Creator application submitted successfully',
      code: 'CREATOR_APPLICATION_SUBMITTED',
      creator: creatorResponse
    })

  } catch (error) {
    console.error('Creator application error:', error)
    return handleApiError(error)
  }
}

// GET - Get creator profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED', null)
    }

    await connectDB()

    const creator = await Creator.findOne({ userId: session.user.id })
      .select('-paymentInfo.details') // Exclude sensitive payment details

    if (!creator) {
      return errorResponse('Creator profile not found', 404, 'CREATOR_NOT_FOUND', null)
    }

    return successResponse({
      message: 'Creator profile retrieved successfully',
      code: 'CREATOR_PROFILE_RETRIEVED',
      creator
    })

  } catch (error) {
    console.error('Get creator profile error:', error)
    return handleApiError(error)
  }
}

// PUT - Update creator profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED', null)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateCreatorSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse('Invalid update data', 400, 'VALIDATION_ERROR', {
        details: validationResult.error.errors
      }, 400)
    }

    await connectDB()

    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return errorResponse('Creator profile not found', 404, 'CREATOR_NOT_FOUND', null)
    }

    // Update fields
    const updateData = validationResult.data
    
    if (updateData.displayName) creator.displayName = updateData.displayName
    if (updateData.bio !== undefined) creator.bio = updateData.bio
    if (updateData.profileImage) creator.profileImage = updateData.profileImage
    if (updateData.socialLinks) creator.socialLinks = { ...creator.socialLinks, ...updateData.socialLinks }
    if (updateData.settings) creator.settings = { ...creator.settings, ...updateData.settings }
    
    // Handle payment info update
    if (updateData.paymentInfo) {
      const encryptedDetails = await bcrypt.hash(updateData.paymentInfo.details, 12)
      creator.paymentInfo = {
        method: updateData.paymentInfo.method,
        details: encryptedDetails
      }
    }

    creator.updatedAt = new Date()
    await creator.save()

    // Remove sensitive information from response
    const creatorResponse = creator.toObject()
    delete creatorResponse.paymentInfo.details

    return successResponse({
      message: 'Creator profile updated successfully',
      code: 'CREATOR_PROFILE_UPDATED',
      creator: creatorResponse
    })

  } catch (error) {
    console.error('Update creator profile error:', error)
    return handleApiError(error)
  }
}