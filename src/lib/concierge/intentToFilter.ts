import type { ProductFilter } from '@/lib/concierge/providers/types'

const PRICE_CEILING = Number(process.env.WIDGET_PRICE_GIFT_CEILING || 300)

export function intentToFilter(text: string): ProductFilter & { priceLt?: number } {
  const normalized = (text || '').toLowerCase()
  const filter: ProductFilter & { priceLt?: number } = {}

  if (normalized.includes('ready to ship') || normalized.includes('ready-to-ship')) {
    filter.readyToShip = true
  }
  if (/(ring|rings)/.test(normalized)) {
    filter.category = 'ring'
  }
  if (/(necklace|necklaces)/.test(normalized)) {
    filter.category = 'necklace'
  }
  if (/(earring|earrings)/.test(normalized)) {
    filter.category = 'earring'
  }
  if (/(bracelet|bracelets)/.test(normalized)) {
    filter.category = 'bracelet'
  }

  // Vibe Checks (Gen Z Aesthetics)
  if (/\b(clean girl|minimal|simple|dainty|everyday)\b/.test(normalized)) {
    filter.tags = [...(filter.tags || []), 'minimal']
    if (!filter.metal) filter.metal = '14k_white' // Default to silver/white gold vibe
  }
  if (/\b(mob wife|chunky|statement|bold|thick)\b/.test(normalized)) {
    filter.tags = [...(filter.tags || []), 'statement']
    if (!filter.metal) filter.metal = '14k_yellow' // Default to gold vibe
  }
  if (/\b(coquette|bow|heart|girly|soft)\b/.test(normalized)) {
    filter.tags = [...(filter.tags || []), 'motif']
    if (!filter.metal) filter.metal = '14k_rose' // Default to rose gold vibe
  }
  if (/\b(old money|classic|timeless|heirloom)\b/.test(normalized)) {
    filter.tags = [...(filter.tags || []), 'classic']
    if (!filter.metal) filter.metal = '14k_yellow'
  }

  const giftMention = /\bgift\b|\bpresent\b/.test(normalized)

  // Fuzzy Price Logic
  // Matches: "under 500", "< 500", "around 500", "about 500", "like 500ish"
  const priceMatch = normalized.match(/(?:under|below|less than|<\s*)\s*\$?\s*(\d+)/)
  const aroundMatch = normalized.match(/(?:around|about|approx|like)\s*\$?\s*(\d+)/)

  let detectedCeiling: number | undefined

  if (priceMatch) {
    detectedCeiling = Number(priceMatch[1])
  } else if (aroundMatch) {
    // "Around $500" -> treat as under $600 (20% buffer)
    detectedCeiling = Math.round(Number(aroundMatch[1]) * 1.2)
  }

  const priceCeiling = detectedCeiling

  if (giftMention || typeof priceCeiling === 'number') {
    filter.tags = Array.from(new Set([...(filter.tags || []), 'gift']))
    const resolvedCeiling =
      typeof priceCeiling === 'number' && Number.isFinite(priceCeiling) ? priceCeiling : undefined
    filter.priceLt = Math.min(resolvedCeiling ?? PRICE_CEILING, PRICE_CEILING)
  }

  filter.q = text
  return filter
}
