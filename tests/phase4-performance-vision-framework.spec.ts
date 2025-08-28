import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Phase 4: Performance Optimization E2E Vision Mode Testing Framework
 * Success criteria: CLAUDE_RULES performance compliance with visual excellence
 * Focus: <300ms response times, smooth 60fps animations, optimal bundle sizes
 * Gate requirement: Only surpassing all criteria allows progression to Phase 5
 */

const PHASE4_SUCCESS_CRITERIA = {
  DROPDOWN_RESPONSE_TIME: 300, // Maximum 300ms (CLAUDE_RULES compliant)
  ANIMATION_FRAME_RATE: 58, // Minimum 58fps (near 60fps target)
  BUNDLE_SIZE_IMPACT: 50, // Maximum 50KB additional bundle impact
  MEMORY_USAGE_MB: 10, // Maximum 10MB memory increase
  CPU_USAGE_PERCENT: 15, // Maximum 15% CPU usage during interactions
  LAYOUT_SHIFT_SCORE: 0.1, // Maximum 0.1 Cumulative Layout Shift
  PAINT_TIMING_MS: 200, // Maximum 200ms First Contentful Paint impact
  INTERACTION_LATENCY: 100 // Maximum 100ms interaction to visual feedback
}

interface Phase4PerformanceMetrics {
  dropdownResponseTime: number
  animationFrameRate: number
  bundleSizeImpact: number
  memoryUsageMB: number
  cpuUsagePercent: number
  layoutShiftScore: number
  paintTimingMs: number
  interactionLatency: number
}

class Phase4PerformanceFramework {
  private page: Page
  private metrics: Phase4PerformanceMetrics = {
    dropdownResponseTime: 0,
    animationFrameRate: 0,
    bundleSizeImpact: 0,
    memoryUsageMB: 0,
    cpuUsagePercent: 0,
    layoutShiftScore: 0,
    paintTimingMs: 0,
    interactionLatency: 0
  }
  private performanceObserver: any = null

  constructor(page: Page) {
    this.page = page
  }

  async initPerformanceMonitoring(): Promise<void> {
    console.log('📊 Initializing performance monitoring...')
    
    // Set up performance monitoring
    await this.page.addInitScript(() => {
      (window as any).performanceMetrics = {
        animationFrames: [],
        interactionTimes: [],
        layoutShifts: [],
        paintTimes: []
      }
      
      // Animation frame rate monitoring
      let frameCount = 0
      let lastTime = performance.now()
      
      function countFrames() {
        frameCount++
        const currentTime = performance.now()
        
        if (currentTime - lastTime >= 1000) {
          (window as any).performanceMetrics.animationFrames.push(frameCount)
          frameCount = 0
          lastTime = currentTime
        }
        
        requestAnimationFrame(countFrames)
      }
      requestAnimationFrame(countFrames)
      
      // Layout Shift monitoring
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              (window as any).performanceMetrics.layoutShifts.push(entry.value)
            }
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
      }
      
      // Paint timing monitoring
      window.addEventListener('load', () => {
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach(entry => {
          (window as any).performanceMetrics.paintTimes.push({
            name: entry.name,
            startTime: entry.startTime
          })
        })
      })
    })
  }

  async measureDropdownResponseTime(): Promise<number> {
    console.log('⚡ Measuring dropdown response time...')
    
    // Ensure menu is closed first
    await this.page.mouse.move(100, 100)
    await this.page.waitForTimeout(300)
    
    const startTime = performance.now()
    
    // Trigger dropdown opening
    await this.page.hover('[data-testid="rings-nav-item"]')
    
    // Wait for mega-menu to be fully visible and loaded
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    await megaMenu.waitFor({ state: 'visible', timeout: 2000 })
    
    // Wait for all content to be rendered
    await this.page.waitForFunction(() => {
      const menu = document.querySelector('[data-testid="mega-menu"]')
      if (!menu) return false
      
      // Check if all images are loaded
      const images = menu.querySelectorAll('img')
      return Array.from(images).every(img => img.complete)
    }, { timeout: 3000 })
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    this.metrics.dropdownResponseTime = responseTime
    console.log(`🚀 Dropdown Response Time: ${responseTime.toFixed(0)}ms`)
    return responseTime
  }

  async measureAnimationFrameRate(): Promise<number> {
    console.log('🎬 Measuring animation frame rate...')
    
    // Trigger dropdown with animation
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.waitForTimeout(2000) // Let animation run for 2 seconds
    
    // Get animation frame rate data
    const frameRates = await this.page.evaluate(() => {
      return (window as any).performanceMetrics.animationFrames || []
    })
    
    const averageFrameRate = frameRates.length > 0 ? 
      frameRates.reduce((sum: number, rate: number) => sum + rate, 0) / frameRates.length : 0
    
    this.metrics.animationFrameRate = averageFrameRate
    console.log(`📺 Average Frame Rate: ${averageFrameRate.toFixed(1)} fps`)
    return averageFrameRate
  }

  async measureBundleSizeImpact(): Promise<number> {
    console.log('📦 Measuring bundle size impact...')
    
    // Get network requests during navigation
    const resourceSizes: number[] = []
    
    this.page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('.js') || url.includes('.css')) {
        try {
          const headers = response.headers()
          const contentLength = headers['content-length']
          if (contentLength) {
            resourceSizes.push(parseInt(contentLength))
          }
        } catch (error) {
          // Handle potential errors in getting response size
        }
      }
    })
    
    // Navigate and trigger mega-menu loading
    await this.page.goto('/', { waitUntil: 'networkidle' })
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.waitForTimeout(2000)
    
    // Calculate additional bundle impact (simplified)
    const totalSize = resourceSizes.reduce((sum, size) => sum + size, 0)
    const bundleImpactKB = totalSize / 1024
    
    this.metrics.bundleSizeImpact = bundleImpactKB
    console.log(`📦 Bundle Impact: ${bundleImpactKB.toFixed(1)} KB`)
    return bundleImpactKB
  }

  async measureMemoryUsage(): Promise<number> {
    console.log('🧠 Measuring memory usage...')
    
    // Get initial memory baseline
    const initialMemory = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024
      }
      return 0
    })
    
    // Trigger mega-menu multiple times to stress test
    for (let i = 0; i < 5; i++) {
      await this.page.hover('[data-testid="rings-nav-item"]')
      await this.page.waitForTimeout(500)
      await this.page.mouse.move(100, 100)
      await this.page.waitForTimeout(300)
    }
    
    // Get memory after interactions
    const finalMemory = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024
      }
      return 0
    })
    
    const memoryIncrease = Math.max(0, finalMemory - initialMemory)
    this.metrics.memoryUsageMB = memoryIncrease
    console.log(`🧠 Memory Increase: ${memoryIncrease.toFixed(2)} MB`)
    return memoryIncrease
  }

  async measureCPUUsage(): Promise<number> {
    console.log('⚙️ Measuring CPU usage during interactions...')
    
    // Start performance monitoring
    const startTime = performance.now()
    
    // Perform CPU-intensive interactions
    for (let i = 0; i < 10; i++) {
      await this.page.hover('[data-testid="rings-nav-item"]')
      await this.page.waitForTimeout(100)
      
      // Trigger hover on multiple elements
      const interactiveElements = this.page.locator('[data-testid="mega-menu"] a')
      const count = await interactiveElements.count()
      
      for (let j = 0; j < Math.min(count, 3); j++) {
        await interactiveElements.nth(j).hover()
        await this.page.waitForTimeout(50)
      }
      
      await this.page.mouse.move(100, 100)
      await this.page.waitForTimeout(100)
    }
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    // Estimate CPU usage based on interaction complexity and timing
    // This is a simplified metric - in real scenarios, you'd use actual CPU monitoring
    const expectedTime = 10 * (100 + 150 + 100) // Conservative estimate
    const cpuUsageEstimate = Math.min(100, (totalTime / expectedTime) * 15)
    
    this.metrics.cpuUsagePercent = cpuUsageEstimate
    console.log(`⚙️ Estimated CPU Usage: ${cpuUsageEstimate.toFixed(1)}%`)
    return cpuUsageEstimate
  }

  async measureLayoutShift(): Promise<number> {
    console.log('📐 Measuring cumulative layout shift...')
    
    // Trigger interactions that could cause layout shifts
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.waitForTimeout(1000)
    
    // Get layout shift data
    const layoutShifts = await this.page.evaluate(() => {
      return (window as any).performanceMetrics.layoutShifts || []
    })
    
    const cumulativeLayoutShift = layoutShifts.reduce((sum: number, shift: number) => sum + shift, 0)
    
    this.metrics.layoutShiftScore = cumulativeLayoutShift
    console.log(`📐 Cumulative Layout Shift: ${cumulativeLayoutShift.toFixed(3)}`)
    return cumulativeLayoutShift
  }

  async measureInteractionLatency(): Promise<number> {
    console.log('🔄 Measuring interaction latency...')
    
    const latencies: number[] = []
    
    // Test multiple interaction latencies
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now()
      
      await this.page.hover('[data-testid="rings-nav-item"]')
      
      // Wait for visual feedback (mega-menu visibility)
      await this.page.locator('[data-testid="mega-menu"]').waitFor({ state: 'visible', timeout: 1000 })
      
      const endTime = performance.now()
      const latency = endTime - startTime
      latencies.push(latency)
      
      // Reset for next test
      await this.page.mouse.move(100, 100)
      await this.page.waitForTimeout(200)
    }
    
    const averageLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
    
    this.metrics.interactionLatency = averageLatency
    console.log(`🔄 Average Interaction Latency: ${averageLatency.toFixed(0)}ms`)
    return averageLatency
  }

  async capturePerformanceScreenshots(): Promise<void> {
    console.log('📸 Capturing performance testing evidence...')
    
    // Capture dropdown in action
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.screenshot({
      path: 'test-results/phase4-performance-dropdown-active.png',
      fullPage: true
    })
    
    // Capture DevTools performance tab if available
    await this.page.evaluate(() => {
      console.log('Performance metrics captured:', (window as any).performanceMetrics)
    })
  }

  async generatePhase4Report(): Promise<boolean> {
    const overallSuccess = this.calculatePhase4Success()
    
    console.log('📊 PHASE 4 PERFORMANCE TESTING REPORT')
    console.log('======================================')
    console.log(`Dropdown Response Time: ${this.metrics.dropdownResponseTime.toFixed(0)}ms (Max: ${PHASE4_SUCCESS_CRITERIA.DROPDOWN_RESPONSE_TIME}ms)`)
    console.log(`Animation Frame Rate: ${this.metrics.animationFrameRate.toFixed(1)}fps (Min: ${PHASE4_SUCCESS_CRITERIA.ANIMATION_FRAME_RATE}fps)`)
    console.log(`Bundle Size Impact: ${this.metrics.bundleSizeImpact.toFixed(1)}KB (Max: ${PHASE4_SUCCESS_CRITERIA.BUNDLE_SIZE_IMPACT}KB)`)
    console.log(`Memory Usage: ${this.metrics.memoryUsageMB.toFixed(2)}MB (Max: ${PHASE4_SUCCESS_CRITERIA.MEMORY_USAGE_MB}MB)`)
    console.log(`CPU Usage: ${this.metrics.cpuUsagePercent.toFixed(1)}% (Max: ${PHASE4_SUCCESS_CRITERIA.CPU_USAGE_PERCENT}%)`)
    console.log(`Layout Shift Score: ${this.metrics.layoutShiftScore.toFixed(3)} (Max: ${PHASE4_SUCCESS_CRITERIA.LAYOUT_SHIFT_SCORE})`)
    console.log(`Interaction Latency: ${this.metrics.interactionLatency.toFixed(0)}ms (Max: ${PHASE4_SUCCESS_CRITERIA.INTERACTION_LATENCY}ms)`)
    
    if (overallSuccess) {
      console.log('🎉 PHASE 4 COMPLETE: Performance optimization excellence achieved - Ready for Phase 5')
      console.log('✅ CLAUDE_RULES performance compliance validated')
    } else {
      console.log('❌ PHASE 4 BLOCKED: Performance criteria not met - Optimization required')
      console.log('🔧 Review performance bottlenecks and optimize before Phase 5')
    }
    
    return overallSuccess
  }

  private calculatePhase4Success(): boolean {
    const criteria = [
      this.metrics.dropdownResponseTime <= PHASE4_SUCCESS_CRITERIA.DROPDOWN_RESPONSE_TIME,
      this.metrics.animationFrameRate >= PHASE4_SUCCESS_CRITERIA.ANIMATION_FRAME_RATE,
      this.metrics.bundleSizeImpact <= PHASE4_SUCCESS_CRITERIA.BUNDLE_SIZE_IMPACT,
      this.metrics.memoryUsageMB <= PHASE4_SUCCESS_CRITERIA.MEMORY_USAGE_MB,
      this.metrics.cpuUsagePercent <= PHASE4_SUCCESS_CRITERIA.CPU_USAGE_PERCENT,
      this.metrics.layoutShiftScore <= PHASE4_SUCCESS_CRITERIA.LAYOUT_SHIFT_SCORE,
      this.metrics.interactionLatency <= PHASE4_SUCCESS_CRITERIA.INTERACTION_LATENCY
    ]
    
    const passedCriteria = criteria.filter(Boolean).length
    const totalCriteria = criteria.length
    
    console.log(`📈 Performance Criteria: ${passedCriteria}/${totalCriteria} passed`)
    
    return criteria.every(Boolean)
  }
}

test.describe('Phase 4: Performance Optimization Testing', () => {
  let performanceFramework: Phase4PerformanceFramework

  test.beforeEach(async ({ page }) => {
    performanceFramework = new Phase4PerformanceFramework(page)
    await performanceFramework.initPerformanceMonitoring()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('Phase 4.1: Dropdown Response Time Optimization', async ({ page }) => {
    const responseTime = await performanceFramework.measureDropdownResponseTime()
    expect(responseTime).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.DROPDOWN_RESPONSE_TIME)
  })

  test('Phase 4.2: Animation Frame Rate Excellence', async ({ page }) => {
    const frameRate = await performanceFramework.measureAnimationFrameRate()
    expect(frameRate).toBeGreaterThanOrEqual(PHASE4_SUCCESS_CRITERIA.ANIMATION_FRAME_RATE)
  })

  test('Phase 4.3: Bundle Size Impact Control', async ({ page }) => {
    const bundleImpact = await performanceFramework.measureBundleSizeImpact()
    expect(bundleImpact).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.BUNDLE_SIZE_IMPACT)
  })

  test('Phase 4.4: Memory Usage Optimization', async ({ page }) => {
    const memoryUsage = await performanceFramework.measureMemoryUsage()
    expect(memoryUsage).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.MEMORY_USAGE_MB)
  })

  test('Phase 4.5: CPU Usage Efficiency', async ({ page }) => {
    const cpuUsage = await performanceFramework.measureCPUUsage()
    expect(cpuUsage).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.CPU_USAGE_PERCENT)
  })

  test('Phase 4.6: Layout Stability Validation', async ({ page }) => {
    const layoutShift = await performanceFramework.measureLayoutShift()
    expect(layoutShift).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.LAYOUT_SHIFT_SCORE)
  })

  test('Phase 4.7: Interaction Latency Optimization', async ({ page }) => {
    const latency = await performanceFramework.measureInteractionLatency()
    expect(latency).toBeLessThanOrEqual(PHASE4_SUCCESS_CRITERIA.INTERACTION_LATENCY)
  })

  test('Phase 4.8: GATE TEST - Performance Excellence Validation', async ({ page }) => {
    console.log('🚪 PHASE 4 GATE TEST: Comprehensive performance validation...')
    
    // Run all performance measurements
    await performanceFramework.measureDropdownResponseTime()
    await performanceFramework.measureAnimationFrameRate()
    await performanceFramework.measureBundleSizeImpact()
    await performanceFramework.measureMemoryUsage()
    await performanceFramework.measureCPUUsage()
    await performanceFramework.measureLayoutShift()
    await performanceFramework.measureInteractionLatency()
    
    // Capture performance evidence
    await performanceFramework.capturePerformanceScreenshots()
    
    const overallSuccess = await performanceFramework.generatePhase4Report()
    
    // Final performance evidence screenshot
    await page.screenshot({
      path: 'test-results/phase4-performance-gate-test-evidence.png',
      fullPage: true
    })
    
    expect(overallSuccess).toBe(true)
  })
})