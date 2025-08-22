/**
 * Resource Optimizer
 * Advanced memory management and performance optimization
 */

import { getProductionConfig, ProductionConfig } from './production-config'
import { promises as fs } from 'fs'
import path from 'path'

export interface MemoryUsage {
  used: number
  free: number
  total: number
  percentage: number
  isOverLimit: boolean
}

export interface DiskUsage {
  used: number
  free: number
  total: number
  percentage: number
  isOverLimit: boolean
}

export interface ResourceMetrics {
  memory: MemoryUsage
  disk: DiskUsage
  processes: {
    count: number
    limit: number
    isOverLimit: boolean
  }
  cpu: {
    usage: number
    load: number[]
  }
  network: {
    inbound: number
    outbound: number
  }
  generation: {
    activeJobs: number
    queuedJobs: number
    completedJobs: number
    failedJobs: number
  }
}

export interface OptimizationRecommendation {
  type: 'memory' | 'disk' | 'process' | 'generation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action: string
  autoFixAvailable: boolean
}

export class ResourceOptimizer {
  private config: ProductionConfig
  private cleanupInterval?: NodeJS.Timeout
  private monitoringInterval?: NodeJS.Timeout
  private metrics: ResourceMetrics
  private lastCleanup = 0
  private gcForced = false

  constructor() {
    this.config = getProductionConfig()
    this.metrics = this.initializeMetrics()
    this.startMonitoring()
    this.scheduleCleanup()
  }

  private initializeMetrics(): ResourceMetrics {
    return {
      memory: { used: 0, free: 0, total: 0, percentage: 0, isOverLimit: false },
      disk: { used: 0, free: 0, total: 0, percentage: 0, isOverLimit: false },
      processes: { count: 0, limit: this.config.resources.maxProcesses, isOverLimit: false },
      cpu: { usage: 0, load: [] },
      network: { inbound: 0, outbound: 0 },
      generation: { activeJobs: 0, queuedJobs: 0, completedJobs: 0, failedJobs: 0 }
    }
  }

  private startMonitoring(): void {
    // CRITICAL FIX: Use GlobalHealthMonitor instead of creating duplicate intervals
    const GlobalHealthMonitor = require('./global-health-monitor').default
    const healthMonitor = GlobalHealthMonitor.getInstance()
    
    // Register resource monitoring service with the global monitor
    healthMonitor.registerService('resource-optimizer', async () => {
      try {
        await this.updateMetrics()
        await this.performOptimizations()
        return { status: 'resource-optimization-completed', metrics: this.currentMetrics }
      } catch (error) {
        console.error('Resource monitoring failed:', error)
        throw error
      }
    }, this.config.monitoring.metricsInterval)
    
    console.log('🔧 ResourceOptimizer: Registered with GlobalHealthMonitor')
  }

  private scheduleCleanup(): void {
    // CRITICAL FIX: Use GlobalHealthMonitor instead of creating duplicate intervals
    const GlobalHealthMonitor = require('./global-health-monitor').default
    const healthMonitor = GlobalHealthMonitor.getInstance()
    
    // Register cleanup service with the global monitor
    healthMonitor.registerService('resource-cleanup', async () => {
      try {
        await this.performCleanup()
        return { status: 'resource-cleanup-completed' }
      } catch (error) {
        console.error('Resource cleanup failed:', error)
        throw error
      }
    }, this.config.generation.cleanupIntervalMinutes * 60 * 1000)
    
    console.log('🧹 ResourceOptimizer: Cleanup registered with GlobalHealthMonitor')
  }

  async updateMetrics(): Promise<ResourceMetrics> {
    // Update memory metrics
    const memUsage = process.memoryUsage()
    this.metrics.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      free: Math.round((memUsage.heapTotal - memUsage.heapUsed) / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      isOverLimit: memUsage.heapUsed > (this.config.resources.maxMemoryMB * 1024 * 1024)
    }

    // Update CPU metrics
    this.metrics.cpu = {
      usage: process.cpuUsage().user / 1000000, // Convert to seconds
      load: process.hrtime()
    }

    // Update disk usage (mock for now - would need native implementation)
    await this.updateDiskMetrics()

    // Update process count
    this.metrics.processes.count = Object.keys(process.env).length // Simplified
    this.metrics.processes.isOverLimit = this.metrics.processes.count > this.config.resources.maxProcesses

    return this.metrics
  }

  private async updateDiskMetrics(): Promise<void> {
    try {
      // Use optimized structure: /sequences instead of /3d-sequences  
      let outputDir = this.config.files.outputDirectory
      
      // Ensure we're using the new optimized path structure
      if (outputDir.includes('/3d-sequences')) {
        outputDir = outputDir.replace('/3d-sequences', '/sequences')
      } else if (!outputDir.includes('/sequences')) {
        // Default to optimized path if not configured
        outputDir = './public/images/products/sequences'
      }
      
      const stats = await fs.stat(outputDir).catch(() => null)
      
      if (stats) {
        // Directory exists - calculate actual usage
        try {
          const files = await fs.readdir(outputDir, { recursive: true }).catch(() => [])
          let totalSize = 0
          
          // Calculate actual disk usage (limit iterations for performance)
          for (const file of files.slice(0, 100)) {
            try {
              const filePath = path.join(outputDir, file.toString())
              const fileStat = await fs.stat(filePath)
              if (fileStat.isFile()) {
                totalSize += fileStat.size
              }
            } catch {
              // Skip files that can't be accessed
            }
          }
          
          const usedMB = Math.round(totalSize / 1024 / 1024)
          const totalSpaceMB = 6000 // 6GB available space
          const percentage = Math.min(100, Math.round((usedMB / totalSpaceMB) * 100))
          
          this.metrics.disk = {
            used: usedMB,
            free: Math.max(0, totalSpaceMB - usedMB),
            total: totalSpaceMB,
            percentage: percentage,
            isOverLimit: percentage > 85
          }
        } catch {
          // Fallback to safe defaults if calculation fails
          this.metrics.disk = {
            used: 100, // MB - conservative estimate
            free: 5900, // MB 
            total: 6000, // MB
            percentage: 1.7,
            isOverLimit: false
          }
        }
      } else {
        // Directory doesn't exist yet (new optimized structure)
        this.metrics.disk = {
          used: 0, // MB - no data yet
          free: 6000, // MB - available space
          total: 6000, // MB
          percentage: 0,
          isOverLimit: false
        }
      }
    } catch (error) {
      // Handle any file system errors gracefully
      this.metrics.disk = {
        used: 0,
        free: 6000,
        total: 6000,
        percentage: 0,
        isOverLimit: false
      }
    }
  }

  async performOptimizations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // Memory optimization
    if (this.metrics.memory.percentage > 80) {
      recommendations.push({
        type: 'memory',
        severity: this.metrics.memory.percentage > 90 ? 'critical' : 'high',
        message: `Memory usage at ${this.metrics.memory.percentage}%`,
        action: 'Force garbage collection and clear caches',
        autoFixAvailable: true
      })

      if (!this.gcForced && this.metrics.memory.percentage > 85) {
        await this.forceGarbageCollection()
        this.gcForced = true
        setTimeout(() => { this.gcForced = false }, 30000) // Reset after 30s
      }
    }

    // Disk space optimization
    if (this.metrics.disk.percentage > 85) {
      recommendations.push({
        type: 'disk',
        severity: this.metrics.disk.percentage > 95 ? 'critical' : 'high',
        message: `Disk usage at ${this.metrics.disk.percentage}%`,
        action: 'Clean up old generation files and temporary data',
        autoFixAvailable: true
      })

      await this.cleanupDiskSpace()
    }

    // Process optimization
    if (this.metrics.processes.isOverLimit) {
      recommendations.push({
        type: 'process',
        severity: 'high',
        message: `Too many active processes: ${this.metrics.processes.count}/${this.metrics.processes.limit}`,
        action: 'Reduce concurrent generation jobs',
        autoFixAvailable: false
      })
    }

    return recommendations
  }

  private async forceGarbageCollection(): Promise<void> {
    if (global.gc) {
      global.gc()
      console.log('🧹 Forced garbage collection completed')
    } else {
      console.warn('Garbage collection not available - run with --expose-gc flag')
    }
  }

  private async cleanupDiskSpace(): Promise<void> {
    const now = Date.now()
    if (now - this.lastCleanup < 300000) return // Don't cleanup more than once per 5 minutes

    try {
      let cleanedSize = 0

      // Clean old generation files
      const outputDir = this.config.files.outputDirectory
      const cutoffTime = now - (this.config.files.retentionDays * 24 * 60 * 60 * 1000)

      const files = await fs.readdir(outputDir, { withFileTypes: true })
      
      for (const file of files) {
        if (file.isDirectory()) {
          const dirPath = path.join(outputDir, file.name)
          const stats = await fs.stat(dirPath)
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.rm(dirPath, { recursive: true, force: true })
            cleanedSize += stats.size || 0
          }
        }
      }

      // Clean temporary files
      const tempDir = this.config.files.tempDirectory
      if (await fs.access(tempDir).then(() => true).catch(() => false)) {
        const tempFiles = await fs.readdir(tempDir)
        for (const file of tempFiles) {
          const filePath = path.join(tempDir, file)
          const stats = await fs.stat(filePath)
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath)
            cleanedSize += stats.size
          }
        }
      }

      this.lastCleanup = now
      console.log(`🧹 Disk cleanup completed: ${Math.round(cleanedSize / 1024 / 1024)}MB freed`)

    } catch (error) {
      console.error('Disk cleanup failed:', error)
    }
  }

  async performCleanup(): Promise<void> {
    await this.cleanupDiskSpace()
    
    // Clear internal caches
    this.clearInternalCaches()
    
    // Force GC if memory usage is high
    if (this.metrics.memory.percentage > 70) {
      await this.forceGarbageCollection()
    }
  }

  private clearInternalCaches(): void {
    // Clear require cache for non-critical modules
    const moduleKeys = Object.keys(require.cache)
    const safeToClear = moduleKeys.filter(key => 
      !key.includes('node_modules') && 
      !key.includes('production-config') &&
      !key.includes('generation-service')
    )
    
    safeToClear.forEach(key => {
      delete require.cache[key]
    })
    
    console.log(`🧹 Cleared ${safeToClear.length} cached modules`)
  }

  getMetrics(): ResourceMetrics {
    return { ...this.metrics }
  }

  getMemoryPressure(): 'low' | 'medium' | 'high' | 'critical' {
    const percentage = this.metrics.memory.percentage
    if (percentage < 70) return 'low'      // Increased from 60% for sequence generation
    if (percentage < 85) return 'medium'   // Increased from 75% for sequence generation  
    if (percentage < 95) return 'high'     // Increased from 90% for sequence generation
    return 'critical'
  }

  getDiskPressure(): 'low' | 'medium' | 'high' | 'critical' {
    const percentage = this.metrics.disk.percentage
    if (percentage < 70) return 'low'
    if (percentage < 85) return 'medium'
    if (percentage < 95) return 'high'
    return 'critical'
  }

  async optimizeForGeneration(): Promise<void> {
    // Pre-generation optimization
    await this.performCleanup()
    
    // Reduce memory pressure
    if (this.getMemoryPressure() !== 'low') {
      await this.forceGarbageCollection()
    }
    
    // Ensure disk space
    if (this.getDiskPressure() !== 'low') {
      await this.cleanupDiskSpace()
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
  }
}

export default ResourceOptimizer