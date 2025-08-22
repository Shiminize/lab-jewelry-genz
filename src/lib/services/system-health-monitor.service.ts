/**
 * System Health Monitor Service - Phase 4 Implementation
 * CLAUDE_RULES.md Compliant System Monitoring
 * 
 * Monitors performance metrics, memory usage, and system health
 * Provides real-time health dashboards and alerting
 */

'use client'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  threshold: number
  status: 'healthy' | 'warning' | 'critical'
  timestamp: number
}

interface SystemHealthData {
  performance: {
    domLoadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  network: {
    requestCount: number
    errorCount: number
    averageResponseTime: number
  }
  customizer: {
    materialSwitchTimes: number[]
    averageSwitchTime: number
    preloadingSuccess: boolean
    cacheHitRate: number
  }
}

interface HealthAlert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: number
  resolved: boolean
}

class SystemHealthMonitorService {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private alerts: HealthAlert[] = []
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private observers: PerformanceObserver[] = []
  
  // CLAUDE_RULES.md compliance thresholds
  private readonly thresholds = {
    domLoadTime: 1000, // <1s
    firstContentfulPaint: 1000, // <1s
    largestContentfulPaint: 2500, // <2.5s
    cumulativeLayoutShift: 0.1, // <0.1
    firstInputDelay: 100, // <100ms
    materialSwitchTime: 100, // <100ms
    memoryUsage: 80, // <80%
    networkErrorRate: 5, // <5%
    cacheHitRate: 80 // >80%
  }

  /**
   * Start system health monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('🏥 System health monitoring already active')
      return
    }

    console.log('🏥 Starting system health monitoring...')
    this.isMonitoring = true

    // CRITICAL FIX: Use GlobalHealthMonitor instead of creating duplicate intervals
    const GlobalHealthMonitor = require('../global-health-monitor').default
    const healthMonitor = GlobalHealthMonitor.getInstance()
    
    // Initialize performance observers
    this.initializePerformanceObservers()
    
    // Register system health service with the global monitor
    healthMonitor.registerService('system-health-monitor', async () => {
      try {
        this.collectHealthMetrics()
        return { status: 'system-health-collected' }
      } catch (error) {
        console.error('System health monitoring failed:', error)
        throw error
      }
    }, 5000) // Every 5 seconds
    
    console.log('📊 SystemHealthMonitorService: Registered with GlobalHealthMonitor')
  }

  /**
   * Stop system health monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return

    console.log('🏥 Stopping system health monitoring...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    // Disconnect performance observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []

    this.isMonitoring = false
    console.log('✅ System health monitoring stopped')
  }

  /**
   * Initialize performance observers for real-time monitoring
   */
  private initializePerformanceObservers(): void {
    try {
      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('firstContentfulPaint', entry.startTime, 'ms')
          } else if (entry.name === 'largest-contentful-paint') {
            this.recordMetric('largestContentfulPaint', entry.startTime, 'ms')
          }
        }
      })
      paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      this.observers.push(paintObserver)

      // Layout shift observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries() as LayoutShift[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.recordMetric('cumulativeLayoutShift', clsValue, 'score')
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

      // First input delay observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEventTiming[]) {
          const fid = entry.processingStart - entry.startTime
          this.recordMetric('firstInputDelay', fid, 'ms')
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

    } catch (error) {
      console.warn('⚠️ Some performance observers not supported:', error)
    }
  }

  /**
   * Collect comprehensive health metrics
   */
  private collectHealthMetrics(): void {
    try {
      // Navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navTiming) {
        const domLoadTime = navTiming.domContentLoadedEventEnd - navTiming.navigationStart
        this.recordMetric('domLoadTime', domLoadTime, 'ms')
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        this.recordMetric('memoryUsage', memoryUsage, '%')
      }

      // Network timing
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      if (resourceEntries.length > 0) {
        const totalRequests = resourceEntries.length
        const errorRequests = resourceEntries.filter(entry => entry.transferSize === 0).length
        const errorRate = (errorRequests / totalRequests) * 100
        
        const averageResponseTime = resourceEntries
          .map(entry => entry.responseEnd - entry.requestStart)
          .reduce((sum, time) => sum + time, 0) / totalRequests

        this.recordMetric('networkErrorRate', errorRate, '%')
        this.recordMetric('averageResponseTime', averageResponseTime, 'ms')
      }

      // Custom metrics from material preloader
      if (typeof window !== 'undefined' && (window as any).materialPreloader) {
        const preloader = (window as any).materialPreloader
        const stats = preloader.getCacheStats()
        
        if (stats) {
          const cacheHitRate = stats.totalImages > 0 ? 
            (stats.completedMaterials / stats.cachedMaterials) * 100 : 0
          this.recordMetric('cacheHitRate', cacheHitRate, '%')
        }
      }

      // Check for alerts
      this.checkHealthAlerts()

    } catch (error) {
      console.error('❌ Error collecting health metrics:', error)
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, unit: string): void {
    const threshold = this.thresholds[name as keyof typeof this.thresholds] || 0
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (name === 'cacheHitRate') {
      // Higher is better for cache hit rate
      status = value < threshold * 0.5 ? 'critical' : value < threshold ? 'warning' : 'healthy'
    } else {
      // Lower is better for most metrics
      status = value > threshold * 2 ? 'critical' : value > threshold ? 'warning' : 'healthy'
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      threshold,
      status,
      timestamp: Date.now()
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricHistory = this.metrics.get(name)!
    metricHistory.push(metric)

    // Keep only last 100 measurements
    if (metricHistory.length > 100) {
      metricHistory.splice(0, metricHistory.length - 100)
    }

    // Log significant metrics
    if (status !== 'healthy') {
      console.warn(`⚠️ Health metric ${name}: ${value}${unit} (threshold: ${threshold}${unit})`)
    } else if (name === 'materialSwitchTime' && value < 10) {
      console.log(`⚡ Excellent material switch: ${value}ms`)
    }
  }

  /**
   * Check for health alerts based on current metrics
   */
  private checkHealthAlerts(): void {
    for (const [metricName, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length === 0) continue

      const latestMetric = metricHistory[metricHistory.length - 1]
      
      if (latestMetric.status === 'critical') {
        this.createAlert('critical', 
          `Critical performance issue: ${metricName} at ${latestMetric.value}${latestMetric.unit}`,
          metricName, latestMetric.value, latestMetric.threshold)
      } else if (latestMetric.status === 'warning') {
        this.createAlert('warning',
          `Performance warning: ${metricName} at ${latestMetric.value}${latestMetric.unit}`,
          metricName, latestMetric.value, latestMetric.threshold)
      }
    }
  }

  /**
   * Create a health alert
   */
  private createAlert(severity: 'info' | 'warning' | 'error' | 'critical', 
                     message: string, metric: string, value: number, threshold: number): void {
    const alertId = `${metric}_${Date.now()}`
    
    const alert: HealthAlert = {
      id: alertId,
      severity,
      message,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      resolved: false
    }

    this.alerts.push(alert)

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.splice(0, this.alerts.length - 50)
    }

    console.log(`🚨 Health alert [${severity.toUpperCase()}]: ${message}`)
  }

  /**
   * Get current system health summary
   */
  public getHealthSummary(): SystemHealthData {
    const getLatestMetric = (name: string): number => {
      const history = this.metrics.get(name)
      return history && history.length > 0 ? history[history.length - 1].value : 0
    }

    const getAverageMetric = (name: string, count: number = 10): number => {
      const history = this.metrics.get(name)
      if (!history || history.length === 0) return 0
      
      const recent = history.slice(-count)
      return recent.reduce((sum, metric) => sum + metric.value, 0) / recent.length
    }

    return {
      performance: {
        domLoadTime: getLatestMetric('domLoadTime'),
        firstContentfulPaint: getLatestMetric('firstContentfulPaint'),
        largestContentfulPaint: getLatestMetric('largestContentfulPaint'),
        cumulativeLayoutShift: getLatestMetric('cumulativeLayoutShift'),
        firstInputDelay: getLatestMetric('firstInputDelay')
      },
      memory: {
        used: getLatestMetric('memoryUsage'),
        total: 100,
        percentage: getLatestMetric('memoryUsage')
      },
      network: {
        requestCount: this.metrics.get('networkErrorRate')?.length || 0,
        errorCount: Math.round(getLatestMetric('networkErrorRate')),
        averageResponseTime: getAverageMetric('averageResponseTime')
      },
      customizer: {
        materialSwitchTimes: this.metrics.get('materialSwitchTime')?.slice(-10).map(m => m.value) || [],
        averageSwitchTime: getAverageMetric('materialSwitchTime'),
        preloadingSuccess: getLatestMetric('cacheHitRate') > 80,
        cacheHitRate: getLatestMetric('cacheHitRate')
      }
    }
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * Get performance metrics for a specific metric
   */
  public getMetricHistory(metricName: string, count: number = 50): PerformanceMetric[] {
    const history = this.metrics.get(metricName)
    return history ? history.slice(-count) : []
  }

  /**
   * Clear all metrics and alerts
   */
  public clearData(): void {
    this.metrics.clear()
    this.alerts.length = 0
    console.log('🧹 Health monitoring data cleared')
  }

  /**
   * Record material switch time from external source
   */
  public recordMaterialSwitch(switchTime: number): void {
    this.recordMetric('materialSwitchTime', switchTime, 'ms')
  }

  /**
   * Get CLAUDE_RULES.md compliance status
   */
  public getComplianceStatus(): { 
    overall: number
    metrics: { [key: string]: { value: number; threshold: number; compliant: boolean } }
  } {
    const complianceMetrics: { [key: string]: { value: number; threshold: number; compliant: boolean } } = {}
    let compliantCount = 0
    let totalCount = 0

    for (const [metricName, threshold] of Object.entries(this.thresholds)) {
      const history = this.metrics.get(metricName)
      if (history && history.length > 0) {
        const latestValue = history[history.length - 1].value
        const isCompliant = metricName === 'cacheHitRate' ? 
          latestValue >= threshold : latestValue <= threshold

        complianceMetrics[metricName] = {
          value: latestValue,
          threshold,
          compliant: isCompliant
        }

        if (isCompliant) compliantCount++
        totalCount++
      }
    }

    const overallCompliance = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0

    return {
      overall: overallCompliance,
      metrics: complianceMetrics
    }
  }
}

// Export singleton instance
export const systemHealthMonitor = new SystemHealthMonitorService()
export type { PerformanceMetric, SystemHealthData, HealthAlert }