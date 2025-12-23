import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { executeIntent, getInitialMessages } from '@/lib/concierge/scripts'
import type { ConciergeIntent, WidgetState } from '@/lib/concierge/types'

const mockProducts = [
  {
    _id: '1',
    name: 'Diamond Solitaire Ring',
    slug: 'diamond-solitaire-ring',
    category: 'rings',
    basePrice: 500,
    heroImage: '/images/ring1.jpg',
    tagline: 'Classic elegance',
    readyToShip: true,
    tags: ['engagement', 'diamond', 'classic'],
    metal: 'yellow-gold',
  },
  {
    _id: '2',
    name: 'Pearl Necklace',
    slug: 'pearl-necklace',
    category: 'necklaces',
    basePrice: 300,
    heroImage: '/images/necklace1.jpg',
    tagline: 'Timeless beauty',
    readyToShip: true,
    tags: ['pearl', 'elegant'],
    metal: 'white-gold',
  },
  {
    _id: '3',
    name: 'Custom Platinum Band',
    slug: 'custom-platinum-band',
    category: 'rings',
    basePrice: 1500,
    heroImage: '/images/ring2.jpg',
    tagline: 'Made to order',
    readyToShip: false,
    tags: ['wedding', 'platinum'],
    metal: 'platinum',
  },
]

const buildState = (): WidgetState => ({
  isOpen: false,
  isProcessing: false,
  messages: [],
  session: {
    id: 'session-123',
    lastIntent: undefined,
    lastFilters: null,
    shortlist: [],
    hasShownCsat: false,
    lastActive: Date.now(),
  },
})

const runIntent = (intent: ConciergeIntent, payload?: Record<string, unknown>) =>
  executeIntent({ intent, payload, state: buildState() })

beforeEach(() => {
  const mockFetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.endsWith('/api/support/products')) {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {}
      let filtered = mockProducts.filter((p) => p.readyToShip)

      if (typeof body.category === 'string') {
        filtered = filtered.filter((p) => p.category === body.category)
      }
      if (typeof body.metal === 'string') {
        filtered = filtered.filter((p) => p.metal === body.metal)
      }
      if (typeof body.priceMin === 'number') {
        filtered = filtered.filter((p) => p.basePrice >= body.priceMin!)
      }
      if (typeof body.priceMax === 'number') {
        filtered = filtered.filter((p) => p.basePrice <= body.priceMax!)
      }

      return {
        ok: true,
        json: async () =>
          filtered.map((p) => ({
            id: p._id,
            title: p.name,
            price: p.basePrice,
            image: p.heroImage,
            readyToShip: p.readyToShip,
            category: p.category,
            metal: p.metal,
            basePrice: p.basePrice,
          })),
      }
    }

    if (url.endsWith('/api/support/order-status')) {
      return {
        ok: true,
        json: async () => ({
          reference: 'GG-100',
          entries: [{ label: 'Processing', status: 'current' as const }],
        }),
      }
    }

    if (url.endsWith('/api/support/returns')) {
      return {
        ok: true,
        json: async () => ({ message: 'Return created' }),
      }
    }

    if (url.endsWith('/api/support/stylist')) {
      return {
        ok: true,
        json: async () => ({ message: 'Stylist queued' }),
      }
    }

    return {
      ok: true,
      json: async () => ({}),
    }
  })

  global.fetch = mockFetch as unknown as typeof fetch
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('executeIntent', () => {
  describe('find_product intent', () => {
    it('prompts for filters when no explicit filters provided', async () => {
      const result = await runIntent('find_product', {})
      expect(result.messages).toHaveLength(2)
      const moduleMessage = result.messages.find((m) => m.type === 'module')
      expect(moduleMessage?.payload && typeof moduleMessage.payload === 'object').toBe(true)
      expect((moduleMessage?.payload as any).type).toBe('product-filter')
    })

    it('returns only ready-to-ship products when filters submitted', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: {},
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(moduleMessage && (moduleMessage.payload as any).type).toBe('product-carousel')
      expect(products.length).toBeGreaterThan(0)
      expect(products.every((p: any) => p.readyToShip === true)).toBe(true)
    })

    it('filters by category when specified', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: { category: 'rings' },
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(products.every((p: any) => p.category === 'rings')).toBe(true)
    })

    it('filters by price max when specified', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: { priceMax: 400 },
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(products.every((p: any) => p.price <= 400)).toBe(true)
    })

    it('filters by price min when specified', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: { priceMin: 400 },
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(products.every((p: any) => p.price >= 400)).toBe(true)
    })

    it('filters by metal when specified', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: { metal: 'yellow-gold' },
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(products.every((p: any) => p.metal === 'yellow-gold')).toBe(true)
    })

    it('handles empty results gracefully', async () => {
      const result = await runIntent('find_product', {
        action: 'submit-product-filters',
        filters: { priceMax: 10 },
      })

      const moduleMessage = result.messages.find((m) => m.type === 'module')
      const products = (moduleMessage?.payload as any)?.products ?? []

      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBe(0)
    })
  })

  describe('track_order intent', () => {
    it('returns order lookup module when no lookup submitted', async () => {
      const result = await runIntent('track_order')

      expect(result.messages).toHaveLength(2)
      const moduleMessage = result.messages.find((m) => m.type === 'module')
      expect((moduleMessage?.payload as any)?.type).toBe('order-lookup')
    })
  })

  describe('return_exchange intent', () => {
    it('returns return options module', async () => {
      const result = await runIntent('return_exchange')

      expect(result.messages).toHaveLength(2)
      const moduleMessage = result.messages.find((m) => m.type === 'module')
      expect((moduleMessage?.payload as any)?.type).toBe('return-options')
    })
  })

  describe('stylist_contact intent', () => {
    it('returns escalation form module', async () => {
      const result = await runIntent('stylist_contact')

      expect(result.messages).toHaveLength(2)
      const moduleMessage = result.messages.find((m) => m.type === 'module')
      expect((moduleMessage?.payload as any)?.type).toBe('escalation-form')
    })
  })

  describe('care_warranty intent', () => {
    it('returns informational response', async () => {
      const result = await runIntent('care_warranty')
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].role).toBe('concierge')
      expect(typeof result.messages[0].payload).toBe('string')
    })
  })
})

describe('getInitialMessages', () => {
  it('returns welcome message array', () => {
    const messages = getInitialMessages()
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].role).toBe('concierge')
  })
})
