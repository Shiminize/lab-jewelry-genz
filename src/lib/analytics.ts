/**
 * Analytics Service
 * Comprehensive analytics and performance monitoring for GlowGlitch
 * Phase 2: Scale & Optimize implementation
 */

import { connectToDatabase } from './database'

// Analytics Event Types
export type AnalyticsEvent = 
  | 'page_view'
  | 'product_view'
  | 'customizer_open'
  | 'customizer_material_change'
  | 'customizer_stone_change'
  | 'add_to_cart'
  | 'checkout_start'
  | 'payment_success'
  | 'payment_failed'
  | 'creator_referral'
  | 'search_query'
  | 'filter_apply'
  | 'error_occurred'

export interface AnalyticsEventData {
  event: AnalyticsEvent
  userId?: string
  sessionId: string
  timestamp: Date
  properties: Record<string, any>
  metadata: {
    userAgent: string
    ip: string
    referrer?: string
    page: string
    device: 'mobile' | 'tablet' | 'desktop'
  }
}

export interface PerformanceMetrics {
  apiResponseTime: number
  databaseQueryTime: number
  renderTime?: number
  memoryUsage?: number
  errorRate: number
  endpoint: string
  timestamp: Date
}

export interface BusinessMetrics {
  date: Date
  revenue: number
  orders: number
  newUsers: number
  activeUsers: number
  conversionRate: number
  averageOrderValue: number
  creatorCommissions: number
  inventoryTurnover: number
}

class AnalyticsService {
  private isProduction = process.env.NODE_ENV === 'production'
  private batchSize = 100
  private eventQueue: AnalyticsEventData[] = []
  private metricsQueue: PerformanceMetrics[] = []

  /**
   * Track user analytics event
   */
  async trackEvent(eventData: Omit<AnalyticsEventData, 'timestamp'>): Promise<void> {
    try {
      const event: AnalyticsEventData = {
        ...eventData,
        timestamp: new Date()
      }

      // Add to queue for batch processing
      this.eventQueue.push(event)

      // Process queue if batch size reached
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEventQueue()
      }

      // In development, log events for debugging
      if (!this.isProduction) {
        console.log('📊 Analytics Event:', event.event, event.properties)
      }
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Omit<PerformanceMetrics, 'timestamp'>): Promise<void> {
    try {
      const performanceData: PerformanceMetrics = {
        ...metrics,
        timestamp: new Date()
      }

      this.metricsQueue.push(performanceData)

      if (this.metricsQueue.length >= this.batchSize) {
        await this.flushMetricsQueue()
      }

      // Alert on performance issues
      if (metrics.apiResponseTime > 1000 || metrics.errorRate > 0.05) {
        console.warn('⚠️ Performance Alert:', metrics)
      }
    } catch (error) {
      console.error('Performance tracking error:', error)
    }
  }

  /**
   * Track business metrics daily
   */
  async trackBusinessMetrics(metrics: BusinessMetrics): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      
      await db.collection('businessMetrics').replaceOne(
        { date: metrics.date },
        metrics,
        { upsert: true }
      )
    } catch (error) {
      console.error('Business metrics tracking error:', error)
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(timeframe: '24h' | '7d' | '30d' = '7d') {
    try {
      const { db } = await connectToDatabase()
      
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

      const [events, performance, business] = await Promise.all([
        // User events summary
        db.collection('analyticsEvents').aggregate([
          { $match: { timestamp: { $gte: startDate } } },
          { $group: { _id: '$event', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).toArray(),

        // Performance metrics summary
        db.collection('performanceMetrics').aggregate([
          { $match: { timestamp: { $gte: startDate } } },
          {
            $group: {
              _id: '$endpoint',
              avgResponseTime: { $avg: '$apiResponseTime' },
              avgDbTime: { $avg: '$databaseQueryTime' },
              errorRate: { $avg: '$errorRate' },
              totalRequests: { $sum: 1 }
            }
          },
          { $sort: { totalRequests: -1 } }
        ]).toArray(),

        // Business metrics
        db.collection('businessMetrics').find({
          date: { $gte: startDate }
        }).sort({ date: -1 }).toArray()
      ])

      return {
        events,
        performance,
        business,
        summary: {
          totalEvents: events.reduce((sum, e) => sum + e.count, 0),
          avgResponseTime: performance.reduce((sum, p) => sum + p.avgResponseTime, 0) / performance.length || 0,
          totalRevenue: business.reduce((sum, b) => sum + b.revenue, 0)
        }
      }
    } catch (error) {
      console.error('Dashboard data error:', error)
      throw error
    }
  }

  /**
   * Get real-time performance metrics
   */
  async getPerformanceInsights() {
    try {
      const { db } = await connectToDatabase()
      
      const last24h = new Date()
      last24h.setHours(last24h.getHours() - 24)

      const insights = await db.collection('performanceMetrics').aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        {
          $group: {
            _id: null,
            avgApiTime: { $avg: '$apiResponseTime' },
            maxApiTime: { $max: '$apiResponseTime' },
            avgDbTime: { $avg: '$databaseQueryTime' },
            maxDbTime: { $max: '$databaseQueryTime' },
            totalErrors: { $sum: { $cond: [{ $gt: ['$errorRate', 0] }, 1, 0] } },
            totalRequests: { $sum: 1 }
          }
        }
      ]).toArray()

      return insights[0] || {
        avgApiTime: 0,
        maxApiTime: 0,
        avgDbTime: 0,
        maxDbTime: 0,
        totalErrors: 0,
        totalRequests: 0
      }
    } catch (error) {
      console.error('Performance insights error:', error)
      return null
    }
  }

  /**
   * Flush event queue to database
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    try {
      const { db } = await connectToDatabase()
      await db.collection('analyticsEvents').insertMany([...this.eventQueue])
      this.eventQueue.length = 0 // Clear queue
    } catch (error) {
      console.error('Event queue flush error:', error)
    }
  }

  /**
   * Flush metrics queue to database
   */
  private async flushMetricsQueue(): Promise<void> {
    if (this.metricsQueue.length === 0) return

    try {
      const { db } = await connectToDatabase()
      await db.collection('performanceMetrics').insertMany([...this.metricsQueue])
      this.metricsQueue.length = 0 // Clear queue
    } catch (error) {
      console.error('Metrics queue flush error:', error)
    }
  }

  /**
   * Force flush all queues (for graceful shutdown)
   */
  async flush(): Promise<void> {
    await Promise.all([
      this.flushEventQueue(),
      this.flushMetricsQueue()
    ])
  }
}

// Singleton instance
export const analytics = new AnalyticsService()

// Convenience functions for common tracking scenarios
export const trackPageView = (page: string, userId?: string, sessionId?: string) => {
  return analytics.trackEvent({
    event: 'page_view',
    userId,
    sessionId: sessionId || generateSessionId(),
    properties: { page },
    metadata: {
      userAgent: '',
      ip: '',
      page,
      device: 'desktop'
    }
  })
}

export const trackProductView = (productId: string, userId?: string, sessionId?: string) => {
  return analytics.trackEvent({
    event: 'product_view',
    userId,
    sessionId: sessionId || generateSessionId(),
    properties: { productId },
    metadata: {
      userAgent: '',
      ip: '',
      page: `/products/${productId}`,
      device: 'desktop'
    }
  })
}

export const trackCustomizerUsage = (action: string, details: Record<string, any>, userId?: string, sessionId?: string) => {
  return analytics.trackEvent({
    event: action.includes('material') ? 'customizer_material_change' : 'customizer_stone_change',
    userId,
    sessionId: sessionId || generateSessionId(),
    properties: { action, ...details },
    metadata: {
      userAgent: '',
      ip: '',
      page: '/customizer',
      device: 'desktop'
    }
  })
}

export const trackPurchase = (orderId: string, amount: number, userId?: string, sessionId?: string) => {
  return analytics.trackEvent({
    event: 'payment_success',
    userId,
    sessionId: sessionId || generateSessionId(),
    properties: { orderId, amount },
    metadata: {
      userAgent: '',
      ip: '',
      page: '/checkout/success',
      device: 'desktop'
    }
  })
}

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Performance monitoring middleware
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    const startMem = process.memoryUsage().heapUsed
    
    try {
      const result = await fn(...args)
      
      const responseTime = Date.now() - startTime
      const memoryDelta = process.memoryUsage().heapUsed - startMem
      
      await analytics.trackPerformance({
        apiResponseTime: responseTime,
        databaseQueryTime: 0, // Will be tracked separately in DB operations
        memoryUsage: memoryDelta,
        errorRate: 0,
        endpoint
      })
      
      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      await analytics.trackPerformance({
        apiResponseTime: responseTime,
        databaseQueryTime: 0,
        errorRate: 1,
        endpoint
      })
      
      throw error
    }
  }
}

// Export for use in API routes and middleware
export default analytics