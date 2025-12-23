import { cookies } from 'next/headers'

export const CART_COOKIE_NAME = 'neon_cart_id'
const CART_COOKIE = CART_COOKIE_NAME

export function getCartIdFromCookies(): string | undefined {
  const cartCookie = cookies().get(CART_COOKIE)
  return cartCookie?.value
}

export function ensureCartIdCookie(): string {
  const store = cookies()
  const existing = store.get(CART_COOKIE)
  if (existing?.value) {
    return existing.value
  }

  const cartId = crypto.randomUUID()
  store.set(CART_COOKIE, cartId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  return cartId
}
