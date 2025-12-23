import {
  addItemToCart,
  clearCart,
  getCart,
  removeItemFromCart,
  calculateCartTotals,
} from '@/services/neon/cartService'
import { getProductDetail } from '@/services/neon/productService'

jest.mock('@/lib/mongodb', () => {
  const carts = new Map<string, any>()

  return {
    getDatabase: async () => ({
      collection: () => ({
        findOne: async ({ _id }: { _id: string }) => carts.get(_id) ?? null,
        updateOne: async ({ _id }: { _id: string }, update: any, options?: any) => {
          const existing = carts.get(_id) ?? { _id, items: [], createdAt: new Date(), updatedAt: new Date() }
          const next = { ...existing }

          if (update.$set) {
            Object.assign(next, update.$set)
          }
          if (update.$setOnInsert && options?.upsert && !carts.has(_id)) {
            Object.assign(next, update.$setOnInsert)
          }

          carts.set(_id, next)
        },
      }),
    }),
  }
})

jest.mock('@/services/neon/productService', () => ({
  getProductDetail: jest.fn(async (slug: string) => ({
    slug,
    name: slug.replace(/-/g, ' '),
    price: 1200,
    tone: 'volt',
    heroImage: '/images/placeholder-product.jpg',
  })),
}))

describe('cartService', () => {
  const mockedGetProductDetail = getProductDetail as jest.MockedFunction<typeof getProductDetail>

  beforeEach(async () => {
    await clearCart('test-cart')
    mockedGetProductDetail.mockClear()
  })

  it('creates a cart on first add', async () => {
    const cart = await addItemToCart('test-cart', 'prism-flux-ring', 2)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ slug: 'prism-flux-ring', quantity: 2 })
  })

  it('increments quantity when adding duplicate items', async () => {
    await addItemToCart('test-cart', 'prism-flux-ring', 1)
    const cart = await addItemToCart('test-cart', 'prism-flux-ring', 3)
    expect(cart.items[0]?.quantity).toBe(4)
  })

  it('throws when attempting to add a non-positive quantity', async () => {
    await expect(addItemToCart('test-cart', 'prism-flux-ring', 0)).rejects.toThrow('Quantity must be greater than zero')
  })

  it('falls back to placeholder metadata when product detail lookup fails', async () => {
    mockedGetProductDetail.mockResolvedValueOnce(null)

    const cart = await addItemToCart('test-cart', 'unknown-piece', 1)

    expect(cart.items[0]).toMatchObject({
      slug: 'unknown-piece',
      price: 0,
      heroImage: '/images/placeholder-product.jpg',
    })
  })

  it('removes items from the cart', async () => {
    await addItemToCart('test-cart', 'prism-flux-ring', 1)
    await addItemToCart('test-cart', 'nova-arc-earrings', 1)
    const cart = await removeItemFromCart('test-cart', 'prism-flux-ring')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.slug).toBe('nova-arc-earrings')
  })

  it('ignores remove requests for slugs not in the cart', async () => {
    await addItemToCart('test-cart', 'prism-flux-ring', 1)
    const cart = await removeItemFromCart('test-cart', 'non-existent')
    expect(cart.items).toHaveLength(1)
  })

  it('falls back to empty cart when cart id has no data', async () => {
    const cart = await getCart('empty-cart')
    expect(cart.items).toHaveLength(0)
  })

  it('calculates cart totals correctly', async () => {
    await addItemToCart('calc-cart', 'prism-flux-ring', 2)
    await addItemToCart('calc-cart', 'nova-arc-earrings', 1)
    const cart = await getCart('calc-cart')
    const totals = calculateCartTotals(cart)
    expect(totals.itemCount).toBe(3)
    expect(totals.subtotal).toBe(1200 * 3)
  })

  it('clears the cart while preserving initial creation timestamp', async () => {
    await addItemToCart('test-cart', 'prism-flux-ring', 1)
    const seededCart = await getCart('test-cart')
    const createdAt = seededCart.createdAt

    const cleared = await clearCart('test-cart')
    expect(cleared.items).toHaveLength(0)
    expect(cleared.createdAt.toISOString()).toBe(createdAt.toISOString())
  })
})
