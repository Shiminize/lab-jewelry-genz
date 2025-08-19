/**
 * Performance Monitoring System - Phase 4C Production Optimization
 * Comprehensive performance tracking, alerts, and optimization for customizer system
 * Implements CLAUDE_RULES <300ms response time requirements
 */

// Performance metrics interfaces
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage' | 'score'
  timestamp: Date
  labels: Record<string, string>
  threshold?: {
    warning: number
    critical: number
  }
}

export interface ComponentPerformance {
  componentName: string
  mountTime: number
  renderTime: number
  updateCount: number
  errorCount: number
  memoryUsage?: number
  childComponents: string[]
  customMetrics: Record<string, number>
}

export interface APIPerformance {
  endpoint: string
  method: string
  responseTime: number
  status: number
  cached: boolean
  dataSize: number
  retryCount: number
  errorType?: string
}

export interface CustomizerPerformance {
  sessionId: string
  mode: 'database' | 'hardcoded' | 'hybrid'
  variantLoadTime: number
  materialSwitchTime: number
  priceCalculationTime: number
  assetLoadTime: number
  totalInteractions: number
  errorRate: number
  cacheHitRate: number
}

// Performance thresholds based on CLAUDE_RULES
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: {
    warning: 200, // ms
    critical: 300  // ms - CLAUDE_RULES requirement
  },
  COMPONENT_MOUNT: {
    warning: 100,
    critical: 200
  },
  COMPONENT_RENDER: {
    warning: 16.67, // 60fps
    critical: 33.33  // 30fps
  },
  VARIANT_SWITCH: {
    warning: 150,
    critical: 250
  },
  ASSET_LOAD: {
    warning: 1000,
    critical: 2000
  },
  MEMORY_USAGE: {
    warning: 50 * 1024 * 1024, // 50MB
    critical: 100 * 1024 * 1024 // 100MB
  },
  ERROR_RATE: {
    warning: 0.01, // 1%
    critical: 0.05  // 5%
  },
  CACHE_HIT_RATE: {
    warning: 0.7,  // 70%
    critical: 0.5  // 50%
  }
}

// Alert interface
export interface PerformanceAlert {
  severity: 'warning' | 'critical'
  type: 'performance' | 'error' | 'availability'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: Date
  labels?: Record<string, string>
}

/**
 * Performance monitoring service
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private componentMetrics: Map<string, ComponentPerformance> = new Map()
  private apiMetrics: APIPerformance[] = []
  private customizerMetrics: Map<string, CustomizerPerformance> = new Map()
  private observers: PerformanceObserver[] = []
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = []
  private isEnabled: boolean = true
  private maxMetricsAge: number = 30 * 60 * 1000 // 30 minutes
  private maxMetricsCount: number = 1000
  private recentAlerts: PerformanceAlert[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeBrowserMonitoring()
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize browser-specific performance monitoring
   */
  private initializeBrowserMonitoring(): void {
    try {
      // Memory monitoring (if available)
      if ('memory' in performance) {
        setInterval(() => {
          this.recordMemoryMetrics()
        }, 10000) // Every 10 seconds
      }
    } catch (error) {
      console.warn('[PerformanceMonitor] Browser monitoring initialization failed:', error)
    }
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return

    const key = `${metric.name}_${Object.values(metric.labels).join('_')}`
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const metrics = this.metrics.get(key)!
    metrics.push(metric)

    // Maintain metrics size
    if (metrics.length > this.maxMetricsCount) {
      metrics.shift()
    }

    // Check thresholds and alert
    this.checkThresholds(metric)

    // Clean old metrics
    this.cleanOldMetrics()
  }

  /**
   * Record component performance
   */
  public recordComponentMetrics(metrics: ComponentPerformance): void {
    if (!this.isEnabled) return

    this.componentMetrics.set(metrics.componentName, metrics)

    // Record as general metrics
    this.recordMetric({
      name: 'component_mount_time',
      value: metrics.mountTime,
      unit: 'ms',
      timestamp: new Date(),
      labels: { component: metrics.componentName },
      threshold: PERFORMANCE_THRESHOLDS.COMPONENT_MOUNT
    })

    this.recordMetric({
      name: 'component_render_time',
      value: metrics.renderTime,
      unit: 'ms',
      timestamp: new Date(),
      labels: { component: metrics.componentName },
      threshold: PERFORMANCE_THRESHOLDS.COMPONENT_RENDER
    })
  }

  /**
   * Record API performance
   */
  public recordAPIMetrics(metrics: APIPerformance): void {
    if (!this.isEnabled) return

    this.apiMetrics.push(metrics)

    // Maintain API metrics size
    if (this.apiMetrics.length > this.maxMetricsCount) {
      this.apiMetrics.shift()
    }

    // Record as general metrics
    this.recordMetric({
      name: 'api_response_time',
      value: metrics.responseTime,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        endpoint: metrics.endpoint,
        method: metrics.method,
        status: metrics.status.toString(),
        cached: metrics.cached.toString()
      },
      threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME
    })
  }

  /**
   * Start timing a performance measurement
   */
  public startTiming(name: string, labels: Record<string, string> = {}): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime

      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        labels
      })

      return duration
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    overall: any
    components: ComponentPerformance[]
    apis: { endpoint: string; avgResponseTime: number; errorRate: number; cacheHitRate: number }[]
    customizers: CustomizerPerformance[]
    alerts: PerformanceAlert[]
  } {
    const now = Date.now()
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => now - m.timestamp.getTime() < 5 * 60 * 1000) // Last 5 minutes

    // API summary
    const recentAPIs = this.apiMetrics.filter(api => now - new Date().getTime() < 5 * 60 * 1000)
    const apiSummary = this.groupAPIsByEndpoint(recentAPIs)

    return {
      overall: {
        totalMetrics: recentMetrics.length,
        avgResponseTime: this.calculateAverage(recentMetrics.filter(m => m.name.includes('response_time')).map(m => m.value)),
        errorRate: this.calculateErrorRate(recentAPIs),
        memoryUsage: this.getCurrentMemoryUsage(),
        performanceScore: this.calculatePerformanceScore(recentMetrics)
      },
      components: Array.from(this.componentMetrics.values()),
      apis: apiSummary,
      customizers: Array.from(this.customizerMetrics.values()),
      alerts: this.getRecentAlerts()
    }
  }

  /**
   * Get real-time performance status
   */
  public getPerformanceStatus(): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const summary = this.getPerformanceSummary()
    
    if (summary.overall.avgResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME.critical) {
      return 'critical'
    }
    if (summary.overall.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE.critical) {
      return 'critical'
    }
    if (summary.overall.avgResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME.warning) {
      return 'poor'
    }
    if (summary.overall.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE.warning) {
      return 'fair'
    }
    if (summary.overall.avgResponseTime < 100 && summary.overall.errorRate < 0.001) {
      return 'excellent'
    }
    
    return 'good'
  }

  // Private helper methods
  private recordMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      
      this.recordMetric({
        name: 'memory_used',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: new Date(),
        labels: { type: 'js_heap' },
        threshold: PERFORMANCE_THRESHOLDS.MEMORY_USAGE
      })
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return

    let severity: 'warning' | 'critical' | null = null

    if (metric.value >= metric.threshold.critical) {
      severity = 'critical'
    } else if (metric.value >= metric.threshold.warning) {
      severity = 'warning'
    }

    if (severity) {
      this.triggerAlert({
        severity,
        type: 'performance',
        message: `${metric.name} threshold exceeded: ${metric.value}${metric.unit}`,
        metric: metric.name,
        value: metric.value,
        threshold: severity === 'critical' ? metric.threshold.critical : metric.threshold.warning,
        timestamp: new Date(),
        labels: metric.labels
      })
    }
  }

  private triggerAlert(alert: PerformanceAlert): void {
    this.recentAlerts.push(alert)
    
    // Keep only recent alerts (last 30 minutes)
    const cutoff = Date.now() - 30 * 60 * 1000
    this.recentAlerts = this.recentAlerts.filter(a => a.timestamp.getTime() > cutoff)
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('[PerformanceMonitor] Alert callback error:', error)
      }
    })
  }

  private cleanOldMetrics(): void {
    const cutoff = Date.now() - this.maxMetricsAge

    this.metrics.forEach((metrics, key) => {
      const filtered = metrics.filter(m => m.timestamp.getTime() > cutoff)
      if (filtered.length !== metrics.length) {
        this.metrics.set(key, filtered)
      }
    })
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private calculateErrorRate(apis: APIPerformance[]): number {
    if (apis.length === 0) return 0
    const errors = apis.filter(api => api.status >= 400).length
    return errors / apis.length
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    // Simplified performance score calculation (0-100)
    let score = 100
    
    const responseTimes = metrics.filter(m => m.name.includes('response_time')).map(m => m.value)
    if (responseTimes.length > 0) {
      const avgResponseTime = this.calculateAverage(responseTimes)
      if (avgResponseTime > 300) score -= 50
      else if (avgResponseTime > 200) score -= 25
      else if (avgResponseTime > 100) score -= 10
    }

    return Math.max(0, Math.min(100, score))
  }

  private groupAPIsByEndpoint(apis: APIPerformance[]): any[] {
    const grouped = new Map<string, APIPerformance[]>()
    
    apis.forEach(api => {
      const key = `${api.method} ${api.endpoint}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(api)
    })

    return Array.from(grouped.entries()).map(([endpoint, apis]) => ({
      endpoint,
      avgResponseTime: this.calculateAverage(apis.map(api => api.responseTime)),
      errorRate: this.calculateErrorRate(apis),
      cacheHitRate: apis.filter(api => api.cached).length / apis.length
    }))
  }

  private getRecentAlerts(): PerformanceAlert[] {
    return this.recentAlerts
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance()

export default PerformanceMonitor