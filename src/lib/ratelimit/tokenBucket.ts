/**
 * Token bucket rate limiter (in-memory)
 * TODO: Replace with Redis for production multi-instance deployments
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;

    // Cleanup stale buckets every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  private refillTokens(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * this.refillRate;

    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  check(key: string): { allowed: boolean; retryAfter?: number } {
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, bucket);
    }

    this.refillTokens(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true };
    } else {
      // Calculate retry-after in seconds
      const tokensNeeded = 1 - bucket.tokens;
      const retryAfter = Math.ceil(tokensNeeded / this.refillRate);

      console.log(JSON.stringify({
        type: 'ratelimit',
        action: 'deny',
        key,
        tokens: bucket.tokens.toFixed(2),
        retryAfter,
      }));

      return { allowed: false, retryAfter };
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 300_000; // 5 minutes
    let cleaned = 0;

    this.buckets.forEach((bucket, key) => {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(JSON.stringify({
        type: 'ratelimit',
        action: 'cleanup',
        cleaned,
        remaining: this.buckets.size,
      }));
    }
  }

  getStats() {
    return {
      bucketsActive: this.buckets.size,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.buckets.clear();
  }
}

// Admin routes: 5 requests per second
export const adminRateLimiter = new RateLimiter(100, 20);

// Log warning about in-memory limitation on startup
console.warn(
  '⚠️  Using in-memory rate limiter. ' +
  'For production multi-instance deployments, migrate to Redis. ' +
  'See: https://redis.io/docs/manual/patterns/rate-limiting/'
);

