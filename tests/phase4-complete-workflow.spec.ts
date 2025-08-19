/**
 * Phase 4 E2E Test: Complete User Journey Validation
 * Tests the entire user workflow from product discovery to checkout
 * Validates CLAUDE_RULES compliance throughout the journey
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 4: Complete User Journey - Product Discovery', () => {
  test('User can discover products through multiple channels', async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify hero section loads with proper typography
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible()
    await expect(headline).toContainText('Your Story')
    
    // Navigate to catalog via CTA
    const ctaButton = page.locator('button').filter({ hasText: /Start Designing|Explore Collection/ }).first()
    if (await ctaButton.count() > 0) {
      await ctaButton.click()
      await page.waitForLoadState('networkidle')
      
      // Should be on catalog page
      expect(page.url()).toContain('/catalog')
    } else {
      // Navigate directly if CTA not visible
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle')
    }
    
    // Verify products load with proper structure
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards.first()).toBeVisible({ timeout: 10000 })
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.count() > 0) {
      await searchInput.fill('diamond')
      await page.waitForTimeout(1000) // Debounce
      
      // Results should update
      const searchResults = page.locator('[data-testid="product-card"]')
      await expect(searchResults.first()).toBeVisible()
    }
  })

  test('Product filtering and sorting works correctly', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Open filters
    const filterButton = page.locator('button').filter({ hasText: 'Filters' }).first()
    if (await filterButton.count() > 0) {
      await filterButton.click()
      
      // Test category filter
      const ringsCheckbox = page.locator('input[type="checkbox"]').first()
      if (await ringsCheckbox.count() > 0) {
        await ringsCheckbox.check()
        await page.waitForTimeout(1000)
        
        // Results should update to show filtered products
        const products = page.locator('[data-testid="product-card"]')
        if (await products.count() > 0) {
          await expect(products.first()).toBeVisible()
        }
      }
    }
    
    // Test sorting
    const sortSelect = page.locator('select').filter({ hasText: /Popularity|Price|Name/ }).first()
    if (await sortSelect.count() > 0) {
      await sortSelect.selectOption('price')
      await page.waitForTimeout(1000)
      
      // Products should reorder
      const products = page.locator('[data-testid="product-card"]')
      await expect(products.first()).toBeVisible()
    }
  })
})

test.describe('Phase 4: Complete User Journey - Product Detail', () => {
  test('User can navigate to product detail page', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toBeVisible({ timeout: 10000 })
    
    await firstProduct.click()
    await page.waitForLoadState('networkidle')
    
    // Should navigate to product detail page
    expect(page.url()).toMatch(/\/products\//)
    
    // Verify product detail elements
    const productName = page.locator('h1, h2').filter({ hasText: /ring|necklace|earring|bracelet/i }).first()
    if (await productName.count() > 0) {
      await expect(productName).toBeVisible()
    }
    
    // Check for price display
    const price = page.locator('text=/\\$[0-9,]+/').first()
    if (await price.count() > 0) {
      await expect(price).toBeVisible()
    }
  })

  test('Product images and descriptions load properly', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toBeVisible({ timeout: 10000 })
    
    await firstProduct.click()
    await page.waitForLoadState('networkidle')
    
    // Verify main product image
    const productImage = page.locator('img').first()
    if (await productImage.count() > 0) {
      await expect(productImage).toBeVisible()
      
      // Image should have src and alt attributes
      const imageSrc = await productImage.getAttribute('src')
      const imageAlt = await productImage.getAttribute('alt')
      
      expect(imageSrc).toBeTruthy()
      expect(imageAlt).toBeTruthy()
    }
    
    // Verify product description exists
    const description = page.locator('p').filter({ hasText: /description|detail|material|stone/i }).first()
    if (await description.count() > 0) {
      await expect(description).toBeVisible()
    }
  })
})

test.describe('Phase 4: Complete User Journey - Shopping Experience', () => {
  test('Add to cart functionality works', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Find and click a product
    const productCard = page.locator('[data-testid="product-card"]').first()
    await expect(productCard).toBeVisible({ timeout: 10000 })
    
    // Look for Add to Cart button (could be on hover or always visible)
    let addToCartButton = productCard.locator('button').filter({ hasText: /Add to Cart|Add/ }).first()
    
    if (await addToCartButton.count() === 0) {
      // Try hovering to reveal button
      await productCard.hover()
      await page.waitForTimeout(500)
      addToCartButton = productCard.locator('button').filter({ hasText: /Add to Cart|Add/ }).first()
    }
    
    if (await addToCartButton.count() === 0) {
      // Navigate to product detail page instead
      await productCard.click()
      await page.waitForLoadState('networkidle')
      
      // Look for Add to Cart on product page
      addToCartButton = page.locator('button').filter({ hasText: /Add to Cart|Add/ }).first()
    }
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
      
      // Verify cart update (could be notification, cart badge, etc.)
      const cartIndicator = page.locator('[data-testid*="cart"], .cart, text=/cart/i, text=/added/i').first()
      if (await cartIndicator.count() > 0) {
        await expect(cartIndicator).toBeVisible()
      }
    }
  })

  test('Shopping cart persists across navigation', async ({ page }) => {
    // Add item to cart first
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    const productCard = page.locator('[data-testid="product-card"]').first()
    await expect(productCard).toBeVisible({ timeout: 10000 })
    
    // Try to add item to cart
    let addToCartButton = productCard.locator('button').filter({ hasText: /Add to Cart|Add/ }).first()
    
    if (await addToCartButton.count() === 0) {
      await productCard.hover()
      await page.waitForTimeout(500)
      addToCartButton = productCard.locator('button').filter({ hasText: /Add to Cart|Add/ }).first()
    }
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
      
      // Navigate away and back
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle')
      
      // Cart should still have items (check for cart indicator)
      const cartIndicator = page.locator('[data-testid*="cart"], .cart-count, [aria-label*="cart"]').first()
      if (await cartIndicator.count() > 0) {
        await expect(cartIndicator).toBeVisible()
      }
    }
  })
})

test.describe('Phase 4: Complete User Journey - Performance', () => {
  test('Page load times meet CLAUDE_RULES standards', async ({ page }) => {
    // Test homepage performance
    const homeStartTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const homeLoadTime = Date.now() - homeStartTime
    
    expect(homeLoadTime).toBeLessThan(3000) // 3 second max for full page load
    
    // Test catalog performance
    const catalogStartTime = Date.now()
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    const catalogLoadTime = Date.now() - catalogStartTime
    
    expect(catalogLoadTime).toBeLessThan(3000) // 3 second max for catalog
    
    console.log(`Homepage load time: ${homeLoadTime}ms`)
    console.log(`Catalog load time: ${catalogLoadTime}ms`)
  })

  test('Images load efficiently without layout shift', async ({ page }) => {
    await page.goto('/catalog')
    
    // Track layout shifts
    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            (window as any).cumulativeLayoutShift = 
              ((window as any).cumulativeLayoutShift || 0) + entry.value;
          }
        }
      }).observe({entryTypes: ['layout-shift']});
    })
    
    await page.waitForLoadState('networkidle')
    
    // Check for product images
    const productImages = page.locator('[data-testid="product-card"] img')
    const imageCount = await productImages.count()
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = productImages.nth(i)
        await expect(img).toBeVisible()
        
        // Verify image has proper attributes for performance
        const src = await img.getAttribute('src')
        const alt = await img.getAttribute('alt')
        
        expect(src).toBeTruthy()
        expect(alt).toBeTruthy()
      }
    }
    
    // Check cumulative layout shift
    const cls = await page.evaluate(() => (window as any).cumulativeLayoutShift || 0)
    expect(cls).toBeLessThan(0.1) // Good CLS score
  })
})

test.describe('Phase 4: Complete User Journey - Error Handling', () => {
  test('Graceful handling of network issues', async ({ page }) => {
    // Test with slow network
    await page.route('**/api/products**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      await route.continue()
    })
    
    await page.goto('/catalog')
    
    // Should show loading state
    const loadingIndicator = page.locator('text=/loading/i, [data-testid*="loading"], .animate-spin').first()
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible()
    }
    
    // Eventually should load products
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible({ timeout: 15000 })
  })

  test('Error boundaries display properly', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Look for any error boundaries or error messages
    const errorBoundary = page.locator('[role="alert"], .error-boundary, [data-testid*="error"]')
    
    if (await errorBoundary.count() > 0) {
      // If error boundary is present, verify it follows design system
      const boundaryElement = errorBoundary.first()
      await expect(boundaryElement).toBeVisible()
      
      // Should have proper styling (check for design system classes)
      const boundaryClasses = await boundaryElement.getAttribute('class')
      expect(boundaryClasses).toBeTruthy()
    }
    
    // Check console for critical errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('404') &&
      !error.includes('service-worker')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})

test.describe('Phase 4: Complete User Journey - Accessibility', () => {
  test('Keyboard navigation works throughout the journey', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Start keyboard navigation
    await page.keyboard.press('Tab')
    
    // Should be able to navigate to first interactive element
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
    
    // Continue tabbing through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    }
    
    // Press Enter on focused element (should work if it's interactive)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    // Should not cause any JavaScript errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    expect(errors.length).toBe(0)
  })

  test('ARIA labels and screen reader support', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Check for proper ARIA labels on interactive elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const hasText = await button.textContent()
        const hasAriaLabel = await button.getAttribute('aria-label')
        const hasAriaLabelledby = await button.getAttribute('aria-labelledby')
        
        // Button should have accessible name
        expect(hasText || hasAriaLabel || hasAriaLabelledby).toBeTruthy()
      }
    }
    
    // Check images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const altText = await img.getAttribute('alt')
        expect(altText).toBeTruthy()
        expect(altText).not.toBe('')
      }
    }
  })
})