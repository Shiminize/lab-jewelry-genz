/**
 * Performance Visual Test Suite
 * Measures and validates visual performance metrics for 3D customizer
 * Ensures CLAUDE_RULES <100ms material switching compliance
 */

import { test, expect, Page } from '@playwright/test'

// Performance thresholds based on CLAUDE_RULES
const PERFORMANCE_THRESHOLDS = {
  materialSwitch: 100, // <100ms material switching
  initialLoad: 3000,   // <3s initial load
  imageLoad: 1000,     // <1s per image
  interaction: 16,     // <16ms interaction response (60fps)
  lcp: 2500,          // <2.5s Largest Contentful Paint
  fid: 100,           // <100ms First Input Delay
  cls: 0.1            // <0.1 Cumulative Layout Shift
}

test.describe('Performance Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.coverage.startJSCoverage()
    await page.coverage.startCSSCoverage()
  })

  test.afterEach(async ({ page }) => {
    const jsCoverage = await page.coverage.stopJSCoverage()
    const cssCoverage = await page.coverage.stopCSSCoverage()
    
    console.log(`JS Coverage: ${jsCoverage.length} files`)
    console.log(`CSS Coverage: ${cssCoverage.length} files`)
  })

  // Test 1: Material switching performance validation
  test('Material switching performance < 100ms', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    await page.waitForTimeout(2000) // Allow preloading to complete

    const materials = ['18K White Gold', '18K Rose Gold', '18K Yellow Gold', 'Platinum']
    const switchTimes: number[] = []

    for (const material of materials) {
      const startTime = performance.now()
      
      // Click material button
      await page.click(`button:has-text("${material}")`)
      
      // Wait for visual change (image src update)
      await page.waitForFunction(
        () => {
          const img = document.querySelector('[data-testid="material-switcher"] img')
          return img && img.src.includes(material.toLowerCase().replace(/\s+/g, '-'))
        },
        { timeout: 500 }
      )
      
      const endTime = performance.now()
      const switchTime = endTime - startTime
      switchTimes.push(switchTime)
      
      console.log(`${material} switch time: ${switchTime.toFixed(1)}ms`)
      
      // Verify CLAUDE_RULES compliance
      expect(switchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.materialSwitch)
      
      // Take visual proof screenshot
      const viewer = page.locator('[data-testid="material-switcher"] > div:first-child')
      const screenshot = await viewer.screenshot({ threshold: 0.3 })
      await expect(screenshot).toMatchSnapshot(`perf-${material.toLowerCase().replace(/\s+/g, '-')}.png`)
    }

    const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
    console.log(`Average material switch time: ${avgSwitchTime.toFixed(1)}ms`)
    expect(avgSwitchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.materialSwitch / 2) // Even better than required
  })

  // Test 2: Initial load performance
  test('Initial load performance validation', async ({ page }) => {
    const startTime = performance.now()
    
    await page.goto('/customizer')
    
    // Wait for 3D customizer to be fully interactive
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    await page.waitForSelector('text=CLAUDE_RULES Optimized', { timeout: 30000 })
    
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    console.log(`Initial load time: ${loadTime.toFixed(1)}ms`)
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.initialLoad)
    
    // Visual proof of loaded state
    const screenshot = await page.screenshot({ fullPage: true })
    await expect(screenshot).toMatchSnapshot('perf-initial-load-complete.png')
  })

  // Test 3: Web Vitals measurement
  test('Core Web Vitals validation', async ({ page }) => {
    await page.goto('/customizer')
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise<{lcp: number, fid: number, cls: number}>((resolve) => {
        let lcp = 0, fid = 0, cls = 0
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          if (entries.length > 0) {
            lcp = entries[entries.length - 1].startTime
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            fid = entry.processingStart - entry.startTime
          })
        }).observe({ entryTypes: ['first-input'], buffered: true })
        
        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          })
        }).observe({ entryTypes: ['layout-shift'], buffered: true })
        
        // Resolve after a short delay to collect metrics
        setTimeout(() => resolve({ lcp, fid, cls }), 2000)
      })
    })
    
    console.log('Core Web Vitals:', vitals)
    
    // Validate against thresholds
    expect(vitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.lcp)
    expect(vitals.fid).toBeLessThan(PERFORMANCE_THRESHOLDS.fid)
    expect(vitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.cls)
  })

  // Test 4: Memory usage validation
  test('Memory usage during material switching', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    await page.waitForTimeout(3000) // Allow complete preloading
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (initialMemory) {
      console.log('Initial memory usage:', initialMemory)
    }
    
    // Perform rapid material switching
    const materials = ['18K White Gold', '18K Rose Gold', '18K Yellow Gold', 'Platinum']
    
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const material of materials) {
        await page.click(`button:has-text("${material}")`)
        await page.waitForTimeout(50) // Rapid switching
      }
    }
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (finalMemory && initialMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      console.log('Memory increase:', memoryIncrease, 'bytes')
      console.log('Final memory usage:', finalMemory)
      
      // Memory should not increase significantly during material switching
      // due to proper preloading and caching
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // <10MB increase
    }
  })

  // Test 5: Frame rate consistency
  test('Frame rate during auto-rotation', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    
    // Enable auto-rotation if available
    const autoRotateButton = page.locator('button[class*="animate-spin"]').first()
    if (await autoRotateButton.count() > 0) {
      await autoRotateButton.click()
      
      // Measure frame rate during auto-rotation
      const frameRates = await page.evaluate(() => {
        return new Promise<number[]>((resolve) => {
          const rates: number[] = []
          let lastTime = performance.now()
          let frameCount = 0
          
          function measureFrame() {
            const currentTime = performance.now()
            const elapsed = currentTime - lastTime
            
            if (elapsed >= 100) { // Measure every 100ms
              const fps = Math.round(1000 / (elapsed / frameCount))
              rates.push(fps)
              frameCount = 0
              lastTime = currentTime
            }
            frameCount++
            
            if (rates.length < 30) { // Collect 30 samples (3 seconds)
              requestAnimationFrame(measureFrame)
            } else {
              resolve(rates)
            }
          }
          
          requestAnimationFrame(measureFrame)
        })
      })
      
      const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length
      console.log('Average frame rate:', avgFrameRate, 'fps')
      console.log('Frame rate samples:', frameRates)
      
      // Should maintain at least 30fps for smooth animation
      expect(avgFrameRate).toBeGreaterThan(30)
      
      // Disable auto-rotation
      await autoRotateButton.click()
    }
  })

  // Test 6: Network performance validation
  test('Network efficiency validation', async ({ page }) => {
    const networkRequests: Array<{url: string, size: number, timing: number}> = []
    
    page.on('response', async (response) => {
      if (response.url().includes('.webp') || response.url().includes('.avif')) {
        const timing = response.timing()?.receiveEnd || 0
        const headers = response.headers()
        const size = parseInt(headers['content-length'] || '0')
        
        networkRequests.push({
          url: response.url(),
          size,
          timing
        })
      }
    })
    
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    await page.waitForTimeout(5000) // Allow all preloading to complete
    
    console.log(`Total image requests: ${networkRequests.length}`)
    
    const totalSize = networkRequests.reduce((sum, req) => sum + req.size, 0)
    const avgLoadTime = networkRequests.reduce((sum, req) => sum + req.timing, 0) / networkRequests.length
    
    console.log(`Total images size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Average image load time: ${avgLoadTime.toFixed(1)}ms`)
    
    // Validate network efficiency
    expect(avgLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.imageLoad)
    expect(totalSize).toBeLessThan(50 * 1024 * 1024) // <50MB total (after optimization)
  })

  // Test 7: CPU usage during interaction
  test('CPU efficiency validation', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    
    // Start performance profiling
    await page.evaluate(() => {
      (window as any).startTime = performance.now()
    })
    
    // Perform intensive interactions
    const materials = ['18K White Gold', '18K Rose Gold', '18K Yellow Gold', 'Platinum']
    
    for (let i = 0; i < 20; i++) {
      for (const material of materials) {
        await page.click(`button:has-text("${material}")`)
        await page.waitForTimeout(10) // Very rapid switching
      }
    }
    
    // Measure total execution time
    const totalTime = await page.evaluate(() => {
      return performance.now() - (window as any).startTime
    })
    
    console.log(`Total interaction time: ${totalTime.toFixed(1)}ms`)
    console.log(`Average per-switch time: ${(totalTime / (20 * 4)).toFixed(1)}ms`)
    
    // Should maintain efficiency even under stress
    expect(totalTime / (20 * 4)).toBeLessThan(PERFORMANCE_THRESHOLDS.materialSwitch)
  })
})

test.describe('Performance Regression Tests', () => {
  // Test 8: Performance comparison baseline
  test('Performance baseline establishment', async ({ page }) => {
    const performanceMetrics = {
      pageLoad: 0,
      firstMaterialSwitch: 0,
      preloadingComplete: 0,
      memoryUsage: 0
    }
    
    // Page load timing
    const startTime = performance.now()
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]')
    performanceMetrics.pageLoad = performance.now() - startTime
    
    // First material switch timing
    const switchStart = performance.now()
    await page.click('button:has-text("18K White Gold")')
    await page.waitForTimeout(100)
    performanceMetrics.firstMaterialSwitch = performance.now() - switchStart
    
    // Preloading complete timing
    await page.waitForSelector('text=CLAUDE_RULES Optimized', { timeout: 30000 })
    performanceMetrics.preloadingComplete = performance.now() - startTime
    
    // Memory usage
    const memory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    performanceMetrics.memoryUsage = memory
    
    console.log('Performance Baseline Metrics:', performanceMetrics)
    
    // Store baseline for regression testing
    await page.evaluate((metrics) => {
      localStorage.setItem('performance_baseline', JSON.stringify(metrics))
    }, performanceMetrics)
    
    // Visual proof of performance state
    const screenshot = await page.screenshot()
    await expect(screenshot).toMatchSnapshot('performance-baseline.png')
  })
})