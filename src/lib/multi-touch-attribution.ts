/**
 * Multi-Touch Attribution System
 * Handles complex attribution models for creator referral tracking
 */

import { connectToDatabase } from '@/lib/mongoose'
import { ReferralClick, CommissionTransaction, Creator } from '@/lib/schemas/creator.schema'
import { emitConversionEvent } from '@/lib/realtime-analytics'

interface TouchpointData {
  clickId: string
  creatorId: string
  linkId: string
  timestamp: Date
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  touchpointSequence: number
}

interface AttributionResult {
  touchpoints: TouchpointData[]
  attributionWeights: { [clickId: string]: number }
  primaryCreator: string
  totalTouchpoints: number
}

export type AttributionModel = 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based'

/**
 * Calculate attribution weights based on the selected model
 */
export function calculateAttributionWeights(
  touchpoints: TouchpointData[],
  model: AttributionModel = 'time-decay'
): { [clickId: string]: number } {
  const weights: { [clickId: string]: number } = {}
  const touchpointCount = touchpoints.length

  if (touchpointCount === 0) return weights
  if (touchpointCount === 1) {
    weights[touchpoints[0].clickId] = 100
    return weights
  }

  switch (model) {
    case 'first-touch':
      weights[touchpoints[0].clickId] = 100
      break

    case 'last-touch':
      weights[touchpoints[touchpointCount - 1].clickId] = 100
      break

    case 'linear':
      const linearWeight = 100 / touchpointCount
      touchpoints.forEach(tp => {
        weights[tp.clickId] = linearWeight
      })
      break

    case 'time-decay':
      // More recent touchpoints get higher weight
      const decayRate = 0.7
      let totalDecayWeight = 0
      
      touchpoints.forEach((tp, index) => {
        const weight = Math.pow(decayRate, touchpointCount - 1 - index)
        weights[tp.clickId] = weight
        totalDecayWeight += weight
      })
      
      // Normalize to 100%
      Object.keys(weights).forEach(clickId => {
        weights[clickId] = (weights[clickId] / totalDecayWeight) * 100
      })
      break

    case 'position-based':
      // 40% first touch, 40% last touch, 20% split among middle touches
      if (touchpointCount === 2) {
        weights[touchpoints[0].clickId] = 50
        weights[touchpoints[1].clickId] = 50
      } else {
        weights[touchpoints[0].clickId] = 40
        weights[touchpoints[touchpointCount - 1].clickId] = 40
        
        const middleWeight = 20 / (touchpointCount - 2)
        for (let i = 1; i < touchpointCount - 1; i++) {
          weights[touchpoints[i].clickId] = middleWeight
        }
      }
      break

    default:
      // Default to last-touch
      weights[touchpoints[touchpointCount - 1].clickId] = 100
  }

  return weights
}

/**
 * Generate a customer journey ID based on various identifiers
 */
export function generateCustomerJourneyId(
  sessionId?: string,
  userId?: string,
  crossDeviceId?: string,
  ipAddress?: string
): string {
  // Priority: userId > crossDeviceId > sessionId > ipAddress hash
  if (userId) return `user_${userId}`
  if (crossDeviceId) return `device_${crossDeviceId}`
  if (sessionId) return `session_${sessionId}`
  if (ipAddress) {
    // Create a hash of IP address for privacy
    const hash = require('crypto').createHash('sha256').update(ipAddress).digest('hex')
    return `ip_${hash.substring(0, 16)}`
  }
  
  return `anonymous_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

/**
 * Track a click with multi-touch attribution
 */
export async function trackMultiTouchClick(clickData: {
  linkId: string
  creatorId: string
  sessionId?: string
  userId?: string
  crossDeviceId?: string
  ipAddress: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  userAgent: string
  referrer?: string
  location?: any
  deviceInfo: any
}) {
  try {
    await connectToDatabase()

    // Generate customer journey ID
    const customerJourneyId = generateCustomerJourneyId(
      clickData.sessionId,
      clickData.userId,
      clickData.crossDeviceId,
      clickData.ipAddress
    )

    // Find existing touchpoints for this customer journey
    const existingTouchpoints = await ReferralClick.find({
      customerJourneyId,
      converted: false
    }).sort({ clickedAt: 1 })

    // Calculate touchpoint sequence
    const touchpointSequence = existingTouchpoints.length + 1

    // Create the new click record
    const click = new ReferralClick({
      linkId: clickData.linkId,
      creatorId: clickData.creatorId,
      ipAddress: clickData.ipAddress,
      userAgent: clickData.userAgent,
      sessionId: clickData.sessionId,
      userId: clickData.userId,
      referrer: clickData.referrer,
      location: clickData.location,
      deviceInfo: clickData.deviceInfo,
      utmSource: clickData.utmSource,
      utmMedium: clickData.utmMedium,
      utmCampaign: clickData.utmCampaign,
      utmTerm: clickData.utmTerm,
      utmContent: clickData.utmContent,
      touchpointSequence,
      customerJourneyId,
      crossDeviceId: clickData.crossDeviceId,
      converted: false,
      clickedAt: new Date()
    })

    await click.save()

    console.log(`Multi-touch click tracked: Journey ${customerJourneyId}, Touchpoint ${touchpointSequence}`)
    
    return {
      success: true,
      clickId: click._id,
      customerJourneyId,
      touchpointSequence
    }

  } catch (error) {
    console.error('Multi-touch click tracking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process conversion with multi-touch attribution
 */
export async function processMultiTouchConversion(
  orderId: string,
  orderAmount: number,
  customerJourneyId: string,
  attributionModel: AttributionModel = 'time-decay'
) {
  try {
    await connectToDatabase()

    // Get all touchpoints for this customer journey
    const touchpoints = await ReferralClick.find({
      customerJourneyId,
      converted: false
    }).sort({ clickedAt: 1 }).populate('creatorId')

    if (touchpoints.length === 0) {
      return {
        success: false,
        error: 'No touchpoints found for customer journey'
      }
    }

    // Calculate attribution weights
    const touchpointData: TouchpointData[] = touchpoints.map(tp => ({
      clickId: tp._id.toString(),
      creatorId: tp.creatorId._id.toString(),
      linkId: tp.linkId.toString(),
      timestamp: tp.clickedAt,
      utmSource: tp.utmSource,
      utmMedium: tp.utmMedium,
      utmCampaign: tp.utmCampaign,
      touchpointSequence: tp.touchpointSequence || 0
    }))

    const attributionWeights = calculateAttributionWeights(touchpointData, attributionModel)

    // Create commission transactions for each touchpoint
    const transactions = []
    
    for (const touchpoint of touchpoints) {
      const creator = touchpoint.creatorId
      const weight = attributionWeights[touchpoint._id.toString()]
      const attributedAmount = (orderAmount * weight) / 100
      const commissionAmount = (attributedAmount * creator.commissionRate) / 100

      if (commissionAmount > 0) {
        const transaction = new CommissionTransaction({
          creatorId: creator._id,
          orderId,
          linkId: touchpoint.linkId,
          clickId: touchpoint._id,
          commissionRate: creator.commissionRate,
          orderAmount: attributedAmount,
          commissionAmount,
          status: 'pending',
          type: 'sale',
          notes: `Multi-touch attribution: ${weight.toFixed(2)}% weight, ${attributionModel} model`
        })

        await transaction.save()
        transactions.push(transaction)

        // Update click as converted with attribution weight
        await ReferralClick.findByIdAndUpdate(touchpoint._id, {
          converted: true,
          orderId,
          conversionValue: attributedAmount,
          attributionWeight: weight
        })

        // Emit real-time conversion event
        emitConversionEvent({
          id: transaction._id.toString(),
          creatorId: creator._id.toString(),
          creatorCode: creator.creatorCode,
          orderAmount: attributedAmount,
          commissionAmount,
          commissionRate: creator.commissionRate,
          timestamp: new Date().toISOString(),
          linkId: touchpoint.linkId.toString()
        })

        // Update creator metrics
        if (creator.updateMetrics) {
          await creator.updateMetrics()
        }
      }
    }

    console.log(`Multi-touch conversion processed: ${transactions.length} transactions created for order ${orderId}`)

    return {
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        creatorId: t.creatorId,
        commissionAmount: t.commissionAmount,
        attributionWeight: attributionWeights[t.clickId.toString()]
      })),
      attributionModel,
      totalTouchpoints: touchpoints.length
    }

  } catch (error) {
    console.error('Multi-touch conversion processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get customer journey analytics
 */
export async function getCustomerJourneyAnalytics(customerJourneyId: string) {
  try {
    await connectToDatabase()

    const touchpoints = await ReferralClick.find({
      customerJourneyId
    }).sort({ clickedAt: 1 }).populate('creatorId linkId')

    if (touchpoints.length === 0) {
      return null
    }

    const journey = {
      customerJourneyId,
      touchpoints: touchpoints.map(tp => ({
        clickId: tp._id,
        creatorId: tp.creatorId._id,
        creatorCode: tp.creatorId.creatorCode,
        linkId: tp.linkId._id,
        timestamp: tp.clickedAt,
        utmSource: tp.utmSource,
        utmMedium: tp.utmMedium,
        utmCampaign: tp.utmCampaign,
        deviceType: tp.deviceInfo.type,
        converted: tp.converted,
        attributionWeight: tp.attributionWeight
      })),
      totalTouchpoints: touchpoints.length,
      conversionTime: touchpoints.find(tp => tp.converted)?.clickedAt,
      journeyDuration: touchpoints.length > 1 ? 
        touchpoints[touchpoints.length - 1].clickedAt.getTime() - touchpoints[0].clickedAt.getTime() 
        : 0
    }

    return journey

  } catch (error) {
    console.error('Customer journey analytics error:', error)
    return null
  }
}

/**
 * Get attribution model performance comparison
 */
export async function compareAttributionModels(
  startDate: Date,
  endDate: Date
): Promise<{ [model: string]: any }> {
  try {
    await connectToDatabase()

    // Get all converted customer journeys in the date range
    const conversions = await ReferralClick.aggregate([
      {
        $match: {
          converted: true,
          clickedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$customerJourneyId',
          orderId: { $first: '$orderId' },
          conversionValue: { $first: '$conversionValue' },
          touchpoints: { $push: '$$ROOT' }
        }
      }
    ])

    const models: AttributionModel[] = ['first-touch', 'last-touch', 'linear', 'time-decay', 'position-based']
    const results: { [model: string]: any } = {}

    for (const model of models) {
      const modelResults = {
        model,
        totalConversions: conversions.length,
        totalRevenue: 0,
        creatorDistribution: {} as { [creatorId: string]: number }
      }

      for (const conversion of conversions) {
        const touchpointData: TouchpointData[] = conversion.touchpoints.map((tp: any) => ({
          clickId: tp._id.toString(),
          creatorId: tp.creatorId.toString(),
          linkId: tp.linkId.toString(),
          timestamp: tp.clickedAt,
          touchpointSequence: tp.touchpointSequence || 0
        }))

        const weights = calculateAttributionWeights(touchpointData, model)
        
        touchpointData.forEach(tp => {
          const weight = weights[tp.clickId]
          const attributedRevenue = (conversion.conversionValue * weight) / 100
          
          modelResults.totalRevenue += attributedRevenue
          modelResults.creatorDistribution[tp.creatorId] = 
            (modelResults.creatorDistribution[tp.creatorId] || 0) + attributedRevenue
        })
      }

      results[model] = modelResults
    }

    return results

  } catch (error) {
    console.error('Attribution model comparison error:', error)
    return {}
  }
}