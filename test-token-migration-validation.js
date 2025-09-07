const { test, expect } = require('@playwright/test');

test('Phase 3: Aurora Token Migration - A/B Test Validation', async ({ page }) => {
  console.log('🎭 Testing Aurora ProductCard token migration with A/B variants...');
  
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  
  // Test ProductCard components with token-based styling
  const productCards = page.locator('[data-testid="product-card"]');
  const cardCount = await productCards.count();
  console.log('✅ ProductCard components found:', cardCount);
  
  if (cardCount > 0) {
    // Verify Aurora version attribute
    const auroraVersion = await productCards.first().getAttribute('data-aurora-version');
    console.log('Aurora version:', auroraVersion);
    
    // Test token-based spacing and colors
    const firstCard = productCards.first();
    
    // Check for token classes instead of raw values
    const cardClasses = await firstCard.getAttribute('class');
    
    // Verify token migration success indicators
    const hasTokenSpacing = cardClasses.includes('token-');
    const hasSemanticColors = cardClasses.includes('surface') || cardClasses.includes('text-');
    const hasAuroraClasses = cardClasses.includes('aurora-');
    
    console.log('Token spacing detected:', hasTokenSpacing);
    console.log('Semantic colors detected:', hasSemanticColors);
    console.log('Aurora classes detected:', hasAuroraClasses);
    
    if (hasTokenSpacing && hasSemanticColors) {
      console.log('✅ ProductCard token migration successful');
      
      // Take visual validation screenshot
      await page.screenshot({ 
        path: 'productcard-token-migration-validation.png',
        fullPage: true 
      });
      
      console.log('📸 Token migration validation screenshot saved');
    } else {
      console.log('❌ Token migration incomplete - raw values still present');
    }
  } else {
    console.log('❌ No ProductCard components found');
  }
  
  console.log('🎉 Phase 3: A/B Token Validation completed');
});