import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { fail, success } from '@/lib/api-utils'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { Creator, CreatorPayout } from '@/lib/schemas/creator.schema'
import connectDB from '@/lib/mongodb'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/creators/payouts/[id]
 * Get specific payout details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'CREATOR_PAYOUT_DETAILS')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    await connectDB()

    // Find creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('NOT_FOUND', 'Creator not found')
    }

    // Find payout
    const payout = await CreatorPayout.findOne({
      _id: params.id,
      creatorId: creator._id
    }).lean()

    if (!payout) {
      return fail('NOT_FOUND', 'Payout not found')
    }

    return success({ payout })

  } catch (error) {
    console.error('Error fetching payout details:', error)
    return fail('INTERNAL_ERROR', 'Failed to fetch payout details')
  }
}

/**
 * PUT /api/creators/payouts/[id]
 * Cancel a pending payout (creators can only cancel pending payouts)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'CREATOR_PAYOUT_UPDATE')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    // Parse request body
    const body = await request.json()
    const { action } = body

    if (action !== 'cancel') {
      return fail('BAD_REQUEST', 'Only cancel action is supported')
    }

    await connectDB()

    // Find creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('NOT_FOUND', 'Creator not found')
    }

    // Find payout
    const payout = await CreatorPayout.findOne({
      _id: params.id,
      creatorId: creator._id
    })

    if (!payout) {
      return fail('NOT_FOUND', 'Payout not found')
    }

    // Check if payout can be cancelled
    if (payout.status !== 'pending') {
      return fail('BAD_REQUEST', 'Only pending payouts can be cancelled')
    }

    // Cancel the payout
    payout.status = 'failed'
    payout.failureReason = 'Cancelled by creator'
    payout.completedAt = new Date()
    await payout.save()

    // Revert commission transaction status
    const { CommissionTransaction } = await import('@/lib/schemas/creator.schema')
    await CommissionTransaction.updateMany(
      { _id: { $in: payout.transactionIds } },
      { 
        status: 'approved',
        $unset: { paidAt: 1 }
      }
    )

    return success({
      message: 'Payout cancelled successfully',
      payout: payout.toObject()
    })

  } catch (error) {
    console.error('Error cancelling payout:', error)
    return fail('INTERNAL_ERROR', 'Failed to cancel payout')
  }
}