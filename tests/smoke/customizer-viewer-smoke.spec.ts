import { test, expect } from '../fixtures'

const toLower = (value: string) => value.toLowerCase()

const expectFontFamily = (fontFamily: string, tokens: string[]) => {
  const lower = toLower(fontFamily)
  expect(
    tokens.some((token) => lower.includes(token)),
    `Expected "${fontFamily}" to include one of: ${tokens.join(', ')}`,
  ).toBeTruthy()
}

test.describe('Customizer GLB viewer smoke', () => {
  test('renders Coral & Sky variant list and manifest data', async ({ page }) => {
    const disallowedHosts = new Set(['modelviewer.dev'])
    const remoteRequests: string[] = []

    page.on('requestfinished', (request) => {
      try {
        const url = new URL(request.url())
        if (disallowedHosts.has(url.hostname)) {
          remoteRequests.push(request.url())
        }
      } catch (error) {
        // Ignore malformed URLs (e.g., data URIs)
      }
    })

    await page.goto('/customizer', { waitUntil: 'domcontentloaded' })

    const heroHeading = page
      .getByText('Design rings, necklaces, bracelets, and earrings in real time')
      .first()
    await expect(heroHeading).toBeVisible()
    const heroHeadingFont = await heroHeading.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(heroHeadingFont, ['__dm_serif_display', 'dm serif display', 'commissioner'])

    const heroBody = page
      .getByText(
        'Bring every jewelry story to life with our 3D customizer. Mix metals, experiment with gemstone palettes, and showcase layered looks across necklaces, bracelets, earrings, and rings—all rendered with the Aurora/Neon design language.',
      )
      .first()
    await expect(heroBody).toBeVisible()
    const heroBodyFont = await heroBody.evaluate((node) => getComputedStyle(node).fontFamily)
    expectFontFamily(heroBodyFont, ['__manrope', 'manrope', 'commissioner'])

    await expect(page.getByText('GLB • Coral Sky')).toBeVisible()
    await expect(page.getByText('Guide the jewelry storytelling flow')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Astronaut Demo' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ring Luxury 001' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ring Classic 002' }).first()).toBeVisible()

    const priceTotal = page.getByTestId('price-total')
    const priceBase = page.getByTestId('price-base')

    const initialTotal = (await priceTotal.textContent())?.trim() ?? ''
    const initialBase = (await priceBase.textContent())?.trim() ?? ''

    await expect(priceTotal).toContainText('$')
    await expect(priceBase).toContainText('$')

    await page.getByRole('button', { name: 'Ring Luxury 001' }).first().click()
    await expect(priceTotal).not.toHaveText(initialTotal, { timeout: 5000 })
    await expect(priceBase).not.toHaveText(initialBase, { timeout: 5000 })

    const secondTotal = (await priceTotal.textContent())?.trim() ?? ''
    const secondBase = (await priceBase.textContent())?.trim() ?? ''

    await page.getByRole('button', { name: 'Ring Classic 002' }).first().click()
    await expect(priceTotal).not.toHaveText(secondTotal, { timeout: 5000 })
    await expect(priceBase).not.toHaveText(secondBase, { timeout: 5000 })

    expect(remoteRequests, `Remote GLB assets were requested: ${remoteRequests.join(', ')}`).toHaveLength(0)

    const pipelineCards = page.locator('li', { hasText: 'Start with your signature piece' })
    await expect(pipelineCards.first()).toBeVisible()

    const roadmapItem = page.getByText('Document the lookbook angles and copy for pendants and chokers', {
      exact: false,
    })
    await expect(roadmapItem).toBeVisible()
  })
})
