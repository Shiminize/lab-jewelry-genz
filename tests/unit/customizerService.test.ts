import {
  calculatePriceQuote,
  fetchCustomizerConfig,
  listMaterialOptions,
  type CustomizerPriceQuote,
} from '@/services/neon/customizerService'
import { defaultCustomizerConfig } from '@/config/customizerDefaults'

describe('customizerService', () => {
  describe('fetchCustomizerConfig', () => {
    it('returns config from API responses', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: defaultCustomizerConfig }),
      })

      const config = await fetchCustomizerConfig({ fetchImpl: mockFetch, useCache: false })

      expect(config).toMatchObject(defaultCustomizerConfig)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('falls back to defaults when the request fails', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('network error'))

      const config = await fetchCustomizerConfig({ fetchImpl: mockFetch, useCache: false })

      expect(config).toMatchObject(defaultCustomizerConfig)
    })
  })

  describe('listMaterialOptions', () => {
    it('returns material options using the provided config', () => {
      const options = listMaterialOptions(defaultCustomizerConfig)
      expect(options).toHaveLength(defaultCustomizerConfig.materials.length)
      expect(options[0]).toMatchObject({ id: 'platinum-polish' })
    })
  })

  describe('calculatePriceQuote', () => {
    it('returns a typed price quote for known variants/materials', () => {
      const quote = calculatePriceQuote('ring-luxury-001', 'platinum-polish', defaultCustomizerConfig)
      const keys: Array<keyof CustomizerPriceQuote> = [
        'variantId',
        'materialId',
        'basePrice',
        'materialAdjustment',
        'total',
        'currency',
      ]

      keys.forEach((key) => expect(quote).toHaveProperty(key))
      expect(quote.total).toBe(quote.basePrice + quote.materialAdjustment)
      expect(quote.currency).toBe('USD')
    })

    it('handles unknown variant or material ids by falling back to zero adjustments', () => {
      const quote = calculatePriceQuote('unknown-variant', 'unknown-material', defaultCustomizerConfig)
      expect(quote.basePrice).toBe(0)
      expect(quote.materialAdjustment).toBe(0)
      expect(quote.total).toBe(0)
    })
  })
})
