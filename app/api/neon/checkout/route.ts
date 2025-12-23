import { NextResponse } from 'next/server'
import { prepareCheckoutSnapshot } from '@/services/neon/checkoutService'

export async function POST(request: Request) {
  const { cartId } = await request.json()

  if (!cartId || typeof cartId !== 'string') {
    return NextResponse.json({ success: false, error: 'cartId is required' }, { status: 400 })
  }

  const snapshot = await prepareCheckoutSnapshot(cartId)

  return NextResponse.json({ success: true, data: snapshot })
}
