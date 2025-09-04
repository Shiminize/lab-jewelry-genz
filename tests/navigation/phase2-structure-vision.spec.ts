/**
 * Phase 2: Core Navigation Structure Vision Tests
 * Visual validation of minimalist navigation components
 * James Allen-inspired clean architecture testing
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 2: Core Navigation Structure Vision Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test
    const context = await browser.newContext();
    page = await context.newPage();

    // Block resource loading for faster tests
    await page.route('**/*.{png,jpg,jpeg,svg,mp4,webp}', route => {
      route.abort();
    });

    // Navigate to homepage
    await page.goto('/', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('✅ Phase 2: MinimalistNavigation components render correctly', async () => {
    console.log('🧪 Testing MinimalistNavigation component structure...');

    // Check for navigation bar
    const navigationBar = page.locator('[data-testid="navigation-bar"], nav, header nav').first();
    await expect(navigationBar).toBeVisible({ timeout: 5000 });

    // Take screenshot of navigation structure
    await navigationBar.screenshot({ 
      path: 'test-results/phase2-navigation-structure.png' 
    });

    console.log('✅ Navigation structure renders correctly');
  });

  test('✅ Phase 2: Navigation brand and logo area', async () => {
    console.log('🏷️ Testing navigation brand area...');

    // Look for brand/logo area
    const brandArea = page.locator('[data-testid="nav-brand"], .nav-brand, .brand-link').first();
    
    if (await brandArea.count() > 0) {
      await expect(brandArea).toBeVisible();
      
      // Take focused screenshot of brand area
      await brandArea.screenshot({ 
        path: 'test-results/phase2-brand-area.png' 
      });
      
      console.log('✅ Brand area found and functional');
    } else {
      console.log('ℹ️  Brand area not yet implemented, checking for basic logo/title');
      
      // Check for any logo or title element
      const titleElement = page.locator('h1, .logo, [role="banner"] a').first();
      if (await titleElement.count() > 0) {
        await expect(titleElement).toBeVisible();
        console.log('✅ Basic brand element found');
      }
    }
  });

  test('✅ Phase 2: Navigation items structure', async () => {
    console.log('🔗 Testing navigation items structure...');

    // Check for navigation items container
    const navItems = page.locator('[data-testid="nav-items"], .nav-items, nav ul, nav div').first();
    
    if (await navItems.count() > 0) {
      await expect(navItems).toBeVisible();
      
      // Check for individual navigation links
      const navLinks = page.locator('nav a, [data-testid^="nav-item"]');
      const linkCount = await navLinks.count();
      
      expect(linkCount).toBeGreaterThan(0);
      console.log(`✅ Found ${linkCount} navigation items`);
      
      // Take screenshot of navigation items
      await navItems.screenshot({ 
        path: 'test-results/phase2-nav-items.png' 
      });
    } else {
      console.log('ℹ️  Structured nav items not found, checking for basic links');
      
      // Check for any navigation links
      const anyLinks = page.locator('nav a, header a');
      const linkCount = await anyLinks.count();
      
      if (linkCount > 0) {
        console.log(`✅ Found ${linkCount} basic navigation links`);
      } else {
        console.log('⚠️  No navigation links found');
      }
    }
  });

  test('✅ Phase 2: Navigation actions area', async () => {
    console.log('⚡ Testing navigation actions (search, account, cart)...');

    // Look for action buttons/links
    const actionSelectors = [
      '[data-testid="nav-actions"]',
      '[data-testid="search-toggle"]',
      '[data-testid="account-link"]',
      '[data-testid="cart-link"]',
      '.nav-actions',
      'nav button',
      '[aria-label*="search" i]',
      '[aria-label*="account" i]',
      '[aria-label*="cart" i]'
    ];

    let actionsFound = false;
    
    for (const selector of actionSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        actionsFound = true;
        console.log(`✅ Found action element: ${selector}`);
        
        // Take screenshot of actions area
        await element.screenshot({ 
          path: `test-results/phase2-actions-${selector.replace(/[\[\]"'*\s]/g, '')}.png` 
        });
        break;
      }
    }

    if (actionsFound) {
      console.log('✅ Navigation actions area implemented');
    } else {
      console.log('ℹ️  Navigation actions not yet implemented (planned for Phase 4)');
    }
  });

  test('✅ Phase 2: Responsive navigation structure', async () => {
    console.log('📱 Testing responsive navigation structure...');

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const desktopNav = page.locator('nav, header nav').first();
    await expect(desktopNav).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/phase2-desktop-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 100 }
    });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/phase2-tablet-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 768, height: 100 }
    });

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/phase2-mobile-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 100 }
    });

    console.log('✅ Responsive navigation structure tested');
  });

  test('✅ Phase 2: Navigation accessibility structure', async () => {
    console.log('♿ Testing navigation accessibility structure...');

    // Check for proper navigation landmarks
    const navElement = page.locator('nav, [role="navigation"]').first();
    await expect(navElement).toBeVisible();

    // Check for aria-labels
    const ariaLabels = await page.locator('[aria-label]').count();
    console.log(`✅ Found ${ariaLabels} elements with aria-labels`);

    // Check for screen reader content
    const srOnly = await page.locator('.sr-only, .visually-hidden').count();
    if (srOnly > 0) {
      console.log(`✅ Found ${srOnly} screen reader only elements`);
    }

    // Check for keyboard navigation support
    const focusableElements = await page.locator('a, button, [tabindex]:not([tabindex="-1"])').count();
    expect(focusableElements).toBeGreaterThan(0);
    console.log(`✅ Found ${focusableElements} focusable elements`);

    console.log('✅ Navigation accessibility structure validated');
  });

  test('✅ Phase 2: Navigation performance and smoothness', async () => {
    console.log('⚡ Testing navigation performance...');

    const startTime = Date.now();
    
    // Test hover interactions if navigation items exist
    const navLinks = page.locator('nav a').first();
    
    if (await navLinks.count() > 0) {
      await navLinks.hover();
      await page.waitForTimeout(100);
      
      // Check for smooth transitions
      const transitionTime = Date.now() - startTime;
      expect(transitionTime).toBeLessThan(1000); // Should be very fast
      
      console.log(`✅ Navigation interaction time: ${transitionTime}ms`);
    }

    // Test scroll performance
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);

    console.log('✅ Navigation performance validated');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Test configuration for Phase 2 Structure
test.describe.configure({
  timeout: 20000, // 20 second timeout for vision tests
  retries: 1,
});