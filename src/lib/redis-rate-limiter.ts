/**
 * Redis-based Rate Limiting for Production Scalability
 * Implements CLAUDE_RULES.md compliant rate limiting with distributed storage
 */

import { NextRequest } from 'next/server'

// Rate limit configuration per CLAUDE_RULES.md
export interface RateLimitConfig {
  limit: number     // Max requests
  windowMs: number  // Time window in milliseconds
  keyGenerator?: (request: NextRequest) => string
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// CLAUDE_RULES compliant rate limit configurations
export const RateLimitConfigs = {
  // Auth endpoints: 5/min/IP per CLAUDE_RULES
  AUTH: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // Catalog endpoints: 100/min/IP per CLAUDE_RULES  
  CATALOG: {
    limit: 100,
    windowMs: 60 * 1000,
  },
  // Product detail: 200/min/IP for better UX
  PRODUCT_DETAIL: {
    limit: 200,
    windowMs: 60 * 1000,
  },
  // Cart endpoints: 30/min/user per CLAUDE_RULES
  CART: {
    limit: 30,
    windowMs: 60 * 1000,
  },
  // Orders: 3/min/user per CLAUDE_RULES
  ORDERS: {
    limit: 3,
    windowMs: 60 * 1000,
  },
  // Admin endpoints: 200/min/user per CLAUDE_RULES
  ADMIN: {
    limit: 200,
    windowMs: 60 * 1000,
  }
} as const

// Redis connection interface for dependency injection
export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, px: number): Promise<string | null>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  ttl(key: string): Promise<number>
}

// In-memory fallback for development when Redis is not available
class MemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()
  
  async get(key: string): Promise<string | null> {
    const data = this.store.get(key)
    if (!data) return null
    
    // Clean up expired entries
    if (Date.now() > data.resetTime) {
      this.store.delete(key)
      return null
    }
    
    return JSON.stringify(data)
  }
  
  async set(key: string, value: string, px: number): Promise<string | null> {
    const data = JSON.parse(value)
    this.store.set(key, data)
    return 'OK'
  }
  
  async incr(key: string): Promise<number> {
    const data = this.store.get(key)
    if (!data || Date.now() > data.resetTime) {
      return 1
    }
    data.count++
    return data.count
  }
  
  async expire(key: string, seconds: number): Promise<number> {
    const data = this.store.get(key)
    if (data) {
      data.resetTime = Date.now() + (seconds * 1000)
      return 1
    }
    return 0
  }
  
  async ttl(key: string): Promise<number> {
    const data = this.store.get(key)
    if (!data) return -1
    
    const remaining = Math.ceil((data.resetTime - Date.now()) / 1000)
    return remaining > 0 ? remaining : -1
  }
}

// Redis client instance (to be initialized with actual Redis in production)
let redisClient: RedisClient

// Initialize Redis client or fallback to memory store
export function initializeRateLimit(client?: RedisClient) {
  if (client) {
    redisClient = client
  } else {
    // Use memory store for development/testing
    redisClient = new MemoryRateLimitStore()
    console.warn('⚠️  Using in-memory rate limiting fallback. Use Redis in production.')
  }
}

// Generate rate limit key based on identifier and config
function generateRateLimitKey(identifier: string, configName: string): string {
  return `ratelimit:${configName}:${identifier}`
}

// Extract client IP from request headers
export function getClientIP(request: NextRequest): string {
  // Check various header possibilities for client IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP
  
  // Fallback to a default for development
  return request.ip || '127.0.0.1'
}

// Core rate limiting function with Redis backend
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  configName: string = 'default'
): Promise<RateLimitResult> {
  // Initialize with memory store if Redis not available
  if (!redisClient) {
    initializeRateLimit()
  }
  
  const key = generateRateLimitKey(identifier, configName)
  const windowSeconds = Math.ceil(config.windowMs / 1000)
  
  try {
    // Get current count
    const currentData = await redisClient.get(key)
    let count = 0
    let resetTime = Math.floor(Date.now() / 1000) + windowSeconds
    
    if (currentData) {
      const parsed = JSON.parse(currentData)
      count = parsed.count || 0
      resetTime = parsed.resetTime || resetTime
    }
    
    // Increment counter
    count++
    
    // Set new data with expiration
    await redisClient.set(
      key, 
      JSON.stringify({ count, resetTime }), 
      config.windowMs
    )
    
    // Set TTL if it doesn't exist
    const ttl = await redisClient.ttl(key)
    if (ttl === -1) {
      await redisClient.expire(key, windowSeconds)
    }
    
    const remaining = Math.max(0, config.limit - count)
    const allowed = count <= config.limit
    
    const result: RateLimitResult = {
      allowed,
      limit: config.limit,
      remaining,
      reset: resetTime
    }
    
    // Add retry-after header for rate limited requests
    if (!allowed) {
      result.retryAfter = Math.max(1, resetTime - Math.floor(Date.now() / 1000))
    }
    
    return result
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.floor(Date.now() / 1000) + windowSeconds
    }
  }
}

// Helper function for user-based rate limiting
export async function checkUserRateLimit(
  userId: string,
  config: RateLimitConfig,
  configName: string = 'user'
): Promise<RateLimitResult> {
  return checkRateLimit(`user:${userId}`, config, configName)
}

// Helper function for IP-based rate limiting
export async function checkIPRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  configName: string = 'ip'
): Promise<RateLimitResult> {
  const clientIP = getClientIP(request)
  return checkRateLimit(`ip:${clientIP}`, config, configName)
}

// Middleware to add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  rateLimitResult: RateLimitResult
): Response {
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
  
  if (rateLimitResult.retryAfter) {
    response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
  }
  
  return response
}

// Generate rate limit error response per CLAUDE_RULES
export function createRateLimitErrorResponse(
  rateLimitResult: RateLimitResult,
  requestId: string = crypto.randomUUID()
): Response {
  const errorResponse = {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: []
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId
    }
  }
  
  const response = new Response(JSON.stringify(errorResponse), {
    status: 429,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  return addRateLimitHeaders(response, rateLimitResult)
}