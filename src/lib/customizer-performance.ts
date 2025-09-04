/**
 * Customizer Performance Monitoring
 * Advanced performance tracking and optimization for 3D customizer
 */

interface PerformanceMetrics {
  componentLoad: number
  firstInteraction: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
}

interface CustomizerPerformanceConfig {
  enableTracking: boolean
  reportInterval: number
  maxMemoryThreshold: number
  targetLoadTime: number
}

class CustomizerPerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private config: CustomizerPerformanceConfig
  private observers: PerformanceObserver[] = []
  private startTime: number = performance.now()

  constructor(config: Partial<CustomizerPerformanceConfig> = {}) {
    this.config = {
      enableTracking: true,
      reportInterval: 5000,
      maxMemoryThreshold: 100 * 1024 * 1024, // 100MB
      targetLoadTime: 2000,
      ...config
    }

    if (this.config.enableTracking) {
      this.initializeTracking()
    }
  }

  private initializeTracking() {
    // Track resource loading times
    this.observeResourceTiming()
    
    // Track component render times
    this.observeComponentTiming()
    
    // Monitor memory usage
    this.startMemoryMonitoring()
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        for (const entry of entries) {
          if (entry.name.includes('three') || entry.name.includes('customizer')) {
            console.log(`📊 Resource: ${entry.name} loaded in ${entry.duration.toFixed(2)}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['resource'] })
      this.observers.push(observer)
    }
  }

  private observeComponentTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        for (const entry of entries) {
          if (entry.name.startsWith('customizer-')) {
            const componentName = entry.name.replace('customizer-', '')
            console.log(`📊 Component: ${componentName} rendered in ${entry.duration.toFixed(2)}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure'] })
      this.observers.push(observer)
    }
  }

  private startMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        if (memory) {
          this.metrics.memoryUsage = memory.usedJSHeapSize
          
          if (memory.usedJSHeapSize > this.config.maxMemoryThreshold) {
            console.warn('⚠️ Memory usage high:', (memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB')
          }
        }
      }

      // CRITICAL FIX: Use GlobalHealthMonitor instead of separate interval
      try {
        const GlobalHealthMonitor = require('./global-health-monitor').default
        const healthMonitor = GlobalHealthMonitor.getInstance()
        
        // Register memory checking with global monitor to prevent cascade
        healthMonitor.registerService('customizer-performance-memory', async () => {
          checkMemory()
          return { status: 'customizer-memory-checked' }
        }, Math.max(this.config.reportInterval, 60000)) // Minimum 60 seconds via global monitor
      } catch (error) {
        console.warn('[CustomizerPerformance] Failed to register with GlobalHealthMonitor:', error)
      }
    }
  }

  // Track component loading
  trackComponentLoad(componentName: string, startTime?: number) {
    const loadTime = performance.now() - (startTime || this.startTime)
    this.metrics.componentLoad = loadTime
    
    performance.mark(`customizer-${componentName}-start`)
    
    return () => {
      performance.mark(`customizer-${componentName}-end`)
      performance.measure(
        `customizer-${componentName}`, 
        `customizer-${componentName}-start`, 
        `customizer-${componentName}-end`
      )
    }
  }

  // Track first user interaction
  trackFirstInteraction() {
    if (!this.metrics.firstInteraction) {
      this.metrics.firstInteraction = performance.now() - this.startTime
      console.log('🎯 First interaction:', this.metrics.firstInteraction.toFixed(2), 'ms')
    }
  }

  // Track render performance
  trackRender(renderFunction: () => void) {
    const start = performance.now()
    renderFunction()
    const renderTime = performance.now() - start
    
    this.metrics.renderTime = renderTime
    
    if (renderTime > 16.67) { // More than one frame at 60fps
      console.warn('⚠️ Slow render detected:', renderTime.toFixed(2), 'ms')
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return {
      componentLoad: this.metrics.componentLoad || 0,
      firstInteraction: this.metrics.firstInteraction || 0,
      renderTime: this.metrics.renderTime || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      bundleSize: this.getBundleSize()
    }
  }

  private getBundleSize(): number {
    if ('PerformanceNavigationTiming' in window) {
      const entries = performance.getEntriesByType('navigation')
      if (entries.length > 0) {
        const entry = entries[0] as PerformanceNavigationTiming
        return entry.transferSize || 0
      }
    }
    return 0
  }

  // Performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.getMetrics()

    if (metrics.componentLoad > this.config.targetLoadTime) {
      recommendations.push('Consider lazy loading heavy components')
    }

    if (metrics.memoryUsage > this.config.maxMemoryThreshold) {
      recommendations.push('Memory usage is high - consider component cleanup')
    }

    if (metrics.renderTime > 16.67) {
      recommendations.push('Render time is slow - optimize component tree')
    }

    if (metrics.bundleSize > 1024 * 1024) { // 1MB
      recommendations.push('Bundle size is large - implement code splitting')
    }

    return recommendations
  }

  // Generate performance report
  generateReport(): object {
    const metrics = this.getMetrics()
    const recommendations = this.getRecommendations()
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations,
      score: this.calculatePerformanceScore(metrics),
      status: metrics.componentLoad < this.config.targetLoadTime ? 'good' : 'needs-improvement'
    }

    console.log('📊 Performance Report:', report)
    return report
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100
    
    // Penalize slow loading
    if (metrics.componentLoad > this.config.targetLoadTime) {
      score -= Math.min(30, (metrics.componentLoad - this.config.targetLoadTime) / 100)
    }
    
    // Penalize high memory usage
    if (metrics.memoryUsage > this.config.maxMemoryThreshold) {
      score -= 20
    }
    
    // Penalize slow renders
    if (metrics.renderTime > 16.67) {
      score -= 15
    }
    
    // Penalize large bundles
    if (metrics.bundleSize > 1024 * 1024) {
      score -= 15
    }

    return Math.max(0, Math.round(score))
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Export singleton instance
export const customizerPerformance = new CustomizerPerformanceMonitor({
  enableTracking: process.env.NODE_ENV === 'development'
})

// React hook for performance tracking
export function useCustomizerPerformance(componentName: string) {
  const trackLoad = () => customizerPerformance.trackComponentLoad(componentName)
  const trackInteraction = () => customizerPerformance.trackFirstInteraction()
  const getMetrics = () => customizerPerformance.getMetrics()
  const generateReport = () => customizerPerformance.generateReport()

  return {
    trackLoad,
    trackInteraction,
    getMetrics,
    generateReport
  }
}