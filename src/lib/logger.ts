/**
 * Structured Logging System
 * Implements CLAUDE_RULES.md compliant logging with request ID correlation
 */

import { NextRequest } from 'next/server'

// Log levels following standard severity levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log entry interface
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  requestId?: string
  userId?: string
  operation?: string
  duration?: number
  statusCode?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

// Generate correlation ID for request tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
}

// Extract request ID from various sources
export function getRequestId(request?: NextRequest, existingId?: string): string {
  if (existingId) return existingId
  
  if (request) {
    // Check if request ID is already in headers
    const headerRequestId = request.headers.get('x-request-id') || 
                           request.headers.get('x-correlation-id')
    if (headerRequestId) return headerRequestId
  }
  
  return generateRequestId()
}

// Structured logger class
class StructuredLogger {
  private logLevel: LogLevel
  
  constructor() {
    // Set log level based on environment
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info'
    this.logLevel = this.parseLogLevel(envLevel)
  }
  
  private parseLogLevel(level: string): LogLevel {
    switch (level) {
      case 'debug': return LogLevel.DEBUG
      case 'info': return LogLevel.INFO
      case 'warn': return LogLevel.WARN
      case 'error': return LogLevel.ERROR
      case 'fatal': return LogLevel.FATAL
      default: return LogLevel.INFO
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const requestedLevelIndex = levels.indexOf(level)
    
    return requestedLevelIndex >= currentLevelIndex
  }
  
  private formatLogEntry(entry: LogEntry): string {
    // In production, output JSON for log aggregation
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(entry)
    }
    
    // In development, use human-readable format
    let formatted = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
    
    if (entry.requestId) {
      formatted += ` (${entry.requestId})`
    }
    
    if (entry.userId) {
      formatted += ` [user:${entry.userId}]`
    }
    
    if (entry.operation) {
      formatted += ` [${entry.operation}]`
    }
    
    if (entry.duration !== undefined) {
      formatted += ` [${entry.duration}ms]`
    }
    
    if (entry.statusCode) {
      formatted += ` [${entry.statusCode}]`
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += ` ${JSON.stringify(entry.metadata)}`
    }
    
    if (entry.error) {
      formatted += `\n  Error: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack && this.shouldLog(LogLevel.DEBUG)) {
        formatted += `\n  Stack: ${entry.error.stack}`
      }
    }
    
    return formatted
  }
  
  private log(level: LogLevel, message: string, context: Partial<LogEntry> = {}): void {
    if (!this.shouldLog(level)) {
      return
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }
    
    // Remove PII from logs per CLAUDE_RULES
    if (entry.metadata) {
      entry.metadata = this.sanitizeMetadata(entry.metadata)
    }
    
    const formatted = this.formatLogEntry(entry)
    
    // Output to appropriate stream
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted)
        break
    }
  }
  
  // Remove PII and sensitive data from log metadata
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'email', 'phone', 'ssn', 'creditcard', 'payment'
    ]
    
    const sanitized = { ...metadata }
    
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase()
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]'
      }
      
      // Recursively sanitize nested objects
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeMetadata(sanitized[key])
      }
    }
    
    return sanitized
  }
  
  // Public logging methods
  debug(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, message, context)
  }
  
  info(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, message, context)
  }
  
  warn(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, message, context)
  }
  
  error(message: string, error?: Error, context?: Partial<LogEntry>): void {
    const errorContext = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {}
    
    this.log(LogLevel.ERROR, message, { ...errorContext, ...context })
  }
  
  fatal(message: string, error?: Error, context?: Partial<LogEntry>): void {
    const errorContext = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {}
    
    this.log(LogLevel.FATAL, message, { ...errorContext, ...context })
  }
}

// Global logger instance
export const logger = new StructuredLogger()

// API-specific logging helpers
export interface APILogContext {
  requestId: string
  userId?: string
  operation: string
  method: string
  path: string
  userAgent?: string
  ip?: string
  duration?: number
  statusCode?: number
  requestSize?: number
  responseSize?: number
}

// Log API request start
export function logAPIRequest(request: NextRequest, operation: string, userId?: string): APILogContext {
  const requestId = getRequestId(request)
  
  const context: APILogContext = {
    requestId,
    userId,
    operation,
    method: request.method,
    path: new URL(request.url).pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: getClientIP(request)
  }
  
  logger.info(`API request started: ${context.method} ${context.path}`, context)
  
  return context
}

// Log API request completion
export function logAPIResponse(context: APILogContext, statusCode: number, duration: number, error?: Error): void {
  const updatedContext = {
    ...context,
    statusCode,
    duration
  }
  
  if (error) {
    logger.error(`API request failed: ${context.method} ${context.path}`, error, updatedContext)
  } else if (statusCode >= 400) {
    logger.warn(`API request completed with error: ${context.method} ${context.path}`, updatedContext)
  } else {
    logger.info(`API request completed: ${context.method} ${context.path}`, updatedContext)
  }
}

// Log database operations
export function logDatabaseOperation(operation: string, collection: string, duration: number, requestId?: string): void {
  logger.debug(`Database operation: ${operation} on ${collection}`, {
    requestId,
    operation: `db.${collection}.${operation}`,
    duration
  })
}

// Log authentication events
export function logAuthEvent(event: string, userId?: string, requestId?: string, metadata?: Record<string, any>): void {
  logger.info(`Auth event: ${event}`, {
    requestId,
    userId,
    operation: `auth.${event}`,
    metadata
  })
}

// Log rate limiting events
export function logRateLimit(identifier: string, limit: number, requestId?: string): void {
  logger.warn(`Rate limit exceeded for ${identifier}`, {
    requestId,
    operation: 'rate_limit',
    metadata: { identifier, limit }
  })
}

// Log security events
export function logSecurityEvent(event: string, details: string, requestId?: string, metadata?: Record<string, any>): void {
  logger.warn(`Security event: ${event} - ${details}`, {
    requestId,
    operation: `security.${event}`,
    metadata
  })
}

// Helper to get client IP (for logging context)
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP
  
  return 'unknown'
}