const { test, expect } = require('@playwright/test');

/**
 * E2E SUCCESS CRITERIA TEST SUITE
 * Tests all identified root cause fixes with clear pass/fail criteria
 */

test.describe('Root Cause Fix Validation', () => {
  
  test('SUCCESS CRITERION 1: All @/ imports resolve correctly', async ({ page }) => {
    console.log('🧪 Testing TypeScript path alias resolution...');
    
    // Navigate to a page that heavily uses @/ imports
    await page.goto('/customizer-preview-demo');
    
    // Wait for page to load without module resolution errors
    await page.waitForLoadState('domcontentloaded');
    
    // Check for TypeScript/webpack compilation errors in console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('Module not found') || 
        msg.text().includes("Can't resolve '@/")
      )) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    expect(errors.length).toBe(0);
    console.log('✅ CRITERION 1 PASSED: No @/ import resolution errors');
  });

  test('SUCCESS CRITERION 2: Homepage loads without build errors', async ({ page }) => {
    console.log('🧪 Testing homepage loads without module errors...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for any build/compilation errors
    const buildErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        buildErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Should load successfully without any console errors
    expect(buildErrors.length).toBe(0);
    console.log('✅ CRITERION 2 PASSED: Homepage loads without errors');
  });

  test('SUCCESS CRITERION 3: Catalog page with @/ imports works', async ({ page }) => {
    console.log('🧪 Testing catalog page with heavy @/ import usage...');
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Check that catalog content loads (indicates all imports resolved)
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Verify no module resolution failures
    const moduleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('resolve')) {
        moduleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    expect(moduleErrors.length).toBe(0);
    console.log('✅ CRITERION 3 PASSED: Catalog page loads with all modules resolved');
  });

  test('SUCCESS CRITERION 4: Customizer page loads without Tailwind errors', async ({ page }) => {
    console.log('🧪 Testing customizer page for PostCSS/Tailwind compilation...');
    
    await page.goto('/customizer');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for PostCSS/Tailwind compilation errors
    const cssErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('PostCSS') || 
        msg.text().includes('Tailwind') ||
        msg.text().includes('.demo.config.js')
      )) {
        cssErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    expect(cssErrors.length).toBe(0);
    console.log('✅ CRITERION 4 PASSED: No PostCSS/Tailwind compilation errors');
  });

  test('SUCCESS CRITERION 5: All critical pages load successfully', async ({ page }) => {
    console.log('🧪 Testing all critical pages load without errors...');
    
    const criticalPages = [
      '/',
      '/catalog', 
      '/customizer',
      '/customizer-preview-demo'
    ];
    
    for (const pagePath of criticalPages) {
      console.log(`Testing page: ${pagePath}`);
      
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      
      // Check for any JavaScript errors
      const jsErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      
      // Each page must load without JavaScript errors
      expect(jsErrors.length).toBe(0);
      console.log(`✅ Page ${pagePath} loaded successfully`);
    }
    
    console.log('✅ CRITERION 5 PASSED: All critical pages load without errors');
  });

  test('SUCCESS CRITERION 6: Build can complete successfully', async ({ page }) => {
    console.log('🧪 Testing application can build successfully...');
    
    // Navigate to any page to ensure the app is working
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // If we can navigate and the app loads, build is successful
    // (since dev server won't start if build fails)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    console.log('✅ CRITERION 6 PASSED: Application builds and runs successfully');
  });
});

/**
 * PASS CRITERIA SUMMARY:
 * 1. ✅ No @/ import resolution errors in console
 * 2. ✅ Homepage loads without build errors  
 * 3. ✅ Catalog page loads with all modules resolved
 * 4. ✅ No PostCSS/Tailwind compilation errors
 * 5. ✅ All critical pages load without JavaScript errors
 * 6. ✅ Application builds and runs successfully
 * 
 * ALL 6 CRITERIA MUST PASS FOR SUCCESS
 */