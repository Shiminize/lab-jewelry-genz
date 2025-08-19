/**
 * Analytics Dashboard API
 * GET /api/analytics/dashboard - Get comprehensive dashboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { analytics } from '@/lib/analytics'
import { analyticsAggregations } from '@/lib/schemas/analytics.schema'
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
 * GET /api/analytics/dashboard - Get comprehensive analytics dashboard
 */
async function getDashboard(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') as '24h' | '7d' | '30d' || '7d'
    const includeRealtime = searchParams.get('realtime') === 'true'
    
    // Calculate date range
    const startDate = new Date()
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
    }
    
    const { db } = await connectToDatabase()
    
    // Run parallel aggregations for dashboard data
    const [
      eventAnalytics,
      conversionFunnel,
      userJourneys,
      performanceData,
      businessMetrics,
      realtimeData
    ] = await Promise.all([
      // Event analytics
      db.collection('analyticsEvents').aggregate(
        analyticsAggregations.dailyEventCounts(timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30)
      ).toArray(),
      
      // Conversion funnel
      db.collection('conversionFunnel').aggregate(
        analyticsAggregations.conversionFunnel(startDate)
      ).toArray(),
      
      // User journey analysis
      db.collection('userJourneys').aggregate(
        analyticsAggregations.userJourneyAnalysis(startDate)
      ).toArray(),
      
      // Performance insights
      db.collection('performanceMetrics').aggregate(
        analyticsAggregations.performanceInsights(startDate)
      ).toArray(),
      
      // Business metrics
      db.collection('businessMetrics').find({
        date: { $gte: startDate }
      }).sort({ date: -1 }).toArray(),
      
      // Real-time data (last 5 minutes)
      includeRealtime ? db.collection('analyticsEvents').aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$event',
            count: { $sum: 1 },
            lastSeen: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray() : null
    ])
    
    // Calculate summary metrics
    const summary = calculateSummaryMetrics(
      eventAnalytics,
      conversionFunnel,
      userJourneys,
      businessMetrics
    )
    
    // Generate insights and alerts
    const insights = generateInsights(summary, performanceData)
    const alerts = generateAlerts(summary, performanceData)
    
    return ok({
      timeframe,
      summary,
      charts: {
        events: formatEventChartData(eventAnalytics),
        conversion: formatConversionData(conversionFunnel),
        userJourneys: formatUserJourneyData(userJourneys),
        performance: formatPerformanceData(performanceData),
        business: formatBusinessData(businessMetrics)
      },
      realtime: realtimeData,
      insights,
      alerts,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return fail('DASHBOARD_ERROR', 'Failed to retrieve dashboard data', null, 500)
  }
}

/**
 * Calculate summary metrics
 */
function calculateSummaryMetrics(events: any[], funnel: any[], journeys: any[], business: any[]) {
  const totalEvents = events.reduce((sum, day) => sum + day.totalEvents, 0)
  const avgEventsPerDay = totalEvents / Math.max(events.length, 1)
  
  const totalConversions = funnel.find(step => step.step === 'payment_complete')?.uniqueSessions || 0
  const totalSessions = funnel.find(step => step.step === 'landing')?.uniqueSessions || 0
  const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0
  
  const totalRevenue = business.reduce((sum, metric) => sum + (metric.revenue || 0), 0)
  const totalOrders = business.reduce((sum, metric) => sum + (metric.orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const bestChannel = journeys.reduce((best, journey) => 
    !best || journey.conversionRate > best.conversionRate ? journey : best, null
  )
  
  return {
    events: {
      total: totalEvents,
      dailyAverage: Math.round(avgEventsPerDay),
      growth: calculateGrowth(events)
    },
    conversions: {
      rate: Math.round(conversionRate * 100) / 100,
      total: totalConversions,
      sessions: totalSessions
    },
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      orders: totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      growth: calculateRevenueGrowth(business)
    },
    channels: {
      best: bestChannel?.channel || 'organic',
      bestConversionRate: bestChannel?.conversionRate || 0
    }
  }
}

/**
 * Calculate growth rate
 */
function calculateGrowth(data: any[]): number {
  if (data.length < 2) return 0
  
  const latest = data[data.length - 1]?.totalEvents || 0
  const previous = data[data.length - 2]?.totalEvents || 0
  
  if (previous === 0) return 0
  return Math.round(((latest - previous) / previous) * 100)
}

/**
 * Calculate revenue growth
 */
function calculateRevenueGrowth(business: any[]): number {
  if (business.length < 2) return 0
  
  const latest = business[0]?.revenue || 0
  const previous = business[1]?.revenue || 0
  
  if (previous === 0) return 0
  return Math.round(((latest - previous) / previous) * 100)
}

/**
 * Format data for charts
 */
function formatEventChartData(events: any[]) {
  return events.map(day => ({
    date: day._id,
    totalEvents: day.totalEvents,
    events: day.events.reduce((acc: any, event: any) => {
      acc[event.event] = event.count
      return acc
    }, {})
  }))
}

function formatConversionData(funnel: any[]) {
  const steps = ['landing', 'product_browse', 'product_view', 'customizer_open', 'add_to_cart', 'checkout_start', 'payment_complete']
  
  return steps.map(step => {
    const data = funnel.find(f => f.step === step)
    return {
      step,
      sessions: data?.uniqueSessions || 0,
      events: data?.totalEvents || 0
    }
  })
}

function formatUserJourneyData(journeys: any[]) {
  return journeys.map(journey => ({
    channel: journey.channel || 'unknown',
    journeys: journey.journeys,
    conversions: journey.conversions,
    conversionRate: Math.round((journey.conversionRate || 0) * 10000) / 100,
    avgOrderValue: Math.round((journey.avgOrderValue || 0) * 100) / 100,
    totalValue: Math.round((journey.totalValue || 0) * 100) / 100
  }))
}

function formatPerformanceData(performance: any[]) {
  return performance.map(perf => ({
    endpoint: perf.endpoint,
    avgResponseTime: perf.avgResponseTime,
    totalRequests: perf.totalRequests,
    errorRate: Math.round((perf.errorRate || 0) * 10000) / 100
  }))
}

function formatBusinessData(business: any[]) {
  return business.map(metric => ({
    date: metric.date,
    revenue: metric.revenue,
    orders: metric.orders,
    newUsers: metric.newUsers,
    conversionRate: metric.conversionRate,
    avgOrderValue: metric.averageOrderValue
  }))
}

/**
 * Generate insights
 */
function generateInsights(summary: any, performance: any[]): string[] {
  const insights: string[] = []
  
  // Event insights
  if (summary.events.growth > 20) {
    insights.push(`📈 Great news! Event activity is up ${summary.events.growth}% from yesterday`)
  } else if (summary.events.growth < -20) {
    insights.push(`📉 Event activity is down ${Math.abs(summary.events.growth)}% from yesterday`)
  }
  
  // Conversion insights
  if (summary.conversions.rate > 3) {
    insights.push(`🎯 Excellent conversion rate of ${summary.conversions.rate}% - well above industry average`)
  } else if (summary.conversions.rate < 1) {
    insights.push(`⚠️ Conversion rate is ${summary.conversions.rate}% - consider optimizing the funnel`)
  }
  
  // Revenue insights
  if (summary.revenue.growth > 15) {
    insights.push(`💰 Revenue growing strongly at ${summary.revenue.growth}%`)
  } else if (summary.revenue.growth < -15) {
    insights.push(`📊 Revenue declined ${Math.abs(summary.revenue.growth)}% - investigate causes`)
  }
  
  // Performance insights
  const slowEndpoints = performance.filter(p => p.avgResponseTime > 1000)
  if (slowEndpoints.length > 0) {
    insights.push(`⚡ ${slowEndpoints.length} endpoints responding slowly (>1s)`)
  }
  
  if (insights.length === 0) {
    insights.push('📊 All key metrics are stable and performing within normal ranges')
  }
  
  return insights
}

/**
 * Generate alerts
 */
function generateAlerts(summary: any, performance: any[]): any[] {
  const alerts: any[] = []
  
  // Performance alerts
  const criticalEndpoints = performance.filter(p => p.avgResponseTime > 2000)
  criticalEndpoints.forEach(endpoint => {
    alerts.push({
      type: 'error',
      title: 'Critical Performance Issue',
      message: `${endpoint.endpoint} averaging ${Math.round(endpoint.avgResponseTime)}ms response time`,
      action: 'Investigate database queries and caching',
      timestamp: new Date().toISOString()
    })
  })
  
  // Conversion alerts
  if (summary.conversions.rate < 0.5) {
    alerts.push({
      type: 'warning',
      title: 'Low Conversion Rate',
      message: `Conversion rate is ${summary.conversions.rate}% - below 1% threshold`,
      action: 'Review checkout flow and user experience',
      timestamp: new Date().toISOString()
    })
  }
  
  // Error rate alerts
  const highErrorEndpoints = performance.filter(p => p.errorRate > 5)
  highErrorEndpoints.forEach(endpoint => {
    alerts.push({
      type: 'error',
      title: 'High Error Rate',
      message: `${endpoint.endpoint} has ${endpoint.errorRate}% error rate`,
      action: 'Check error logs and fix issues',
      timestamp: new Date().toISOString()
    })
  })
  
  return alerts
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/analytics/dashboard', getDashboard)