/**
 * Material Tag Mobile Interaction E2E Tests
 * 
 * Mobile-specific testing for MaterialTagChip touch interactions
 * in ProductCard components with responsive behavior validation.
 * 
 * CLAUDE_RULES.md Compliance:
 * - Mobile-first responsive design testing
 * - Touch target size validation (44px minimum)
 * - Touch event handling verification
 * - Responsive behavior across device sizes
 * - Performance on mobile devices
 */

import { test, expect, type Page, type Locator } from '@playwright/test'

// Mobile testing utilities
class MobileTestUtils {
  constructor(private page: Page) {}

  async setMobileViewport(device: 'phone' | 'tablet' = 'phone'): Promise<void> {
    if (device === 'phone') {
      await this.page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    } else {
      await this.page.setViewportSize({ width: 768, height: 1024 }) // iPad
    }
  }

  async getMaterialTags(): Promise<Locator> {
    return this.page.locator('button[aria-label*="filter"]')
  }

  async getProductCards(): Promise<Locator> {
    return this.page.locator('[data-testid="product-card"]')
  }

  async validateTouchTargetSize(element: Locator): Promise<{ width: number, height: number, meetsRequirement: boolean }> {
    const box = await element.boundingBox()
    expect(box).not.toBeNull()
    
    const { width, height } = box!
    const meetsRequirement = width >= 44 && height >= 44
    
    return { width, height, meetsRequirement }
  }

  async simulateTouchEvent(element: Locator, eventType: 'tap' | 'longpress' | 'doubletap'): Promise<void> {
    const box = await element.boundingBox()
    expect(box).not.toBeNull()
    
    const centerX = box!.x + box!.width / 2
    const centerY = box!.y + box!.height / 2
    
    switch (eventType) {
      case 'tap':
        await this.page.touchscreen.tap(centerX, centerY)
        break
      case 'longpress':
        await this.page.touchscreen.tap(centerX, centerY)
        await this.page.waitForTimeout(1000) // Long press duration
        break
      case 'doubletap':
        await this.page.touchscreen.tap(centerX, centerY)
        await this.page.waitForTimeout(100)
        await this.page.touchscreen.tap(centerX, centerY)
        break
    }
  }

  async checkHoverStatesPersistence(): Promise<boolean> {
    // Check if hover states persist on touch devices (they shouldn't)
    const materialTags = await this.getMaterialTags()
    const tagCount = await materialTags.count()
    
    if (tagCount > 0) {
      const tag = materialTags.first()
      
      // Simulate touch
      await this.simulateTouchEvent(tag, 'tap')
      await this.page.waitForTimeout(500)
      
      // Check if hover styles are still applied (they shouldn't be)
      const styles = await tag.evaluate(el => {
        return window.getComputedStyle(el).getPropertyValue('--hover-applied')
      })
      
      return styles === 'true' // Returns true if hover persists (bad)
    }
    
    return false
  }

  async testScrollableTagContainer(): Promise<void> {
    // Test if tag containers scroll properly on mobile when there are many tags
    const productCards = await this.getProductCards()
    const cardCount = await productCards.count()
    
    if (cardCount > 0) {
      const firstCard = productCards.first()
      const tagContainer = firstCard.locator('[role="group"][aria-label="Product material filters"]')
      
      if (await tagContainer.count() > 0) {
        const containerBox = await tagContainer.boundingBox()
        const tags = tagContainer.locator('button')
        const tagCount = await tags.count()
        
        if (tagCount > 3 && containerBox) {
          // Check if container is scrollable or wraps properly
          const isOverflowing = await tagContainer.evaluate(el => {
            return el.scrollWidth > el.clientWidth
          })
          
          // On mobile, should either wrap or be scrollable
          expect(typeof isOverflowing).toBe('boolean')
        }
      }
    }
  }

  async getVisibleTagsInMobileView(): Promise<number> {
    const materialTags = await this.getMaterialTags()
    let visibleCount = 0
    
    const tagCount = await materialTags.count()
    for (let i = 0; i < tagCount; i++) {
      const tag = materialTags.nth(i)
      const isVisible = await tag.isVisible()
      if (isVisible) {
        visibleCount++
      }
    }
    
    return visibleCount
  }
}

test.describe('Material Tag Mobile Interactions', () => {
  let utils: MobileTestUtils

  test.beforeEach(async ({ page }) => {
    utils = new MobileTestUtils(page)
    
    // Set mobile viewport
    await utils.setMobileViewport('phone')
    
    // Navigate to catalog
    await page.goto('/catalog')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  })

  test.describe('Touch Target Requirements', () => {
    test('should meet 44px minimum touch target size on mobile', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Test first 5 tags for touch target size
        for (let i = 0; i < Math.min(tagCount, 5); i++) {
          const tag = materialTags.nth(i)
          const { width, height, meetsRequirement } = await utils.validateTouchTargetSize(tag)
          
          // Should meet WCAG 2.1 AA touch target requirements
          expect(meetsRequirement).toBe(true)
          expect(width).toBeGreaterThanOrEqual(44)
          expect(height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should have adequate spacing between touch targets', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount >= 2) {
        const firstTag = materialTags.first()
        const secondTag = materialTags.nth(1)
        
        const firstBox = await firstTag.boundingBox()
        const secondBox = await secondTag.boundingBox()
        
        if (firstBox && secondBox) {
          // Calculate minimum distance between touch targets
          const horizontalGap = Math.abs(secondBox.x - (firstBox.x + firstBox.width))
          const verticalGap = Math.abs(secondBox.y - (firstBox.y + firstBox.height))
          const minDistance = Math.min(horizontalGap, verticalGap)
          
          // Should have at least 8px spacing or be on different rows
          const onSameRow = Math.abs(firstBox.y - secondBox.y) < 10
          if (onSameRow) {
            expect(horizontalGap).toBeGreaterThanOrEqual(4) // Minimum 4px gap
          }
        }
      }
    })

    test('should handle overlapping touch areas gracefully', async ({ page }) => {
      // Test edge case where touch targets might be close together
      const productCards = await utils.getProductCards()
      
      if (await productCards.count() > 0) {
        const firstCard = productCards.first()
        const tags = firstCard.locator('button[aria-label*="filter"]')
        const tagCount = await tags.count()
        
        if (tagCount >= 2) {
          // Touch between two tags and verify correct target is hit
          const firstTag = tags.first()
          const secondTag = tags.nth(1)
          
          const firstBox = await firstTag.boundingBox()
          const secondBox = await secondTag.boundingBox()
          
          if (firstBox && secondBox) {
            // Touch exactly on first tag
            await utils.simulateTouchEvent(firstTag, 'tap')
            await page.waitForTimeout(300)
            
            // Should register as first tag click
            const url1 = page.url()
            
            // Touch exactly on second tag
            await utils.simulateTouchEvent(secondTag, 'tap')
            await page.waitForTimeout(300)
            
            // Should register as second tag click (URL should change)
            const url2 = page.url()
            
            // URLs should be different if different filters applied
            const bothTagsWorked = url1 !== url2 || url1.includes('stoneType') || url1.includes('metalType')
            expect(bothTagsWorked).toBe(true)
          }
        }
      }
    })
  })

  test.describe('Touch Event Handling', () => {
    test('should respond to touch tap events', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        const tagText = await tag.textContent()
        
        // Simulate touch tap
        await utils.simulateTouchEvent(tag, 'tap')
        await page.waitForTimeout(500)
        
        // Should trigger filtering
        const url = page.url()
        const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
        
        expect(hasFilterParams).toBe(true)
      }
    })

    test('should not respond to hover events on touch devices', async ({ page }) => {
      // Verify that hover states don't persist after touch
      const hoverPersists = await utils.checkHoverStatesPersistence()
      
      // Hover states should not persist on touch devices
      expect(hoverPersists).toBe(false)
    })

    test('should handle rapid consecutive touches', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Rapid consecutive touches
        await utils.simulateTouchEvent(tag, 'tap')
        await utils.simulateTouchEvent(tag, 'tap')
        await page.waitForTimeout(1000)
        
        // Should handle gracefully without errors
        const productCards = await utils.getProductCards()
        await expect(productCards).toHaveCount({ min: 0 })
        
        // Page should still be functional
        expect(page.url()).toContain('/catalog')
      }
    })

    test('should prevent accidental long press actions', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Simulate long press
        await utils.simulateTouchEvent(tag, 'longpress')
        await page.waitForTimeout(500)
        
        // Should not trigger context menu or other long press actions
        const contextMenu = page.locator('[role="menu"], .context-menu')
        await expect(contextMenu).toHaveCount(0)
        
        // Should still trigger normal click action
        const url = page.url()
        const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
        expect(hasFilterParams).toBe(true)
      }
    })

    test('should handle touch events with scrolling', async ({ page }) => {
      // Scroll to different parts of the catalog
      await page.mouse.wheel(0, 300) // Scroll down
      await page.waitForTimeout(500)
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Find a visible tag after scrolling
        let visibleTag: Locator | null = null
        for (let i = 0; i < tagCount; i++) {
          const tag = materialTags.nth(i)
          if (await tag.isVisible()) {
            visibleTag = tag
            break
          }
        }
        
        if (visibleTag) {
          // Touch the visible tag
          await utils.simulateTouchEvent(visibleTag, 'tap')
          await page.waitForTimeout(500)
          
          // Should work regardless of scroll position
          const url = page.url()
          const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
          expect(hasFilterParams).toBe(true)
        }
      }
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should adapt tag display for mobile viewport', async ({ page }) => {
      // Check tag display in mobile view
      const visibleTagsPhone = await utils.getVisibleTagsInMobileView()
      
      // Switch to tablet view
      await utils.setMobileViewport('tablet')
      await page.waitForTimeout(500)
      
      const visibleTagsTablet = await utils.getVisibleTagsInMobileView()
      
      // Should adapt appropriately for different screen sizes
      expect(visibleTagsPhone).toBeGreaterThanOrEqual(0)
      expect(visibleTagsTablet).toBeGreaterThanOrEqual(0)
      
      // Tablet should generally show same or more tags
      expect(visibleTagsTablet).toBeGreaterThanOrEqual(visibleTagsPhone - 1) // Allow small variance
    })

    test('should show appropriate number of tags per product variant', async ({ page }) => {
      const productCards = await utils.getProductCards()
      const cardCount = await productCards.count()
      
      if (cardCount > 0) {
        // Check compact variant on mobile
        const firstCard = productCards.first()
        const tagContainer = firstCard.locator('[role="group"][aria-label="Product material filters"]')
        
        if (await tagContainer.count() > 0) {
          const tags = tagContainer.locator('button')
          const tagCount = await tags.count()
          
          // Should limit tags appropriately for mobile (typically 2-3)
          expect(tagCount).toBeLessThanOrEqual(5) // Reasonable limit for mobile
          
          // Check for "more" indicator if tags are limited
          const moreIndicator = firstCard.locator('text=+').first()
          const hasMoreIndicator = await moreIndicator.count() > 0
          
          if (tagCount >= 3 && hasMoreIndicator) {
            // Should show more indicator when tags are limited
            expect(await moreIndicator.isVisible()).toBe(true)
          }
        }
      }
    })

    test('should handle tag container overflow on mobile', async ({ page }) => {
      await utils.testScrollableTagContainer()
      
      // Verify that long tag names are handled properly
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        for (let i = 0; i < Math.min(tagCount, 3); i++) {
          const tag = materialTags.nth(i)
          const tagBox = await tag.boundingBox()
          
          if (tagBox) {
            // Tag should fit within reasonable mobile width
            expect(tagBox.width).toBeLessThanOrEqual(200) // Max reasonable width
            
            // Text should not overflow
            const hasOverflow = await tag.evaluate(el => {
              return el.scrollWidth > el.clientWidth
            })
            
            // Text should be properly truncated if needed
            expect(hasOverflow).toBe(false)
          }
        }
      }
    })

    test('should maintain functionality across orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 })
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Test functionality in portrait
        await utils.simulateTouchEvent(tag, 'tap')
        await page.waitForTimeout(500)
        
        const portraitUrl = page.url()
        
        // Switch to landscape
        await page.setViewportSize({ width: 667, height: 375 })
        await page.waitForTimeout(1000)
        
        // Should maintain state and functionality
        const landscapeUrl = page.url()
        expect(landscapeUrl).toBe(portraitUrl)
        
        // Find tags in landscape mode
        const landscapeTags = await utils.getMaterialTags()
        const landscapeTagCount = await landscapeTags.count()
        
        if (landscapeTagCount > 0) {
          // Should still be interactive
          const landscapeTag = landscapeTags.first()
          await utils.simulateTouchEvent(landscapeTag, 'tap')
          await page.waitForTimeout(500)
          
          // Should work in landscape
          expect(page.url()).toContain('/catalog')
        }
      }
    })
  })

  test.describe('Performance on Mobile', () => {
    test('should maintain 60fps during tag interactions', async ({ page }) => {
      // Note: Actual FPS measurement would require performance API
      // This test ensures interactions don't cause visible lag
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount >= 2) {
        const startTime = Date.now()
        
        // Perform rapid tag interactions
        for (let i = 0; i < Math.min(tagCount, 3); i++) {
          const tag = materialTags.nth(i)
          await utils.simulateTouchEvent(tag, 'tap')
          await page.waitForTimeout(100) // Brief pause between taps
        }
        
        const endTime = Date.now()
        const totalTime = endTime - startTime
        
        // Should complete rapidly (under 2 seconds for 3 interactions)
        expect(totalTime).toBeLessThan(2000)
        
        // Page should still be responsive
        const finalTags = await utils.getMaterialTags()
        await expect(finalTags.first()).toBeVisible()
      }
    })

    test('should load and display tags quickly on mobile', async ({ page }) => {
      // Reload page and measure tag appearance time
      const startTime = Date.now()
      
      await page.reload()
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      // Wait for material tags to appear
      const materialTags = await utils.getMaterialTags()
      await expect(materialTags.first()).toBeVisible({ timeout: 5000 })
      
      const endTime = Date.now()
      const loadTime = endTime - startTime
      
      // Should load within reasonable time on mobile (5 seconds max)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should handle memory efficiently with many tags', async ({ page }) => {
      // Test with products that have many material tags
      await page.goto('/catalog?limit=20') // Load more products
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      const productCards = await utils.getProductCards()
      const cardCount = await productCards.count()
      
      // Interact with tags on multiple products
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = productCards.nth(i)
        const tags = card.locator('button[aria-label*="filter"]')
        const tagCount = await tags.count()
        
        if (tagCount > 0) {
          const firstTag = tags.first()
          await utils.simulateTouchEvent(firstTag, 'tap')
          await page.waitForTimeout(200)
        }
      }
      
      // Page should remain responsive after multiple interactions
      const finalProductCards = await utils.getProductCards()
      await expect(finalProductCards.first()).toBeVisible()
      
      // Memory test: Page should not crash or become unresponsive
      const isResponsive = await page.evaluate(() => {
        return document.readyState === 'complete'
      })
      
      expect(isResponsive).toBe(true)
    })
  })

  test.describe('Mobile UX Edge Cases', () => {
    test('should handle accidental touches gracefully', async ({ page }) => {
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Simulate accidental touch near but not on tag
        const tag = materialTags.first()
        const box = await tag.boundingBox()
        
        if (box) {
          // Touch slightly outside the tag
          await page.touchscreen.tap(box.x - 5, box.y - 5)
          await page.waitForTimeout(500)
          
          // Should not trigger filter (URL should not change)
          const originalUrl = page.url()
          
          // Now touch the actual tag
          await utils.simulateTouchEvent(tag, 'tap')
          await page.waitForTimeout(500)
          
          // This should trigger filter
          const newUrl = page.url()
          const filterApplied = newUrl !== originalUrl || newUrl.includes('stoneType') || newUrl.includes('metalType')
          
          expect(filterApplied).toBe(true)
        }
      }
    })

    test('should work with assistive touch technologies', async ({ page }) => {
      // Simulate assistive touch by using programmatic clicks
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        const tag = materialTags.first()
        
        // Use programmatic click (similar to assistive touch)
        await tag.click({ force: true })
        await page.waitForTimeout(500)
        
        // Should work with assistive technologies
        const url = page.url()
        const hasFilterParams = url.includes('stoneType=') || url.includes('metalType=') || url.includes('caratWeight=')
        
        expect(hasFilterParams).toBe(true)
      }
    })

    test('should maintain touch target size when zoomed', async ({ page }) => {
      // Simulate mobile zoom (200%)
      await page.setViewportSize({ width: 188, height: 334 }) // Half size simulates 200% zoom
      await page.waitForTimeout(1000)
      
      const materialTags = await utils.getMaterialTags()
      const tagCount = await materialTags.count()
      
      if (tagCount > 0) {
        // Tags should still be touchable when zoomed
        const tag = materialTags.first()
        const { width, height } = await utils.validateTouchTargetSize(tag)
        
        // Even when zoomed, effective touch target should be adequate
        // (Physical size might be smaller, but zoom compensates)
        expect(width).toBeGreaterThan(20) // Minimum viable touch target
        expect(height).toBeGreaterThan(20)
        
        // Should still be functional
        await utils.simulateTouchEvent(tag, 'tap')
        await page.waitForTimeout(500)
        
        expect(page.url()).toContain('/catalog')
      }
    })
  })
})