import { NextResponse } from 'next/server'
import { CART_COOKIE_NAME } from '@/lib/cartSession'

export async function POST() {
  const cartId = crypto.randomUUID()
  const response = NextResponse.json({ success: true, data: { cartId } })
  response.cookies.set({
    name: CART_COOKIE_NAME,
    value: cartId,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
