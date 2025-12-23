export type ConciergeIntent =
  | 'find_product'
  | 'track_order'
  | 'return_exchange'
  | 'sizing_repairs'
  | 'care_warranty'
  | 'financing'
  | 'stylist_contact'
  | 'csat'

export type IntentSource = 'explicit' | 'keyword' | 'command' | 'engine'

export interface DetectedIntent {
  intent: ConciergeIntent
  source: IntentSource
  payload?: Record<string, unknown>
  confidence?: number
  reason?: string
}

export type WidgetMessageRole = 'guest' | 'concierge'

export type WidgetMessageType = 'text' | 'module'

export type ProductFiltersPayload = {
  category?: string
  readyToShip?: boolean
  tags?: string[]
  priceLt?: number
  priceMax?: number
  featured?: boolean
  limit?: number
  offset?: number
}

export interface ProductFilterPayload {
  type: 'product-filter'
  id: string
  heading: string
  subheading?: string
  defaults?: {
    category?: string
    priceMin?: number
    priceMax?: number
    metal?: string
  }
}

export interface ProductSummary {
  id: string
  title: string
  price: number
  image?: string
  description?: string
  tags?: string[]
  shippingPromise?: string
  slug?: string
}

export interface ProductCarouselPayload {
  type: 'product-carousel'
  id: string
  products: ProductSummary[]
  footerCtaLabel?: string
  filters?: Record<string, unknown>
  sortBy?: SortBy
}

export interface OrderLookupPayload {
  type: 'order-lookup'
  id: string
  mode: 'orderId' | 'emailZip'
}

export interface OrderTimelineEntry {
  label: string
  date?: string
  status: 'complete' | 'current' | 'upcoming'
}

export interface OrderTimelinePayload {
  type: 'order-timeline'
  id: string
  headline: string
  reference: string
  entries: OrderTimelineEntry[]
  actions?: Array<{
    id: string
    label: string
  }>
}

export interface ReturnOptionsPayload {
  type: 'return-options'
  id: string
  options: Array<{
    id: string
    label: string
    description?: string
  }>
}

export interface EscalationFormPayload {
  type: 'escalation-form'
  id: string
  heading: string
  description: string
  submitLabel: string
}

export interface CsatsPromptPayload {
  type: 'csat-prompt'
  id: string
  question: string
}

export interface QuickFiltersPayload {
  type: 'quick-filters'
  id: string
  prompt: string
  filters: Array<{
    label: string
    payload: Record<string, unknown>
  }>
}

export interface ShortlistPanelPayload {
  type: 'shortlist-panel'
  id: string
  title?: string
  items: ProductSummary[]
  ctaLabel?: string
}

export interface IntentChooserPayload {
  type: 'intent-chooser'
  id: string
  headline?: string
  description?: string
  emphasizeHuman?: boolean
  options?: Array<{
    intent: ConciergeIntent
    label: string
    description?: string
    payload?: Record<string, unknown>
  }>
}

export type ModulePayload =
  | ProductFilterPayload
  | ProductCarouselPayload
  | OrderLookupPayload
  | OrderTimelinePayload
  | ReturnOptionsPayload
  | EscalationFormPayload
  | CsatsPromptPayload
  | QuickFiltersPayload
  | ShortlistPanelPayload
  | IntentChooserPayload

export interface WidgetMessage {
  id: string
  role: WidgetMessageRole
  type: WidgetMessageType
  payload: string | ModulePayload
  intent?: ConciergeIntent
  timestamp: number
}

export interface WidgetSession {
  id: string
  lastIntent?: ConciergeIntent
  lastFilters?: Record<string, unknown> | null
  shortlist: ProductSummary[]
  hasShownCsat: boolean
  lastActive: number
  lastOrder?: {
    orderId?: string
    orderNumber?: string
    email?: string
    postalCode?: string
  } | null
  introDismissedAt?: number | null
}

export interface WidgetState {
  isOpen: boolean
  messages: WidgetMessage[]
  session: WidgetSession
  isProcessing: boolean
}

export type WidgetAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'APPEND_MESSAGES'; messages: WidgetMessage[] }
  | { type: 'SET_MESSAGES'; messages: WidgetMessage[] }
  | { type: 'SET_PROCESSING'; value: boolean }
  | { type: 'UPDATE_SESSION'; session: Partial<WidgetSession> }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: WidgetState }

export interface ExecuteIntentArgs {
  intent: ConciergeIntent
  payload?: Record<string, unknown>
  state: WidgetState
}

export interface IntentResponse {
  messages: WidgetMessage[]
  sessionPatch?: Partial<WidgetSession>
  offerTriggered?: boolean
  error?: string
}

export type QuickLinkDefinition = {
  id: string
  intent: ConciergeIntent
  label: string
  description?: string
  payload?: Record<string, unknown>
}

export type QuickStartLink = {
  slug: string
  label: string
  filters?: ProductFiltersPayload
}

export const QUICK_LINKS: QuickLinkDefinition[] = [
  {
    id: 'design-ideas',
    intent: 'find_product',
    label: 'Design ideas',
    payload: { slug: 'design-ideas', filters: { featured: true, readyToShip: true } },
  },
  {
    id: 'gifts-under-300',
    intent: 'find_product',
    label: 'Gifts under $300',
    payload: { slug: 'gifts-under-300', filters: { priceLt: 300, readyToShip: true } },
  },
  {
    id: 'ready-to-ship',
    intent: 'find_product',
    label: 'Ready to ship',
    payload: { slug: 'ready-to-ship', filters: { readyToShip: true } },
  },
  { id: 'track-order', intent: 'track_order', label: 'Track my order' },
  { id: 'returns-resizing', intent: 'return_exchange', label: 'Returns & resizing' },
  { id: 'warranty-care', intent: 'care_warranty', label: 'Warranty & Care' },
  { id: 'talk-to-stylist', intent: 'stylist_contact', label: 'Talk to a stylist' },
]

export function createMessage(
  role: WidgetMessageRole,
  payload: string | ModulePayload,
  intent?: ConciergeIntent,
  options?: { id?: string; timestamp?: number }
): WidgetMessage {
  const generatedId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `msg-${Math.random().toString(36).slice(2)}`

  return {
    id: options?.id ?? generatedId,
    role,
    type: typeof payload === 'string' ? 'text' : 'module',
    payload,
    intent,
    timestamp: options?.timestamp ?? Date.now(),
  }
}

// Enhanced type safety for Phase 6: Strategic Rebuild

/**
 * Product filter interface with explicit types
 * Replaces generic Record<string, unknown> for better type safety
 */
export interface ProductFilters {
  category?: string
  metal?: string
  readyToShip?: boolean
  tags?: string[]
  priceMin?: number
  priceMax?: number
  limit?: number
  offset?: number
  q?: string
}

/**
 * Intent payload with typed fields
 * Provides better IntelliSense and compile-time checking
 */
export interface IntentPayload {
  filters?: ProductFilters
  selection?: Record<string, unknown> // Keep flexible for different selection types
  response?: Record<string, unknown> // Keep flexible for CSAT responses
  action?: string
  source?: IntentSource
  requestId?: string
}

/**
 * Module action with explicit action types
 * Ensures all action handlers are type-safe
 */
export interface ModuleAction {
  type:
  | 'submit-product-filters'
  | 'submit-order-lookup'
  | 'submit-return-option'
  | 'submit-escalation'
  | 'submit-csat'
  | 'shortlist-product'
  | 'shortlist-escalate'
  | 'shortlist-share'
  | 'shortlist-clear'
  | 'shortlist-remove'
  | 'shortlist-open-drawer'
  | 'shortlist-checkout'
  | 'view-product'
  | 'apply-filters'
  | 'filter_change'
  | 'text-updates'
  | 'offer-action' // Legacy, no-op
  | 'intent-chooser-select'
  data?: unknown
}
import type { SortBy } from './providers/types'
