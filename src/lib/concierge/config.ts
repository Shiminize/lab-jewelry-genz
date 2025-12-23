interface ConciergeEndpoints {
  products?: string
  orderStatus?: string
  returns?: string
  stylist?: string
  csat?: string
  shortlist?: string
  orderUpdates?: string
}

const stubBase = '/api/stub/concierge'

export const allowStubInProd = process.env.CONCIERGE_ALLOW_STUB_IN_PROD === 'true'

export type ConciergeDataMode = 'stub' | 'localDb' | 'remoteApi'

function resolveDataMode(): ConciergeDataMode {
  const explicit = process.env.CONCIERGE_DATA_MODE as ConciergeDataMode | undefined
  if (explicit) {
    return explicit
  }

  if (process.env.CONCIERGE_PRODUCTS_ENDPOINT) {
    return 'remoteApi'
  }

  if (process.env.MONGODB_URI || process.env.DATABASE_URL) {
    return 'localDb'
  }

  return 'stub'
}

export const conciergeDataMode: ConciergeDataMode = resolveDataMode()

export const conciergeEndpoints: ConciergeEndpoints = {
  products: process.env.CONCIERGE_PRODUCTS_ENDPOINT || `${stubBase}/products`,
  orderStatus: process.env.CONCIERGE_ORDER_STATUS_ENDPOINT || `${stubBase}/orders/status`,
  returns: process.env.CONCIERGE_RETURNS_ENDPOINT || `${stubBase}/orders/returns`,
  stylist: process.env.CONCIERGE_STYLIST_ENDPOINT || `${stubBase}/stylist`,
  csat: process.env.CONCIERGE_CSAT_ENDPOINT || `/api/stub/concierge/analytics/csat`,
  shortlist: process.env.CONCIERGE_SHORTLIST_ENDPOINT || `${stubBase}/shortlist`,
  orderUpdates: process.env.CONCIERGE_ORDER_UPDATES_ENDPOINT || `${stubBase}/order-updates`,
}

export const conciergeApiHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(process.env.CONCIERGE_API_KEY ? { Authorization: `Bearer ${process.env.CONCIERGE_API_KEY}` } : {}),
}

let warnedEnv = false

export function logConciergeEnvWarnings() {
  if (warnedEnv) return
  warnedEnv = true

  const isProd = process.env.NODE_ENV === 'production'

  if (conciergeDataMode === 'stub' && isProd) {
    // eslint-disable-next-line no-console
    console.warn(
      `[concierge] Running in stub mode in production${allowStubInProd ? ' (override enabled)' : ''} — widget will return mock data.`
    )
  }

  if (conciergeDataMode === 'localDb' && !process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn('[concierge] localDb mode selected but no database URL is configured.')
  }

  if (conciergeDataMode === 'remoteApi' && !process.env.CONCIERGE_PRODUCTS_ENDPOINT) {
    // eslint-disable-next-line no-console
    console.warn('[concierge] remoteApi mode selected but CONCIERGE_PRODUCTS_ENDPOINT is missing.')
  }
}

let enforced = false

export function enforceConciergeEnv() {
  if (enforced) return
  enforced = true

  const isProd = process.env.NODE_ENV === 'production'
  if (conciergeDataMode === 'stub' && isProd && !allowStubInProd) {
    throw new Error(
      '[concierge] Stub data mode is not allowed in production. Set CONCIERGE_DATA_MODE=remoteApi or localDb, or explicitly allow with CONCIERGE_ALLOW_STUB_IN_PROD=true.'
    )
  }

  if (conciergeDataMode === 'localDb' && isProd && !process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    throw new Error('[concierge] localDb mode in production requires MONGODB_URI or DATABASE_URL to be set.')
  }
}
