import { createCheckoutIntent } from '@/services/neon/checkoutService'

describe('checkoutService', () => {
  it('returns a pending checkout intent stub', async () => {
    const intent = await createCheckoutIntent('cart-123', 4200)
    expect(intent).toMatchObject({ cartId: 'cart-123', amount: 4200, status: 'pending' })
  })
})
