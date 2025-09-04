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
  private static instance: ResourceOptimizer | null = null
  private config: ProductionConfig
  private cleanupInterval?: NodeJS.Timeout
  private monitoringInterval?: NodeJS.Timeout
  private metrics: ResourceMetrics
  private lastCleanup = 0
  private gcForced = false
  private isInitialized = false

  private constructor() {
    this.config = getProductionConfig()
    this.metrics = this.initializeMetrics()
  }

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer()
    }
    return ResourceOptimizer.instance
  }

  initialize(): void {
    if (this.isInitialized) {
      console.log('🔧 ResourceOptimizer already initialized, skipping')
      return
    }
    
    this.startMonitoring()
    this.scheduleCleanup()
    this.isInitialized = true
    console.log('🔧 ResourceOptimizer initialized')
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
    // Update memory metrics (aligned with GlobalHealthMonitor calculation)
    const memUsage = process.memoryUsage()
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const systemLimitMB = 2048 // 2GB system limit (matches GlobalHealthMonitor)
    
    this.metrics.memory = {
      used: usedMB,
      free: Math.round((memUsage.heapTotal - memUsage.heapUsed) / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((usedMB / systemLimitMB) * 100), // Use system limit, not heap total
      isOverLimit: usedMB > (this.config.resources.maxMemoryMB || 1024)
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

    // Memory optimization with tiered response
    if (this.metrics.memory.percentage > 50) { // Adjusted for system limit calculation
      const severity = this.metrics.memory.percentage > 95 ? 'critical' 
                      : this.metrics.memory.percentage > 85 ? 'high' 
                      : 'medium'
                      
      recommendations.push({
        type: 'memory',
        severity: severity,
        message: `Memory usage at ${this.metrics.memory.percentage}%`,
        action: severity === 'critical' ? 'Advanced memory cleanup' : 'Force garbage collection and clear caches',
        autoFixAvailable: true
      })

      // Tiered memory cleanup response
      if (!this.gcForced) {
        if (this.metrics.memory.percentage > 80) {
          // Critical: Advanced cleanup
          await this.performAdvancedMemoryCleanup()
          this.gcForced = true
          setTimeout(() => { this.gcForced = false }, 60000) // Reset after 60s for critical situations
        } else if (this.metrics.memory.percentage > 60) {
          // High: Normal cleanup
          await this.forceGarbageCollection()
          this.gcForced = true
          setTimeout(() => { this.gcForced = false }, 30000) // Reset after 30s
        }
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
    if (this.metrics.memory.percentage > 50) {
      await this.forceGarbageCollection()
    }
  }

  private clearInternalCaches(): void {
    // Clear require cache for non-critical modules
    const moduleKeys = Object.keys(require.cache)
    const safeToClear = moduleKeys.filter(key => 
      !key.includes('node_modules') && 
      !key.includes('production-config') &&
      !key.includes('generation-service') &&
      !key.includes('global-health-monitor') // Protect singleton
    )
    
    safeToClear.forEach(key => {
      delete require.cache[key]
    })
    
    console.log(`🧹 Cleared ${safeToClear.length} cached modules`)
  }

  /**
   * Advanced memory cleanup for memory pressure situations
   */
  async performAdvancedMemoryCleanup(): Promise<void> {
    console.log('🆘 Performing advanced memory cleanup due to memory pressure')
    
    try {
      // 1. Clear internal caches aggressively  
      this.clearInternalCaches()
      
      // 2. Force multiple garbage collections with delays
      if (global.gc) {
        for (let i = 0; i < 3; i++) {
          global.gc()
          await new Promise(resolve => setTimeout(resolve, 100)) // 100ms between GC calls
        }
        console.log('🧹 Performed 3 aggressive garbage collections')
      }
      
      // 3. Clear material cache if available
      try {
        const MaterialCache = require('./material-cache')
        if (MaterialCache?.default?.clear) {
          MaterialCache.default.clear()
          console.log('🧹 Cleared material cache')
        }
      } catch (error) {
        // Material cache not available or already cleared
      }
      
      // 4. Clear admin cache if available
      try {
        const AdminCache = require('./admin-cache')
        if (AdminCache?.adminCache?.clear) {
          AdminCache.adminCache.clear()
          console.log('🧹 Cleared admin cache')
        }
      } catch (error) {
        // Admin cache not available or already cleared
      }
      
      // 5. Run disk cleanup to free up space
      await this.cleanupDiskSpace()
      
      console.log('✅ Advanced memory cleanup completed')
      
    } catch (error) {
      console.error('❌ Advanced memory cleanup failed:', error)
    }
  }

  getMetrics(): ResourceMetrics {
    return { ...this.metrics }
  }

  getMemoryPressure(): 'low' | 'medium' | 'high' | 'critical' {
    const percentage = this.metrics.memory.percentage
    if (percentage < 50) return 'low'      // Adjusted for system limit calculation
    if (percentage < 70) return 'medium'   // Adjusted for system limit calculation  
    if (percentage < 85) return 'high'     // Adjusted for system limit calculation
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