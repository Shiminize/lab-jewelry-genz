/**
 * In-memory idempotency cache with TTL
 * TODO: Replace with Redis for production multi-instance deployments
 */

interface IdempotencyRecord {
  key: string;
  sku: string;
  response: any;
  expiresAt: number;
}

class IdempotencyCache {
  private cache = new Map<string, IdempotencyRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 30_000);
  }

  private getCacheKey(idempotencyKey: string, sku: string): string {
    return `${idempotencyKey}:${sku}`;
  }

  get(idempotencyKey: string, sku: string): any | null {
    const cacheKey = this.getCacheKey(idempotencyKey, sku);
    const record = this.cache.get(cacheKey);

    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    console.log(JSON.stringify({
      type: 'idempotency',
      action: 'replay',
      key: idempotencyKey,
      sku,
      message: 'Returning cached response for duplicate request',
    }));

    return record.response;
  }

  set(idempotencyKey: string, sku: string, response: any, ttlSeconds = 60): void {
    const cacheKey = this.getCacheKey(idempotencyKey, sku);
    const expiresAt = Date.now() + (ttlSeconds * 1000);

    this.cache.set(cacheKey, {
      key: idempotencyKey,
      sku,
      response,
      expiresAt,
    });

    console.log(JSON.stringify({
      type: 'idempotency',
      action: 'cache',
      key: idempotencyKey,
      sku,
      ttlSeconds,
      message: 'Cached response for idempotency',
    }));
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((record, key) => {
      if (now > record.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(JSON.stringify({
        type: 'idempotency',
        action: 'cleanup',
        cleaned,
        remaining: this.cache.size,
      }));
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).map(r => ({
        key: r.key,
        sku: r.sku,
        expiresIn: Math.max(0, r.expiresAt - Date.now()),
      })),
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Singleton instance
export const idempotencyCache = new IdempotencyCache();

// Log warning about in-memory limitation on startup
console.warn(
  '⚠️  Using in-memory idempotency cache. ' +
  'For production multi-instance deployments, migrate to Redis. ' +
  'See: https://redis.io/docs/manual/patterns/distributed-locks/'
);

