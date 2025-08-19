/**
 * Phase 1 E2E Test: Product Type System
 * Tests the new unified type system and mapper functions
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 1: Product Type System Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog page
    await page.goto('/catalog')
  })

  test('Catalog page loads with new type system', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that products are displayed
    const productCards = page.locator('[data-testid="product-card"]')
    
    // Verify we have products showing
    await expect(productCards.first()).toBeVisible({ timeout: 10000 })
    
    // Check that product images are loading using a more specific selector
    const productImage = productCards.first().locator('img').first()
    await expect(productImage).toBeVisible()
    
    // Verify image src doesn't contain "undefined" (which would indicate property access issues)
    const imageSrc = await productImage.getAttribute('src')
    expect(imageSrc).not.toContain('undefined')
    expect(imageSrc).not.toBe('')
  })

  test('Product search functionality works with new types', async ({ page }) => {
    // Wait for search component
    await page.waitForSelector('input[placeholder*="Search"]')
    
    // Search for a product
    await page.fill('input[placeholder*="Search"]', 'ring')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Verify results are displayed
    const results = page.locator('[data-testid="product-card"], .group.cursor-pointer')
    const resultCount = await results.count()
    
    expect(resultCount).toBeGreaterThan(0)
  })

  test('Product pricing displays correctly', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')
    
    // Get first product price
    const priceElement = page.locator('text=/\\$[0-9,]+/').first()
    await expect(priceElement).toBeVisible()
    
    // Verify price format
    const priceText = await priceElement.textContent()
    expect(priceText).toMatch(/\$[0-9,]+/)
  })

  test('No TypeScript runtime errors in console', async ({ page }) => {
    const consoleErrors: string[] = []
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Navigate and wait for page to fully load
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('service-worker') &&
      !error.includes('404')
    )
    
    console.log('Console errors:', criticalErrors)
    
    // Should have no critical TypeScript-related errors
    expect(criticalErrors.length).toBe(0)
  })
})

test.describe('Phase 1: API Integration Test', () => {
  test('Products API returns unified format', async ({ request }) => {
    // Test the products API endpoint
    const response = await request.get('/api/products?limit=5')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    
    // Verify CLAUDE_RULES envelope format
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('pagination')
    expect(data).toHaveProperty('meta')
    
    // Verify products have unified structure
    if (data.data && data.data.length > 0) {
      const product = data.data[0]
      
      // Should have unified properties (not both media AND images)
      expect(product).toHaveProperty('primaryImage') // ProductListDTO
      expect(product).toHaveProperty('pricing')
      expect(product.pricing).toHaveProperty('basePrice')
      
      // Should NOT have the old conflicting properties
      expect(product).not.toHaveProperty('media')
      expect(product).not.toHaveProperty('images')
    }
  })
})

test.describe('Phase 1: Component Integration', () => {
  test('ProductCard renders without property access errors', async ({ page }) => {
    await page.goto('/catalog')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    // Verify product card structure
    const productCard = page.locator('[data-testid="product-card"]').first()
    await expect(productCard).toBeVisible()
    
    // Verify image renders correctly
    const productImage = productCard.locator('img').first()
    await expect(productImage).toBeVisible()
    
    // Verify name and price are present (use more specific selectors)
    const productName = productCard.locator('p, h3, h2').first()
    await expect(productName).toBeVisible()
    
    const productPrice = productCard.locator('text=/\\$[0-9,]+/')
    await expect(productPrice).toBeVisible()
  })

  test('No undefined property access in product display', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Check for any elements containing "undefined" text
    const undefinedElements = page.locator('text=undefined')
    const undefinedCount = await undefinedElements.count()
    
    expect(undefinedCount).toBe(0)
    
    // Check for any images with undefined src
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i)
      const src = await img.getAttribute('src')
      
      if (src) {
        expect(src).not.toContain('undefined')
        expect(src.length).toBeGreaterThan(0)
      }
    }
  })
})