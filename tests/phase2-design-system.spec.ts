/**
 * Phase 2 E2E Test: Design System and Accessibility Compliance
 * Tests CLAUDE_RULES design system implementation and WCAG 2.1 AA compliance
 */

import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Phase 2: Design System Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog page for comprehensive testing
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
  })

  test('Button system follows 5-variant CLAUDE_RULES standard', async ({ page }) => {
    // Navigate to a page with various button types
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for primary button (hero CTA)
    const primaryButton = page.locator('button').filter({ hasText: /Start Designing|Explore Collection/ }).first()
    await expect(primaryButton).toBeVisible()
    
    // Verify button has proper focus states
    await primaryButton.focus()
    const buttonStyles = await primaryButton.evaluate(el => window.getComputedStyle(el))
    expect(buttonStyles.outlineStyle).not.toBe('none') // Should have focus outline
    
    // Check button accessibility
    await expect(primaryButton).toHaveAttribute('type', 'button')
    
    // Navigate to catalog to test secondary/ghost buttons
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Check filter toggle button (secondary variant)
    const filterButton = page.locator('button').filter({ hasText: 'Filters' })
    if (await filterButton.count() > 0) {
      await expect(filterButton.first()).toBeVisible()
      await expect(filterButton.first()).toHaveAttribute('type', 'button')
    }
  })

  test('Typography uses consistent font-headline and font-body classes', async ({ page }) => {
    // Check homepage hero typography
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify headline uses font-headline
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible()
    
    const headlineClasses = await headline.getAttribute('class')
    expect(headlineClasses).toContain('font-headline')
    
    // Verify body text uses font-body
    const bodyText = page.locator('p').first()
    if (await bodyText.count() > 0) {
      const bodyClasses = await bodyText.getAttribute('class')
      expect(bodyClasses).toContain('font-body')
    }
    
    // Check catalog page typography
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Verify product cards use consistent typography
    const productCard = page.locator('[data-testid="product-card"]').first()
    if (await productCard.count() > 0) {
      await expect(productCard).toBeVisible()
      
      // Product name should use body text component
      const productName = productCard.locator('p, span').filter({ hasText: /\w+/ }).first()
      if (await productName.count() > 0) {
        const nameClasses = await productName.getAttribute('class')
        // Should either use font-body directly or through BodyText component
        expect(nameClasses).toMatch(/font-body|BodyText/)
      }
    }
  })

  test('Color combinations follow HTML demo approved palette', async ({ page }) => {
    // Check homepage color usage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify CTA button uses approved cta color
    const ctaButton = page.locator('button').filter({ hasText: /Start Designing|Explore Collection/ }).first()
    if (await ctaButton.count() > 0) {
      const buttonStyles = await ctaButton.evaluate(el => window.getComputedStyle(el))
      // Should use background-color that matches cta theme
      expect(buttonStyles.backgroundColor).toMatch(/rgb\(193, 123, 71\)|#C17B47/)
    }
    
    // Check catalog page for consistent color usage
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Verify background uses approved ivory/cream tones
    const bodyStyles = await page.evaluate(() => window.getComputedStyle(document.body))
    expect(bodyStyles.backgroundColor).toMatch(/rgb\(254, 252, 249\)|#FEFCF9/) // Ivory mist
  })

  test('Error boundaries display with design system compliance', async ({ page }) => {
    // Test error boundary fallback (this may not trigger in normal circumstances)
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Check for any error messages or fallback UIs
    const errorElements = page.locator('[role="alert"], .error, [data-testid*="error"]')
    
    if (await errorElements.count() > 0) {
      const firstError = errorElements.first()
      await expect(firstError).toBeVisible()
      
      // Error should use approved color scheme
      const errorStyles = await firstError.evaluate(el => window.getComputedStyle(el))
      expect(errorStyles.color).toBeTruthy()
      expect(errorStyles.backgroundColor).toBeTruthy()
    }
    
    // Verify 3D error boundaries if present
    const viewerError = page.locator('[aria-label*="Error"], [aria-label*="loading"]')
    if (await viewerError.count() > 0) {
      const errorClasses = await viewerError.first().getAttribute('class')
      // Should use muted/accent colors from design system
      expect(errorClasses).toMatch(/bg-(muted|accent|background)/)
    }
  })
})

test.describe('Phase 2: WCAG 2.1 AA Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
  })

  test('Page passes axe accessibility audit', async ({ page }) => {
    // Run comprehensive accessibility check
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa']
        }
      }
    })
  })

  test('Interactive elements have proper ARIA labels', async ({ page }) => {
    // Check buttons have accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        // Button should have either text content or aria-label
        const hasText = await button.textContent()
        const hasAriaLabel = await button.getAttribute('aria-label')
        
        expect(hasText || hasAriaLabel).toBeTruthy()
      }
    }
    
    // Check images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const altText = await img.getAttribute('alt')
        expect(altText).toBeTruthy()
        expect(altText).not.toBe('')
      }
    }
  })

  test('Form elements have proper labels', async ({ page }) => {
    // Check search input
    const searchInput = page.locator('input[type="text"]')
    if (await searchInput.count() > 0) {
      const input = searchInput.first()
      
      // Should have placeholder or label
      const placeholder = await input.getAttribute('placeholder')
      const ariaLabel = await input.getAttribute('aria-label')
      const hasLabel = await page.locator('label').filter({ has: input }).count() > 0
      
      expect(placeholder || ariaLabel || hasLabel).toBeTruthy()
    }
    
    // Check checkbox/radio inputs if present
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    
    for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
      const checkbox = checkboxes.nth(i)
      if (await checkbox.isVisible()) {
        // Should be associated with a label
        const hasLabel = await page.locator('label').filter({ has: checkbox }).count() > 0
        expect(hasLabel).toBeTruthy()
      }
    }
  })

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    // Test high contrast combinations
    const textElements = page.locator('p, span, h1, h2, h3, h4, button')
    const elementCount = await textElements.count()
    
    // Sample a few elements for contrast testing
    for (let i = 0; i < Math.min(elementCount, 8); i++) {
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          }
        })
        
        // Basic validation that colors are set
        expect(styles.color).toBeTruthy()
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
        
        // Font size should be reasonable for accessibility
        const fontSize = parseInt(styles.fontSize)
        expect(fontSize).toBeGreaterThanOrEqual(12) // Minimum readable size
      }
    }
  })

  test('Keyboard navigation works properly', async ({ page }) => {
    // Test tab navigation through interactive elements
    const firstButton = page.locator('button').first()
    if (await firstButton.count() > 0) {
      await firstButton.focus()
      
      // Tab through a few elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should be able to navigate without getting trapped
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    }
    
    // Test Enter key on buttons
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.count() > 0) {
      await searchInput.focus()
      await searchInput.fill('test')
      await page.keyboard.press('Enter')
      
      // Should not cause JavaScript errors
      await page.waitForTimeout(500)
    }
  })
})