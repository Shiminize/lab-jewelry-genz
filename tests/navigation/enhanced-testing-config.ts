/**
 * Enhanced Testing Configuration for Apple-Style Navigation
 * Extends existing Playwright config with gesture and animation testing capabilities
 * Following CLAUDE.md guidelines for comprehensive E2E testing
 */

import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

// Apple Navigation Testing Configuration
export interface AppleNavigationTestConfig {
  gestures: {
    touchEnabled: boolean;
    gestureTimeout: number;
    velocityThreshold: number;
    tapThreshold: number;
  };
  animations: {
    frameRateTarget: number;
    animationTimeout: number;
    springPhysics: {
      tension: number;
      friction: number;
    };
  };
  performance: {
    memoryThreshold: number; // bytes
    cpuThreshold: number; // percentage
    bundleSizeLimit: number; // bytes
    responseTimeLimit: number; // milliseconds
  };
  accessibility: {
    contrastRatio: number;
    touchTargetMinSize: number;
    keyboardTimeout: number;
  };
}

// Default Apple Navigation Test Configuration
export const APPLE_NAV_CONFIG: AppleNavigationTestConfig = {
  gestures: {
    touchEnabled: true,
    gestureTimeout: 1000,
    velocityThreshold: 0.5,
    tapThreshold: 44
  },
  animations: {
    frameRateTarget: 60,
    animationTimeout: 400,
    springPhysics: {
      tension: 280,
      friction: 24
    }
  },
  performance: {
    memoryThreshold: 10 * 1024 * 1024, // 10MB
    cpuThreshold: 10, // 10%
    bundleSizeLimit: 30 * 1024, // 30KB
    responseTimeLimit: 200 // 200ms
  },
  accessibility: {
    contrastRatio: 7, // WCAG AAA
    touchTargetMinSize: 44,
    keyboardTimeout: 1000
  }
};

// Enhanced Playwright Configuration for Apple Navigation Testing
export const appleNavigationTestConfig: PlaywrightTestConfig = defineConfig({
  testDir: './tests/navigation',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'test-results/apple-navigation-report' }],
    ['json', { outputFile: 'test-results/apple-navigation-results.json' }],
    ['junit', { outputFile: 'test-results/apple-navigation-junit.xml' }]
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: 'retain-on-failure',
    
    // Enhanced timeouts for gesture and animation testing
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },

  timeout: 90000, // Extended timeout for comprehensive testing

  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 1000,
      animations: 'disabled'
    },
    timeout: 15000
  },

  projects: [
    // Apple Navigation Desktop Testing
    {
      name: 'apple-desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        hasTouch: true, // Enable touch events for gesture testing
        deviceScaleFactor: 1
      },
      testMatch: '**/apple-style-navigation-e2e-master.spec.ts'
    },

    {
      name: 'apple-desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
        hasTouch: true
      },
      testMatch: '**/apple-style-navigation-e2e-master.spec.ts'
    },

    {
      name: 'apple-desktop-safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
        hasTouch: true
      },
      testMatch: '**/apple-style-navigation-e2e-master.spec.ts'
    },

    // Apple Navigation Mobile Testing
    {
      name: 'apple-mobile-iphone',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
      },
      testMatch: '**/apple-style-navigation-e2e-master.spec.ts'
    },

    {
      name: 'apple-mobile-android',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 393, height: 851 },
        hasTouch: true,
        isMobile: true
      },
      testMatch: '**/apple-style-navigation-e2e-master.spec.ts'
    },

    // Performance Testing Project
    {
      name: 'apple-performance',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: [
            '--enable-gpu-benchmarking',
            '--enable-gpu-memory-buffer-video-frames',
            '--js-flags=--expose-gc' // Enable garbage collection for memory testing
          ]
        }
      },
      testMatch: '**/apple-navigation-performance.spec.ts'
    },

    // Accessibility Testing Project
    {
      name: 'apple-accessibility',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce', // Test with reduced motion
        forcedColors: 'none'
      },
      testMatch: '**/apple-navigation-accessibility.spec.ts'
    }
  ],

  webServer: {
    command: 'PORT=3001 npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 minutes for server startup
  }
});

// Test Utilities for Apple Navigation Testing
export class AppleNavigationTestUtils {
  
  /**
   * Verify touch targets meet Apple standards
   */
  static async verifyAppleTouchTargets(page: any, minSize: number = 44): Promise<void> {
    const touchElements = page.locator('nav a, nav button, [role="button"]');
    const count = await touchElements.count();

    for (let i = 0; i < count; i++) {
      const element = touchElements.nth(i);
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(minSize);
        expect(boundingBox.width).toBeGreaterThanOrEqual(minSize);
      }
    }
  }

  /**
   * Measure gesture recognition performance
   */
  static async measureGesturePerformance(page: any, gestureType: 'tap' | 'swipe' | 'hover'): Promise<number> {
    const startTime = Date.now();
    
    switch (gestureType) {
      case 'tap':
        await page.locator('[data-testid="rings-nav-item"]').tap();
        break;
      case 'swipe':
        await page.touchscreen.tap(50, 300);
        await page.mouse.move(50, 300);
        await page.mouse.down();
        await page.mouse.move(250, 300);
        await page.mouse.up();
        break;
      case 'hover':
        await page.locator('[data-testid="rings-nav-item"]').hover();
        break;
    }
    
    return Date.now() - startTime;
  }

  /**
   * Monitor animation frame rate
   */
  static async monitorAnimationFrameRate(page: any, duration: number = 1000): Promise<number> {
    return page.evaluate((testDuration) => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        const countFrames = (currentTime: number) => {
          frameCount++;
          
          if (currentTime - startTime < testDuration) {
            requestAnimationFrame(countFrames);
          } else {
            const actualDuration = currentTime - startTime;
            const fps = (frameCount / actualDuration) * 1000;
            resolve(fps);
          }
        };
        
        requestAnimationFrame(countFrames);
      });
    }, duration);
  }

  /**
   * Test spring animation physics
   */
  static async validateSpringPhysics(page: any, elementSelector: string): Promise<boolean> {
    return page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;

      // Trigger animation
      const event = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(event);

      // Check if spring animation properties are applied
      const computed = getComputedStyle(element);
      const transition = computed.transition || computed.webkitTransition;
      
      // Look for spring-like timing functions
      return transition.includes('cubic-bezier') || transition.includes('ease');
    }, elementSelector);
  }

  /**
   * Measure memory usage during navigation
   */
  static async measureMemoryUsage(page: any): Promise<{ initial: number; final: number; increase: number }> {
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Simulate navigation usage
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="rings-nav-item"]').hover();
      await page.waitForTimeout(100);
      await page.locator('body').hover();
      await page.waitForTimeout(100);
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    return {
      initial: initialMemory,
      final: finalMemory,
      increase: finalMemory - initialMemory
    };
  }

  /**
   * Validate accessibility compliance
   */
  static async validateAccessibility(page: any): Promise<string[]> {
    return page.evaluate(() => {
      const violations = [];

      // Check ARIA labels
      const navElements = document.querySelectorAll('nav');
      navElements.forEach((nav, index) => {
        if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
          violations.push(`Navigation ${index} missing ARIA label`);
        }
      });

      // Check color contrast (simplified)
      const links = document.querySelectorAll('nav a');
      links.forEach((link, index) => {
        const styles = getComputedStyle(link);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color === backgroundColor) {
          violations.push(`Link ${index} has insufficient color contrast`);
        }
      });

      // Check keyboard accessibility
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        violations.push('No focusable elements found');
      }

      return violations;
    });
  }

  /**
   * Test keyboard navigation flow
   */
  static async testKeyboardNavigation(page: any): Promise<boolean> {
    try {
      // Start keyboard navigation
      await page.keyboard.press('Tab');
      
      // Navigate through several elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        
        // Verify focus is visible
        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible();
        
        if (!isVisible) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test mobile gesture navigation
   */
  static async testMobileGestures(page: any): Promise<{ swipeRight: boolean; tap: boolean }> {
    // Test swipe right gesture
    let swipeSuccess = false;
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      
      // Simulate swipe right
      await page.touchscreen.tap(10, 400);
      await page.mouse.move(10, 400);
      await page.mouse.down();
      await page.mouse.move(200, 400);
      await page.mouse.up();
      
      // Check if mobile menu opened
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      swipeSuccess = await mobileMenu.isVisible();
    } catch (error) {
      swipeSuccess = false;
    }

    // Test tap gesture
    let tapSuccess = false;
    try {
      const menuButton = page.locator('[aria-label="Toggle mobile menu"]');
      await menuButton.tap();
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      tapSuccess = await mobileMenu.isVisible();
    } catch (error) {
      tapSuccess = false;
    }

    return { swipeRight: swipeSuccess, tap: tapSuccess };
  }
}

// Performance Monitoring Configuration
export const performanceMonitoringConfig = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1   // Cumulative Layout Shift
  },
  
  // Custom navigation metrics
  navigationMetrics: {
    firstPaint: 100,
    interactionReady: 200,
    dropdownOpen: 300,
    searchOverlay: 400
  },
  
  // Memory and CPU thresholds
  resourceThresholds: {
    memoryIncrease: 5 * 1024 * 1024, // 5MB
    cpuUsage: 10, // 10%
    bundleSize: 30 * 1024 // 30KB
  }
};

// Export default configuration
export default appleNavigationTestConfig;
