const { test, expect } = require('@playwright/test');

test.describe('Full-Width Navigation Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage 
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('Mega menu spans full viewport width', async ({ page }) => {
    console.log('🧪 Testing full-width mega menu implementation...');
    
    // Get viewport width
    const viewportSize = await page.viewportSize();
    const viewportWidth = viewportSize.width;
    console.log(`📐 Viewport width: ${viewportWidth}px`);
    
    // Hover over navigation item to trigger mega menu
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
    await ringsNavItem.hover();
    
    // Wait for mega menu to appear
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await megaMenu.waitFor({ state: 'visible', timeout: 2000 });
    
    // Get mega menu bounding box
    const megaMenuBox = await megaMenu.boundingBox();
    
    if (megaMenuBox) {
      console.log(`🎯 Mega menu width: ${megaMenuBox.width}px`);
      console.log(`📍 Mega menu position: left=${megaMenuBox.x}px`);
      
      // Check if mega menu spans full width (allowing small tolerance for potential scroll bars)
      const tolerance = 20;
      expect(megaMenuBox.width).toBeGreaterThanOrEqual(viewportWidth - tolerance);
      
      // Check if mega menu starts near the left edge of viewport
      expect(megaMenuBox.x).toBeLessThanOrEqual(tolerance);
      
      console.log('✅ Mega menu successfully spans full viewport width');
    } else {
      throw new Error('❌ Could not get mega menu bounding box');
    }
  });

  test('Content maintains readable width within full-width container', async ({ page }) => {
    console.log('🧪 Testing content container width within full-width mega menu...');
    
    // Hover over navigation item to trigger mega menu
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
    await ringsNavItem.hover();
    
    // Wait for mega menu to appear
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await megaMenu.waitFor({ state: 'visible', timeout: 2000 });
    
    // Check that content wrapper is present and centered
    const contentWrapper = megaMenu.locator('.max-w-7xl.mx-auto');
    await expect(contentWrapper).toBeVisible();
    
    // Get content wrapper dimensions
    const contentBox = await contentWrapper.boundingBox();
    
    if (contentBox) {
      console.log(`📖 Content width: ${contentBox.width}px`);
      
      // Content should be constrained to a readable width (max 1280px)
      expect(contentBox.width).toBeLessThanOrEqual(1280);
      
      // Content should be centered (allow some tolerance)
      const megaMenuBox = await megaMenu.boundingBox();
      if (megaMenuBox) {
        const expectedCenter = megaMenuBox.x + (megaMenuBox.width / 2);
        const actualCenter = contentBox.x + (contentBox.width / 2);
        const centerDiff = Math.abs(expectedCenter - actualCenter);
        
        console.log(`🎯 Expected center: ${expectedCenter}px, Actual center: ${actualCenter}px`);
        expect(centerDiff).toBeLessThan(10); // Allow 10px tolerance for centering
        
        console.log('✅ Content maintains readable width and is properly centered');
      }
    }
  });

  test('Navigation performance meets CLAUDE_RULES (<300ms)', async ({ page }) => {
    console.log('🧪 Testing navigation performance compliance...');
    
    // Measure hover interaction performance
    const startTime = Date.now();
    
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
    await ringsNavItem.hover();
    
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await megaMenu.waitFor({ state: 'visible', timeout: 5000 });
    
    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    
    console.log(`⚡ Navigation interaction time: ${interactionTime}ms`);
    
    // CLAUDE_RULES compliance: interaction should be under 300ms
    expect(interactionTime).toBeLessThan(300);
    
    console.log('✅ Navigation performance meets CLAUDE_RULES requirements');
  });

  test('Full-width navigation works across different viewport sizes', async ({ page }) => {
    console.log('🧪 Testing responsive full-width behavior...');
    
    const viewportSizes = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1440, height: 900, name: 'Desktop Standard' },
      { width: 1024, height: 768, name: 'Tablet' },
    ];
    
    for (const viewport of viewportSizes) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to settle
      
      // Skip mobile tests if navigation is hidden
      const navigation = page.locator('nav');
      const isVisible = await navigation.isVisible();
      
      if (!isVisible) {
        console.log(`⏭️ Skipping ${viewport.name} - navigation hidden on mobile`);
        continue;
      }
      
      const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
      if (await ringsNavItem.isVisible()) {
        await ringsNavItem.hover();
        
        const megaMenu = page.locator('[data-testid="mega-menu"]');
        await megaMenu.waitFor({ state: 'visible', timeout: 2000 });
        
        const megaMenuBox = await megaMenu.boundingBox();
        
        if (megaMenuBox) {
          const tolerance = 20;
          expect(megaMenuBox.width).toBeGreaterThanOrEqual(viewport.width - tolerance);
          console.log(`✅ ${viewport.name}: Mega menu spans full width (${megaMenuBox.width}px)`);
        }
      }
    }
  });

  test('Accessibility features preserved with full-width implementation', async ({ page }) => {
    console.log('🧪 Testing accessibility compliance...');
    
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
    await ringsNavItem.hover();
    
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await megaMenu.waitFor({ state: 'visible', timeout: 2000 });
    
    // Check ARIA attributes are preserved
    const ariaLabel = await megaMenu.getAttribute('aria-label');
    expect(ariaLabel).toContain('navigation menu');
    
    const role = await megaMenu.getAttribute('role');
    expect(role).toBe('menu');
    
    // Check skip link is present
    const skipLink = page.locator('a[href="#mega-menu-content"]');
    await expect(skipLink).toBeVisible();
    
    console.log('✅ Accessibility features preserved');
  });

  test('Aurora Design System integration maintained', async ({ page }) => {
    console.log('🧪 Testing Aurora Design System integration...');
    
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]');
    await ringsNavItem.hover();
    
    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await megaMenu.waitFor({ state: 'visible', timeout: 2000 });
    
    // Check Aurora shadow styles are applied
    const computedStyles = await megaMenu.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        boxShadow: styles.boxShadow,
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
      };
    });
    
    // Verify Aurora shadow is applied (should contain rgba values for purple/pink)
    expect(computedStyles.boxShadow).toContain('rgba');
    expect(computedStyles.backgroundColor).toBe('rgb(255, 255, 255)'); // White background
    
    console.log('✅ Aurora Design System styles maintained');
  });
});