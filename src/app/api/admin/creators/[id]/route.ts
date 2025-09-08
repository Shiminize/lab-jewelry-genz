import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse, checkAPIRateLimit } from '@/lib/api-utils'
import { Creator, ReferralLink, CommissionTransaction, CreatorPayout, ReferralClick } from '@/lib/schemas/creator.schema'
import { connectToDatabase } from '@/lib/mongoose'

// Individual creator management for admin
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const creatorId = params.id

    // Get creator with detailed information
    const creator = await Creator.findById(creatorId)
      .select('-paymentInfo.details') // Exclude sensitive payment details in listing
    
    if (!creator) {
      return createErrorResponse('CREATOR_NOT_FOUND', 'Creator not found', [], 404)
    }

    // Get comprehensive analytics for this creator
    const [
      referralLinks,
      recentClicks,
      commissionStats,
      recentTransactions,
      payoutHistory,
      performanceAnalytics
    ] = await Promise.all([
      // Get all referral links
      ReferralLink.find({ creatorId })
        .populate('productId', 'name price')
        .sort({ createdAt: -1 })
        .limit(50),

      // Recent clicks (last 100)
      ReferralClick.find({ creatorId })
        .populate('linkId', 'shortUrl title')
        .sort({ clickedAt: -1 })
        .limit(100),

      // Commission statistics
      CommissionTransaction.aggregate([
        { $match: { creatorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$commissionAmount' }
          }
        }
      ]),

      // Recent commission transactions
      CommissionTransaction.find({ creatorId })
        .populate('orderId', 'orderNumber total')
        .sort({ createdAt: -1 })
        .limit(50),

      // Payout history
      CreatorPayout.find({ creatorId })
        .sort({ payoutDate: -1 })
        .limit(20),

      // Performance analytics (last 30 days)
      CommissionTransaction.aggregate([
        {
          $match: {
            creatorId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            sales: { $sum: 1 },
            revenue: { $sum: '$orderAmount' },
            commission: { $sum: '$commissionAmount' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ])

    // Calculate summary metrics
    const summaryMetrics = {
      totalLinks: referralLinks.length,
      activeLinks: referralLinks.filter(link => link.isActive).length,
      totalClicks: referralLinks.reduce((sum, link) => sum + link.clickCount, 0),
      totalConversions: referralLinks.reduce((sum, link) => sum + link.conversionCount, 0),
      conversionRate: 0,
      
      commissionBreakdown: commissionStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          total: stat.totalAmount
        }
        return acc
      }, {} as any),
      
      totalEarnings: recentTransactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + t.commissionAmount, 0),
      
      pendingEarnings: recentTransactions
        .filter(t => t.status === 'approved')
        .reduce((sum, t) => sum + t.commissionAmount, 0),
      
      totalPayouts: payoutHistory
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      
      lastPayoutDate: payoutHistory.find(p => p.status === 'completed')?.payoutDate,
      
      performance30Days: performanceAnalytics
    }

    // Calculate conversion rate
    const totalClicks = summaryMetrics.totalClicks
    const totalConversions = summaryMetrics.totalConversions
    summaryMetrics.conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    // Get creator's tier based on monthly performance
    let tier = 'bronze'
    const monthlyRevenue = performanceAnalytics.reduce((sum, day) => sum + day.revenue, 0)
    if (monthlyRevenue >= 10000) tier = 'platinum'
    else if (monthlyRevenue >= 5000) tier = 'gold'
    else if (monthlyRevenue >= 1000) tier = 'silver'

    return createSuccessResponse({
      creator: {
        ...creator.toObject(),
        tier,
        paymentInfo: {
          method: creator.paymentInfo.method,
          // Only show partial details for admin security
          details: `***${creator.paymentInfo.details.slice(-4)}`
        }
      },
      metrics: summaryMetrics,
      referralLinks,
      recentClicks: recentClicks.map(click => ({
        ...click.toObject(),
        // Remove sensitive data
        ipAddress: click.ipAddress.replace(/\.\d+$/, '.***'),
        userAgent: click.userAgent.length > 50 ? click.userAgent.slice(0, 50) + '...' : click.userAgent
      })),
      recentTransactions,
      payoutHistory
    })

  } catch (error) {
    console.error('Admin creator detail fetch error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch creator details', [], 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const creatorId = params.id
    const body = await request.json()
    const { action, updates } = body

    const creator = await Creator.findById(creatorId)
    if (!creator) {
      return createErrorResponse('CREATOR_NOT_FOUND', 'Creator not found', [], 404)
    }

    switch (action) {
      case 'update-profile': {
        // Update creator profile information
        const allowedFields = ['displayName', 'bio', 'commissionRate', 'minimumPayout', 'notes']
        const updateData: any = {}
        
        allowedFields.forEach(field => {
          if (updates[field] !== undefined) {
            updateData[field] = updates[field]
          }
        })

        if (Object.keys(updateData).length === 0) {
          return createErrorResponse('INVALID_INPUT', 'No valid fields to update', [], 400)
        }

        // Validate commission rate
        if (updateData.commissionRate && (updateData.commissionRate < 0 || updateData.commissionRate > 50)) {
          return createErrorResponse('INVALID_INPUT', 'Commission rate must be between 0-50%', [], 400)
        }

        // Validate minimum payout
        if (updateData.minimumPayout && updateData.minimumPayout < 10) {
          return createErrorResponse('INVALID_INPUT', 'Minimum payout must be at least $10', [], 400)
        }

        await Creator.findByIdAndUpdate(creatorId, {
          ...updateData,
          updatedAt: new Date()
        })

        return createSuccessResponse({
          message: 'Creator profile updated successfully'
        })
      }

      case 'update-status': {
        // Update creator status with proper workflow
        const { status, reason } = updates
        
        if (!['pending', 'approved', 'suspended', 'inactive'].includes(status)) {
          return createErrorResponse('INVALID_INPUT', 'Invalid status', [], 400)
        }

        const updateData: any = { 
          status,
          updatedAt: new Date()
        }

        if (reason) {
          updateData.notes = reason
        }

        // Handle specific status transitions
        if (status === 'approved' && creator.status === 'pending') {
          updateData.approvedAt = new Date()
        } else if (status === 'suspended') {
          updateData.suspendedAt = new Date()
          
          // Deactivate all referral links
          await ReferralLink.updateMany(
            { creatorId },
            { isActive: false }
          )
        } else if (status === 'approved' && creator.status === 'suspended') {
          updateData.$unset = { suspendedAt: 1 }
          
          // Reactivate referral links
          await ReferralLink.updateMany(
            { creatorId },
            { isActive: true }
          )
        }

        await Creator.findByIdAndUpdate(creatorId, updateData)

        // TODO: Send status change notification email

        return createSuccessResponse({
          message: `Creator status updated to ${status}`
        })
      }

      case 'add-note': {
        // Add admin note to creator
        const { note } = updates
        if (!note) {
          return createErrorResponse('INVALID_INPUT', 'Note content required', [], 400)
        }

        const timestamp = new Date().toISOString()
        const adminNote = `[${timestamp}] ${session.user.email}: ${note}`
        
        await Creator.findByIdAndUpdate(creatorId, {
          $set: {
            notes: creator.notes ? `${creator.notes}\n${adminNote}` : adminNote,
            updatedAt: new Date()
          }
        })

        return createSuccessResponse({
          message: 'Note added successfully'
        })
      }

      case 'trigger-payout': {
        // Manually trigger payout for eligible creator
        const { checkPayoutEligibility, processPayoutRequest } = await import('@/lib/commission')
        
        const eligibility = await checkPayoutEligibility(creatorId)
        
        if (!eligibility.isEligible) {
          return createErrorResponse('PAYOUT_NOT_ELIGIBLE', 'Creator not eligible for payout', [], 400)
        }

        // Get creator payment info for payout
        const creatorWithPayment = await Creator.findById(creatorId)
        if (!creatorWithPayment?.paymentInfo) {
          return createErrorResponse('PAYMENT_INFO_MISSING', 'Creator payment information not found', [], 400)
        }

        const payoutRequest = {
          creatorId,
          amount: eligibility.availableForPayout,
          transactionIds: eligibility.transactionIds,
          paymentMethod: creatorWithPayment.paymentInfo.method,
          paymentDetails: creatorWithPayment.paymentInfo.details
        }

        const result = await processPayoutRequest(payoutRequest)
        
        if (result.success) {
          return createSuccessResponse({
            message: 'Payout processed successfully',
            payoutId: result.payoutId,
            amount: eligibility.availableForPayout
          })
        } else {
          return createErrorResponse('PAYOUT_FAILED', result.error || 'Payout processing failed', [], 500)
        }
      }

      case 'refresh-metrics': {
        // Refresh creator metrics
        await creator.updateMetrics()
        
        return createSuccessResponse({
          message: 'Creator metrics refreshed successfully'
        })
      }

      default:
        return createErrorResponse('INVALID_ACTION', 'Invalid action', [], 400)
    }

  } catch (error) {
    console.error('Admin creator update error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Update operation failed', [], 500)
  }
}