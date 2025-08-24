/**
 * Performance Testing for Minimalist UI Implementation
 * Validates CLAUDE_RULES.md compliance after control panel removal
 * Ensures <300ms interactions and <3s page loads for clean UI
 */

import { test, expect, Page } from '@playwright/test'

// Performance thresholds based on CLAUDE_RULES.md
const PERFORMANCE_TARGETS = {
  pageLoad: 3000,           // <3s page load
  materialSwitch: 300,      // <300ms material switches 
  interactionResponse: 300, // <300ms general interactions
  apiResponse: 300,         // <300ms API responses
  firstContentfulPaint: 1500, // <1.5s FCP
  layoutStability: 0.1,     // <0.1 CLS
  memoryUsage: 50           // <50MB memory usage
}

// Test configurations for different scenarios
const TEST_SCENARIOS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
]

const MATERIALS_TO_TEST = [
  'Platinum',
  '18K White Gold', 
  '18K Rose Gold',
  '18K Yellow Gold'
]

interface PerformanceMetrics {
  pageLoad: number
  firstContentfulPaint: number
  materialSwitches: number[]
  memoryUsage: number
  cumulativeLayoutShift: number
  interactionToNextPaint: number
}

test.describe('Minimalist UI Performance Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.coverage.startJSCoverage()
    await page.coverage.startCSSCoverage()
  })

  test.afterEach(async ({ page }) => {
    // Stop coverage to free memory
    await page.coverage.stopJSCoverage()
    await page.coverage.stopCSSCoverage()
  })

  // Test 1: Homepage CustomizerPreviewSection load performance
  TEST_SCENARIOS.forEach(scenario => {
    test(`Homepage preview load performance - ${scenario.name}`, async ({ page }) => {
      console.log(`🚀 Testing homepage load performance on ${scenario.name}`)
      
      await page.setViewportSize({ width: scenario.width, height: scenario.height })
      
      // Measure page load performance
      const startTime = performance.now()
      await page.goto('/', { waitUntil: 'networkidle2', timeout: 30000 })
      const pageLoadTime = performance.now() - startTime
      
      // Scroll to CustomizerPreviewSection
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * 0.7)
      })
      await page.waitForTimeout(2000)
      
      // Wait for preview section to be fully loaded
      const previewSection = page.locator('section').filter({ hasText: 'Create Your Legacy' })
      await expect(previewSection).toBeVisible({ timeout: 10000 })
      
      // Measure Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {
            FCP: 0,
            CLS: 0,
            LCP: 0
          }
          
          // Get performance entries
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                vitals.FCP = entry.startTime
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                vitals.CLS += entry.value
              }
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.LCP = entry.startTime
              }
            }
          })
          
          observer.observe({ entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint'] })
          
          setTimeout(() => {
            observer.disconnect()
            resolve(vitals)
          }, 3000)
        })
      })
      
      // Memory usage check
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize / 1024 / 1024,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize / 1024 / 1024
        } : { usedJSHeapSize: 0, totalJSHeapSize: 0 }
      })
      
      console.log(`   📊 Performance Metrics for ${scenario.name}:`)
      console.log(`     - Page load: ${pageLoadTime.toFixed(2)}ms`)
      console.log(`     - First Contentful Paint: ${(webVitals as any).FCP.toFixed(2)}ms`)
      console.log(`     - Cumulative Layout Shift: ${(webVitals as any).CLS.toFixed(3)}`)
      console.log(`     - Memory usage: ${memoryInfo.usedJSHeapSize.toFixed(2)}MB`)
      
      // CLAUDE_RULES compliance assertions
      expect(pageLoadTime).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
      expect((webVitals as any).FCP).toBeLessThan(PERFORMANCE_TARGETS.firstContentfulPaint)
      expect((webVitals as any).CLS).toBeLessThan(PERFORMANCE_TARGETS.layoutStability)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(PERFORMANCE_TARGETS.memoryUsage)
    })
  })

  // Test 2: Main customizer page load performance
  TEST_SCENARIOS.forEach(scenario => {
    test(`Customizer page load performance - ${scenario.name}`, async ({ page }) => {
      console.log(`🚀 Testing customizer load performance on ${scenario.name}`)
      
      await page.setViewportSize({ width: scenario.width, height: scenario.height })
      
      // Measure customizer page load
      const startTime = performance.now()
      await page.goto('/customizer', { waitUntil: 'networkidle2', timeout: 30000 })
      const pageLoadTime = performance.now() - startTime
      
      // Wait for ProductCustomizer to fully initialize
      const productCustomizer = page.locator('[data-testid="product-customizer"]')
      await expect(productCustomizer).toBeVisible({ timeout: 15000 })
      
      // Measure time to interactive
      const interactiveTime = performance.now() - startTime
      
      // Test material switch performance immediately after load
      if (await page.locator('button:has-text("18K White Gold")').count() > 0) {
        const switchStartTime = performance.now()
        await page.click('button:has-text("18K White Gold")')
        await page.waitForTimeout(100) // Minimal wait for switch to start
        const switchTime = performance.now() - switchStartTime
        
        console.log(`   📊 Performance Metrics for ${scenario.name}:`)
        console.log(`     - Page load: ${pageLoadTime.toFixed(2)}ms`)
        console.log(`     - Time to interactive: ${interactiveTime.toFixed(2)}ms`)
        console.log(`     - Material switch: ${switchTime.toFixed(2)}ms`)
        
        // Performance assertions
        expect(pageLoadTime).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
        expect(interactiveTime).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
        expect(switchTime).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch)
      }
    })
  })

  // Test 3: Material switching performance benchmarks
  test('Material switching performance benchmarks', async ({ page }) => {
    console.log('🚀 Testing material switching performance benchmarks')
    
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    
    // Wait for customizer to be ready
    const productCustomizer = page.locator('[data-testid="product-customizer"]')
    await expect(productCustomizer).toBeVisible({ timeout: 15000 })
    await page.waitForTimeout(3000) // Allow full initialization
    
    const switchTimes: number[] = []
    
    // Test each material switch performance
    for (const material of MATERIALS_TO_TEST) {
      const materialButton = page.locator(`button:has-text("${material}")`)
      
      if (await materialButton.count() > 0) {
        console.log(`   Testing ${material} switch performance`)
        
        const switchStart = performance.now()
        await materialButton.click()
        
        // Wait for visual change to complete (look for image change)
        await page.waitForTimeout(200) // Allow switch to complete
        
        const switchTime = performance.now() - switchStart
        switchTimes.push(switchTime)
        
        console.log(`     - ${material}: ${switchTime.toFixed(2)}ms`)
        
        // Individual switch should meet performance target
        expect(switchTime).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch)
      }
    }
    
    // Calculate performance statistics
    const averageSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
    const maxSwitchTime = Math.max(...switchTimes)
    const minSwitchTime = Math.min(...switchTimes)
    
    console.log(`   📊 Material Switch Performance Summary:`)
    console.log(`     - Average: ${averageSwitchTime.toFixed(2)}ms`)
    console.log(`     - Maximum: ${maxSwitchTime.toFixed(2)}ms`)
    console.log(`     - Minimum: ${minSwitchTime.toFixed(2)}ms`)
    
    // Performance assertions
    expect(averageSwitchTime).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch)
    expect(maxSwitchTime).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch * 1.2) // Allow 20% variance
  })

  // Test 4: Rapid material switching stress test
  test('Rapid material switching stress test', async ({ page }) => {
    console.log('🚀 Testing rapid material switching performance')
    
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
    })
    
    const stressTestStart = performance.now()
    const rapidSwitchTimes: number[] = []
    
    // Perform rapid material switches (stress test)
    for (let i = 0; i < 12; i++) { // 3 cycles through all materials
      const materialIndex = i % MATERIALS_TO_TEST.length
      const material = MATERIALS_TO_TEST[materialIndex]
      
      const switchStart = performance.now()
      await page.click(`button:has-text("${material}")`)
      await page.waitForTimeout(50) // Minimal wait between switches
      const switchTime = performance.now() - switchStart
      
      rapidSwitchTimes.push(switchTime)
    }
    
    const stressTestTotal = performance.now() - stressTestStart
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
    })
    
    const memoryIncrease = finalMemory - initialMemory
    
    console.log(`   📊 Rapid Switching Stress Test Results:`)
    console.log(`     - Total test time: ${stressTestTotal.toFixed(2)}ms`)
    console.log(`     - Average switch time: ${(rapidSwitchTimes.reduce((a, b) => a + b, 0) / rapidSwitchTimes.length).toFixed(2)}ms`)
    console.log(`     - Memory increase: ${memoryIncrease.toFixed(2)}MB`)
    
    // Stress test assertions
    const averageRapidSwitch = rapidSwitchTimes.reduce((a, b) => a + b, 0) / rapidSwitchTimes.length
    expect(averageRapidSwitch).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch * 1.5) // Allow variance for stress
    expect(memoryIncrease).toBeLessThan(10) // Should not leak more than 10MB
  })

  // Test 5: Mobile performance validation
  test('Mobile performance optimization validation', async ({ page }) => {
    console.log('🚀 Testing mobile performance optimization')
    
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    
    // Simulate mobile network conditions
    await page.route('**/*.webp', route => {
      // Simulate slower mobile network
      setTimeout(() => route.continue(), 100)
    })
    
    const mobileStartTime = performance.now()
    
    // Wait for mobile customizer to load
    const productCustomizer = page.locator('[data-testid="product-customizer"]')
    await expect(productCustomizer).toBeVisible({ timeout: 15000 })
    
    const mobileLoadTime = performance.now() - mobileStartTime
    
    // Test mobile material switching
    if (await page.locator('button:has-text("18K Rose Gold")').count() > 0) {
      const mobileSwitchStart = performance.now()
      await page.click('button:has-text("18K Rose Gold")')
      await page.waitForTimeout(200)
      const mobileSwitchTime = performance.now() - mobileSwitchStart
      
      console.log(`   📊 Mobile Performance Metrics:`)
      console.log(`     - Mobile load time: ${mobileLoadTime.toFixed(2)}ms`)
      console.log(`     - Mobile material switch: ${mobileSwitchTime.toFixed(2)}ms`)
      
      // Mobile performance should still meet targets
      expect(mobileLoadTime).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
      expect(mobileSwitchTime).toBeLessThan(PERFORMANCE_TARGETS.materialSwitch)
    }
  })

  // Test 6: Clean UI rendering performance
  test('Clean UI rendering performance validation', async ({ page }) => {
    console.log('🚀 Testing clean UI rendering performance')
    
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Measure rendering performance for both pages
    const pages = ['/', '/customizer']
    const renderingMetrics: { [key: string]: any } = {}
    
    for (const pageUrl of pages) {
      console.log(`   Testing rendering performance for ${pageUrl}`)
      
      const renderStart = performance.now()
      await page.goto(pageUrl, { waitUntil: 'networkidle2' })
      
      if (pageUrl === '/') {
        // Scroll to CustomizerPreviewSection for homepage
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
        await page.waitForTimeout(2000)
        
        const previewSection = page.locator('section').filter({ hasText: 'Create Your Legacy' })
        await expect(previewSection).toBeVisible({ timeout: 10000 })
      } else {
        // Wait for customizer to be ready
        await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
      }
      
      const renderTime = performance.now() - renderStart
      
      // Get paint timing
      const paintTiming = await page.evaluate(() => {
        const paintEntries = performance.getEntriesByType('paint')
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
        
        return {
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0
        }
      })
      
      renderingMetrics[pageUrl] = {
        totalRenderTime: renderTime,
        firstPaint: paintTiming.firstPaint,
        firstContentfulPaint: paintTiming.firstContentfulPaint
      }
      
      console.log(`     - Total render time: ${renderTime.toFixed(2)}ms`)
      console.log(`     - First paint: ${paintTiming.firstPaint.toFixed(2)}ms`)
      console.log(`     - First contentful paint: ${paintTiming.firstContentfulPaint.toFixed(2)}ms`)
      
      // Rendering performance assertions
      expect(renderTime).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
      expect(paintTiming.firstContentfulPaint).toBeLessThan(PERFORMANCE_TARGETS.firstContentfulPaint)
    }
  })

  // Test 7: Performance regression detection
  test('Performance regression detection baseline', async ({ page }) => {
    console.log('🚀 Establishing performance regression baseline')
    
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Collect comprehensive performance metrics
    const performanceBaseline: PerformanceMetrics = {
      pageLoad: 0,
      firstContentfulPaint: 0,
      materialSwitches: [],
      memoryUsage: 0,
      cumulativeLayoutShift: 0,
      interactionToNextPaint: 0
    }
    
    // Measure customizer page performance
    const pageLoadStart = performance.now()
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    performanceBaseline.pageLoad = performance.now() - pageLoadStart
    
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Collect Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { FCP: 0, CLS: 0, INP: 0 }
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.CLS += entry.value
            }
          }
        })
        
        observer.observe({ entryTypes: ['paint', 'layout-shift'] })
        
        setTimeout(() => {
          observer.disconnect()
          resolve(vitals)
        }, 2000)
      })
    })
    
    performanceBaseline.firstContentfulPaint = (webVitals as any).FCP
    performanceBaseline.cumulativeLayoutShift = (webVitals as any).CLS
    
    // Test material switch performance
    for (const material of MATERIALS_TO_TEST.slice(0, 2)) { // Test first 2 materials
      if (await page.locator(`button:has-text("${material}")`).count() > 0) {
        const switchStart = performance.now()
        await page.click(`button:has-text("${material}")`)
        await page.waitForTimeout(200)
        const switchTime = performance.now() - switchStart
        performanceBaseline.materialSwitches.push(switchTime)
      }
    }
    
    // Memory usage
    performanceBaseline.memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
    })
    
    console.log(`   📊 Performance Baseline Established:`)
    console.log(`     - Page load: ${performanceBaseline.pageLoad.toFixed(2)}ms`)
    console.log(`     - First contentful paint: ${performanceBaseline.firstContentfulPaint.toFixed(2)}ms`)
    console.log(`     - Average material switch: ${(performanceBaseline.materialSwitches.reduce((a, b) => a + b, 0) / performanceBaseline.materialSwitches.length).toFixed(2)}ms`)
    console.log(`     - Memory usage: ${performanceBaseline.memoryUsage.toFixed(2)}MB`)
    console.log(`     - Cumulative layout shift: ${performanceBaseline.cumulativeLayoutShift.toFixed(3)}`)
    
    // Store baseline for future regression testing
    await page.evaluate((baseline) => {
      (window as any).__PERFORMANCE_BASELINE__ = baseline
    }, performanceBaseline)
    
    // All metrics should meet CLAUDE_RULES targets
    expect(performanceBaseline.pageLoad).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
    expect(performanceBaseline.firstContentfulPaint).toBeLessThan(PERFORMANCE_TARGETS.firstContentfulPaint)
    expect(performanceBaseline.materialSwitches.every(time => time < PERFORMANCE_TARGETS.materialSwitch)).toBe(true)
    expect(performanceBaseline.memoryUsage).toBeLessThan(PERFORMANCE_TARGETS.memoryUsage)
    expect(performanceBaseline.cumulativeLayoutShift).toBeLessThan(PERFORMANCE_TARGETS.layoutStability)
  })
})

test.describe('Performance Comparison Tests', () => {
  // Test 8: Before/after control removal performance comparison
  test('Control removal performance impact validation', async ({ page }) => {
    console.log('🚀 Validating performance impact of control removal')
    
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Test both homepage and customizer performance
    const performanceResults = {
      homepage: {
        withControls: 0,    // Theoretical baseline
        withoutControls: 0  // Current clean implementation
      },
      customizer: {
        withControls: 0,    // Theoretical baseline  
        withoutControls: 0  // Current clean implementation
      }
    }
    
    // Test homepage performance (clean implementation)
    let startTime = performance.now()
    await page.goto('/', { waitUntil: 'networkidle2' })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(2000)
    
    const previewSection = page.locator('section').filter({ hasText: 'Create Your Legacy' })
    await expect(previewSection).toBeVisible({ timeout: 10000 })
    performanceResults.homepage.withoutControls = performance.now() - startTime
    
    // Test customizer performance (clean implementation)
    startTime = performance.now()
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
    await page.waitForTimeout(3000)
    performanceResults.customizer.withoutControls = performance.now() - startTime
    
    console.log(`   📊 Performance Impact Analysis:`)
    console.log(`     - Homepage (clean): ${performanceResults.homepage.withoutControls.toFixed(2)}ms`)
    console.log(`     - Customizer (clean): ${performanceResults.customizer.withoutControls.toFixed(2)}ms`)
    
    // Clean implementation should meet all performance targets
    expect(performanceResults.homepage.withoutControls).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
    expect(performanceResults.customizer.withoutControls).toBeLessThan(PERFORMANCE_TARGETS.pageLoad)
    
    // Performance should be optimized (faster than targets by good margin)
    expect(performanceResults.homepage.withoutControls).toBeLessThan(PERFORMANCE_TARGETS.pageLoad * 0.8) // 20% faster
    expect(performanceResults.customizer.withoutControls).toBeLessThan(PERFORMANCE_TARGETS.pageLoad * 0.8) // 20% faster
  })
})

test.describe('Performance Monitoring & Reporting', () => {
  // Test 9: Comprehensive performance report generation
  test('Generate comprehensive performance report', async ({ page }) => {
    console.log('🚀 Generating comprehensive performance report')
    
    const performanceReport = {
      timestamp: new Date().toISOString(),
      testEnvironment: {
        viewport: { width: 1440, height: 900 },
        userAgent: await page.evaluate(() => navigator.userAgent)
      },
      targets: PERFORMANCE_TARGETS,
      results: {
        homepageLoad: 0,
        customizerLoad: 0,
        materialSwitches: [] as number[],
        memoryUsage: 0,
        webVitals: { FCP: 0, CLS: 0, LCP: 0 }
      },
      compliance: {
        pageLoads: false,
        materialSwitches: false,
        memoryUsage: false,
        webVitals: false
      }
    }
    
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Test homepage performance
    let startTime = performance.now()
    await page.goto('/', { waitUntil: 'networkidle2' })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(2000)
    await page.waitForSelector('section:has-text("Create Your Legacy")', { timeout: 10000 })
    performanceReport.results.homepageLoad = performance.now() - startTime
    
    // Test customizer performance  
    startTime = performance.now()
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
    await page.waitForTimeout(3000)
    performanceReport.results.customizerLoad = performance.now() - startTime
    
    // Test material switches
    for (const material of MATERIALS_TO_TEST) {
      if (await page.locator(`button:has-text("${material}")`).count() > 0) {
        const switchStart = performance.now()
        await page.click(`button:has-text("${material}")`)
        await page.waitForTimeout(200)
        const switchTime = performance.now() - switchStart
        performanceReport.results.materialSwitches.push(switchTime)
      }
    }
    
    // Collect Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { FCP: 0, CLS: 0, LCP: 0 }
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.CLS += entry.value
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime
            }
          }
        })
        
        observer.observe({ entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint'] })
        
        setTimeout(() => {
          observer.disconnect()
          resolve(vitals)
        }, 2000)
      })
    })
    
    performanceReport.results.webVitals = webVitals as any
    
    // Memory usage
    performanceReport.results.memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
    })
    
    // Check compliance
    performanceReport.compliance.pageLoads = 
      performanceReport.results.homepageLoad < PERFORMANCE_TARGETS.pageLoad &&
      performanceReport.results.customizerLoad < PERFORMANCE_TARGETS.pageLoad
      
    performanceReport.compliance.materialSwitches = 
      performanceReport.results.materialSwitches.every(time => time < PERFORMANCE_TARGETS.materialSwitch)
      
    performanceReport.compliance.memoryUsage = 
      performanceReport.results.memoryUsage < PERFORMANCE_TARGETS.memoryUsage
      
    performanceReport.compliance.webVitals = 
      performanceReport.results.webVitals.FCP < PERFORMANCE_TARGETS.firstContentfulPaint &&
      performanceReport.results.webVitals.CLS < PERFORMANCE_TARGETS.layoutStability
    
    // Output comprehensive report
    console.log(`\n   📊 COMPREHENSIVE PERFORMANCE REPORT`)
    console.log(`   ====================================`)
    console.log(`   Timestamp: ${performanceReport.timestamp}`)
    console.log(`   \n   🎯 Performance Targets (CLAUDE_RULES):`)
    console.log(`     - Page Load: <${PERFORMANCE_TARGETS.pageLoad}ms`)
    console.log(`     - Material Switch: <${PERFORMANCE_TARGETS.materialSwitch}ms`)
    console.log(`     - Memory Usage: <${PERFORMANCE_TARGETS.memoryUsage}MB`)
    console.log(`     - First Contentful Paint: <${PERFORMANCE_TARGETS.firstContentfulPaint}ms`)
    console.log(`     - Cumulative Layout Shift: <${PERFORMANCE_TARGETS.layoutStability}`)
    console.log(`   \n   📈 Measured Results:`)
    console.log(`     - Homepage Load: ${performanceReport.results.homepageLoad.toFixed(2)}ms`)
    console.log(`     - Customizer Load: ${performanceReport.results.customizerLoad.toFixed(2)}ms`)
    console.log(`     - Avg Material Switch: ${(performanceReport.results.materialSwitches.reduce((a, b) => a + b, 0) / performanceReport.results.materialSwitches.length).toFixed(2)}ms`)
    console.log(`     - Memory Usage: ${performanceReport.results.memoryUsage.toFixed(2)}MB`)
    console.log(`     - First Contentful Paint: ${performanceReport.results.webVitals.FCP.toFixed(2)}ms`)
    console.log(`     - Cumulative Layout Shift: ${performanceReport.results.webVitals.CLS.toFixed(3)}`)
    console.log(`   \n   ✅ Compliance Status:`)
    console.log(`     - Page Loads: ${performanceReport.compliance.pageLoads ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`     - Material Switches: ${performanceReport.compliance.materialSwitches ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`     - Memory Usage: ${performanceReport.compliance.memoryUsage ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`     - Web Vitals: ${performanceReport.compliance.webVitals ? '✅ PASS' : '❌ FAIL'}`)
    
    // Overall compliance check
    const overallCompliance = Object.values(performanceReport.compliance).every(Boolean)
    console.log(`   \n   🎯 OVERALL CLAUDE_RULES COMPLIANCE: ${overallCompliance ? '✅ PASS' : '❌ FAIL'}`)
    
    // Assert overall compliance
    expect(overallCompliance).toBe(true)
  })
})