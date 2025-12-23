import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Aurora Concierge smoke', () => {
  test('ready-to-ship → shortlist → track order → return → stylist → csat', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const widgetButton = page.getByRole('button', { name: /Ask Aurora Concierge/i })
    await widgetButton.click()
    const widget = page.locator('#glowglitch-aurora-widget')
    await expect(widget).toBeVisible()

    // Ready to ship quick link
    await widget.getByRole('button', { name: /Ready to ship/i }).click()
    await widget.getByText(/Here are ready-to-ship pieces/i).waitFor({ timeout: 20000 })

    // Save first product to shortlist
    const saveButtons = widget.getByRole('button', { name: /Save to shortlist/i })
    await saveButtons.first().click()
    await widget.getByText(/You now have 1 item saved/i).waitFor({ timeout: 15000 })

    // Track order
    await widget.getByRole('button', { name: /Track my order/i }).click()
    await widget.getByPlaceholder('GG-12345').fill('GG-12345')
    await widget.getByRole('button', { name: /Check status/i }).click()
    await widget.getByText(/Here’s your latest order status/i).waitFor({ timeout: 20000 })

    // Returns/resizing
    await widget.getByRole('button', { name: /Returns & resizing/i }).click()
    await widget.getByRole('button', { name: /Start a return/i }).click()
    await widget.getByText(/Need help fine-tuning the plan?/i).waitFor({ timeout: 15000 })

    // Stylist escalation
    await widget.getByPlaceholder('you@example.com').fill('smoke@example.com')
    await widget.getByPlaceholder(/Your name/i).fill('Smoke Test')
    await widget.getByRole('button', { name: /Invite stylist|Send my request/i }).first().click()
    await widget.getByText(/Was this handoff helpful\?|How did Aurora do today\?/i).waitFor({ timeout: 15000 })

    // CSAT (click Great/👍 if present)
    const csatButton = widget.getByRole('button', { name: /Great|👍/ })
    if (await csatButton.count()) {
      await csatButton.first().click()
    }

    // Verify shortlist drawer still reachable
    await widget.getByRole('button', { name: /Shortlist \\(1\\)/i }).first().click({ force: true })
    await widget.getByRole('button', { name: /Go to checkout/i }).first().waitFor({ timeout: 10000 })
  })
})
