/**
 * Affiliate Tracking Utilities
 * Handles cookie extraction, conversion tracking, and attribution
 */

import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { ReferralClick, CommissionTransaction, Creator, ReferralLink } from '@/lib/schemas/creator.schema'
import { emitConversionEvent, emitClickEvent } from '@/lib/realtime-analytics'

interface ConversionData {
  orderId: string
  orderAmount: number
  sessionId?: string
  linkId?: string
  customerEmail?: string
}

interface ConversionResult {
  success: boolean
  transaction?: any
  error?: string
}

/**
 * Extract referral tracking cookies from request
 */
export function extractReferralCookies(request: NextRequest) {
  try {
    const refSession = request.cookies.get('ref_session')?.value
    const refLink = request.cookies.get('ref_link')?.value
    
    return {
      sessionId: refSession || null,
      linkId: refLink || null,
      hasAttribution: !!(refSession || refLink)
    }
  } catch (error) {
    console.error('Failed to extract referral cookies:', error)
    return {
      sessionId: null,
      linkId: null,
      hasAttribution: false
    }
  }
}

/**
 * Track conversion and create commission transaction
 */
export async function trackConversion(data: ConversionData): Promise<ConversionResult> {
  try {
    await connectToDatabase()
    
    const { orderId, orderAmount, sessionId, linkId } = data
    
    // Try to find referral click by session ID or link ID
    let referralClick = null
    
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
      return {
        success: false,
        error: 'No referral attribution found'
      }
    }
    
    // Get referral link and creator
    const referralLink = await ReferralLink.findById(referralClick.linkId)
    if (!referralLink) {
      return {
        success: false,
        error: 'Referral link not found'
      }
    }
    
    const creator = await Creator.findById(referralLink.creatorId)
    if (!creator) {
      return {
        success: false,
        error: 'Creator not found'
      }
    }
    
    // Check if conversion already exists for this order
    const existingTransaction = await CommissionTransaction.findOne({ orderId })
    if (existingTransaction) {
      return {
        success: true,
        transaction: existingTransaction,
        error: 'Conversion already tracked'
      }
    }
    
    // Calculate commission
    const commissionRate = creator.commissionRate || 10 // Default 10% if not set
    const commissionAmount = (orderAmount * commissionRate) / 100
    
    // Create commission transaction
    const transaction = new CommissionTransaction({
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
    
    await transaction.save()
    
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
    if (creator.updateMetrics) {
      await creator.updateMetrics()
    }
    
    console.log(`Conversion tracked successfully: Order ${orderId}, Creator ${creator.creatorCode}, Commission $${commissionAmount.toFixed(2)}`)
    
    // Emit real-time conversion event
    emitConversionEvent({
      id: transaction._id.toString(),
      creatorId: creator._id.toString(),
      creatorCode: creator.creatorCode,
      orderAmount,
      commissionAmount,
      commissionRate,
      timestamp: new Date().toISOString(),
      linkId: referralLink._id.toString()
    })
    
    return {
      success: true,
      transaction: {
        id: transaction._id,
        creatorId: creator._id,
        creatorCode: creator.creatorCode,
        commissionAmount,
        commissionRate,
        orderAmount,
        status: transaction.status
      }
    }
    
  } catch (error) {
    console.error('Conversion tracking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Queue failed conversion for retry
 */
export async function queueConversionRetry(
  order: any, 
  sessionId: string | null, 
  linkId: string | null
) {
  try {
    // In production, this would queue to Redis or similar
    // For now, we'll log for manual review
    console.error('Conversion tracking failed, queuing for retry:', {
      orderId: order._id,
      orderAmount: order.totalAmount || order.total,
      sessionId,
      linkId,
      timestamp: new Date().toISOString()
    })
    
    // TODO: Implement actual retry queue (Redis, database table, etc.)
    // Example structure:
    // await redis.lpush('conversion_retry_queue', JSON.stringify({
    //   orderId: order._id,
    //   orderAmount: order.totalAmount || order.total,
    //   sessionId,
    //   linkId,
    //   attempts: 0,
    //   createdAt: new Date()
    // }))
    
  } catch (error) {
    console.error('Failed to queue conversion retry:', error)
  }
}

/**
 * Process conversion from Stripe webhook
 */
export async function processStripeConversion(
  request: NextRequest,
  order: any
): Promise<ConversionResult> {
  try {
    // Extract referral cookies
    const { sessionId, linkId, hasAttribution } = extractReferralCookies(request)
    
    if (!hasAttribution) {
      return {
        success: false,
        error: 'No referral attribution found in cookies'
      }
    }
    
    // Track the conversion
    const result = await trackConversion({
      orderId: order._id.toString(),
      orderAmount: order.totalAmount || order.total,
      sessionId: sessionId || undefined,
      linkId: linkId || undefined,
      customerEmail: order.email
    })
    
    // Queue for retry if failed
    if (!result.success && result.error !== 'Conversion already tracked') {
      await queueConversionRetry(order, sessionId, linkId)
    }
    
    return result
    
  } catch (error) {
    console.error('Stripe conversion processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Calculate tier-based commission rate
 */
export function calculateCommissionTier(monthlyVolume: number): {
  tier: string
  rate: number
} {
  if (monthlyVolume >= 10000) {
    return { tier: 'Platinum', rate: 18 }
  } else if (monthlyVolume >= 5000) {
    return { tier: 'Gold', rate: 15 }
  } else if (monthlyVolume >= 1000) {
    return { tier: 'Silver', rate: 12 }
  } else {
    return { tier: 'Bronze', rate: 10 }
  }
}

/**
 * Validate referral attribution
 */
export async function validateAttribution(
  sessionId: string | null,
  linkId: string | null
): Promise<boolean> {
  try {
    if (!sessionId && !linkId) return false
    
    await connectToDatabase()
    
    // Check if session or link exists and is valid
    if (sessionId) {
      const click = await ReferralClick.findOne({ 
        sessionId,
        converted: false
      })
      if (click) return true
    }
    
    if (linkId) {
      const link = await ReferralLink.findById(linkId)
      if (link && link.isActive) return true
    }
    
    return false
    
  } catch (error) {
    console.error('Attribution validation error:', error)
    return false
  }
}