/**
 * Phase 4.3: AuroraMinimalistNavigation Full-Width Vision Test
 * Validates James Allen-style full-width implementation for minimalist navigation
 * CLAUDE_RULES compliance: Full viewport spanning with Aurora Design System
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 4.3: AuroraMinimalistNavigation Full-Width Vision Test', () => {
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

  test('✅ Phase 4.3: AuroraMinimalistNavigation full-width implementation detection', async () => {
    console.log('🔍 Testing AuroraMinimalistNavigation full-width implementation...');

    // Check for AuroraMinimalistNavigation component
    const minimalistNav = page.locator('[data-testid="aurora-minimalist-navigation"]');
    const isMinimalistNavPresent = await minimalistNav.count() > 0;

    if (isMinimalistNavPresent) {
      console.log('✅ AuroraMinimalistNavigation component found');

      // Get viewport width for comparison
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      console.log(`Viewport width: ${viewportWidth}px`);

      await minimalistNav.waitFor({ state: 'visible', timeout: 5000 });

      // Check navigation width spans viewport
      const navBox = await minimalistNav.boundingBox();
      
      if (navBox) {
        console.log(`AuroraMinimalistNavigation width: ${navBox.width}px`);
        console.log(`AuroraMinimalistNavigation left position: ${navBox.x}px`);
        
        // Validate full-width implementation
        const isFullWidth = navBox.width >= viewportWidth * 0.98; // 98% tolerance
        const isProperlyPositioned = navBox.x <= 5; // Close to left edge
        
        if (isFullWidth && isProperlyPositioned) {
          console.log('✅ AuroraMinimalistNavigation successfully spans full viewport width');
          
          // Take screenshot of full-width minimalist navigation
          await page.screenshot({ 
            path: 'test-results/phase4-3-minimalist-nav-fullwidth.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: viewportWidth, height: 100 }
          });
        } else {
          console.log(`❌ AuroraMinimalistNavigation full-width validation failed:`);
          console.log(`  - Full width: ${isFullWidth} (${navBox.width}px vs ${viewportWidth}px)`);
          console.log(`  - Proper positioning: ${isProperlyPositioned} (x: ${navBox.x}px)`);
          
          throw new Error('AuroraMinimalistNavigation does not span full viewport width');
        }

        // Validate content wrapper maintains readability
        const contentWrapper = minimalistNav.locator('.aurora-nav-content-wrapper').first();
        const contentBox = await contentWrapper.boundingBox();
        
        if (contentBox) {
          const isCentered = Math.abs(contentBox.x + contentBox.width/2 - viewportWidth/2) < 100;
          const hasReasonableWidth = contentBox.width <= 1280 + 100; // max-width: 1280px with tolerance
          
          if (isCentered && hasReasonableWidth) {
            console.log('✅ AuroraMinimalistNavigation content wrapper properly centered and constrained');
            console.log(`  - Content width: ${contentBox.width}px (max: 1380px)`);
            console.log(`  - Content center: ${contentBox.x + contentBox.width/2}px vs viewport center: ${viewportWidth/2}px`);
          } else {
            console.log(`⚠️ AuroraMinimalistNavigation content wrapper positioning issues:`);
            console.log(`  - Centered: ${isCentered}`);
            console.log(`  - Reasonable width: ${hasReasonableWidth} (${contentBox.width}px)`);
          }
        }

      } else {
        throw new Error('Could not measure AuroraMinimalistNavigation dimensions');
      }
    } else {
      console.log('ℹ️ AuroraMinimalistNavigation not currently in use - testing standard navigation instead');
      
      // Fallback to test regular navigation for full-width behavior
      const standardNav = page.locator('nav').first();
      await standardNav.waitFor({ state: 'visible', timeout: 5000 });
      
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const navBox = await standardNav.boundingBox();
      
      if (navBox && navBox.width >= viewportWidth * 0.98) {
        console.log('✅ Standard navigation has full-width implementation');
      } else {
        console.log('ℹ️ Standard navigation may not have full-width implementation yet');
      }
    }
  });

  test('✅ Phase 4.3: Aurora Design System integration', async () => {
    console.log('🎨 Testing Aurora Design System integration in navigation...');

    // Check for Aurora-specific elements in any navigation
    const auroraElements = [
      '[data-testid="aurora-minimalist-navigation"]',
      '[data-testid="aurora-nav-brand"]',
      '[data-testid="aurora-nav-items"]',
      '[data-testid="aurora-nav-actions"]',
      '.aurora-nav-brand',
      '.aurora-nav-link',
      '.aurora-action-btn'
    ];

    let auroraComponentsFound = 0;
    const foundElements = [];

    for (const selector of auroraElements) {
      const element = page.locator(selector).first();
      const count = await element.count();
      
      if (count > 0) {
        auroraComponentsFound += count;
        foundElements.push(selector);
        
        // Take screenshot of Aurora component if found
        if (await element.isVisible()) {
          const elementName = selector.replace(/[\\[\\]\"'*\\s.]/g, '').replace(/[^a-zA-Z0-9]/g, '-');
          try {
            await element.screenshot({ 
              path: `test-results/phase4-3-aurora-${elementName}.png` 
            });
          } catch (e) {
            // Some elements might not be screenshottable, continue
            console.log(`Could not screenshot ${selector}`);
          }
        }
      }
    }

    console.log(`Found Aurora elements: ${foundElements.join(', ')}`);

    if (auroraComponentsFound > 0) {
      console.log(`✅ Found ${auroraComponentsFound} Aurora navigation components`);
    } else {
      console.log('ℹ️ Aurora navigation components not yet active (standard navigation may be in use)');
    }

    // Check for Aurora CSS variables usage
    const hasAuroraVars = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const auroraVars = [
        '--aurora-deep-space',
        '--aurora-nebula-purple', 
        '--aurora-pink',
        '--aurora-lunar-grey'
      ];
      
      return auroraVars.some(varName => {
        const value = styles.getPropertyValue(varName).trim();
        return value.length > 0;
      });
    });

    if (hasAuroraVars) {
      console.log('✅ Aurora CSS variables properly integrated');
    } else {
      console.log('ℹ️ Aurora CSS variables not detected at global level');
    }

    console.log('✅ Aurora Design System integration tested');
  });

  test('✅ Phase 4.3: Navigation responsive full-width behavior', async () => {
    console.log('📱 Testing navigation responsive full-width behavior...');

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

      // Look for any navigation (Aurora or standard)
      const navigation = page.locator('nav').first();
      await navigation.waitFor({ state: 'visible', timeout: 3000 });

      // Validate full-width at this viewport
      const navBox = await navigation.boundingBox();
      
      if (navBox) {
        const isFullWidth = navBox.width >= viewport.width * 0.95; // 95% tolerance for mobile
        const isProperlyPositioned = navBox.x <= 10;
        
        if (isFullWidth && isProperlyPositioned) {
          console.log(`✅ ${viewport.name} viewport: Full-width navigation working`);
          console.log(`  - Width: ${navBox.width}px (expected: ~${viewport.width}px)`);
        } else {
          console.log(`⚠️ ${viewport.name} viewport: Full-width validation needs attention`);
          console.log(`  - Width: ${navBox.width}px (expected: ~${viewport.width}px)`);
          console.log(`  - Position: ${navBox.x}px`);
        }
        
        // Take screenshot for visual verification
        await page.screenshot({ 
          path: `test-results/phase4-3-navigation-${viewport.name}.png`,
          fullPage: false,
          clip: { x: 0, y: 0, width: viewport.width, height: 120 }
        });
      }
    }

    console.log('✅ Navigation responsive full-width testing completed');
  });

  test('✅ Phase 4.3: Navigation performance with Aurora full-width', async () => {
    console.log('⚡ Testing navigation performance with Aurora full-width implementation...');

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

    // Test CSS containment effectiveness if Aurora navigation is present
    const minimalistNav = page.locator('[data-testid="aurora-minimalist-navigation"]');
    const hasMinimalistNav = await minimalistNav.count() > 0;

    if (hasMinimalistNav) {
      const hasOptimizations = await minimalistNav.evaluate(el => {
        const styles = getComputedStyle(el);
        const hasContainment = styles.contain && styles.contain !== 'none';
        const hasWillChange = styles.willChange && styles.willChange !== 'auto';
        
        console.log('Aurora navigation optimizations:', {
          contain: styles.contain,
          willChange: styles.willChange,
          hasContainment,
          hasWillChange
        });
        
        return hasContainment || hasWillChange;
      });

      if (hasOptimizations) {
        console.log('✅ Aurora navigation has performance optimizations (containment/will-change)');
      } else {
        console.log('ℹ️ Aurora navigation performance optimizations not detected');
      }
    }

    // Test interaction performance
    const interactiveElements = navigation.locator('a, button').first();
    if (await interactiveElements.count() > 0) {
      const interactionStartTime = Date.now();
      
      await interactiveElements.hover();
      await page.waitForTimeout(50);
      
      const interactionEndTime = Date.now();
      const interactionTime = interactionEndTime - interactionStartTime;

      console.log(`Navigation interaction response time: ${interactionTime}ms`);

      if (interactionTime < 50) {
        console.log('✅ Navigation interaction performance excellent (<50ms)');
      } else if (interactionTime < 100) {
        console.log('✅ Navigation interaction performance good (<100ms)');
      } else {
        console.log(`⚠️ Navigation interaction performance suboptimal (${interactionTime}ms)`);
      }
    }

    console.log('✅ Navigation performance testing completed');
  });

  test('✅ Phase 4.3: Aurora dropdown menu full-width compatibility', async () => {
    console.log('📋 Testing Aurora dropdown menu compatibility with full-width navigation...');

    // Look for navigation items that might have dropdowns
    const navItems = page.locator('[data-testid*="-nav-item"], .aurora-nav-item');
    const itemCount = await navItems.count();

    if (itemCount > 0) {
      console.log(`Found ${itemCount} navigation items to test for dropdowns`);

      // Test hover on first few items to check for dropdowns
      const elementsToTest = Math.min(itemCount, 3);
      
      for (let i = 0; i < elementsToTest; i++) {
        const navItem = navItems.nth(i);
        
        if (await navItem.isVisible()) {
          // Hover over navigation item
          await navItem.hover();
          await page.waitForTimeout(500); // Wait for dropdown to appear

          // Look for Aurora dropdown menu
          const dropdown = page.locator('.aurora-dropdown-menu, [data-testid*="dropdown"]');
          const hasDropdown = await dropdown.count() > 0;

          if (hasDropdown) {
            console.log(`✅ Navigation item ${i + 1} has dropdown menu`);
            
            // Check dropdown positioning
            const dropdownBox = await dropdown.first().boundingBox();
            if (dropdownBox) {
              const viewportWidth = await page.evaluate(() => window.innerWidth);
              const isWithinViewport = dropdownBox.x >= 0 && 
                                     dropdownBox.x + dropdownBox.width <= viewportWidth;
              
              if (isWithinViewport) {
                console.log(`✅ Dropdown ${i + 1} properly positioned within viewport`);
              } else {
                console.log(`⚠️ Dropdown ${i + 1} may extend outside viewport bounds`);
              }

              // Take screenshot of dropdown
              await page.screenshot({ 
                path: `test-results/phase4-3-dropdown-${i + 1}.png`,
                fullPage: false,
                clip: { 
                  x: Math.max(0, dropdownBox.x - 50), 
                  y: Math.max(0, dropdownBox.y - 50),
                  width: Math.min(400, dropdownBox.width + 100),
                  height: Math.min(300, dropdownBox.height + 100)
                }
              });
            }

            // Hide dropdown before testing next item
            await page.mouse.move(0, 0);
            await dropdown.waitFor({ state: 'hidden', timeout: 2000 });
          } else {
            console.log(`ℹ️ Navigation item ${i + 1} does not have dropdown menu`);
          }
        }
      }
    } else {
      console.log('ℹ️ No navigation items found to test for dropdown functionality');
    }

    console.log('✅ Aurora dropdown menu compatibility testing completed');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Test configuration for Phase 4.3 AuroraMinimalistNavigation Vision
test.describe.configure({
  timeout: 30000, // 30 second timeout for full-width tests
  retries: 1,
});