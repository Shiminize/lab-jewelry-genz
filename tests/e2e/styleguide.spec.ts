import { expect, test } from '@playwright/test'

test('style guide renders primitives', async ({ page }) => {
  await page.goto('/style-guide')
  await expect(page.getByRole('heading', { name: 'Style Guide — Primitives' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Primary' })).toBeVisible()
  await expect(page.getByText('Default').first()).toBeVisible()
  await expect(page.getByText(/Regular price ¥/).first()).toBeVisible()
})
