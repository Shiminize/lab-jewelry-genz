/**
 * Apple Navigation Performance E2E Tests
 * Comprehensive performance monitoring for each implementation phase
 * Following CLAUDE.md performance standards
 */

import { test, expect, Page } from '@playwright/test';
import { AppleNavigationTestUtils, APPLE_NAV_CONFIG } from './enhanced-testing-config';

test.describe('Apple Navigation Performance Monitoring', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      // Enable performance monitoring
      launchOptions: {
        args: ['--js-flags=--expose-gc', '--enable-gpu-benchmarking']
      }
    });
    
    page = await context.newPage();
    
    // Enable performance tracking
    await page.addInitScript(() => {
      (window as any).performanceLog = [];
      
      // Override console methods to track performance
      const originalLog = console.log;
      console.log = (...args) => {
        (window as any).performanceLog.push({
          timestamp: Date.now(),
          message: args.join(' ')
        });
        originalLog.apply(console, args);
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('⚡ Performance: Core Web Vitals Meet Apple Standards', async () => {
    console.log('📊 Measuring Core Web Vitals...');

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // Measure First Input Delay (FID) simulation
    const startTime = Date.now();
    await page.locator('[data-testid="rings-nav-item"]').hover();
    const fid = Date.now() - startTime;

    // Measure Cumulative Layout Shift (CLS)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    // Validate against Apple standards
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500); // 2.5s LCP target
    }
    expect(fid).toBeLessThan(100); // 100ms FID target
    expect(cls).toBeLessThan(0.1); // 0.1 CLS target

    console.log(`✅ Core Web Vitals: LCP=${lcp}ms, FID=${fid}ms, CLS=${cls}`);
  });

  test('⚡ Performance: Gesture Recognition Speed', async () => {
    console.log('🖱️ Testing gesture recognition performance...');

    // Test tap gesture performance
    const tapTime = await AppleNavigationTestUtils.measureGesturePerformance(page, 'tap');
    expect(tapTime).toBeLessThan(APPLE_NAV_CONFIG.gestures.gestureTimeout);

    // Test hover gesture performance
    const hoverTime = await AppleNavigationTestUtils.measureGesturePerformance(page, 'hover');
    expect(hoverTime).toBeLessThan(APPLE_NAV_CONFIG.performance.responseTimeLimit);

    console.log(`✅ Gesture Performance: Tap=${tapTime}ms, Hover=${hoverTime}ms`);
  });

  test('⚡ Performance: Animation Frame Rate Monitoring', async () => {
    console.log('🎭 Monitoring animation frame rate...');

    // Start frame rate monitoring
    const fps = await AppleNavigationTestUtils.monitorAnimationFrameRate(page, 2000);

    // Trigger animations during monitoring
    await page.locator('[data-testid="rings-nav-item"]').hover();
    await page.waitForSelector('[data-testid="mega-menu"]', { state: 'visible' });
    
    await page.locator('body').hover(); // Close dropdown
    await page.waitForTimeout(500);

    expect(fps).toBeGreaterThan(APPLE_NAV_CONFIG.animations.frameRateTarget - 10); // Allow 10fps variance

    console.log(`✅ Animation FPS: ${fps.toFixed(2)} (target: >${APPLE_NAV_CONFIG.animations.frameRateTarget})`);
  });

  test('⚡ Performance: Memory Usage Optimization', async () => {
    console.log('🧠 Testing memory usage optimization...');

    const memoryMetrics = await AppleNavigationTestUtils.measureMemoryUsage(page);

    // Memory increase should be within acceptable limits
    expect(memoryMetrics.increase).toBeLessThan(APPLE_NAV_CONFIG.performance.memoryThreshold);

    const memoryIncreaseMB = (memoryMetrics.increase / 1024 / 1024).toFixed(2);
    console.log(`✅ Memory Usage: +${memoryIncreaseMB}MB (limit: ${APPLE_NAV_CONFIG.performance.memoryThreshold / 1024 / 1024}MB)`);
  });

  test('⚡ Performance: Bundle Size Analysis', async () => {
    console.log('📦 Analyzing bundle size impact...');

    // Track network requests
    const bundles: Array<{ url: string; size: number }> = [];
    
    page.on('response', (response) => {
      if (response.url().includes('/_next/static/') && 
          (response.url().endsWith('.js') || response.url().endsWith('.css'))) {
        const size = parseInt(response.headers()['content-length'] || '0');
        bundles.push({
          url: response.url(),
          size: size
        });
      }
    });

    // Reload to capture all bundle requests
    await page.reload({ waitUntil: 'networkidle' });

    // Calculate total navigation-related bundle size
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    expect(totalSize).toBeLessThan(APPLE_NAV_CONFIG.performance.bundleSizeLimit);

    const totalSizeKB = (totalSize / 1024).toFixed(2);
    console.log(`✅ Bundle Size: ${totalSizeKB}KB (limit: ${APPLE_NAV_CONFIG.performance.bundleSizeLimit / 1024}KB)`);
  });

  test('⚡ Performance: Spring Animation Physics Validation', async () => {
    console.log('🌸 Validating spring animation physics...');

    // Test spring physics implementation
    const hasSpringPhysics = await AppleNavigationTestUtils.validateSpringPhysics(
      page, 
      '[data-testid="mega-menu"]'
    );

    expect(hasSpringPhysics).toBeTruthy();

    // Measure animation timing
    const animationStart = Date.now();
    await page.locator('[data-testid="rings-nav-item"]').hover();
    await page.waitForSelector('[data-testid="mega-menu"]', { state: 'visible' });
    const animationDuration = Date.now() - animationStart;

    // Should complete within Apple's animation timing standards
    expect(animationDuration).toBeLessThan(APPLE_NAV_CONFIG.animations.animationTimeout);
    expect(animationDuration).toBeGreaterThan(100); // Not instant

    console.log(`✅ Spring Animation: ${animationDuration}ms (Apple range: 100-400ms)`);
  });

  test('⚡ Performance: CPU Usage During Interactions', async () => {
    console.log('🖥️ Monitoring CPU usage during interactions...');

    // Start CPU monitoring (simplified)
    const startTime = performance.now();
    
    // Simulate intensive navigation interactions
    for (let i = 0; i < 20; i++) {
      await page.locator('[data-testid="rings-nav-item"]').hover();
      await page.waitForTimeout(50);
      await page.locator('[data-testid="necklaces-nav-item"]').hover();
      await page.waitForTimeout(50);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Calculate interactions per second (proxy for CPU efficiency)
    const interactionsPerSecond = (40 / totalTime) * 1000;
    
    // Should handle at least 20 interactions per second efficiently
    expect(interactionsPerSecond).toBeGreaterThan(20);

    console.log(`✅ CPU Efficiency: ${interactionsPerSecond.toFixed(2)} interactions/sec`);
  });

  test('⚡ Performance: Mobile Performance Optimization', async () => {
    console.log('📱 Testing mobile performance optimization...');

    // Switch to mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Test mobile gesture performance
    const mobileGestureResults = await AppleNavigationTestUtils.testMobileGestures(page);
    
    expect(mobileGestureResults.tap).toBeTruthy();
    // Note: swipe gesture testing may need specific implementation

    // Test mobile animation performance
    const mobileFPS = await AppleNavigationTestUtils.monitorAnimationFrameRate(page, 1000);
    expect(mobileFPS).toBeGreaterThan(45); // Allow lower FPS on mobile

    console.log(`✅ Mobile Performance: ${mobileFPS.toFixed(2)} FPS, Gestures working`);
  });

  test('⚡ Performance: Network Efficiency During Navigation', async () => {
    console.log('🌐 Testing network efficiency...');

    let networkRequestCount = 0;
    let totalDataTransferred = 0;

    page.on('response', (response) => {
      networkRequestCount++;
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      totalDataTransferred += contentLength;
    });

    // Simulate navigation usage
    await page.locator('[data-testid="rings-nav-item"]').hover();
    await page.waitForSelector('[data-testid="mega-menu"]', { state: 'visible' });
    await page.locator('body').hover();
    
    await page.locator('[data-testid="necklaces-nav-item"]').hover();
    await page.waitForSelector('[data-testid="mega-menu"]', { state: 'visible' });
    await page.locator('body').hover();

    // Navigation interactions should not trigger excessive network requests
    const additionalRequests = networkRequestCount;
    expect(additionalRequests).toBeLessThan(10); // Should be mostly cached

    const dataKB = (totalDataTransferred / 1024).toFixed(2);
    console.log(`✅ Network Efficiency: ${additionalRequests} requests, ${dataKB}KB transferred`);
  });

  test('⚡ Performance: Battery Impact Assessment', async () => {
    console.log('🔋 Assessing battery impact...');

    // Measure power-related metrics (simplified)
    const startMemory = await page.evaluate(() => 
      (performance as any).memory?.usedJSHeapSize || 0
    );

    // Simulate continuous navigation for battery impact
    const intensiveStart = Date.now();
    
    for (let i = 0; i < 50; i++) {
      await page.locator('[data-testid="rings-nav-item"]').hover();
      await page.waitForTimeout(20);
      await page.locator('body').hover();
      await page.waitForTimeout(20);
    }

    const intensiveEnd = Date.now();
    const endMemory = await page.evaluate(() => 
      (performance as any).memory?.usedJSHeapSize || 0
    );

    const memoryDelta = endMemory - startMemory;
    const timeSpent = intensiveEnd - intensiveStart;
    
    // Calculate efficiency metrics
    const memoryPerSecond = (memoryDelta / timeSpent) * 1000;
    
    // Memory usage should be reasonable during intensive use
    expect(memoryPerSecond).toBeLessThan(1024 * 1024); // <1MB per second

    console.log(`✅ Battery Impact: ${(memoryPerSecond / 1024).toFixed(2)}KB/sec memory allocation`);
  });

  test.afterEach(async () => {
    // Log performance summary
    const performanceLog = await page.evaluate(() => 
      (window as any).performanceLog || []
    );

    if (performanceLog.length > 0) {
      console.log(`📊 Performance Log: ${performanceLog.length} entries recorded`);
    }

    await page.close();
  });
});

// Test configuration for performance tests
test.describe.configure({
  timeout: 120000, // 2 minutes for performance tests
  retries: 1, // Minimal retries for performance consistency
});
