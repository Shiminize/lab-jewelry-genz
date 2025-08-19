import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { fail, success } from '@/lib/api-utils'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { checkPayoutEligibility, processPayoutRequest } from '@/lib/commission'
import { Creator, CreatorPayout } from '@/lib/schemas/creator.schema'
import connectDB from '@/lib/mongodb'
import { z } from 'zod'

const payoutRequestSchema = z.object({
  amount: z.number().min(10).max(10000),
  paymentMethod: z.enum(['paypal', 'stripe', 'bank']),
  paymentDetails: z.string().min(5),
  transactionIds: z.array(z.string()).min(1)
})

const payoutFiltersSchema = z.object({
  status: z.enum(['all', 'pending', 'processing', 'completed', 'failed']).optional().default('all'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.enum(['amount', 'payoutDate', 'completedAt']).optional().default('payoutDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

/**
 * GET /api/creators/payouts
 * Get creator's payout history with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'CREATOR_PAYOUTS')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    // Parse query parameters
    const url = new URL(request.url)
    const query = payoutFiltersSchema.parse({
      status: url.searchParams.get('status') || 'all',
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '20',
      sortBy: url.searchParams.get('sortBy') || 'payoutDate',
      sortOrder: url.searchParams.get('sortOrder') || 'desc'
    })

    await connectDB()

    // Find creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('NOT_FOUND', 'Creator not found')
    }

    // Build query
    const mongoQuery: any = { creatorId: creator._id }
    if (query.status !== 'all') {
      mongoQuery.status = query.status
    }

    // Calculate pagination
    const page = Math.max(1, parseInt(query.page))
    const limit = Math.min(50, Math.max(1, parseInt(query.limit)))
    const skip = (page - 1) * limit

    // Build sort
    const sortField = query.sortBy === 'completedAt' ? 'completedAt' : 
                     query.sortBy === 'amount' ? 'amount' : 'payoutDate'
    const sort = { [sortField]: query.sortOrder === 'asc' ? 1 : -1 }

    // Execute queries
    const [payouts, total] = await Promise.all([
      CreatorPayout.find(mongoQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      CreatorPayout.countDocuments(mongoQuery)
    ])

    // Get eligibility info
    const eligibility = await checkPayoutEligibility(creator._id.toString())

    return success({
      payouts,
      eligibility,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching payouts:', error)
    return fail('INTERNAL_ERROR', 'Failed to fetch payouts')
  }
}

/**
 * POST /api/creators/payouts
 * Request a new payout
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'CREATOR_PAYOUT_REQUEST')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = payoutRequestSchema.parse(body)

    await connectDB()

    // Find creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return fail('NOT_FOUND', 'Creator not found')
    }

    // Check if creator is approved
    if (creator.status !== 'approved') {
      return fail('FORBIDDEN', 'Creator account not approved for payouts')
    }

    // Check eligibility
    const eligibility = await checkPayoutEligibility(creator._id.toString())
    if (!eligibility.isEligible) {
      return fail('BAD_REQUEST', 'Not eligible for payout')
    }

    if (validatedData.amount > eligibility.availableForPayout) {
      return fail('BAD_REQUEST', 'Payout amount exceeds available balance')
    }

    // Check for pending payouts
    const pendingPayout = await CreatorPayout.findOne({
      creatorId: creator._id,
      status: { $in: ['pending', 'processing'] }
    })

    if (pendingPayout) {
      return fail('BAD_REQUEST', 'You already have a pending payout request')
    }

    // Process payout request
    const payoutRequest = {
      creatorId: creator._id.toString(),
      amount: validatedData.amount,
      transactionIds: validatedData.transactionIds,
      paymentMethod: validatedData.paymentMethod,
      paymentDetails: validatedData.paymentDetails
    }

    const result = await processPayoutRequest(payoutRequest)

    if (result.success) {
      return success({
        message: 'Payout request submitted successfully',
        payoutId: result.payoutId
      })
    } else {
      return fail('PAYMENT_ERROR', result.error || 'Failed to process payout')
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail('VALIDATION_ERROR', 'Invalid request data', error.errors)
    }

    console.error('Error processing payout request:', error)
    return fail('INTERNAL_ERROR', 'Failed to process payout request')
  }
}