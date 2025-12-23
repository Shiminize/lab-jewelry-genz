import { test, expect } from '../fixtures'

const toLower = (value: string) => value.toLowerCase()

const expectFontFamily = (fontFamily: string, tokens: string[]) => {
  const lower = toLower(fontFamily)
  expect(
    tokens.some((token) => lower.includes(token)),
    `Expected "${fontFamily}" to include one of: ${tokens.join(', ')}`,
  ).toBeTruthy()
}

test.describe('Catalog to cart smoke', () => {
  test('adds and removes a sample capsule via cart APIs', async ({ page, context }) => {
    await context.clearCookies()

    const createResponse = await context.request.post('/api/neon/cart')
    expect(createResponse.ok()).toBeTruthy()
    const cartPayload = await createResponse.json()
    const cartId = cartPayload?.data?.cartId as string | undefined
    expect(cartId).toBeTruthy()

    const addResponse = await context.request.post(`/api/neon/cart/${cartId}`, {
      data: { slug: 'classic-solitaire', quantity: 1 },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(addResponse.ok()).toBeTruthy()

    await context.addCookies([
      {
        name: 'neon_cart_id',
        value: cartId!,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        sameSite: 'Lax',
      },
      {
        name: 'neon_cart_id',
        value: cartId!,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        sameSite: 'Lax',
      },
    ])

    await page.goto('/cart', { waitUntil: 'domcontentloaded' })

    const cartHeading = page.getByText('Your custom capsule lineup', { exact: false }).first()
    await expect(cartHeading).toBeVisible()
    const cartHeadingFont = await cartHeading.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(cartHeadingFont, ['__dm_serif_display', 'dm serif display', 'commissioner'])

    const cartBody = page.getByTestId('cart-hero-body')
    await expect(cartBody).toBeVisible()
    const cartBodyFont = await cartBody.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(cartBodyFont, ['__manrope', 'manrope', 'commissioner'])

    const cartCount = page.getByTestId('cart-summary-count')
    await expect(cartCount).toHaveText(/\d+/, { timeout: 15000 })

    const removeButton = page.getByTestId('remove-from-cart-classic-solitaire')
    if (await removeButton.count()) {
      await removeButton.first().click()
      await expect(cartCount).toHaveText('0', { timeout: 15000 })
    }
  })
})
