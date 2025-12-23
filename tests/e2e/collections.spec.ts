import { expect, test } from '@playwright/test'

const parsePrice = (text: string | undefined) => {
  const digits = (text || '').replace(/[^0-9]/g, '')
  return Number(digits || '0')
}

test('collections filters and sorting', async ({ page }) => {
  await page.goto('/collections')

  await expect(page.getByText('Filter by')).toBeVisible()

  const cards = page.locator('[data-testid="collection-card"]')
  expect(await cards.count()).toBeGreaterThanOrEqual(6)

  const inStock = page.getByRole('checkbox', { name: 'In stock' })
  const outOfStock = page.getByRole('checkbox', { name: 'Out of stock' })

  await inStock.check()
  await outOfStock.uncheck()
  await page.getByLabel('Sort by').selectOption('price-asc')
  await page.getByRole('button', { name: 'Apply' }).click()
  await page.waitForFunction(() => document.querySelectorAll('[data-testid="collection-price"]').length > 1)

  await expect(page).toHaveURL(/availability=in-stock/)
  await expect(page).toHaveURL(/sort=price-asc/)

  const ascPrices = await page.locator('[data-testid="collection-price"]').allTextContents()
  expect(ascPrices.length).toBeGreaterThan(1)
  const ascNumeric = ascPrices.map(parsePrice)
  expect(ascNumeric).toEqual([...ascNumeric].sort((a, b) => a - b))

  await inStock.uncheck()
  await outOfStock.check()
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Sold out').first()).toBeVisible()

  await inStock.check()
  await outOfStock.check()
  await page.getByLabel('Sort by').selectOption('price-desc')
  await page.getByRole('button', { name: 'Apply' }).click()
  await page.waitForFunction(() => document.querySelectorAll('[data-testid="collection-price"]').length > 1)
  await expect(page).toHaveURL(/sort=price-desc/)

  const descPrices = await page.locator('[data-testid="collection-price"]').allTextContents()
  expect(descPrices.length).toBeGreaterThan(1)
  const descNumeric = descPrices.map(parsePrice)
  expect(descNumeric).toEqual([...descNumeric].sort((a, b) => b - a))

  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(page).not.toHaveURL(/availability=/)
  await expect(page).not.toHaveURL(/sort=/)
})
