import { expect, test } from '@playwright/test'

test('navbar IA and interactions', async ({ page }) => {
  await page.goto('/')

  const header = page
    .getByRole('banner')
    .filter({ has: page.getByRole('link', { name: 'GlowGlitch' }) })
  await expect(header).toBeVisible()

  const brandLink = header.getByRole('link', { name: 'GlowGlitch' })
  await expect(brandLink).toBeVisible()

  const primaryNav = header.getByRole('navigation', { name: 'Primary navigation' })
  await expect(primaryNav).toBeVisible()

  const discoverTrigger = primaryNav.getByRole('button', { name: 'Discover' })
  await discoverTrigger.hover()

  const discoverPanel = page.getByRole('region', { name: 'Discover menu' })
  await expect(discoverPanel).toBeVisible()

  const storyLink = discoverPanel.getByRole('link', { name: 'Story', exact: true })
  await expect(storyLink).toBeVisible()

  await discoverTrigger.focus()
  await page.keyboard.press('Escape')
  await expect(discoverPanel).toBeHidden()

  const shopTrigger = primaryNav.getByRole('button', { name: 'Shop' })
  await shopTrigger.click()
  const shopPanel = page.getByRole('region', { name: 'Shop menu' })
  await expect(shopPanel).toBeVisible()
  await expect(shopPanel.getByRole('link', { name: 'Featured', exact: true })).toBeVisible()

  const signIn = header.getByRole('link', { name: 'Sign in' })
  await expect(signIn).toBeVisible()

  const startCustomizing = header.getByRole('button', { name: 'Start customizing' })
  await expect(startCustomizing).toBeVisible()
})
