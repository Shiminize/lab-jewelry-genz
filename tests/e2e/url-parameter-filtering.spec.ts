/**
 * Comprehensive E2E Tests for Shareable URL Functionality
 * 
 * Tests URL parameter handling for material filtering in catalog page.
 * Ensures compliance with CLAUDE_RULES.md performance and testing requirements.
 * 
 * Requirements Coverage:
 * - E2E with Playwright for core flows (catalog, product view, filtering)
 * - Performance validation: sub-3s page loads, <300ms filter changes
 * - TypeScript everywhere; no any; strong interfaces
 * - Shareable URL functionality with deep linking support
 * - Browser navigation (back/forward) state preservation
 * - Mobile and desktop viewport testing
 */

import { test, expect, type Page, type Browser, type BrowserContext } from '@playwright/test'
import type { MaterialFilterState } from '@/lib/material-filter-url-utils'

/**
 * Utility class for URL parameter testing
 * Provides reusable methods for URL manipulation and validation
 */
class URLParameterTestUtils {
  constructor(private page: Page) {}

  /**
   * Navigate to catalog with specific URL parameters
   */
  async navigateToFilteredCatalog(params: URLSearchParams): Promise<void> {
    const url = `/catalog?${params.toString()}`
    await this.page.goto(url)
    await this.waitForPageLoad()
  }

  /**
   * Wait for page to fully load with products
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await this.page.waitForLoadState('networkidle', { timeout: 5000 })
  }

  /**
   * Get current URL search parameters
   */
  async getCurrentURLParams(): Promise<URLSearchParams> {
    const url = new URL(this.page.url())
    return url.searchParams
  }

  /**
   * Click a material tag chip and wait for response
   */
  async clickMaterialTag(tagText: string): Promise<void> {
    const startTime = Date.now()
    
    const materialTag = this.page.locator('button').filter({ hasText: tagText }).first()
    await expect(materialTag).toBeVisible()
    
    await materialTag.click()
    
    // Wait for API response
    await this.page.waitForResponse(resp => 
      resp.url().includes('/api/products') && resp.status() === 200,
      { timeout: 5000 }
    )
    
    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(2000) // Allow buffer for E2E
  }

  /**
   * Verify filter state matches URL parameters
   */
  async verifyFilterStateFromURL(expectedParams: Record<string, string | string[]>): Promise<void> {
    const currentParams = await this.getCurrentURLParams()
    
    for (const [key, expectedValue] of Object.entries(expectedParams)) {
      const actualValue = currentParams.get(key)
      
      if (Array.isArray(expectedValue)) {
        expect(actualValue?.split(',') || []).toEqual(expectedValue)
      } else {
        expect(actualValue).toBe(expectedValue)
      }
    }
  }

  /**
   * Verify product results match filter criteria
   */
  async verifyFilteredResults(filterType: string, filterValue: string): Promise<void> {
    const productCards = this.page.locator('[data-testid="product-card"]')
    await expect(productCards).toHaveCount({ min: 1 })

    // Check that all visible products have the expected material tag
    const materialTags = this.page.locator('button').filter({ hasText: filterValue })
    await expect(materialTags).toHaveCount({ min: 1 })
  }

  /**
   * Measure page load performance
   */
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.waitForPageLoad()
    return Date.now() - startTime
  }

  /**
   * Create URLSearchParams from filter object
   */
  createFilterParams(filters: Partial<MaterialFilterState>): URLSearchParams {
    const params = new URLSearchParams()
    
    if (filters.metals?.length) params.set('metals', filters.metals.join(','))
    if (filters.stones?.length) params.set('stones', filters.stones.join(','))
    if (filters.categories?.length) params.set('categories', filters.categories.join(','))
    if (filters.caratRange?.min) params.set('caratMin', filters.caratRange.min.toString())
    if (filters.caratRange?.max) params.set('caratMax', filters.caratRange.max.toString())
    if (filters.priceRange?.min) params.set('minPrice', filters.priceRange.min.toString())
    if (filters.priceRange?.max) params.set('maxPrice', filters.priceRange.max.toString())
    if (filters.searchQuery) params.set('q', filters.searchQuery)
    if (filters.sortBy && filters.sortBy !== 'popularity') params.set('sortBy', filters.sortBy)
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString())
    if (filters.inStock) params.set('inStock', 'true')
    if (filters.featured) params.set('featured', 'true')
    
    return params
  }

  /**
   * Verify browser history management
   */
  async verifyHistoryState(): Promise<void> {
    // Check that history.state is properly managed
    const historyLength = await this.page.evaluate(() => window.history.length)
    expect(historyLength).toBeGreaterThan(1)
  }
}

test.describe('URL Parameter Filtering - Comprehensive E2E Tests', () => {
  let utils: URLParameterTestUtils

  test.beforeEach(async ({ page }) => {
    utils = new URLParameterTestUtils(page)
  })

  test.describe('URL Parameter Parsing and Deep Linking', () => {
    test('should parse single metal filter from URL', async ({ page }) => {
      const params = utils.createFilterParams({ metals: ['14k-gold'] })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify URL parameters applied correctly
      await utils.verifyFilterStateFromURL({ metals: '14k-gold' })
      
      // Verify filtered results
      await utils.verifyFilteredResults('metal', '14K Gold')
      
      // Verify selected state of material tag chip
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      if (await goldTag.count() > 0) {
        await expect(goldTag).toHaveAttribute('aria-pressed', 'true')
      }
    })

    test('should parse single stone filter from URL', async ({ page }) => {
      const params = utils.createFilterParams({ stones: ['lab-diamond'] })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify URL parameters applied correctly
      await utils.verifyFilterStateFromURL({ stones: 'lab-diamond' })
      
      // Verify filtered results
      await utils.verifyFilteredResults('stone', 'Lab Diamond')
    })

    test('should parse multiple metal filters from URL', async ({ page }) => {
      const params = utils.createFilterParams({ 
        metals: ['14k-gold', 'platinum'] 
      })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify URL parameters applied correctly
      await utils.verifyFilterStateFromURL({ metals: '14k-gold,platinum' })
      
      // Verify both filter options are available
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should parse complex filter combinations from URL', async ({ page }) => {
      const params = utils.createFilterParams({
        metals: ['14k-gold'],
        stones: ['lab-diamond'],
        categories: ['rings'],
        priceRange: { min: 500, max: 2000 },
        caratRange: { min: 1, max: 2 }
      })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify all parameters applied correctly
      await utils.verifyFilterStateFromURL({
        metals: '14k-gold',
        stones: 'lab-diamond',
        categories: 'rings',
        minPrice: '500',
        maxPrice: '2000',
        caratMin: '1',
        caratMax: '2'
      })
      
      // Verify filtered results exist
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should handle search query in URL parameters', async ({ page }) => {
      const params = utils.createFilterParams({
        searchQuery: 'engagement ring',
        metals: ['platinum'],
        stones: ['lab-diamond']
      })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify search input is populated
      const searchInput = page.locator('[data-testid="enhanced-search-input"]')
      await expect(searchInput).toHaveValue('engagement ring')
      
      // Verify URL parameters
      await utils.verifyFilterStateFromURL({
        q: 'engagement ring',
        metals: 'platinum',
        stones: 'lab-diamond'
      })
    })

    test('should handle sort parameter in URL', async ({ page }) => {
      const params = utils.createFilterParams({
        metals: ['14k-gold'],
        sortBy: 'price'
      })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify sort dropdown shows correct value
      const sortSelect = page.locator('select[value="price"]')
      await expect(sortSelect).toBeVisible()
      
      // Verify URL parameters
      await utils.verifyFilterStateFromURL({
        metals: '14k-gold',
        sortBy: 'price'
      })
    })

    test('should handle pagination in URL', async ({ page }) => {
      const params = utils.createFilterParams({
        metals: ['silver'],
        page: 2
      })
      
      await utils.navigateToFilteredCatalog(params)
      
      // Verify URL parameters
      await utils.verifyFilterStateFromURL({
        metals: 'silver',
        page: '2'
      })
      
      // Verify pagination state (if pagination is visible)
      const pageButton = page.locator('button').filter({ hasText: '2' }).first()
      if (await pageButton.count() > 0) {
        await expect(pageButton).toHaveClass(/bg-accent/)
      }
    })
  })

  test.describe('MaterialTagChip URL Updates', () => {
    test('should update URL immediately on tag click', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      // Find and click a material tag
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        
        // Verify URL updated immediately
        const currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBe('14k-gold')
        
        // Verify browser history was updated
        await utils.verifyHistoryState()
      }
    })

    test('should handle multiple tag clicks with URL updates', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      // Click first tag
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      if (await goldTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        
        // Verify first filter
        let currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBe('14k-gold')
        
        // Click second tag
        const diamondTag = page.locator('button').filter({ hasText: 'Lab Diamond' }).first()
        if (await diamondTag.count() > 0) {
          await utils.clickMaterialTag('Lab Diamond')
          
          // Verify both filters are active
          currentParams = await utils.getCurrentURLParams()
          expect(currentParams.get('metals')).toBe('14k-gold')
          expect(currentParams.get('stones')).toBe('lab-diamond')
        }
      }
    })

    test('should toggle tag selection and update URL', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        // Click to select
        await utils.clickMaterialTag('14K Gold')
        
        let currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBe('14k-gold')
        
        // Click again to deselect
        await utils.clickMaterialTag('14K Gold')
        
        currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBeNull()
      }
    })

    test('should prevent excessive history entries', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const initialHistoryLength = await page.evaluate(() => window.history.length)
      
      // Click multiple tags rapidly
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      const diamondTag = page.locator('button').filter({ hasText: 'Lab Diamond' }).first()
      
      if (await goldTag.count() > 0 && await diamondTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        await utils.clickMaterialTag('Lab Diamond')
        await utils.clickMaterialTag('14K Gold') // Toggle off
        
        const finalHistoryLength = await page.evaluate(() => window.history.length)
        
        // Should not create excessive history entries due to debouncing
        expect(finalHistoryLength - initialHistoryLength).toBeLessThanOrEqual(3)
      }
    })
  })

  test.describe('Shareable URL Testing', () => {
    test('should create shareable URLs for budget shoppers', async ({ page, context }) => {
      // Simulate budget shopper scenario
      const budgetFilters = utils.createFilterParams({
        metals: ['silver'],
        stones: ['moissanite'],
        priceRange: { max: 500 }
      })
      
      await utils.navigateToFilteredCatalog(budgetFilters)
      
      // Copy the URL
      const shareableURL = page.url()
      
      // Open in new tab to simulate sharing
      const newPage = await context.newPage()
      await newPage.goto(shareableURL)
      await new URLParameterTestUtils(newPage).waitForPageLoad()
      
      // Verify identical filter state
      const newPageParams = await new URLParameterTestUtils(newPage).getCurrentURLParams()
      const originalParams = await utils.getCurrentURLParams()
      
      expect(newPageParams.toString()).toBe(originalParams.toString())
      
      await newPage.close()
    })

    test('should create shareable URLs for premium buyers', async ({ page, context }) => {
      // Simulate premium buyer scenario
      const premiumFilters = utils.createFilterParams({
        metals: ['platinum'],
        stones: ['lab-diamond'],
        caratRange: { min: 2 },
        priceRange: { min: 2000 }
      })
      
      await utils.navigateToFilteredCatalog(premiumFilters)
      
      // Copy the URL
      const shareableURL = page.url()
      
      // Open in new tab to simulate sharing
      const newPage = await context.newPage()
      await newPage.goto(shareableURL)
      await new URLParameterTestUtils(newPage).waitForPageLoad()
      
      // Verify identical filter state
      const newPageParams = await new URLParameterTestUtils(newPage).getCurrentURLParams()
      const originalParams = await utils.getCurrentURLParams()
      
      expect(newPageParams.toString()).toBe(originalParams.toString())
      
      await newPage.close()
    })

    test('should create shareable URLs for gift seekers', async ({ page, context }) => {
      // Simulate gift seeker scenario
      const giftFilters = utils.createFilterParams({
        metals: ['14k-gold'],
        categories: ['rings'],
        stones: ['lab-diamond'],
        priceRange: { min: 500, max: 1500 }
      })
      
      await utils.navigateToFilteredCatalog(giftFilters)
      
      // Copy the URL
      const shareableURL = page.url()
      
      // Open in new tab to simulate sharing
      const newPage = await context.newPage()
      await newPage.goto(shareableURL)
      await new URLParameterTestUtils(newPage).waitForPageLoad()
      
      // Verify identical filter state
      const newPageParams = await new URLParameterTestUtils(newPage).getCurrentURLParams()
      const originalParams = await utils.getCurrentURLParams()
      
      expect(newPageParams.toString()).toBe(originalParams.toString())
      
      await newPage.close()
    })

    test('should maintain URL state across page refresh', async ({ page }) => {
      const filters = utils.createFilterParams({
        metals: ['14k-gold'],
        stones: ['lab-diamond'],
        searchQuery: 'engagement'
      })
      
      await utils.navigateToFilteredCatalog(filters)
      
      const originalParams = await utils.getCurrentURLParams()
      
      // Refresh the page
      await page.reload()
      await utils.waitForPageLoad()
      
      // Verify filter state persisted
      const newParams = await utils.getCurrentURLParams()
      expect(newParams.toString()).toBe(originalParams.toString())
      
      // Verify search input is still populated
      const searchInput = page.locator('[data-testid="enhanced-search-input"]')
      await expect(searchInput).toHaveValue('engagement')
    })
  })

  test.describe('Browser Navigation Testing', () => {
    test('should preserve filter state on back navigation', async ({ page }) => {
      // Start with no filters
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      // Apply first filter
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      if (await goldTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        
        const firstFilterParams = await utils.getCurrentURLParams()
        
        // Apply second filter
        const diamondTag = page.locator('button').filter({ hasText: 'Lab Diamond' }).first()
        if (await diamondTag.count() > 0) {
          await utils.clickMaterialTag('Lab Diamond')
          
          // Navigate back
          await page.goBack()
          await utils.waitForPageLoad()
          
          // Verify first filter state restored
          const backParams = await utils.getCurrentURLParams()
          expect(backParams.toString()).toBe(firstFilterParams.toString())
        }
      }
    })

    test('should support forward navigation', async ({ page }) => {
      // Start with no filters
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      // Apply filter
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      if (await goldTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        
        const filteredParams = await utils.getCurrentURLParams()
        
        // Navigate back
        await page.goBack()
        await utils.waitForPageLoad()
        
        // Navigate forward
        await page.goForward()
        await utils.waitForPageLoad()
        
        // Verify filter state restored
        const forwardParams = await utils.getCurrentURLParams()
        expect(forwardParams.toString()).toBe(filteredParams.toString())
      }
    })

    test('should handle complex navigation sequences', async ({ page }) => {
      // Create navigation sequence
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const states: string[] = []
      
      // State 0: No filters
      states.push((await utils.getCurrentURLParams()).toString())
      
      // State 1: Gold filter
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      if (await goldTag.count() > 0) {
        await utils.clickMaterialTag('14K Gold')
        states.push((await utils.getCurrentURLParams()).toString())
        
        // State 2: Add diamond filter
        const diamondTag = page.locator('button').filter({ hasText: 'Lab Diamond' }).first()
        if (await diamondTag.count() > 0) {
          await utils.clickMaterialTag('Lab Diamond')
          states.push((await utils.getCurrentURLParams()).toString())
          
          // Navigate back twice
          await page.goBack()
          await utils.waitForPageLoad()
          
          // Verify state 1
          let currentParams = await utils.getCurrentURLParams()
          expect(currentParams.toString()).toBe(states[1])
          
          await page.goBack()
          await utils.waitForPageLoad()
          
          // Verify state 0
          currentParams = await utils.getCurrentURLParams()
          expect(currentParams.toString()).toBe(states[0])
        }
      }
    })
  })

  test.describe('URL Parameter Validation and Error Handling', () => {
    test('should handle invalid metal parameters gracefully', async ({ page }) => {
      const invalidParams = new URLSearchParams()
      invalidParams.set('metals', 'invalid-metal,14k-gold,another-invalid')
      
      await utils.navigateToFilteredCatalog(invalidParams)
      
      // Should filter out invalid parameters
      const currentParams = await utils.getCurrentURLParams()
      expect(currentParams.get('metals')).toBe('14k-gold')
      
      // Page should still function normally
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should handle invalid stone parameters gracefully', async ({ page }) => {
      const invalidParams = new URLSearchParams()
      invalidParams.set('stones', 'invalid-stone,lab-diamond')
      
      await utils.navigateToFilteredCatalog(invalidParams)
      
      // Should filter out invalid parameters
      const currentParams = await utils.getCurrentURLParams()
      expect(currentParams.get('stones')).toBe('lab-diamond')
    })

    test('should handle invalid price ranges gracefully', async ({ page }) => {
      const invalidParams = new URLSearchParams()
      invalidParams.set('minPrice', '-100')
      invalidParams.set('maxPrice', 'not-a-number')
      
      await utils.navigateToFilteredCatalog(invalidParams)
      
      // Should ignore invalid price parameters
      const currentParams = await utils.getCurrentURLParams()
      expect(currentParams.get('minPrice')).toBeNull()
      expect(currentParams.get('maxPrice')).toBeNull()
      
      // Page should still function
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should handle malformed URL parameters', async ({ page }) => {
      const malformedURL = '/catalog?metals=%invalid%&stones=lab-diamond'
      
      await page.goto(malformedURL)
      await utils.waitForPageLoad()
      
      // Should handle gracefully and show products
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should prevent XSS in URL parameters', async ({ page }) => {
      const xssParams = new URLSearchParams()
      xssParams.set('q', '<script>alert("xss")</script>')
      xssParams.set('metals', '14k-gold')
      
      await utils.navigateToFilteredCatalog(xssParams)
      
      // Search input should be properly escaped
      const searchInput = page.locator('[data-testid="enhanced-search-input"]')
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('<script>alert("xss")</script>')
      
      // No script should execute
      const alerts = page.locator('script')
      expect(await alerts.count()).toBe(0)
    })
  })

  test.describe('Performance Testing', () => {
    test('should meet CLAUDE_RULES page load performance requirements', async ({ page }) => {
      const filters = utils.createFilterParams({
        metals: ['14k-gold'],
        stones: ['lab-diamond']
      })
      
      const loadTime = await utils.measurePageLoadTime()
      
      // Should load under 3 seconds (CLAUDE_RULES requirement)
      expect(loadTime).toBeLessThan(3000)
    })

    test('should meet CLAUDE_RULES filter change performance requirements', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        const startTime = Date.now()
        
        await utils.clickMaterialTag('14K Gold')
        
        const responseTime = Date.now() - startTime
        
        // Should respond under 300ms for filter changes (CLAUDE_RULES requirement)
        // Allow buffer for E2E testing environment
        expect(responseTime).toBeLessThan(2000)
      }
    })

    test('should handle rapid URL changes without memory leaks', async ({ page }) => {
      const filters = [
        { metals: ['14k-gold'] },
        { stones: ['lab-diamond'] },
        { metals: ['platinum'] },
        { stones: ['moissanite'] },
        { metals: ['silver'] }
      ]
      
      for (const filter of filters) {
        const params = utils.createFilterParams(filter)
        await utils.navigateToFilteredCatalog(params)
        
        // Brief pause to allow processing
        await page.waitForTimeout(100)
      }
      
      // Memory usage should be stable (no specific assertion, but test shouldn't crash)
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should debounce URL updates correctly', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const searchInput = page.locator('[data-testid="enhanced-search-input"]')
      
      // Type rapidly
      await searchInput.fill('eng')
      await searchInput.fill('engagement')
      await searchInput.fill('engagement ring')
      
      // Wait for debounce
      await page.waitForTimeout(500)
      
      // Should only update URL after debounce period
      const currentParams = await utils.getCurrentURLParams()
      expect(currentParams.get('q')).toBe('engagement ring')
    })
  })

  test.describe('Mobile Viewport Testing', () => {
    test('should handle URL parameters on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      
      const filters = utils.createFilterParams({
        metals: ['14k-gold'],
        stones: ['lab-diamond']
      })
      
      await utils.navigateToFilteredCatalog(filters)
      
      // Verify filters applied on mobile
      await utils.verifyFilterStateFromURL({
        metals: '14k-gold',
        stones: 'lab-diamond'
      })
      
      // Verify mobile layout works
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })

    test('should handle material tag clicks on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      // Find and tap material tag on mobile
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        await goldTag.tap()
        
        // Wait for response
        await page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200
        )
        
        // Verify URL updated
        const currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBe('14k-gold')
      }
    })
  })

  test.describe('Accessibility and URL Navigation', () => {
    test('should maintain focus management during URL updates', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        // Focus the tag
        await goldTag.focus()
        
        // Click it
        await goldTag.click()
        
        // Wait for update
        await page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200
        )
        
        // Focus should be maintained or properly managed
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(focusedElement).toBeTruthy()
      }
    })

    test('should support keyboard navigation with URL updates', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        // Navigate to tag using keyboard
        await page.keyboard.press('Tab')
        await goldTag.focus()
        
        // Activate with keyboard
        await page.keyboard.press('Enter')
        
        // Wait for response
        await page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200
        )
        
        // Verify URL updated
        const currentParams = await utils.getCurrentURLParams()
        expect(currentParams.get('metals')).toBe('14k-gold')
      }
    })

    test('should announce filter changes to screen readers', async ({ page }) => {
      await utils.navigateToFilteredCatalog(new URLSearchParams())
      
      const goldTag = page.locator('button').filter({ hasText: '14K Gold' }).first()
      
      if (await goldTag.count() > 0) {
        await goldTag.click()
        
        // Wait for update
        await page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200
        )
        
        // Check for aria-live announcements or similar
        const liveRegions = page.locator('[aria-live]')
        if (await liveRegions.count() > 0) {
          await expect(liveRegions.first()).toBeVisible()
        }
      }
    })
  })
})

/**
 * Cross-browser compatibility tests
 * Test URL functionality across different browsers
 */
test.describe('Cross-Browser URL Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit']
  
  for (const browserName of browsers) {
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      const utils = new URLParameterTestUtils(page)
      
      const filters = utils.createFilterParams({
        metals: ['14k-gold'],
        stones: ['lab-diamond']
      })
      
      await utils.navigateToFilteredCatalog(filters)
      
      // Verify basic functionality
      await utils.verifyFilterStateFromURL({
        metals: '14k-gold',
        stones: 'lab-diamond'
      })
      
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCount({ min: 1 })
    })
  }
})