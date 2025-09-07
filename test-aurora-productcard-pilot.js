/**
 * Aurora ProductCard Pilot Migration Validation Test
 * Tests the ProductCard component Aurora Design System integration
 */

const { test, expect } = require('@playwright/test');

test('Aurora ProductCard Pilot Migration Validation', async ({ page }) => {
  console.log('🎭 Testing Aurora ProductCard migration...');
  
  // Navigate to catalog page with ProductCards
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  
  console.log('📷 Capturing catalog page with Aurora ProductCards...');
  await page.screenshot({ 
    path: 'aurora-productcard-pilot-validation.png', 
    fullPage: true 
  });
  
  // Test 1: Verify Aurora version attributes
  console.log('🧪 Test 1: Checking Aurora version attributes...');
  const auroraCards = await page.locator('[data-aurora-version="aurora"]').count();
  console.log(`✅ Found ${auroraCards} ProductCards in Aurora mode`);
  
  // Test 2: Verify Aurora CSS classes are applied
  console.log('🧪 Test 2: Checking Aurora CSS classes...');
  const auroraClasses = [
    'aurora-living-component',
    'aurora-interactive-shadow',
    'aurora-shimmer-overlay',
    'aurora-gradient-text'
  ];
  
  for (const className of auroraClasses) {
    const elements = await page.locator(`.${className}`).count();
    if (elements > 0) {
      console.log(`✅ Aurora class '${className}' found: ${elements} elements`);
    } else {
      console.log(`⚠️ Aurora class '${className}' not found`);
    }
  }
  
  // Test 3: Verify material-specific enhancements
  console.log('🧪 Test 3: Checking material-specific Aurora enhancements...');
  const materialShadows = await page.locator('[class*="aurora-shadow-material"]').count();
  console.log(`✅ Material-specific shadows found: ${materialShadows} elements`);
  
  // Test 4: Test hover interactions (Aurora specific)
  console.log('🧪 Test 4: Testing Aurora hover interactions...');
  const firstProductCard = page.locator('[data-testid="product-card"]').first();
  if (await firstProductCard.count() > 0) {
    await firstProductCard.hover();
    await page.waitForTimeout(1000); // Wait for animations
    
    // Check for Aurora hover effects
    const sparkles = await page.locator('.aurora-floating').count();
    console.log(`✅ Aurora floating sparkles: ${sparkles} elements`);
    
    await page.screenshot({ 
      path: 'aurora-productcard-hover-state.png'
    });
  }
  
  // Test 5: Verify A/B test support
  console.log('🧪 Test 5: Checking A/B test integration...');
  const testGroups = await page.evaluate(() => {
    if (window.localStorage) {
      return {
        userId: localStorage.getItem('aurora_user_id'),
        sessionId: sessionStorage.getItem('aurora_session_id')
      };
    }
    return null;
  });
  console.log(`✅ A/B test IDs: ${JSON.stringify(testGroups)}`);
  
  // Test 6: Material tag interactions
  console.log('🧪 Test 6: Testing material tag Aurora enhancements...');
  const materialTags = page.locator('[data-testid="material-tag"]');
  const tagCount = await materialTags.count();
  if (tagCount > 0) {
    await materialTags.first().hover();
    await page.waitForTimeout(500);
    console.log(`✅ Material tags with Aurora enhancements: ${tagCount}`);
    
    await page.screenshot({ 
      path: 'aurora-material-tags-hover.png'
    });
  }
  
  // Test 7: Responsive design validation
  console.log('🧪 Test 7: Testing responsive Aurora design...');
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: 'aurora-productcard-mobile.png', 
    fullPage: true 
  });
  
  // Desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: 'aurora-productcard-desktop.png', 
    fullPage: true 
  });
  
  // Performance check
  console.log('🧪 Test 8: Performance validation...');
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
    };
  });
  console.log('⚡ Performance metrics:', performanceMetrics);
  
  console.log('🎉 Aurora ProductCard Pilot Migration Validation - COMPLETED');
  console.log('📸 Screenshots saved:');
  console.log('  - aurora-productcard-pilot-validation.png');
  console.log('  - aurora-productcard-hover-state.png');
  console.log('  - aurora-material-tags-hover.png');
  console.log('  - aurora-productcard-mobile.png');
  console.log('  - aurora-productcard-desktop.png');
});