/**
 * Optimized Customizer Performance Test
 * Tests the performance improvements of the optimized customizer
 */

const puppeteer = require('puppeteer')

async function testOptimizedCustomizer() {
  console.log('🧪 Optimized Customizer Performance Test')
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  
  try {
    // Performance tracking
    const metrics = {
      pageLoad: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0
    }
    
    // Enable performance monitoring
    await page.setCacheEnabled(false)
    
    // Collect performance metrics
    await page.evaluateOnNewDocument(() => {
      // Track Core Web Vitals
      window.performanceMetrics = {}
      
      // First Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.name === 'first-paint') {
            window.performanceMetrics.firstPaint = entry.startTime
          }
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.firstContentfulPaint = entry.startTime
          }
        }
      }).observe({ entryTypes: ['paint'] })
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        window.performanceMetrics.largestContentfulPaint = lastEntry.startTime
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // Layout Shift
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        window.performanceMetrics.cumulativeLayoutShift = clsValue
      }).observe({ entryTypes: ['layout-shift'] })
    })

    // Test 1: Page Load Performance
    console.log('📝 Testing page load performance...')
    const navigationStart = Date.now()
    
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    
    metrics.pageLoad = Date.now() - navigationStart
    console.log(`✅ Page load time: ${metrics.pageLoad}ms`)
    
    // Test 2: Core Web Vitals
    console.log('📝 Collecting Core Web Vitals...')
    
    // Wait for metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const webVitals = await page.evaluate(() => window.performanceMetrics || {})
    Object.assign(metrics, webVitals)
    
    console.log(`✅ First Paint: ${(metrics.firstPaint || 0).toFixed(2)}ms`)
    console.log(`✅ First Contentful Paint: ${(metrics.firstContentfulPaint || 0).toFixed(2)}ms`)
    console.log(`✅ Largest Contentful Paint: ${(metrics.largestContentfulPaint || 0).toFixed(2)}ms`)
    console.log(`✅ Cumulative Layout Shift: ${(metrics.cumulativeLayoutShift || 0).toFixed(3)}`)
    
    // Test 3: Bundle Analysis
    console.log('📝 Analyzing bundle performance...')
    
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      let totalSize = 0
      let jsSize = 0
      let cssSize = 0
      let imageSize = 0
      
      resources.forEach(resource => {
        if (resource.transferSize) {
          totalSize += resource.transferSize
          
          if (resource.name.endsWith('.js')) {
            jsSize += resource.transferSize
          } else if (resource.name.endsWith('.css')) {
            cssSize += resource.transferSize
          } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            imageSize += resource.transferSize
          }
        }
      })
      
      return { totalSize, jsSize, cssSize, imageSize }
    })
    
    console.log(`✅ Total bundle size: ${(resourceMetrics.totalSize / 1024).toFixed(2)}KB`)
    console.log(`✅ JavaScript size: ${(resourceMetrics.jsSize / 1024).toFixed(2)}KB`)
    console.log(`✅ CSS size: ${(resourceMetrics.cssSize / 1024).toFixed(2)}KB`)
    console.log(`✅ Images size: ${(resourceMetrics.imageSize / 1024).toFixed(2)}KB`)
    
    // Test 4: Memory Usage
    console.log('📝 Testing memory usage...')
    
    const memoryMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    if (memoryMetrics) {
      console.log(`✅ Memory usage: ${(memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`✅ Memory efficiency: ${((memoryMetrics.usedJSHeapSize / memoryMetrics.totalJSHeapSize) * 100).toFixed(1)}%`)
    }
    
    // Test 5: Interactive Elements
    console.log('📝 Testing interactive elements...')
    
    // Test button responsiveness
    const interactionStart = Date.now()
    
    const firstButton = await page.$('button:not([disabled])')
    if (firstButton) {
      await firstButton.click()
      const interactionTime = Date.now() - interactionStart
      console.log(`✅ First interaction time: ${interactionTime}ms`)
    }
    
    // Test 6: Performance Score Calculation
    console.log('📝 Calculating performance score...')
    
    let score = 100
    
    // Performance scoring based on Core Web Vitals thresholds
    if (metrics.firstContentfulPaint > 1800) score -= 15
    if (metrics.largestContentfulPaint > 2500) score -= 20
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15
    if (metrics.pageLoad > 3000) score -= 20
    if (resourceMetrics.jsSize > 500 * 1024) score -= 10 // 500KB threshold
    if (memoryMetrics && memoryMetrics.usedJSHeapSize > 50 * 1024 * 1024) score -= 10 // 50MB threshold
    
    // Performance Summary
    console.log('\n📊 Performance Summary:')
    console.log(`   Page Load: ${metrics.pageLoad}ms`)
    console.log(`   First Contentful Paint: ${(metrics.firstContentfulPaint || 0).toFixed(2)}ms`)
    console.log(`   Largest Contentful Paint: ${(metrics.largestContentfulPaint || 0).toFixed(2)}ms`)
    console.log(`   Cumulative Layout Shift: ${(metrics.cumulativeLayoutShift || 0).toFixed(3)}`)
    console.log(`   Bundle Size: ${(resourceMetrics.totalSize / 1024).toFixed(2)}KB`)
    console.log(`   Memory Usage: ${memoryMetrics ? (memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A'}MB`)
    
    // Performance grading
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
    console.log(`\n🎯 Performance Score: ${score}/100 (Grade: ${grade})`)
    
    // Optimization recommendations
    const recommendations = []
    if (metrics.firstContentfulPaint > 1800) {
      recommendations.push('Optimize critical rendering path')
    }
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize largest content element loading')
    }
    if (resourceMetrics.jsSize > 500 * 1024) {
      recommendations.push('Implement more aggressive code splitting')
    }
    if (metrics.pageLoad > 3000) {
      recommendations.push('Add resource preloading')
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:')
      recommendations.forEach(rec => console.log(`   • ${rec}`))
    } else {
      console.log('\n✅ All performance targets met!')
    }
    
    console.log('\n🎉 Performance test completed!')
    
    return {
      score,
      grade,
      metrics,
      recommendations
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  } finally {
    await browser.close()
  }
}

testOptimizedCustomizer()
  .then(results => {
    if (results) {
      process.exit(results.score >= 80 ? 0 : 1)
    } else {
      process.exit(1)
    }
  })
  .catch(console.error)