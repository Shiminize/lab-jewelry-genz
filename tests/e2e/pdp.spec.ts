import { expect, test } from '@playwright/test'

test('pdp displays product content and layout sections', async ({ page }) => {
  await page.goto('/products/celestial-halo-ring')

  await expect(page.getByRole('heading', { name: 'Celestial Halo Ring' })).toBeVisible()
  await expect(page.getByText('Tax included. Shipping calculated at checkout.')).toBeVisible()

  const price = page.getByTestId('pdp-price')
  await expect(price).toContainText('129')

  const galleryImages = page.locator('[data-testid="pdp-gallery"] img')
  expect(await galleryImages.count()).toBeGreaterThan(1)

  await expect(page.getByRole('heading', { name: 'Design Story' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Materials' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dimensions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Highlights' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Care Notes' })).toBeVisible()

  await expect(page.getByRole('button', { name: 'Reserve this piece' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Contact concierge' })).toHaveAttribute('href', /mailto:/)
})
