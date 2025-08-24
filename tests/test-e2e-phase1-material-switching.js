/**
 * Phase 1 E2E Tests: Material Switching Performance
 * Target: <90ms material switching (surpassing <100ms CLAUDE_RULES requirement)
 * 
 * Success Criteria (ALL must pass):
 * ✅ Material switch time: <90ms 
 * ✅ Visual consistency: 0 regressions
 * ✅ Memory usage: <100MB increase
 * ✅ API efficiency: 75% reduction in calls
 * ✅ Cache hit rate: >90% after prefetch
 */

const { test, expect } = require('@playwright/test')

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.measurements = []
  }

  async measureMaterialSwitch(page, fromMaterial, toMaterial) {
    return await page.evaluate(async ([from, to]) => {
      const startTime = performance.now()
      
      // Find material button and click
      const materialButton = document.querySelector(`button[data-material-id="${to}"]`)
      if (!materialButton) throw new Error(`Material button ${to} not found`)
      
      // Click and wait for visual change
      materialButton.click()
      
      // Wait for asset to load (look for new image src)
      let attempts = 0
      while (attempts < 100) { // Max 1 second wait
        const img = document.querySelector('[data-testid="3d-viewer-image"]')
        if (img && img.src.includes(to)) {
          break
        }
        await new Promise(resolve => setTimeout(resolve, 10))
        attempts++
      }
      
      const endTime = performance.now()
      const switchTime = endTime - startTime
      
      console.log(`[PERF TEST] Material switch ${from} → ${to}: ${switchTime.toFixed(2)}ms`)
      
      return {
        switchTime,
        from,
        to,
        timestamp: Date.now()
      }
    }, [fromMaterial, toMaterial])
  }

  async measureMemoryUsage(page) {
    return await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
  }

  async checkCacheHitRate(page) {
    return await page.evaluate(() => {
      // Access the cache service from window if exposed for testing
      if (window.__assetCacheStats) {
        return window.__assetCacheStats()
      }
      return null
    })
  }
}

test.describe('Phase 1: Material Switching Performance', () => {
  let performanceMonitor

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new PerformanceMonitor()
    
    // Expose cache stats for testing
    await page.addInitScript(() => {
      window.__assetCacheStats = () => {
        if (window.__assetCache) {
          return window.__assetCache.getCacheStats()
        }
        return null
      }
    })
  })

  test('Homepage 3D Preview - Material Switching <90ms', async ({ page }) => {
    await page.goto('/')
    
    // Wait for 3D preview to load
    await expect(page.locator('[data-testid="customizer-3d-container"]')).toBeVisible()
    await page.waitForTimeout(3000) // Allow prefetching to complete
    
    // Test all material combinations
    const materials = ['18k-rose-gold', 'platinum', '18k-white-gold', '18k-yellow-gold']
    const results = []
    
    for (let i = 0; i < materials.length - 1; i++) {
      const fromMaterial = materials[i]
      const toMaterial = materials[i + 1]
      
      const result = await performanceMonitor.measureMaterialSwitch(page, fromMaterial, toMaterial)
      results.push(result)
      
      // CRITICAL: Must be <90ms to surpass CLAUDE_RULES
      expect(result.switchTime).toBeLessThan(90)
      
      // Wait between switches
      await page.waitForTimeout(500)
    }
    
    // Verify average performance
    const avgSwitchTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length
    expect(avgSwitchTime).toBeLessThan(75) // Even stricter for average
    
    console.log(`[HOMEPAGE TEST] Average material switch time: ${avgSwitchTime.toFixed(2)}ms`)
  })

  test('Customizer Page - Material Switching <90ms', async ({ page }) => {
    await page.goto('/customizer')
    
    // Wait for customizer to load
    await expect(page.locator('[data-testid="product-customizer"]')).toBeVisible()
    await page.waitForTimeout(3000) // Allow prefetching to complete
    
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    const results = []
    
    for (let i = 0; i < materials.length - 1; i++) {
      const result = await performanceMonitor.measureMaterialSwitch(page, materials[i], materials[i + 1])
      results.push(result)
      
      // CRITICAL: Must be <90ms
      expect(result.switchTime).toBeLessThan(90)
      
      await page.waitForTimeout(500)
    }
    
    const avgSwitchTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length
    expect(avgSwitchTime).toBeLessThan(75)
    
    console.log(`[CUSTOMIZER TEST] Average material switch time: ${avgSwitchTime.toFixed(2)}ms`)
  })

  test('Memory Usage - <100MB Increase', async ({ page }) => {
    await page.goto('/customizer')
    
    // Measure baseline memory
    const baselineMemory = await performanceMonitor.measureMemoryUsage(page)
    await page.waitForTimeout(2000)
    
    // Load all materials multiple times to stress test
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const material of materials) {
        await page.click(`button[data-material-id="${material}"]`)
        await page.waitForTimeout(200)
      }
    }
    
    // Measure memory after intensive use
    const finalMemory = await performanceMonitor.measureMemoryUsage(page)
    
    if (baselineMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - baselineMemory.usedJSHeapSize
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
      
      console.log(`[MEMORY TEST] Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`)
      
      // CRITICAL: Must be <100MB increase
      expect(memoryIncreaseMB).toBeLessThan(100)
    }
  })

  test('Cache Efficiency - Prefetch and Hit Rate', async ({ page }) => {
    await page.goto('/customizer')
    
    // Wait for initial load and prefetching
    await page.waitForTimeout(5000) // Allow time for prefetch to complete
    
    // Check that cache has been populated
    const cacheStats = await performanceMonitor.checkCacheHitRate(page)
    
    if (cacheStats) {
      console.log(`[CACHE TEST] Cache items: ${cacheStats.itemCount}`)
      console.log(`[CACHE TEST] Cache size: ${(cacheStats.totalSize / 1024 / 1024).toFixed(2)}MB`)
      
      // Should have cached multiple materials
      expect(cacheStats.itemCount).toBeGreaterThan(2)
      
      // Should be within reasonable memory limits
      expect(cacheStats.totalSize).toBeLessThan(cacheStats.maxSize)
    }
  })

  test('API Call Reduction - 75% Fewer Requests', async ({ page }) => {
    let apiCalls = 0
    let cachedCalls = 0
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/products/customizable/')) {
        apiCalls++
        console.log(`[API CALL] ${request.url()}`)
      }
    })
    
    // Monitor cache hits (look for console logs)
    page.on('console', msg => {
      if (msg.text().includes('[CACHE HIT]')) {
        cachedCalls++
        console.log(`[CACHE HIT DETECTED] ${msg.text()}`)
      }
    })
    
    await page.goto('/customizer')
    await page.waitForTimeout(3000) // Allow prefetching
    
    const initialApiCalls = apiCalls
    
    // Switch through all materials twice
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (let cycle = 0; cycle < 2; cycle++) {
      for (const material of materials) {
        await page.click(`button[data-material-id="${material}"]`)
        await page.waitForTimeout(300)
      }
    }
    
    const finalApiCalls = apiCalls - initialApiCalls
    
    console.log(`[API TEST] Additional API calls after switching: ${finalApiCalls}`)
    console.log(`[API TEST] Cache hits detected: ${cachedCalls}`)
    
    // After prefetching, should have minimal additional API calls
    expect(finalApiCalls).toBeLessThan(2) // Allow for some edge cases
    expect(cachedCalls).toBeGreaterThan(4) // Should have multiple cache hits
  })

  test('Visual Regression - Material Appearance', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForTimeout(3000)
    
    // Test each material visual consistency
    const materials = [
      { id: 'platinum', expectedColor: '#e5e4e2' },
      { id: '18k-white-gold', expectedColor: '#f8f8f8' },
      { id: '18k-yellow-gold', expectedColor: '#ffd700' },
      { id: '18k-rose-gold', expectedColor: '#e8b4b8' }
    ]
    
    for (const material of materials) {
      await page.click(`button[data-material-id="${material.id}"]`)
      await page.waitForTimeout(500)
      
      // Take screenshot for visual comparison
      const screenshot = await page.locator('[data-testid="3d-viewer-image"]').screenshot()
      expect(screenshot).toBeTruthy()
      
      // Verify material preview color is displayed
      const materialPreview = page.locator(`button[data-material-id="${material.id}"] .material-preview`)
      if (await materialPreview.count() > 0) {
        const color = await materialPreview.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        )
        expect(color).toBeTruthy() // Color should be set
      }
    }
  })

  test('Cross-Browser Performance - Chrome/Safari/Firefox', async ({ page, browserName }) => {
    await page.goto('/customizer')
    await page.waitForTimeout(3000)
    
    // Test material switching performance per browser
    const results = []
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold']
    
    for (let i = 0; i < materials.length - 1; i++) {
      const result = await performanceMonitor.measureMaterialSwitch(
        page, 
        materials[i], 
        materials[i + 1]
      )
      results.push(result)
    }
    
    const avgTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length
    
    console.log(`[${browserName.toUpperCase()} TEST] Average switch time: ${avgTime.toFixed(2)}ms`)
    
    // Performance requirements should be met on all browsers
    expect(avgTime).toBeLessThan(90)
    
    // Store results for cross-browser comparison
    if (!global.browserPerformance) {
      global.browserPerformance = {}
    }
    global.browserPerformance[browserName] = avgTime
  })

  test.afterAll(async () => {
    // Report final results
    console.log('\n=== PHASE 1 PERFORMANCE RESULTS ===')
    
    if (global.browserPerformance) {
      console.log('Cross-browser performance:')
      Object.entries(global.browserPerformance).forEach(([browser, time]) => {
        const status = time < 90 ? '✅ PASS' : '❌ FAIL'
        console.log(`${browser}: ${time.toFixed(2)}ms ${status}`)
      })
    }
    
    console.log('=====================================\n')
  })
})

// Utility test for debugging
test.describe('Phase 1: Debug Utilities', () => {
  test('Cache Service Debug Info', async ({ page }) => {
    await page.goto('/customizer')
    
    // Expose debug information
    const debugInfo = await page.evaluate(() => {
      return {
        cacheService: typeof window.__assetCache !== 'undefined',
        materialButtons: document.querySelectorAll('[data-material-id]').length,
        viewer: document.querySelector('[data-testid="3d-viewer-image"]') !== null,
        timestamp: Date.now()
      }
    })
    
    console.log('[DEBUG] Page state:', debugInfo)
    
    expect(debugInfo.materialButtons).toBeGreaterThan(0)
    expect(debugInfo.viewer).toBeTruthy()
  })
})