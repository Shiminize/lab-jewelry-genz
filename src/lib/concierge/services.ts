import {
  conciergeApiHeaders,
  conciergeDataMode,
  conciergeEndpoints,
  enforceConciergeEnv,
  logConciergeEnvWarnings,
} from './config'
import { getProductCatalogProvider } from './catalogProvider'
import { normalizeFilters, normalizeProductResponse } from './intent/normalizer'

function withRequestId(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
  if (!headers.has('x-request-id')) {
    headers.set('x-request-id', crypto.randomUUID?.() ?? `req-${Math.random().toString(36).slice(2)}`)
  }
  return { ...init, headers }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, withRequestId(init))
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

// Normalization functions moved to ./intent/normalizer.ts for unified handling

export async function fetchProducts(filters: Record<string, unknown>) {
  logConciergeEnvWarnings()
  enforceConciergeEnv()
  const { sessionId: _sessionId, ...rawFilters } = filters ?? {}
  
  // Flatten nested filters object (widget sends {filters: {priceMax: 300}})
  const flatFilters = rawFilters.filters && typeof rawFilters.filters === 'object'
    ? { ...rawFilters, ...(rawFilters.filters as Record<string, unknown>) }
    : rawFilters
  
  const normalizedFilters = normalizeFilters(flatFilters)

  let products: Array<Record<string, unknown>> = []

  if (conciergeDataMode === 'remoteApi') {
    products = await fetchJson<Array<Record<string, unknown>>>(conciergeEndpoints.products ?? '/api/support/products', {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(normalizedFilters),
    })
  } else if (conciergeDataMode === 'localDb') {
    try {
      const provider = getProductCatalogProvider('localDb')
      products = await provider.getProducts(normalizedFilters as Record<string, unknown>)
    } catch (error) {
      console.warn('[fetchProducts] localDb provider unavailable, falling back to stub data:', error)
      const provider = getProductCatalogProvider('stub')
      products = await provider.getProducts(normalizedFilters as Record<string, unknown>)
    }
  } else {
    const provider = getProductCatalogProvider('stub')
    products = await provider.getProducts(normalizedFilters as Record<string, unknown>)
  }

  return Array.isArray(products) ? products.map((product) => normalizeProductResponse(product)) : []
}

export async function fetchOrderStatus(details: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.orderStatus && !conciergeEndpoints.orderStatus.startsWith('/api/stub/')) {
    return fetchJson(conciergeEndpoints.orderStatus, {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(details),
    })
  }

  const { default: fallback } = await import('./stubs/orderStatus')
  return fallback(details)
}

export async function submitReturn(selection: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.returns && !conciergeEndpoints.returns.startsWith('/api/stub/')) {
    const headers = new Headers(conciergeApiHeaders)
    const idempotency = typeof selection.idempotencyKey === 'string' ? selection.idempotencyKey : undefined
    if (idempotency) {
      headers.set('x-idempotency-key', idempotency)
    }
    return fetchJson(conciergeEndpoints.returns, {
      method: 'POST',
      headers,
      body: JSON.stringify(selection),
    })
  }

  const { default: fallback } = await import('./stubs/returns')
  return fallback(selection)
}

// capsule reservation removed (recommendation-only)

export async function createStylistTicket(payload: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.stylist && !conciergeEndpoints.stylist.startsWith('/api/stub/')) {
    return fetchJson(conciergeEndpoints.stylist, {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(payload),
    })
  }

  const { default: fallback } = await import('./stubs/stylist')
  return fallback(payload)
}

export async function submitCsat(response: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.csat && !conciergeEndpoints.csat.startsWith('/api/stub/')) {
    return fetchJson(conciergeEndpoints.csat, {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(response),
    })
  }

  const { default: fallback } = await import('./stubs/csat')
  return fallback(response)
}

export async function persistShortlist(payload: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.shortlist && !conciergeEndpoints.shortlist.startsWith('/api/stub/')) {
    return fetchJson(conciergeEndpoints.shortlist, {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(payload),
    })
  }

  const { default: fallback } = await import('./stubs/shortlist')
  return fallback(payload)
}

// inspiration upload removed (recommendation-only)

export async function subscribeOrderUpdates(payload: Record<string, unknown>) {
  enforceConciergeEnv()
  if (conciergeEndpoints.orderUpdates && !conciergeEndpoints.orderUpdates.startsWith('/api/stub/')) {
    return fetchJson(conciergeEndpoints.orderUpdates, {
      method: 'POST',
      headers: conciergeApiHeaders,
      body: JSON.stringify(payload),
    })
  }

  const { default: fallback } = await import('./stubs/orderUpdates')
  return fallback(payload)
}
