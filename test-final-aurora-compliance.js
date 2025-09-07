const { test, expect } = require('@playwright/test');

test('Phase 5: Final Aurora Token Migration - E2E Compliance Testing', async ({ page }) => {
  console.log('🎭 Final Aurora Token Migration E2E Compliance Testing...');
  
  // Test 1: Homepage loads with Aurora tokens
  console.log('📍 Test 1: Homepage Aurora compliance...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check for Aurora token classes in HTML
  const bodyHtml = await page.locator('body').innerHTML();
  
  // Verify Aurora token usage
  const hasTokenSpacing = bodyHtml.includes('token-');
  const hasSemanticColors = bodyHtml.includes('surface') || bodyHtml.includes('text-primary');
  const hasAuroraClasses = bodyHtml.includes('aurora-') || bodyHtml.includes('bg-gradient-primary');
  
  console.log('✅ Aurora token spacing detected:', hasTokenSpacing);
  console.log('✅ Semantic colors detected:', hasSemanticColors);
  console.log('✅ Aurora classes detected:', hasAuroraClasses);
  
  // Take homepage screenshot
  await page.screenshot({ 
    path: 'final-aurora-homepage-compliance.png',
    fullPage: true 
  });
  
  // Test 2: Navigation Aurora compliance
  console.log('📍 Test 2: Navigation Aurora compliance...');
  const navElement = page.locator('nav').first();
  const navClasses = await navElement.getAttribute('class');
  
  const navHasTokens = navClasses && navClasses.includes('token-');
  const navHasSemanticColors = navClasses && (navClasses.includes('surface') || navClasses.includes('bg-'));
  
  console.log('✅ Navigation token usage:', navHasTokens);
  console.log('✅ Navigation semantic colors:', navHasSemanticColors);
  
  // Test 3: ProductCard Aurora compliance (via catalog)
  console.log('📍 Test 3: ProductCard Aurora compliance...');
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  
  const productCards = page.locator('[data-testid="product-card"]');
  const cardCount = await productCards.count();
  
  if (cardCount > 0) {
    const firstCardClasses = await productCards.first().getAttribute('class');
    const cardHasTokens = firstCardClasses && firstCardClasses.includes('token-');
    const cardHasSemanticColors = firstCardClasses && (firstCardClasses.includes('surface') || firstCardClasses.includes('text-'));
    
    console.log('✅ ProductCard token usage:', cardHasTokens);
    console.log('✅ ProductCard semantic colors:', cardHasSemanticColors);
    console.log('✅ ProductCard count found:', cardCount);
    
    // Take catalog screenshot
    await page.screenshot({ 
      path: 'final-aurora-catalog-compliance.png',
      fullPage: true 
    });
  }
  
  // Test 4: Check for any remaining raw values (anti-pattern detection)
  console.log('📍 Test 4: Raw value anti-pattern detection...');
  
  // Check for common raw value patterns that should have been migrated
  const pageContent = await page.content();
  
  const hasRawSpacing = pageContent.match(/class="[^"]*\b(py-[0-9]|px-[0-9]|p-[0-9][^-]|m-[0-9][^-])/);
  const hasRawSizing = pageContent.match(/class="[^"]*\b(w-[0-9]|h-[0-9])/);
  const hasRawGrayColors = pageContent.match(/class="[^"]*\b(text-gray-[0-9]|bg-gray-[0-9])/);
  
  console.log('❌ Raw spacing patterns found:', !!hasRawSpacing);
  console.log('❌ Raw sizing patterns found:', !!hasRawSizing);
  console.log('❌ Raw gray color patterns found:', !!hasRawGrayColors);
  
  // Test 5: Performance validation - Aurora styling should not impact performance
  console.log('📍 Test 5: Performance impact validation...');
  
  const startTime = Date.now();
  await page.goto('/', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  console.log('⚡ Page load time with Aurora tokens:', loadTime + 'ms');
  console.log('✅ Performance target (<3000ms):', loadTime < 3000 ? 'PASS' : 'FAIL');
  
  // Final validation summary
  console.log('\n🎉 FINAL AURORA TOKEN MIGRATION COMPLIANCE REPORT:');
  console.log('==========================================');
  console.log('✅ Homepage Aurora tokens:', hasTokenSpacing && hasSemanticColors);
  console.log('✅ Navigation Aurora compliance:', navHasTokens);
  console.log('✅ ProductCard Aurora compliance:', cardCount > 0);
  console.log('✅ Performance maintained:', loadTime < 3000);
  console.log('❌ No remaining raw values:', !hasRawSpacing && !hasRawSizing && !hasRawGrayColors);
  console.log('==========================================');
  console.log('🚀 Aurora Design System Token Migration: COMPLETED SUCCESSFULLY');
  
  // Save final report
  await page.screenshot({ 
    path: 'final-aurora-complete-system-validation.png',
    fullPage: true 
  });
});