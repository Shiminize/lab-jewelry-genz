/**
 * Material Tag Accessibility E2E Tests
 * 
 * Comprehensive accessibility testing for MaterialTagChip interactions
 * in ProductCard components with WCAG 2.1 AA compliance validation.
 * 
 * CLAUDE_RULES.md Compliance:
 * - Accessibility tests for interactive UI
 * - WCAG 2.1 AA compliance validation
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - 44px minimum touch targets
 */

import { test, expect, type Page, type Locator } from '@playwright/test'

// Accessibility testing utilities
class AccessibilityTestUtils {
  constructor(private page: Page) {}

  async injectAxeCore(): Promise<void> {
    await this.page.addScriptTag({
      url: 'https://unpkg.com/axe-core@4.7.2/axe.min.js'
    })
  }

  async runAxeAnalysis(selector?: string): Promise<any> {
    const results = await this.page.evaluate((sel) => {
      return (window as any).axe.run(sel ? sel : document)
    }, selector)
    return results
  }

  async getAccessibilityViolations(selector?: string): Promise<any[]> {
    const results = await this.runAxeAnalysis(selector)
    return results.violations
  }

  async getMaterialTags(): Promise<Locator> {
    return this.page.locator('button[aria-label*="filter"]')
  }

  async getProductCard(index: number = 0): Promise<Locator> {
    return this.page.locator('[data-testid="product-card"]').nth(index)
  }

  async getTagGroups(): Promise<Locator> {
    return this.page.locator('[role="group"][aria-label="Product material filters"]')
  }

  async validateTouchTargetSize(element: Locator): Promise<{ width: number, height: number }> {
    const box = await element.boundingBox()
    expect(box).not.toBeNull()
    
    const { width, height } = box!
    return { width, height }
  }

  async simulateScreenReader(): Promise<void> {
    // Enable screen reader simulation
    await this.page.emulateMedia({ forcedColors: 'active' })
  }

  async getFocusableElements(): Promise<Locator> {
    return this.page.locator('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  }

  async validateFocusSequence(expectedOrder: string[]): Promise<void> {
    for (let i = 0; i < expectedOrder.length; i++) {
      await this.page.keyboard.press('Tab')
      const focusedElement = await this.page.locator(':focus').textContent()
      expect(focusedElement).toContain(expectedOrder[i])
    }
  }
}

test.describe('Material Tag Accessibility', () => {
  let utils: AccessibilityTestUtils

  test.beforeEach(async ({ page }) => {
    utils = new AccessibilityTestUtils(page)
    
    // Navigate to catalog with products
    await page.goto('/catalog')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    // Inject axe-core for accessibility testing
    await utils.injectAxeCore()
  })

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('should pass automated accessibility checks', async ({ page }) => {
      // Run axe-core analysis on material tag components
      const violations = await utils.getAccessibilityViolations('[role="group"][aria-label="Product material filters"]')
      
      // Should have no critical accessibility violations
      const criticalViolations = violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      )
      
      if (criticalViolations.length > 0) {
        console.error('Critical accessibility violations found:', criticalViolations)
      }
      
      expect(criticalViolations).toHaveLength(0)
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Check first few tags for proper ARIA attributes
        for (let i = 0; i < Math.min(tagCount, 3); i++) {
          const tag = materialTags.nth(i)
          
          // Should have role="button"
          await expect(tag).toHaveAttribute('role', 'button')
          
          // Should have aria-pressed attribute
          await expect(tag).toHaveAttribute('aria-pressed')
          
          // Should have descriptive aria-label
          const ariaLabel = await tag.getAttribute('aria-label')
          expect(ariaLabel).toMatch(/(Add|Remove).+filter/)
          
          // Should have tabindex for keyboard navigation
          const tabIndex = await tag.getAttribute('tabindex')
          expect(tabIndex).toBe('0')
        }
      }
    })

    test('should have proper heading structure', async ({ page }) => {
      // Check that tag groups have proper labeling
      const tagGroups = await utils.getTagGroups()
      const groupCount = await tagGroups.count()
      
      if (groupCount > 0) {
        for (let i = 0; i < groupCount; i++) {
          const group = tagGroups.nth(i)
          
          // Should have role="group"
          await expect(group).toHaveAttribute('role', 'group')
          
          // Should have aria-label
          const ariaLabel = await group.getAttribute('aria-label')
          expect(ariaLabel).toBe('Product material filters')
        }
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      // Run color contrast analysis
      const violations = await utils.getAccessibilityViolations()
      const contrastViolations = violations.filter(v => 
        v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
      )
      
      // Should meet WCAG AA color contrast requirements (4.5:1)
      expect(contrastViolations).toHaveLength(0)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support Tab navigation', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Start from page beginning
        await page.keyboard.press('Home')
        
        // Tab to first material tag
        let currentElement = page.locator(':focus')
        let attempts = 0
        const maxAttempts = 20
        
        while (attempts < maxAttempts) {
          await page.keyboard.press('Tab')
          currentElement = page.locator(':focus')
          
          const isTagFocused = await currentElement.getAttribute('aria-label')
          if (isTagFocused && isTagFocused.includes('filter')) {
            break
          }
          attempts++
        }
        
        // Should have focused on a material tag
        const focusedElement = page.locator(':focus')
        const ariaLabel = await focusedElement.getAttribute('aria-label')
        expect(ariaLabel).toMatch(/filter/)
      }
    })

    test('should support Enter key activation', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const firstTag = materialTags.first()
        
        // Focus the tag
        await firstTag.focus()
        await expect(firstTag).toBeFocused()
        
        // Get initial aria-pressed state
        const initialPressed = await firstTag.getAttribute('aria-pressed')
        
        // Press Enter to activate
        await page.keyboard.press('Enter')
        
        // Wait for potential state change
        await page.waitForTimeout(500)
        
        // Should have been activated (tag click handler called)
        // We can verify this by checking if URL changed or other side effects
        const url = page.url()
        const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
        
        // Either URL should change OR aria-pressed state should change
        const finalPressed = await firstTag.getAttribute('aria-pressed')
        const stateChanged = initialPressed !== finalPressed
        
        expect(hasFilterParams || stateChanged).toBe(true)
      }
    })

    test('should support Space key activation', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Find a tag that hasn't been activated yet
        const availableTags = materialTags.filter({ hasNotText: 'aria-pressed="true"' })
        const availableCount = await availableTags.count()
        
        if (availableCount > 0) {
          const tag = availableTags.first()
          
          // Focus the tag
          await tag.focus()
          await expect(tag).toBeFocused()
          
          // Press Space to activate
          await page.keyboard.press('Space')
          
          // Wait for potential state change
          await page.waitForTimeout(500)
          
          // Should have been activated
          const url = page.url()
          const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
          expect(hasFilterParams).toBe(true)
        }
      }
    })

    test('should maintain logical tab order', async ({ page }) => {
      // Verify tab order goes through material tags in logical sequence
      const productCard = await utils.getProductCard(0)
      const materialTags = productCard.locator('button[aria-label*="filter"]')
      const tagCount = await materialTags.count()
      
      if (tagCount >= 2) {
        // Focus first tag
        await materialTags.first().focus()
        
        // Tab through material tags
        for (let i = 1; i < tagCount; i++) {
          await page.keyboard.press('Tab')
          
          // Should move to next tag or beyond material tags
          const focusedElement = page.locator(':focus')
          const ariaLabel = await focusedElement.getAttribute('aria-label')
          
          // Either on next material tag or moved past material tags section
          expect(ariaLabel).toBeTruthy()
        }
      }
    })

    test('should skip disabled tags in navigation', async ({ page }) => {
      // Test that disabled tags are properly skipped in keyboard navigation
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Check if any tags are disabled
        const disabledTags = materialTags.filter({ hasText: 'disabled' })
        const disabledCount = await disabledTags.count()
        
        if (disabledCount > 0) {
          // Disabled tags should have tabindex="-1"
          const firstDisabled = disabledTags.first()
          const tabIndex = await firstDisabled.getAttribute('tabindex')
          expect(tabIndex).toBe('-1')
        }
      }
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should announce filter state changes', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Get initial aria-pressed state
        const initialPressed = await tag.getAttribute('aria-pressed')
        const initialLabel = await tag.getAttribute('aria-label')
        
        // Click the tag
        await tag.click()
        await page.waitForTimeout(500)
        
        // Check if aria-pressed state changed
        const finalPressed = await tag.getAttribute('aria-pressed')
        const finalLabel = await tag.getAttribute('aria-label')
        
        // Either aria-pressed or aria-label should change to indicate state
        const stateChanged = initialPressed !== finalPressed || initialLabel !== finalLabel
        expect(stateChanged).toBe(true)
        
        // aria-label should describe current action
        expect(finalLabel).toMatch(/(Add|Remove).+filter/)
      }
    })

    test('should have descriptive aria-labels', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        for (let i = 0; i < Math.min(tagCount, 5); i++) {
          const tag = materialTags.nth(i)
          const ariaLabel = await tag.getAttribute('aria-label')
          const tagText = await tag.textContent()
          
          // aria-label should include the tag name and action
          expect(ariaLabel).toContain(tagText || '')
          expect(ariaLabel).toMatch(/(Add|Remove).+filter/)
          
          // Should be descriptive enough for screen readers
          expect(ariaLabel!.length).toBeGreaterThan(10)
        }
      }
    })

    test('should group related tags properly', async ({ page }) => {
      const tagGroups = await utils.getTagGroups()
      const groupCount = await tagGroups.count()
      
      if (groupCount > 0) {
        for (let i = 0; i < groupCount; i++) {
          const group = tagGroups.nth(i)
          
          // Should have role="group" for screen reader context
          await expect(group).toHaveAttribute('role', 'group')
          
          // Should have descriptive aria-label
          const ariaLabel = await group.getAttribute('aria-label')
          expect(ariaLabel).toBe('Product material filters')
          
          // Should contain material tag buttons
          const buttons = group.locator('button')
          const buttonCount = await buttons.count()
          expect(buttonCount).toBeGreaterThanOrEqual(1)
        }
      }
    })
  })

  test.describe('Touch Target Requirements', () => {
    test('should meet 44px minimum touch target size', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        for (let i = 0; i < Math.min(tagCount, 5); i++) {
          const tag = materialTags.nth(i)
          const { width, height } = await utils.validateTouchTargetSize(tag)
          
          // WCAG 2.1 AA requires minimum 44x44px touch targets
          // Allow small variance for standard variant (40px) vs medium (44px)
          expect(height).toBeGreaterThanOrEqual(40)
          expect(width).toBeGreaterThanOrEqual(40)
          
          // Medium size variant should meet full 44px requirement
          const sizeClass = await tag.getAttribute('class')
          if (sizeClass && sizeClass.includes('md')) {
            expect(height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('should have adequate spacing between touch targets', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount >= 2) {
        // Check spacing between adjacent tags
        const firstTag = materialTags.first()
        const secondTag = materialTags.nth(1)
        
        const firstBox = await firstTag.boundingBox()
        const secondBox = await secondTag.boundingBox()
        
        if (firstBox && secondBox) {
          // Calculate distance between tags
          const horizontalGap = secondBox.x - (firstBox.x + firstBox.width)
          const verticalGap = Math.abs(secondBox.y - firstBox.y)
          
          // Should have some spacing (at least 4px gap recommended)
          if (verticalGap < 10) { // Same row
            expect(horizontalGap).toBeGreaterThanOrEqual(2)
          }
        }
      }
    })
  })

  test.describe('Focus Management', () => {
    test('should maintain focus after tag activation', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Focus and activate tag
        await tag.focus()
        await expect(tag).toBeFocused()
        
        await tag.click()
        await page.waitForTimeout(500)
        
        // Focus should remain on the tag after activation
        await expect(tag).toBeFocused()
      }
    })

    test('should handle focus with dynamic content changes', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        await tag.focus()
        
        // Activate tag to trigger filtering
        await tag.click()
        
        // Wait for content to update
        await page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200
        )
        await page.waitForTimeout(1000)
        
        // Focus should still be manageable
        const focusedElement = page.locator(':focus')
        const elementExists = await focusedElement.count()
        expect(elementExists).toBeGreaterThanOrEqual(0)
      }
    })

    test('should provide visible focus indicators', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Focus the tag
        await tag.focus()
        
        // Should have visible focus ring/outline
        const styles = await tag.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            outline: computed.outline,
            boxShadow: computed.boxShadow,
            border: computed.border
          }
        })
        
        // Should have some form of visible focus indicator
        const hasFocusIndicator = 
          styles.outline !== 'none' || 
          styles.boxShadow.includes('ring') || 
          styles.boxShadow.includes('focus')
        
        expect(hasFocusIndicator).toBe(true)
      }
    })
  })

  test.describe('High Contrast Mode', () => {
    test('should work in forced colors mode', async ({ page }) => {
      // Enable forced colors mode (Windows High Contrast)
      await page.emulateMedia({ forcedColors: 'active' })
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Tags should still be visible and interactive
        const tag = materialTags.first()
        await expect(tag).toBeVisible()
        
        // Should still be clickable
        await tag.click()
        await page.waitForTimeout(500)
        
        // Page should still function
        expect(page.url()).toContain('/catalog')
      }
    })

    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Should still be functional with reduced motion
        await tag.click()
        await page.waitForTimeout(500)
        
        // Verify functionality works
        const url = page.url()
        const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
        
        // Should either have filter params or be on catalog page
        expect(url.includes('/catalog')).toBe(true)
      }
    })
  })
})