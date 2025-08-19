/**
 * Individual Referral Link API Routes
 * Handles specific referral link management and updates
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { success, fail, handleAPIError } from '@/lib/api-response'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Creator, ReferralLink } from '@/lib/schemas/creator.schema'

interface RouteParams {
  params: { linkId: string }
}

// Validation schema
const updateLinkSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional()
})

// GET - Get specific referral link details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    await connectDB()

    // Check if user is a creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('CREATOR_NOT_FOUND', 'Creator account not found', null, 404)
    }

    // Find the referral link
    const link = await ReferralLink.findOne({
      _id: params.linkId,
      creatorId: creator._id
    }).select('-__v')

    if (!link) {
      return fail('LINK_NOT_FOUND', 'Referral link not found', null, 404)
    }

    return success('REFERRAL_LINK_RETRIEVED', 'Referral link retrieved successfully', {
      link
    })

  } catch (error) {
    console.error('Get referral link error:', error)
    return handleAPIError(error)
  }
}

// PUT - Update referral link
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateLinkSchema.safeParse(body)
    
    if (!validationResult.success) {
      return fail('VALIDATION_ERROR', 'Invalid update data', {
        details: validationResult.error.errors
      }, 400)
    }

    await connectDB()

    // Check if user is a creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('CREATOR_NOT_FOUND', 'Creator account not found', null, 404)
    }

    // Find and update the referral link
    const updateData = validationResult.data
    const link = await ReferralLink.findOneAndUpdate(
      {
        _id: params.linkId,
        creatorId: creator._id
      },
      {
        ...updateData,
        ...(updateData.expiresAt && { expiresAt: new Date(updateData.expiresAt) }),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-__v')

    if (!link) {
      return fail('LINK_NOT_FOUND', 'Referral link not found', null, 404)
    }

    return success('REFERRAL_LINK_UPDATED', 'Referral link updated successfully', {
      link
    })

  } catch (error) {
    console.error('Update referral link error:', error)
    return handleAPIError(error)
  }
}

// DELETE - Delete referral link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    await connectDB()

    // Check if user is a creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('CREATOR_NOT_FOUND', 'Creator account not found', null, 404)
    }

    // Find and delete the referral link
    const link = await ReferralLink.findOneAndDelete({
      _id: params.linkId,
      creatorId: creator._id
    })

    if (!link) {
      return fail('LINK_NOT_FOUND', 'Referral link not found', null, 404)
    }

    return success('REFERRAL_LINK_DELETED', 'Referral link deleted successfully', {
      deletedId: params.linkId
    })

  } catch (error) {
    console.error('Delete referral link error:', error)
    return handleAPIError(error)
  }
}