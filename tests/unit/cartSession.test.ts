import { ensureCartIdCookie, getCartIdFromCookies } from '@/lib/cartSession'

const setSpy = jest.fn()
const getSpy = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: getSpy,
    set: setSpy,
  }),
}))

describe('cartSession', () => {
  let uuidSpy: jest.SpyInstance<string, []>

  beforeEach(() => {
    getSpy.mockReset()
    setSpy.mockReset()
    uuidSpy = jest.spyOn(global.crypto, 'randomUUID').mockReturnValue('generated-cart-id')
  })

  afterEach(() => {
    uuidSpy.mockRestore()
  })

  it('reads the cart id from cookies when present', () => {
    getSpy.mockReturnValueOnce({ value: 'existing-cart-id' })
    expect(getCartIdFromCookies()).toBe('existing-cart-id')
  })

  it('returns undefined when cart cookie is missing', () => {
    getSpy.mockReturnValueOnce(undefined)
    expect(getCartIdFromCookies()).toBeUndefined()
  })

  it('creates a new cart id when none exists', () => {
    getSpy.mockReturnValueOnce(undefined)

    const cartId = ensureCartIdCookie()

    expect(cartId).toBe('generated-cart-id')
    expect(setSpy).toHaveBeenCalledWith(
      'neon_cart_id',
      'generated-cart-id',
      expect.objectContaining({
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
      }),
    )
  })

  it('reuses existing cart id without setting a new cookie', () => {
    getSpy.mockReturnValueOnce({ value: 'existing-cart-id' })

    const cartId = ensureCartIdCookie()

    expect(cartId).toBe('existing-cart-id')
    expect(setSpy).not.toHaveBeenCalled()
  })
})
