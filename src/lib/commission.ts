/**
 * Commission Calculation and Management Utilities
 * Handles commission calculations, approvals, and payment processing
 */

import { 
  Creator, 
  CommissionTransaction, 
  CreatorPayout, 
  ReferralClick 
} from '@/lib/schemas/creator.schema'
import connectDB from '@/lib/mongodb'
import { sendEmail } from '@/lib/email-service'

// Commission calculation interfaces
export interface CommissionCalculation {
  creatorId: string
  orderId: string
  orderAmount: number
  commissionRate: number
  commissionAmount: number
  isEligible: boolean
  reason?: string
}

export interface PayoutEligibility {
  creatorId: string
  totalEarnings: number
  availableForPayout: number
  minimumPayout: number
  isEligible: boolean
  transactionIds: string[]
}

export interface PayoutRequest {
  creatorId: string
  amount: number
  transactionIds: string[]
  paymentMethod: string
  paymentDetails: string
}

// Commission calculation rules
export const COMMISSION_RULES = {
  // Minimum order amount for commission eligibility
  MIN_ORDER_AMOUNT: 10.00,
  
  // Maximum commission per order
  MAX_COMMISSION_AMOUNT: 1000.00,
  
  // Commission approval delay (hours)
  APPROVAL_DELAY_HOURS: 24,
  
  // Return period for commission clawback (days)
  RETURN_PERIOD_DAYS: 30,
  
  // Minimum payout amounts by method
  MIN_PAYOUT: {
    paypal: 25.00,
    stripe: 10.00,
    bank: 50.00
  },
  
  // Commission tiers based on monthly sales
  COMMISSION_TIERS: [
    { minSales: 0, maxSales: 999, rate: 0.10 },      // 10% for $0-999
    { minSales: 1000, maxSales: 4999, rate: 0.12 },  // 12% for $1000-4999
    { minSales: 5000, maxSales: 9999, rate: 0.15 },  // 15% for $5000-9999
    { minSales: 10000, maxSales: null, rate: 0.18 }   // 18% for $10000+
  ]
}

/**
 * Calculate commission for an order
 */
export async function calculateCommission(
  creatorId: string,
  orderId: string,
  orderAmount: number,
  customCommissionRate?: number
): Promise<CommissionCalculation> {
  try {
    await connectDB()

    // Get creator information
    const creator = await Creator.findById(creatorId)
    if (!creator) {
      return {
        creatorId,
        orderId,
        orderAmount,
        commissionRate: 0,
        commissionAmount: 0,
        isEligible: false,
        reason: 'Creator not found'
      }
    }

    // Check if creator is approved
    if (creator.status !== 'approved') {
      return {
        creatorId,
        orderId,
        orderAmount,
        commissionRate: 0,
        commissionAmount: 0,
        isEligible: false,
        reason: 'Creator not approved'
      }
    }

    // Check minimum order amount
    if (orderAmount < COMMISSION_RULES.MIN_ORDER_AMOUNT) {
      return {
        creatorId,
        orderId,
        orderAmount,
        commissionRate: 0,
        commissionAmount: 0,
        isEligible: false,
        reason: `Order amount below minimum $${COMMISSION_RULES.MIN_ORDER_AMOUNT}`
      }
    }

    // Determine commission rate
    let commissionRate = customCommissionRate || creator.commissionRate

    // Apply tier-based commission if no custom rate
    if (!customCommissionRate) {
      const tierRate = await getCommissionTier(creatorId)
      if (tierRate > commissionRate) {
        commissionRate = tierRate
      }
    }

    // Calculate commission amount
    let commissionAmount = (orderAmount * commissionRate) / 100

    // Apply maximum commission cap
    if (commissionAmount > COMMISSION_RULES.MAX_COMMISSION_AMOUNT) {
      commissionAmount = COMMISSION_RULES.MAX_COMMISSION_AMOUNT
    }

    return {
      creatorId,
      orderId,
      orderAmount,
      commissionRate,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      isEligible: true
    }

  } catch (error) {
    console.error('Error calculating commission:', error)
    return {
      creatorId,
      orderId,
      orderAmount,
      commissionRate: 0,
      commissionAmount: 0,
      isEligible: false,
      reason: 'Calculation error'
    }
  }
}

/**
 * Get commission tier based on monthly sales
 */
async function getCommissionTier(creatorId: string): Promise<number> {
  try {
    // Get current month sales
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlySales = await CommissionTransaction.aggregate([
      {
        $match: {
          creatorId,
          status: { $in: ['approved', 'paid'] },
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$orderAmount' }
        }
      }
    ])

    const totalMonthlySales = monthlySales[0]?.totalSales || 0

    // Find appropriate tier
    const tier = COMMISSION_RULES.COMMISSION_TIERS.find(t => 
      totalMonthlySales >= t.minSales && 
      (t.maxSales === null || totalMonthlySales <= t.maxSales)
    )

    return tier ? tier.rate * 100 : 10 // Default 10%

  } catch (error) {
    console.error('Error getting commission tier:', error)
    return 10 // Default 10%
  }
}

/**
 * Create commission transaction
 */
export async function createCommissionTransaction(
  calculation: CommissionCalculation,
  linkId: string,
  clickId: string
): Promise<string | null> {
  try {
    await connectDB()

    // Check if transaction already exists
    const existing = await CommissionTransaction.findOne({ 
      orderId: calculation.orderId 
    })
    
    if (existing) {
      return existing._id.toString()
    }

    const transaction = new CommissionTransaction({
      creatorId: calculation.creatorId,
      orderId: calculation.orderId,
      linkId,
      clickId,
      commissionRate: calculation.commissionRate,
      orderAmount: calculation.orderAmount,
      commissionAmount: calculation.commissionAmount,
      status: 'pending',
      type: 'sale'
    })

    await transaction.save()
    return transaction._id.toString()

  } catch (error) {
    console.error('Error creating commission transaction:', error)
    return null
  }
}

/**
 * Approve commission transactions
 */
export async function approveCommissions(
  transactionIds: string[],
  adminId?: string
): Promise<{ approved: number, failed: number }> {
  try {
    await connectDB()

    const approvalDate = new Date()
    let approved = 0
    let failed = 0

    for (const transactionId of transactionIds) {
      try {
        const transaction = await CommissionTransaction.findById(transactionId)
        
        if (transaction && transaction.status === 'pending') {
          transaction.status = 'approved'
          transaction.processedAt = approvalDate
          await transaction.save()
          approved++

          // Update creator metrics
          const creator = await Creator.findById(transaction.creatorId)
          if (creator) {
            await creator.updateMetrics()
          }

          // Send notification email
          await sendCommissionApprovalEmail(transaction)
        }
      } catch (error) {
        console.error(`Error approving transaction ${transactionId}:`, error)
        failed++
      }
    }

    return { approved, failed }

  } catch (error) {
    console.error('Error approving commissions:', error)
    return { approved: 0, failed: transactionIds.length }
  }
}

/**
 * Check payout eligibility for a creator
 */
export async function checkPayoutEligibility(creatorId: string): Promise<PayoutEligibility> {
  try {
    await connectDB()

    const creator = await Creator.findById(creatorId)
    if (!creator) {
      return {
        creatorId,
        totalEarnings: 0,
        availableForPayout: 0,
        minimumPayout: 0,
        isEligible: false,
        transactionIds: []
      }
    }

    // Get approved transactions that haven't been paid out
    const eligibleTransactions = await CommissionTransaction.find({
      creatorId,
      status: 'approved',
      paidAt: { $exists: false }
    })

    const totalEarnings = creator.metrics.totalCommission
    const availableForPayout = eligibleTransactions.reduce(
      (sum, t) => sum + t.commissionAmount, 0
    )
    const minimumPayout = creator.minimumPayout
    const transactionIds = eligibleTransactions.map(t => t._id.toString())

    return {
      creatorId,
      totalEarnings,
      availableForPayout: Math.round(availableForPayout * 100) / 100,
      minimumPayout,
      isEligible: availableForPayout >= minimumPayout,
      transactionIds
    }

  } catch (error) {
    console.error('Error checking payout eligibility:', error)
    return {
      creatorId,
      totalEarnings: 0,
      availableForPayout: 0,
      minimumPayout: 0,
      isEligible: false,
      transactionIds: []
    }
  }
}

/**
 * Process payout request
 */
export async function processPayoutRequest(request: PayoutRequest): Promise<{
  success: boolean
  payoutId?: string
  error?: string
}> {
  try {
    await connectDB()

    // Validate creator and eligibility
    const eligibility = await checkPayoutEligibility(request.creatorId)
    
    if (!eligibility.isEligible) {
      return {
        success: false,
        error: 'Creator not eligible for payout'
      }
    }

    if (request.amount > eligibility.availableForPayout) {
      return {
        success: false,
        error: 'Payout amount exceeds available balance'
      }
    }

    // Create payout record
    const payout = new CreatorPayout({
      creatorId: request.creatorId,
      amount: request.amount,
      currency: 'USD',
      transactionIds: request.transactionIds,
      paymentMethod: request.paymentMethod,
      paymentDetails: request.paymentDetails,
      status: 'pending',
      payoutDate: new Date()
    })

    await payout.save()

    // Mark transactions as being paid out
    await CommissionTransaction.updateMany(
      { _id: { $in: request.transactionIds } },
      { 
        status: 'paid',
        paidAt: new Date()
      }
    )

    // Process payment (integrate with payment processor)
    const paymentResult = await processPayment(payout)

    if (paymentResult.success) {
      payout.status = 'completed'
      payout.completedAt = new Date()
      payout.paymentReference = paymentResult.reference
      await payout.save()

      // Send confirmation email
      await sendPayoutConfirmationEmail(payout)

      return {
        success: true,
        payoutId: payout._id.toString()
      }
    } else {
      // Revert transaction status on payment failure
      await CommissionTransaction.updateMany(
        { _id: { $in: request.transactionIds } },
        { 
          status: 'approved',
          $unset: { paidAt: 1 }
        }
      )

      payout.status = 'failed'
      payout.failureReason = paymentResult.error
      await payout.save()

      return {
        success: false,
        error: paymentResult.error
      }
    }

  } catch (error) {
    console.error('Error processing payout:', error)
    return {
      success: false,
      error: 'Payout processing failed'
    }
  }
}

/**
 * Process payment via payment processor
 */
async function processPayment(payout: any): Promise<{
  success: boolean
  reference?: string
  error?: string
}> {
  try {

    // Parse payment details
    let paymentDetails: any = {}
    try {
      paymentDetails = JSON.parse(payout.paymentDetails)
    } catch (error) {
      console.error('Invalid payment details JSON:', error)
      return {
        success: false,
        error: 'Invalid payment details'
      }
    }

    switch (payout.paymentMethod) {
      case 'stripe':
        return await processStripeConnect(payout, paymentDetails)
      case 'paypal':
        return await processPayPalPayout(payout, paymentDetails)
      case 'bank':
        return await processBankTransfer(payout, paymentDetails)
      default:
        return {
          success: false,
          error: 'Unsupported payment method'
        }
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return {
      success: false,
      error: 'Payment failed'
    }
  }
}

/**
 * Process Stripe Connect payout
 */
async function processStripeConnect(payout: any, paymentDetails: any): Promise<{
  success: boolean
  reference?: string
  error?: string
}> {
  try {
    // In development, simulate the Stripe Connect process
    if (process.env.NODE_ENV === 'development') {

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05
      
      if (isSuccess) {
        return {
          success: true,
          reference: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        return {
          success: false,
          error: 'Stripe Connect transfer failed'
        }
      }
    }

    // In production, use actual Stripe Connect API
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(payout.amount * 100), // Convert to cents
      currency: 'usd',
      destination: paymentDetails.stripeAccountId, // Creator's Stripe Connect account
      description: `Commission payout for ${payout.creatorId}`
    })

    return {
      success: true,
      reference: transfer.id
    }

  } catch (error) {
    console.error('Stripe Connect error:', error)
    return {
      success: false,
      error: 'Stripe payment failed'
    }
  }
}

/**
 * Process PayPal payout
 */
async function processPayPalPayout(payout: any, paymentDetails: any): Promise<{
  success: boolean
  reference?: string
  error?: string
}> {
  try {
    // In development, simulate PayPal payout
    if (process.env.NODE_ENV === 'development') {

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate 98% success rate (PayPal is generally more reliable)
      const isSuccess = Math.random() > 0.02
      
      if (isSuccess) {
        return {
          success: true,
          reference: `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        return {
          success: false,
          error: 'PayPal payout failed'
        }
      }
    }

    // In production, use PayPal Payouts API
    // This would require PayPal SDK and proper authentication
    // const paypalPayout = await paypal.payouts.create({
    //   sender_batch_header: {
    //     sender_batch_id: `batch_${payout._id}`,
    //     email_subject: 'You have a payout!',
    //     email_message: 'You have received a payout from GlowGlitch!'
    //   },
    //   items: [{
    //     recipient_type: 'EMAIL',
    //     amount: {
    //       value: payout.amount.toFixed(2),
    //       currency: 'USD'
    //     },
    //     receiver: paymentDetails.email,
    //     note: 'Commission payout',
    //     sender_item_id: payout._id
    //   }]
    // })

    return {
      success: true,
      reference: `paypal_dev_${Date.now()}`
    }

  } catch (error) {
    console.error('PayPal error:', error)
    return {
      success: false,
      error: 'PayPal payment failed'
    }
  }
}

/**
 * Process bank transfer
 */
async function processBankTransfer(payout: any, paymentDetails: any): Promise<{
  success: boolean
  reference?: string
  error?: string
}> {
  try {
    // In development, simulate bank transfer
    if (process.env.NODE_ENV === 'development') {

      // Simulate processing delay (bank transfers take longer)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulate 90% success rate (bank transfers can be more prone to issues)
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        return {
          success: true,
          reference: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        return {
          success: false,
          error: 'Bank transfer failed - invalid account information'
        }
      }
    }

    // In production, use ACH transfer API like Plaid or Stripe ACH
    // This would require proper bank account verification
    
    return {
      success: true,
      reference: `bank_dev_${Date.now()}`
    }

  } catch (error) {
    console.error('Bank transfer error:', error)
    return {
      success: false,
      error: 'Bank transfer failed'
    }
  }
}

/**
 * Handle order returns and commission clawback
 */
export async function handleOrderReturn(
  orderId: string,
  returnAmount: number,
  reason: string
): Promise<{ success: boolean, transactionId?: string }> {
  try {
    await connectDB()

    // Find the original commission transaction
    const originalTransaction = await CommissionTransaction.findOne({ orderId })
    
    if (!originalTransaction) {
      return { success: false }
    }

    // Calculate clawback amount
    const clawbackRate = returnAmount / originalTransaction.orderAmount
    const clawbackAmount = originalTransaction.commissionAmount * clawbackRate

    // Create return transaction
    const returnTransaction = new CommissionTransaction({
      creatorId: originalTransaction.creatorId,
      orderId,
      linkId: originalTransaction.linkId,
      clickId: originalTransaction.clickId,
      commissionRate: originalTransaction.commissionRate,
      orderAmount: -returnAmount,
      commissionAmount: -clawbackAmount,
      status: 'approved',
      type: 'return',
      notes: reason
    })

    await returnTransaction.save()

    // Update creator metrics
    const creator = await Creator.findById(originalTransaction.creatorId)
    if (creator) {
      await creator.updateMetrics()
    }

    return {
      success: true,
      transactionId: returnTransaction._id.toString()
    }

  } catch (error) {
    console.error('Error handling order return:', error)
    return { success: false }
  }
}

/**
 * Send commission approval email
 */
async function sendCommissionApprovalEmail(transaction: any): Promise<void> {
  try {
    const creator = await Creator.findById(transaction.creatorId)
    if (!creator || !creator.settings.emailNotifications) return

    // In production, implement actual email sending
    // await sendEmail({
    //   to: creator.email,
    //   subject: `Commission Approved - $${transaction.commissionAmount}`,
    //   template: 'commission-approval',
    //   data: { creator, transaction }
    // })

  } catch (error) {
    console.error('Error sending commission approval email:', error)
  }
}

/**
 * Send payout confirmation email
 */
async function sendPayoutConfirmationEmail(payout: any): Promise<void> {
  try {
    const creator = await Creator.findById(payout.creatorId)
    if (!creator || !creator.settings.emailNotifications) return

    // In production, implement actual email sending
    // await sendEmail({
    //   to: creator.email,
    //   subject: `Payout Completed - $${payout.amount}`,
    //   template: 'payout-confirmation',
    //   data: { creator, payout }
    // })

  } catch (error) {
    console.error('Error sending payout confirmation email:', error)
  }
}

/**
 * Get commission analytics for admin dashboard
 */
export async function getCommissionAnalytics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalCommissions: number
  totalPayouts: number
  pendingCommissions: number
  activeCreators: number
  topCreators: Array<{
    creatorId: string
    displayName: string
    totalCommissions: number
    totalSales: number
  }>
}> {
  try {
    await connectDB()

    const [
      commissionStats,
      payoutStats,
      pendingStats,
      activeCreatorCount,
      topCreators
    ] = await Promise.all([
      // Total commissions in period
      CommissionTransaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['approved', 'paid'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$commissionAmount' }
          }
        }
      ]),

      // Total payouts in period
      CreatorPayout.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),

      // Pending commissions
      CommissionTransaction.aggregate([
        {
          $match: { status: 'pending' }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$commissionAmount' }
          }
        }
      ]),

      // Active creators count
      Creator.countDocuments({ status: 'approved' }),

      // Top creators by commission
      CommissionTransaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['approved', 'paid'] }
          }
        },
        {
          $group: {
            _id: '$creatorId',
            totalCommissions: { $sum: '$commissionAmount' },
            totalSales: { $sum: 1 }
          }
        },
        { $sort: { totalCommissions: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'creators',
            localField: '_id',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $project: {
            creatorId: '$_id',
            displayName: { $arrayElemAt: ['$creator.displayName', 0] },
            totalCommissions: 1,
            totalSales: 1
          }
        }
      ])
    ])

    return {
      totalCommissions: commissionStats[0]?.total || 0,
      totalPayouts: payoutStats[0]?.total || 0,
      pendingCommissions: pendingStats[0]?.total || 0,
      activeCreators: activeCreatorCount,
      topCreators
    }

  } catch (error) {
    console.error('Error getting commission analytics:', error)
    return {
      totalCommissions: 0,
      totalPayouts: 0,
      pendingCommissions: 0,
      activeCreators: 0,
      topCreators: []
    }
  }
}