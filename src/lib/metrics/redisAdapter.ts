/**
 * Redis Metrics Adapter
 * 
 * Stores latency samples in Redis for persistence across restarts
 * Falls back to no-op if REDIS_URL not set for portability
 */

import { createClient } from 'redis';

interface MetricSample {
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  latencyMs: number;
  cache?: 'HIT' | 'MISS';
  params?: Record<string, string>;
}

class RedisMetricsAdapter {
  private client: any = null;
  private connected = false;
  private readonly keyPrefix = 'concierge:metrics';
  private readonly maxSamplesPerDay = 10000; // Cap per day

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log(JSON.stringify({
        type: 'metrics-redis',
        message: 'REDIS_URL not set. Metrics will not persist across restarts.',
        fallback: 'in-memory-only'
      }));
      return;
    }

    try {
      this.client = createClient({ url: redisUrl });
      
      this.client.on('error', (err: Error) => {
        console.error(JSON.stringify({
          type: 'metrics-redis',
          error: 'Redis connection error',
          message: err.message,
          fallback: 'in-memory-only'
        }));
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log(JSON.stringify({
          type: 'metrics-redis',
          message: 'Connected to Redis for metrics persistence'
        }));
        this.connected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error(JSON.stringify({
        type: 'metrics-redis',
        error: 'Failed to initialize Redis',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'in-memory-only'
      }));
    }
  }

  /**
   * Store a metric sample in Redis
   * Key format: concierge:metrics:YYYY-MM-DD
   */
  async storeSample(sample: MetricSample): Promise<void> {
    if (!this.connected || !this.client) {
      return; // Silent no-op for portability
    }

    try {
      const dateKey = new Date(sample.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `${this.keyPrefix}:${dateKey}`;
      
      // Store as JSON string in a Redis list
      const sampleJson = JSON.stringify(sample);
      
      // Use pipeline for atomic operations
      const pipeline = this.client.multi();
      pipeline.lPush(key, sampleJson);
      pipeline.lTrim(key, 0, this.maxSamplesPerDay - 1); // Keep only latest N samples
      pipeline.expire(key, 7 * 24 * 60 * 60); // Expire after 7 days
      
      await pipeline.exec();
    } catch (error) {
      // Log error but don't throw - maintain service availability
      console.error(JSON.stringify({
        type: 'metrics-redis',
        error: 'Failed to store sample',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  /**
   * Retrieve samples for the last N days
   */
  async getSamples(days: number = 1): Promise<MetricSample[]> {
    if (!this.connected || !this.client) {
      return [];
    }

    try {
      const samples: MetricSample[] = [];
      const now = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const key = `${this.keyPrefix}:${dateKey}`;
        
        const rawSamples = await this.client.lRange(key, 0, -1);
        
        for (const rawSample of rawSamples) {
          try {
            const sample = JSON.parse(rawSample);
            samples.push(sample);
          } catch (parseError) {
            console.error(JSON.stringify({
              type: 'metrics-redis',
              error: 'Failed to parse sample',
              sample: rawSample
            }));
          }
        }
      }
      
      // Sort by timestamp (newest first)
      samples.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return samples;
    } catch (error) {
      console.error(JSON.stringify({
        type: 'metrics-redis',
        error: 'Failed to retrieve samples',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
      return [];
    }
  }

  /**
   * Calculate P95 latency from stored samples
   */
  async getP95Latency(days: number = 1): Promise<number> {
    const samples = await this.getSamples(days);
    
    if (samples.length === 0) {
      return 0;
    }
    
    const latencies = samples.map(s => s.latencyMs).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    
    return latencies[p95Index] || 0;
  }

  /**
   * Get metrics summary
   */
  async getMetricsSummary(days: number = 1): Promise<{
    totalRequests: number;
    p95LatencyMs: number;
    p50LatencyMs: number;
    avgLatencyMs: number;
    cacheHitRate: number;
    errorRate: number;
    timeRange: string;
  }> {
    const samples = await this.getSamples(days);
    
    if (samples.length === 0) {
      return {
        totalRequests: 0,
        p95LatencyMs: 0,
        p50LatencyMs: 0,
        avgLatencyMs: 0,
        cacheHitRate: 0,
        errorRate: 0,
        timeRange: `last ${days} day(s)`
      };
    }
    
    const latencies = samples.map(s => s.latencyMs).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p50Index = Math.floor(latencies.length * 0.50);
    
    const cacheHits = samples.filter(s => s.cache === 'HIT').length;
    const cacheTotal = samples.filter(s => s.cache).length;
    const errors = samples.filter(s => s.status >= 400).length;
    
    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    
    return {
      totalRequests: samples.length,
      p95LatencyMs: latencies[p95Index] || 0,
      p50LatencyMs: latencies[p50Index] || 0,
      avgLatencyMs: Math.round(avgLatency * 100) / 100,
      cacheHitRate: cacheTotal > 0 ? Math.round((cacheHits / cacheTotal) * 100) / 100 : 0,
      errorRate: Math.round((errors / samples.length) * 100) / 100,
      timeRange: `last ${days} day(s)`
    };
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Cleanup - close Redis connection
   */
  async cleanup(): Promise<void> {
    if (this.client && this.connected) {
      try {
        await this.client.quit();
        this.connected = false;
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Singleton instance
export const redisMetricsAdapter = new RedisMetricsAdapter();

// Cleanup on process exit
process.on('SIGTERM', () => {
  redisMetricsAdapter.cleanup();
});

process.on('SIGINT', () => {
  redisMetricsAdapter.cleanup();
});
