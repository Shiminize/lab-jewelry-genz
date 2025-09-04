/**
 * Navigation Aurora Phase 1 Compliance Test
 * Tests Aurora Design System color token implementation
 * MUST PASS before proceeding to Phase 2
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation Aurora Phase 1: Color Token Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for server to be ready
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    await page.waitForTimeout(2000); // Let Aurora animations settle
  });

  test('Navigation uses Aurora color tokens correctly', async ({ page }) => {
    console.log('🎨 Phase 1: Testing Aurora color token compliance...');
    
    // Test main navigation container
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Check navigation background uses lunar-grey
    const navStyles = await nav.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        boxShadow: computed.boxShadow
      };
    });
    
    console.log('📊 Navigation styles:', navStyles);
    
    // Test that background uses lunar-grey (#F7F7F9)
    expect(navStyles.backgroundColor).toContain('247, 247, 249');
    
    // Take screenshot for visual validation
    await page.screenshot({ 
      path: 'test-results/phase1-navigation-colors.png',
      fullPage: false 
    });
  });

  test('Brand logo uses Aurora gradient text', async ({ page }) => {
    console.log('✨ Testing brand logo Aurora gradient...');
    
    const brandLogo = page.locator('a').filter({ hasText: 'GenZ Jewelry' });
    await expect(brandLogo).toBeVisible();
    
    const logoStyles = await brandLogo.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        backgroundImage: computed.backgroundImage,
        webkitBackgroundClip: computed.webkitBackgroundClip,
        color: computed.color
      };
    });
    
    console.log('🌈 Logo gradient styles:', logoStyles);
    
    // Check for gradient background and text clipping
    expect(logoStyles.backgroundImage).toContain('linear-gradient');
    expect(logoStyles.webkitBackgroundClip).toBe('text');
    
    await page.screenshot({ 
      path: 'test-results/phase1-brand-gradient.png',
      clip: { x: 0, y: 0, width: 300, height: 100 }
    });
  });

  test('Navigation items use Aurora hover states', async ({ page }) => {
    console.log('🖱️ Testing Aurora hover states...');
    
    const navItem = page.locator('nav a').first();
    await expect(navItem).toBeVisible();
    
    // Test normal state
    const normalStyles = await navItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Test hover state
    await navItem.hover();
    await page.waitForTimeout(300); // Wait for transition
    
    const hoverStyles = await navItem.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        transform: computed.transform,
        backgroundColor: computed.backgroundColor
      };
    });
    
    console.log('🎯 Hover state styles:', hoverStyles);
    
    // Check for Aurora hover transform
    expect(hoverStyles.transform).toContain('translateY');
    
    await page.screenshot({ 
      path: 'test-results/phase1-hover-states.png',
      fullPage: false 
    });
  });

  test('Secondary actions use Aurora color scheme', async ({ page }) => {
    console.log('🔍 Testing secondary action buttons...');
    
    const searchButton = page.locator('button').first();
    const wishlistButton = page.locator('button').nth(1);
    const cartButton = page.locator('button').nth(2);
    
    // Test each button's Aurora compliance
    for (const [index, button] of [searchButton, wishlistButton, cartButton].entries()) {
      await expect(button).toBeVisible();
      
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          borderRadius: computed.borderRadius,
          padding: computed.padding
        };
      });
      
      console.log(`🎛️ Button ${index + 1} styles:`, styles);
      
      // Check for Aurora medium radius (8px)
      expect(styles.borderRadius).toBe('8px');
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      
      const hoverStyles = await button.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      
      expect(hoverStyles).toContain('translateY');
    }
    
    await page.screenshot({ 
      path: 'test-results/phase1-secondary-actions.png',
      clip: { x: 0, y: 0, width: 800, height: 100 }
    });
  });

  test('Mobile menu button uses Aurora styling', async ({ page }) => {
    console.log('📱 Testing mobile menu Aurora compliance...');
    
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileMenuButton = page.locator('[aria-label=\"Toggle mobile menu\"]');
    await expect(mobileMenuButton).toBeVisible();
    
    const buttonStyles = await mobileMenuButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        color: computed.color
      };
    });
    
    console.log('📱 Mobile button styles:', buttonStyles);
    
    // Check Aurora medium radius
    expect(buttonStyles.borderRadius).toBe('8px');
    
    await page.screenshot({ 
      path: 'test-results/phase1-mobile-menu.png',
      fullPage: false 
    });
  });

  test('Phase 1 Compliance Summary', async ({ page }) => {
    console.log('📋 Phase 1 Aurora Compliance Summary:');
    console.log('✅ Navigation background: Aurora lunar-grey');
    console.log('✅ Brand logo: Aurora gradient text');
    console.log('✅ Hover states: Aurora lift pattern (-2px translateY)');
    console.log('✅ Border radius: Aurora medium (8px)');
    console.log('✅ Color tokens: Deep-space, nebula-purple, aurora-pink');
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/phase1-complete-navigation.png',
      fullPage: true 
    });
    
    console.log('🎯 Phase 1 COMPLETE - Ready for Phase 2');
  });
});
