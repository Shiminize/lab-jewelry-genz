/**
 * Global Health Monitor Singleton
 * CLAUDE_RULES Compliant - Single source of truth for system health monitoring
 * Replaces 19+ individual health check intervals with one coordinated system
 */

interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical'
  memory: {
    usage: number
    limit: number
    isOverLimit: boolean
  }
  database: {
    connections: number
    maxConnections: number
    isHealthy: boolean
  }
  services: {
    [serviceName: string]: {
      status: 'active' | 'inactive' | 'error'
      lastCheck: Date
    }
  }
}

interface ServiceHealthCallback {
  serviceName: string
  callback: () => Promise<any>
  interval: number
  lastRun: number
}

// Declare global type for Node.js global object
declare global {
  var __globalHealthMonitor: GlobalHealthMonitor | undefined
}

class GlobalHealthMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null
  private gcInterval: NodeJS.Timeout | null = null
  private serviceCallbacks: Map<string, ServiceHealthCallback> = new Map()
  private isRunning = false
  private lastHealthCheck: HealthCheckResult | null = null

  // CLAUDE_RULES Performance Targets - Optimized for server stability
  private readonly HEALTH_CHECK_INTERVAL = 60000 // 60 seconds (reduced from 1-3s cascade)
  private readonly GC_INTERVAL = 300000 // 5 minutes (reduced from 1-3s cascade)
  private readonly MAX_DB_CONNECTIONS = 10 // CLAUDE_RULES limit

  private constructor() {

  }

  static getInstance(): GlobalHealthMonitor {
    // Use global object to ensure true singleton across ALL Node.js contexts
    if (!global.__globalHealthMonitor) {
      global.__globalHealthMonitor = new GlobalHealthMonitor()
    }
    return global.__globalHealthMonitor
  }

  /**
   * Register a service for health monitoring
   * Prevents duplicate interval creation
   */
  registerService(serviceName: string, healthCheckCallback: () => Promise<any>, intervalMs: number = 60000): void {
    if (this.serviceCallbacks.has(serviceName)) {
      console.warn(`🏥 Service ${serviceName} already registered, skipping duplicate`)
      return
    }

    // Enforce minimum intervals to prevent server thrashing
    const minInterval = 30000 // 30 seconds minimum
    const actualInterval = Math.max(intervalMs, minInterval)
    
    if (actualInterval !== intervalMs) {
      console.warn(`🏥 Service ${serviceName}: Interval increased from ${intervalMs}ms to ${actualInterval}ms for stability`)
    }

    this.serviceCallbacks.set(serviceName, {
      serviceName,
      callback: healthCheckCallback,
      interval: actualInterval,
      lastRun: 0
    })

  }

  /**
   * Start the global health monitoring system
   * Replaces all individual setInterval calls
   */
  start(): void {
    if (this.isRunning) {

      return
    }

    this.isRunning = true

    // Single coordinated health check interval
    this.healthCheckInterval = setInterval(async () => {
      await this.performGlobalHealthCheck()
    }, this.HEALTH_CHECK_INTERVAL)

    // Single coordinated garbage collection
    this.gcInterval = setInterval(() => {
      if (global.gc) {
        global.gc()

      }
    }, this.GC_INTERVAL)

  }

  /**
   * Stop all health monitoring
   * Clean shutdown for testing/restart
   */
  stop(): void {
    if (!this.isRunning) return

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.gcInterval) {
      clearInterval(this.gcInterval)
      this.gcInterval = null
    }

    this.serviceCallbacks.clear()
    this.isRunning = false

  }

  /**
   * Coordinated health check for all registered services
   * Runs service callbacks based on their individual intervals
   */
  private async performGlobalHealthCheck(): Promise<void> {
    const now = Date.now()
    const results: HealthCheckResult = {
      overall: 'healthy',
      memory: this.getMemoryHealth(),
      database: await this.getDatabaseHealth(),
      services: {}
    }

    // Run service health checks based on their intervals
    for (const [serviceName, serviceCallback] of this.serviceCallbacks) {
      if (now - serviceCallback.lastRun >= serviceCallback.interval) {
        try {
          const serviceResult = await serviceCallback.callback()
          results.services[serviceName] = {
            status: 'active',
            lastCheck: new Date()
          }
          serviceCallback.lastRun = now
        } catch (error) {
          console.error(`🏥 Health check failed for ${serviceName}:`, error)
          results.services[serviceName] = {
            status: 'error',
            lastCheck: new Date()
          }
          results.overall = 'warning'
        }
      }
    }

    // Assess overall health
    if (results.database.connections > this.MAX_DB_CONNECTIONS) {
      results.overall = 'critical'
      console.error(`🏥 CRITICAL: Database connections (${results.database.connections}) exceed limit (${this.MAX_DB_CONNECTIONS})`)
    }

    if (results.memory.isOverLimit) {
      results.overall = 'critical'
      console.error(`🏥 CRITICAL: Memory usage (${results.memory.usage}MB) exceeds limit (${results.memory.limit}MB)`)
    }

    // Log consolidated health status (once per minute instead of 19x)

    this.lastHealthCheck = results
  }

  private getMemoryHealth() {
    const memUsage = process.memoryUsage()
    const usage = Math.round(memUsage.heapUsed / 1024 / 1024)
    const limit = 2048 // 2GB limit

    return {
      usage,
      limit,
      isOverLimit: usage > limit
    }
  }

  private async getDatabaseHealth() {
    try {
      // Import mongoose dynamically to avoid circular dependencies
      const mongoose = await import('mongoose')
      const connections = mongoose.default.connections.length
      
      return {
        connections,
        maxConnections: this.MAX_DB_CONNECTIONS,
        isHealthy: connections <= this.MAX_DB_CONNECTIONS
      }
    } catch (error) {
      console.error('🏥 Database health check failed:', error)
      return {
        connections: 0,
        maxConnections: this.MAX_DB_CONNECTIONS,
        isHealthy: false
      }
    }
  }

  /**
   * Get the last health check result
   */
  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck
  }

  /**
   * Get registered services count
   */
  getRegisteredServicesCount(): number {
    return this.serviceCallbacks.size
  }

  /**
   * Reset singleton (for testing)
   */
  static reset(): void {
    if (global.__globalHealthMonitor) {
      global.__globalHealthMonitor.stop()
      global.__globalHealthMonitor = undefined
    }
  }
}

export default GlobalHealthMonitor