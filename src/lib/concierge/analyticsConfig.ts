'use client'

const DEFAULT_ENDPOINT = '/api/dev-analytics/collect'

export type AnalyticsSink = 'mirror' | 'custom' | 'disabled'
export const analyticsGuardEnabled = process.env.NEXT_PUBLIC_CONCIERGE_ANALYTICS_GUARD !== 'false'

const rawEndpoint = process.env.NEXT_PUBLIC_CONCIERGE_ANALYTICS_ENDPOINT || DEFAULT_ENDPOINT
const enabled = process.env.NEXT_PUBLIC_CONCIERGE_ANALYTICS_ENABLED !== 'false'
const devMirrorEnabled = process.env.NEXT_PUBLIC_ANALYTICS_DEV_MIRROR_ENABLED !== 'false'

function resolveSink(): AnalyticsSink {
  if (!enabled) return 'disabled'
  if (rawEndpoint && rawEndpoint !== DEFAULT_ENDPOINT) return 'custom'
  return 'mirror'
}

export const analyticsConfig = {
  enabled,
  endpoint: rawEndpoint || DEFAULT_ENDPOINT,
  devMirrorEnabled,
  sink: resolveSink(),
} as const
