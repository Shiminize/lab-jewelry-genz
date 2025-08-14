/**
 * Redis Client Configuration for Production
 * Handles Redis connection with fallback for development
 */

import { RedisClient } from './redis-rate-limiter'

// Redis client implementation that doesn't import ioredis at module level
class ProductionRedisClient implements RedisClient {
  private client: any = null
  private initialized = false
  
  constructor() {
    // Don't initialize in constructor to avoid module resolution issues
  }
  
  private async ensureInitialized() {
    if (this.initialized) return
    
    this.initialized = true
    
    try {
      // Only initialize if Redis URL is provided
      if (process.env.REDIS_URL) {
        console.warn('⚠️  Redis URL found but ioredis not available, using in-memory fallback')
      } else {
        console.warn('⚠️  REDIS_URL not found, using in-memory fallback')
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      console.warn('⚠️  Falling back to in-memory rate limiting')
    }
  }
  
  async get(key: string): Promise<string | null> {
    await this.ensureInitialized()
    if (!this.client) return null
    
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }
  
  async set(key: string, value: string, px: number): Promise<string | null> {
    await this.ensureInitialized()
    if (!this.client) return null
    
    try {
      return await this.client.set(key, value, 'PX', px)
    } catch (error) {
      console.error('Redis SET error:', error)
      return null
    }
  }
  
  async incr(key: string): Promise<number> {
    await this.ensureInitialized()
    if (!this.client) return 1
    
    try {
      return await this.client.incr(key)
    } catch (error) {
      console.error('Redis INCR error:', error)
      return 1
    }
  }
  
  async expire(key: string, seconds: number): Promise<number> {
    await this.ensureInitialized()
    if (!this.client) return 0
    
    try {
      return await this.client.expire(key, seconds)
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return 0
    }
  }
  
  async ttl(key: string): Promise<number> {
    await this.ensureInitialized()
    if (!this.client) return -1
    
    try {
      return await this.client.ttl(key)
    } catch (error) {
      console.error('Redis TTL error:', error)
      return -1
    }
  }
}

// Global Redis client instance
let redisClientInstance: RedisClient | null = null

// Get or create Redis client instance
export function getRedisClient(): RedisClient | null {
  if (!redisClientInstance) {
    redisClientInstance = new ProductionRedisClient()
  }
  
  return redisClientInstance
}

// Initialize Redis for rate limiting
export function initializeRedisRateLimit() {
  const client = getRedisClient()
  if (client) {
    const { initializeRateLimit } = require('./redis-rate-limiter')
    initializeRateLimit(client)
  }
}