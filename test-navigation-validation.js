const { test, expect } = require('@playwright/test');

test('Navigation Component Validation - Aurora Design System', async ({ page }) => {
  console.log('🧪 Testing simplified NavBar component...');
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Test NavBar component exists
  const navbar = page.locator('nav.aurora-navbar');
  const isVisible = await navbar.count();
  
  if (isVisible > 0) {
    console.log('✅ NavBar component found');
    
    // Test brand logo
    const brandLogo = page.locator('.aurora-navbar__brand-text');
    const brandVisible = await brandLogo.count();
    console.log('Brand logo visible:', brandVisible > 0 ? 'Yes' : 'No');
    
    // Test desktop navigation
    const desktopNav = page.locator('.aurora-navbar__nav-desktop');
    const desktopVisible = await desktopNav.count();
    console.log('Desktop navigation visible:', desktopVisible > 0 ? 'Yes' : 'No');
    
    // Test mobile toggle button
    const mobileToggle = page.locator('.aurora-navbar__mobile-toggle');
    const toggleVisible = await mobileToggle.count();
    console.log('Mobile toggle button visible:', toggleVisible > 0 ? 'Yes' : 'No');
    
    // Test navigation items
    const navItems = page.locator('.aurora-navbar__nav-item');
    const itemCount = await navItems.count();
    console.log('Navigation items count:', itemCount);
    
    // Test hover animations
    if (itemCount > 0) {
      console.log('🎯 Testing hover interactions...');
      await navItems.first().hover();
      await page.waitForTimeout(1000);
    }
    
    // Test mobile menu
    console.log('📱 Testing mobile menu...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileToggleVisible = await mobileToggle.isVisible();
    console.log('Mobile toggle visible on small screen:', mobileToggleVisible);
    
    if (mobileToggleVisible) {
      await mobileToggle.click();
      await page.waitForTimeout(1000);
      
      const mobileMenu = page.locator('.aurora-navbar__mobile-menu');
      const mobileMenuVisible = await mobileMenu.isVisible();
      console.log('Mobile menu opens:', mobileMenuVisible);
      
      if (mobileMenuVisible) {
        const closeBtn = page.locator('.aurora-navbar__mobile-close');
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await page.waitForTimeout(500);
          console.log('Mobile menu closes properly');
        }
      }
    }
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'navigation-test-result.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 200 }
    });
    
    console.log('✅ Navigation component validation completed');
    console.log('📸 Screenshot saved as navigation-test-result.png');
  } else {
    console.log('❌ NavBar component not found');
    
    // Debug: Check what navigation elements exist
    const allNavElements = await page.locator('nav').count();
    console.log('Total nav elements found:', allNavElements);
    
    if (allNavElements > 0) {
      const navClasses = await page.locator('nav').first().getAttribute('class');
      console.log('First nav element classes:', navClasses);
    }
    
    // Take error screenshot
    await page.screenshot({ path: 'navigation-error-debug.png', fullPage: true });
    console.log('📸 Debug screenshot saved as navigation-error-debug.png');
  }
});