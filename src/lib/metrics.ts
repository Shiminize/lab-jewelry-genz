/**
 * Metrics Collection System for Aurora Concierge Widget
 * Provides in-memory metrics storage with export capability
 */

export interface MetricPoint {
  name: string
  value: number
  timestamp: number
  labels?: Record<string, string>
}

export interface LatencyMetric {
  endpoint: string
  duration: number
  timestamp: number
  statusCode?: number
}

export interface ErrorMetric {
  endpoint: string
  error: string
  timestamp: number
  statusCode?: number
}

interface MetricsStore {
  latencies: LatencyMetric[]
  errors: ErrorMetric[]
  counters: Map<string, number>
  gauges: Map<string, number>
}

// In-memory metrics store (will be replaced by proper metrics backend)
const store: MetricsStore = {
  latencies: [],
  errors: [],
  counters: new Map(),
  gauges: new Map(),
}

// Configuration
const MAX_STORED_METRICS = 1000
const METRIC_RETENTION_MS = 60 * 60 * 1000 // 1 hour

/**
 * Track API endpoint latency
 */
export function trackLatency(
  endpoint: string,
  duration: number,
  statusCode?: number
): void {
  const metric: LatencyMetric = {
    endpoint,
    duration,
    timestamp: Date.now(),
    statusCode,
  }

  store.latencies.push(metric)

  // Trim old metrics
  if (store.latencies.length > MAX_STORED_METRICS) {
    const cutoff = Date.now() - METRIC_RETENTION_MS
    store.latencies = store.latencies.filter((m) => m.timestamp > cutoff)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[metrics] ${endpoint} took ${duration}ms`)
  }
}

/**
 * Track API endpoint error
 */
export function trackError(
  endpoint: string,
  error: Error,
  statusCode?: number
): void {
  const metric: ErrorMetric = {
    endpoint,
    error: error.message,
    timestamp: Date.now(),
    statusCode,
  }

  store.errors.push(metric)

  // Trim old metrics
  if (store.errors.length > MAX_STORED_METRICS) {
    const cutoff = Date.now() - METRIC_RETENTION_MS
    store.errors = store.errors.filter((m) => m.timestamp > cutoff)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[metrics] ${endpoint} error: ${error.message}`)
  }
}

/**
 * Increment a counter metric
 */
export function incrementCounter(name: string, amount: number = 1): void {
  const current = store.counters.get(name) || 0
  store.counters.set(name, current + amount)
}

/**
 * Set a gauge metric
 */
export function setGauge(name: string, value: number): void {
  store.gauges.set(name, value)
}

/**
 * Calculate percentile from latency data
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

/**
 * Get metrics summary for an endpoint
 */
export function getEndpointMetrics(endpoint: string): {
  latency: {
    count: number
    p50: number
    p95: number
    p99: number
    avg: number
  }
  errors: {
    count: number
    rate: number // errors per request
  }
} {
  const latencies = store.latencies.filter((m) => m.endpoint === endpoint)
  const errors = store.errors.filter((m) => m.endpoint === endpoint)
  const durations = latencies.map((m) => m.duration)

  const avgLatency =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0

  const errorRate =
    latencies.length > 0 ? errors.length / latencies.length : 0

  return {
    latency: {
      count: latencies.length,
      p50: calculatePercentile(durations, 50),
      p95: calculatePercentile(durations, 95),
      p99: calculatePercentile(durations, 99),
      avg: avgLatency,
    },
    errors: {
      count: errors.length,
      rate: errorRate,
    },
  }
}

/**
 * Get all metrics in Prometheus-compatible format
 */
export function getMetrics(): MetricPoint[] {
  const points: MetricPoint[] = []
  const now = Date.now()

  // Aggregate latency metrics per endpoint
  const endpointGroups = new Map<string, LatencyMetric[]>()
  store.latencies.forEach((m) => {
    const group = endpointGroups.get(m.endpoint) || []
    group.push(m)
    endpointGroups.set(m.endpoint, group)
  })

  endpointGroups.forEach((metrics, endpoint) => {
    const durations = metrics.map((m) => m.duration)
    points.push({
      name: 'concierge_api_latency_p50',
      value: calculatePercentile(durations, 50),
      timestamp: now,
      labels: { endpoint },
    })
    points.push({
      name: 'concierge_api_latency_p95',
      value: calculatePercentile(durations, 95),
      timestamp: now,
      labels: { endpoint },
    })
    points.push({
      name: 'concierge_api_latency_p99',
      value: calculatePercentile(durations, 99),
      timestamp: now,
      labels: { endpoint },
    })
  })

  // Aggregate error metrics per endpoint
  const errorGroups = new Map<string, ErrorMetric[]>()
  store.errors.forEach((m) => {
    const group = errorGroups.get(m.endpoint) || []
    group.push(m)
    errorGroups.set(m.endpoint, group)
  })

  errorGroups.forEach((errors, endpoint) => {
    points.push({
      name: 'concierge_api_errors_total',
      value: errors.length,
      timestamp: now,
      labels: { endpoint },
    })

    const latencies = store.latencies.filter((m) => m.endpoint === endpoint)
    const errorRate = latencies.length > 0 ? errors.length / latencies.length : 0
    points.push({
      name: 'concierge_api_error_rate',
      value: errorRate,
      timestamp: now,
      labels: { endpoint },
    })
  })

  // Add counters
  store.counters.forEach((value, name) => {
    points.push({
      name,
      value,
      timestamp: now,
    })
  })

  // Add gauges
  store.gauges.forEach((value, name) => {
    points.push({
      name,
      value,
      timestamp: now,
    })
  })

  return points
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  store.latencies = []
  store.errors = []
  store.counters.clear()
  store.gauges.clear()
}

/**
 * Get metrics summary for all endpoints
 */
export function getAllMetricsSummary(): Record<string, ReturnType<typeof getEndpointMetrics>> {
  const endpoints = new Set([
    ...store.latencies.map((m) => m.endpoint),
    ...store.errors.map((m) => m.endpoint),
  ])

  const summary: Record<string, ReturnType<typeof getEndpointMetrics>> = {}
  endpoints.forEach((endpoint) => {
    summary[endpoint] = getEndpointMetrics(endpoint)
  })

  return summary
}

