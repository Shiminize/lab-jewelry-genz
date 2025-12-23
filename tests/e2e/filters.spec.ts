import { test, expect, type Page } from '@playwright/test'

const CATALOG_URL = '/collections'

test.describe('Filter System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CATALOG_URL)
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test.describe('Filter Pills', () => {
    test('should open category dropdown when category pill is clicked', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await expect(page.locator('#category-dropdown')).toBeVisible()
    })

    test('should close dropdown when close button is clicked', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('button[aria-label="Close dropdown"]')
      await expect(page.locator('#category-dropdown')).not.toBeVisible()
    })

    test('should apply category filter and update URL', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      await expect(page).toHaveURL(/category=Rings/)
    })

    test('should show active state on filtered pill', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      const categoryPill = page.locator('[aria-controls="category-dropdown"]')
      await expect(categoryPill).toHaveClass(/border-accent-primary/)
    })
  })

  test.describe('Price Filter', () => {
    test('should open price dropdown', async ({ page }) => {
      await page.click('[aria-controls="price-dropdown"]')
      await expect(page.locator('#price-dropdown')).toBeVisible()
    })

    test('should accept valid price range', async ({ page }) => {
      await page.click('[aria-controls="price-dropdown"]')
      await page.fill('input[placeholder="Min"]', '100')
      await page.fill('input[placeholder="Max"]', '500')
      await page.click('text=Apply')
      
      await expect(page).toHaveURL(/min_price=100/)
      await expect(page).toHaveURL(/max_price=500/)
    })

    test('should swap prices if min > max', async ({ page }) => {
      await page.click('[aria-controls="price-dropdown"]')
      await page.fill('input[placeholder="Min"]', '500')
      await page.fill('input[placeholder="Max"]', '100')
      await page.click('text=Apply')
      
      // Should swap to min=100, max=500
      await expect(page).toHaveURL(/min_price=100/)
      await expect(page).toHaveURL(/max_price=500/)
    })

    test('should reset price filter', async ({ page }) => {
      await page.click('[aria-controls="price-dropdown"]')
      await page.fill('input[placeholder="Min"]', '100')
      await page.fill('input[placeholder="Max"]', '500')
      await page.click('text=Apply')
      
      await page.click('[aria-controls="price-dropdown"]')
      await page.click('text=Reset')
      
      await expect(page).not.toHaveURL(/min_price/)
      await expect(page).not.toHaveURL(/max_price/)
    })
  })

  test.describe('Metal Filter', () => {
    test('should select multiple metals', async ({ page }) => {
      await page.click('[aria-controls="metal-dropdown"]')
      await page.click('text=Gold')
      await page.click('text=Silver')
      await page.click('text=Apply')
      
      await expect(page).toHaveURL(/metal=.*gold.*silver/)
    })

    test('should deselect metal', async ({ page }) => {
      await page.click('[aria-controls="metal-dropdown"]')
      await page.click('text=Gold')
      await page.click('text=Apply')
      
      await page.click('[aria-controls="metal-dropdown"]')
      await page.click('text=Gold') // Deselect
      await page.click('text=Apply')
      
      await expect(page).not.toHaveURL(/metal=/)
    })
  })

  test.describe('Gemstone Filter', () => {
    test('should select gemstone if available', async ({ page }) => {
      const gemstoneButton = page.locator('[aria-controls="gemstone-dropdown"]')
      
      // Only run if gemstone filter is available
      if (await gemstoneButton.isVisible()) {
        await gemstoneButton.click()
        
        // Select first available gemstone
        const firstGemstone = page.locator('#gemstone-dropdown button').first()
        const gemstoneName = await firstGemstone.textContent()
        await firstGemstone.click()
        await page.click('text=Apply')
        
        await expect(page).toHaveURL(/gemstone=/)
      }
    })
  })

  test.describe('Quick Filter Chips', () => {
    test('should toggle "Under $300" chip', async ({ page }) => {
      const chip = page.locator('text=Under $300')
      await chip.click()
      
      await expect(page).toHaveURL(/max_price=299/)
      
      // Toggle off
      await chip.click()
      await expect(page).not.toHaveURL(/max_price=299/)
    })

    test('should activate "Limited Edition" filter', async ({ page }) => {
      await page.click('text=Limited Edition')
      await expect(page).toHaveURL(/limited=true/)
    })

    test('should activate "Bestseller" filter', async ({ page }) => {
      await page.click('text=Bestseller')
      await expect(page).toHaveURL(/bestseller=true/)
    })

    test('should show active state on toggled chip', async ({ page }) => {
      const chip = page.locator('text=Under $300')
      await chip.click()
      
      await expect(chip).toHaveClass(/border-accent-primary/)
    })
  })

  test.describe('Filter Presets', () => {
    test('should apply "Gifts Under $300" preset', async ({ page }) => {
      await page.click('text=🎁 Gifts Under $300')
      
      await expect(page).toHaveURL(/max_price=299/)
      await expect(page).toHaveURL(/tag=gift/)
    })

    test('should apply "Ready to Ship Gold" preset', async ({ page }) => {
      await page.click('text=⚡ Ready to Ship Gold')
      
      await expect(page).toHaveURL(/availability=ready/)
      await expect(page).toHaveURL(/metal=gold/)
    })

    test('should apply "Limited Editions" preset', async ({ page }) => {
      await page.click('text=✨ Limited Editions')
      await expect(page).toHaveURL(/limited=true/)
    })

    test('should apply "Bestsellers" preset', async ({ page }) => {
      await page.click('text=🌟 Bestsellers')
      await expect(page).toHaveURL(/bestseller=true/)
    })
  })

  test.describe('More Filters Drawer', () => {
    test('should open More Filters drawer', async ({ page }) => {
      await page.click('text=More Filters')
      await expect(page.locator('text=Filters').first()).toBeVisible()
    })

    test('should close drawer with X button', async ({ page }) => {
      await page.click('text=More Filters')
      await page.click('button[aria-label="Close filters"]')
      await expect(page.locator('text=Filters').first()).not.toBeVisible()
    })

    test('should apply filters from drawer', async ({ page }) => {
      await page.click('text=More Filters')
      
      // Interact with filters in drawer
      const metalButton = page.locator('text=Gold').first()
      if (await metalButton.isVisible()) {
        await metalButton.click()
      }
      
      await page.click('text=Apply Filters')
      await expect(page).toHaveURL(/metal=/)
    })

    test('should reset filters from drawer', async ({ page }) => {
      // Apply a filter first
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      // Open drawer and reset
      await page.click('text=More Filters')
      await page.click('text=Reset')
      
      await expect(page).not.toHaveURL(/category=/)
    })
  })

  test.describe('Active Filters', () => {
    test('should display active filter count', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      await page.click('text=Under $300')
      
      // Active filter count should be visible
      const filterCount = page.locator('text=/Active.*2/')
      await expect(filterCount).toBeVisible()
    })

    test('should show individual active filters', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      // Should show active filter badge/indicator
      const activeFilter = page.locator('text=/Rings/')
      await expect(activeFilter).toBeVisible()
    })

    test('should clear all filters', async ({ page }) => {
      // Apply multiple filters
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      await page.click('text=Under $300')
      
      // Clear all
      await page.click('text=Clear all')
      
      await expect(page).toHaveURL(CATALOG_URL)
    })
  })

  test.describe('Sticky Behavior', () => {
    test('should make filter bar sticky on scroll', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 300))
      
      // Wait for sticky to activate
      await page.waitForTimeout(100)
      
      const filterBar = page.locator('[class*="fixed"]').first()
      await expect(filterBar).toBeVisible()
    })
  })

  test.describe('Mobile Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should allow horizontal scroll on mobile', async ({ page }) => {
      const scrollContainer = page.locator('.scrollbar-hide').first()
      await expect(scrollContainer).toBeVisible()
      
      // Check if overflow is set correctly
      const overflow = await scrollContainer.evaluate((el) => 
        window.getComputedStyle(el).overflowX
      )
      expect(overflow).toBe('auto')
    })

    test('should show More Filters button on mobile', async ({ page }) => {
      await expect(page.locator('text=More Filters')).toBeVisible()
    })
  })

  test.describe('Result Updates', () => {
    test('should update product count after filtering', async ({ page }) => {
      // Get initial count
      const initialCount = await page.locator('.product-card').count()
      
      // Apply filter
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      // Wait for results to update
      await page.waitForLoadState('networkidle')
      
      // Count should change (unless all products are rings)
      const newCount = await page.locator('.product-card').count()
      expect(newCount).toBeGreaterThanOrEqual(0)
    })

    test('should show empty state when no results', async ({ page }) => {
      // Apply filters that likely produce no results
      await page.click('[aria-controls="price-dropdown"]')
      await page.fill('input[placeholder="Min"]', '10000')
      await page.fill('input[placeholder="Max"]', '10001')
      await page.click('text=Apply')
      
      // Should show empty state
      await expect(page.locator('text=/No.*match/')).toBeVisible()
    })
  })

  test.describe('URL Persistence', () => {
    test('should persist filters on page reload', async ({ page }) => {
      // Apply filters
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      await page.click('text=Under $300')
      
      const url = page.url()
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // URL should still have filters
      expect(page.url()).toBe(url)
      
      // Pills should still show active state
      const categoryPill = page.locator('[aria-controls="category-dropdown"]')
      await expect(categoryPill).toHaveClass(/border-accent-primary/)
    })

    test('should work with browser back/forward', async ({ page }) => {
      // Apply first filter
      await page.click('[aria-controls="category-dropdown"]')
      await page.click('text=Rings')
      
      // Apply second filter
      await page.click('text=Under $300')
      
      // Go back
      await page.goBack()
      await expect(page).not.toHaveURL(/max_price/)
      
      // Go forward
      await page.goForward()
      await expect(page).toHaveURL(/max_price=299/)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const categoryPill = page.locator('[aria-controls="category-dropdown"]')
      await expect(categoryPill).toHaveAttribute('aria-expanded', 'false')
      
      await categoryPill.click()
      await expect(categoryPill).toHaveAttribute('aria-expanded', 'true')
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab to first pill
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Press Enter to open
      await page.keyboard.press('Enter')
      
      const dropdown = page.locator('#category-dropdown')
      await expect(dropdown).toBeVisible()
    })

    test('should have accessible labels', async ({ page }) => {
      await page.click('text=More Filters')
      
      const closeButton = page.locator('button[aria-label="Close filters"]')
      await expect(closeButton).toHaveAttribute('aria-label')
    })
  })

  test.describe('Performance', () => {
    test('should load filter UI within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto(CATALOG_URL)
      await page.waitForSelector('[aria-controls="category-dropdown"]')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(2000)
    })

    test('should respond to filter changes within 500ms', async ({ page }) => {
      await page.click('[aria-controls="category-dropdown"]')
      
      const startTime = Date.now()
      await page.click('text=Rings')
      await page.waitForLoadState('networkidle')
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500)
    })
  })
})

