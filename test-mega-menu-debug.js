const { test } = require('@playwright/test');

test('Mega menu debug test', async ({ page }) => {
  console.log('🔍 Testing mega menu visibility...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  
  // Look for navigation items
  const ringNavItem = page.locator('nav a:has-text("Rings")').first();
  const navItemCount = await ringNavItem.count();
  
  console.log(`📊 Navigation items found: ${navItemCount}`);
  
  if (navItemCount > 0) {
    console.log('🖱️ Hovering over Rings navigation...');
    await ringNavItem.hover();
    
    // Wait for mega menu
    await page.waitForTimeout(500);
    
    // Check for mega menu
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    const megaMenuCount = await megaMenu.count();
    const isVisible = megaMenuCount > 0 ? await megaMenu.isVisible() : false;
    
    console.log(`🎯 Mega menu elements: ${megaMenuCount}`);
    console.log(`👁️ Mega menu visible: ${isVisible}`);
    
    // Take screenshot
    await page.screenshot({ path: 'mega-menu-debug.png' });
    console.log('📸 Screenshot saved as mega-menu-debug.png');
    
  } else {
    console.log('❌ No navigation items found');
    await page.screenshot({ path: 'navigation-debug.png' });
    console.log('📸 Navigation debug screenshot saved');
  }
});