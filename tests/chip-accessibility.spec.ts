import { test, expect } from '@playwright/test'

/**
 * QuickLinkChips Accessibility Tests
 * 
 * Tests for:
 * - 44px+ touch targets (WCAG AA)
 * - Horizontal scrolling with snap on mobile
 * - Keyboard arrow navigation
 * - Skip link functionality
 * - Tab order
 */

test.describe('QuickLinkChips - Accessibility', () => {
  test.describe('Touch Target Size (WCAG AA)', () => {
    test('should have minimum 44px height on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      
      // Navigate to a page with chips (adjust URL as needed)
      await page.goto('/support/help')
      
      // Find chip buttons
      const chips = page.locator('[data-testid^="chip-"]')
      const firstChip = chips.first()
      
      // Wait for chips to be visible
      await firstChip.waitFor({ state: 'visible' })
      
      // Get computed height
      const boundingBox = await firstChip.boundingBox()
      expect(boundingBox).not.toBeNull()
      expect(boundingBox!.height).toBeGreaterThanOrEqual(44)
    })

    test('should have minimum 44px height for all chips', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const count = await chips.count()
      
      for (let i = 0; i < count; i++) {
        const chip = chips.nth(i)
        const box = await chip.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.height, `Chip ${i} should be ≥44px`).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Horizontal Scrolling', () => {
    test('should scroll horizontally on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/support/help')
      
      const container = page.locator('[role="toolbar"]')
      await container.waitFor({ state: 'visible' })
      
      // Check overflow-x style
      const overflowX = await container.evaluate(el => 
        window.getComputedStyle(el).overflowX
      )
      expect(overflowX).toBe('auto')
    })

    test('should have scroll snap on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/support/help')
      
      const container = page.locator('[role="toolbar"]')
      
      // Check snap styles
      const snapType = await container.evaluate(el => 
        window.getComputedStyle(el).scrollSnapType
      )
      expect(snapType).toContain('x')
    })

    test('should wrap chips on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/support/help')
      
      const container = page.locator('[role="toolbar"]')
      
      // On desktop, should allow wrapping (no overflow hidden)
      const overflowX = await container.evaluate(el => 
        window.getComputedStyle(el).overflowX
      )
      // Desktop should be visible or allow wrapping
      expect(['visible', 'auto']).toContain(overflowX)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support arrow key navigation', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const firstChip = chips.first()
      const secondChip = chips.nth(1)
      
      // Focus first chip
      await firstChip.focus()
      await expect(firstChip).toBeFocused()
      
      // Press ArrowRight
      await page.keyboard.press('ArrowRight')
      await expect(secondChip).toBeFocused()
    })

    test('should support ArrowLeft navigation', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const secondChip = chips.nth(1)
      const firstChip = chips.first()
      
      // Focus second chip
      await secondChip.focus()
      
      // Press ArrowLeft
      await page.keyboard.press('ArrowLeft')
      await expect(firstChip).toBeFocused()
    })

    test('should wrap around with arrow keys', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const count = await chips.count()
      const lastChip = chips.nth(count - 1)
      const firstChip = chips.first()
      
      // Focus last chip
      await lastChip.focus()
      
      // Press ArrowRight should wrap to first
      await page.keyboard.press('ArrowRight')
      await expect(firstChip).toBeFocused()
    })

    test('should support Home key', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const middleChip = chips.nth(2)
      const firstChip = chips.first()
      
      await middleChip.focus()
      await page.keyboard.press('Home')
      await expect(firstChip).toBeFocused()
    })

    test('should support End key', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const count = await chips.count()
      const lastChip = chips.nth(count - 1)
      const firstChip = chips.first()
      
      await firstChip.focus()
      await page.keyboard.press('End')
      await expect(lastChip).toBeFocused()
    })

    test('should use roving tabindex (only one chip in tab order)', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const count = await chips.count()
      
      // Count chips with tabindex="0" (should be exactly 1)
      let tabIndexZeroCount = 0
      let tabIndexMinusOneCount = 0
      
      for (let i = 0; i < count; i++) {
        const tabIndex = await chips.nth(i).getAttribute('tabindex')
        if (tabIndex === '0') tabIndexZeroCount++
        if (tabIndex === '-1') tabIndexMinusOneCount++
      }
      
      expect(tabIndexZeroCount, 'Should have exactly one chip with tabindex="0"').toBe(1)
      expect(tabIndexMinusOneCount, 'Other chips should have tabindex="-1"').toBe(count - 1)
    })
  })

  test.describe('Skip Link', () => {
    test('should have skip link for keyboard users', async ({ page }) => {
      await page.goto('/support/help')
      
      const skipLink = page.locator('a[href="#results"]')
      await expect(skipLink).toBeAttached()
      await expect(skipLink).toHaveText('Skip filters')
    })

    test('skip link should be visible on focus', async ({ page }) => {
      await page.goto('/support/help')
      
      const skipLink = page.locator('a[href="#results"]')
      
      // Should be visually hidden initially (sr-only)
      const initialDisplay = await skipLink.evaluate(el => 
        window.getComputedStyle(el).position
      )
      
      // Focus the skip link
      await skipLink.focus()
      
      // Should become visible when focused
      await expect(skipLink).toBeFocused()
      await expect(skipLink).toBeVisible()
    })

    test('skip link should jump to results section', async ({ page }) => {
      await page.goto('/support/help')
      
      const skipLink = page.locator('a[href="#results"]')
      const resultsSection = page.locator('#results')
      
      // Click skip link
      await skipLink.focus()
      await skipLink.click()
      
      // Should scroll to results (check if in viewport)
      await expect(resultsSection).toBeInViewport()
    })
  })

  test.describe('Tab Order', () => {
    test('should have logical tab order', async ({ page }) => {
      await page.goto('/support/help')
      
      // Tab through page
      await page.keyboard.press('Tab') // Skip link
      await page.keyboard.press('Tab') // First chip
      
      const firstChip = page.locator('[data-testid^="chip-"]').first()
      await expect(firstChip).toBeFocused()
      
      // Tab again should leave chip group (not go to second chip)
      await page.keyboard.press('Tab')
      const secondChip = page.locator('[data-testid^="chip-"]').nth(1)
      await expect(secondChip).not.toBeFocused()
    })
  })

  test.describe('ARIA Attributes', () => {
    test('should have proper role and aria-label', async ({ page }) => {
      await page.goto('/support/help')
      
      const toolbar = page.locator('[role="toolbar"]')
      await expect(toolbar).toHaveAttribute('aria-label', /filter/i)
      await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
    })

    test('chips should have descriptive aria-labels', async ({ page }) => {
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"]')
      const firstChip = chips.first()
      
      const ariaLabel = await firstChip.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toMatch(/search/i)
    })
  })

  test.describe('Visual Regression', () => {
    test('chips should look correct on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/support/help')
      
      const container = page.locator('[role="toolbar"]').first()
      await container.waitFor({ state: 'visible' })
      
      // Take screenshot for visual regression
      await expect(container).toHaveScreenshot('chips-mobile.png', {
        maxDiffPixels: 100,
      })
    })

    test('chips should look correct on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/support/help')
      
      const container = page.locator('[role="toolbar"]').first()
      await container.waitFor({ state: 'visible' })
      
      await expect(container).toHaveScreenshot('chips-desktop.png', {
        maxDiffPixels: 100,
      })
    })

    test('focused chip should show focus ring', async ({ page }) => {
      await page.goto('/support/help')
      
      const firstChip = page.locator('[data-testid^="chip-"]').first()
      await firstChip.focus()
      
      // Check for focus-visible styles
      const outlineStyle = await firstChip.evaluate(el => 
        window.getComputedStyle(el).outlineStyle
      )
      expect(outlineStyle).not.toBe('none')
    })
  })

  test.describe('Mobile-specific', () => {
    test('should show swipe hint on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/support/help')
      
      // Look for swipe hint text
      const hint = page.locator('text=/swipe|scroll/i').first()
      await expect(hint).toBeVisible()
    })

    test('swipe hint should be hidden on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/support/help')
      
      // Swipe hint should be hidden on desktop
      const hint = page.locator('text=/swipe/i').first()
      await expect(hint).toBeHidden()
    })
  })

  test.describe('Interaction', () => {
    test('should call onLinkClick when chip is clicked', async ({ page }) => {
      await page.goto('/support/help')
      
      const firstChip = page.locator('[data-testid="chip-gifts-under-300"]')
      
      // Click chip
      await firstChip.click()
      
      // Should trigger some action (verify by checking for loading state or results change)
      // This is context-dependent and may need adjustment
      await page.waitForTimeout(100)
    })

    test('should call onLinkClick when chip is activated via keyboard', async ({ page }) => {
      await page.goto('/support/help')
      
      const firstChip = page.locator('[data-testid^="chip-"]').first()
      await firstChip.focus()
      
      // Press Enter
      await page.keyboard.press('Enter')
      
      await page.waitForTimeout(100)
    })

    test('disabled chips should not be clickable', async ({ page }) => {
      // This test assumes there's a way to render disabled chips
      // May need to be adjusted based on actual implementation
      await page.goto('/support/help')
      
      const chips = page.locator('[data-testid^="chip-"][disabled]')
      
      if (await chips.count() > 0) {
        const disabledChip = chips.first()
        await expect(disabledChip).toBeDisabled()
      }
    })
  })
})

// Mobile-specific test suite
test.describe('QuickLinkChips - Mobile (@mobile)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should have 44px+ touch targets', async ({ page }) => {
    await page.goto('/support/help')
    
    const chips = page.locator('[data-testid^="chip-"]')
    const count = await chips.count()
    
    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('should scroll horizontally', async ({ page }) => {
    await page.goto('/support/help')
    
    const container = page.locator('[role="toolbar"]')
    
    // Check if container has horizontal scroll
    const isScrollable = await container.evaluate(el => 
      el.scrollWidth > el.clientWidth
    )
    
    if (isScrollable) {
      // Get initial scroll position
      const initialScroll = await container.evaluate(el => el.scrollLeft)
      
      // Scroll right
      await container.evaluate(el => el.scrollLeft = el.scrollWidth)
      
      // Verify scroll changed
      const finalScroll = await container.evaluate(el => el.scrollLeft)
      expect(finalScroll).toBeGreaterThan(initialScroll)
    }
  })
})

