import { NextResponse } from 'next/server'
import { addItemToCart, getCart, removeItemFromCart, clearCart, updateCartItemQuantity } from '@/services/neon'

interface RouteContext {
  params: { cartId: string }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const cart = await getCart(params.cartId)
  return NextResponse.json({ success: true, data: cart })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug, quantity = 1 } = await request.json()

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 })
  }

  const cart = await addItemToCart(params.cartId, slug, Number(quantity) || 1)
  return NextResponse.json({ success: true, data: cart })
}

export async function DELETE(request: Request, { params }: RouteContext) {
  let payload: any = null
  try {
    payload = await request.json()
  } catch (error) {
    // Ignore empty body
  }

  const slug = payload?.slug

  if (typeof slug === 'string' && slug.length > 0) {
    const cart = await removeItemFromCart(params.cartId, slug)
    return NextResponse.json({ success: true, data: cart })
  }

  const cart = await clearCart(params.cartId)
  return NextResponse.json({ success: true, data: cart })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { slug, quantity } = await request.json()

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 })
  }

  if (typeof quantity !== 'number' && typeof quantity !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing quantity' }, { status: 400 })
  }

  const nextQuantity = Number(quantity)

  if (Number.isNaN(nextQuantity)) {
    return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 })
  }

  const cart = await updateCartItemQuantity(params.cartId, slug, nextQuantity)
  return NextResponse.json({ success: true, data: cart })
}
