const { test, expect } = require('@playwright/test');

test('Check Current A/B Test Assignment', async ({ page }) => {
  console.log('🔍 Checking your A/B test assignment...\n');
  
  // Navigate to the site
  await page.goto('http://localhost:3001/');
  await page.waitForLoadState('networkidle');
  
  // Get A/B test data from localStorage
  const abTestData = await page.evaluate(() => {
    const userId = localStorage.getItem('aurora_user_id');
    const sessionId = sessionStorage.getItem('aurora_session_id');
    
    // Simple hash function to determine group
    function simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }
    
    const group = userId ? (simpleHash(userId) % 100 < 50 ? 'demo' : 'control') : 'unknown';
    
    return {
      userId,
      sessionId,
      calculatedGroup: group,
      userIdHash: userId ? simpleHash(userId) % 100 : null
    };
  });
  
  console.log('📊 A/B Test Assignment Details:');
  console.log('================================');
  console.log(`User ID: ${abTestData.userId?.substring(0, 30)}...`);
  console.log(`Session ID: ${abTestData.sessionId?.substring(0, 30)}...`);
  console.log(`Hash Value: ${abTestData.userIdHash} (< 50 = demo, >= 50 = control)`);
  console.log(`Assigned Group: ${abTestData.calculatedGroup.toUpperCase()}`);
  console.log('================================\n');
  
  // Check what navigation is actually rendered
  const trustBarExists = await page.locator('[style*="F5F5F0"]').count();
  const navBarEnhancedIndicators = await page.locator('[data-testid="trust-bar"], .trust-bar').count();
  
  if (trustBarExists > 0 || navBarEnhancedIndicators > 0) {
    console.log('✅ ENHANCED NAVIGATION (NavBarEnhanced) is currently showing');
    console.log('   - Trust bar with signals detected');
    
    // Check for trust signals
    const trustSignals = ['GIA Certified', 'Conflict-Free', '30-Day Returns', 'Lifetime Warranty'];
    for (const signal of trustSignals) {
      const exists = await page.locator(`text="${signal}"`).count();
      if (exists > 0) {
        console.log(`   ✓ ${signal}`);
      }
    }
  } else {
    console.log('❌ CONTROL NAVIGATION (standard NavBar) is currently showing');
    console.log('   - No trust bar detected');
  }
  
  console.log('\n💡 To force the demo navigation:');
  console.log('================================');
  if (abTestData.calculatedGroup === 'control') {
    console.log('You are currently in the CONTROL group.');
    console.log('Options to see the enhanced navigation:');
    console.log('1. Clear localStorage to get a new user ID (might still get control)');
    console.log('2. Manually set localStorage to force demo group');
    console.log('3. Modify the A/B test to 100% traffic split for demo');
  } else {
    console.log('You are in the DEMO group but enhanced navigation is not showing.');
    console.log('This might be a rendering issue. Check browser console for errors.');
  }
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'current-navigation-state.png', 
    fullPage: false,
    clip: { x: 0, y: 0, width: 1920, height: 300 }
  });
  
  console.log('\n📸 Screenshot saved as current-navigation-state.png');
});

console.log('\n🧪 A/B Test Assignment Checker');
console.log('================================');
console.log('This test will show you which A/B test group you\'re assigned to');
console.log('and whether you should be seeing the enhanced navigation.\n');
console.log('Run with: npx playwright test test-check-ab-assignment.js --project=chromium');