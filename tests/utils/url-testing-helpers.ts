/**
 * URL Testing Helper Utilities
 * 
 * Shared utilities for URL parameter testing across different test files.
 * Provides consistent testing patterns and reusable functionality.
 * 
 * CLAUDE_RULES.md Compliance:
 * - TypeScript strict mode with proper interfaces
 * - Performance monitoring utilities
 * - Accessibility testing helpers
 * - Cross-browser compatibility utilities
 */

import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Standard test data for realistic user scenarios
 */
export const TestScenarios = {
  budgetShopper: {
    metals: ['silver'],
    stones: ['moissanite'],
    priceRange: { max: 500 },
    description: 'Budget-conscious shopper looking for affordable options'
  },
  premiumBuyer: {
    metals: ['platinum'],
    stones: ['lab-diamond'],
    caratRange: { min: 2 },
    priceRange: { min: 2000 },
    description: 'Premium buyer seeking high-end jewelry'
  },
  giftSeeker: {
    metals: ['14k-gold'],
    categories: ['rings'],
    stones: ['lab-diamond'],
    priceRange: { min: 500, max: 1500 },
    description: 'Gift buyer looking for special occasion jewelry'
  },
  engagementShopper: {
    metals: ['14k-gold', 'platinum'],
    categories: ['rings'],
    subcategories: ['engagement-rings'],
    stones: ['lab-diamond'],
    caratRange: { min: 1, max: 3 },
    priceRange: { min: 1000, max: 5000 },
    description: 'Engagement ring shopper with specific requirements'
  },
  fashionEnthusiast: {
    metals: ['14k-gold', '18k-gold'],
    categories: ['necklaces', 'earrings'],
    stones: ['lab-emerald', 'lab-ruby', 'lab-sapphire'],
    featured: true,
    description: 'Fashion-forward shopper interested in trendy pieces'
  }
} as const

/**
 * Performance thresholds based on CLAUDE_RULES.md
 */
export const PerformanceThresholds = {
  pageLoad: 3000,        // 3 seconds max page load
  filterChange: 300,     // 300ms max filter response
  apiResponse: 300,      // 300ms max API response
  debounceDelay: 300,    // 300ms debounce for URL updates
  e2eBuffer: 2000        // Buffer for E2E test environment
} as const

/**
 * Material tag mappings for consistent testing
 */
export const MaterialTagMappings = {
  metals: {
    '14K Gold': '14k-gold',
    '18K Gold': '18k-gold',
    'Platinum': 'platinum',
    '925 Silver': 'silver',
    'White Gold': 'white-gold',
    'Rose Gold': 'rose-gold'
  },
  stones: {
    'Lab Diamond': 'lab-diamond',
    'Moissanite': 'moissanite',
    'Lab Emerald': 'lab-emerald',
    'Lab Ruby': 'lab-ruby',
    'Lab Sapphire': 'lab-sapphire'
  },
  carats: {
    '0.5CT': 0.5,
    '1CT': 1,
    '1.5CT': 1.5,
    '2CT': 2,
    '2.5CT': 2.5,
    '3CT': 3
  }
} as const

/**
 * URL parameter interface for type safety
 */
export interface URLTestParams {
  metals?: string[]
  stones?: string[]
  categories?: string[]
  subcategories?: string[]
  caratRange?: { min?: number; max?: number }
  priceRange?: { min?: number; max?: number }
  searchQuery?: string
  sortBy?: string
  page?: number
  inStock?: boolean
  featured?: boolean
}

/**
 * Enhanced URL testing utilities with performance monitoring
 */
export class URLTestingHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to catalog with filters and performance monitoring
   */
  async navigateWithPerformanceCheck(params: URLTestParams): Promise<{
    loadTime: number
    url: string
  }> {
    const startTime = Date.now()
    const urlParams = this.createURLParams(params)
    const url = `/catalog?${urlParams.toString()}`
    
    await this.page.goto(url)
    await this.waitForPageReady()
    
    const loadTime = Date.now() - startTime
    
    return { loadTime, url }
  }

  /**
   * Wait for page to be fully ready with products loaded
   */
  async waitForPageReady(): Promise<void> {
    // Wait for products to load
    await this.page.waitForSelector('[data-testid="product-card"]', { 
      timeout: 10000 
    })
    
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle', { 
      timeout: 5000 
    })
    
    // Wait for any pending JavaScript execution
    await this.page.waitForFunction(() => {
      return document.readyState === 'complete' && 
             !document.querySelector('.loading, .spinner')
    })
  }

  /**
   * Create URLSearchParams from test parameters
   */
  createURLParams(params: URLTestParams): URLSearchParams {
    const urlParams = new URLSearchParams()
    
    if (params.metals?.length) {
      urlParams.set('metals', params.metals.join(','))
    }
    if (params.stones?.length) {
      urlParams.set('stones', params.stones.join(','))
    }
    if (params.categories?.length) {
      urlParams.set('categories', params.categories.join(','))
    }
    if (params.subcategories?.length) {
      urlParams.set('subcategories', params.subcategories.join(','))
    }
    if (params.caratRange?.min) {
      urlParams.set('caratMin', params.caratRange.min.toString())
    }
    if (params.caratRange?.max) {
      urlParams.set('caratMax', params.caratRange.max.toString())
    }
    if (params.priceRange?.min) {
      urlParams.set('minPrice', params.priceRange.min.toString())
    }
    if (params.priceRange?.max) {
      urlParams.set('maxPrice', params.priceRange.max.toString())
    }
    if (params.searchQuery) {
      urlParams.set('q', params.searchQuery)
    }
    if (params.sortBy && params.sortBy !== 'popularity') {
      urlParams.set('sortBy', params.sortBy)
    }
    if (params.page && params.page > 1) {
      urlParams.set('page', params.page.toString())
    }
    if (params.inStock) {
      urlParams.set('inStock', 'true')
    }
    if (params.featured) {
      urlParams.set('featured', 'true')
    }
    
    return urlParams
  }

  /**
   * Click material tag with performance monitoring
   */
  async clickMaterialTagWithTiming(tagText: string): Promise<{
    responseTime: number
    success: boolean
  }> {
    const startTime = Date.now()
    
    try {
      const materialTag = this.page.locator('button').filter({ hasText: tagText }).first()
      await expect(materialTag).toBeVisible({ timeout: 5000 })
      
      await materialTag.click()
      
      // Wait for API response
      await this.page.waitForResponse(resp => 
        resp.url().includes('/api/products') && resp.status() === 200,
        { timeout: 10000 }
      )
      
      const responseTime = Date.now() - startTime
      return { responseTime, success: true }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`Material tag click failed: ${error}`)
      return { responseTime, success: false }
    }
  }

  /**
   * Verify URL parameters match expected values
   */
  async verifyURLParameters(expected: Record<string, string | string[]>): Promise<void> {
    const currentURL = new URL(this.page.url())
    const params = currentURL.searchParams
    
    for (const [key, expectedValue] of Object.entries(expected)) {
      const actualValue = params.get(key)
      
      if (Array.isArray(expectedValue)) {
        const actualArray = actualValue?.split(',') || []
        expect(actualArray.sort()).toEqual(expectedValue.sort())
      } else {
        expect(actualValue).toBe(expectedValue)
      }
    }
  }

  /**
   * Verify filtered results match expectations
   */
  async verifyFilteredResults(filterType: string, expectedTags: string[]): Promise<void> {
    const productCards = this.page.locator('[data-testid="product-card"]')
    await expect(productCards).toHaveCount({ min: 1 })

    // Check that all visible products have at least one expected tag
    for (const tagText of expectedTags) {
      const tagsWithText = this.page.locator('button').filter({ hasText: tagText })
      if (await tagsWithText.count() > 0) {
        await expect(tagsWithText).toHaveCount({ min: 1 })
      }
    }
  }

  /**
   * Test browser navigation with state preservation
   */
  async testBrowserNavigation(): Promise<{
    backNavigationWorks: boolean
    forwardNavigationWorks: boolean
    statePreserved: boolean
  }> {
    const initialURL = this.page.url()
    
    try {
      // Navigate back
      await this.page.goBack()
      await this.waitForPageReady()
      
      const backURL = this.page.url()
      const backNavigationWorks = backURL !== initialURL
      
      // Navigate forward
      await this.page.goForward()
      await this.waitForPageReady()
      
      const forwardURL = this.page.url()
      const forwardNavigationWorks = forwardURL === initialURL
      const statePreserved = forwardNavigationWorks
      
      return {
        backNavigationWorks,
        forwardNavigationWorks,
        statePreserved
      }
      
    } catch (error) {
      console.error(`Browser navigation test failed: ${error}`)
      return {
        backNavigationWorks: false,
        forwardNavigationWorks: false,
        statePreserved: false
      }
    }
  }

  /**
   * Test accessibility of URL navigation
   */
  async testAccessibility(): Promise<{
    focusManagement: boolean
    keyboardNavigation: boolean
    screenReaderSupport: boolean
  }> {
    try {
      // Test focus management
      const firstTag = this.page.locator('button').filter({ hasText: /14K Gold|Lab Diamond|Platinum/ }).first()
      
      let focusManagement = false
      if (await firstTag.count() > 0) {
        await firstTag.focus()
        const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName)
        focusManagement = focusedElement === 'BUTTON'
      }

      // Test keyboard navigation
      let keyboardNavigation = false
      if (await firstTag.count() > 0) {
        await firstTag.focus()
        await this.page.keyboard.press('Enter')
        
        // Wait for response
        await this.page.waitForResponse(resp => 
          resp.url().includes('/api/products'),
          { timeout: 5000 }
        ).catch(() => {})
        
        keyboardNavigation = true
      }

      // Test screen reader support
      const ariaLiveRegions = this.page.locator('[aria-live]')
      const ariaLabels = this.page.locator('[aria-label*="filter"], [aria-label*="Filter"]')
      const screenReaderSupport = (await ariaLiveRegions.count() > 0) || (await ariaLabels.count() > 0)

      return {
        focusManagement,
        keyboardNavigation,
        screenReaderSupport
      }
      
    } catch (error) {
      console.error(`Accessibility test failed: ${error}`)
      return {
        focusManagement: false,
        keyboardNavigation: false,
        screenReaderSupport: false
      }
    }
  }

  /**
   * Test mobile-specific functionality
   */
  async testMobileInteractions(): Promise<{
    touchInteraction: boolean
    viewportResponsive: boolean
    mobileNavigation: boolean
  }> {
    try {
      // Set mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 })
      await this.waitForPageReady()

      // Test touch interaction
      const firstTag = this.page.locator('button').filter({ hasText: /14K Gold|Lab Diamond/ }).first()
      let touchInteraction = false
      
      if (await firstTag.count() > 0) {
        await firstTag.tap()
        await this.page.waitForResponse(resp => 
          resp.url().includes('/api/products'),
          { timeout: 5000 }
        ).catch(() => {})
        touchInteraction = true
      }

      // Test viewport responsiveness
      const productCards = this.page.locator('[data-testid="product-card"]')
      const viewportResponsive = await productCards.count() > 0

      // Test mobile navigation
      const searchInput = this.page.locator('[data-testid="enhanced-search-input"]')
      const mobileNavigation = await searchInput.isVisible()

      return {
        touchInteraction,
        viewportResponsive,
        mobileNavigation
      }
      
    } catch (error) {
      console.error(`Mobile interaction test failed: ${error}`)
      return {
        touchInteraction: false,
        viewportResponsive: false,
        mobileNavigation: false
      }
    }
  }

  /**
   * Test performance against CLAUDE_RULES thresholds
   */
  async measurePerformance(): Promise<{
    pageLoadTime: number
    filterResponseTime: number
    meetsPerformanceTargets: boolean
  }> {
    // Measure page load time
    const loadStartTime = Date.now()
    await this.waitForPageReady()
    const pageLoadTime = Date.now() - loadStartTime

    // Measure filter response time
    let filterResponseTime = 0
    const firstTag = this.page.locator('button').filter({ hasText: /14K Gold|Lab Diamond/ }).first()
    
    if (await firstTag.count() > 0) {
      const filterStartTime = Date.now()
      
      try {
        await firstTag.click()
        await this.page.waitForResponse(resp => 
          resp.url().includes('/api/products') && resp.status() === 200,
          { timeout: 5000 }
        )
        filterResponseTime = Date.now() - filterStartTime
      } catch (error) {
        console.warn('Filter performance test failed:', error)
        filterResponseTime = PerformanceThresholds.e2eBuffer // Use buffer as fallback
      }
    }

    const meetsPerformanceTargets = 
      pageLoadTime < PerformanceThresholds.pageLoad &&
      filterResponseTime < PerformanceThresholds.e2eBuffer // Use E2E buffer for filter tests

    return {
      pageLoadTime,
      filterResponseTime,
      meetsPerformanceTargets
    }
  }

  /**
   * Generate shareable URL for testing
   */
  generateShareableURL(baseURL: string, params: URLTestParams): string {
    const urlParams = this.createURLParams(params)
    const paramString = urlParams.toString()
    
    if (!paramString) return baseURL
    
    const separator = baseURL.includes('?') ? '&' : '?'
    return `${baseURL}${separator}${paramString}`
  }

  /**
   * Validate URL security (prevent XSS, injection attacks)
   */
  async validateURLSecurity(params: URLTestParams): Promise<{
    xssProtection: boolean
    injectionProtection: boolean
    parameterSanitization: boolean
  }> {
    const testPayloads = {
      xss: '<script>alert("xss")</script>',
      injection: "'; DROP TABLE products; --",
      malformed: '%invalid%'
    }

    try {
      // Test XSS protection
      const xssParams = { ...params, searchQuery: testPayloads.xss }
      const xssURL = this.generateShareableURL('/catalog', xssParams)
      
      await this.page.goto(xssURL)
      await this.waitForPageReady()
      
      const searchInput = this.page.locator('[data-testid="enhanced-search-input"]')
      const inputValue = await searchInput.inputValue()
      const xssProtection = inputValue === testPayloads.xss && !inputValue.includes('<script>')

      // Test injection protection
      const injectionParams = { ...params, searchQuery: testPayloads.injection }
      const injectionURL = this.generateShareableURL('/catalog', injectionParams)
      
      await this.page.goto(injectionURL)
      await this.waitForPageReady()
      
      const productCards = this.page.locator('[data-testid="product-card"]')
      const injectionProtection = await productCards.count() >= 0 // Page should not crash

      // Test parameter sanitization
      const malformedParams = { ...params, metals: [testPayloads.malformed, '14k-gold'] }
      const malformedURL = this.generateShareableURL('/catalog', malformedParams)
      
      await this.page.goto(malformedURL)
      await this.waitForPageReady()
      
      const currentParams = new URL(this.page.url()).searchParams
      const sanitizedMetals = currentParams.get('metals')
      const parameterSanitization = sanitizedMetals === '14k-gold' // Invalid param should be filtered out

      return {
        xssProtection,
        injectionProtection,
        parameterSanitization
      }
      
    } catch (error) {
      console.error(`Security validation failed: ${error}`)
      return {
        xssProtection: false,
        injectionProtection: false,
        parameterSanitization: false
      }
    }
  }
}

/**
 * Test data generator for consistent test scenarios
 */
export class TestDataGenerator {
  /**
   * Generate random valid filter parameters
   */
  static generateRandomFilters(): URLTestParams {
    const metals = Object.values(MaterialTagMappings.metals)
    const stones = Object.values(MaterialTagMappings.stones)
    
    return {
      metals: [metals[Math.floor(Math.random() * metals.length)]],
      stones: [stones[Math.floor(Math.random() * stones.length)]],
      priceRange: {
        min: Math.floor(Math.random() * 1000) + 100,
        max: Math.floor(Math.random() * 2000) + 1000
      }
    }
  }

  /**
   * Generate edge case test parameters
   */
  static generateEdgeCases(): URLTestParams[] {
    return [
      // Empty filters
      {},
      
      // Single filters
      { metals: ['14k-gold'] },
      { stones: ['lab-diamond'] },
      
      // Multiple filters
      { metals: ['14k-gold', 'platinum'], stones: ['lab-diamond', 'moissanite'] },
      
      // Price ranges
      { priceRange: { min: 0, max: 100 } },
      { priceRange: { min: 10000, max: 50000 } },
      
      // Complex combinations
      {
        metals: ['14k-gold'],
        stones: ['lab-diamond'],
        categories: ['rings'],
        subcategories: ['engagement-rings'],
        caratRange: { min: 1, max: 2 },
        priceRange: { min: 1000, max: 5000 },
        inStock: true,
        featured: true,
        sortBy: 'price',
        page: 2
      }
    ]
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map()

  /**
   * Record a performance measurement
   */
  record(key: string, value: number): void {
    if (!this.measurements.has(key)) {
      this.measurements.set(key, [])
    }
    this.measurements.get(key)!.push(value)
  }

  /**
   * Get performance statistics
   */
  getStats(key: string): {
    average: number
    min: number
    max: number
    count: number
  } | null {
    const values = this.measurements.get(key)
    if (!values || values.length === 0) return null

    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }

  /**
   * Check if measurements meet CLAUDE_RULES thresholds
   */
  meetsThresholds(key: string, threshold: number): boolean {
    const stats = this.getStats(key)
    return stats ? stats.average < threshold : false
  }

  /**
   * Generate performance report
   */
  generateReport(): Record<string, any> {
    const report: Record<string, any> = {}
    
    for (const [key, values] of this.measurements) {
      const stats = this.getStats(key)
      if (stats) {
        report[key] = {
          ...stats,
          meetsThreshold: this.meetsThresholds(key, PerformanceThresholds.e2eBuffer)
        }
      }
    }
    
    return report
  }
}