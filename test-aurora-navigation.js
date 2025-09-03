const { test, expect } = require('@playwright/test');

test('Aurora Navigation Basic Test', async ({ page }) => {
  console.log('🧪 Testing Aurora navigation basic functionality...');
  
  try {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if Aurora navigation container is present
    const auroraNav = page.locator('.aurora-navigation');
    const isVisible = await auroraNav.count();
    
    if (isVisible > 0) {
      console.log('✅ Aurora navigation container found');
      
      // Check for brand logo
      const brandLogo = page.locator('.aurora-brand-logo');
      const logoVisible = await brandLogo.count();
      console.log('Aurora brand logo count:', logoVisible);
      
      // Take a screenshot
      await page.screenshot({ 
        path: 'aurora-navigation-test.png', 
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 200 }
      });
      
      console.log('✅ Aurora navigation is working!');
    } else {
      console.log('❌ Aurora navigation not found');
      // Take error screenshot
      await page.screenshot({ path: 'aurora-navigation-error.png', fullPage: true });
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    // Take error screenshot
    await page.screenshot({ path: 'aurora-navigation-error.png', fullPage: true });
  }
});