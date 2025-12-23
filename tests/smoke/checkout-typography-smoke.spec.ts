import { test, expect } from '../fixtures'

const toLower = (value: string) => value.toLowerCase()

const expectFontFamily = (fontFamily: string, tokens: string[]) => {
  const lower = toLower(fontFamily)
  expect(
    tokens.some((token) => lower.includes(token)),
    `Expected "${fontFamily}" to include one of: ${tokens.join(', ')}`,
  ).toBeTruthy()
}

test.describe('Checkout typography', () => {
  test('Editorial Glow scale on checkout hero + checklist', async ({ page }) => {
    const response = await page.request.post('/api/neon/cart')
    expect(response.ok()).toBeTruthy()
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' })

    const heading = page.locator('text=/Secure your GlowGlitch capsule/i').first()
    await expect(heading).toBeVisible()
    const headingFont = await heading.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(headingFont, ['__dm_serif_display', 'dm serif display', 'commissioner'])

    const checklistHeading = page.locator('text=/How checkout works today/i').first()
    await expect(checklistHeading).toBeVisible()
    const checklistHeadingFont = await checklistHeading.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(checklistHeadingFont, ['__manrope', 'manrope', 'commissioner'])

    const checklistItem = page.getByText('Share your preferred contact details', { exact: false }).first()
    await expect(checklistItem).toBeVisible()
    const checklistBodyFont = await checklistItem.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(checklistBodyFont, ['__manrope', 'manrope', 'commissioner'])
  })
})
