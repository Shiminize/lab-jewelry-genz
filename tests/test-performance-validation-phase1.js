/**
 * Performance Validation Test - Phase 1
 * Validates that Phase 1 optimizations achieve <90ms material switching
 * 
 * This test must PASS with all metrics SURPASSING targets before Phase 1 is complete
 */

const { test, expect } = require('@playwright/test')

test.describe('Phase 1 Performance Validation', () => {
  test('Final Performance Validation - All Targets Must Be Surpassed', async ({ page }) => {
    console.log('🚀 Starting Phase 1 Performance Validation...')
    
    // Test both homepage and customizer
    const testPages = [
      { url: '/', name: 'Homepage', container: '[data-testid="customizer-3d-container"]' },
      { url: '/customizer', name: 'Customizer', container: '[data-testid="product-customizer"]' }
    ]
    
    const allResults = []
    
    for (const testPage of testPages) {
      console.log(`\n📋 Testing ${testPage.name} Performance...`)
      
      await page.goto(testPage.url)
      await expect(page.locator(testPage.container)).toBeVisible()
      
      // Allow prefetching to complete
      console.log('⏳ Waiting for asset prefetching...')
      await page.waitForTimeout(5000)
      
      // Test all material switch combinations
      const materials = ['18k-rose-gold', 'platinum', '18k-white-gold', '18k-yellow-gold']
      const pageResults = []
      
      for (let i = 0; i < materials.length - 1; i++) {
        const fromMaterial = materials[i]
        const toMaterial = materials[i + 1]
        
        console.log(`🔄 Testing switch: ${fromMaterial} → ${toMaterial}`)
        
        const result = await page.evaluate(async ([from, to, pageName]) => {
          const startTime = performance.now()
          
          // Find and click material button
          const button = document.querySelector(`button[data-material-id="${to}"]`)
          if (!button) {
            throw new Error(`Material button ${to} not found on ${pageName}`)
          }
          
          button.click()
          
          // Wait for visual update
          let attempts = 0
          const maxAttempts = 200 // 2 seconds max
          
          while (attempts < maxAttempts) {
            const img = document.querySelector('[data-testid="3d-viewer-image"]') ||
                       document.querySelector('img[alt*="3D jewelry"]') ||
                       document.querySelector('img[src*="sequences"]')
            
            if (img && (img.src.includes(to) || img.getAttribute('alt')?.includes(to))) {
              break
            }
            
            await new Promise(resolve => setTimeout(resolve, 10))
            attempts++
          }
          
          const endTime = performance.now()
          const switchTime = endTime - startTime
          
          // Check if cached
          const isCached = window.console.log.toString().includes('[CACHE HIT]') || 
                          performance.getEntriesByType('measure').some(m => m.name.includes('cache'))
          
          return {
            switchTime,
            from,
            to,
            isCached,
            pageName,
            attempts,
            timestamp: new Date().toISOString()
          }
        }, [fromMaterial, toMaterial, testPage.name])
        
        pageResults.push(result)
        allResults.push(result)
        
        console.log(`  ⚡ Switch time: ${result.switchTime.toFixed(2)}ms ${result.isCached ? '(cached)' : '(fetched)'}`)
        
        // CRITICAL VALIDATION: Must be <90ms
        if (result.switchTime >= 90) {
          console.error(`❌ FAILED: ${result.switchTime.toFixed(2)}ms exceeds 90ms target`)
          throw new Error(`Performance target not met: ${result.switchTime.toFixed(2)}ms >= 90ms`)
        }
        
        // Wait between tests
        await page.waitForTimeout(100)
      }
      
      // Calculate page statistics
      const pageTimes = pageResults.map(r => r.switchTime)
      const pageAvg = pageTimes.reduce((sum, time) => sum + time, 0) / pageTimes.length
      const pageMax = Math.max(...pageTimes)
      const pageMin = Math.min(...pageTimes)
      const cachedCount = pageResults.filter(r => r.isCached).length
      
      console.log(`\n📊 ${testPage.name} Results:`)
      console.log(`  Average: ${pageAvg.toFixed(2)}ms`)
      console.log(`  Max: ${pageMax.toFixed(2)}ms`)
      console.log(`  Min: ${pageMin.toFixed(2)}ms`)
      console.log(`  Cached: ${cachedCount}/${pageResults.length}`)
      
      // Validate page performance
      expect(pageAvg, `${testPage.name} average time`).toBeLessThan(75) // Stricter than 90ms
      expect(pageMax, `${testPage.name} max time`).toBeLessThan(90) // Must not exceed target
    }
    
    // Overall performance validation
    const allTimes = allResults.map(r => r.switchTime)
    const overallAvg = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
    const overallMax = Math.max(...allTimes)
    const totalCached = allResults.filter(r => r.isCached).length
    const cacheHitRate = (totalCached / allResults.length) * 100
    
    console.log(`\n🎯 OVERALL PHASE 1 RESULTS:`)
    console.log(`  Tests Run: ${allResults.length}`)
    console.log(`  Average Switch Time: ${overallAvg.toFixed(2)}ms`)
    console.log(`  Max Switch Time: ${overallMax.toFixed(2)}ms`)
    console.log(`  Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`)
    console.log(`  Target: <90ms (SURPASS <100ms CLAUDE_RULES)`)
    
    // FINAL VALIDATION - All targets must be SURPASSED
    const validationResults = [
      { metric: 'Average Time', value: overallAvg, target: 75, unit: 'ms' },
      { metric: 'Max Time', value: overallMax, target: 90, unit: 'ms' },
      { metric: 'Cache Hit Rate', value: cacheHitRate, target: 80, unit: '%', isHigherBetter: true }
    ]
    
    let allPassed = true
    
    console.log(`\n✅ VALIDATION RESULTS:`)
    validationResults.forEach(({ metric, value, target, unit, isHigherBetter }) => {
      const passed = isHigherBetter ? value > target : value < target
      const status = passed ? '✅ PASS' : '❌ FAIL'
      const comparison = isHigherBetter ? '>' : '<'
      
      console.log(`  ${metric}: ${value.toFixed(2)}${unit} ${comparison} ${target}${unit} ${status}`)
      
      if (!passed) {
        allPassed = false
      }
      
      // Playwright assertion
      if (isHigherBetter) {
        expect(value, `${metric} must surpass ${target}${unit}`).toBeGreaterThan(target)
      } else {
        expect(value, `${metric} must be under ${target}${unit}`).toBeLessThan(target)
      }
    })
    
    if (allPassed) {
      console.log(`\n🎉 PHASE 1 COMPLETE - ALL TARGETS SURPASSED!`)
      console.log(`   Material switching optimized from 273ms to ${overallAvg.toFixed(2)}ms`)
      console.log(`   Performance improvement: ${((273 - overallAvg) / 273 * 100).toFixed(1)}%`)
      console.log(`   Ready for Phase 2: RAF-based smooth rotation`)
    } else {
      console.error(`\n💥 PHASE 1 FAILED - Performance targets not met`)
      throw new Error('Phase 1 validation failed - performance targets not surpassed')
    }
  })

  test('Memory Usage Validation', async ({ page }) => {
    console.log('🧠 Testing Memory Usage...')
    
    await page.goto('/customizer')
    await page.waitForTimeout(2000)
    
    // Measure baseline memory
    const baselineMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize
        }
      }
      return null
    })
    
    if (!baselineMemory) {
      console.log('⚠️  Memory measurement not available in this browser')
      return
    }
    
    console.log(`📊 Baseline memory: ${(baselineMemory.used / 1024 / 1024).toFixed(2)}MB`)
    
    // Stress test with multiple material switches
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const material of materials) {
        await page.click(`button[data-material-id="${material}"]`)
        await page.waitForTimeout(50) // Fast switching
      }
    }
    
    // Measure final memory
    const finalMemory = await page.evaluate(() => {
      // Force garbage collection if available
      if (window.gc) {
        window.gc()
      }
      
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize
        }
      }
      return null
    })
    
    if (finalMemory) {
      const memoryIncrease = finalMemory.used - baselineMemory.used
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024
      
      console.log(`📊 Final memory: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`)
      console.log(`📈 Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`)
      
      // Validate memory increase is acceptable
      expect(memoryIncreaseMB, 'Memory increase must be <100MB').toBeLessThan(100)
      
      if (memoryIncreaseMB < 50) {
        console.log('✅ Excellent memory management (<50MB increase)')
      } else if (memoryIncreaseMB < 100) {
        console.log('✅ Good memory management (<100MB increase)')
      }
    }
  })

  test('Network Efficiency Validation', async ({ page }) => {
    console.log('🌐 Testing Network Efficiency...')
    
    let networkRequests = 0
    let assetRequests = 0
    let cacheHits = 0
    
    // Monitor network
    page.on('request', request => {
      networkRequests++
      if (request.url().includes('/api/products/customizable/') || 
          request.url().includes('/sequences/')) {
        assetRequests++
        console.log(`🔗 Asset request: ${request.url()}`)
      }
    })
    
    // Monitor cache hits
    page.on('console', msg => {
      if (msg.text().includes('[CACHE HIT]')) {
        cacheHits++
      }
    })
    
    await page.goto('/customizer')
    await page.waitForTimeout(3000) // Allow prefetching
    
    const initialAssetRequests = assetRequests
    
    // Switch materials multiple times
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (let cycle = 0; cycle < 2; cycle++) {
      for (const material of materials) {
        await page.click(`button[data-material-id="${material}"]`)
        await page.waitForTimeout(200)
      }
    }
    
    const additionalAssetRequests = assetRequests - initialAssetRequests
    const efficiency = cacheHits / (cacheHits + additionalAssetRequests) * 100
    
    console.log(`📊 Network Results:`)
    console.log(`  Initial requests: ${initialAssetRequests}`)
    console.log(`  Additional requests: ${additionalAssetRequests}`)
    console.log(`  Cache hits: ${cacheHits}`)
    console.log(`  Cache efficiency: ${efficiency.toFixed(1)}%`)
    
    // Validate network efficiency
    expect(additionalAssetRequests, 'Should minimize additional requests').toBeLessThan(3)
    expect(cacheHits, 'Should have cache hits').toBeGreaterThan(5)
    
    console.log('✅ Network efficiency validated')
  })
})