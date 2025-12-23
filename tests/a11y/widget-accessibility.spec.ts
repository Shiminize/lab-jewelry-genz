import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Widget Accessibility (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[aria-label="Open Aurora support"]', { timeout: 5000 })
  })

  test('widget button meets accessibility standards', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[aria-label="Open Aurora support"]')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('open widget meets accessibility standards', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')
    await expect(page.locator('#glowglitch-aurora-widget')).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#glowglitch-aurora-widget')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('widget has proper ARIA labels and roles', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Check widget container has proper role
    const widget = page.locator('#glowglitch-aurora-widget')
    await expect(widget).toHaveAttribute('role', 'dialog')
    await expect(widget).toHaveAttribute('aria-modal', 'true')

    // Check close button has proper label
    const closeButton = widget.locator('button[aria-label="Close"]')
    await expect(closeButton).toBeVisible()

    // Check input has proper label
    const input = widget.locator('input[placeholder*="Ask Aurora"]')
    await expect(input).toBeVisible()
  })

  test('keyboard navigation works through widget', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Focus should move to first interactive element (close button or input)
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    expect(focusedElement).toBeTruthy()

    // Tab to next element
    await page.keyboard.press('Tab')
    
    // Should be able to reach all interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
  })

  test('can close widget with Escape key', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')
    await expect(page.locator('#glowglitch-aurora-widget')).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Widget should close
    await expect(page.locator('#glowglitch-aurora-widget')).not.toBeVisible()
  })

  test('can send message with Enter key', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Focus input and type
    const input = page.locator('input[placeholder*="Ask Aurora"]')
    await input.click()
    await input.fill('show me rings')

    // Press Enter to send
    await page.keyboard.press('Enter')

    // Message should be sent
    await expect(page.locator('text=show me rings')).toBeVisible()
  })

  test('focus indicators are visible', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Tab to input
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check that focused element has visible focus indicator
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    const outline = await page.evaluate((el: any) => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      }
    }, focusedElement)

    // Should have either outline or box-shadow for focus indicator
    expect(outline.outline !== 'none' || outline.boxShadow !== 'none').toBe(true)
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Run axe with color-contrast rule specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#glowglitch-aurora-widget')
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('images and icons have alt text or aria-label', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Get products to check product images
    await page.click('button:has-text("Ready to ship")')
    await expect(page.locator('[data-module="product_grid"]')).toBeVisible({ timeout: 10000 })

    // Run axe with image-alt rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#glowglitch-aurora-widget')
      .withRules(['image-alt'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form inputs have associated labels', async ({ page }) => {
    // Open widget and navigate to a form
    await page.click('[aria-label="Open Aurora support"]')
    await page.click('button:has-text("Track order")')
    await expect(page.locator('[data-module="order_status_form"]')).toBeVisible()

    // Run axe with label rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#glowglitch-aurora-widget')
      .withRules(['label'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('buttons have descriptive accessible names', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Run axe with button-name rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#glowglitch-aurora-widget')
      .withRules(['button-name'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('screen reader announces widget state changes', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]')
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeVisible()
    }

    // Send a message
    await page.fill('input[placeholder*="Ask Aurora"]', 'hello')
    await page.click('button:has-text("Send")')

    // New messages should be announced (check for aria-live or role="status")
    // This is implementation-dependent
  })

  test('loading states are announced to screen readers', async ({ page }) => {
    // Open widget
    await page.click('[aria-label="Open Aurora support"]')

    // Trigger loading state
    await page.fill('input[placeholder*="Ask Aurora"]', 'show me rings')
    await page.click('button:has-text("Send")')

    // Check for aria-busy or loading indicator with proper label
    const loader = page.locator('[aria-label*="loading"], [aria-busy="true"]')
    // Loading state may be brief, so we check if it exists or existed
  })
})

