/**
 * Performance Monitoring Middleware - Phase 3: API Layer Enhancement
 * Tracks API performance metrics for CLAUDE_RULES compliance (<300ms)
 * 
 * Provides real-time performance monitoring, alerts, and optimization recommendations
 */

import { NextRequest, NextResponse } from 'next/server'

export interface PerformanceMetric {
  endpoint: string
  method: string
  responseTime: number
  timestamp: Date
  status: number
  cacheStatus: 'hit' | 'miss' | 'bypass'
  claudeRulesCompliant: boolean
  userAgent?: string
  requestSize?: number
  responseSize?: number
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'critical'
  message: string
  endpoint: string
  threshold: number
  actual: number
  timestamp: Date
  recommendations: string[]
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private maxMetricsHistory = 1000
  private maxAlertsHistory = 100
  
  // CLAUDE_RULES performance thresholds
  private readonly thresholds = {
    critical: 300,    // CLAUDE_RULES limit
    warning: 200,     // Warning threshold
    optimal: 100      // Optimal performance
  }

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    // Add to metrics history
    this.metrics.push(metric)
    
    // Maintain history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }

    // Check for performance issues and generate alerts
    this.checkPerformanceThresholds(metric)
    
    // Log performance for monitoring
    this.logPerformanceMetric(metric)
  }

  /**
   * Check if metric violates performance thresholds
   */
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const { responseTime, endpoint, method } = metric
    
    if (responseTime > this.thresholds.critical) {
      this.createAlert({
        type: 'critical',
        message: `CLAUDE_RULES violation: ${method} ${endpoint} exceeded 300ms threshold`,
        endpoint: `${method} ${endpoint}`,
        threshold: this.thresholds.critical,
        actual: responseTime,
        timestamp: new Date(),
        recommendations: [
          'Implement response caching',
          'Optimize database queries',
          'Add connection pooling',
          'Consider CDN for static assets',
          'Review algorithm complexity'
        ]
      })
    } else if (responseTime > this.thresholds.warning) {
      this.createAlert({
        type: 'warning',
        message: `Performance warning: ${method} ${endpoint} approaching CLAUDE_RULES limit`,
        endpoint: `${method} ${endpoint}`,
        threshold: this.thresholds.warning,
        actual: responseTime,
        timestamp: new Date(),
        recommendations: [
          'Monitor closely for degradation',
          'Implement preemptive caching',
          'Optimize data serialization',
          'Consider response compression'
        ]
      })
    }
  }

  /**
   * Create and store a performance alert
   */
  private createAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert)
    
    // Maintain alerts history limit
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory)
    }

    // Log alert for monitoring systems
    const logLevel = alert.type === 'critical' ? 'error' : 'warn'
    console[logLevel](`🚨 Performance Alert [${alert.type.toUpperCase()}]:`, {
      message: alert.message,
      endpoint: alert.endpoint,
      threshold: `${alert.threshold}ms`,
      actual: `${alert.actual}ms`,
      recommendations: alert.recommendations
    })
  }

  /**
   * Log performance metric for monitoring
   */
  private logPerformanceMetric(metric: PerformanceMetric): void {
    const logData = {
      endpoint: metric.endpoint,
      method: metric.method,
      responseTime: `${metric.responseTime}ms`,
      status: metric.status,
      cacheStatus: metric.cacheStatus,
      claudeRulesCompliant: metric.claudeRulesCompliant,
      performance: metric.responseTime < this.thresholds.optimal ? 'optimal' :
                   metric.responseTime < this.thresholds.warning ? 'good' :
                   metric.responseTime < this.thresholds.critical ? 'warning' : 'critical'
    }

    if (metric.claudeRulesCompliant) {
      console.info('📊 API Performance:', logData)
    } else {
      console.warn('⚠️ CLAUDE_RULES Performance Issue:', logData)
    }
  }

  /**
   * Get performance statistics
   */
  getStats(timeRangeMs?: number): {
    total: number
    claudeRulesCompliant: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    cacheHitRate: number
    alertCounts: { critical: number; warning: number; error: number }
    topSlowEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>
  } {
    const cutoffTime = timeRangeMs ? new Date(Date.now() - timeRangeMs) : new Date(0)
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime)
    
    if (relevantMetrics.length === 0) {
      return {
        total: 0,
        claudeRulesCompliant: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        cacheHitRate: 0,
        alertCounts: { critical: 0, warning: 0, error: 0 },
        topSlowEndpoints: []
      }
    }

    // Sort by response time for percentile calculations
    const sortedTimes = relevantMetrics
      .map(m => m.responseTime)
      .sort((a, b) => a - b)
    
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)
    
    // Calculate cache hit rate
    const cacheHits = relevantMetrics.filter(m => m.cacheStatus === 'hit').length
    const cacheHitRate = relevantMetrics.length > 0 ? (cacheHits / relevantMetrics.length) * 100 : 0
    
    // Get alert counts
    const recentAlerts = this.alerts.filter(a => a.timestamp >= cutoffTime)
    const alertCounts = {
      critical: recentAlerts.filter(a => a.type === 'critical').length,
      warning: recentAlerts.filter(a => a.type === 'warning').length,
      error: recentAlerts.filter(a => a.type === 'error').length
    }
    
    // Calculate top slow endpoints
    const endpointStats = new Map<string, { totalTime: number; count: number }>()
    relevantMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = endpointStats.get(key) || { totalTime: 0, count: 0 }
      endpointStats.set(key, {
        totalTime: existing.totalTime + metric.responseTime,
        count: existing.count + 1
      })
    })
    
    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: Math.round(stats.totalTime / stats.count),
        count: stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5)

    return {
      total: relevantMetrics.length,
      claudeRulesCompliant: relevantMetrics.filter(m => m.claudeRulesCompliant).length,
      averageResponseTime: Math.round(
        relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / relevantMetrics.length
      ),
      p95ResponseTime: Math.round(sortedTimes[p95Index] || 0),
      p99ResponseTime: Math.round(sortedTimes[p99Index] || 0),
      cacheHitRate: Math.round(cacheHitRate),
      alertCounts,
      topSlowEndpoints
    }
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10): PerformanceAlert[] {
    return this.alerts
      .slice(-limit)
      .reverse() // Most recent first
  }

  /**
   * Clear metrics and alerts (useful for testing)
   */
  clearHistory(): void {
    this.metrics = []
    this.alerts = []
  }

  /**
   * Get CLAUDE_RULES compliance report
   */
  getClaudeRulesCompliance(timeRangeMs = 3600000): { // Default: 1 hour
    compliant: number
    total: number
    percentage: number
    violations: Array<{
      endpoint: string
      responseTime: number
      timestamp: Date
    }>
  } {
    const cutoffTime = new Date(Date.now() - timeRangeMs)
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime)
    
    const violations = relevantMetrics
      .filter(m => !m.claudeRulesCompliant)
      .map(m => ({
        endpoint: `${m.method} ${m.endpoint}`,
        responseTime: m.responseTime,
        timestamp: m.timestamp
      }))
      .slice(-20) // Last 20 violations
    
    const compliant = relevantMetrics.filter(m => m.claudeRulesCompliant).length
    const total = relevantMetrics.length
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 100
    
    return {
      compliant,
      total,
      percentage,
      violations
    }
  }
}

/**
 * Express-style middleware for performance monitoring
 */
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  endpointName: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const monitor = PerformanceMonitor.getInstance()
    const startTime = performance.now()
    const request = args[0] as NextRequest
    
    try {
      const response = await handler(...args)
      const responseTime = performance.now() - startTime
      
      // Record performance metric
      monitor.recordMetric({
        endpoint: endpointName,
        method: request.method,
        responseTime,
        timestamp: new Date(),
        status: response.status,
        cacheStatus: response.headers.get('X-Cache-Status') as any || 'miss',
        claudeRulesCompliant: responseTime < 300,
        userAgent: request.headers.get('user-agent') || undefined,
        requestSize: parseInt(request.headers.get('content-length') || '0'),
        responseSize: response.headers.get('content-length') ? 
          parseInt(response.headers.get('content-length')!) : undefined
      })

      // Add performance headers to response
      response.headers.set('X-Response-Time', `${Math.round(responseTime)}ms`)
      response.headers.set('X-CLAUDE-Rules-Compliant', (responseTime < 300).toString())
      response.headers.set('X-Performance-Tier', 
        responseTime < 100 ? 'optimal' :
        responseTime < 200 ? 'good' :
        responseTime < 300 ? 'acceptable' : 'needs-improvement'
      )
      
      return response
      
    } catch (error) {
      const responseTime = performance.now() - startTime
      
      // Record error metric
      monitor.recordMetric({
        endpoint: endpointName,
        method: request.method,
        responseTime,
        timestamp: new Date(),
        status: 500,
        cacheStatus: 'bypass',
        claudeRulesCompliant: false
      })
      
      throw error
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
export { PerformanceMonitor }