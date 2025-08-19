/**
 * Analytics Events API
 * POST /api/analytics/events - Track user events
 * GET /api/analytics/events - Get event analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { analytics } from '@/lib/analytics'
import { AnalyticsEventSchema } from '@/lib/schemas/analytics.schema'
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
 * POST /api/analytics/events - Track analytics event
 */
async function trackEvent(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get client metadata
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const referrer = request.headers.get('referer')
    
    // Detect device type from user agent
    const device = detectDevice(userAgent)
    
    // Create complete event data
    const eventData = {
      ...body,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        userAgent,
        ip: ip.split(',')[0].trim(), // Take first IP if multiple
        referrer: referrer || undefined,
        page: body.page || '/',
        device,
        ...body.metadata
      }
    }
    
    // Validate event data
    const validatedEvent = AnalyticsEventSchema.parse(eventData)
    
    // Track the event
    await analytics.trackEvent(validatedEvent)
    
    return ok({ 
      tracked: true,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Event tracking error:', error)
    
    if (error.name === 'ZodError') {
      return fail('VALIDATION_ERROR', 'Invalid event data', error.errors)
    }
    
    return fail('TRACKING_ERROR', 'Failed to track event', null, 500)
  }
}

/**
 * GET /api/analytics/events - Get event analytics
 */
async function getEventAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') as '24h' | '7d' | '30d' || '7d'
    const event = searchParams.get('event')
    const userId = searchParams.get('userId')
    
    // Get dashboard data
    const dashboardData = await analytics.getDashboardData(timeframe)
    
    // Filter by specific event if requested
    let filteredEvents = dashboardData.events
    if (event) {
      filteredEvents = filteredEvents.filter(e => e._id === event)
    }
    
    // Calculate summary metrics
    const totalEvents = filteredEvents.reduce((sum, e) => sum + e.count, 0)
    const uniqueEvents = filteredEvents.length
    const topEvent = filteredEvents[0]
    
    return ok({
      events: filteredEvents,
      summary: {
        totalEvents,
        uniqueEvents,
        topEvent: topEvent ? { event: topEvent._id, count: topEvent.count } : null,
        timeframe
      },
      performance: dashboardData.performance,
      business: dashboardData.business
    })
    
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return fail('ANALYTICS_ERROR', 'Failed to retrieve analytics', null, 500)
  }
}

// Device detection helper
function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
    return 'mobile'
  }
  
  if (/tablet|ipad|kindle|silk/.test(ua)) {
    return 'tablet'
  }
  
  return 'desktop'
}

// Export with performance monitoring
export const POST = withAPIMonitoring('/api/analytics/events', trackEvent)
export const GET = withAPIMonitoring('/api/analytics/events', getEventAnalytics)