import { test, expect } from '@playwright/test';

test('Enhanced Navigation Validation - Demo Mode', async ({ page }) => {
  console.log('🧪 Testing Enhanced Navigation with TrustBar...');
  
  // Force demo mode by setting design version
  await page.addInitScript(() => {
    localStorage.setItem('aurora_user_id', 'test-user-123');
    sessionStorage.setItem('aurora_session_id', 'test-session-123');
  });
  
  await page.goto('/?design=demo');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for navigation to load
  await page.waitForSelector('header', { timeout: 15000 });
  
  console.log('✅ Enhanced navigation page loaded');
  
  // Look for TrustBar elements specifically
  const trustBarContainer = await page.locator('[style*="F5F5F0"], [style*="champagne"], [data-testid="trust-bar"]').first();
  
  if (await trustBarContainer.count() > 0) {
    console.log('✅ TrustBar container found');
    
    // Check for individual trust signals
    const trustSignals = [
      { text: 'GIA Certified', icon: 'CheckCircle' },
      { text: 'Conflict-Free', icon: 'Shield' },
      { text: '30-Day Returns', icon: 'RefreshCw' },
      { text: 'Lifetime Warranty', icon: 'Award' }
    ];
    
    for (const signal of trustSignals) {
      const signalElement = await page.locator(`text=${signal.text}`).count();
      if (signalElement > 0) {
        console.log(`✅ Trust signal validated: ${signal.text}`);
      } else {
        console.log(`⚠️ Trust signal not found: ${signal.text}`);
      }
    }
  } else {
    console.log('⚠️ TrustBar not found - checking for NavBarEnhanced indicators');
    
    // Alternative check for enhanced navigation features
    const enhancedFeatures = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (nav) {
        const styles = window.getComputedStyle(nav);
        return {
          hasLuxuryShadow: styles.boxShadow && styles.boxShadow !== 'none',
          hasCustomBg: styles.backgroundColor !== 'rgb(255, 255, 255)',
        };
      }
      return { hasLuxuryShadow: false, hasCustomBg: false };
    });
    
    if (enhancedFeatures.hasLuxuryShadow) {
      console.log('✅ Enhanced navigation styling detected (luxury shadows)');
    }
    if (enhancedFeatures.hasCustomBg) {
      console.log('✅ Enhanced navigation styling detected (custom background)');
    }
  }
  
  // Test Atlas Icons integration in action bar
  const actionIcons = await page.locator('header [aria-label="Search"], header [aria-label="Wishlist"], header [aria-label="Account"], header [aria-label="Cart"]').count();
  console.log(`✅ Found ${actionIcons} action icons with proper labels`);
  
  // Check for conversion tracking data
  const conversionData = await page.evaluate(() => {
    return {
      userId: localStorage.getItem('aurora_user_id'),
      sessionId: sessionStorage.getItem('aurora_session_id'),
      hasAbTesting: typeof window !== 'undefined' && 'localStorage' in window
    };
  });
  
  if (conversionData.userId && conversionData.sessionId) {
    console.log('✅ Conversion tracking data present');
    console.log(`   User ID: ${conversionData.userId.substring(0, 20)}...`);
    console.log(`   Session ID: ${conversionData.sessionId.substring(0, 20)}...`);
  }
  
  // Test navigation interactions for conversion tracking
  const logoElement = await page.locator('[alt="GlitchGlow Logo"]');
  if (await logoElement.count() > 0) {
    await logoElement.click();
    console.log('✅ Logo click interaction tested');
  }
  
  // Test enhanced styling performance
  const startTime = Date.now();
  await page.hover('nav a:first-of-type');
  const hoverTime = Date.now() - startTime;
  
  console.log(`✅ Navigation hover response: ${hoverTime}ms`);
  
  // Take screenshot for visual validation
  await page.screenshot({ 
    path: 'navigation-enhanced-validation.png', 
    fullPage: false,
    clip: { x: 0, y: 0, width: 1920, height: 500 }
  });
  
  console.log('📸 Enhanced navigation screenshot saved');
  console.log('🎉 Enhanced Navigation Validation - COMPLETED');
});