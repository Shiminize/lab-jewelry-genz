
/**
 * Real-time Performance Monitoring for Customization API
 * Tracks CLAUDE_RULES compliance and alerts on violations
 */

interface PerformanceMetric {
  endpoint: string
  responseTime: number
  timestamp: number
  status: number
  cacheHit: boolean
  errors?: string[]
}

interface PerformanceAlert {
  type: 'response_time' | 'error_rate' | 'cache_miss' | 'database_slow'
  threshold: number
  currentValue: number
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class CustomizationPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds = {
    responseTime: 300,    // CLAUDE_RULES requirement
    errorRate: 1,         // 1% error rate threshold
    cacheHitRate: 80,     // 80% cache hit rate minimum
    databaseTime: 100     // Database query time threshold
  }

  // Record API performance metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
    
    // Check for performance violations
    this.checkThresholds(metric)
  }

  // Check for threshold violations and generate alerts
  private checkThresholds(metric: PerformanceMetric): void {
    // Response time violation
    if (metric.responseTime > this.thresholds.responseTime) {
      this.alerts.push({
        type: 'response_time',
        threshold: this.thresholds.responseTime,
        currentValue: metric.responseTime,
        timestamp: Date.now(),
        severity: metric.responseTime > 500 ? 'critical' : 'high'
      })
    }
    
    // Check recent error rate
    const recentMetrics = this.metrics.slice(-100) // Last 100 requests
    const errorCount = recentMetrics.filter(m => m.status >= 400).length
    const errorRate = (errorCount / recentMetrics.length) * 100
    
    if (errorRate > this.thresholds.errorRate) {
      this.alerts.push({
        type: 'error_rate',
        threshold: this.thresholds.errorRate,
        currentValue: errorRate,
        timestamp: Date.now(),
        severity: errorRate > 5 ? 'critical' : 'medium'
      })
    }
    
    // Check cache hit rate
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length
    const cacheHitRate = (cacheHits / recentMetrics.length) * 100
    
    if (cacheHitRate < this.thresholds.cacheHitRate) {
      this.alerts.push({
        type: 'cache_miss',
        threshold: this.thresholds.cacheHitRate,
        currentValue: cacheHitRate,
        timestamp: Date.now(),
        severity: cacheHitRate < 60 ? 'high' : 'medium'
      })
    }
  }

  // Get performance dashboard data
  getDashboardData(): any {
    const recentMetrics = this.metrics.slice(-100)
    
    if (recentMetrics.length === 0) {
      return {
        status: 'no_data',
        metrics: {},
        alerts: []
      }
    }
    
    const responseTimes = recentMetrics.map(m => m.responseTime)
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95)
    const errorCount = recentMetrics.filter(m => m.status >= 400).length
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length
    
    return {
      status: 'active',
      metrics: {
        avgResponseTime: Math.round(avgResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        errorRate: ((errorCount / recentMetrics.length) * 100).toFixed(2),
        cacheHitRate: ((cacheHits / recentMetrics.length) * 100).toFixed(2),
        totalRequests: recentMetrics.length,
        claudeRulesCompliant: avgResponseTime < this.thresholds.responseTime
      },
      alerts: this.alerts.slice(-10), // Last 10 alerts
      thresholds: this.thresholds
    }
  }

  // Generate performance report
  generateReport(): any {
    const dashboard = this.getDashboardData()
    const recentMetrics = this.metrics.slice(-1000)
    
    // Calculate hourly breakdown
    const hourlyBreakdown = this.calculateHourlyBreakdown(recentMetrics)
    
    // Endpoint performance breakdown
    const endpointBreakdown = this.calculateEndpointBreakdown(recentMetrics)
    
    return {
      timestamp: new Date().toISOString(),
      summary: dashboard.metrics,
      hourlyTrends: hourlyBreakdown,
      endpointPerformance: endpointBreakdown,
      alerts: dashboard.alerts,
      recommendations: this.generateRecommendations(dashboard)
    }
  }

  // Calculate percentile for response times
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  // Calculate hourly performance breakdown
  private calculateHourlyBreakdown(metrics: PerformanceMetric[]): any[] {
    const hourlyData: Record<string, { count: number, totalTime: number, errors: number }> = {}
    
    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).toISOString().substr(0, 13) + ':00:00.000Z'
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, totalTime: 0, errors: 0 }
      }
      
      hourlyData[hour].count++
      hourlyData[hour].totalTime += metric.responseTime
      if (metric.status >= 400) hourlyData[hour].errors++
    })
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      averageResponseTime: Math.round(data.totalTime / data.count),
      requestCount: data.count,
      errorRate: ((data.errors / data.count) * 100).toFixed(2)
    }))
  }

  // Calculate endpoint performance breakdown
  private calculateEndpointBreakdown(metrics: PerformanceMetric[]): any[] {
    const endpointData: Record<string, { count: number, totalTime: number, errors: number }> = {}
    
    metrics.forEach(metric => {
      if (!endpointData[metric.endpoint]) {
        endpointData[metric.endpoint] = { count: 0, totalTime: 0, errors: 0 }
      }
      
      endpointData[metric.endpoint].count++
      endpointData[metric.endpoint].totalTime += metric.responseTime
      if (metric.status >= 400) endpointData[metric.endpoint].errors++
    })
    
    return Object.entries(endpointData).map(([endpoint, data]) => ({
      endpoint,
      averageResponseTime: Math.round(data.totalTime / data.count),
      requestCount: data.count,
      errorRate: ((data.errors / data.count) * 100).toFixed(2),
      compliant: (data.totalTime / data.count) < this.thresholds.responseTime
    }))
  }

  // Generate optimization recommendations
  private generateRecommendations(dashboard: any): string[] {
    const recommendations: string[] = []
    
    if (dashboard.metrics.avgResponseTime > this.thresholds.responseTime) {
      recommendations.push('Optimize database queries - average response time exceeds 300ms target')
    }
    
    if (parseFloat(dashboard.metrics.cacheHitRate) < this.thresholds.cacheHitRate) {
      recommendations.push('Improve caching strategy - cache hit rate below 80% target')
    }
    
    if (parseFloat(dashboard.metrics.errorRate) > this.thresholds.errorRate) {
      recommendations.push('Investigate error patterns - error rate above 1% threshold')
    }
    
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical').length
    if (criticalAlerts > 0) {
      recommendations.push(`Address ${criticalAlerts} critical performance alerts immediately`)
    }
    
    return recommendations
  }
}

export const performanceMonitor = new CustomizationPerformanceMonitor()
