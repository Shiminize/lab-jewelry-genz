/**
 * Debug Navigation Display - Vision Mode Investigation
 * Comprehensive visual debugging to identify navigation rendering issues
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Debug Navigation Display Vision Mode', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    // Don't block any resources for debugging
    console.log('🔍 Starting comprehensive navigation debugging...');

    // Navigate to homepage
    await page.goto('/', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('🔍 Debug: Complete navigation system visual inspection', async () => {
    console.log('📸 Taking full page screenshot to see current state...');

    // Take initial full page screenshot
    await page.screenshot({ 
      path: 'test-results/debug-full-page-initial.png',
      fullPage: true
    });

    console.log('🔍 Analyzing page structure and navigation elements...');

    // Get viewport dimensions
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }));

    console.log('Viewport info:', viewport);

    // Check for all navigation-related elements
    const navigationElements = await page.evaluate(() => {
      const elements = [];
      
      // Find all nav elements
      const navs = document.querySelectorAll('nav');
      navs.forEach((nav, index) => {
        const rect = nav.getBoundingClientRect();
        const styles = getComputedStyle(nav);
        elements.push({
          type: 'nav',
          index,
          tagName: nav.tagName,
          className: nav.className,
          id: nav.id,
          visible: styles.display !== 'none' && styles.visibility !== 'hidden',
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: styles.display,
            position: styles.position,
            zIndex: styles.zIndex,
            backgroundColor: styles.backgroundColor,
            opacity: styles.opacity
          },
          innerHTML: nav.innerHTML.substring(0, 200) + '...'
        });
      });

      // Find all elements with navigation-related classes or data attributes
      const navRelated = document.querySelectorAll('[class*="nav"], [class*="navigation"], [data-testid*="nav"]');
      navRelated.forEach((el, index) => {
        if (el.tagName.toLowerCase() !== 'nav') { // Don't duplicate nav elements
          const rect = el.getBoundingClientRect();
          const styles = getComputedStyle(el);
          elements.push({
            type: 'nav-related',
            index,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            visible: styles.display !== 'none' && styles.visibility !== 'hidden',
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            styles: {
              display: styles.display,
              position: styles.position,
              zIndex: styles.zIndex
            }
          });
        }
      });

      return elements;
    });

    console.log('📊 Navigation elements found:');
    navigationElements.forEach((el, i) => {
      console.log(`${i + 1}. ${el.type} - ${el.tagName}`);
      console.log(`   Class: ${el.className}`);
      console.log(`   Visible: ${el.visible}`);
      console.log(`   Rect: ${el.rect.width}x${el.rect.height} at (${el.rect.x}, ${el.rect.y})`);
      console.log(`   Position: ${el.styles.position}, Z-Index: ${el.styles.zIndex}`);
      console.log('---');
    });

    // Take screenshot of just the top area where navigation should be
    await page.screenshot({ 
      path: 'test-results/debug-navigation-area.png',
      clip: { x: 0, y: 0, width: viewport.width, height: 200 }
    });

    // Check for hidden elements that might be navigation
    const hiddenNav = await page.evaluate(() => {
      const hiddenElements = [];
      const allElements = document.querySelectorAll('*');
      
      for (let el of allElements) {
        if (el.tagName.toLowerCase() === 'nav' || 
            el.className.includes('nav') || 
            el.getAttribute('data-testid')?.includes('nav')) {
          const styles = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          if (styles.display === 'none' || 
              styles.visibility === 'hidden' || 
              styles.opacity === '0' ||
              rect.width === 0 || 
              rect.height === 0) {
            hiddenElements.push({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              reason: styles.display === 'none' ? 'display:none' :
                     styles.visibility === 'hidden' ? 'visibility:hidden' :
                     styles.opacity === '0' ? 'opacity:0' :
                     'zero dimensions'
            });
          }
        }
      }
      
      return hiddenElements;
    });

    if (hiddenNav.length > 0) {
      console.log('⚠️ Found hidden navigation elements:');
      hiddenNav.forEach((el, i) => {
        console.log(`${i + 1}. ${el.tagName}.${el.className} - Hidden because: ${el.reason}`);
      });
    }

    // Check if any navigation components are loading or in error state
    const componentStates = await page.evaluate(() => {
      const states = [];
      
      // Check for loading states
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
      if (loadingElements.length > 0) {
        states.push(`Loading elements found: ${loadingElements.length}`);
      }

      // Check for error elements
      const errorElements = document.querySelectorAll('[class*="error"], [class*="failed"]');
      if (errorElements.length > 0) {
        states.push(`Error elements found: ${errorElements.length}`);
      }

      // Check for React/Next.js hydration issues
      const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
      if (reactElements.length > 0) {
        states.push(`React elements found: ${reactElements.length}`);
      }

      return states;
    });

    console.log('🔍 Component states:', componentStates);

    // Check console for any errors
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`));
    
    // Wait a bit to capture any async console messages
    await page.waitForTimeout(2000);
    
    if (consoleLogs.length > 0) {
      console.log('📝 Console messages:');
      consoleLogs.forEach(log => console.log(`   ${log}`));
    }

    // Test hover interactions to trigger any navigation
    console.log('🖱️ Testing hover interactions...');
    
    // Try hovering over common navigation areas
    const hoverTargets = [
      { x: 100, y: 50 },   // Top left
      { x: viewport.width / 2, y: 50 }, // Top center
      { x: viewport.width - 100, y: 50 }, // Top right
    ];

    for (const target of hoverTargets) {
      await page.mouse.move(target.x, target.y);
      await page.waitForTimeout(500);
      
      // Take screenshot after hover
      await page.screenshot({ 
        path: `test-results/debug-hover-${target.x}-${target.y}.png`,
        clip: { x: 0, y: 0, width: viewport.width, height: 300 }
      });
    }

    // Check if navigation appears after scroll
    console.log('📜 Testing scroll-triggered navigation...');
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/debug-after-scroll.png',
      clip: { x: 0, y: 0, width: viewport.width, height: 200 }
    });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check what's in the header/top area specifically
    const headerContent = await page.evaluate(() => {
      const headers = document.querySelectorAll('header');
      const topElements = [];
      
      // Find elements in the top 100px of the page
      const allElements = document.querySelectorAll('*');
      for (let el of allElements) {
        const rect = el.getBoundingClientRect();
        if (rect.y >= 0 && rect.y <= 100 && rect.width > 50) {
          const styles = getComputedStyle(el);
          topElements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            visible: styles.display !== 'none' && styles.visibility !== 'hidden'
          });
        }
      }
      
      return {
        headers: headers.length,
        topElements: topElements.slice(0, 10) // First 10 elements
      };
    });

    console.log('🏠 Header/top area analysis:');
    console.log(`Found ${headerContent.headers} header elements`);
    console.log('Top 10 elements in header area:');
    headerContent.topElements.forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName}.${el.className} - ${el.rect.width}x${el.rect.height} at (${el.rect.x}, ${el.rect.y}), visible: ${el.visible}`);
    });

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/debug-final-state.png',
      fullPage: true
    });

    console.log('✅ Debug analysis complete! Check the screenshots in test-results/');
    console.log('📁 Generated files:');
    console.log('   - debug-full-page-initial.png (full page)');
    console.log('   - debug-navigation-area.png (top 200px)');
    console.log('   - debug-hover-*.png (hover interactions)');
    console.log('   - debug-after-scroll.png (after scroll)');
    console.log('   - debug-final-state.png (final state)');
  });

  test('🔍 Debug: Check if navigation components are rendered but positioned off-screen', async () => {
    console.log('🎯 Checking for off-screen navigation elements...');

    // Take a very wide screenshot to catch off-screen elements
    await page.setViewportSize({ width: 3000, height: 1500 });
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: 'test-results/debug-wide-viewport.png',
      fullPage: false
    });

    // Check for elements with extreme positions
    const extremePositions = await page.evaluate(() => {
      const elements = [];
      const allNavElements = document.querySelectorAll('nav, [class*="nav"], [data-testid*="nav"]');
      
      allNavElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        
        if (rect.x < -1000 || rect.x > 2000 || rect.y < -500 || rect.y > 1000) {
          elements.push({
            tagName: el.tagName,
            className: el.className,
            position: `(${rect.x}, ${rect.y})`,
            size: `${rect.width}x${rect.height}`,
            transform: styles.transform,
            position_style: styles.position
          });
        }
      });
      
      return elements;
    });

    if (extremePositions.length > 0) {
      console.log('⚠️ Found elements with extreme positions:');
      extremePositions.forEach((el, i) => {
        console.log(`${i + 1}. ${el.tagName}.${el.className}`);
        console.log(`   Position: ${el.position}, Size: ${el.size}`);
        console.log(`   Transform: ${el.transform}`);
        console.log(`   CSS Position: ${el.position_style}`);
      });
    } else {
      console.log('✅ No off-screen navigation elements found');
    }

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('🔍 Debug: Test specific navigation component visibility', async () => {
    console.log('🎯 Testing specific Aurora navigation components...');

    // Check specifically for Aurora components we implemented
    const auroraComponents = await page.evaluate(() => {
      const components = {};
      
      // AuroraNavigation
      const auroraNav = document.querySelector('[data-testid="aurora-navigation"]') || 
                       document.querySelector('.aurora-navigation');
      if (auroraNav) {
        const rect = auroraNav.getBoundingClientRect();
        const styles = getComputedStyle(auroraNav);
        components.AuroraNavigation = {
          found: true,
          visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
          rect,
          styles: {
            display: styles.display,
            position: styles.position,
            width: styles.width,
            zIndex: styles.zIndex
          }
        };
      }

      // AuroraMinimalistNavigation
      const minimalistNav = document.querySelector('[data-testid="aurora-minimalist-navigation"]');
      if (minimalistNav) {
        const rect = minimalistNav.getBoundingClientRect();
        const styles = getComputedStyle(minimalistNav);
        components.AuroraMinimalistNavigation = {
          found: true,
          visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
          rect,
          styles: {
            display: styles.display,
            position: styles.position,
            width: styles.width,
            zIndex: styles.zIndex
          }
        };
      }

      // Regular nav elements
      const navElements = document.querySelectorAll('nav');
      if (navElements.length > 0) {
        components.StandardNav = [];
        navElements.forEach((nav, index) => {
          const rect = nav.getBoundingClientRect();
          const styles = getComputedStyle(nav);
          components.StandardNav.push({
            index,
            className: nav.className,
            visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
            rect,
            styles: {
              display: styles.display,
              position: styles.position,
              width: styles.width,
              zIndex: styles.zIndex
            }
          });
        });
      }

      return components;
    });

    console.log('🧩 Aurora Navigation Components Analysis:');
    Object.keys(auroraComponents).forEach(component => {
      const comp = auroraComponents[component];
      if (Array.isArray(comp)) {
        console.log(`${component}:`);
        comp.forEach((item, i) => {
          console.log(`  ${i + 1}. Visible: ${item.visible}, Size: ${item.rect.width}x${item.rect.height}`);
          console.log(`     Position: ${item.styles.position}, Display: ${item.styles.display}`);
        });
      } else if (comp.found) {
        console.log(`${component}:`);
        console.log(`  Visible: ${comp.visible}, Size: ${comp.rect.width}x${comp.rect.height}`);
        console.log(`  Position: ${comp.styles.position}, Display: ${comp.styles.display}`);
        console.log(`  Z-Index: ${comp.styles.zIndex}, Width: ${comp.styles.width}`);
      } else {
        console.log(`${component}: Not found`);
      }
    });

    // Take focused screenshots of visible navigation components
    if (auroraComponents.StandardNav && auroraComponents.StandardNav.length > 0) {
      for (let i = 0; i < auroraComponents.StandardNav.length; i++) {
        const nav = auroraComponents.StandardNav[i];
        if (nav.visible && nav.rect.width > 0) {
          await page.screenshot({ 
            path: `test-results/debug-nav-${i}.png`,
            clip: { 
              x: Math.max(0, nav.rect.x - 10), 
              y: Math.max(0, nav.rect.y - 10),
              width: Math.min(1280, nav.rect.width + 20),
              height: Math.min(200, nav.rect.height + 20)
            }
          });
        }
      }
    }
  });

  test.afterEach(async () => {
    await page.close();
  });
});

test.describe.configure({
  timeout: 60000, // 60 second timeout for comprehensive debugging
  retries: 0, // No retries for debugging
});