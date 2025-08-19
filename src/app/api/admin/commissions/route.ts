import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { fail, success } from '@/lib/api-utils'
import { checkAPIRateLimit } from '@/lib/rate-limiting'
import { approveCommissions, getCommissionAnalytics } from '@/lib/commission'
import { CommissionTransaction, Creator } from '@/lib/schemas/creator.schema'
import connectDB from '@/lib/mongodb'
import { z } from 'zod'

const commissionFiltersSchema = z.object({
  status: z.enum(['all', 'pending', 'approved', 'paid', 'cancelled']).optional().default('all'),
  creatorId: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.enum(['createdAt', 'commissionAmount', 'orderAmount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

const approveCommissionsSchema = z.object({
  transactionIds: z.array(z.string()).min(1),
  adminNotes: z.string().optional()
})

/**
 * GET /api/admin/commissions
 * Get commission transactions with admin filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'ADMIN_COMMISSIONS')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication and admin role
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    // TODO: Add proper admin role check
    // For now, we'll assume all authenticated users are admins for development
    // In production, you'd check: if (!session.user.role?.includes('admin'))

    // Parse query parameters
    const url = new URL(request.url)
    const query = commissionFiltersSchema.parse({
      status: url.searchParams.get('status') || 'all',
      creatorId: url.searchParams.get('creatorId') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '20',
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined
    })

    await connectDB()

    // Build query
    const mongoQuery: any = {}
    
    if (query.status !== 'all') {
      mongoQuery.status = query.status
    }
    
    if (query.creatorId) {
      mongoQuery.creatorId = query.creatorId
    }
    
    if (query.startDate || query.endDate) {
      mongoQuery.createdAt = {}
      if (query.startDate) {
        mongoQuery.createdAt.$gte = new Date(query.startDate)
      }
      if (query.endDate) {
        mongoQuery.createdAt.$lte = new Date(query.endDate)
      }
    }

    // Calculate pagination
    const page = Math.max(1, parseInt(query.page))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit)))
    const skip = (page - 1) * limit

    // Build sort
    const sortField = query.sortBy
    const sort = { [sortField]: query.sortOrder === 'asc' ? 1 : -1 }

    // Execute queries with creator lookup
    const [transactions, total] = await Promise.all([
      CommissionTransaction.aggregate([
        { $match: mongoQuery },
        {
          $lookup: {
            from: 'creators',
            localField: 'creatorId',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            creatorName: { $arrayElemAt: ['$creator.displayName', 0] },
            creatorCode: { $arrayElemAt: ['$creator.creatorCode', 0] }
          }
        },
        { $project: { creator: 0 } },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ]),
      CommissionTransaction.countDocuments(mongoQuery)
    ])

    // Get analytics for date range
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = query.endDate ? new Date(query.endDate) : new Date()
    const analytics = await getCommissionAnalytics(startDate, endDate)

    return success({
      transactions,
      analytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching admin commissions:', error)
    return fail('INTERNAL_ERROR', 'Failed to fetch commissions')
  }
}

/**
 * POST /api/admin/commissions
 * Bulk approve commission transactions
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkAPIRateLimit(request, 'ADMIN_COMMISSION_APPROVE')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Check authentication and admin role
    const session = await auth()
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required')
    }

    // TODO: Add proper admin role check
    // For now, we'll assume all authenticated users are admins for development

    // Parse and validate request body
    const body = await request.json()
    const validatedData = approveCommissionsSchema.parse(body)

    await connectDB()

    // Approve commissions
    const result = await approveCommissions(
      validatedData.transactionIds,
      session.user.id
    )

    return success({
      message: `Approved ${result.approved} transactions, ${result.failed} failed`,
      approved: result.approved,
      failed: result.failed
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail('VALIDATION_ERROR', 'Invalid request data', error.errors)
    }

    console.error('Error approving commissions:', error)
    return fail('INTERNAL_ERROR', 'Failed to approve commissions')
  }
}