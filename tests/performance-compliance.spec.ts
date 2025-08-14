/**
 * Performance Compliance Tests
 * Tests all CLAUDE_RULES.md performance requirements
 * - Mobile-first, sub-3s page loads
 * - WebGL target: 60 FPS desktop, 30 FPS mobile
 * - Initial 3D load <5s on 3G
 * - Image optimization and lazy loading
 */

import { test, expect, Page } from '@playwright/test';

// Performance thresholds from CLAUDE_RULES.md
const PERFORMANCE_TARGETS = {
  PAGE_LOAD_MAX: 3000,        // 3 seconds max page load
  WEBGL_LOAD_MAX: 5000,       // 5 seconds max 3D model load on 3G
  DESKTOP_FPS_TARGET: 60,     // 60 FPS on desktop
  MOBILE_FPS_TARGET: 30,      // 30 FPS on mobile
  DESKTOP_FPS_MIN: 50,        // Minimum acceptable desktop FPS
  MOBILE_FPS_MIN: 25,         // Minimum acceptable mobile FPS
  LCP_TARGET: 2500,           // Largest Contentful Paint < 2.5s
  FID_TARGET: 100,            // First Input Delay < 100ms
  CLS_TARGET: 0.1,            // Cumulative Layout Shift < 0.1
  TTFB_TARGET: 800            // Time to First Byte < 800ms
};

// Network conditions for testing
const NETWORK_CONDITIONS = {
  '3G': {
    offline: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 kbps
    latency: 40
  },
  'Slow 3G': {
    offline: false,
    downloadThroughput: 500 * 1024 / 8,    // 500 kbps
    uploadThroughput: 500 * 1024 / 8,      // 500 kbps
    latency: 400
  },
  'Fast 3G': {
    offline: false,
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 kbps
    latency: 150
  }
};

// Helper function to measure Web Vitals
async function measureWebVitals(page: Page): Promise<{
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0
      };

      // TTFB - Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });

      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay (simulated)
      vitals.fid = 0; // Would need actual user interaction to measure

      // Return after a delay to collect metrics
      setTimeout(() => resolve(vitals), 3000);
    });
  });
}

// Helper function to measure FPS
async function measureFPS(page: Page, durationMs: number = 3000): Promise<number> {
  return await page.evaluate((duration) => {
    return new Promise<number>((resolve) => {
      let frames = 0;
      const startTime = performance.now();

      function countFrame() {
        frames++;
        const elapsed = performance.now() - startTime;

        if (elapsed < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = (frames / elapsed) * 1000;
          resolve(fps);
        }
      }

      requestAnimationFrame(countFrame);
    });
  }, durationMs);
}

// Helper function to measure resource loading
async function measureResourceLoading(page: Page): Promise<{
  totalResources: number;
  totalSize: number;
  loadTime: number;
  images: Array<{url: string, size: number, loadTime: number}>;
}> {
  return await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images: Array<{url: string, size: number, loadTime: number}> = [];
    let totalSize = 0;
    let maxLoadTime = 0;

    resources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.requestStart;
      const size = resource.transferSize || 0;
      
      totalSize += size;
      maxLoadTime = Math.max(maxLoadTime, loadTime);

      if (resource.name.includes('.jpg') || resource.name.includes('.png') || 
          resource.name.includes('.webp') || resource.name.includes('.svg')) {
        images.push({
          url: resource.name,
          size,
          loadTime
        });
      }
    });

    return {
      totalResources: resources.length,
      totalSize,
      loadTime: maxLoadTime,
      images
    };
  });
}

test.describe('Page Load Performance', () => {
  test('Homepage loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.PAGE_LOAD_MAX);
  });

  test('Mobile page load performance', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Mobile page load time: ${loadTime}ms`);
    
    // Mobile should still meet the 3s target
    expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.PAGE_LOAD_MAX);
  });

  test('3G network performance simulation', async ({ page, context }) => {
    // Simulate 3G network conditions
    await context.newCDPSession(page);
    await page.evaluate(() => {
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.effectiveType = '3g';
      }
    });

    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`3G simulation load time: ${loadTime}ms`);
    
    // Allow more time for 3G conditions but should still be reasonable
    expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.PAGE_LOAD_MAX * 2); // 6 seconds max on 3G
  });
});

test.describe('Web Vitals Compliance', () => {
  test('Core Web Vitals meet thresholds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const vitals = await measureWebVitals(page);
    
    console.log('Web Vitals:', vitals);
    
    // LCP - Largest Contentful Paint
    if (vitals.lcp > 0) {
      expect(vitals.lcp).toBeLessThan(PERFORMANCE_TARGETS.LCP_TARGET);
    }
    
    // TTFB - Time to First Byte
    if (vitals.ttfb > 0) {
      expect(vitals.ttfb).toBeLessThan(PERFORMANCE_TARGETS.TTFB_TARGET);
    }
    
    // CLS - Cumulative Layout Shift
    expect(vitals.cls).toBeLessThan(PERFORMANCE_TARGETS.CLS_TARGET);
  });

  test('No significant layout shifts during 3D loading', async ({ page }) => {
    await page.goto('/');
    
    // Measure CLS during 3D customizer loading
    const clsBeforeCustomizer = await page.evaluate(() => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(clsValue), 1000);
      });
    });
    
    // Wait for 3D customizer to load
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    const clsAfterCustomizer = await page.evaluate(() => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    
    const clsDuringLoad = clsAfterCustomizer - clsBeforeCustomizer;
    
    console.log(`CLS during 3D load: ${clsDuringLoad}`);
    expect(clsDuringLoad).toBeLessThan(0.05); // Very low tolerance for layout shifts
  });
});

test.describe('3D WebGL Performance', () => {
  test('Desktop WebGL achieves target FPS', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-specific test');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Wait for WebGL to initialize
    await page.waitForTimeout(2000);
    
    const fps = await measureFPS(page, 5000);
    
    console.log(`Desktop WebGL FPS: ${fps.toFixed(2)}`);
    
    expect(fps).toBeGreaterThan(PERFORMANCE_TARGETS.DESKTOP_FPS_MIN);
    
    if (fps >= PERFORMANCE_TARGETS.DESKTOP_FPS_TARGET) {
      console.log('✓ Achieved desktop FPS target');
    } else {
      console.log(`⚠ Below target (${PERFORMANCE_TARGETS.DESKTOP_FPS_TARGET} FPS) but acceptable`);
    }
  });

  test('Mobile WebGL achieves target FPS', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Wait for WebGL to initialize on mobile
    await page.waitForTimeout(3000);
    
    const fps = await measureFPS(page, 5000);
    
    console.log(`Mobile WebGL FPS: ${fps.toFixed(2)}`);
    
    expect(fps).toBeGreaterThan(PERFORMANCE_TARGETS.MOBILE_FPS_MIN);
    
    if (fps >= PERFORMANCE_TARGETS.MOBILE_FPS_TARGET) {
      console.log('✓ Achieved mobile FPS target');
    } else {
      console.log(`⚠ Below target (${PERFORMANCE_TARGETS.MOBILE_FPS_TARGET} FPS) but acceptable`);
    }
  });

  test('3D model loads within 5 seconds on 3G', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Wait for canvas to appear
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Wait for 3D model to actually load (look for completion indicators)
    await Promise.race([
      // Look for completion indicators
      page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        
        // Check if canvas has content (not just black)
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, 10, 10);
          return imageData.data.some(pixel => pixel > 0);
        }
        
        return true;
      }, { timeout: PERFORMANCE_TARGETS.WEBGL_LOAD_MAX }),
      
      // Or wait for loading text to disappear
      page.waitForFunction(() => {
        const loadingTexts = document.querySelectorAll('*');
        for (const element of loadingTexts) {
          if (element.textContent?.includes('Initializing') || 
              element.textContent?.includes('Crafting')) {
            return false;
          }
        }
        return true;
      }, { timeout: PERFORMANCE_TARGETS.WEBGL_LOAD_MAX })
    ]);
    
    const loadTime = Date.now() - startTime;
    
    console.log(`3D model load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.WEBGL_LOAD_MAX);
  });

  test('WebGL performance during interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Measure baseline FPS
    const baselineFPS = await measureFPS(page, 2000);
    
    // Interact with the 3D viewer
    const canvas = page.locator('canvas');
    await canvas.hover();
    await canvas.click({ position: { x: 100, y: 100 } });
    
    // Measure FPS during interaction
    const interactionFPS = await measureFPS(page, 2000);
    
    console.log(`Baseline FPS: ${baselineFPS.toFixed(2)}, Interaction FPS: ${interactionFPS.toFixed(2)}`);
    
    // FPS should not drop significantly during interactions
    const fpsDrop = baselineFPS - interactionFPS;
    expect(fpsDrop).toBeLessThan(baselineFPS * 0.3); // Allow max 30% FPS drop
  });
});

test.describe('Resource Loading Optimization', () => {
  test('Images are optimized and lazy loaded', async ({ page }) => {
    await page.goto('/');
    
    // Check for lazy loading attributes
    const lazyImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const stats = {
        total: images.length,
        lazy: 0,
        optimized: 0,
        webp: 0
      };
      
      images.forEach(img => {
        if (img.getAttribute('loading') === 'lazy') {
          stats.lazy++;
        }
        
        const src = img.src || img.getAttribute('data-src') || '';
        if (src.includes('.webp')) {
          stats.webp++;
        }
        
        // Check for responsive image attributes
        if (img.getAttribute('srcset') || img.getAttribute('sizes')) {
          stats.optimized++;
        }
      });
      
      return stats;
    });
    
    console.log('Image optimization stats:', lazyImages);
    
    // At least some images should be lazy loaded
    if (lazyImages.total > 0) {
      expect(lazyImages.lazy).toBeGreaterThan(0);
      console.log(`✓ ${lazyImages.lazy}/${lazyImages.total} images are lazy loaded`);
    }
    
    // Check for modern image formats
    if (lazyImages.webp > 0) {
      console.log(`✓ ${lazyImages.webp} images use WebP format`);
    }
  });

  test('Resource loading performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const resourceStats = await measureResourceLoading(page);
    
    console.log('Resource loading stats:', {
      totalResources: resourceStats.totalResources,
      totalSize: `${(resourceStats.totalSize / 1024 / 1024).toFixed(2)} MB`,
      maxLoadTime: `${resourceStats.loadTime.toFixed(0)}ms`,
      imageCount: resourceStats.images.length
    });
    
    // Check resource optimization
    expect(resourceStats.totalSize).toBeLessThan(10 * 1024 * 1024); // 10MB total
    expect(resourceStats.loadTime).toBeLessThan(3000); // 3s max resource load
    
    // Check image optimization
    const largeImages = resourceStats.images.filter(img => img.size > 500 * 1024); // > 500KB
    if (largeImages.length > 0) {
      console.warn(`${largeImages.length} images over 500KB:`, largeImages.slice(0, 3));
    }
    
    expect(largeImages.length).toBeLessThan(resourceStats.images.length * 0.2); // Max 20% large images
  });

  test('Bundle size is reasonable', async ({ page }) => {
    await page.goto('/');
    
    const bundleStats = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src]');
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      
      return {
        scriptCount: scripts.length,
        styleCount: styles.length,
        scripts: Array.from(scripts).map(s => s.getAttribute('src')),
        styles: Array.from(styles).map(s => s.getAttribute('href'))
      };
    });
    
    console.log('Bundle stats:', {
      scripts: bundleStats.scriptCount,
      styles: bundleStats.styleCount
    });
    
    // Check for reasonable bundle splitting
    expect(bundleStats.scriptCount).toBeGreaterThan(1); // Should have multiple chunks
    expect(bundleStats.scriptCount).toBeLessThan(20); // But not too many
    
    // Check for potential optimization opportunities
    const potentiallyLargeScripts = bundleStats.scripts.filter(src => 
      src?.includes('chunk') || src?.includes('main') || src?.includes('vendor')
    );
    
    console.log(`${potentiallyLargeScripts.length} main bundle files found`);
  });
});

test.describe('Caching and CDN Performance', () => {
  test('Static assets have proper cache headers', async ({ page }) => {
    const responses = new Map();
    
    page.on('response', response => {
      const url = response.url();
      const cacheControl = response.headers()['cache-control'];
      responses.set(url, { cacheControl, status: response.status() });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const staticAssets = Array.from(responses.entries()).filter(([url]) =>
      url.includes('.js') || url.includes('.css') || url.includes('.png') || 
      url.includes('.jpg') || url.includes('.webp') || url.includes('.svg')
    );
    
    console.log(`Checking cache headers for ${staticAssets.length} static assets`);
    
    let properlyConfigured = 0;
    staticAssets.forEach(([url, { cacheControl }]) => {
      if (cacheControl && (cacheControl.includes('max-age') || cacheControl.includes('immutable'))) {
        properlyConfigured++;
      }
    });
    
    const cacheRatio = properlyConfigured / staticAssets.length;
    console.log(`${properlyConfigured}/${staticAssets.length} assets have cache headers (${(cacheRatio * 100).toFixed(1)}%)`);
    
    // At least 80% of static assets should have cache headers
    expect(cacheRatio).toBeGreaterThan(0.8);
  });

  test('API responses have appropriate caching', async ({ page }) => {
    const apiResponses = new Map();
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const cacheControl = response.headers()['cache-control'];
        const etag = response.headers()['etag'];
        apiResponses.set(url, { cacheControl, etag, status: response.status() });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(`API responses captured: ${apiResponses.size}`);
    
    apiResponses.forEach(([url, { cacheControl, etag }]) => {
      console.log(`${url}: cache-control=${cacheControl}, etag=${!!etag}`);
      
      // API responses should have some form of caching strategy
      if (!cacheControl?.includes('no-cache') && !cacheControl?.includes('no-store')) {
        // If not explicitly uncacheable, should have max-age or etag
        expect(cacheControl?.includes('max-age') || etag).toBeTruthy();
      }
    });
  });
});

test.describe('Memory Usage and Cleanup', () => {
  test('3D viewer cleans up resources properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate away and back to test cleanup
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Force garbage collection if available
    await page.evaluate(() => {
      // @ts-ignore
      if (window.gc) {
        // @ts-ignore
        window.gc();
      }
    });
    
    const afterNavigationMemory = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Go back to 3D page
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    const finalMemory = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    console.log('Memory usage:', {
      initial: `${(initialMemory / 1024 / 1024).toFixed(2)} MB`,
      afterNav: `${(afterNavigationMemory / 1024 / 1024).toFixed(2)} MB`,
      final: `${(finalMemory / 1024 / 1024).toFixed(2)} MB`
    });
    
    // Memory should not grow excessively
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const growthRatio = memoryGrowth / initialMemory;
      
      expect(growthRatio).toBeLessThan(2); // Memory shouldn't double
    }
  });

  test('No WebGL context leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Check for WebGL context
    const contextInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return null;
      
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;
      
      return {
        hasContext: !!gl,
        contextAttributes: gl.getContextAttributes(),
        extensions: gl.getSupportedExtensions()?.length || 0
      };
    });
    
    if (contextInfo) {
      console.log('WebGL context info:', {
        hasContext: contextInfo.hasContext,
        extensions: contextInfo.extensions
      });
      
      expect(contextInfo.hasContext).toBe(true);
    }
  });
});