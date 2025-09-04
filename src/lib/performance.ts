/**
 * Performance Monitoring Utilities
 * Advanced performance tracking and optimization for GlowGlitch
 * Phase 2: Scale & Optimize implementation
 */

import { analytics } from './analytics'

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_WARNING: 500, // ms
  API_RESPONSE_CRITICAL: 1000, // ms
  DATABASE_QUERY_WARNING: 100, // ms
  DATABASE_QUERY_CRITICAL: 500, // ms
  MEMORY_USAGE_WARNING: 100 * 1024 * 1024, // 100MB
  MEMORY_USAGE_CRITICAL: 500 * 1024 * 1024, // 500MB
  ERROR_RATE_WARNING: 0.01, // 1%
  ERROR_RATE_CRITICAL: 0.05, // 5%
} as const

export interface PerformanceTimer {
  start: number
  endpoint: string
  operation: string
}

export interface DatabaseQueryMetrics {
  query: string
  collection: string
  duration: number
  recordsAffected: number
  timestamp: Date
}

export interface RenderPerformanceMetrics {
  component: string
  renderTime: number
  propsSize: number
  reRenderCount: number
  timestamp: Date
}

class PerformanceMonitor {
  private timers = new Map<string, PerformanceTimer>()
  private queryMetrics: DatabaseQueryMetrics[] = []
  private renderMetrics: RenderPerformanceMetrics[] = []
  private alertThrottles = new Map<string, number>()

  /**
   * Start timing an operation
   */
  startTimer(id: string, endpoint: string, operation: string): void {
    this.timers.set(id, {
      start: performance.now(),
      endpoint,
      operation
    })
  }

  /**
   * End timing and track performance
   */
  async endTimer(id: string, additionalData?: Record<string, any>): Promise<number> {
    const timer = this.timers.get(id)
    if (!timer) {
      console.warn(`Performance timer '${id}' not found`)
      return 0
    }

    const duration = performance.now() - timer.start
    this.timers.delete(id)

    // Track the performance metrics
    await analytics.trackPerformance({
      apiResponseTime: duration,
      databaseQueryTime: 0, // Will be set by DB monitoring
      errorRate: 0,
      endpoint: timer.endpoint,
      ...additionalData
    })

    // Check for performance issues
    this.checkPerformanceThresholds(timer.endpoint, duration)

    return duration
  }

  /**
   * Monitor database query performance
   */
  async trackDatabaseQuery(
    query: string,
    collection: string,
    operation: () => Promise<any>
  ): Promise<any> {
    const startTime = performance.now()
    let recordsAffected = 0

    try {
      const result = await operation()
      
      // Try to determine records affected
      if (Array.isArray(result)) {
        recordsAffected = result.length
      } else if (result?.matchedCount !== undefined) {
        recordsAffected = result.matchedCount
      } else if (result?.insertedCount !== undefined) {
        recordsAffected = result.insertedCount
      } else if (result?.deletedCount !== undefined) {
        recordsAffected = result.deletedCount
      }

      const duration = performance.now() - startTime

      const metrics: DatabaseQueryMetrics = {
        query: this.sanitizeQuery(query),
        collection,
        duration,
        recordsAffected,
        timestamp: new Date()
      }

      this.queryMetrics.push(metrics)

      // Alert on slow queries
      if (duration > PERFORMANCE_THRESHOLDS.DATABASE_QUERY_CRITICAL) {
        this.alertSlowQuery(metrics)
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      // Track failed query
      await analytics.trackPerformance({
        apiResponseTime: 0,
        databaseQueryTime: duration,
        errorRate: 1,
        endpoint: `db/${collection}`
      })

      throw error
    }
  }

  /**
   * Monitor React component render performance
   */
  trackComponentRender(
    component: string,
    renderTime: number,
    propsSize: number = 0,
    isReRender: boolean = false
  ): void {
    const existing = this.renderMetrics.find(m => m.component === component)
    
    if (existing && isReRender) {
      existing.reRenderCount += 1
      existing.renderTime = renderTime
      existing.timestamp = new Date()
    } else {
      this.renderMetrics.push({
        component,
        renderTime,
        propsSize,
        reRenderCount: isReRender ? 1 : 0,
        timestamp: new Date()
      })
    }

    // Alert on slow renders
    if (renderTime > 16.67) { // 60fps threshold
      console.warn(`🐌 Slow render detected: ${component} took ${renderTime.toFixed(2)}ms`)
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindow: number = 300000) {
    const cutoff = Date.now() - timeWindow
    
    const recentQueries = this.queryMetrics.filter(
      m => m.timestamp.getTime() > cutoff
    )
    
    const recentRenders = this.renderMetrics.filter(
      m => m.timestamp.getTime() > cutoff
    )

    return {
      database: {
        totalQueries: recentQueries.length,
        averageQueryTime: this.calculateAverage(recentQueries.map(q => q.duration)),
        slowestQuery: this.findSlowest(recentQueries),
        queryBreakdown: this.groupQueriesByCollection(recentQueries)
      },
      rendering: {
        totalRenders: recentRenders.length,
        averageRenderTime: this.calculateAverage(recentRenders.map(r => r.renderTime)),
        slowestComponent: this.findSlowestComponent(recentRenders),
        reRenderCount: recentRenders.reduce((sum, r) => sum + r.reRenderCount, 0)
      },
      memory: this.getMemoryUsage(),
      alerts: this.getRecentAlerts()
    }
  }

  /**
   * Memory usage monitoring
   */
  getMemoryUsage() {
    const usage = process.memoryUsage()
    
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      rss: usage.rss,
      heapUtilization: (usage.heapUsed / usage.heapTotal) * 100
    }
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  cleanupMetrics(maxAge: number = 3600000): void { // 1 hour
    const cutoff = Date.now() - maxAge
    
    this.queryMetrics = this.queryMetrics.filter(
      m => m.timestamp.getTime() > cutoff
    )
    
    this.renderMetrics = this.renderMetrics.filter(
      m => m.timestamp.getTime() > cutoff
    )
  }

  /**
   * Check performance thresholds and alert if needed
   */
  private checkPerformanceThresholds(endpoint: string, duration: number): void {
    const alertKey = `${endpoint}_response_time`
    const lastAlert = this.alertThrottles.get(alertKey) || 0
    const now = Date.now()

    // Throttle alerts to once per minute
    if (now - lastAlert < 60000) return

    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_CRITICAL) {
      console.error(`🚨 CRITICAL: ${endpoint} response time: ${duration.toFixed(2)}ms`)
      this.alertThrottles.set(alertKey, now)
    } else if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_WARNING) {
      console.warn(`⚠️ WARNING: ${endpoint} response time: ${duration.toFixed(2)}ms`)
      this.alertThrottles.set(alertKey, now)
    }
  }

  /**
   * Alert on slow database queries
   */
  private alertSlowQuery(metrics: DatabaseQueryMetrics): void {
    const alertKey = `${metrics.collection}_slow_query`
    const lastAlert = this.alertThrottles.get(alertKey) || 0
    const now = Date.now()

    if (now - lastAlert < 60000) return // Throttle

    console.error(`🐌 SLOW QUERY: ${metrics.collection} - ${metrics.duration.toFixed(2)}ms`)
    console.error(`Query: ${metrics.query}`)
    this.alertThrottles.set(alertKey, now)
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    return query
      .replace(/email:\s*"[^"]+"/gi, 'email: "[REDACTED]"')
      .replace(/password:\s*"[^"]+"/gi, 'password: "[REDACTED]"')
      .replace(/token:\s*"[^"]+"/gi, 'token: "[REDACTED]"')
      .slice(0, 200) // Truncate long queries
  }

  /**
   * Helper methods for calculations
   */
  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0
  }

  private findSlowest(queries: DatabaseQueryMetrics[]): DatabaseQueryMetrics | null {
    return queries.reduce((slowest, current) => 
      !slowest || current.duration > slowest.duration ? current : slowest, 
      null as DatabaseQueryMetrics | null
    )
  }

  private findSlowestComponent(renders: RenderPerformanceMetrics[]): RenderPerformanceMetrics | null {
    return renders.reduce((slowest, current) => 
      !slowest || current.renderTime > slowest.renderTime ? current : slowest,
      null as RenderPerformanceMetrics | null
    )
  }

  private groupQueriesByCollection(queries: DatabaseQueryMetrics[]) {
    return queries.reduce((groups, query) => {
      const collection = query.collection
      if (!groups[collection]) {
        groups[collection] = {
          count: 0,
          totalTime: 0,
          averageTime: 0
        }
      }
      groups[collection].count += 1
      groups[collection].totalTime += query.duration
      groups[collection].averageTime = groups[collection].totalTime / groups[collection].count
      return groups
    }, {} as Record<string, { count: number; totalTime: number; averageTime: number }>)
  }

  private getRecentAlerts(): string[] {
    const recentAlerts: string[] = []
    const fiveMinutesAgo = Date.now() - 300000

    this.alertThrottles.forEach((timestamp, alertKey) => {
      if (timestamp > fiveMinutesAgo) {
        recentAlerts.push(alertKey)
      }
    })

    return recentAlerts
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React Hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now()

  return {
    measureRender: (propsSize: number = 0, isReRender: boolean = false) => {
      const renderTime = performance.now() - startTime
      performanceMonitor.trackComponentRender(componentName, renderTime, propsSize, isReRender)
      return renderTime
    }
  }
}

// Database operation wrapper with performance monitoring
export async function withDatabaseMonitoring<T>(
  collection: string,
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  return performanceMonitor.trackDatabaseQuery(
    operation,
    collection,
    callback
  )
}

// API endpoint wrapper with performance monitoring
export function withAPIMonitoring<T extends any[], R>(
  endpoint: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const timerId = `${endpoint}_${Date.now()}_${Math.random()}`
    
    performanceMonitor.startTimer(timerId, endpoint, 'api_request')
    
    try {
      const result = await handler(...args)
      await performanceMonitor.endTimer(timerId)
      return result
    } catch (error) {
      await performanceMonitor.endTimer(timerId, { errorRate: 1 })
      throw error
    }
  }
}

// CRITICAL FIX: Use GlobalHealthMonitor instead of separate interval
if (typeof window === 'undefined') { // Server-side only
  try {
    const GlobalHealthMonitor = require('./global-health-monitor').default
    const healthMonitor = GlobalHealthMonitor.getInstance()
    
    // Register cleanup with global monitor to prevent cascade
    healthMonitor.registerService('performance-cleanup', async () => {
      performanceMonitor.cleanupMetrics()
      return { status: 'performance-metrics-cleaned' }
    }, 30 * 60 * 1000) // 30 minutes via global monitor
  } catch (error) {
    console.warn('[Performance] Failed to register with GlobalHealthMonitor:', error)
  }
}

export default performanceMonitor