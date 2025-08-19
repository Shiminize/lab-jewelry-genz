/**
 * Email Marketing Analytics API
 * GET /api/admin/email-marketing/analytics - Get comprehensive email analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { withAPIMonitoring } from '@/lib/performance'
import crypto from 'crypto'

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

/**
 * GET /api/admin/email-marketing/analytics - Get email analytics
 */
async function getEmailAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const campaignId = searchParams.get('campaignId')
    const triggerId = searchParams.get('triggerId')
    
    const { db } = await connectToDatabase()
    
    // Calculate date range
    const endDate = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
    
    // Build base filter
    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    }
    
    // Get overall email performance
    const overallStats = await getOverallStats(db, dateFilter, campaignId, triggerId)
    
    // Get campaign performance
    const campaignStats = await getCampaignStats(db, dateFilter)
    
    // Get trigger performance
    const triggerStats = await getTriggerStats(db, dateFilter)
    
    // Get email events over time
    const timeSeriesData = await getTimeSeriesData(db, startDate, endDate, period)
    
    // Get top performing content
    const topContent = await getTopPerformingContent(db, dateFilter)
    
    // Get audience insights
    const audienceInsights = await getAudienceInsights(db, dateFilter)
    
    // Get deliverability metrics
    const deliverabilityMetrics = await getDeliverabilityMetrics(db, dateFilter)
    
    return ok({
      overview: overallStats,
      campaigns: campaignStats,
      triggers: triggerStats,
      timeSeries: timeSeriesData,
      topContent,
      audience: audienceInsights,
      deliverability: deliverabilityMetrics,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    })
    
  } catch (error) {
    console.error('Email analytics error:', error)
    return fail('ANALYTICS_ERROR', 'Failed to retrieve email analytics', null, 500)
  }
}

// Get overall email performance statistics
async function getOverallStats(db: any, dateFilter: any, campaignId?: string, triggerId?: string) {
  const pipeline = []
  
  // Match emails in date range
  let matchStage = dateFilter
  if (campaignId) {
    matchStage = { ...matchStage, campaignId }
  }
  if (triggerId) {
    matchStage = { ...matchStage, triggerId }
  }
  
  pipeline.push({ $match: matchStage })
  
  // Group by event type and calculate metrics
  pipeline.push({
    $group: {
      _id: '$eventType',
      count: { $sum: 1 },
      uniqueRecipients: { $addToSet: '$recipientEmail' }
    }
  })
  
  pipeline.push({
    $addFields: {
      uniqueCount: { $size: '$uniqueRecipients' }
    }
  })
  
  pipeline.push({
    $group: {
      _id: null,
      events: {
        $push: {
          type: '$_id',
          count: '$count',
          uniqueCount: '$uniqueCount'
        }
      }
    }
  })
  
  const [result] = await db.collection('emailEvents').aggregate(pipeline).toArray()
  const events = result?.events || []
  
  // Calculate metrics
  const sent = events.find(e => e.type === 'sent')?.count || 0
  const delivered = events.find(e => e.type === 'delivered')?.count || 0
  const opened = events.find(e => e.type === 'opened')?.uniqueCount || 0
  const clicked = events.find(e => e.type === 'clicked')?.uniqueCount || 0
  const bounced = events.find(e => e.type === 'bounced')?.count || 0
  const unsubscribed = events.find(e => e.type === 'unsubscribed')?.count || 0
  
  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    unsubscribed,
    deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(2) : 0,
    openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : 0,
    clickRate: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : 0,
    clickToOpenRate: opened > 0 ? ((clicked / opened) * 100).toFixed(2) : 0,
    bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(2) : 0,
    unsubscribeRate: delivered > 0 ? ((unsubscribed / delivered) * 100).toFixed(2) : 0
  }
}

// Get campaign performance statistics
async function getCampaignStats(db: any, dateFilter: any) {
  const pipeline = [
    {
      $match: {
        sentAt: dateFilter.createdAt
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        type: 1,
        status: 1,
        subject: 1,
        sentAt: 1,
        analytics: 1
      }
    },
    {
      $addFields: {
        openRate: {
          $cond: [
            { $gt: ['$analytics.delivered', 0] },
            { $multiply: [{ $divide: ['$analytics.opened', '$analytics.delivered'] }, 100] },
            0
          ]
        },
        clickRate: {
          $cond: [
            { $gt: ['$analytics.delivered', 0] },
            { $multiply: [{ $divide: ['$analytics.clicked', '$analytics.delivered'] }, 100] },
            0
          ]
        },
        conversionRate: {
          $cond: [
            { $gt: ['$analytics.sent', 0] },
            { $multiply: [{ $divide: ['$analytics.revenue', '$analytics.sent'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { 'analytics.sent': -1 } },
    { $limit: 10 }
  ]
  
  return await db.collection('emailCampaigns').aggregate(pipeline).toArray()
}

// Get trigger performance statistics
async function getTriggerStats(db: any, dateFilter: any) {
  const pipeline = [
    {
      $match: {
        'analytics.lastTriggered': dateFilter.createdAt
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        type: 1,
        status: 1,
        analytics: 1
      }
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $gt: ['$analytics.sent', 0] },
            { $multiply: [{ $divide: ['$analytics.converted', '$analytics.sent'] }, 100] },
            0
          ]
        },
        revenuePerEmail: {
          $cond: [
            { $gt: ['$analytics.sent', 0] },
            { $divide: ['$analytics.revenue', '$analytics.sent'] },
            0
          ]
        }
      }
    },
    { $sort: { 'analytics.triggered': -1 } },
    { $limit: 10 }
  ]
  
  return await db.collection('emailTriggers').aggregate(pipeline).toArray()
}

// Get time series data for charts
async function getTimeSeriesData(db: any, startDate: Date, endDate: Date, period: string) {
  let groupFormat: string
  let interval: number
  
  switch (period) {
    case '7d':
      groupFormat = '%Y-%m-%d'
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case '90d':
    case '1y':
      groupFormat = '%Y-%m-%d'
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    default: // 30d
      groupFormat = '%Y-%m-%d'
      interval = 24 * 60 * 60 * 1000 // 1 day
  }
  
  const pipeline = [
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: groupFormat, date: '$timestamp' } },
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        events: {
          $push: {
            type: '$_id.eventType',
            count: '$count'
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]
  
  const timeSeriesData = await db.collection('emailEvents').aggregate(pipeline).toArray()
  
  // Fill in missing dates
  const filledData = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0]
    const existingData = timeSeriesData.find(d => d._id === dateString)
    
    if (existingData) {
      filledData.push({
        date: dateString,
        sent: existingData.events.find(e => e.type === 'sent')?.count || 0,
        opened: existingData.events.find(e => e.type === 'opened')?.count || 0,
        clicked: existingData.events.find(e => e.type === 'clicked')?.count || 0,
        bounced: existingData.events.find(e => e.type === 'bounced')?.count || 0
      })
    } else {
      filledData.push({
        date: dateString,
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0
      })
    }
    
    currentDate = new Date(currentDate.getTime() + interval)
  }
  
  return filledData
}

// Get top performing content
async function getTopPerformingContent(db: any, dateFilter: any) {
  const campaignPipeline = [
    {
      $match: {
        sentAt: dateFilter.createdAt,
        'analytics.sent': { $gt: 0 }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$analytics.opened', 2] },
            { $multiply: ['$analytics.clicked', 5] }
          ]
        }
      }
    },
    {
      $project: {
        name: 1,
        subject: 1,
        type: 1,
        analytics: 1,
        engagementScore: 1
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: 5 }
  ]
  
  const topCampaigns = await db.collection('emailCampaigns').aggregate(campaignPipeline).toArray()
  
  return {
    campaigns: topCampaigns,
    templates: [] // Could add template performance analysis
  }
}

// Get audience insights
async function getAudienceInsights(db: any, dateFilter: any) {
  // Get segment performance
  const segmentPipeline = [
    {
      $match: {
        lastCalculated: dateFilter.createdAt
      }
    },
    {
      $project: {
        name: 1,
        type: 1,
        customerCount: 1,
        isActive: 1
      }
    },
    { $sort: { customerCount: -1 } },
    { $limit: 10 }
  ]
  
  const topSegments = await db.collection('customerSegments').aggregate(segmentPipeline).toArray()
  
  // Get engagement by time of day/day of week (simplified)
  const engagementPipeline = [
    {
      $match: {
        timestamp: dateFilter.createdAt,
        eventType: { $in: ['opened', 'clicked'] }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          dayOfWeek: { $dayOfWeek: '$timestamp' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]
  
  const engagementTimes = await db.collection('emailEvents').aggregate(engagementPipeline).toArray()
  
  return {
    topSegments,
    engagementTimes,
    insights: {
      totalSubscribers: topSegments.reduce((sum, seg) => sum + seg.customerCount, 0),
      activeSegments: topSegments.filter(seg => seg.isActive).length
    }
  }
}

// Get deliverability metrics
async function getDeliverabilityMetrics(db: any, dateFilter: any) {
  const pipeline = [
    {
      $match: {
        timestamp: dateFilter.createdAt,
        eventType: { $in: ['sent', 'delivered', 'bounced', 'complained'] }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]
  
  const deliverabilityData = await db.collection('emailEvents').aggregate(pipeline).toArray()
  
  const sent = deliverabilityData.find(d => d._id === 'sent')?.count || 0
  const delivered = deliverabilityData.find(d => d._id === 'delivered')?.count || 0
  const bounced = deliverabilityData.find(d => d._id === 'bounced')?.count || 0
  const complained = deliverabilityData.find(d => d._id === 'complained')?.count || 0
  
  return {
    sent,
    delivered,
    bounced,
    complained,
    deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(2) : 0,
    bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(2) : 0,
    complaintRate: delivered > 0 ? ((complained / delivered) * 100).toFixed(2) : 0,
    reputation: {
      score: Math.max(0, 100 - (bounced + complained * 2)), // Simplified reputation score
      status: bounced + complained < 5 ? 'Good' : bounced + complained < 15 ? 'Fair' : 'Poor'
    }
  }
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/email-marketing/analytics', getEmailAnalytics)