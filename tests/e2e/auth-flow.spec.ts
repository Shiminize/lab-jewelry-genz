import { expect, test } from '@playwright/test'

test.describe('auth flows', () => {
  test('forgot password request shows confirmation', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByText('Forgot your password?', { exact: false })).toBeVisible()
    const form = page.getByRole('form', { name: 'Account recovery form' })
    await form.getByLabel('Email address').fill('nobody@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByText('If an account exists for')).toBeVisible()
  })

  test('account page redirects when signed out', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })
})
