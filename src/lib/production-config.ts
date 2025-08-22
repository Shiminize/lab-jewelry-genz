/**
 * Production Configuration System
 * Environment-based settings with validation and fallbacks
 */

export interface ProductionConfig {
  // Generation settings
  generation: {
    maxConcurrentJobs: number
    maxQueueSize: number
    timeoutMinutes: number
    retryAttempts: number
    retryDelaySeconds: number
    cleanupIntervalMinutes: number
  }
  
  // Resource limits
  resources: {
    maxMemoryMB: number
    maxDiskSpaceGB: number
    maxFileUploadMB: number
    maxProcesses: number
    puppeteerTimeout: number
  }
  
  // Monitoring
  monitoring: {
    enableMetrics: boolean
    enableLogging: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
    metricsInterval: number
    healthCheckInterval: number
  }
  
  // File management
  files: {
    tempDirectory: string
    outputDirectory: string
    modelsDirectory: string
    retentionDays: number
    enableCompression: boolean
    enableCaching: boolean
  }
  
  // WebSocket settings
  websocket: {
    maxConnections: number
    pingTimeout: number
    pingInterval: number
    enableCompression: boolean
  }
  
  // Security
  security: {
    enableRateLimit: boolean
    maxRequestsPerMinute: number
    enableCORS: boolean
    allowedOrigins: string[]
    maxUploadSize: number
  }
}

// Default production configuration
const DEFAULT_PRODUCTION_CONFIG: ProductionConfig = {
  generation: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '50'),
    timeoutMinutes: parseInt(process.env.GENERATION_TIMEOUT || '30'),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    retryDelaySeconds: parseInt(process.env.RETRY_DELAY || '10'),
    cleanupIntervalMinutes: parseInt(process.env.CLEANUP_INTERVAL || '60')
  },
  
  resources: {
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '2048'),
    maxDiskSpaceGB: parseInt(process.env.MAX_DISK_SPACE_GB || '10'),
    maxFileUploadMB: parseInt(process.env.MAX_FILE_UPLOAD_MB || '100'),
    maxProcesses: parseInt(process.env.MAX_PROCESSES || '10'),
    puppeteerTimeout: parseInt(process.env.PUPPETEER_TIMEOUT || '120000')
  },
  
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableLogging: process.env.ENABLE_LOGGING !== 'false',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000'),
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000')
  },
  
  files: {
    tempDirectory: process.env.TEMP_DIR || '/tmp/3d-generation',
    outputDirectory: process.env.OUTPUT_DIR || './public/images/products/sequences', // Updated to optimized structure
    modelsDirectory: process.env.MODELS_DIR || './public/models',
    retentionDays: parseInt(process.env.RETENTION_DAYS || '30'),
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableCaching: process.env.ENABLE_CACHING !== 'false'
  },
  
  websocket: {
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '1000'),
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
    enableCompression: process.env.WS_ENABLE_COMPRESSION !== 'false'
  },
  
  security: {
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '100'),
    enableCORS: process.env.ENABLE_CORS !== 'false',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '52428800') // 50MB
  }
}

// Development overrides
const DEVELOPMENT_OVERRIDES: Partial<ProductionConfig> = {
  generation: {
    maxConcurrentJobs: 2,
    maxQueueSize: 10,
    timeoutMinutes: 15,
    retryAttempts: 2
  },
  
  monitoring: {
    logLevel: 'debug',
    enableMetrics: true
  },
  
  security: {
    enableRateLimit: false,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001']
  }
}

// Configuration validation
function validateConfig(config: ProductionConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate generation settings
  if (config.generation.maxConcurrentJobs < 1 || config.generation.maxConcurrentJobs > 20) {
    errors.push('maxConcurrentJobs must be between 1 and 20')
  }
  
  if (config.generation.maxQueueSize < 1 || config.generation.maxQueueSize > 1000) {
    errors.push('maxQueueSize must be between 1 and 1000')
  }
  
  if (config.generation.timeoutMinutes < 1 || config.generation.timeoutMinutes > 180) {
    errors.push('timeoutMinutes must be between 1 and 180')
  }
  
  // Validate resource limits
  if (config.resources.maxMemoryMB < 512 || config.resources.maxMemoryMB > 16384) {
    errors.push('maxMemoryMB must be between 512 and 16384')
  }
  
  if (config.resources.maxFileUploadMB < 1 || config.resources.maxFileUploadMB > 500) {
    errors.push('maxFileUploadMB must be between 1 and 500')
  }
  
  // Validate log level
  if (!['error', 'warn', 'info', 'debug'].includes(config.monitoring.logLevel)) {
    errors.push('logLevel must be one of: error, warn, info, debug')
  }
  
  // Validate WebSocket settings
  if (config.websocket.maxConnections < 1 || config.websocket.maxConnections > 10000) {
    errors.push('maxConnections must be between 1 and 10000')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Get merged configuration
export function getProductionConfig(): ProductionConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let config: ProductionConfig = { ...DEFAULT_PRODUCTION_CONFIG }
  
  // Apply development overrides
  if (isDevelopment) {
    config = {
      ...config,
      ...DEVELOPMENT_OVERRIDES,
      generation: { ...config.generation, ...DEVELOPMENT_OVERRIDES.generation },
      monitoring: { ...config.monitoring, ...DEVELOPMENT_OVERRIDES.monitoring },
      security: { ...config.security, ...DEVELOPMENT_OVERRIDES.security }
    }
  }
  
  // Validate configuration
  const validation = validateConfig(config)
  if (!validation.valid) {
    console.error('❌ Configuration validation failed:', validation.errors)
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`)
  }
  
  return config
}

// Resource monitoring utilities
export class ResourceMonitor {
  private config: ProductionConfig
  
  constructor(config: ProductionConfig) {
    this.config = config
  }
  
  async checkMemoryUsage(): Promise<{ usage: number; limit: number; isOverLimit: boolean }> {
    const usage = process.memoryUsage()
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024)
    const limit = this.config.resources.maxMemoryMB
    
    return {
      usage: usedMB,
      limit,
      isOverLimit: usedMB > limit
    }
  }
  
  async checkDiskSpace(): Promise<{ available: number; used: number; isOverLimit: boolean }> {
    // This would need a proper disk space check implementation
    // For now, return mock values
    return {
      available: 5000, // MB
      used: 1000, // MB
      isOverLimit: false
    }
  }
  
  async checkProcessCount(): Promise<{ count: number; limit: number; isOverLimit: boolean }> {
    // This would need a proper process count check
    return {
      count: 5,
      limit: this.config.resources.maxProcesses,
      isOverLimit: false
    }
  }
  
  async getSystemHealth(): Promise<{
    memory: { usage: number; limit: number; isOverLimit: boolean }
    disk: { available: number; used: number; isOverLimit: boolean }
    processes: { count: number; limit: number; isOverLimit: boolean }
    overall: 'healthy' | 'warning' | 'critical'
  }> {
    const memory = await this.checkMemoryUsage()
    const disk = await this.checkDiskSpace()
    const processes = await this.checkProcessCount()
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (memory.isOverLimit || disk.isOverLimit || processes.isOverLimit) {
      overall = 'critical'
    } else if (memory.usage > memory.limit * 0.8 || disk.used > disk.available * 0.8) {
      overall = 'warning'
    }
    
    return { memory, disk, processes, overall }
  }
}

// Production logger
export class ProductionLogger {
  private config: ProductionConfig
  
  constructor(config: ProductionConfig) {
    this.config = config
  }
  
  private shouldLog(level: string): boolean {
    if (!this.config.monitoring.enableLogging) return false
    
    const levels = ['error', 'warn', 'info', 'debug']
    const configLevel = this.config.monitoring.logLevel
    const messageLevel = level
    
    return levels.indexOf(messageLevel) <= levels.indexOf(configLevel)
  }
  
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`
    
    if (data) {
      return `${formatted} ${JSON.stringify(data)}`
    }
    
    return formatted
  }
  
  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data))
    }
  }
  
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data))
    }
  }
  
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data))
    }
  }
  
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data))
    }
  }
}

// Circuit breaker for resilience
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    this.state = 'closed'
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }
  
  getState(): string {
    return this.state
  }
}

export default getProductionConfig