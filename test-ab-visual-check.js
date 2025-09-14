const { test, expect } = require('@playwright/test');

/**
 * Quick A/B Testing Visual Check for Navigation
 * Captures screenshots and tests both variants
 */

test.describe('Navigation A/B Testing Visual Check', () => {
  test('should capture navigation variants for visual comparison', async ({ page }) => {
    console.log('🎭 Testing navigation A/B variants visually...');
    
    // Test 1: Try to get control group
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Clear any existing test assignments
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Force control group by setting specific user ID  
    await page.evaluate(() => {
      localStorage.setItem('aurora_user_id', 'control_user_test_123');
    });
    
    // Reload to apply assignment
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check if we have trust bar (test group indicator)
    const trustBarExists = await page.locator('[style*="champagne"], [style*="F5F5F0"], [style*="#F5F5F0"]').count();
    
    console.log(`Trust bar elements found: ${trustBarExists}`);
    
    // Capture first variant
    await page.screenshot({ 
      path: 'navigation-variant-1.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    
    if (trustBarExists > 0) {
      console.log('✅ Enhanced navigation (test group) captured');
    } else {
      console.log('✅ Standard navigation (control group) captured');
    }
    
    // Test 2: Try to get different group
    await page.evaluate(() => {
      localStorage.setItem('aurora_user_id', 'demo_user_test_456');
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const trustBarExists2 = await page.locator('[style*="champagne"], [style*="F5F5F0"], [style*="#F5F5F0"]').count();
    
    console.log(`Second test - Trust bar elements found: ${trustBarExists2}`);
    
    // Capture second variant  
    await page.screenshot({ 
      path: 'navigation-variant-2.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    
    if (trustBarExists2 > 0) {
      console.log('✅ Enhanced navigation (test group) captured as variant 2');
    } else {
      console.log('✅ Standard navigation (control group) captured as variant 2');
    }
    
    // Test navigation demo page
    await page.goto('http://localhost:3000/navigation-demo');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'navigation-demo-page.png', 
      fullPage: true
    });
    
    console.log('✅ Navigation demo page captured');
    
    // Check for key A/B testing elements
    const abTestData = await page.evaluate(() => {
      return {
        userId: localStorage.getItem('aurora_user_id'),
        sessionId: sessionStorage.getItem('aurora_session_id'),
        hasNavigationWrapper: document.querySelector('[data-testid*="navigation"]') !== null,
        hasHeader: document.querySelector('header') !== null
      };
    });
    
    console.log('A/B Test Data:', abTestData);
    
    console.log(`
🎭 Visual A/B Test Check Complete!
=====================================
✅ Captured navigation-variant-1.png
✅ Captured navigation-variant-2.png  
✅ Captured navigation-demo-page.png

Check these files to see the visual differences between variants.
    `);
  });

  test('should test trust bar functionality in enhanced variant', async ({ page }) => {
    console.log('🛡️ Testing trust bar functionality...');
    
    // Force test group assignment
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('aurora_user_id', 'force_test_group_999');
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Look for trust signals
    const trustSignals = [
      'GIA Certified',
      'Conflict-Free', 
      '30-Day Returns',
      'Lifetime Warranty'
    ];
    
    let foundSignals = 0;
    for (const signal of trustSignals) {
      const signalExists = await page.locator(`text=${signal}`).count();
      if (signalExists > 0) {
        foundSignals++;
        console.log(`✅ Found trust signal: ${signal}`);
        
        // Try to click it
        try {
          await page.locator(`text=${signal}`).first().click();
          console.log(`✅ Successfully clicked: ${signal}`);
        } catch (e) {
          console.log(`⚠️ Could not click: ${signal}`);
        }
      }
    }
    
    console.log(`Found ${foundSignals}/${trustSignals.length} trust signals`);
    
    // Take screenshot after interactions
    await page.screenshot({ 
      path: 'trust-bar-interaction-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 400 }
    });
    
    if (foundSignals > 0) {
      console.log('✅ Trust bar is functional in enhanced navigation');
    } else {
      console.log('ℹ️ Trust bar not visible - may be in control group');
    }
  });
});

console.log(`
🧪 Quick Navigation A/B Test Visual Checker
===========================================

This test will:
✅ Try to capture both navigation variants
✅ Test trust bar functionality  
✅ Capture the navigation demo page
✅ Save visual comparison screenshots

Run with: npx playwright test test-ab-visual-check.js --project=chromium --timeout=60000
`);