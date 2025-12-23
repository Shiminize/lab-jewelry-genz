/**
 * Lightweight Metrics Logger
 * Emits count, latency, and error metrics to stdout and optionally Redis
 */

import { redisMetricsAdapter } from './redisAdapter';

interface MetricEntry {
  timestamp: string
  endpoint: string
  method: string
  status: number
  latencyMs: number
  error?: string
  params?: Record<string, string>
  cache?: 'HIT' | 'MISS'
  // CDN-specific fields
  cdnProvider?: string
  cdnCacheStatus?: string
  cdnNormalized?: string
  cdnHeaders?: Record<string, string>
}

// In-memory store for p95 calculation (last 1000 requests)
const latencyBuffer: number[] = []
const MAX_BUFFER_SIZE = 1000

/**
 * Log a metric entry to stdout and Redis (if available)
 */
export function logMetric(entry: MetricEntry) {
  // Add to latency buffer for p95 calculation
  latencyBuffer.push(entry.latencyMs)
  if (latencyBuffer.length > MAX_BUFFER_SIZE) {
    latencyBuffer.shift() // Remove oldest
  }

  // Log to stdout in JSON format (unchanged for compatibility)
  console.log(JSON.stringify({
    type: 'metric',
    ...entry,
  }))

  // Store in Redis for persistence (async, non-blocking)
  redisMetricsAdapter.storeSample(entry).catch(error => {
    // Silent failure - don't impact main request flow
    console.error(JSON.stringify({
      type: 'metrics-redis',
      error: 'Failed to store sample in Redis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  });
}

/**
 * Calculate p95 latency from buffer
 */
export function getP95Latency(): number {
  if (latencyBuffer.length === 0) return 0
  
  const sorted = [...latencyBuffer].sort((a, b) => a - b)
  const p95Index = Math.floor(sorted.length * 0.95)
  return sorted[p95Index] || 0
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): {
  totalRequests: number
  p95LatencyMs: number
  bufferSize: number
} {
  return {
    totalRequests: latencyBuffer.length,
    p95LatencyMs: getP95Latency(),
    bufferSize: latencyBuffer.length,
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withMetrics<T>(
  endpoint: string,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  return handler()
    .then((result) => {
      const latencyMs = Date.now() - startTime
      logMetric({
        timestamp,
        endpoint,
        method: 'GET',
        status: 200,
        latencyMs,
      })
      return result
    })
    .catch((error) => {
      const latencyMs = Date.now() - startTime
      const status = (error as any).status || 500
      
      logMetric({
        timestamp,
        endpoint,
        method: 'GET',
        status,
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    })
}

