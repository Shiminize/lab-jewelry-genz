'use client'

/**
 * Widget Prefetch Component
 * Prefetches common queries for the concierge widget
 * Should be included in pages that mount the widget
 */

import { useEffect } from 'react'

const COMMON_QUERIES = [
  // Ready-to-ship rings (most common query)
  '/api/concierge/products?readyToShip=true&category=ring',
  // Gifts under $300 (second most common)
  '/api/concierge/products?readyToShip=true&priceLt=300',
]

export function WidgetPrefetch() {
  useEffect(() => {
    COMMON_QUERIES.forEach((url) => {
      // Check if already exists
      if (document.head.querySelector(`link[href="${url}"]`)) return

      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }, [])

  return null
}

/**
 * Server-side prefetch hints for Next.js App Router
 * Use this in layout.tsx or page.tsx
 */
export function WidgetPrefetchMetadata() {
  return {
    other: {
      'Link': COMMON_QUERIES.map(url => `<${url}>; rel=prefetch; as=fetch`).join(', ')
    }
  }
}
