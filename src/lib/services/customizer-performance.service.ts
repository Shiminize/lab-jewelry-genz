/**
 * Customizer Performance Monitoring Service - CLAUDE_RULES Phase 2
 * 
 * Comprehensive performance tracking and optimization for CSS 3D customizer:
 * - Real-time CLAUDE_RULES compliance monitoring
 * - Performance bottleneck detection and reporting
 * - User experience metrics and analytics
 * - Automatic optimization recommendations
 * - Memory usage tracking and alerts
 * 
 * CLAUDE_RULES Performance Requirements:
 * - <100ms material switching
 * - <2s initial load time
 * - <16ms gesture processing (60fps)
 * - <50MB memory usage
 */

'use client'

interface PerformanceMetrics {
  // CLAUDE_RULES Compliance Metrics
  materialSwitchTimes: number[]
  initialLoadTime: number | null
  gestureProcessingTimes: number[]
  
  // Memory Metrics
  memoryUsage: number
  peakMemoryUsage: number
  memoryLeaks: number
  
  // User Experience Metrics
  frameDrops: number
  responsiveness: number
  userInteractions: number
  errorRate: number
  
  // System Performance
  cpuUsage: number
  networkLatency: number
  cacheHitRate: number
  imageLoadTimes: number[]
  
  // Timestamps
  sessionStartTime: number
  lastUpdateTime: number
}

interface PerformanceAlert {
  type: 'error' | 'warning' | 'info'
  category: 'claude_rules' | 'memory' | 'ux' | 'system'
  message: string
  value: number
  threshold: number
  timestamp: number
  suggestions: string[]
}

interface PerformanceThresholds {
  materialSwitchMs: number // CLAUDE_RULES: <100ms
  initialLoadMs: number // CLAUDE_RULES: <2s
  gestureProcessingMs: number // <16ms for 60fps
  memoryUsageMB: number // <50MB
  frameDropThreshold: number
  responsivenessThreshold: number
  errorRateThreshold: number
}

class CustomizerPerformanceService {
  private metrics: PerformanceMetrics
  private thresholds: PerformanceThresholds
  private alerts: PerformanceAlert[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private perfObserver: PerformanceObserver | null = null
  private memoryMonitorInterval: NodeJS.Timeout | null = null
  
  // Real-time tracking
  private lastFrameTime = performance.now()
  private frameCount = 0
  private recentFrameTimes: number[] = []

  constructor() {
    this.thresholds = {
      materialSwitchMs: 100, // CLAUDE_RULES mandatory
      initialLoadMs: 2000, // CLAUDE_RULES mandatory
      gestureProcessingMs: 16, // 60fps requirement
      memoryUsageMB: 50, // Reasonable memory limit
      frameDropThreshold: 5, // Max dropped frames per second
      responsivenessThreshold: 0.95, // 95% responsiveness
      errorRateThreshold: 0.05 // 5% max error rate
    }

    this.metrics = {
      materialSwitchTimes: [],
      initialLoadTime: null,
      gestureProcessingTimes: [],
      memoryUsage: 0,
      peakMemoryUsage: 0,
      memoryLeaks: 0,
      frameDrops: 0,
      responsiveness: 1.0,
      userInteractions: 0,
      errorRate: 0,
      cpuUsage: 0,
      networkLatency: 0,
      cacheHitRate: 0,
      imageLoadTimes: [],
      sessionStartTime: performance.now(),
      lastUpdateTime: performance.now()
    }

    this.initializeMonitoring()
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // CRITICAL FIX: Use GlobalHealthMonitor instead of creating duplicate intervals
    const GlobalHealthMonitor = require('../global-health-monitor').default
    const healthMonitor = GlobalHealthMonitor.getInstance()
    
    // Register customizer performance monitoring service
    healthMonitor.registerService('customizer-performance', async () => {
      try {
        this.updateFrameMetrics()
        this.updateMemoryMetrics()
        this.checkComplianceAndAlerts()
        return { status: 'customizer-performance-updated' }
      } catch (error) {
        console.error('Customizer performance monitoring failed:', error)
        throw error
      }
    }, 1000) // Check every second
    
    // Register memory monitoring service
    healthMonitor.registerService('customizer-memory', async () => {
      try {
        this.updateMemoryMetrics()
        return { status: 'customizer-memory-updated' }
      } catch (error) {
        console.error('Customizer memory monitoring failed:', error)
        throw error
      }
    }, 5000) // Every 5 seconds

    console.log('📊 Customizer performance monitoring initialized')
  }

  /**
   * Record material switch performance (CLAUDE_RULES critical)
   */
  public recordMaterialSwitch(startTime: number): void {
    const switchTime = performance.now() - startTime
    this.metrics.materialSwitchTimes.push(switchTime)
    
    // Keep only recent measurements (last 50)
    if (this.metrics.materialSwitchTimes.length > 50) {
      this.metrics.materialSwitchTimes = this.metrics.materialSwitchTimes.slice(-25)
    }

    // Check CLAUDE_RULES compliance
    if (switchTime > this.thresholds.materialSwitchMs) {
      this.addAlert({
        type: 'error',
        category: 'claude_rules',
        message: `Material switch exceeded CLAUDE_RULES requirement`,
        value: switchTime,
        threshold: this.thresholds.materialSwitchMs,
        timestamp: Date.now(),
        suggestions: [
          'Ensure images are preloaded using material-preloader.service',
          'Check for memory pressure causing garbage collection',
          'Verify frame cache is properly configured'
        ]
      })
    }

    console.log(`⚡ Material switch: ${switchTime.toFixed(0)}ms ${switchTime <= this.thresholds.materialSwitchMs ? '✅' : '❌'}`)
  }

  /**
   * Record initial load performance (CLAUDE_RULES critical)
   */
  public recordInitialLoad(startTime: number): void {
    const loadTime = performance.now() - startTime
    this.metrics.initialLoadTime = loadTime
    
    if (loadTime > this.thresholds.initialLoadMs) {
      this.addAlert({
        type: 'error',
        category: 'claude_rules',
        message: `Initial load exceeded CLAUDE_RULES requirement`,
        value: loadTime,
        threshold: this.thresholds.initialLoadMs,
        timestamp: Date.now(),
        suggestions: [
          'Enable priority material preloading',
          'Optimize critical render path',
          'Consider progressive loading strategy'
        ]
      })
    }

    console.log(`🚀 Initial load: ${loadTime.toFixed(0)}ms ${loadTime <= this.thresholds.initialLoadMs ? '✅' : '❌'}`)
  }

  /**
   * Record gesture processing performance
   */
  public recordGestureProcessing(startTime: number): void {
    const processingTime = performance.now() - startTime
    this.metrics.gestureProcessingTimes.push(processingTime)
    
    // Keep only recent measurements
    if (this.metrics.gestureProcessingTimes.length > 100) {
      this.metrics.gestureProcessingTimes = this.metrics.gestureProcessingTimes.slice(-50)
    }

    if (processingTime > this.thresholds.gestureProcessingMs) {
      this.addAlert({
        type: 'warning',
        category: 'ux',
        message: `Gesture processing slower than 60fps target`,
        value: processingTime,
        threshold: this.thresholds.gestureProcessingMs,
        timestamp: Date.now(),
        suggestions: [
          'Optimize touch event handlers',
          'Use requestAnimationFrame for smooth animations',
          'Check for blocking operations in gesture handlers'
        ]
      })
    }
  }

  /**
   * Record image load performance
   */
  public recordImageLoad(startTime: number): void {
    const loadTime = performance.now() - startTime
    this.metrics.imageLoadTimes.push(loadTime)
    
    // Keep only recent measurements
    if (this.metrics.imageLoadTimes.length > 100) {
      this.metrics.imageLoadTimes = this.metrics.imageLoadTimes.slice(-50)
    }
  }

  /**
   * Record user interaction
   */
  public recordUserInteraction(): void {
    this.metrics.userInteractions++
  }

  /**
   * Record error occurrence
   */
  public recordError(error: Error): void {
    const totalInteractions = this.metrics.userInteractions + 1
    this.metrics.errorRate = (this.metrics.errorRate * (totalInteractions - 1) + 1) / totalInteractions
    
    if (this.metrics.errorRate > this.thresholds.errorRateThreshold) {
      this.addAlert({
        type: 'error',
        category: 'ux',
        message: `Error rate exceeded threshold`,
        value: this.metrics.errorRate * 100,
        threshold: this.thresholds.errorRateThreshold * 100,
        timestamp: Date.now(),
        suggestions: [
          'Review error logs for common issues',
          'Implement better error boundaries',
          'Add fallback mechanisms for common failures'
        ]
      })
    }

    console.error('🚨 Customizer error recorded:', error)
  }

  /**
   * Process performance entries from PerformanceObserver
   */
  private processPaintEntries(entries: PerformanceEntry[]): void {
    for (const entry of entries) {
      if (entry.name === 'first-contentful-paint' && !this.metrics.initialLoadTime) {
        this.recordInitialLoad(this.metrics.sessionStartTime)
      }
    }
  }

  /**
   * Update frame rate and responsiveness metrics
   */
  private updateFrameMetrics(): void {
    const now = performance.now()
    const frameDelta = now - this.lastFrameTime
    
    this.recentFrameTimes.push(frameDelta)
    if (this.recentFrameTimes.length > 60) { // Keep 1 second of data at 60fps
      this.recentFrameTimes = this.recentFrameTimes.slice(-30)
    }

    // Calculate frame drops (frames that took longer than 16.67ms for 60fps)
    const frameDrops = this.recentFrameTimes.filter(time => time > 16.67).length
    this.metrics.frameDrops = frameDrops

    // Calculate responsiveness (percentage of smooth frames)
    this.metrics.responsiveness = this.recentFrameTimes.length > 0 
      ? 1 - (frameDrops / this.recentFrameTimes.length)
      : 1.0

    this.lastFrameTime = now
    this.frameCount++
  }

  /**
   * Update memory usage metrics
   */
  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usageInMB = memory.usedJSHeapSize / (1024 * 1024)
      
      this.metrics.memoryUsage = usageInMB
      this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, usageInMB)
      
      // Detect potential memory leaks (continuously increasing memory)
      if (usageInMB > this.metrics.peakMemoryUsage * 0.9) {
        this.metrics.memoryLeaks++
      }

      // Check memory threshold
      if (usageInMB > this.thresholds.memoryUsageMB) {
        this.addAlert({
          type: 'warning',
          category: 'memory',
          message: `Memory usage exceeded threshold`,
          value: usageInMB,
          threshold: this.thresholds.memoryUsageMB,
          timestamp: Date.now(),
          suggestions: [
            'Clear unused image caches',
            'Reduce preloaded material count',
            'Check for memory leaks in event listeners'
          ]
        })
      }
    }
  }

  /**
   * Check compliance and generate alerts
   */
  private checkComplianceAndAlerts(): void {
    this.metrics.lastUpdateTime = performance.now()

    // Check frame rate
    if (this.metrics.responsiveness < this.thresholds.responsivenessThreshold) {
      this.addAlert({
        type: 'warning',
        category: 'ux',
        message: `Frame rate below target`,
        value: this.metrics.responsiveness * 100,
        threshold: this.thresholds.responsivenessThreshold * 100,
        timestamp: Date.now(),
        suggestions: [
          'Optimize rendering performance',
          'Reduce simultaneous animations',
          'Check for CPU-intensive operations'
        ]
      })
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert)
    
    // Keep only recent alerts (last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50)
    }

    // Log based on severity
    if (alert.type === 'error') {
      console.error(`🚨 PERFORMANCE ALERT: ${alert.message} (${alert.value.toFixed(1)} > ${alert.threshold})`)
    } else if (alert.type === 'warning') {
      console.warn(`⚠️ Performance Warning: ${alert.message} (${alert.value.toFixed(1)} > ${alert.threshold})`)
    }
  }

  /**
   * Get comprehensive performance report
   */
  public getPerformanceReport(): {
    claudeRulesCompliance: boolean
    metrics: PerformanceMetrics
    averages: {
      avgMaterialSwitchTime: number
      avgGestureProcessingTime: number
      avgImageLoadTime: number
    }
    alerts: PerformanceAlert[]
    recommendations: string[]
  } {
    const avgMaterialSwitchTime = this.metrics.materialSwitchTimes.length > 0
      ? this.metrics.materialSwitchTimes.reduce((sum, time) => sum + time, 0) / this.metrics.materialSwitchTimes.length
      : 0

    const avgGestureProcessingTime = this.metrics.gestureProcessingTimes.length > 0
      ? this.metrics.gestureProcessingTimes.reduce((sum, time) => sum + time, 0) / this.metrics.gestureProcessingTimes.length
      : 0

    const avgImageLoadTime = this.metrics.imageLoadTimes.length > 0
      ? this.metrics.imageLoadTimes.reduce((sum, time) => sum + time, 0) / this.metrics.imageLoadTimes.length
      : 0

    const claudeRulesCompliance = (
      avgMaterialSwitchTime <= this.thresholds.materialSwitchMs &&
      (this.metrics.initialLoadTime ?? 0) <= this.thresholds.initialLoadMs
    )

    const recommendations = this.generateRecommendations()

    return {
      claudeRulesCompliance,
      metrics: { ...this.metrics },
      averages: {
        avgMaterialSwitchTime,
        avgGestureProcessingTime,
        avgImageLoadTime
      },
      alerts: [...this.alerts],
      recommendations
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const report = this.getPerformanceReport()

    if (!report.claudeRulesCompliance) {
      recommendations.push('❌ CLAUDE_RULES compliance failed - implement priority optimizations')
    }

    if (report.averages.avgMaterialSwitchTime > 100) {
      recommendations.push('⚡ Enable material preloading for faster switching')
    }

    if (this.metrics.memoryUsage > 40) {
      recommendations.push('🧹 Optimize memory usage - clear unused caches')
    }

    if (this.metrics.responsiveness < 0.9) {
      recommendations.push('🎯 Improve frame rate - optimize rendering pipeline')
    }

    if (report.averages.avgImageLoadTime > 1000) {
      recommendations.push('📥 Optimize image loading - use progressive formats')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance is optimal - maintain current optimizations')
    }

    return recommendations
  }

  /**
   * Get real-time performance summary
   */
  public getPerformanceSummary(): string {
    const report = this.getPerformanceReport()
    
    return `
📊 CUSTOMIZER PERFORMANCE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CLAUDE_RULES Compliance: ${report.claudeRulesCompliance ? '✅ PASSING' : '❌ FAILING'}
⚡ Avg Material Switch: ${report.averages.avgMaterialSwitchTime.toFixed(0)}ms (target: <100ms)
🚀 Initial Load: ${this.metrics.initialLoadTime?.toFixed(0) ?? 'N/A'}ms (target: <2s)
🖐️ Avg Gesture Processing: ${report.averages.avgGestureProcessingTime.toFixed(1)}ms (target: <16ms)
🧠 Memory Usage: ${this.metrics.memoryUsage.toFixed(1)}MB (target: <50MB)
📊 Frame Rate: ${(this.metrics.responsiveness * 100).toFixed(1)}% (target: >95%)
🚨 Active Alerts: ${this.alerts.length}

💡 TOP RECOMMENDATIONS:
${report.recommendations.slice(0, 3).map((rec, i) => `   ${i + 1}. ${rec}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
  }

  /**
   * Export performance data for analysis
   */
  public exportPerformanceData(): string {
    return JSON.stringify(this.getPerformanceReport(), null, 2)
  }

  /**
   * Clear metrics and start fresh
   */
  public resetMetrics(): void {
    this.metrics = {
      ...this.metrics,
      materialSwitchTimes: [],
      gestureProcessingTimes: [],
      imageLoadTimes: [],
      frameDrops: 0,
      userInteractions: 0,
      errorRate: 0,
      sessionStartTime: performance.now(),
      lastUpdateTime: performance.now()
    }
    
    this.alerts = []
    console.log('🔄 Performance metrics reset')
  }

  /**
   * Cleanup monitoring
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
    
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval)
    }
    
    if (this.perfObserver) {
      this.perfObserver.disconnect()
    }
    
    console.log('🧹 Performance monitoring destroyed')
  }
}

// Export singleton instance
export const customizerPerformance = new CustomizerPerformanceService()
export type { PerformanceMetrics, PerformanceAlert, PerformanceThresholds }