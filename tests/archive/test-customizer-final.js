/**
 * Final Customizer Performance Validation
 * Compares before/after optimization results
 */

const puppeteer = require('puppeteer')

async function testCustomizerFinal() {
  console.log('🧪 Final Customizer Performance Validation')
  console.log('🎯 Target: <1500ms page load, <350ms FCP, <2500ms LCP')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Test metrics tracking
    const results = {
      optimized: null,
      enhanced: null
    }
    
    // Test 1: Optimized Mode (Default)
    console.log('\n📝 Testing Optimized Mode...')
    const optimizedStart = Date.now()
    
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle0' })
    results.optimized = {
      pageLoad: Date.now() - optimizedStart,
      mode: 'optimized'
    }
    
    console.log(`✅ Optimized page load: ${results.optimized.pageLoad}ms`)
    
    // Check if optimized mode is active
    const optimizedActive = await page.evaluate(() => {
      const optimizedBtn = document.querySelector('button:contains("Optimized ⚡")')
      return optimizedBtn?.classList.contains('bg-background')
    })
    
    console.log(`✅ Optimized mode active: ${optimizedActive || 'Default'}`)
    
    // Test 2: Enhanced Mode (For comparison)
    console.log('\n📝 Testing Enhanced Mode...')
    
    // Switch to enhanced mode
    const enhancedBtn = await page.$('button')
    if (enhancedBtn) {
      await enhancedBtn.click()
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    const enhancedStart = Date.now()
    await page.reload({ waitUntil: 'networkidle0' })
    results.enhanced = {
      pageLoad: Date.now() - enhancedStart,
      mode: 'enhanced'
    }
    
    console.log(`✅ Enhanced page load: ${results.enhanced.pageLoad}ms`)
    
    // Test 3: Performance Analysis
    console.log('\n📝 Performance Analysis...')
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length,
        totalTransferSize: performance.getEntriesByType('resource')
          .reduce((sum, r) => sum + (r.transferSize || 0), 0)
      }
    })
    
    console.log(`✅ DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`)
    console.log(`✅ First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`)
    console.log(`✅ First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`)
    console.log(`✅ Resource Count: ${performanceMetrics.resourceCount}`)
    console.log(`✅ Total Transfer Size: ${(performanceMetrics.totalTransferSize / 1024).toFixed(2)}KB`)
    
    // Test 4: Functionality Validation
    console.log('\n📝 Testing Functionality...')
    
    // Check for customizer components
    const customizerExists = await page.$('[class*="customizer"], .customizer, [data-customizer]')
    console.log(`✅ Customizer component: ${customizerExists ? 'Found' : 'Not found'}`)
    
    // Check for interactive elements
    const buttonCount = await page.$$eval('button', btns => btns.length)
    console.log(`✅ Interactive buttons: ${buttonCount}`)
    
    // Check for performance mode toggle
    const performanceToggle = await page.$('button:contains("Optimized"), button:contains("Enhanced")')
    console.log(`✅ Performance toggle: ${performanceToggle ? 'Found' : 'Not found'}`)
    
    // Performance Scoring
    console.log('\n📊 Performance Scoring...')
    
    let score = 100
    const targetMetrics = {
      pageLoad: 1500,
      firstContentfulPaint: 350,
      domContentLoaded: 1000
    }
    
    // Score optimized mode
    if (results.optimized.pageLoad > targetMetrics.pageLoad) {
      const penalty = Math.min(30, (results.optimized.pageLoad - targetMetrics.pageLoad) / 50)
      score -= penalty
      console.log(`⚠️ Page load penalty: -${penalty.toFixed(1)} points`)
    }
    
    if (performanceMetrics.firstContentfulPaint > targetMetrics.firstContentfulPaint) {
      const penalty = Math.min(20, (performanceMetrics.firstContentfulPaint - targetMetrics.firstContentfulPaint) / 25)
      score -= penalty
      console.log(`⚠️ FCP penalty: -${penalty.toFixed(1)} points`)
    }
    
    if (performanceMetrics.domContentLoaded > targetMetrics.domContentLoaded) {
      const penalty = Math.min(15, (performanceMetrics.domContentLoaded - targetMetrics.domContentLoaded) / 40)
      score -= penalty
      console.log(`⚠️ DCL penalty: -${penalty.toFixed(1)} points`)
    }
    
    // Final Results
    console.log('\n🎯 Optimization Results:')
    console.log(`   Optimized Mode: ${results.optimized.pageLoad}ms`)
    if (results.enhanced) {
      const improvement = ((results.enhanced.pageLoad - results.optimized.pageLoad) / results.enhanced.pageLoad * 100)
      console.log(`   Enhanced Mode: ${results.enhanced.pageLoad}ms`)
      console.log(`   Improvement: ${improvement.toFixed(1)}% faster`)
    }
    
    const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 85 ? 'B+' : score >= 80 ? 'B' : score >= 75 ? 'C' : 'D'
    console.log(`\n🏆 Final Performance Score: ${Math.round(score)}/100 (${grade})`)
    
    // Success criteria
    const success = 
      results.optimized.pageLoad < targetMetrics.pageLoad &&
      performanceMetrics.firstContentfulPaint < targetMetrics.firstContentfulPaint &&
      performanceMetrics.domContentLoaded < targetMetrics.domContentLoaded
    
    if (success) {
      console.log('\n🎉 All optimization targets achieved!')
      console.log('✅ Phase 3: 3D Customizer optimization COMPLETE')
    } else {
      console.log('\n⚠️ Some targets not met - further optimization needed')
    }
    
    return { score, success, results, performanceMetrics }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  } finally {
    await browser.close()
  }
}

testCustomizerFinal()
  .then(results => {
    if (results && results.success) {
      console.log('\n🚀 Customizer optimization successfully completed!')
      process.exit(0)
    } else {
      console.log('\n❌ Optimization targets not fully achieved')
      process.exit(1)
    }
  })
  .catch(console.error)