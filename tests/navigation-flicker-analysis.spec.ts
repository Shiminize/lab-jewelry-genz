import { test, expect, Page } from '@playwright/test';
import path from 'path';

test.describe('Navigation Flicker Analysis - Apple.com Style', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1440, height: 900 }
    });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  });

  test('Capture navigation hover states and flickering behavior', async () => {
    // Wait for navigation to be fully loaded
    await page.waitForSelector('nav', { state: 'visible' });
    
    // Take baseline screenshot
    await page.screenshot({ 
      path: 'navigation-baseline.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1440, height: 120 }
    });

    // Test hover on main navigation items
    const navItems = await page.$$('nav a, nav button');
    console.log(`Found ${navItems.length} navigation items`);

    // Capture hover states for each navigation item
    for (let i = 0; i < Math.min(navItems.length, 5); i++) {
      const item = navItems[i];
      const text = await item.textContent();
      console.log(`Testing hover on: ${text}`);

      // Move to item slowly to capture transition
      await item.hover({ force: true });
      await page.waitForTimeout(100); // Small delay to capture mid-transition
      
      await page.screenshot({
        path: `navigation-hover-${i}-mid.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1440, height: 400 }
      });

      await page.waitForTimeout(300); // Wait for transition to complete
      
      await page.screenshot({
        path: `navigation-hover-${i}-complete.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1440, height: 400 }
      });

      // Check if dropdown exists
      const dropdown = await page.$('[role="menu"]:visible, .dropdown:visible, .mega-menu:visible');
      if (dropdown) {
        console.log(`Dropdown found for ${text}`);
        await page.screenshot({
          path: `navigation-dropdown-${i}.png`,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1440, height: 600 }
        });
      }

      // Move away to reset
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
    }
  });

  test('Analyze CSS transitions and animations', async () => {
    // Get all navigation elements with transitions
    const transitionInfo = await page.evaluate(() => {
      const navElements = document.querySelectorAll('nav *');
      const results: any[] = [];
      
      navElements.forEach((el: Element) => {
        const styles = window.getComputedStyle(el);
        const hasTransition = styles.transition !== 'none' && styles.transition !== '';
        const hasAnimation = styles.animation !== 'none' && styles.animation !== '';
        
        if (hasTransition || hasAnimation) {
          results.push({
            tagName: el.tagName,
            className: el.className,
            transition: styles.transition,
            animation: styles.animation,
            transform: styles.transform,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            position: styles.position
          });
        }
      });
      
      return results;
    });

    console.log('Elements with transitions/animations:', JSON.stringify(transitionInfo, null, 2));
  });

  test('Test rapid hover movements (flicker detection)', async () => {
    const navItems = await page.$$('nav a, nav button');
    
    // Rapid hover test - this often triggers flickering
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`Rapid hover cycle ${cycle + 1}`);
      
      for (let i = 0; i < Math.min(navItems.length, 3); i++) {
        await navItems[i].hover({ force: true });
        await page.waitForTimeout(50); // Very short delay
        
        // Capture potential flicker
        await page.screenshot({
          path: `navigation-flicker-test-${cycle}-${i}.png`,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1440, height: 400 }
        });
      }
    }
  });

  test('Check z-index stacking issues', async () => {
    const stackingInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('nav, nav *, .dropdown, .mega-menu, [role="menu"]');
      const results: any[] = [];
      
      elements.forEach((el: Element) => {
        const styles = window.getComputedStyle(el);
        const zIndex = styles.zIndex;
        
        if (zIndex !== 'auto' && zIndex !== '0') {
          results.push({
            selector: el.tagName + (el.className ? '.' + el.className : ''),
            zIndex: zIndex,
            position: styles.position,
            display: styles.display
          });
        }
      });
      
      return results.sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
    });

    console.log('Z-index stacking order:', JSON.stringify(stackingInfo, null, 2));
  });

  test('Measure performance during hover interactions', async () => {
    // Start performance monitoring
    await page.evaluateOnNewDocument(() => {
      (window as any).performanceMarks = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).performanceMarks.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
      observer.observe({ entryTypes: ['measure', 'paint', 'layout-shift'] });
    });

    // Perform hover interactions
    const navItems = await page.$$('nav a, nav button');
    
    for (let i = 0; i < Math.min(navItems.length, 3); i++) {
      await page.evaluate(() => performance.mark('hover-start'));
      await navItems[i].hover();
      await page.waitForTimeout(300);
      await page.evaluate(() => performance.mark('hover-end'));
      await page.evaluate(() => {
        performance.measure('hover-duration', 'hover-start', 'hover-end');
      });
    }

    // Get performance data
    const perfData = await page.evaluate(() => (window as any).performanceMarks);
    console.log('Performance measurements:', JSON.stringify(perfData, null, 2));
  });

  test('Compare with Apple-style smooth transitions', async () => {
    // Document current transition timings
    const currentTransitions = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      
      const allElements = nav.querySelectorAll('*');
      const timings = new Set<string>();
      
      allElements.forEach((el: Element) => {
        const styles = window.getComputedStyle(el);
        if (styles.transition && styles.transition !== 'none') {
          timings.add(styles.transition);
        }
      });
      
      return Array.from(timings);
    });

    console.log('Current transition timings:', currentTransitions);
    
    // Apple.com typically uses:
    // - transition: opacity 0.3s ease, transform 0.3s ease
    // - No conflicting animations
    // - Consistent timing functions (ease, ease-in-out)
    // - Will-change property for optimization
    
    const recommendations = {
      idealTransitions: [
        'opacity 0.3s ease',
        'transform 0.3s ease',
        'background-color 0.2s ease'
      ],
      avoidPatterns: [
        'Multiple conflicting transitions',
        'Transitions shorter than 150ms',
        'Transitions longer than 400ms',
        'Using "all" in transitions'
      ],
      performanceOptimizations: [
        'will-change: opacity, transform',
        'transform: translateZ(0) for GPU acceleration',
        'Avoid transitioning layout properties (width, height, top, left)'
      ]
    };

    console.log('Apple-style recommendations:', JSON.stringify(recommendations, null, 2));
  });

  test.afterEach(async () => {
    await page.close();
  });
});