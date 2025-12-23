import { test, expect } from '../fixtures'

test.describe('Homepage Coral Sky option', () => {
  test('renders hero and featured strip with fallbacks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const heroHeading = page.getByRole('heading', { level: 1, name: 'MAKE IT YOURS.' })
    await expect(heroHeading).toBeVisible()

    const primaryCta = page.getByText('Start Designing', { exact: false }).first()
    const secondaryCta = page.getByText('View Collection', { exact: false }).first()
    await expect(primaryCta).toBeVisible()
    await expect(secondaryCta).toBeVisible()

    const heroStats = page.getByTestId('hero-stats-strip')
    await expect(heroStats.locator('dd')).toHaveCount(3)

    const heroFeaturedStrip = page.getByTestId('hero-featured-strip')
    const tiles = heroFeaturedStrip.locator('a')
    await expect(tiles).toHaveCount(3)

    const firstTile = tiles.nth(0)
    await expect(firstTile).toBeVisible()
    await expect(firstTile.locator('img')).toBeVisible()

    const secondTile = tiles.nth(1)
    await expect(secondTile).toBeVisible()
    await expect(secondTile.locator('img')).toBeVisible()

    const thirdTile = tiles.nth(2)
    await expect(thirdTile).toBeVisible()
    // third tile can be placeholder; allow either image or fallback text
    const thirdImgCount = await thirdTile.locator('img').count()
    if (thirdImgCount === 0) {
      await expect(thirdTile.getByText(/Preview coming soon/i)).toBeVisible()
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(100)
    const statItemTops = await heroStats
      .locator('div')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top))
    expect(statItemTops[1]).toBeGreaterThan(statItemTops[0])
  })
})
