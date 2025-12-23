import { describe, it, expect } from '@jest/globals'
import { decideIntent, type IntentContext } from '@/lib/concierge/engine'

describe('intent engine', () => {
  it('detects order tracking keywords with high confidence', () => {
    const result = decideIntent('Where is my order?')
    expect(result.intent).toBe('track_order')
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  it('detects stylist escalation via command', () => {
    const result = decideIntent('/stylist')
    expect(result.intent).toBe('stylist_contact')
    expect(result.confidence).toBeCloseTo(0.95)
  })

  it('extracts product filters for category and budget', () => {
    const result = decideIntent('Show me rose gold rings under $500')
    expect(result.intent).toBe('find_product')
    expect(result.filters?.category).toBe('ring')
    expect(result.filters?.metal).toBe('14k_rose')
    expect(result.filters?.priceLt).toBe(500)
  })

  it('reuses last product filters only when user asks for more', () => {
    const context: IntentContext = {
      lastIntent: 'find_product',
      lastFilters: { category: 'ring', readyToShip: true },
    }
    const result = decideIntent('show me more options', context)
    expect(result.intent).toBe('find_product')
    expect(result.filters?.category).toBe('ring')
    expect(result.confidence).toBeGreaterThan(0.4)
  })

  it('detects bare order numbers as tracking intent', () => {
    const result = decideIntent('GG-123456')
    expect(result.intent).toBe('track_order')
    expect(result.reason).toBe('order_number_detected')
  })

  it('detects email + postal code as tracking intent', () => {
    const result = decideIntent('my email is hi@test.com 94110')
    expect(result.intent).toBe('track_order')
    expect(result.reason).toBeDefined()
  })

  it('maps delivery update phrasing to tracking intent', () => {
    const result = decideIntent('need a delivery update')
    expect(result.intent).toBe('track_order')
  })

  it('routes customer service requests to stylist contact', () => {
    const result = decideIntent('I need a customer service agent')
    expect(result.intent).toBe('stylist_contact')
  })

  it('treats gift recommendations with budget as product intent', () => {
    const result = decideIntent('can you recommend a gift under $300')
    expect(result.intent).toBe('find_product')
    expect(result.confidence).toBeGreaterThan(0.6)
  })

  it('returns clarify for unknown phrases', () => {
    const result = decideIntent('asdfghjkl')
    expect(result.intent).toBe('clarify')
  })
})
