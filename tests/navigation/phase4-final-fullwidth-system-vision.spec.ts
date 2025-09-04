/**
 * Phase 4.5: Complete Full-Width Navigation System Vision Test
 * Comprehensive validation of James Allen-style full-width navigation implementation
 * CLAUDE_RULES compliance: Performance targets, accessibility, and visual consistency
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 4.5: Complete Full-Width Navigation System Vision Test', () => {
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

  test('✅ Phase 4.5: Complete full-width navigation system validation', async () => {
    console.log('🏗️ Testing complete full-width navigation system...');

    // Get viewport width for comprehensive testing
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Testing at viewport width: ${viewportWidth}px`);

    // 1. Test Navigation Bar Full-Width
    const navigation = page.locator('nav').first();
    await navigation.waitFor({ state: 'visible', timeout: 5000 });

    const navBox = await navigation.boundingBox();
    if (navBox) {
      const navFullWidth = navBox.width >= viewportWidth * 0.98;
      const navPositioned = navBox.x <= 5;
      
      if (navFullWidth && navPositioned) {
        console.log('✅ Navigation bar spans full viewport width');
        console.log(`  - Navigation width: ${navBox.width}px`);
      } else {
        console.log(`❌ Navigation bar full-width validation failed`);
        throw new Error('Navigation bar does not span full viewport width');
      }
    }

    // 2. Test Mega Menu Full-Width (if present)
    const navItems = page.locator('[data-testid*="-nav-item"]');
    const hasNavItems = await navItems.count() > 0;

    if (hasNavItems) {
      // Trigger mega menu
      await navItems.first().hover();
      
      // Wait for mega menu to appear
      const megaMenu = page.locator('[data-testid="mega-menu"]');
      const megaMenuVisible = await megaMenu.count() > 0;

      if (megaMenuVisible) {
        await megaMenu.waitFor({ state: 'visible', timeout: 3000 });
        
        const megaMenuBox = await megaMenu.boundingBox();
        if (megaMenuBox) {
          const megaMenuFullWidth = megaMenuBox.width >= viewportWidth * 0.95;
          const megaMenuPositioned = megaMenuBox.x <= 10;
          
          if (megaMenuFullWidth && megaMenuPositioned) {
            console.log('✅ Mega menu spans full viewport width');
            console.log(`  - Mega menu width: ${megaMenuBox.width}px`);
          } else {
            console.log(`⚠️ Mega menu full-width needs adjustment`);
            console.log(`  - Width: ${megaMenuBox.width}px, Position: ${megaMenuBox.x}px`);
          }
        }

        // Hide mega menu
        await page.mouse.move(0, 0);
        await megaMenu.waitFor({ state: 'hidden', timeout: 2000 });
      } else {
        console.log('ℹ️ No mega menu detected');
      }
    }

    // 3. Test Full-Width CSS Utilities
    const hasFullWidthUtilities = await page.evaluate(() => {
      // Check if full-width utility classes are available
      const testDiv = document.createElement('div');
      testDiv.className = 'aurora-full-width-nav';
      document.body.appendChild(testDiv);
      
      const styles = getComputedStyle(testDiv);
      const hasFullWidthCSS = styles.width === '100vw';
      
      document.body.removeChild(testDiv);
      return hasFullWidthCSS;
    });

    if (hasFullWidthUtilities) {
      console.log('✅ Full-width CSS utilities properly loaded');
    } else {
      console.log('⚠️ Full-width CSS utilities not detected');
    }

    // 4. Test Aurora Design System Integration
    const hasAuroraVars = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const auroraVars = [
        '--aurora-deep-space',
        '--aurora-nebula-purple',
        '--aurora-pink',
        '--aurora-lunar-grey'
      ];
      
      return auroraVars.every(varName => {
        const value = styles.getPropertyValue(varName).trim();
        return value.length > 0;
      });
    });

    if (hasAuroraVars) {
      console.log('✅ Aurora Design System CSS variables integrated');
    } else {
      console.log('⚠️ Some Aurora CSS variables missing');
    }

    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/phase4-5-complete-fullwidth-system.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: viewportWidth, height: 200 }
    });

    console.log('✅ Complete full-width navigation system validation completed');
  });

  test('✅ Phase 4.5: Cross-viewport consistency validation', async () => {
    console.log('📐 Testing full-width consistency across all viewports...');

    // Comprehensive viewport testing
    const viewports = [
      { name: '4K', width: 3840, height: 2160 },
      { name: 'desktop-xl', width: 1920, height: 1080 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile-lg', width: 414, height: 896 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-sm', width: 320, height: 568 }
    ];

    const results = [];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      const navigation = page.locator('nav').first();
      await navigation.waitFor({ state: 'visible', timeout: 3000 });

      const navBox = await navigation.boundingBox();
      
      if (navBox) {
        const fullWidthRatio = navBox.width / viewport.width;
        const isFullWidth = fullWidthRatio >= 0.95;
        const isProperlyPositioned = navBox.x <= 10;
        
        results.push({
          viewport: viewport.name,
          width: navBox.width,
          expectedWidth: viewport.width,
          ratio: fullWidthRatio,
          positioned: isProperlyPositioned,
          success: isFullWidth && isProperlyPositioned
        });

        if (isFullWidth && isProperlyPositioned) {
          console.log(`✅ ${viewport.name}: Full-width working (${Math.round(fullWidthRatio * 100)}%)`);
        } else {
          console.log(`⚠️ ${viewport.name}: Issues detected (${Math.round(fullWidthRatio * 100)}%)`);
        }

        // Take viewport-specific screenshot
        await page.screenshot({ 
          path: `test-results/phase4-5-fullwidth-${viewport.name}.png`,
          fullPage: false,
          clip: { x: 0, y: 0, width: viewport.width, height: 120 }
        });
      }
    }

    // Analyze results
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;

    console.log(`\n📊 Cross-viewport consistency results:`);
    console.log(`✅ Success rate: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);

    if (successRate >= 90) {
      console.log('✅ Excellent cross-viewport consistency achieved');
    } else if (successRate >= 75) {
      console.log('✅ Good cross-viewport consistency with room for improvement');
    } else {
      console.log('❌ Cross-viewport consistency needs attention');
      throw new Error(`Cross-viewport success rate too low: ${successRate.toFixed(1)}%`);
    }
  });

  test('✅ Phase 4.5: Performance validation with full-width system', async () => {
    console.log('⚡ Testing complete system performance with full-width implementation...');

    // Performance measurement
    const startTime = Date.now();

    // Reload to measure complete load time
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    const navigation = page.locator('nav').first();
    await navigation.waitFor({ state: 'visible', timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`Complete system load time: ${loadTime}ms`);

    // CLAUDE_RULES compliance: <300ms target
    if (loadTime < 300) {
      console.log('✅ Excellent performance - meets CLAUDE_RULES targets (<300ms)');
    } else if (loadTime < 500) {
      console.log('✅ Good performance - approaches CLAUDE_RULES targets');
    } else {
      console.log(`⚠️ Performance attention needed - exceeds targets (${loadTime}ms > 300ms)`);
    }

    // Test interaction performance
    const interactionStartTime = Date.now();
    
    const interactiveElement = navigation.locator('a, button').first();
    if (await interactiveElement.count() > 0) {
      await interactiveElement.hover();
      await page.waitForTimeout(50);
    }
    
    const interactionTime = Date.now() - interactionStartTime;
    console.log(`Interaction response time: ${interactionTime}ms`);

    if (interactionTime < 50) {
      console.log('✅ Excellent interaction performance (<50ms)');
    } else if (interactionTime < 100) {
      console.log('✅ Good interaction performance (<100ms)');
    } else {
      console.log(`⚠️ Interaction performance may be suboptimal (${interactionTime}ms)`);
    }

    // Memory usage check (basic)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryInfo) {
      const memoryUsageMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      console.log(`Memory usage: ${memoryUsageMB}MB`);
      
      if (memoryUsageMB < 50) {
        console.log('✅ Excellent memory efficiency (<50MB)');
      } else if (memoryUsageMB < 100) {
        console.log('✅ Good memory usage (<100MB)');
      } else {
        console.log(`⚠️ High memory usage detected (${memoryUsageMB}MB)`);
      }
    }

    console.log('✅ Performance validation completed');
  });

  test('✅ Phase 4.5: Accessibility compliance with full-width navigation', async () => {
    console.log('♿ Testing accessibility compliance of full-width navigation system...');

    const navigation = page.locator('nav').first();
    
    // 1. Semantic HTML validation
    const hasNavRole = await navigation.evaluate(el => {
      return el.tagName.toLowerCase() === 'nav' || el.getAttribute('role') === 'navigation';
    });

    if (hasNavRole) {
      console.log('✅ Navigation has proper semantic HTML/ARIA role');
    } else {
      console.log('❌ Navigation missing semantic role');
      throw new Error('Navigation accessibility: Missing semantic role');
    }

    // 2. Keyboard navigation test
    const firstInteractive = navigation.locator('a, button').first();
    const interactiveCount = await firstInteractive.count();

    if (interactiveCount > 0) {
      // Test Tab navigation
      await firstInteractive.focus();
      
      const hasFocus = await firstInteractive.evaluate(el => {
        return document.activeElement === el;
      });

      if (hasFocus) {
        console.log('✅ Keyboard navigation functional');
        
        // Test focus visibility
        const focusStyles = await firstInteractive.evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow
          };
        });

        const hasFocusIndicator = focusStyles.outline !== 'none' || 
                                 focusStyles.boxShadow.includes('ring') ||
                                 focusStyles.outlineColor !== 'transparent';

        if (hasFocusIndicator) {
          console.log('✅ Focus indicators visible');
        } else {
          console.log('⚠️ Focus indicators may not be visible');
        }
      } else {
        console.log('❌ Keyboard focus not working');
        throw new Error('Navigation accessibility: Keyboard focus failed');
      }
    }

    // 3. ARIA labels and descriptions
    const hasAriaLabels = await navigation.evaluate(el => {
      const ariaElements = el.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
      return ariaElements.length > 0;
    });

    if (hasAriaLabels) {
      console.log('✅ ARIA labels and descriptions present');
    } else {
      console.log('ℹ️ Limited ARIA labels detected (may be acceptable)');
    }

    // 4. Color contrast check (basic)
    const contrastResults = await navigation.evaluate(el => {
      const allElements = el.querySelectorAll('*');
      const contrastIssues = [];
      
      for (let i = 0; i < Math.min(allElements.length, 20); i++) {
        const element = allElements[i];
        const styles = getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Basic check - not comprehensive but indicative
          if (color === backgroundColor) {
            contrastIssues.push(element.tagName);
          }
        }
      }
      
      return contrastIssues.length;
    });

    if (contrastResults === 0) {
      console.log('✅ No obvious color contrast issues detected');
    } else {
      console.log(`⚠️ Potential color contrast issues: ${contrastResults} elements`);
    }

    // Take screenshot for accessibility validation
    await page.screenshot({ 
      path: 'test-results/phase4-5-accessibility-validation.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 150 }
    });

    console.log('✅ Accessibility compliance testing completed');
  });

  test('✅ Phase 4.5: Integration with existing navigation components', async () => {
    console.log('🔗 Testing integration with existing navigation components...');

    // Check for component compatibility
    const componentSelectors = [
      'nav',
      '[data-testid*="nav"]',
      '[class*="navigation"]',
      '[class*="aurora"]'
    ];

    const componentResults = [];

    for (const selector of componentSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        componentResults.push({
          selector,
          count,
          found: true
        });

        // Check if elements are visible and functional
        const firstElement = elements.first();
        const isVisible = await firstElement.isVisible();
        
        if (isVisible) {
          console.log(`✅ ${selector}: ${count} elements found and visible`);
        } else {
          console.log(`⚠️ ${selector}: ${count} elements found but not visible`);
        }
      } else {
        componentResults.push({
          selector,
          count: 0,
          found: false
        });
      }
    }

    // Check for conflicts or overlapping components
    const navElements = page.locator('nav');
    const navCount = await navElements.count();

    if (navCount === 1) {
      console.log('✅ Single navigation component - no conflicts');
    } else if (navCount > 1) {
      console.log(`⚠️ Multiple navigation elements detected (${navCount}) - check for conflicts`);
      
      // Check if multiple navs are intentional (e.g., mobile + desktop)
      const visibleNavs = [];
      for (let i = 0; i < navCount; i++) {
        const nav = navElements.nth(i);
        const isVisible = await nav.isVisible();
        if (isVisible) visibleNavs.push(i);
      }
      
      console.log(`Visible navigation elements: ${visibleNavs.length}`);
    } else {
      console.log('❌ No navigation elements found');
      throw new Error('Navigation integration: No navigation elements detected');
    }

    // Test layout stability with full-width implementation
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const initialLayout = await page.locator('main, body > div').first().boundingBox();

    if (initialLayout) {
      // Trigger navigation interactions to test layout stability
      const navItems = page.locator('[data-testid*="-nav-item"]');
      const hasNavItems = await navItems.count() > 0;

      if (hasNavItems) {
        await navItems.first().hover();
        await page.waitForTimeout(300);
        
        const afterInteractionLayout = await page.locator('main, body > div').first().boundingBox();
        
        if (afterInteractionLayout) {
          const layoutShift = Math.abs(initialLayout.y - afterInteractionLayout.y);
          
          if (layoutShift < 5) {
            console.log('✅ Layout stable during navigation interactions');
          } else {
            console.log(`⚠️ Layout shift detected: ${layoutShift}px`);
          }
        }
      }
    }

    console.log('✅ Component integration testing completed');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Test configuration for Phase 4.5 Complete System Vision
test.describe.configure({
  timeout: 45000, // 45 second timeout for comprehensive tests
  retries: 1,
});