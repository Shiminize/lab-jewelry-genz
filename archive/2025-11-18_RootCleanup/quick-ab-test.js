const { test, expect } = require('@playwright/test');

/**
 * Quick A/B Test Checker - Simplified version
 */

test('Quick A/B Navigation Test', async ({ page }) => {
  console.log('🧪 Quick A/B Navigation Test Starting...');
  
  try {
    // Test the navigation demo page first (always shows enhanced nav)
    console.log('📍 Testing navigation demo page...');
    await page.goto('http://localhost:3000/navigation-demo');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take screenshot of navigation demo
    await page.screenshot({ 
      path: 'navigation-demo-enhanced.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 400 }
    });
    console.log('✅ Navigation demo screenshot saved');
    
    // Test homepage with forced control group
    console.log('📍 Testing homepage with control group...');
    await page.goto('http://localhost:3000/');
    
    // Force control group
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('aurora_user_id', 'control_test_123');
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'navigation-control-group.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    
    console.log('✅ Control group screenshot saved');
    
    // Test homepage with forced test group
    console.log('📍 Testing homepage with test group...');
    await page.evaluate(() => {
      localStorage.setItem('aurora_user_id', 'demo_test_456');
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Look for trust bar
    const trustBarExists = await page.locator('text=GIA Certified, text=Conflict-Free, text=30-Day Returns').count();
    console.log(`Trust bar elements found: ${trustBarExists}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'navigation-test-group.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    
    console.log('✅ Test group screenshot saved');
    
    // Check A/B test assignment
    const testData = await page.evaluate(() => {
      return {
        userId: localStorage.getItem('aurora_user_id'),
        sessionId: sessionStorage.getItem('aurora_session_id')
      };
    });
    
    console.log('A/B Test Assignment Data:', testData);
    
    console.log(`
🎉 Quick A/B Test Complete!
==========================
✅ navigation-demo-enhanced.png - Demo page with enhanced navigation
✅ navigation-control-group.png - Homepage with control navigation
✅ navigation-test-group.png - Homepage with test navigation

Visual Differences to Look For:
• Control Group: Standard navigation, no trust bar
• Test Group: Trust bar with champagne background + trust signals
• Demo Page: Always shows enhanced Aurora navigation
    `);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'ab-test-error.png', 
      fullPage: true 
    });
    
    console.log('📸 Error screenshot saved as ab-test-error.png');
  }
});