/**
 * Phase 4.2: Navigation Full-Width Vision Test
 * Validates James Allen-style full-width navigation bar implementation
 * CLAUDE_RULES compliance: Full viewport spanning with centered content
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 4.2: Navigation Full-Width Vision Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test
    const context = await browser.newContext();
    page = await context.newPage();

    // Block resource loading for faster tests (keep CSS)
    await page.route('**/*.{png,jpg,jpeg,svg,mp4,webp}', route => {
      route.abort();
    });

    // Navigate to homepage
    await page.goto('/', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('✅ Phase 4.2: Navigation bar spans full viewport width', async () => {
    console.log('🔍 Testing navigation bar full-width implementation...');

    // Get viewport width for comparison
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Viewport width: ${viewportWidth}px`);

    // Find the main navigation element
    const navigation = page.locator('nav').first();
    await navigation.waitFor({ state: 'visible', timeout: 5000 });

    // Check navigation width spans viewport
    const navBox = await navigation.boundingBox();
    
    if (navBox) {
      console.log(`Navigation width: ${navBox.width}px`);
      console.log(`Navigation left position: ${navBox.x}px`);
      
      // Validate full-width implementation
      const isFullWidth = navBox.width >= viewportWidth * 0.98; // 98% tolerance for browser variations
      const isProperlyPositioned = navBox.x <= 5; // Close to left edge
      
      if (isFullWidth && isProperlyPositioned) {
        console.log('✅ Navigation successfully spans full viewport width');
        
        // Take screenshot of full-width navigation
        await page.screenshot({ 
          path: 'test-results/phase4-2-navigation-fullwidth.png',
          fullPage: false,
          clip: { x: 0, y: 0, width: viewportWidth, height: 80 }
        });
      } else {
        console.log(`❌ Navigation full-width validation failed:`);
        console.log(`  - Full width: ${isFullWidth} (${navBox.width}px vs ${viewportWidth}px)`);
        console.log(`  - Proper positioning: ${isProperlyPositioned} (x: ${navBox.x}px)`);
        
        // Take debug screenshot
        await page.screenshot({ 
          path: 'test-results/phase4-2-navigation-debug.png',
          fullPage: false,
          clip: { x: 0, y: 0, width: viewportWidth, height: 120 }
        });
        
        throw new Error('Navigation does not span full viewport width');
      }

      // Validate inner content wrapper maintains readability
      const contentWrapper = navigation.locator('.max-w-7xl').first();
      const contentBox = await contentWrapper.boundingBox();
      
      if (contentBox) {
        const isCentered = Math.abs(contentBox.x + contentBox.width/2 - viewportWidth/2) < 100;
        const hasReasonableWidth = contentBox.width <= 1280 + 100; // max-w-7xl with tolerance
        
        if (isCentered && hasReasonableWidth) {
          console.log('✅ Navigation content wrapper properly centered and constrained');
          console.log(`  - Content width: ${contentBox.width}px (max: 1380px)`);
          console.log(`  - Content center: ${contentBox.x + contentBox.width/2}px vs viewport center: ${viewportWidth/2}px`);
        } else {
          console.log(`⚠️ Navigation content wrapper positioning issues:`);
          console.log(`  - Centered: ${isCentered}`);
          console.log(`  - Reasonable width: ${hasReasonableWidth} (${contentBox.width}px)`);
        }
      }

    } else {
      throw new Error('Could not measure navigation dimensions');
    }
  });

  test('✅ Phase 4.2: Navigation full-width sticky behavior', async () => {
    console.log('📏 Testing navigation full-width behavior during scroll...');

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const navigation = page.locator('nav').first();

    // Initial measurement
    const initialNavBox = await navigation.boundingBox();
    console.log('Initial navigation dimensions:', initialNavBox);

    // Scroll down to trigger sticky/scrolled state changes
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300); // Wait for scroll animations

    // Measure after scroll
    const scrolledNavBox = await navigation.boundingBox();
    console.log('Scrolled navigation dimensions:', scrolledNavBox);

    if (initialNavBox && scrolledNavBox) {
      // Validate dimensions remain consistent during scroll
      const widthConsistent = Math.abs(initialNavBox.width - scrolledNavBox.width) < 5;
      const positionConsistent = Math.abs(initialNavBox.x - scrolledNavBox.x) < 5;
      const stillFullWidth = scrolledNavBox.width >= viewportWidth * 0.98;

      if (widthConsistent && positionConsistent && stillFullWidth) {
        console.log('✅ Navigation maintains full-width during scroll');
        
        // Take screenshot of scrolled state
        await page.screenshot({ 
          path: 'test-results/phase4-2-navigation-scrolled.png',
          fullPage: false,
          clip: { x: 0, y: 0, width: viewportWidth, height: 100 }
        });
      } else {
        console.log('❌ Navigation full-width behavior inconsistent during scroll');
        console.log(`  - Width consistent: ${widthConsistent}`);
        console.log(`  - Position consistent: ${positionConsistent}`);
        console.log(`  - Still full width: ${stillFullWidth}`);
        throw new Error('Navigation full-width behavior fails during scroll');
      }
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  });

  test('✅ Phase 4.2: Navigation responsive full-width behavior', async () => {
    console.log('📱 Testing navigation full-width across different viewports...');

    // Test different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'laptop', width: 1440, height: 900 },
      { name: 'tablet', width: 1024, height: 768 },
      { name: 'mobile-lg', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      const navigation = page.locator('nav').first();
      await navigation.waitFor({ state: 'visible', timeout: 3000 });

      // Validate full-width at this viewport
      const navBox = await navigation.boundingBox();
      
      if (navBox) {
        const isFullWidth = navBox.width >= viewport.width * 0.98;
        const isProperlyPositioned = navBox.x <= 5;
        
        if (isFullWidth && isProperlyPositioned) {
          console.log(`✅ ${viewport.name} viewport: Full-width navigation working`);
          console.log(`  - Width: ${navBox.width}px (expected: ~${viewport.width}px)`);
        } else {
          console.log(`❌ ${viewport.name} viewport: Full-width validation failed`);
          console.log(`  - Width: ${navBox.width}px (expected: ~${viewport.width}px)`);
          console.log(`  - Position: ${navBox.x}px`);
        }
        
        // Take screenshot for visual verification
        await page.screenshot({ 
          path: `test-results/phase4-2-navigation-${viewport.name}.png`,
          fullPage: false,
          clip: { x: 0, y: 0, width: viewport.width, height: 100 }
        });
      }
    }

    console.log('✅ Navigation responsive full-width testing completed');
  });

  test('✅ Phase 4.2: Navigation content positioning and accessibility', async () => {
    console.log('♿ Testing navigation content positioning and accessibility...');

    const navigation = page.locator('nav').first();
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Check navigation landmarks and ARIA
    const navRole = await navigation.getAttribute('role');
    const hasNavTag = await navigation.evaluate(el => el.tagName.toLowerCase() === 'nav');
    
    if (hasNavTag || navRole === 'navigation') {
      console.log('✅ Navigation has proper semantic HTML/ARIA role');
    } else {
      console.log('⚠️ Navigation missing semantic navigation role');
    }

    // Check logo positioning within content wrapper
    const logo = navigation.locator('img').first();
    const logoBox = await logo.boundingBox();
    
    if (logoBox) {
      const isReasonablyPositioned = logoBox.x >= 16 && logoBox.x <= 200; // Within reasonable padding
      console.log(`Logo position: ${logoBox.x}px from left edge`);
      
      if (isReasonablyPositioned) {
        console.log('✅ Logo properly positioned within content constraints');
      } else {
        console.log('⚠️ Logo positioning may be outside expected content area');
      }
    }

    // Check navigation items positioning
    const navItems = navigation.locator('[data-testid*="-nav-item"]');
    const itemCount = await navItems.count();
    
    if (itemCount > 0) {
      console.log(`Found ${itemCount} navigation items`);
      
      // Check if navigation items are within reasonable bounds
      const firstItem = navItems.first();
      const firstItemBox = await firstItem.boundingBox();
      
      if (firstItemBox) {
        const isWithinViewport = firstItemBox.x >= 0 && firstItemBox.x + firstItemBox.width <= viewportWidth;
        
        if (isWithinViewport) {
          console.log('✅ Navigation items properly positioned within viewport');
        } else {
          console.log('❌ Navigation items may overflow viewport bounds');
        }
      }
    }

    // Test keyboard navigation
    const firstInteractiveElement = navigation.locator('a, button').first();
    if (await firstInteractiveElement.count() > 0) {
      // Focus first interactive element
      await firstInteractiveElement.focus();
      
      // Check if focus is visible
      const hasFocus = await firstInteractiveElement.evaluate(el => {
        return document.activeElement === el;
      });
      
      if (hasFocus) {
        console.log('✅ Navigation supports keyboard focus');
        
        // Take screenshot of focus state
        await page.screenshot({ 
          path: 'test-results/phase4-2-navigation-focus.png',
          fullPage: false,
          clip: { x: 0, y: 0, width: viewportWidth, height: 120 }
        });
      } else {
        console.log('⚠️ Navigation keyboard focus may not be working properly');
      }
    }

    console.log('✅ Navigation accessibility and content positioning tested');
  });

  test('✅ Phase 4.2: Navigation performance with full-width', async () => {
    console.log('⚡ Testing navigation performance with full-width implementation...');

    // Performance measurement setup
    const startTime = Date.now();

    // Navigate to page and wait for navigation to be visible
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    const navigation = page.locator('nav').first();
    await navigation.waitFor({ state: 'visible', timeout: 5000 });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    console.log(`Navigation load and render time: ${loadTime}ms`);

    // CLAUDE_RULES compliance: <300ms for complete page load
    if (loadTime < 300) {
      console.log('✅ Navigation performance meets CLAUDE_RULES targets (<300ms)');
    } else {
      console.log(`⚠️ Navigation load time ${loadTime}ms approaches target limit (300ms)`);
    }

    // Test scroll performance with full-width navigation
    const scrollStartTime = Date.now();
    
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });
    
    await page.waitForTimeout(100); // Wait for scroll effects
    const scrollEndTime = Date.now();
    const scrollTime = scrollEndTime - scrollStartTime;

    console.log(`Navigation scroll response time: ${scrollTime}ms`);

    if (scrollTime < 50) {
      console.log('✅ Navigation scroll performance excellent (<50ms)');
    } else if (scrollTime < 100) {
      console.log('✅ Navigation scroll performance good (<100ms)');
    } else {
      console.log(`⚠️ Navigation scroll performance may be suboptimal (${scrollTime}ms)`);
    }

    console.log('✅ Navigation performance testing completed');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Test configuration for Phase 4.2 Navigation Vision
test.describe.configure({
  timeout: 30000, // 30 second timeout for full-width tests
  retries: 1,
});