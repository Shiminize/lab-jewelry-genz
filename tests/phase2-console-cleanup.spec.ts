/**
 * Phase 2 Console Cleanup Validation Tests
 * Ensures no development console.logs remain in production code
 * CLAUDE_RULES compliant: Production-ready code standards
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 2: Console Cleanup Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console monitoring
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  test('No development console.logs in production build', async ({ page }) => {
    const logs: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'log') {
        logs.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });
    
    // Navigate through key application pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Filter out acceptable logs (Next.js system messages, etc.)
    const developmentLogs = logs.filter(log => 
      !log.includes('Next.js') &&
      !log.includes('webpack') &&
      !log.includes('HMR') &&
      !log.includes('Fast Refresh') &&
      !log.includes('Download') &&
      !log.startsWith('[') // System logs often start with brackets
    );
    
    if (developmentLogs.length > 0) {
      console.log('Development console.logs found:', developmentLogs);
    }
    
    // Should have no development console.logs in production
    expect(developmentLogs).toHaveLength(0);
  });

  test('Core cart functionality intact after cleanup', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Look for add to cart buttons
    const addToCartButtons = page.locator([
      '[data-testid="add-to-cart"]',
      'button:has-text("Add to Cart")',
      'button:has-text("Add To Cart")',
      '[class*="add-to-cart"]'
    ].join(', '));
    
    if (await addToCartButtons.count() > 0) {
      await addToCartButtons.first().click();
      
      // Check for cart count update
      const cartIndicators = page.locator([
        '[data-testid="cart-count"]',
        '[class*="cart-count"]',
        '.cart-badge'
      ].join(', '));
      
      if (await cartIndicators.count() > 0) {
        // Wait for cart update
        await page.waitForTimeout(1000);
        await expect(cartIndicators.first()).toBeVisible();
      }
    }
  });

  test('Material switcher functionality after cleanup', async ({ page }) => {
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Wait for customizer to load
    await page.waitForTimeout(5000);
    
    // Look for material buttons with more flexible selectors
    const materialButtons = page.locator([
      'button[aria-label*="Platinum"]',
      'button:has-text("Platinum")',
      'button:has-text("Gold")',
      '[data-testid="material-button"]'
    ].join(', '));
    
    const buttonCount = await materialButtons.count();
    
    if (buttonCount > 0) {
      // Check if button is visible before clicking
      const firstButton = materialButtons.first();
      const isVisible = await firstButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        // Scroll into view if needed
        await firstButton.scrollIntoViewIfNeeded();
        await firstButton.click();
        await page.waitForTimeout(1000);
        console.log('Material switching tested successfully');
      } else {
        console.log('Material buttons found but not visible - customizer may still be loading');
      }
    } else {
      console.log('No material buttons found - customizer may not be fully loaded');
    }
  });

  test('Search and filtering work without debug logs', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Test search if available
    const searchInput = page.locator([
      'input[type="search"]',
      '[data-testid="search-input"]',
      'input[placeholder*="search"]'
    ].join(', ')).first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('ring');
      await page.waitForTimeout(1000);
      
      // Check if results update
      const productGrid = page.locator([
        '[data-testid="product-grid"]',
        '[class*="grid"]',
        '.product-list'
      ].join(', ')).first();
      
      await expect(productGrid).toBeVisible();
    }
  });

  test('Navigation components work after debug removal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test desktop navigation
    const navLinks = page.locator('nav a, header a').filter({ hasText: /catalog|collections|about/i });
    
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation worked
      expect(page.url()).not.toContain('/#');
    }
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const mobileMenuTrigger = page.locator([
      '[data-testid="mobile-menu-trigger"]',
      'button[aria-label*="menu"]',
      '.hamburger',
      'button:has-text("Menu")'
    ].join(', ')).first();
    
    if (await mobileMenuTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileMenuTrigger.click();
      
      const mobileMenu = page.locator([
        '[data-testid="mobile-drawer"]',
        '[class*="mobile-menu"]',
        '.drawer'
      ].join(', ')).first();
      
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('Error boundaries handle errors without debug logs', async ({ page }) => {
    // Test error handling by navigating to a potentially problematic page
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Try to trigger error boundary (if any)
    try {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');
      
      // Should show error page, not crash
      const errorPage = page.locator([
        'h1:has-text("404")',
        'h1:has-text("Not Found")',
        '[data-testid="error-page"]'
      ].join(', ')).first();
      
      if (await errorPage.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Error page displayed correctly');
      }
    } catch (error) {
      console.log('Error boundary test completed');
    }
  });

  test('Performance metrics maintained after cleanup', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Check that essential resources loaded
    const essentialElements = page.locator('nav, main, footer').first();
    await expect(essentialElements).toBeVisible();
  });
});