import { test, expect } from '@playwright/test';

test.describe('Aurora Design System Navigation - Complete Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Aurora navigation loads with correct styling', async ({ page }) => {
    console.log('🧪 Testing Aurora navigation loading...');
    
    // Check if Aurora navigation container is present
    const auroraNav = page.locator('.aurora-navigation');
    await expect(auroraNav).toBeVisible();
    
    // Verify Aurora color tokens are applied
    const navStyles = await auroraNav.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        boxShadow: styles.boxShadow,
        borderRadius: styles.borderRadius
      };
    });
    
    // Aurora should use lunar-grey background (#F7F7F9)
    expect(navStyles.background).toContain('rgb(247, 247, 249)');
    
    console.log('✅ Aurora navigation styling validated');
  });

  test('Desktop mega menu functionality', async ({ page }) => {
    console.log('🧪 Testing desktop mega menu...');
    
    // Hover over Shop category
    const shopLink = page.locator('text="Shop"').first();
    await shopLink.hover();
    
    // Check if mega menu appears
    const megaMenu = page.locator('.aurora-mega-menu.open');
    await expect(megaMenu).toBeVisible({ timeout: 1000 });
    
    // Verify 4-column layout
    const columns = megaMenu.locator('.aurora-mega-menu-column');
    const columnCount = await columns.count();
    expect(columnCount).toBe(4);
    
    // Check for product categories
    await expect(megaMenu.locator('text="By Product Type"')).toBeVisible();
    await expect(megaMenu.locator('text="By Occasion"')).toBeVisible();
    await expect(megaMenu.locator('text="Quick Filters"')).toBeVisible();
    await expect(megaMenu.locator('text="Inspiration"')).toBeVisible();
    
    console.log('✅ Desktop mega menu functionality validated');
  });

  test('Visual material selector functionality', async ({ page }) => {
    console.log('🧪 Testing visual material selector...');
    
    // Hover over Customize category to show material selector
    const customizeLink = page.locator('text="Customize"').first();
    await customizeLink.hover();
    
    // Wait for mega menu to appear
    const megaMenu = page.locator('.aurora-mega-menu.open');
    await expect(megaMenu).toBeVisible({ timeout: 1000 });
    
    // Check if material selector is present
    const materialSelector = megaMenu.locator('.aurora-material-selector');
    await expect(materialSelector).toBeVisible();
    
    // Verify material swatches are clickable
    const materialSwatches = materialSelector.locator('.aurora-material-swatch');
    const swatchCount = await materialSwatches.count();
    expect(swatchCount).toBeGreaterThan(0);
    
    // Click on a material swatch
    await materialSwatches.first().click();
    
    // Check if swatch becomes active
    await expect(materialSwatches.first()).toHaveClass(/active/);
    
    console.log('✅ Visual material selector functionality validated');
  });

  test('Mobile navigation functionality', async ({ page }) => {
    console.log('🧪 Testing mobile navigation...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile trigger is visible
    const mobileButton = page.locator('.aurora-mobile-trigger');
    await expect(mobileButton).toBeVisible();
    
    // Click mobile menu trigger
    await mobileButton.click();
    
    // Check if mobile navigation drawer appears
    const mobileNav = page.locator('.aurora-mobile-nav');
    await expect(mobileNav).toBeVisible({ timeout: 1000 });
    
    // Verify mobile navigation content
    await expect(mobileNav.locator('text="GlowGlitch"')).toBeVisible();
    await expect(mobileNav.locator('.aurora-mobile-search-input')).toBeVisible();
    await expect(mobileNav.locator('.aurora-mobile-quick-actions')).toBeVisible();
    
    // Test expandable menu items
    const shopItem = mobileNav.locator('text="Shop All Jewelry"').first();
    await shopItem.click();
    
    // Check if submenu expands
    const submenu = mobileNav.locator('.aurora-mobile-nav-submenu');
    await expect(submenu).toBeVisible({ timeout: 1000 });
    
    // Close mobile menu
    const closeButton = mobileNav.locator('.aurora-mobile-close');
    await closeButton.click();
    
    // Verify mobile nav is hidden
    await expect(mobileNav).not.toBeVisible();
    
    console.log('✅ Mobile navigation functionality validated');
  });

  test('Aurora typography scale compliance', async ({ page }) => {
    console.log('🧪 Testing Aurora typography scale...');
    
    // Check brand logo uses Title M (clamp(1.25rem, 2.5vw, 1.75rem))
    const brandLogo = page.locator('.aurora-brand-logo');
    const logoStyles = await brandLogo.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // Font size should be within the Title M range
    const logoFontSizePx = parseFloat(logoStyles);
    expect(logoFontSizePx).toBeGreaterThanOrEqual(20); // 1.25rem = 20px
    expect(logoFontSizePx).toBeLessThanOrEqual(28); // 1.75rem = 28px
    
    // Check navigation links use Body M (1rem)
    const navLink = page.locator('.aurora-nav-link').first();
    const linkStyles = await navLink.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    expect(linkStyles).toBe('16px'); // 1rem = 16px
    
    console.log('✅ Aurora typography scale compliance validated');
  });

  test('Aurora shadow system validation', async ({ page }) => {
    console.log('🧪 Testing Aurora shadow system...');
    
    // Check main navigation shadow (shadow-near)
    const navigation = page.locator('.aurora-navigation');
    const navShadow = await navigation.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    // Should contain shadow-near pattern (0 2px 8px with nebula-purple)
    expect(navShadow).toContain('2px');
    expect(navShadow).toContain('8px');
    
    // Hover over action button to test shadow-hover
    const actionButton = page.locator('.aurora-action-button').first();
    await actionButton.hover();
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    console.log('✅ Aurora shadow system validated');
  });

  test('Creator collections integration', async ({ page }) => {
    console.log('🧪 Testing creator collections integration...');
    
    // Check if Creator Collections is in main navigation
    const creatorsLink = page.locator('text="Creator Collections"').first();
    await expect(creatorsLink).toBeVisible();
    
    // Hover to show mega menu
    await creatorsLink.hover();
    
    // Check mega menu content
    const megaMenu = page.locator('.aurora-mega-menu.open');
    await expect(megaMenu.locator('text="Featured Creators"')).toBeVisible();
    await expect(megaMenu.locator('text="Join as Creator"')).toBeVisible();
    
    console.log('✅ Creator collections integration validated');
  });

  test('Accessibility compliance', async ({ page }) => {
    console.log('🧪 Testing accessibility compliance...');
    
    // Check ARIA labels
    const searchButton = page.locator('[aria-label="Search"]');
    await expect(searchButton).toBeVisible();
    
    const cartButton = page.locator('[aria-label="Shopping Cart"]');
    await expect(cartButton).toBeVisible();
    
    const mobileButton = page.locator('[aria-label="Toggle mobile menu"]');
    await expect(mobileButton).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus visibility
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log('✅ Accessibility compliance validated');
  });

  test('Performance benchmarks', async ({ page }) => {
    console.log('🧪 Testing performance benchmarks...');
    
    // Measure navigation interaction time
    const startTime = Date.now();
    
    // Hover over navigation item
    const shopLink = page.locator('text="Shop"').first();
    await shopLink.hover();
    
    // Wait for mega menu to appear
    await page.locator('.aurora-mega-menu.open').waitFor({ timeout: 1000 });
    
    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    
    // Should be under 300ms per CLAUDE_RULES
    expect(interactionTime).toBeLessThan(300);
    
    console.log(`⚡ Navigation interaction time: ${interactionTime}ms`);
    console.log('✅ Performance benchmarks validated');
  });

  test('Trust signals and certifications', async ({ page }) => {
    console.log('🧪 Testing trust signals...');
    
    // Check for certification elements in mobile nav
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileButton = page.locator('.aurora-mobile-trigger');
    await mobileButton.click();
    
    const mobileNav = page.locator('.aurora-mobile-nav');
    await expect(mobileNav).toBeVisible();
    
    // Check for trust signals
    const trustSignals = mobileNav.locator('.aurora-mobile-trust-signals');
    await expect(trustSignals).toBeVisible();
    
    await expect(trustSignals.locator('text="Certified Lab-Grown"')).toBeVisible();
    await expect(trustSignals.locator('text="IGI Certified"')).toBeVisible();
    
    console.log('✅ Trust signals and certifications validated');
  });

  test('Aurora border radius compliance', async ({ page }) => {
    console.log('🧪 Testing Aurora border radius system...');
    
    // Check navigation container uses medium radius (8px)
    const navigation = page.locator('.aurora-navigation');
    const navBorderRadius = await navigation.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    
    expect(navBorderRadius).toBe('8px');
    
    // Check action buttons use medium radius (8px)
    const actionButton = page.locator('.aurora-action-button').first();
    const buttonBorderRadius = await actionButton.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    
    expect(buttonBorderRadius).toBe('8px');
    
    console.log('✅ Aurora border radius compliance validated');
  });

  test('Complete user journey flow', async ({ page }) => {
    console.log('🧪 Testing complete user journey...');
    
    // 1. User hovers over Shop to see categories
    const shopLink = page.locator('text="Shop"').first();
    await shopLink.hover();
    
    // 2. User sees mega menu with categories
    const megaMenu = page.locator('.aurora-mega-menu.open');
    await expect(megaMenu).toBeVisible();
    
    // 3. User clicks on Engagement Rings
    const engagementRings = megaMenu.locator('text="Engagement Rings"').first();
    await engagementRings.click();
    
    // 4. User should navigate to catalog with filter
    await page.waitForURL('**/catalog?category=engagement-rings');
    
    // 5. Verify catalog page loads
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Complete user journey flow validated');
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `test-results/aurora-navigation-${Date.now()}.png`,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 400 }
    });
  });
});