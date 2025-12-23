export interface CheckoutIntent {
  cartId: string
  amount: number
  currency: 'USD'
  status: 'pending' | 'requires_payment_method' | 'requires_confirmation'
}

export async function createCheckoutIntent(cartId: string, amount: number): Promise<CheckoutIntent> {
  // Stripe integration will land in Phase 4 – return stub for now
  return {
    cartId,
    amount,
    currency: 'USD',
    status: 'pending',
  }
}

export async function confirmCheckoutIntent(_intentId: string): Promise<void> {
  // Placeholder for payment confirmation step
}

export async function prepareCheckoutSnapshot(cartId: string) {
  const { getCart, calculateCartTotals } = await import('./cartService')
  const cart = await getCart(cartId)
  const totals = calculateCartTotals(cart)
  const intent = await createCheckoutIntent(cartId, totals.subtotal)
  return { cart, totals, intent }
}
