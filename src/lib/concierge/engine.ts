import type { ConciergeIntent } from './types'
import { normalizeFilters, type NormalizedFilters } from './intent/normalizer'

export type ClarifyIntent = 'clarify'

export interface IntentContext {
  lastIntent?: ConciergeIntent
  lastFilters?: NormalizedFilters | null
}

export interface IntentDecision {
  intent: ConciergeIntent | ClarifyIntent
  confidence: number
  filters?: NormalizedFilters
  reason?: string
}

type KeywordRule = {
  intent: ConciergeIntent
  patterns: RegExp[]
  confidence: number
  reason: string
}

const keywordRules: KeywordRule[] = [
  {
    intent: 'track_order',
    confidence: 0.9,
    reason: 'order status keywords',
    patterns: [
      /\btrack(ing)? my (order|package|ring|jewelry)\b/i,
      /\border status\b/i,
      /\bwhere('?s| is) my (order|package)\b/i,
      /\bshipping (update|status)\b/i,
      /\bdelivery (update|status)\b/i,
      /\bwya\b/i,
      /\b(package|order) (touchdown|landing)\b/i,
      /\bwhen is (it|my stuff) (coming|arriving)\b/i,
    ],
  },
  {
    intent: 'return_exchange',
    confidence: 0.85,
    reason: 'return or resizing keywords',
    patterns: [
      /\b(return|exchange|refund|resize|resizing)\b/i,
      /\btoo (big|small)\b/i,
      /\b(swap|trade) (it|this)\b/i,
      /\b(didn't|did not) fit\b/i,
      /\b(ain't|not) it\b/i,
      /\bvibes? (is |are )?off\b/i,
      /\bchange my mind\b/i,
    ],
  },
  {
    intent: 'care_warranty',
    confidence: 0.8,
    reason: 'care keywords',
    patterns: [/\b(clean|polish|warranty|repair|tarnish|maintenance)\b/i],
  },
  {
    intent: 'financing',
    confidence: 0.8,
    reason: 'finance keywords',
    patterns: [/\b(finance|payment plan|installments?|klarna|affirm|afterpay)\b/i],
  },
  {
    intent: 'stylist_contact',
    confidence: 0.85,
    reason: 'human/stylist keywords',
    patterns: [
      /\b(stylist|talk to (someone|person)|human|agent|consult|representative|customer service)\b/i,
      /\breal person( please| pl+s+)?\b/i,
      /\bcan i talk to a human\b/i,
    ],
  },
  {
    intent: 'find_product',
    confidence: 0.72,
    reason: 'recommendations keywords',
    patterns: [
      /\b(recommend|recommendation|suggest|ideas|inspiration)\b/i,
      /\bgift ideas?\b/i,
      /\blook(ing)? for\b/i,
      /\bI (need|want) (a|some)\b/i,
      /\b(hunt|hunting) for\b/i,
      /\bobsessed with\b/i,
      /\bwhat should i get\b/i,
      /\bidk what to (get|buy)\b/i,
    ],
  },
]

const commandMap: Record<string, ConciergeIntent> = {
  '/track': 'track_order',
  '/order': 'track_order',
  '/return': 'return_exchange',
  '/resize': 'return_exchange',
  '/stylist': 'stylist_contact',
  '/consult': 'stylist_contact',
  '/care': 'care_warranty',
  '/finance': 'financing',
  '/ready': 'find_product',
  '/browse': 'find_product',
}

const categoryTokens: Record<string, RegExp> = {
  ring: /\b(ring|rings|solitaire|engagement|band)\b/i,
  necklace: /\b(necklace|pendant|chain)\b/i,
  earring: /\b(earring|earrings|stud|hoop)\b/i,
  bracelet: /\b(bracelet|bangle|cuff)\b/i,
}

const metalTokens: Record<string, RegExp> = {
  platinum: /\bplatinum\b/i,
  '14k_yellow': /\byellow gold\b/i,
  '14k_white': /\bwhite gold\b/i,
  '14k_rose': /\brose gold\b/i,
}

const readyToShipPhrases = /\b(ready to ship|ships (today|now)|in stock|fast shipping)\b/i
const negativeReadyPhrases = /\b(made to order|custom order|no rush)\b/i

const pricePattern = /\b(?:under|below|underneath|less than)\s*\$?\s*(\d{2,5})\b/i
const priceLoosePattern = /\$?\s*(\d{2,5})\s*(?:or less|and under)\b/i

const orderNumberPattern = /\b(?:gg[-\s]?)?\d{5,12}\b/i
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const postalPattern = /\b[0-9]{3,5}(?:[-\s][0-9]{3,5})?\b/i

function detectCommand(message: string): IntentDecision | null {
  const trimmed = message.trim()
  const lower = trimmed.toLowerCase()
  const commandIntent = commandMap[lower]
  if (commandIntent) {
    return {
      intent: commandIntent,
      confidence: 0.95,
      reason: 'command',
    }
  }
  return null
}

function detectOrderReference(message: string): IntentDecision | null {
  const hasOrderNumber = orderNumberPattern.test(message)
  const hasEmailZip = emailPattern.test(message) && postalPattern.test(message)
  if (hasOrderNumber || hasEmailZip) {
    return {
      intent: 'track_order',
      confidence: 0.92,
      reason: hasOrderNumber ? 'order_number_detected' : 'email_zip_detected',
    }
  }
  return null
}

function detectKeywordIntent(message: string): IntentDecision | null {
  for (const rule of keywordRules) {
    if (rule.patterns.some((regex) => regex.test(message))) {
      return {
        intent: rule.intent,
        confidence: rule.confidence,
        reason: rule.reason,
      }
    }
  }
  return null
}

function extractPrice(message: string): number | undefined {
  const explicit = message.match(pricePattern)
  if (explicit) {
    return Number(explicit[1])
  }
  const loose = message.match(priceLoosePattern)
  if (loose) {
    return Number(loose[1])
  }
  const shorthand = message.match(/\b(\d{2,5})\s*(usd|dollars?)\b/i)
  if (shorthand) {
    return Number(shorthand[1])
  }
  return undefined
}

function detectProductIntent(message: string, context?: IntentContext): IntentDecision | null {
  const filters: Record<string, unknown> = {}
  const reasons: string[] = []

  Object.entries(categoryTokens).forEach(([category, regex]) => {
    if (regex.test(message)) {
      filters.category = category
      reasons.push(`category=${category}`)
    }
  })

  Object.entries(metalTokens).forEach(([metal, regex]) => {
    if (regex.test(message)) {
      filters.metal = metal
      reasons.push(`metal=${metal}`)
    }
  })

  const readyToShip = readyToShipPhrases.test(message)
  const explicitlyNotReady = negativeReadyPhrases.test(message)
  if (readyToShip && !explicitlyNotReady) {
    filters.readyToShip = true
    reasons.push('ready_to_ship')
  }

  const price = extractPrice(message)
  if (typeof price === 'number') {
    filters.priceLt = price
    reasons.push(`price_lt=${price}`)
  }

  const gift = /\bgift|present\b/i.test(message)
  if (gift) {
    filters.tags = ['gift']
    reasons.push('gift_tag')
  }

  const hasFilters = Object.keys(filters).length > 0

  if (!hasFilters && context?.lastIntent === 'find_product' && context.lastFilters) {
    const inherited = { ...context.lastFilters }
    filters.category = filters.category ?? inherited.category
    filters.metal = filters.metal ?? inherited.metal
    filters.readyToShip = filters.readyToShip ?? inherited.readyToShip
    filters.tags = filters.tags ?? inherited.tags
    filters.priceLt = filters.priceLt ?? inherited.priceLt
    reasons.push('inherited_last_filters')
  }

  if (!hasFilters && Object.keys(filters).length === 0) {
    return null
  }

  const normalizedFilters = normalizeFilters(filters)
  const baseConfidence = hasFilters ? 0.75 : 0.55

  return {
    intent: 'find_product',
    confidence: baseConfidence,
    filters: normalizedFilters,
    reason: reasons.join(', '),
  }
}

export function decideIntent(
  message: string,
  context?: IntentContext
): IntentDecision {
  const trimmed = message.trim()
  if (!trimmed) {
    return { intent: 'clarify', confidence: 0, reason: 'empty' }
  }

  const commandDecision = detectCommand(trimmed)
  if (commandDecision) {
    return commandDecision
  }

  const orderDecision = detectOrderReference(trimmed)
  if (orderDecision) {
    return orderDecision
  }

  const keywordDecision = detectKeywordIntent(trimmed)
  if (keywordDecision) {
    return keywordDecision
  }

  const productDecision = detectProductIntent(trimmed, context)
  if (productDecision) {
    return productDecision
  }

  const wantsMoreProducts = /\b(more options|another|more|show (me )?more|different options)\b/i.test(trimmed)
  if (context?.lastIntent === 'find_product' && context.lastFilters && wantsMoreProducts) {
    return {
      intent: 'find_product',
      confidence: 0.5,
      filters: context.lastFilters,
      reason: 'fallback_to_last_filters',
    }
  }

  return {
    intent: 'clarify',
    confidence: 0.2,
    reason: 'no_match',
  }
}
