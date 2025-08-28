const { test, expect } = require('@playwright/test');

test('Phase 1: Mega-Menu Debug Test', async ({ page }) => {
  console.log('🔧 Debug: Testing mega-menu implementation...');
  
  // Navigate to homepage
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  console.log('✅ Page loaded');
  
  // Check if AuroraNavigation is rendered
  const navigation = page.locator('nav');
  await expect(navigation).toBeVisible();
  console.log('✅ Navigation found');
  
  // Check if rings navigation item exists
  const ringsNav = page.locator('[data-testid="rings-nav-item"]');
  await expect(ringsNav).toBeVisible();
  console.log('✅ Rings nav item found');
  
  // Hover over rings item
  await page.hover('[data-testid="rings-nav-item"]');
  console.log('✅ Hovered on rings nav item');
  
  // Wait a moment for mega-menu to appear
  await page.waitForTimeout(300);
  
  // Check if mega-menu appears
  const megaMenu = page.locator('[data-testid="mega-menu"]');
  const megaMenuCount = await megaMenu.count();
  console.log(`Mega-menu count: ${megaMenuCount}`);
  
  if (megaMenuCount > 0) {
    const isVisible = await megaMenu.isVisible();
    console.log(`Mega-menu visible: ${isVisible}`);
    
    if (isVisible) {
      // Check for columns
      const columns = page.locator('[data-testid="mega-menu-columns"]');
      const columnsCount = await columns.count();
      console.log(`Columns count: ${columnsCount}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'debug-mega-menu-success.png',
        fullPage: true 
      });
      console.log('✅ Mega-menu working - screenshot saved');
    } else {
      console.log('❌ Mega-menu exists but not visible');
    }
  } else {
    console.log('❌ Mega-menu element not found in DOM');
  }
  
  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(1000);
  
  if (errors.length > 0) {
    console.log('🚨 Console errors found:');
    errors.forEach(error => console.log('  -', error));
  } else {
    console.log('✅ No console errors detected');
  }
  
  // Take debug screenshot
  await page.screenshot({ 
    path: 'debug-hover-state.png',
    fullPage: true 
  });
  
  console.log('🎉 Debug test completed');
});