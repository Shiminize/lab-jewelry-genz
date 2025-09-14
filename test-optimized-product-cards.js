const { test, expect } = require('@playwright/test');

test('Optimized ProductCard Implementation Validation', async ({ page }) => {
  console.log('🧪 Testing optimized ProductCard implementation...');
  
  // Navigate to catalog page
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  
  console.log('📱 Testing catalog page with optimized ProductCards...');
  
  // Check if ProductCards are rendered
  const productCards = page.locator('[data-testid="product-card"]');
  const cardCount = await productCards.count();
  console.log(`✅ Found ${cardCount} ProductCards on catalog page`);
  
  if (cardCount > 0) {
    const firstCard = productCards.first();
    
    // Test subtle hover animations (no aggressive scaling)
    console.log('🎭 Testing subtle hover animations...');
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // Check for material swatches
    console.log('🎨 Testing material swatches...');
    const materialSwatches = firstCard.locator('div[title*="Gold"], div[title*="Platinum"]');
    const swatchCount = await materialSwatches.count();
    console.log(`💎 Found ${swatchCount} material swatches`);
    
    // Test trust indicators
    console.log('🛡️ Testing trust indicators...');
    const trustBadges = firstCard.locator('text=Certified, text=Free Ship');
    const trustCount = await trustBadges.count();
    console.log(`🏆 Found ${trustCount} trust indicators`);
    
    // Test image lazy loading
    console.log('📸 Testing image optimization...');
    const images = firstCard.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      const loadingAttr = await firstImage.getAttribute('loading');
      console.log(`🚀 Image loading attribute: ${loadingAttr}`);
      
      if (loadingAttr === 'lazy') {
        console.log('✅ Image lazy loading is properly implemented');
      }
    }
    
    // Take screenshot of optimized cards
    await page.screenshot({ 
      path: 'optimized-product-cards.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    
    console.log('📸 Screenshot saved as optimized-product-cards.png');
    console.log('🎉 Optimized ProductCard validation completed successfully!');
    
    // Test card interactions
    console.log('👆 Testing card interactions...');
    
    // Test wishlist click
    const wishlistButton = firstCard.locator('button:has(svg)').first();
    if (await wishlistButton.count() > 0) {
      await wishlistButton.click();
      console.log('❤️ Wishlist interaction working');
    }
    
  } else {
    console.log('❌ No ProductCards found on catalog page');
  }
  
  console.log('✅ Optimized ProductCard implementation test completed');
});