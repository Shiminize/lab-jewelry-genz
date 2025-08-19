/**
 * Creator Conversion Tracking API
 * Handles conversion tracking and commission calculations
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { 
  Creator, 
  ReferralLink, 
  ReferralClick, 
  CommissionTransaction 
} from '@/lib/schemas/creator.schema'

// Validation schema for conversion tracking
const trackConversionSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  orderAmount: z.number().min(0, 'Order amount must be positive'),
  sessionId: z.string().optional(),
  linkId: z.string().optional()
})

// POST - Track a conversion (called when an order is completed)
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = trackConversionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse('Invalid conversion data', 400, 'VALIDATION_ERROR', {
        details: validationResult.error.errors
      })
    }

    const { orderId, orderAmount, sessionId, linkId } = validationResult.data

    await connectToDatabase()

    // Try to find referral click by session ID or link ID from cookies
    let referralClick: any = null
    let referralLink: any = null

    if (sessionId) {
      referralClick = await ReferralClick.findOne({ 
        sessionId,
        converted: false 
      }).sort({ clickedAt: -1 })
    }

    if (!referralClick && linkId) {
      referralClick = await ReferralClick.findOne({ 
        linkId,
        converted: false 
      }).sort({ clickedAt: -1 })
    }

    if (!referralClick) {
      return successResponse({
        message: 'No referral attribution found',
        code: 'NO_REFERRAL_FOUND'
      })
    }

    // Get referral link and creator
    referralLink = await ReferralLink.findById(referralClick.linkId)
    if (!referralLink) {
      return errorResponse('Referral link not found', 404, 'REFERRAL_LINK_NOT_FOUND')
    }

    const creator = await Creator.findById(referralLink.creatorId)
    if (!creator) {
      return errorResponse('Creator not found', 404, 'CREATOR_NOT_FOUND')
    }

    // Check if conversion already exists for this order
    const existingTransaction = await CommissionTransaction.findOne({ orderId })
    if (existingTransaction) {
      return successResponse({
        message: 'Conversion already tracked',
        code: 'CONVERSION_ALREADY_TRACKED',
        transactionId: existingTransaction._id
      })
    }

    // Calculate commission
    const commissionRate = creator.commissionRate
    const commissionAmount = (orderAmount * commissionRate) / 100

    // Create commission transaction
    const commissionTransaction = new CommissionTransaction({
      creatorId: creator._id,
      orderId,
      linkId: referralLink._id,
      clickId: referralClick._id,
      commissionRate,
      orderAmount,
      commissionAmount,
      status: 'pending',
      type: 'sale'
    })

    await commissionTransaction.save()

    // Mark click as converted
    await ReferralClick.findByIdAndUpdate(referralClick._id, {
      converted: true,
      orderId,
      conversionValue: orderAmount
    })

    // Update link conversion count
    await ReferralLink.findByIdAndUpdate(referralLink._id, {
      $inc: { conversionCount: 1 }
    })

    // Update creator metrics
    await creator.updateMetrics()

    return successResponse({
      message: 'Conversion tracked successfully',
      code: 'CONVERSION_TRACKED',
      transaction: {
        id: commissionTransaction._id,
        creatorId: creator._id,
        creatorCode: creator.creatorCode,
        commissionAmount,
        commissionRate,
        orderAmount,
        status: commissionTransaction.status
      }
    })

  } catch (error) {
    console.error('Track conversion error:', error)
    return handleApiError(error)
  }
}

// GET - Get conversion statistics for a creator
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = Math.min(parseInt(period), 365)

    await connectToDatabase()

    // Check if user is a creator
    const creator = await Creator.findOne({ userId: session.user.id })
    if (!creator) {
      return errorResponse('Creator account not found', 404, 'CREATOR_NOT_FOUND')
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get conversion statistics
    const [totalStats, periodStats, recentTransactions] = await Promise.all([
      // All-time stats
      CommissionTransaction.aggregate([
        { $match: { creatorId: creator._id, status: { $in: ['approved', 'paid'] } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalCommission: { $sum: '$commissionAmount' },
            totalOrderValue: { $sum: '$orderAmount' }
          }
        }
      ]),

      // Period stats
      CommissionTransaction.aggregate([
        { 
          $match: { 
            creatorId: creator._id, 
            status: { $in: ['approved', 'paid'] },
            createdAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: null,
            periodSales: { $sum: 1 },
            periodCommission: { $sum: '$commissionAmount' },
            periodOrderValue: { $sum: '$orderAmount' }
          }
        }
      ]),

      // Recent transactions
      CommissionTransaction.find({ creatorId: creator._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderId commissionAmount orderAmount status createdAt type')
    ])

    // Get click statistics
    const clickStats = await ReferralClick.aggregate([
      { $match: { creatorId: creator._id, clickedAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          conversions: { $sum: { $cond: ['$converted', 1, 0] } }
        }
      }
    ])

    const stats = {
      allTime: totalStats[0] || { totalSales: 0, totalCommission: 0, totalOrderValue: 0 },
      period: periodStats[0] || { periodSales: 0, periodCommission: 0, periodOrderValue: 0 },
      clicks: clickStats[0] || { totalClicks: 0, conversions: 0 },
      conversionRate: clickStats[0] 
        ? ((clickStats[0].conversions / clickStats[0].totalClicks) * 100).toFixed(2)
        : '0.00',
      recentTransactions,
      creator: {
        commissionRate: creator.commissionRate,
        minimumPayout: creator.minimumPayout,
        status: creator.status
      }
    }

    return successResponse({
      message: 'Conversion statistics retrieved successfully',
      code: 'CONVERSION_STATS_RETRIEVED',
      stats,
      period: periodDays
    })

  } catch (error) {
    console.error('Get conversion stats error:', error)
    return handleApiError(error)
  }
}