/**
 * Performance Monitoring System for 3D/AR Viewers
 * Real-time tracking of rendering performance and user experience
 */

export interface PerformanceMetrics {
  renderTime: number
  frameRate: number
  memoryUsage: number
  textureLoadTime: number
  interactionLatency: number
  errors: number
  mode: 'sequences' | 'threejs' | 'ar'
  deviceTier: string
  timestamp: number
}

export interface PerformanceThresholds {
  maxRenderTime: number
  minFrameRate: number
  maxMemoryUsage: number
  maxInteractionLatency: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private currentMetrics: Partial<PerformanceMetrics> = {}
  private frameCount = 0
  private lastFrameTime = 0
  private observers: ((metrics: PerformanceMetrics) => void)[] = []
  
  private thresholds: PerformanceThresholds = {
    maxRenderTime: 16.67, // 60fps target
    minFrameRate: 30,
    maxMemoryUsage: 100, // MB
    maxInteractionLatency: 100 // ms
  }

  startTracking(mode: 'sequences' | 'threejs' | 'ar', deviceTier: string) {
    this.currentMetrics = {
      mode,
      deviceTier,
      timestamp: performance.now(),
      errors: 0,
      frameRate: 0,
      renderTime: 0,
      memoryUsage: 0,
      textureLoadTime: 0,
      interactionLatency: 0
    }
    
    this.frameCount = 0
    this.lastFrameTime = performance.now()
    
    // Start frame rate monitoring
    this.monitorFrameRate()
    
    console.log(`📊 Performance tracking started for ${mode} mode`)
  }

  recordRenderTime(time: number) {
    this.currentMetrics.renderTime = time
  }

  recordTextureLoadTime(time: number) {
    this.currentMetrics.textureLoadTime = time
  }

  recordInteractionLatency(time: number) {
    this.currentMetrics.interactionLatency = time
  }

  recordError() {
    this.currentMetrics.errors = (this.currentMetrics.errors || 0) + 1
  }

  private monitorFrameRate() {
    const measureFrame = () => {
      const now = performance.now()
      const frameDelta = now - this.lastFrameTime
      this.lastFrameTime = now
      this.frameCount++
      
      // Calculate FPS every 60 frames
      if (this.frameCount % 60 === 0) {
        const fps = 1000 / frameDelta
        this.currentMetrics.frameRate = Math.round(fps)
      }
      
      // Record render time
      this.recordRenderTime(frameDelta)
      
      // Continue monitoring if tracking is active
      if (this.currentMetrics.timestamp) {
        requestAnimationFrame(measureFrame)
      }
    }
    
    requestAnimationFrame(measureFrame)
  }

  recordMemoryUsage() {
    if ('memory' in (performance as any)) {
      const memory = (performance as any).memory
      this.currentMetrics.memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024))
    }
  }

  stopTracking(): PerformanceMetrics | null {
    if (!this.currentMetrics.timestamp) return null
    
    // Record final memory usage
    this.recordMemoryUsage()
    
    const finalMetrics: PerformanceMetrics = {
      renderTime: this.currentMetrics.renderTime || 0,
      frameRate: this.currentMetrics.frameRate || 0,
      memoryUsage: this.currentMetrics.memoryUsage || 0,
      textureLoadTime: this.currentMetrics.textureLoadTime || 0,
      interactionLatency: this.currentMetrics.interactionLatency || 0,
      errors: this.currentMetrics.errors || 0,
      mode: this.currentMetrics.mode || 'sequences',
      deviceTier: this.currentMetrics.deviceTier || 'unknown',
      timestamp: this.currentMetrics.timestamp
    }
    
    this.metrics.push(finalMetrics)
    this.notifyObservers(finalMetrics)
    
    // Reset current tracking
    this.currentMetrics = {}
    
    console.log('📈 Performance tracking stopped:', finalMetrics)
    return finalMetrics
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null
  }

  analyzePerformance(): {
    status: 'excellent' | 'good' | 'poor' | 'critical'
    issues: string[]
    recommendations: string[]
  } {
    const latest = this.getLatestMetrics()
    if (!latest) return { status: 'good', issues: [], recommendations: [] }
    
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Check render time
    if (latest.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow rendering: ${latest.renderTime.toFixed(1)}ms (target: <${this.thresholds.maxRenderTime}ms)`)
      recommendations.push('Consider reducing model complexity or switching to image sequences')
    }
    
    // Check frame rate
    if (latest.frameRate < this.thresholds.minFrameRate) {
      issues.push(`Low frame rate: ${latest.frameRate}fps (target: >${this.thresholds.minFrameRate}fps)`)
      recommendations.push('Enable performance mode or switch to a lower quality setting')
    }
    
    // Check memory usage
    if (latest.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${latest.memoryUsage}MB (target: <${this.thresholds.maxMemoryUsage}MB)`)
      recommendations.push('Consider texture compression or model optimization')
    }
    
    // Check interaction latency
    if (latest.interactionLatency > this.thresholds.maxInteractionLatency) {
      issues.push(`Slow interactions: ${latest.interactionLatency}ms (target: <${this.thresholds.maxInteractionLatency}ms)`)
      recommendations.push('Optimize event handlers or enable hardware acceleration')
    }
    
    // Check errors
    if (latest.errors > 0) {
      issues.push(`${latest.errors} error(s) occurred during session`)
      recommendations.push('Check console for detailed error information')
    }
    
    // Determine overall status
    let status: 'excellent' | 'good' | 'poor' | 'critical'
    if (issues.length === 0) status = 'excellent'
    else if (issues.length <= 2) status = 'good'
    else if (issues.length <= 4) status = 'poor'
    else status = 'critical'
    
    return { status, issues, recommendations }
  }

  addObserver(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback)
  }

  removeObserver(callback: (metrics: PerformanceMetrics) => void) {
    this.observers = this.observers.filter(obs => obs !== callback)
  }

  private notifyObservers(metrics: PerformanceMetrics) {
    this.observers.forEach(callback => {
      try {
        callback(metrics)
      } catch (error) {
        console.error('Performance observer error:', error)
      }
    })
  }

  clearMetrics() {
    this.metrics = []
    this.currentMetrics = {}
  }

  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      summary: this.analyzePerformance()
    }, null, 2)
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Simple performance tracking helpers
export function trackModeSwitch(mode: 'sequences' | 'threejs' | 'ar', deviceTier: string) {
  performanceMonitor.startTracking(mode, deviceTier)
}

export function getPerformanceReport() {
  return performanceMonitor.analyzePerformance()
}