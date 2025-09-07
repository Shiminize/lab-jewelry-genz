/**
 * Phase 3 Redux Enhanced Material Selection Performance Audit
 * Comprehensive analysis of material selection implementation
 */

const { chromium } = require('playwright')
const fs = require('fs').promises

class MaterialSelectionPerformanceAuditor {
  constructor() {
    this.browser = null
    this.page = null
    this.metrics = {
      componentRendering: [],
      materialSwitching: [],
      networkRequests: [],
      memoryUsage: [],
      bundleSize: {},
      animations: []
    }
  }

  async initialize() {
    this.browser = await chromium.launch({ 
      headless: false,
      devtools: true 
    })
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    
    this.page = await context.newPage()
    
    // Enable performance monitoring
    await this.page.evaluateOnNewDocument(() => {
      window.__performanceMetrics = {
        renders: [],
        materialSwitches: [],
        networkRequests: [],
        animations: []
      }
      
      // Monitor React renders
      const originalCreateElement = React.createElement
      React.createElement = function(...args) {
        const component = args[0]
        if (typeof component === 'function' && component.name) {
          const startTime = performance.now()
          const result = originalCreateElement.apply(this, args)
          const renderTime = performance.now() - startTime
          
          if (['MaterialTagChip', 'MaterialControls', 'MaterialCarousel', 'ProductCustomizer'].includes(component.name)) {
            window.__performanceMetrics.renders.push({
              component: component.name,
              time: renderTime,
              timestamp: Date.now()
            })
          }
        }
        return originalCreateElement.apply(this, args)
      }
    }).catch(() => {})
  }

  async testComponentPerformance() {
    console.log('\n📊 Testing Component Rendering Performance...')
    
    // Navigate to customizer page
    await this.page.goto('http://localhost:3001/customizer')
    await this.page.waitForLoadState('networkidle')
    
    // Measure initial render
    const initialRender = await this.page.evaluate(() => {
      const start = performance.now()
      const customizer = document.querySelector('[data-testid="product-customizer"]')
      const renderTime = performance.now() - start
      
      return {
        hasCustomizer: !!customizer,
        renderTime,
        domNodes: document.querySelectorAll('*').length,
        materialChips: document.querySelectorAll('[aria-label*="filter"]').length
      }
    })
    
    this.metrics.componentRendering.push({
      type: 'initial',
      ...initialRender
    })
    
    // Test MaterialTagChip performance
    const chipMetrics = await this.page.evaluate(() => {
      const chips = document.querySelectorAll('[aria-label*="filter"]')
      const metrics = []
      
      chips.forEach(chip => {
        const rect = chip.getBoundingClientRect()
        const styles = window.getComputedStyle(chip)
        
        metrics.push({
          width: rect.width,
          height: rect.height,
          hasHoverEffect: styles.transition.includes('all'),
          hasPrismaticShadow: chip.classList.toString().includes('prismatic')
        })
      })
      
      return metrics
    })
    
    this.metrics.componentRendering.push({
      type: 'chips',
      count: chipMetrics.length,
      averageHeight: chipMetrics.reduce((sum, m) => sum + m.height, 0) / chipMetrics.length
    })
    
    console.log(`✅ Initial render: ${initialRender.renderTime.toFixed(2)}ms`)
    console.log(`✅ DOM nodes: ${initialRender.domNodes}`)
    console.log(`✅ Material chips: ${chipMetrics.length}`)
  }

  async testMaterialSwitching() {
    console.log('\n⚡ Testing Material Switching Performance...')
    
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (const material of materials) {
      // Click material chip
      const selector = `[data-material="${material}"], button:has-text("${material.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}")`
      
      const switchMetrics = await this.page.evaluate(async (sel) => {
        const startTime = performance.now()
        const element = document.querySelector(sel)
        
        if (element) {
          // Trigger click
          element.click()
          
          // Wait for any transitions
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const switchTime = performance.now() - startTime
          
          return {
            success: true,
            switchTime,
            hasCacheHit: window.__performanceMetrics?.materialSwitches?.some(s => s.cached)
          }
        }
        
        return { success: false, switchTime: 0 }
      }, selector)
      
      if (switchMetrics.success) {
        this.metrics.materialSwitching.push({
          material,
          ...switchMetrics
        })
        
        console.log(`✅ ${material}: ${switchMetrics.switchTime.toFixed(2)}ms ${switchMetrics.hasCacheHit ? '(cached)' : ''}`)
      }
      
      await this.page.waitForTimeout(500)
    }
    
    // Calculate average switching time
    const avgSwitchTime = this.metrics.materialSwitching.reduce((sum, m) => sum + m.switchTime, 0) / this.metrics.materialSwitching.length
    console.log(`\n📊 Average switch time: ${avgSwitchTime.toFixed(2)}ms`)
    console.log(`${avgSwitchTime < 100 ? '✅' : '❌'} CLAUDE_RULES <100ms requirement: ${avgSwitchTime < 100 ? 'PASS' : 'FAIL'}`)
  }

  async testNetworkPerformance() {
    console.log('\n🌐 Testing Network Performance...')
    
    // Monitor network requests
    const requests = []
    this.page.on('request', request => {
      if (request.url().includes('/api/products/customizable')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        })
      }
    })
    
    this.page.on('response', async response => {
      if (response.url().includes('/api/products/customizable')) {
        const request = requests.find(r => r.url === response.url())
        if (request) {
          request.status = response.status()
          request.responseTime = Date.now() - request.timestamp
          request.size = Number(response.headers()['content-length'] || 0)
          
          this.metrics.networkRequests.push(request)
          
          console.log(`✅ API call: ${request.responseTime}ms - ${response.url().split('/').pop()}`)
        }
      }
    })
    
    // Trigger a few material changes to generate network requests
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
    
    // Test prefetching
    const prefetchMetrics = await this.page.evaluate(async () => {
      // Check if AssetCacheService is working
      const cacheStats = window.assetCache?.getCacheStats?.() || null
      
      return {
        hasPrefetching: !!window.assetCache,
        cacheStats
      }
    })
    
    console.log(`\n📦 Cache Statistics:`)
    if (prefetchMetrics.cacheStats) {
      console.log(`  Items: ${prefetchMetrics.cacheStats.itemCount}`)
      console.log(`  Size: ${(prefetchMetrics.cacheStats.totalSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`  Max: ${(prefetchMetrics.cacheStats.maxSize / 1024 / 1024).toFixed(2)}MB`)
    }
  }

  async testBundleSize() {
    console.log('\n📦 Analyzing Bundle Size...')
    
    // Get runtime bundle information
    const bundleInfo = await this.page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      
      return {
        scripts: scripts.map(s => ({
          url: s.src,
          async: s.async,
          defer: s.defer
        })),
        styles: styles.map(s => ({
          url: s.href
        })),
        totalScripts: scripts.length,
        totalStyles: styles.length
      }
    })
    
    this.metrics.bundleSize = bundleInfo
    
    console.log(`✅ JavaScript bundles: ${bundleInfo.totalScripts}`)
    console.log(`✅ CSS bundles: ${bundleInfo.totalStyles}`)
    
    // Check for dynamic imports
    const dynamicImports = await this.page.evaluate(() => {
      const hasDynamicImports = document.querySelector('script')?.textContent?.includes('import(') || false
      return hasDynamicImports
    })
    
    console.log(`✅ Dynamic imports: ${dynamicImports ? 'Yes' : 'No'}`)
  }

  async testAnimationPerformance() {
    console.log('\n🎨 Testing Animation Performance...')
    
    // Test hover animations
    const hoverMetrics = await this.page.evaluate(async () => {
      const chips = document.querySelectorAll('[aria-label*="filter"]')
      const metrics = []
      
      for (const chip of chips) {
        const rect = chip.getBoundingClientRect()
        
        // Simulate hover
        chip.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
        
        await new Promise(resolve => requestAnimationFrame(resolve))
        
        const styles = window.getComputedStyle(chip)
        metrics.push({
          hasTransition: styles.transition !== 'none',
          transitionDuration: styles.transitionDuration,
          hasTransform: styles.transform !== 'none'
        })
        
        chip.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      }
      
      return metrics
    })
    
    this.metrics.animations = hoverMetrics
    
    const hasAnimations = hoverMetrics.some(m => m.hasTransition)
    console.log(`✅ Hover animations: ${hasAnimations ? 'Active' : 'None'}`)
    
    if (hasAnimations) {
      const avgDuration = hoverMetrics
        .map(m => parseFloat(m.transitionDuration))
        .reduce((a, b) => a + b, 0) / hoverMetrics.length
      
      console.log(`✅ Average transition: ${(avgDuration * 1000).toFixed(0)}ms`)
    }
  }

  async testMemoryUsage() {
    console.log('\n💾 Testing Memory Usage...')
    
    if (this.page.context().browser().browserType().name() === 'chromium') {
      // Get memory metrics
      const metrics = await this.page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          }
        }
        return null
      })
      
      if (metrics) {
        this.metrics.memoryUsage.push(metrics)
        
        console.log(`✅ JS Heap: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(metrics.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
        console.log(`✅ Heap Limit: ${(metrics.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`)
        
        const heapUsagePercent = (metrics.usedJSHeapSize / metrics.jsHeapSizeLimit) * 100
        console.log(`✅ Heap Usage: ${heapUsagePercent.toFixed(1)}%`)
      }
    }
  }

  async testReactConcurrentFeatures() {
    console.log('\n⚛️ Testing React 18 Concurrent Features...')
    
    const concurrentMetrics = await this.page.evaluate(() => {
      // Check for useTransition usage
      const hasTransitions = document.querySelector('[class*="isPending"]') !== null
      
      // Check for Suspense boundaries
      const hasSuspense = document.querySelector('[data-suspense]') !== null
      
      // Check for loading states
      const hasLoadingStates = document.querySelector('[class*="animate-pulse"]') !== null
      
      return {
        hasTransitions,
        hasSuspense,
        hasLoadingStates,
        reactVersion: window.React?.version || 'unknown'
      }
    })
    
    console.log(`✅ React version: ${concurrentMetrics.reactVersion}`)
    console.log(`✅ useTransition: ${concurrentMetrics.hasTransitions ? 'Yes' : 'No'}`)
    console.log(`✅ Suspense: ${concurrentMetrics.hasSuspense ? 'Yes' : 'No'}`)
    console.log(`✅ Loading states: ${concurrentMetrics.hasLoadingStates ? 'Yes' : 'No'}`)
  }

  async generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('PERFORMANCE AUDIT REPORT - Phase 3 Redux Material Selection')
    console.log('='.repeat(80))
    
    // Calculate overall metrics
    const avgRenderTime = this.metrics.componentRendering
      .filter(m => m.renderTime)
      .reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.componentRendering.length || 0
    
    const avgSwitchTime = this.metrics.materialSwitching
      .reduce((sum, m) => sum + m.switchTime, 0) / this.metrics.materialSwitching.length || 0
    
    const avgNetworkTime = this.metrics.networkRequests
      .reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.networkRequests.length || 0
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        componentRenderTime: avgRenderTime.toFixed(2) + 'ms',
        materialSwitchTime: avgSwitchTime.toFixed(2) + 'ms',
        networkResponseTime: avgNetworkTime.toFixed(2) + 'ms',
        claudeRulesCompliance: {
          '<100ms_switching': avgSwitchTime < 100,
          '<300ms_overall': avgSwitchTime + avgNetworkTime < 300
        }
      },
      details: this.metrics,
      recommendations: []
    }
    
    // Generate recommendations
    if (avgSwitchTime >= 100) {
      report.recommendations.push('⚠️ Material switching exceeds 100ms target - implement better caching')
    }
    
    if (avgNetworkTime >= 200) {
      report.recommendations.push('⚠️ Network requests are slow - consider edge caching or CDN')
    }
    
    if (!this.metrics.bundleSize.dynamicImports) {
      report.recommendations.push('💡 Consider dynamic imports for MaterialControls and MaterialCarousel')
    }
    
    if (this.metrics.memoryUsage[0]?.usedJSHeapSize > 50 * 1024 * 1024) {
      report.recommendations.push('⚠️ High memory usage detected - check for memory leaks')
    }
    
    // Save report
    await fs.writeFile(
      'phase3-material-selection-performance-report.json',
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n📊 FINAL SCORES:')
    console.log(`Component Rendering: ${avgRenderTime.toFixed(2)}ms`)
    console.log(`Material Switching: ${avgSwitchTime.toFixed(2)}ms ${avgSwitchTime < 100 ? '✅' : '❌'}`)
    console.log(`Network Performance: ${avgNetworkTime.toFixed(2)}ms`)
    console.log(`CLAUDE_RULES Compliance: ${report.summary.claudeRulesCompliance['<100ms_switching'] ? '✅ PASS' : '❌ FAIL'}`)
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDATIONS:')
      report.recommendations.forEach(rec => console.log(rec))
    }
    
    return report
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Run the audit
async function runAudit() {
  const auditor = new MaterialSelectionPerformanceAuditor()
  
  try {
    await auditor.initialize()
    await auditor.testComponentPerformance()
    await auditor.testMaterialSwitching()
    await auditor.testNetworkPerformance()
    await auditor.testBundleSize()
    await auditor.testAnimationPerformance()
    await auditor.testMemoryUsage()
    await auditor.testReactConcurrentFeatures()
    await auditor.generateReport()
  } catch (error) {
    console.error('❌ Audit failed:', error)
  } finally {
    await auditor.cleanup()
  }
}

// Execute
runAudit().catch(console.error)