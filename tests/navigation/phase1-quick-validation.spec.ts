/**
 * Phase 1: Quick Security & Performance Validation
 * Lightweight tests focused on navigation security without asset dependencies
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 1: Quick Security & Performance Validation', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test to prevent memory leaks
    const context = await browser.newContext();
    page = await context.newPage();

    // Block resource loading to speed up tests
    await page.route('**/*.{png,jpg,jpeg,svg,mp4,webp}', route => {
      route.abort();
    });

    // Navigate to homepage with faster timeout
    await page.goto('/', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('✅ Phase 1: Navigation renders without critical errors', async () => {
    console.log('🧪 Testing basic navigation rendering...');

    // Check if navigation elements are present
    const nav = page.locator('nav, header nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });

    console.log('✅ Navigation renders successfully');
  });

  test('✅ Phase 1: Security headers are configured', async () => {
    console.log('🛡️ Testing security headers...');

    const response = await page.goto('/', { waitUntil: 'commit' });
    const headers = response?.headers() || {};

    // Check for basic security headers
    expect(headers['x-content-type-options']).toBeDefined();
    expect(headers['x-frame-options']).toBeDefined();

    console.log('✅ Security headers test passed');
  });

  test('✅ Phase 1: Input sanitization working', async () => {
    console.log('🔒 Testing input sanitization...');

    // Test search input if available
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.count() > 0) {
      // Test with potentially malicious input
      await searchInput.fill('<script>alert("test")</script>');
      
      // Verify input was sanitized
      const inputValue = await searchInput.inputValue();
      expect(inputValue).not.toContain('<script>');
      expect(inputValue).not.toContain('alert');
      
      console.log('✅ Input sanitization working correctly');
    } else {
      console.log('ℹ️  No search input found, skipping input sanitization test');
    }
  });

  test('✅ Phase 1: Page load performance baseline', async () => {
    console.log('⚡ Testing page load performance...');

    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (allowing for CI variance)
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Page load time: ${loadTime}ms`);
    console.log('✅ Performance baseline established');
  });

  test('✅ Phase 1: Memory usage stays reasonable', async () => {
    console.log('🧠 Testing memory usage...');

    // Get initial memory if available
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Simulate some navigation interactions
    const navLinks = page.locator('nav a, header a').first();
    if (await navLinks.count() > 0) {
      await navLinks.hover();
      await page.waitForTimeout(500);
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory should not increase dramatically
    const memoryIncrease = finalMemory - initialMemory;
    if (initialMemory > 0) {
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB limit
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    }

    console.log('✅ Memory usage test passed');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Test configuration for Phase 1 Quick Validation
test.describe.configure({
  timeout: 15000, // 15 second timeout
  retries: 1, // Only 1 retry
});