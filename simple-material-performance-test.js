/**
 * Simple Phase 3 Material Selection Performance Test
 * Tests actual performance metrics against CLAUDE_RULES requirements
 */

const { chromium } = require('playwright')
const fs = require('fs').promises

async function testPerformance() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  console.log('\n📊 Phase 3 Material Selection Performance Audit')
  console.log('='.repeat(60))
  
  const metrics = {
    pageLoad: 0,
    apiCalls: [],
    materialSwitches: [],
    memoryUsage: {}
  }
  
  // Track API calls
  const apiCalls = []
  page.on('response', async response => {
    if (response.url().includes('/api/products/customizable')) {
      const timing = response.request().timing()
      apiCalls.push({
        url: response.url(),
        status: response.status(),
        duration: timing ? timing.responseEnd : 0
      })
    }
  })
  
  try {
    // Test 1: Page Load Performance
    console.log('\n📈 Test 1: Initial Page Load')
    const startLoad = Date.now()
    await page.goto('http://localhost:3001/customizer', { waitUntil: 'networkidle' })
    metrics.pageLoad = Date.now() - startLoad
    console.log(`✅ Page loaded in: ${metrics.pageLoad}ms`)
    
    // Wait for customizer to be ready
    await page.waitForSelector('[aria-label*="filter"]', { timeout: 5000 }).catch(() => {
      console.log('⚠️ Material chips not found, checking for alternative selectors...')
    })
    
    // Test 2: Component Metrics
    console.log('\n📊 Test 2: Component Analysis')
    const componentMetrics = await page.evaluate(() => {
      const chips = document.querySelectorAll('[aria-label*="filter"], button[data-material]')
      const customizer = document.querySelector('[data-testid="product-customizer"], .space-y-6')
      
      return {
        materialChips: chips.length,
        hasCustomizer: !!customizer,
        domNodes: document.querySelectorAll('*').length,
        images: document.querySelectorAll('img').length
      }
    })
    
    console.log(`✅ Material chips found: ${componentMetrics.materialChips}`)
    console.log(`✅ DOM nodes: ${componentMetrics.domNodes}`)
    console.log(`✅ Images loaded: ${componentMetrics.images}`)
    
    // Test 3: Material Switching Performance
    console.log('\n⚡ Test 3: Material Switching Speed')
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (const material of materials) {
      const startSwitch = Date.now()
      
      // Try multiple selector strategies
      const clicked = await page.evaluate((mat) => {
        // Try data-material attribute
        let element = document.querySelector(`[data-material="${mat}"]`)
        
        // Try button with text
        if (!element) {
          const displayName = mat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const buttons = Array.from(document.querySelectorAll('button'))
          element = buttons.find(btn => btn.textContent?.includes(displayName))
        }
        
        // Try aria-label
        if (!element) {
          element = document.querySelector(`[aria-label*="${mat}"]`)
        }
        
        if (element) {
          element.click()
          return true
        }
        return false
      }, material)
      
      if (clicked) {
        await page.waitForTimeout(100) // Wait for transition
        const switchTime = Date.now() - startSwitch
        metrics.materialSwitches.push({ material, time: switchTime })
        console.log(`✅ ${material}: ${switchTime}ms`)
      } else {
        console.log(`⚠️ ${material}: selector not found`)
      }
    }
    
    // Test 4: API Performance
    console.log('\n🌐 Test 4: API Response Times')
    await page.waitForTimeout(500) // Wait for any pending API calls
    
    // Check the collected API calls
    const apiMetrics = apiCalls.slice(-4) // Last 4 calls (material switches)
    apiMetrics.forEach(call => {
      const endpoint = call.url.split('?')[1] || 'initial'
      console.log(`✅ ${endpoint}: ${call.status === 200 ? 'Success' : 'Failed'} (${call.duration || 'N/A'}ms)`)
    })
    
    // Test 5: Memory Usage
    console.log('\n💾 Test 5: Memory Footprint')
    const memoryMetrics = await page.evaluate(() => {
      if (window.performance && window.performance.memory) {
        return {
          heapUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          heapTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          heapLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        }
      }
      return null
    })
    
    if (memoryMetrics) {
      metrics.memoryUsage = memoryMetrics
      console.log(`✅ Heap Used: ${memoryMetrics.heapUsed}MB / ${memoryMetrics.heapTotal}MB`)
      console.log(`✅ Heap Limit: ${memoryMetrics.heapLimit}MB`)
    }
    
    // Test 6: Bundle Size Check
    console.log('\n📦 Test 6: Bundle Analysis')
    const bundleInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      
      // Check for dynamic imports
      const hasDynamicImports = scripts.some(s => 
        s.src.includes('_app') || s.src.includes('_buildManifest')
      )
      
      return {
        jsFiles: scripts.length,
        cssFiles: styles.length,
        hasDynamicImports
      }
    })
    
    console.log(`✅ JavaScript bundles: ${bundleInfo.jsFiles}`)
    console.log(`✅ CSS files: ${bundleInfo.cssFiles}`)
    console.log(`✅ Dynamic imports: ${bundleInfo.hasDynamicImports ? 'Yes' : 'No'}`)
    
    // Calculate averages and compliance
    console.log('\n' + '='.repeat(60))
    console.log('📊 PERFORMANCE SUMMARY')
    console.log('='.repeat(60))
    
    const avgSwitchTime = metrics.materialSwitches.length > 0
      ? metrics.materialSwitches.reduce((sum, m) => sum + m.time, 0) / metrics.materialSwitches.length
      : 0
    
    console.log(`\n🎯 CLAUDE_RULES Compliance:`)
    console.log(`  Material Switching: ${avgSwitchTime.toFixed(2)}ms ${avgSwitchTime < 100 ? '✅ PASS' : '❌ FAIL'} (<100ms target)`)
    console.log(`  Page Load: ${metrics.pageLoad}ms ${metrics.pageLoad < 3000 ? '✅ PASS' : '❌ FAIL'} (<3000ms target)`)
    
    if (memoryMetrics) {
      const memoryUsagePercent = (memoryMetrics.heapUsed / memoryMetrics.heapLimit) * 100
      console.log(`  Memory Usage: ${memoryUsagePercent.toFixed(1)}% ${memoryUsagePercent < 50 ? '✅ PASS' : '⚠️ WARNING'}`)
    }
    
    // Recommendations
    console.log('\n💡 Optimization Recommendations:')
    
    if (avgSwitchTime >= 100) {
      console.log('  ⚠️ Material switching exceeds target - implement better caching')
    }
    
    if (componentMetrics.domNodes > 1500) {
      console.log('  ⚠️ High DOM node count - consider virtualization')
    }
    
    if (!bundleInfo.hasDynamicImports) {
      console.log('  💡 Consider code splitting with dynamic imports')
    }
    
    if (memoryMetrics && memoryMetrics.heapUsed > 50) {
      console.log('  ⚠️ High memory usage - check for memory leaks')
    }
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      averageSwitchTime: avgSwitchTime,
      claudeRulesCompliance: {
        materialSwitching: avgSwitchTime < 100,
        pageLoad: metrics.pageLoad < 3000,
        overallPerformance: avgSwitchTime < 100 && metrics.pageLoad < 3000
      }
    }
    
    await fs.writeFile(
      'phase3-performance-report.json',
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n✅ Report saved to phase3-performance-report.json')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Run the test
testPerformance().catch(console.error)