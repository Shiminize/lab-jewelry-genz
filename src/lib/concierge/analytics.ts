'use client'

import { analyticsConfig, analyticsGuardEnabled } from './analyticsConfig'
import { conciergeDataMode } from './config'

const isProd = process.env.NODE_ENV === 'production'

function sendAnalytics(endpoint: string, payload: Record<string, unknown>) {
  try {
    if ('sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      navigator.sendBeacon(endpoint, blob)
      return
    }

    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // non-blocking
  }
}

/**
 * Lightweight client-side analytics helper for the widget.
 * Dispatches DOM events, mirrors to dataLayer, and POSTs to the configured sink + dev mirror.
 */
export function trackEvent(event: string, detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return
  }

  const eventDetail: Record<string, unknown> = { ...(detail ?? {}) }
  if (!eventDetail.requestId) {
    eventDetail.requestId =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `req-${Math.random().toString(36).slice(2)}`
  }

  const prefixedEvent = event.startsWith('aurora_') ? event : `aurora_${event}`

  try {
    const payload = {
      event: prefixedEvent,
      originalEvent: event,
      ...eventDetail,
      dataMode: conciergeDataMode,
      env: process.env.NODE_ENV,
      timestamp: Date.now(),
    }

    window.dispatchEvent(new CustomEvent('aurora-widget-event', { detail: payload }))

    const dataLayer = (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer
    dataLayer?.push({ event: prefixedEvent, ...eventDetail })

    if (!analyticsConfig.enabled) {
      return
    }

    if (analyticsGuardEnabled && isProd && analyticsConfig.sink === 'mirror') {
      // Prevent silently running only dev mirror in prod; emit warning event and skip network call
      console.warn('[concierge] analytics guard: dev mirror sink in production, skipping event send.')
      return
    }

    const endpoints = new Set<string>()
    endpoints.add(analyticsConfig.endpoint)
    if (analyticsConfig.devMirrorEnabled) {
      endpoints.add('/api/dev-analytics/collect')
    }

    endpoints.forEach((endpoint) => sendAnalytics(endpoint, payload))
  } catch (error) {
    // swallow analytics errors
  }
}
