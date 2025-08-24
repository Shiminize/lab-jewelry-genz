/**
 * Phase 1 Performance Validation
 * Simple Node.js script to validate our optimizations
 */

const puppeteer = require('puppeteer')

async function validatePhase1Performance() {
  console.log('🚀 Phase 1 Performance Validation Starting...')
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  const results = []
  
  try {
    // Test Homepage
    console.log('\n📋 Testing Homepage...')
    await page.goto('http://localhost:3000/')
    await page.waitForSelector('#customizer-3d-container', { timeout: 10000 })
    
    // Wait for assets to load and prefetch
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Test material switching
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    
    for (let i = 0; i < materials.length - 1; i++) {
      const fromMaterial = materials[i]
      const toMaterial = materials[i + 1]
      
      console.log(`🔄 Testing: ${fromMaterial} → ${toMaterial}`)
      
      const switchTime = await page.evaluate(async (to) => {
        const startTime = performance.now()
        
        // Find material button by text content since data-material-id might not exist
        const allButtons = Array.from(document.querySelectorAll('button'))
        const button = allButtons.find(btn => {
          const text = btn.textContent?.toLowerCase() || ''
          return (
            (to === 'platinum' && text.includes('platinum')) ||
            (to === '18k-white-gold' && (text.includes('white gold') || text.includes('18k white'))) ||
            (to === '18k-yellow-gold' && (text.includes('yellow gold') || text.includes('18k yellow'))) ||
            (to === '18k-rose-gold' && (text.includes('rose gold') || text.includes('18k rose')))
          )
        })
        
        if (!button) {
          // List available buttons for debugging
          const availableTexts = allButtons.map(btn => btn.textContent?.substring(0, 30)).filter(Boolean)
          throw new Error(`Material button ${to} not found. Available: ${availableTexts.join(', ')}`)
        }
        
        button.click()
        
        // Wait for change to complete
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const endTime = performance.now()
        return endTime - startTime
      }, toMaterial)
      
      results.push({
        page: 'homepage',
        switch: `${fromMaterial} → ${toMaterial}`,
        time: switchTime
      })
      
      console.log(`  ⚡ ${switchTime.toFixed(2)}ms`)
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // Test Customizer Page
    console.log('\n📋 Testing Customizer Page...')
    await page.goto('http://localhost:3000/customizer')
    await page.waitForSelector('#customizer-3d-container, .ProductCustomizer, [class*="customizer"]', { timeout: 10000 })
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    for (let i = 0; i < materials.length - 1; i++) {
      const fromMaterial = materials[i]
      const toMaterial = materials[i + 1]
      
      console.log(`🔄 Testing: ${fromMaterial} → ${toMaterial}`)
      
      const switchTime = await page.evaluate(async (to) => {
        const startTime = performance.now()
        
        // Find material button by text content
        const allButtons = Array.from(document.querySelectorAll('button'))
        const button = allButtons.find(btn => {
          const text = btn.textContent?.toLowerCase() || ''
          return (
            (to === 'platinum' && text.includes('platinum')) ||
            (to === '18k-white-gold' && (text.includes('white gold') || text.includes('18k white'))) ||
            (to === '18k-yellow-gold' && (text.includes('yellow gold') || text.includes('18k yellow'))) ||
            (to === '18k-rose-gold' && (text.includes('rose gold') || text.includes('18k rose')))
          )
        })
        
        if (!button) {
          const availableTexts = allButtons.map(btn => btn.textContent?.substring(0, 30)).filter(Boolean)
          throw new Error(`Material button ${to} not found. Available: ${availableTexts.join(', ')}`)
        }
        
        button.click()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const endTime = performance.now()
        return endTime - startTime
      }, toMaterial)
      
      results.push({
        page: 'customizer',
        switch: `${fromMaterial} → ${toMaterial}`,
        time: switchTime
      })
      
      console.log(`  ⚡ ${switchTime.toFixed(2)}ms`)
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  await browser.close()
  
  // Analyze results
  console.log('\n🎯 PHASE 1 PERFORMANCE RESULTS:')
  console.log('='.repeat(50))
  
  const allTimes = results.map(r => r.time)
  const avgTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
  const maxTime = Math.max(...allTimes)
  const minTime = Math.min(...allTimes)
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`Average Time: ${avgTime.toFixed(2)}ms`)
  console.log(`Max Time: ${maxTime.toFixed(2)}ms`)
  console.log(`Min Time: ${minTime.toFixed(2)}ms`)
  console.log(`Target: <90ms (CLAUDE_RULES)`)
  
  // Individual results
  console.log('\nDetailed Results:')
  results.forEach(result => {
    const status = result.time < 90 ? '✅' : '❌'
    console.log(`${status} ${result.page}: ${result.switch} - ${result.time.toFixed(2)}ms`)
  })
  
  // Final validation
  const passCount = results.filter(r => r.time < 90).length
  const passRate = (passCount / results.length) * 100
  
  console.log('\n🏆 FINAL RESULTS:')
  console.log(`Pass Rate: ${passRate.toFixed(1)}% (${passCount}/${results.length})`)
  console.log(`Average Performance: ${avgTime.toFixed(2)}ms vs 90ms target`)
  
  if (avgTime < 90 && passRate >= 80) {
    console.log('🎉 PHASE 1 SUCCESS - Performance targets met!')
    console.log(`Improvement: ${((273 - avgTime) / 273 * 100).toFixed(1)}% faster than baseline (273ms)`)
    return true
  } else {
    console.log('💥 PHASE 1 FAILED - Performance targets not met')
    return false
  }
}

// Run validation
validatePhase1Performance().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Validation failed:', error)
  process.exit(1)
})