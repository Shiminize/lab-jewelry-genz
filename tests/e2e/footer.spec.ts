import { expect, test } from '@playwright/test'

test('footer newsletter and info blocks render', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()

  const links = ['Privacy Policy', 'Terms & Conditions', 'Shipping & Returns', 'Contact', 'Instagram']
  for (const link of links) {
    await expect(page.getByRole('link', { name: link })).toBeVisible()
  }

  await expect(page.getByText('5-15-2 Jingumae')).toBeVisible()
  await expect(page.getByRole('link', { name: 'online@shiharalab.com' })).toBeVisible()
})
