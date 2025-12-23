import { test, expect } from '../fixtures'

const toLower = (value: string) => value.toLowerCase()

const expectFontFamily = (computed: string, identifiers: string[]) => {
  const lower = toLower(computed)
  expect(
    identifiers.some((identifier) => lower.includes(identifier)),
    `Expected font family "${computed}" to include one of: ${identifiers.join(', ')}`,
  ).toBeTruthy()
}

test.describe('Coral Sky typography', () => {
  test('collections hero uses Petrona + Commissioner stacks', async ({ page }) => {
    await page.goto('/collections', { waitUntil: 'domcontentloaded' })

    const heroHeading = page.getByTestId('catalog-hero-heading')
    const headingFont = await heroHeading.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(headingFont, ['petrona', 'commissioner'])

    const heroBody = page.getByTestId('catalog-hero-body')
    const bodyFont = await heroBody.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(bodyFont, ['commissioner', 'manrope'])
  })

  test('product detail applies Petrona + Urbanist + Commissioner', async ({ page }) => {
    await page.goto('/products/celestial-halo-ring', { waitUntil: 'domcontentloaded' })

    const brand = page.locator('text=Glow Atelier').first()
    await expect(brand).toBeVisible()
    const brandFont = await brand.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(brandFont, ['urbanist'])

    const price = page.getByTestId('pdp-price')
    const priceFont = await price.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(priceFont, ['petrona'])

    const description = page.locator('[class*="description"]').first()
    const descriptionFont = await description.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(descriptionFont, ['commissioner'])
  })
})
