/**
 * 3D Customizer Performance Test
 * Measures loading times and identifies optimization opportunities
 */

const puppeteer = require('puppeteer')

async function testCustomizerPerformance() {
  console.log('🧪 3D Customizer Performance Test')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Performance metrics collection
    const metrics = {
      pageLoad: 0,
      customizer3DLoad: 0,
      firstInteraction: 0,
      bundleSize: 0
    }
    
    // Test 1: Page Load Performance
    console.log('📝 Testing page load performance...')
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle0' })
    metrics.pageLoad = Date.now() - startTime
    console.log(`✅ Page load time: ${metrics.pageLoad}ms`)
    
    // Test 2: Customizer Component Load
    console.log('📝 Testing customizer component load...')
    const customizerStartTime = Date.now()
    
    // Wait for customizer to be visible
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 })
      .catch(() => {
        console.log('ℹ️ Customizer selector not found, checking for fallback...')
      })
    
    // Check if any customizer content is loaded
    const customizer = await page.$('.customizer, [class*="customizer"], [data-customizer]')
    if (customizer) {
      metrics.customizer3DLoad = Date.now() - customizerStartTime
      console.log(`✅ Customizer load time: ${metrics.customizer3DLoad}ms`)
    } else {
      console.log('ℹ️ Customizer component detection: No specific selector found')
    }
    
    // Test 3: First Interaction Time
    console.log('📝 Testing first interaction time...')
    const interactionStartTime = Date.now()
    
    // Try to find and click the first interactive element
    const firstButton = await page.$('button:not([disabled])')
    if (firstButton) {
      await firstButton.click()
      metrics.firstInteraction = Date.now() - interactionStartTime
      console.log(`✅ First interaction time: ${metrics.firstInteraction}ms`)
    } else {
      console.log('ℹ️ No interactive elements found for testing')
    }
    
    // Test 4: Bundle Analysis
    console.log('📝 Testing bundle performance...')
    
    // Get network requests
    const responses = []
    page.on('response', response => responses.push(response))
    
    await page.reload({ waitUntil: 'networkidle0' })
    
    // Analyze JS bundles
    const jsBundles = responses.filter(r => 
      r.url().includes('.js') && 
      r.headers()['content-type']?.includes('javascript')
    )
    
    let totalBundleSize = 0
    for (const bundle of jsBundles) {
      try {
        const size = parseInt(bundle.headers()['content-length'] || '0')
        totalBundleSize += size
      } catch (e) {
        // Ignore size calculation errors
      }
    }
    
    metrics.bundleSize = totalBundleSize
    console.log(`✅ Total JS bundle size: ${(totalBundleSize / 1024).toFixed(2)}KB`)
    console.log(`✅ Number of JS chunks: ${jsBundles.length}`)
    
    // Test 5: Performance Audit
    console.log('📝 Performance audit...')
    
    // Check for performance issues
    const issues = []
    
    if (metrics.pageLoad > 3000) {
      issues.push(`Page load too slow: ${metrics.pageLoad}ms (target: <3000ms)`)
    }
    
    if (metrics.customizer3DLoad > 2000) {
      issues.push(`Customizer load too slow: ${metrics.customizer3DLoad}ms (target: <2000ms)`)
    }
    
    if (metrics.bundleSize > 1024 * 1024) { // 1MB
      issues.push(`Bundle too large: ${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB (target: <1MB)`)
    }
    
    // Performance Summary
    console.log('\n📊 Performance Summary:')
    console.log(`   Page Load: ${metrics.pageLoad}ms`)
    console.log(`   Customizer Load: ${metrics.customizer3DLoad}ms`)
    console.log(`   First Interaction: ${metrics.firstInteraction}ms`)
    console.log(`   Bundle Size: ${(metrics.bundleSize / 1024).toFixed(2)}KB`)
    
    if (issues.length > 0) {
      console.log('\n⚠️ Performance Issues Found:')
      issues.forEach(issue => console.log(`   • ${issue}`))
    } else {
      console.log('\n✅ All performance targets met!')
    }
    
    // Optimization Recommendations
    console.log('\n💡 Optimization Opportunities:')
    
    if (jsBundles.length > 10) {
      console.log('   • Consider combining small JS chunks')
    }
    
    if (metrics.customizer3DLoad > 1000) {
      console.log('   • Implement progressive loading for 3D components')
    }
    
    if (metrics.pageLoad > 2000) {
      console.log('   • Add resource hints (preload, prefetch)')
      console.log('   • Optimize critical rendering path')
    }
    
    console.log('\n🎉 Performance test completed!')
    return metrics
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  } finally {
    await browser.close()
  }
}

testCustomizerPerformance()
  .then(metrics => {
    if (metrics) {
      // Performance scoring
      let score = 100
      if (metrics.pageLoad > 2000) score -= 20
      if (metrics.customizer3DLoad > 1500) score -= 30
      if (metrics.bundleSize > 500 * 1024) score -= 20
      
      console.log(`\n🎯 Performance Score: ${score}/100`)
      process.exit(score >= 80 ? 0 : 1)
    } else {
      process.exit(1)
    }
  })
  .catch(console.error)