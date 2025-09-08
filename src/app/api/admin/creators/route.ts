import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse, checkAPIRateLimit } from '@/lib/api-utils'
import { Creator, ReferralLink, CommissionTransaction, CreatorPayout } from '@/lib/schemas/creator.schema'
import { connectToDatabase } from '@/lib/mongoose'

// Admin-specific creator management endpoints
// Provides aggregated data, approval workflows, and admin controls

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for admin endpoints
    const rateLimitResult = await checkAPIRateLimit(request, 'ADMIN_CREATORS')
    if (!rateLimitResult.allowed) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', [], 429)
    }

    // Admin authentication check (development bypass)
    if (process.env.NODE_ENV === 'development') {

    } else {
      const session = await auth()
      if (!session?.user || session.user.role !== 'admin') {
        return createErrorResponse('UNAUTHORIZED', 'Admin access required', [], 401)
      }
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') // pending, approved, suspended, inactive
    const search = searchParams.get('search') // Search by name, email, code
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const tier = searchParams.get('tier') // Filter by performance tier

    // Build filter query
    const filter: any = {}
    
    if (status) filter.status = status
    
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { creatorCode: { $regex: search, $options: 'i' } }
      ]
    }

    // Performance tier filtering based on monthly sales
    if (tier) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      // Get creators with their monthly sales
      const creatorsWithSales = await CommissionTransaction.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['approved', 'paid'] }
          }
        },
        {
          $group: {
            _id: '$creatorId',
            monthlySales: { $sum: '$orderAmount' }
          }
        }
      ])

      const tierRanges: Record<string, [number, number | null]> = {
        bronze: [0, 999],
        silver: [1000, 4999],
        gold: [5000, 9999],
        platinum: [10000, null]
      }

      if (tierRanges[tier]) {
        const [min, max] = tierRanges[tier]
        const tierCreatorIds = creatorsWithSales
          .filter(c => c.monthlySales >= min && (max === null || c.monthlySales <= max))
          .map(c => c._id)
        
        filter._id = { $in: tierCreatorIds }
      }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Execute queries
    const skip = (page - 1) * limit
    
    const [creators, totalCount, metrics] = await Promise.all([
      // Get creators with populated data
      Creator.find(filter)
        .select('-paymentInfo.details') // Exclude sensitive payment details
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Creator.countDocuments(filter),
      
      // Get aggregate metrics
      Creator.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    // Get additional metrics for each creator
    const creatorIds = creators.map(c => c._id)
    
    const [linkStats, commissionStats, payoutStats] = await Promise.all([
      // Link statistics
      ReferralLink.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        {
          $group: {
            _id: '$creatorId',
            totalLinks: { $sum: 1 },
            totalClicks: { $sum: '$clickCount' },
            totalConversions: { $sum: '$conversionCount' }
          }
        }
      ]),
      
      // Commission statistics
      CommissionTransaction.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        {
          $group: {
            _id: '$creatorId',
            pendingCommissions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$commissionAmount', 0]
              }
            },
            approvedCommissions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'approved'] }, '$commissionAmount', 0]
              }
            },
            paidCommissions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$commissionAmount', 0]
              }
            },
            totalCommissions: { $sum: '$commissionAmount' }
          }
        }
      ]),
      
      // Payout statistics
      CreatorPayout.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        {
          $group: {
            _id: '$creatorId',
            totalPayouts: { $sum: '$amount' },
            lastPayoutDate: { $max: '$payoutDate' }
          }
        }
      ])
    ])

    // Merge statistics with creators
    const enrichedCreators = creators.map(creator => {
      const links = linkStats.find(l => l._id.toString() === creator._id.toString())
      const commissions = commissionStats.find(c => c._id.toString() === creator._id.toString())
      const payouts = payoutStats.find(p => p._id.toString() === creator._id.toString())
      
      return {
        ...creator,
        stats: {
          totalLinks: links?.totalLinks || 0,
          totalClicks: links?.totalClicks || 0,
          totalConversions: links?.totalConversions || 0,
          pendingCommissions: commissions?.pendingCommissions || 0,
          approvedCommissions: commissions?.approvedCommissions || 0,
          paidCommissions: commissions?.paidCommissions || 0,
          totalCommissions: commissions?.totalCommissions || 0,
          totalPayouts: payouts?.totalPayouts || 0,
          lastPayoutDate: payouts?.lastPayoutDate
        }
      }
    })

    // Calculate overall metrics
    const overallMetrics = {
      statusDistribution: metrics.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as any),
      totalCreators: totalCount,
      pendingApplications: metrics.find(m => m._id === 'pending')?.count || 0,
      activeCreators: metrics.find(m => m._id === 'approved')?.count || 0
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)

    return createSuccessResponse({
      creators: enrichedCreators,
      metrics: overallMetrics,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Admin creators fetch error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch creators', [], 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkAPIRateLimit(request, 'ADMIN_CREATORS')
    if (!rateLimitResult.allowed) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', [], 429)
    }

    // Admin authentication check (development bypass)
    if (process.env.NODE_ENV === 'development') {

    } else {
      const session = await auth()
      if (!session?.user || session.user.role !== 'admin') {
        return createErrorResponse('UNAUTHORIZED', 'Admin access required', [], 401)
      }
    }

    await connectToDatabase()

    const body = await request.json()
    const { action, creatorIds, updates } = body

    if (!action || !Array.isArray(creatorIds) || creatorIds.length === 0) {
      return createErrorResponse('INVALID_INPUT', 'Action and creator IDs required', [], 400)
    }

    switch (action) {
      case 'approve': {
        // Approve pending creators
        const result = await Creator.updateMany(
          { 
            _id: { $in: creatorIds },
            status: 'pending'
          },
          {
            status: 'approved',
            approvedAt: new Date(),
            $set: { notes: updates?.notes }
          }
        )

        // TODO: Send approval emails to creators

        return createSuccessResponse({
          modifiedCount: result.modifiedCount,
          message: `Approved ${result.modifiedCount} creators`
        })
      }

      case 'suspend': {
        // Suspend creators
        const result = await Creator.updateMany(
          { 
            _id: { $in: creatorIds },
            status: { $ne: 'suspended' }
          },
          {
            status: 'suspended',
            suspendedAt: new Date(),
            $set: { notes: updates?.reason || 'Suspended by admin' }
          }
        )

        // Deactivate all their referral links
        await ReferralLink.updateMany(
          { creatorId: { $in: creatorIds } },
          { isActive: false }
        )

        return createSuccessResponse({
          modifiedCount: result.modifiedCount,
          message: `Suspended ${result.modifiedCount} creators`
        })
      }

      case 'reactivate': {
        // Reactivate suspended creators
        const result = await Creator.updateMany(
          { 
            _id: { $in: creatorIds },
            status: 'suspended'
          },
          {
            status: 'approved',
            $unset: { suspendedAt: 1 },
            $set: { notes: 'Reactivated by admin' }
          }
        )

        // Reactivate their referral links
        await ReferralLink.updateMany(
          { creatorId: { $in: creatorIds } },
          { isActive: true }
        )

        return createSuccessResponse({
          modifiedCount: result.modifiedCount,
          message: `Reactivated ${result.modifiedCount} creators`
        })
      }

      case 'update-commission-rate': {
        // Update commission rates
        const { commissionRate } = updates
        if (!commissionRate || commissionRate < 0 || commissionRate > 50) {
          return createErrorResponse('INVALID_INPUT', 'Invalid commission rate', [], 400)
        }

        const result = await Creator.updateMany(
          { _id: { $in: creatorIds } },
          { commissionRate }
        )

        return createSuccessResponse({
          modifiedCount: result.modifiedCount,
          message: `Updated commission rate for ${result.modifiedCount} creators`
        })
      }

      case 'update-minimum-payout': {
        // Update minimum payout threshold
        const { minimumPayout } = updates
        if (!minimumPayout || minimumPayout < 10) {
          return createErrorResponse('INVALID_INPUT', 'Invalid minimum payout', [], 400)
        }

        const result = await Creator.updateMany(
          { _id: { $in: creatorIds } },
          { minimumPayout }
        )

        return createSuccessResponse({
          modifiedCount: result.modifiedCount,
          message: `Updated minimum payout for ${result.modifiedCount} creators`
        })
      }

      case 'export': {
        // Export creator data for reporting
        const creators = await Creator.find({ _id: { $in: creatorIds } })
          .select('-paymentInfo.details')
          .lean()

        const exportData = creators.map(creator => ({
          creatorCode: creator.creatorCode,
          displayName: creator.displayName,
          email: creator.email,
          status: creator.status,
          commissionRate: creator.commissionRate,
          totalClicks: creator.metrics.totalClicks,
          totalSales: creator.metrics.totalSales,
          totalCommission: creator.metrics.totalCommission,
          conversionRate: creator.metrics.conversionRate,
          createdAt: creator.createdAt,
          approvedAt: creator.approvedAt
        }))

        return createSuccessResponse({
          exportData,
          format: 'csv',
          filename: `creators-export-${new Date().toISOString().split('T')[0]}.csv`
        })
      }

      default:
        return createErrorResponse('INVALID_ACTION', 'Invalid action', [], 400)
    }

  } catch (error) {
    console.error('Admin creators update error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Update operation failed', [], 500)
  }
}