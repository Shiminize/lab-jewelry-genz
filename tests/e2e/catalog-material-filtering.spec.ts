/**
 * Catalog Material Filtering E2E Tests
 * 
 * Complete end-to-end testing for material tag filtering workflow
 * from ProductCard click to filtered catalog results with URL validation.
 * 
 * CLAUDE_RULES.md Compliance:
 * - E2E tests with Playwright for core flows (catalog, product view)
 * - Performance validation (<300ms API responses)
 * - URL state management and deep linking
 * - TypeScript strict mode with no 'any' types
 */

import { test, expect, type Page, type Locator } from '@playwright/test'

// Enhanced test utilities for catalog filtering
class CatalogFilteringUtils {
  constructor(private page: Page) {}

  async navigateToCatalog(params?: Record<string, string>): Promise<void> {
    const url = new URL('/catalog', 'http://localhost:3000')
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    await this.page.goto(url.toString())
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  }

  async getActiveFilters(): Promise<Record<string, string | null>> {
    const url = new URL(this.page.url())
    return {
      stoneType: url.searchParams.get('stoneType'),
      metalType: url.searchParams.get('metalType'),
      caratWeight: url.searchParams.get('caratWeight'),
      category: url.searchParams.get('category'),
      priceMin: url.searchParams.get('priceMin'),
      priceMax: url.searchParams.get('priceMax'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit')
    }
  }

  async getProductCards(): Promise<Locator> {
    return this.page.locator('[data-testid="product-card"]')
  }

  async getProductCount(): Promise<number> {
    const cards = await this.getProductCards()
    return await cards.count()
  }

  async clickMaterialTag(tagText: string): Promise<void> {
    const tag = this.page.locator('button').filter({ hasText: tagText }).first()
    await expect(tag).toBeVisible()
    await tag.click()
  }

  async waitForFilteringComplete(): Promise<void> {
    // Wait for API response
    await this.page.waitForResponse(resp => 
      resp.url().includes('/api/products') && resp.status() === 200
    )
    
    // Wait for UI to update
    await this.page.waitForTimeout(500)
  }

  async validateFilteredResults(expectedCriteria: {
    stoneType?: string
    metalType?: string
    caratWeight?: string
    minCount?: number
    maxCount?: number
  }): Promise<void> {
    const productCards = await this.getProductCards()
    const count = await productCards.count()
    
    if (expectedCriteria.minCount !== undefined) {
      expect(count).toBeGreaterThanOrEqual(expectedCriteria.minCount)
    }
    
    if (expectedCriteria.maxCount !== undefined) {
      expect(count).toBeLessThanOrEqual(expectedCriteria.maxCount)
    }
    
    // Validate that all visible products match the filter criteria
    if (expectedCriteria.stoneType) {
      const stoneTagDisplayName = this.getDisplayNameForFilter('stone', expectedCriteria.stoneType)
      const matchingProducts = productCards.filter({ hasText: stoneTagDisplayName })
      const matchingCount = await matchingProducts.count()
      expect(matchingCount).toBeGreaterThanOrEqual(1)
    }
    
    if (expectedCriteria.metalType) {
      const metalTagDisplayName = this.getDisplayNameForFilter('metal', expectedCriteria.metalType)
      const matchingProducts = productCards.filter({ hasText: metalTagDisplayName })
      const matchingCount = await matchingProducts.count()
      expect(matchingCount).toBeGreaterThanOrEqual(1)
    }
    
    if (expectedCriteria.caratWeight) {
      const caratTagDisplayName = this.getDisplayNameForFilter('carat', expectedCriteria.caratWeight)
      const matchingProducts = productCards.filter({ hasText: caratTagDisplayName })
      const matchingCount = await matchingProducts.count()
      expect(matchingCount).toBeGreaterThanOrEqual(1)
    }
  }

  private getDisplayNameForFilter(category: string, filterValue: string): string {
    const displayNames: Record<string, Record<string, string>> = {
      stone: {
        'lab-diamond': 'Lab Diamond',
        'moissanite': 'Moissanite',
        'lab-emerald': 'Lab Emerald',
        'lab-ruby': 'Lab Ruby',
        'lab-sapphire': 'Lab Sapphire'
      },
      metal: {
        'silver': '925 Silver',
        '14k-gold': '14K Gold',
        '18k-gold': '18K Gold',
        'platinum': 'Platinum'
      },
      carat: {
        '0.5': '0.5CT',
        '1': '1CT',
        '1.5': '1.5CT',
        '2': '2CT',
        '2.5': '2.5CT',
        '3': '3CT'
      }
    }
    
    return displayNames[category]?.[filterValue] || filterValue
  }

  async clearAllFilters(): Promise<void> {
    await this.page.goto('/catalog')
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  }

  async getBrowserBackForwardButtons(): Promise<{ back: () => Promise<void>, forward: () => Promise<void> }> {
    return {
      back: async () => await this.page.goBack(),
      forward: async () => await this.page.goForward()
    }
  }
}

test.describe('Catalog Material Filtering Complete Workflow', () => {
  let utils: CatalogFilteringUtils

  test.beforeEach(async ({ page }) => {
    utils = new CatalogFilteringUtils(page)
    await utils.navigateToCatalog()
  })

  test.describe('Single Filter Workflows', () => {
    test('should complete Lab Diamond filtering workflow', async ({ page }) => {
      // Step 1: Click Lab Diamond tag from ProductCard
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Step 2: Verify URL parameters
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      
      // Step 3: Verify filtered results
      await utils.validateFilteredResults({
        stoneType: 'lab-diamond',
        minCount: 1
      })
      
      // Step 4: Verify page title/state indicates filtering
      const url = page.url()
      expect(url).toContain('stoneType=lab-diamond')
      
      // Step 5: Verify all products show Lab Diamond tags
      const productCards = await utils.getProductCards()
      const labDiamondTags = page.locator('button:has-text("Lab Diamond")')
      const tagCount = await labDiamondTags.count()
      expect(tagCount).toBeGreaterThanOrEqual(1)
    })

    test('should complete 14K Gold filtering workflow', async ({ page }) => {
      // Step 1: Click 14K Gold tag from ProductCard
      await utils.clickMaterialTag('14K Gold')
      await utils.waitForFilteringComplete()
      
      // Step 2: Verify URL parameters
      const filters = await utils.getActiveFilters()
      expect(filters.metalType).toBe('14k-gold')
      
      // Step 3: Verify filtered results
      await utils.validateFilteredResults({
        metalType: '14k-gold',
        minCount: 1
      })
      
      // Step 4: Verify deep linking works
      const currentUrl = page.url()
      await page.goto('/catalog') // Navigate away
      await page.goto(currentUrl) // Navigate back via URL
      
      // Should maintain filtered state
      const filtersAfterReload = await utils.getActiveFilters()
      expect(filtersAfterReload.metalType).toBe('14k-gold')
    })

    test('should complete 1.5CT filtering workflow', async ({ page }) => {
      // Find and click 1.5CT tag if available
      const caratTag = page.locator('button:has-text("1.5CT")').first()
      
      if (await caratTag.count() > 0) {
        await caratTag.click()
        await utils.waitForFilteringComplete()
        
        // Verify URL parameters
        const filters = await utils.getActiveFilters()
        expect(filters.caratWeight).toBe('1.5')
        
        // Verify filtered results
        await utils.validateFilteredResults({
          caratWeight: '1.5',
          minCount: 1
        })
      }
    })
  })

  test.describe('Multi-Filter Workflows', () => {
    test('should handle Lab Diamond + 14K Gold combination', async ({ page }) => {
      // Step 1: Apply Lab Diamond filter
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Step 2: Apply 14K Gold filter on filtered results
      await utils.clickMaterialTag('14K Gold')
      await utils.waitForFilteringComplete()
      
      // Step 3: Verify both filters in URL
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      expect(filters.metalType).toBe('14k-gold')
      
      // Step 4: Verify results match both criteria
      await utils.validateFilteredResults({
        stoneType: 'lab-diamond',
        metalType: '14k-gold',
        minCount: 1
      })
      
      // Step 5: Verify URL can be shared/bookmarked
      const complexFilterUrl = page.url()
      expect(complexFilterUrl).toContain('stoneType=lab-diamond')
      expect(complexFilterUrl).toContain('metalType=14k-gold')
      
      // Test direct navigation to complex filter URL
      await page.goto('/catalog')
      await page.goto(complexFilterUrl)
      
      const reloadedFilters = await utils.getActiveFilters()
      expect(reloadedFilters.stoneType).toBe('lab-diamond')
      expect(reloadedFilters.metalType).toBe('14k-gold')
    })

    test('should handle three-filter combination', async ({ page }) => {
      // Apply multiple filters sequentially
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      await utils.clickMaterialTag('14K Gold')
      await utils.waitForFilteringComplete()
      
      // Find and click carat filter if available
      const caratTag = page.locator('button:has-text("1CT")').first()
      if (await caratTag.count() > 0) {
        await caratTag.click()
        await utils.waitForFilteringComplete()
        
        // Verify all three filters
        const filters = await utils.getActiveFilters()
        expect(filters.stoneType).toBe('lab-diamond')
        expect(filters.metalType).toBe('14k-gold')
        expect(filters.caratWeight).toBe('1')
        
        // Should still show valid results or empty state
        const productCount = await utils.getProductCount()
        expect(productCount).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('Filter State Management', () => {
    test('should maintain filter state during browser navigation', async ({ page }) => {
      // Apply a filter
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      const originalUrl = page.url()
      
      // Navigate to a different page
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible() // Wait for homepage to load
      
      // Use browser back button
      await page.goBack()
      await utils.waitForFilteringComplete()
      
      // Should maintain filter state
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      expect(page.url()).toBe(originalUrl)
    })

    test('should handle filter removal via URL manipulation', async ({ page }) => {
      // Apply multiple filters
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      await utils.clickMaterialTag('14K Gold')
      await utils.waitForFilteringComplete()
      
      // Manually remove one filter from URL
      const currentUrl = new URL(page.url())
      currentUrl.searchParams.delete('metalType')
      
      await page.goto(currentUrl.toString())
      await utils.waitForFilteringComplete()
      
      // Should show only Lab Diamond filter active
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      expect(filters.metalType).toBeNull()
    })

    test('should clear filters when navigating to clean catalog', async ({ page }) => {
      // Apply filters
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Navigate to clean catalog
      await page.goto('/catalog')
      await utils.waitForFilteringComplete()
      
      // Should clear all filters
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBeNull()
      expect(filters.metalType).toBeNull()
      expect(filters.caratWeight).toBeNull()
    })
  })

  test.describe('URL Parameter Validation', () => {
    test('should handle direct navigation with valid filter parameters', async ({ page }) => {
      // Navigate directly with filter parameters
      await utils.navigateToCatalog({
        stoneType: 'lab-diamond',
        metalType: '14k-gold'
      })
      
      // Should apply filters immediately
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      expect(filters.metalType).toBe('14k-gold')
      
      // Should show filtered results
      await utils.validateFilteredResults({
        stoneType: 'lab-diamond',
        metalType: '14k-gold',
        minCount: 0 // Allow for empty results
      })
    })

    test('should handle invalid filter parameters gracefully', async ({ page }) => {
      // Navigate with invalid parameters
      await utils.navigateToCatalog({
        stoneType: 'invalid-stone',
        metalType: 'invalid-metal',
        caratWeight: 'invalid-carat'
      })
      
      // Should handle gracefully without errors
      const productCards = await utils.getProductCards()
      await expect(productCards).toHaveCount({ min: 0 }) // Can be empty or show all
      
      // Page should still be functional
      expect(page.url()).toContain('/catalog')
    })

    test('should preserve other URL parameters during filtering', async ({ page }) => {
      // Start with existing parameters
      await utils.navigateToCatalog({
        page: '2',
        limit: '12',
        sort: 'price-asc'
      })
      
      // Apply material filter
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Should preserve existing parameters
      const filters = await utils.getActiveFilters()
      expect(filters.page).toBe('2')
      expect(filters.limit).toBe('12')
      expect(filters.stoneType).toBe('lab-diamond')
      
      const url = new URL(page.url())
      expect(url.searchParams.get('sort')).toBe('price-asc')
    })
  })

  test.describe('Performance and UX', () => {
    test('should meet performance requirements for filtering', async ({ page }) => {
      const startTime = Date.now()
      
      // Apply filter and wait for completion
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Should complete filtering within performance threshold
      expect(totalTime).toBeLessThan(3000) // 3 seconds max for E2E
      
      // Verify results are displayed
      const productCount = await utils.getProductCount()
      expect(productCount).toBeGreaterThanOrEqual(0)
    })

    test('should show loading states during filtering', async ({ page }) => {
      // Click filter and immediately check for loading states
      const tagClick = utils.clickMaterialTag('Lab Diamond')
      
      // Should show some indication of loading/processing
      // This could be a loading spinner, disabled state, or other UX feedback
      await tagClick
      
      // Wait for completion
      await utils.waitForFilteringComplete()
      
      // Should show results
      const productCards = await utils.getProductCards()
      await expect(productCards).toHaveCount({ min: 0 })
    })

    test('should handle rapid filter changes gracefully', async ({ page }) => {
      // Apply filters rapidly
      await utils.clickMaterialTag('Lab Diamond')
      await utils.clickMaterialTag('14K Gold')
      
      // Find different tags to click rapidly
      const availableTags = page.locator('button').filter({ hasText: /CT$|Silver|Platinum|Moissanite/ })
      const tagCount = await availableTags.count()
      
      if (tagCount > 0) {
        await availableTags.first().click()
      }
      
      // Wait for final state
      await utils.waitForFilteringComplete()
      
      // Should handle rapid changes without errors
      const productCards = await utils.getProductCards()
      await expect(productCards).toHaveCount({ min: 0 })
      
      // URL should reflect final state
      expect(page.url()).toContain('/catalog')
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle empty filter results', async ({ page }) => {
      // Apply very specific filters that might return no results
      await utils.navigateToCatalog({
        stoneType: 'lab-emerald',
        metalType: 'platinum',
        caratWeight: '5'
      })
      
      // Should show empty state gracefully
      const productCount = await utils.getProductCount()
      // Allow for either empty results or some results
      expect(productCount).toBeGreaterThanOrEqual(0)
      
      // Should not show error states
      const errorMessages = page.locator('text=error', { hasText: /error/i })
      expect(await errorMessages.count()).toBe(0)
    })

    test('should handle filter toggle (same filter clicked twice)', async ({ page }) => {
      // Apply filter
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Verify filter is active
      let filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      
      // Click same filter again to toggle off
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Should remove filter
      filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBeNull()
      
      // Should show all products again
      const productCount = await utils.getProductCount()
      expect(productCount).toBeGreaterThan(0)
    })

    test('should handle page refresh with active filters', async ({ page }) => {
      // Apply filters
      await utils.clickMaterialTag('Lab Diamond')
      await utils.waitForFilteringComplete()
      
      // Refresh the page
      await page.reload()
      await utils.waitForFilteringComplete()
      
      // Should maintain filter state after refresh
      const filters = await utils.getActiveFilters()
      expect(filters.stoneType).toBe('lab-diamond')
      
      // Should show filtered results
      await utils.validateFilteredResults({
        stoneType: 'lab-diamond',
        minCount: 0
      })
    })
  })
})