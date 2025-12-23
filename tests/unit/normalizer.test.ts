import { describe, it, expect } from '@jest/globals'
import { normalizeFilters } from '@/lib/concierge/intent/normalizer'

describe('normalizeFilters', () => {
  it('should handle materials array', () => {
    const raw = { materials: ['Gold', 'SILVER'] }
    const normalized = normalizeFilters(raw)
    expect(normalized.materials).toEqual(['gold', 'silver'])
  })

  it('should handle stone type and convert to tag', () => {
    const raw = { stone: 'Lab Diamond' }
    const normalized = normalizeFilters(raw)
    expect(normalized.stone).toBe('Lab Diamond')
    expect(normalized.tags).toContain('lab-diamond')
  })

  it('should merge stone tag with existing tags', () => {
    const raw = { stone: 'Pearl', tags: ['new-arrival'] }
    const normalized = normalizeFilters(raw)
    expect(normalized.tags).toContain('new-arrival')
    expect(normalized.tags).toContain('pearl')
  })

  it('should handle legacy priceBand filter', () => {
    const raw = { priceBand: { min: 100, max: 500 } }
    const normalized = normalizeFilters(raw)
    expect(normalized.priceMin).toBe(100)
    expect(normalized.priceMax).toBe(500)
  })
})
