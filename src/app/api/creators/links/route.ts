/**
 * Creator Referral Links API Routes
 * Handles referral link generation, management, and tracking
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { Creator, ReferralLink } from '@/lib/schemas/creator.schema'

// UTM Parameter validation schema
const utmParametersSchema = z.object({
  source: z.string().min(1).max(100).optional(),
  medium: z.string().min(1).max(100).optional(), 
  campaign: z.string().min(1).max(100).optional(),
  term: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(100).optional()
}).optional()

// Validation schemas
const createLinkSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  productId: z.string().optional(),
  customAlias: z.string().min(3).max(20).regex(/^[a-zA-Z0-9-_]+$/, 'Custom alias can only contain letters, numbers, hyphens, and underscores').optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
  utmParameters: utmParametersSchema
})

const updateLinkSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional()
})

// POST - Create a new referral link
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CREATE_LINK')
    if (!rateLimit.allowed) {
      return errorResponse('Too many link creation requests', 429, 'RATE_LIMIT_EXCEEDED', null)
    }

    // Get authenticated user
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED', null)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createLinkSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse('Invalid link data', 400, 'VALIDATION_ERROR', {
        details: validationResult.error.errors
      }, 400)
    }

    const { originalUrl, productId, customAlias, title, description, expiresAt, utmParameters } = validationResult.data

    // Connect to database
    await connectToDatabase()

    // Check if user is an approved creator
    const creator = await Creator.findOne({ 
      userId: session.user.id, 
      status: 'approved' 
    })
    
    if (!creator) {
      return errorResponse('Creator account not found or not approved', 403, 'CREATOR_NOT_APPROVED', null)
    }

    // Check for custom alias uniqueness
    if (customAlias) {
      const existingAlias = await ReferralLink.findOne({ 
        customAlias: customAlias.toLowerCase() 
      })
      if (existingAlias) {
        return errorResponse('Custom alias already exists', 409, 'ALIAS_EXISTS', null)
      }
    }

    // Generate unique link code
    let linkCode: string
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      linkCode = (ReferralLink as any).generateLinkCode()
      const existing = await ReferralLink.findOne({ linkCode })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return errorResponse('Failed to generate unique link code', 500, 'CODE_GENERATION_FAILED', null)
    }

    // Generate short URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://glowglitch.com'
    const shortUrl = customAlias 
      ? `${baseUrl}/ref/${customAlias.toLowerCase()}`
      : `${baseUrl}/ref/${linkCode!}`

    // Create referral link
    // Note: UTM parameters are validated but stored per-click rather than per-link
    // They will be applied when users click through the referral link
    const referralLink = new ReferralLink({
      creatorId: creator._id,
      linkCode: linkCode!,
      originalUrl,
      shortUrl,
      productId: productId || undefined,
      customAlias: customAlias?.toLowerCase(),
      title: title || `Shared by ${creator.displayName}`,
      description,
      isActive: true,
      clickCount: 0,
      uniqueClickCount: 0,
      conversionCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })

    await referralLink.save()

    return successResponse({
      message: 'Referral link created successfully',
      code: 'REFERRAL_LINK_CREATED',
      link: {
        id: referralLink._id,
        linkCode: referralLink.linkCode,
        shortUrl: referralLink.shortUrl,
        originalUrl: referralLink.originalUrl,
        title: referralLink.title,
        description: referralLink.description,
        isActive: referralLink.isActive,
        createdAt: referralLink.createdAt,
        expiresAt: referralLink.expiresAt,
        utmParameters: utmParameters || null // Include UTM params in response
      }
    })

  } catch (error) {
    console.error('Create referral link error:', error)
    return handleApiError(error)
  }
}

// GET - Get creator's referral links
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED', null)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const isActive = searchParams.get('active')
    const search = searchParams.get('search')

    await connectToDatabase()

    // Check if user is a creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return errorResponse('Creator account not found', 404, 'CREATOR_NOT_FOUND', null)
    }

    // Build query
    const query: any = { creatorId: creator._id }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortUrl: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count
    const total = await ReferralLink.countDocuments(query)

    // Get links with pagination
    const links = await ReferralLink.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v')

    return successResponse({
      message: 'Referral links retrieved successfully',
      code: 'REFERRAL_LINKS_RETRIEVED',
      links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get referral links error:', error)
    return handleApiError(error)
  }
}