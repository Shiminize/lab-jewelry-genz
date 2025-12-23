/**
 * Token Bucket Rate Limiter
 * In-memory rate limiting for admin routes
 */

interface TokenBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, TokenBucket>()

export interface RateLimitConfig {
  maxTokens: number      // Maximum tokens in bucket
  refillRate: number     // Tokens added per second
  cost: number           // Cost per request
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 100,
  refillRate: 10,   // 10 tokens per second = 600 requests per minute
  cost: 1,
}

/**
 * Check if request is rate limited
 * 
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  
  let bucket = buckets.get(identifier)
  
  if (!bucket) {
    bucket = {
      tokens: cfg.maxTokens,
      lastRefill: now,
    }
    buckets.set(identifier, bucket)
  }
  
  // Refill tokens based on time elapsed
  const elapsed = (now - bucket.lastRefill) / 1000 // seconds
  const tokensToAdd = elapsed * cfg.refillRate
  bucket.tokens = Math.min(cfg.maxTokens, bucket.tokens + tokensToAdd)
  bucket.lastRefill = now
  
  // Check if enough tokens
  if (bucket.tokens >= cfg.cost) {
    bucket.tokens -= cfg.cost
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetIn: Math.ceil((cfg.maxTokens - bucket.tokens) / cfg.refillRate),
    }
  }
  
  return {
    allowed: false,
    remaining: 0,
    resetIn: Math.ceil((cfg.cost - bucket.tokens) / cfg.refillRate),
  }
}

/**
 * Clean up old buckets (call periodically to prevent memory leak)
 */
export function cleanupRateLimiter() {
  const now = Date.now()
  const threshold = 10 * 60 * 1000 // 10 minutes
  
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (now - bucket.lastRefill > threshold) {
      buckets.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiter, 5 * 60 * 1000)
}

