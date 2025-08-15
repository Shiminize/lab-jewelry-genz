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
    this.monitoringInterval = setInterval(async () => {
      await this.updateMetrics()
      await this.performOptimizations()
    }, this.config.monitoring.metricsInterval)
  }

  private scheduleCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup()
    }, this.config.generation.cleanupIntervalMinutes * 60 * 1000)
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
      const outputDir = this.config.files.outputDirectory
      const stats = await fs.stat(outputDir)
      
      // Simplified disk calculation - in production use native disk space check
      this.metrics.disk = {
        used: 1000, // MB
        free: 5000, // MB
        total: 6000, // MB
        percentage: 16.7,
        isOverLimit: false
      }
    } catch (error) {
      console.warn('Could not update disk metrics:', error)
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
    if (percentage < 60) return 'low'
    if (percentage < 75) return 'medium'
    if (percentage < 90) return 'high'
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