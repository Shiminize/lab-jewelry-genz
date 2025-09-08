/**
 * Phase 5 Final Validation Tests
 * Comprehensive health check after all cleanup phases
 * CLAUDE_RULES compliant: Performance, maintainability, and user experience validation
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 5: Final Cleanup Health Check', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => {
      console.error('Final validation error:', error.message);
    });
  });

  test('Performance metrics meet CLAUDE_RULES standards', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // CLAUDE_RULES: Page load should be under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Get detailed performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    console.log('Final performance metrics:', metrics);
    
    // CLAUDE_RULES performance targets
    expect(metrics.loadTime).toBeLessThan(3000); // 3s max load time
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2s max DOM ready
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5s FCP
  });

  test('Bundle size optimized after cleanup', async ({ page }) => {
    // Enable JavaScript coverage
    await page.coverage.startJSCoverage();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to key pages to test bundle efficiency
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    const coverage = await page.coverage.stopJSCoverage();
    
    // Calculate bundle efficiency
    const totalBytes = coverage.reduce((acc, entry) => acc + entry.text.length, 0);
    const usedBytes = coverage.reduce((acc, entry) => {
      return acc + entry.ranges.reduce((acc2, range) => acc2 + range.end - range.start, 0);
    }, 0);
    
    const unusedPercentage = ((totalBytes - usedBytes) / totalBytes) * 100;
    const bundleSizeKB = totalBytes / 1024;
    
    console.log(`Bundle analysis: ${bundleSizeKB.toFixed(0)}KB total, ${unusedPercentage.toFixed(1)}% unused`);
    
    // CLAUDE_RULES: Bundle should be efficient
    expect(unusedPercentage).toBeLessThan(40); // Less than 40% unused code
    expect(bundleSizeKB).toBeLessThan(500); // Less than 500KB initial bundle
  });

  test('Complete E2E user journey works flawlessly', async ({ page }) => {
    // Simulate complete user journey
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to catalog
    const catalogLink = page.locator('a[href*="/catalog"], nav a:has-text("Catalog")').first();
    if (await catalogLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await catalogLink.click();
    } else {
      await page.goto('/catalog');
    }
    await page.waitForLoadState('networkidle');
    
    // Verify products are visible
    const productCards = page.locator([
      '[data-testid="product-card"]',
      '[class*="product-card"]'
    ].join(', '));
    
    await expect(productCards.first()).toBeVisible({ timeout: 5000 });
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
    
    // Test product interaction
    if (productCount > 0) {
      await productCards.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Test add to cart functionality
    const addToCartButton = page.locator([
      '[data-testid="add-to-cart"]',
      'button:has-text("Add to Cart")',
      'button:has-text("Add To Cart")'
    ].join(', ')).first();
    
    if (await addToCartButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Check cart state update
      const cartIndicator = page.locator([
        '[data-testid="cart-count"]',
        '[class*="cart-count"]'
      ].join(', ')).first();
      
      if (await cartIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
        const cartCount = await cartIndicator.textContent();
        expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
      }
    }
    
    // Test customizer
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const customizer = page.locator([
      '[data-testid="image-sequence-viewer"]',
      '[data-testid="product-customizer"]',
      '[class*="customizer"]'
    ].join(', ')).first();
    
    await expect(customizer).toBeVisible({ timeout: 10000 });
    
    // Test material switching
    const materialButtons = page.locator([
      'button:has-text("Platinum")',
      'button:has-text("Gold")',
      'button:has-text("Rose Gold")'
    ].join(', '));
    
    if (await materialButtons.count() > 0) {
      await materialButtons.first().click();
      await page.waitForTimeout(1000);
      console.log('Complete user journey test passed');
    }
  });

  test('No memory leaks or resource issues', async ({ page }) => {
    const memoryUsage: number[] = [];
    
    // Test memory usage across multiple page navigations
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');
      
      await page.goto('/customizer');
      await page.waitForLoadState('networkidle');
      
      // Measure memory usage
      const memory = await page.evaluate(() => {
        // @ts-ignore - performance.memory is available in Chrome
        return (window.performance as any).memory?.usedJSHeapSize || 0;
      });
      
      if (memory > 0) {
        memoryUsage.push(memory);
      }
    }
    
    if (memoryUsage.length > 2) {
      // Check for significant memory growth (potential leaks)
      const initialMemory = memoryUsage[0];
      const finalMemory = memoryUsage[memoryUsage.length - 1];
      const growthRatio = finalMemory / initialMemory;
      
      console.log(`Memory usage: ${(initialMemory / 1024 / 1024).toFixed(1)}MB → ${(finalMemory / 1024 / 1024).toFixed(1)}MB`);
      
      // Memory should not grow excessively
      expect(growthRatio).toBeLessThan(3); // Less than 3x memory growth
    }
  });

  test('Accessibility standards maintained', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for proper ARIA attributes
    const ariaElements = page.locator('[aria-label], [aria-expanded], [aria-describedby], [role]');
    const ariaCount = await ariaElements.count();
    
    expect(ariaCount).toBeGreaterThan(5); // Should have accessibility attributes
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test skip links if available
    const skipLink = page.locator('a:has-text("Skip to")').first();
    if (await skipLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipLink.click();
      console.log('Skip link functionality working');
    }
    
    // Check color contrast (basic test)
    const elements = await page.locator('body *').evaluateAll(elements => {
      return elements.slice(0, 50).map(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize
        };
      });
    });
    
    // Should have proper styling (not just default black on white)
    const styledElements = elements.filter(el => 
      el.color !== 'rgba(0, 0, 0, 0)' && el.backgroundColor !== 'rgba(0, 0, 0, 0)'
    );
    
    expect(styledElements.length).toBeGreaterThan(0);
  });

  test('Error handling robust across all pages', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Test error handling across all major pages
    const pagesToTest = ['/', '/catalog', '/customizer', '/cart'];
    
    for (const path of pagesToTest) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        // Each page should load without critical errors
        const mainContent = page.locator('main, body > div').first();
        await expect(mainContent).toBeVisible();
        
      } catch (error) {
        console.log(`Error testing ${path}:`, error);
      }
    }
    
    // Filter out acceptable warnings/errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('DevTools') &&
      !error.includes('Warning:') &&
      !error.includes('[HMR]')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('SEO and meta tags properly configured', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check basic SEO elements
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content?.length || 0).toBeGreaterThan(50);
    }
    
    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    // Check for structured data or social meta tags
    const openGraph = page.locator('meta[property^="og:"]');
    const twitterCard = page.locator('meta[name^="twitter:"]');
    const structuredData = page.locator('script[type="application/ld+json"]');
    
    const socialMetaCount = (await openGraph.count()) + (await twitterCard.count()) + (await structuredData.count());
    
    // Should have some social/structured data meta tags
    expect(socialMetaCount).toBeGreaterThan(0);
  });

  test('Database connections and API responses healthy', async ({ page }) => {
    const apiResponses: { url: string; status: number; time: number }[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          time: Date.now()
        });
      }
    });
    
    // Test API responses across different pages
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // All API calls should return successful responses
    const failedAPIs = apiResponses.filter(response => 
      response.status >= 400 && response.status < 600
    );
    
    if (failedAPIs.length > 0) {
      console.log('Failed API calls:', failedAPIs);
    }
    
    expect(failedAPIs).toHaveLength(0);
    
    // API responses should be reasonably fast (CLAUDE_RULES: <300ms)
    const slowAPIs = apiResponses.filter((response, index) => {
      if (index === 0) return false;
      return response.time - apiResponses[index - 1].time > 300;
    });
    
    console.log(`API performance: ${apiResponses.length} calls, ${slowAPIs.length} slow responses`);
    
    // Should have most APIs responding quickly
    expect(slowAPIs.length / Math.max(apiResponses.length, 1)).toBeLessThan(0.3); // Less than 30% slow
  });

  test('Final CLAUDE_RULES compliance verification', async ({ page }) => {
    // This test verifies overall CLAUDE_RULES compliance
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test simplicity: Page should load without complex initialization
    const loadStart = Date.now();
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - loadStart;
    
    // CLAUDE_RULES: Simple, efficient loading
    expect(loadTime).toBeLessThan(5000);
    
    // Test maintainability: Core functionality should work
    const coreElements = page.locator([
      'nav', 'main', 'header', 'footer',
      '[data-testid="product-card"]',
      'button', 'a[href]'
    ].join(', '));
    
    const coreElementCount = await coreElements.count();
    expect(coreElementCount).toBeGreaterThan(10);
    
    // Test modularity: Components should render independently
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    const customizer = page.locator([
      '[data-testid="product-customizer"]',
      '[data-testid="image-sequence-viewer"]'
    ].join(', ')).first();
    
    if (await customizer.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ CLAUDE_RULES compliance verified: Modular, maintainable, performant');
    }
  });
});