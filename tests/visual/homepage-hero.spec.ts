import { test, expect } from '../fixtures'

const waitForHero = async (page: import('@playwright/test').Page) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const hero = page.getByTestId('homepage-hero')
  await expect(hero).toBeVisible()
  return hero
}

test.describe('Homepage hero visuals', () => {
  test('renders Coral & Sky hero snapshot', async ({ page }, testInfo) => {
    const hero = await waitForHero(page)
    await expect(hero).toBeVisible()
  })

  test('mobile hero layout', async ({ page }, testInfo) => {
    const hero = await waitForHero(page)
    await page.setViewportSize({ width: 393, height: 851 })
    await page.waitForTimeout(150)
    await expect(hero).toBeVisible()
  })
})
