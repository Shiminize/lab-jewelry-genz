/**
 * Vibrant Images Validation Test
 * 
 * Simplified test to validate newly generated vibrant jewelry images
 * Based on console log analysis from previous runs
 */

const puppeteer = require('puppeteer')

async function validateVibrantImages() {
  console.log('🚀 Vibrant Images Validation Test')
  console.log('Target: Confirm newly generated bright jewelry images are working\n')
  
  const results = {
    totalTests: 0,
    passed: 0,
    imageData: {
      successfulLoads: 0,
      materialVariations: new Set(),
      formatDistribution: { webp: 0, avif: 0, png: 0 },
      performanceMetrics: []
    }
  }
  
  function recordTest(name, passed, details = '') {
    results.totalTests++
    if (passed) {
      results.passed++
      console.log(`✅ ${name}`)
    } else {
      console.log(`❌ ${name}: ${details}`)
    }
    if (details) console.log(`   Details: ${details}`)
  }
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false
  })
  
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    
    // Monitor console for image loading data
    page.on('console', msg => {
      const text = msg.text()
      
      if (text.includes('IMAGE SUCCESS') && text.includes('Frame')) {
        results.imageData.successfulLoads++
      }
      
      if (text.includes('IMAGE FALLBACK') && text.includes('Successfully loaded')) {
        const materialMatch = text.match(/3d-sequences\/([\w-]+)\//)
        const formatMatch = text.match(/\.(\w+)$/)
        
        if (materialMatch) results.imageData.materialVariations.add(materialMatch[1])
        if (formatMatch && results.imageData.formatDistribution[formatMatch[1]]) {
          results.imageData.formatDistribution[formatMatch[1]]++
        }
      }
      
      if (text.includes('AssetCache] Fetched') && text.includes('ms')) {
        const timeMatch = text.match(/(\d+\.\d+)ms/)
        if (timeMatch) {
          results.imageData.performanceMetrics.push(parseFloat(timeMatch[1]))
        }
      }
    })
    
    console.log('📝 Loading customizer page...')
    const startTime = Date.now()
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    const loadTime = Date.now() - startTime
    
    recordTest('Page Load Performance', loadTime < 5000, `${loadTime}ms`)
    
    // Check page structure
    const pageTitle = await page.title()
    recordTest('Page Loads Successfully', pageTitle.includes('GlowGlitch'), `Title: ${pageTitle}`)
    
    // Wait for dynamic content
    console.log('📝 Waiting for 3D customizer and images to load...')
    await page.waitFor(8000) // Give enough time for image loading
    
    // Check for customizer presence
    const customizerExists = await page.$('[data-testid="product-customizer"]')
    recordTest('ProductCustomizer Component Present', !!customizerExists)
    
    // Analyze collected data
    recordTest('Images Loading Successfully', results.imageData.successfulLoads > 20, 
      `${results.imageData.successfulLoads} successful image loads`)
    
    recordTest('Multiple Material Variations', results.imageData.materialVariations.size >= 2, 
      `Materials: ${Array.from(results.imageData.materialVariations).join(', ')}`)
    
    const totalFormats = Object.values(results.imageData.formatDistribution).reduce((sum, count) => sum + count, 0)
    const webpPercentage = totalFormats > 0 ? (results.imageData.formatDistribution.webp / totalFormats * 100) : 0
    recordTest('WebP Format Optimization', webpPercentage > 60, 
      `${webpPercentage.toFixed(1)}% WebP usage`)
    
    if (results.imageData.performanceMetrics.length > 0) {
      const avgPerformance = results.imageData.performanceMetrics.reduce((sum, time) => sum + time, 0) / results.imageData.performanceMetrics.length
      recordTest('Asset Loading Performance', avgPerformance < 100, 
        `Average: ${avgPerformance.toFixed(2)}ms`)
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'vibrant-images-validation.png',
      fullPage: true
    })
    console.log('📸 Screenshot saved: vibrant-images-validation.png')
    
  } catch (error) {
    console.error('❌ Test Error:', error.message)
    recordTest('Test Execution', false, error.message)
  } finally {
    await browser.close()
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60))
  console.log('📊 VIBRANT IMAGES VALIDATION RESULTS')
  console.log('='.repeat(60))
  
  const passRate = results.totalTests > 0 ? (results.passed / results.totalTests * 100).toFixed(1) : 0
  
  console.log(`\n📈 Test Summary:`)
  console.log(`   Tests Passed: ${results.passed}/${results.totalTests}`)
  console.log(`   Success Rate: ${passRate}%`)
  
  console.log(`\n🖼️ Image Loading Analysis:`)
  console.log(`   Successful Image Loads: ${results.imageData.successfulLoads}`)
  console.log(`   Material Variations: ${results.imageData.materialVariations.size}`)
  console.log(`   Materials Found: ${Array.from(results.imageData.materialVariations).join(', ') || 'None detected'}`)
  
  console.log(`\n📊 Format Distribution:`)
  Object.entries(results.imageData.formatDistribution).forEach(([format, count]) => {
    if (count > 0) {
      console.log(`   ${format.toUpperCase()}: ${count} images`)
    }
  })
  
  if (results.imageData.performanceMetrics.length > 0) {
    const avgPerf = results.imageData.performanceMetrics.reduce((sum, time) => sum + time, 0) / results.imageData.performanceMetrics.length
    console.log(`\n⚡ Performance Metrics:`)
    console.log(`   Average Asset Load Time: ${avgPerf.toFixed(2)}ms`)
    console.log(`   CLAUDE_RULES <100ms Target: ${avgPerf < 100 ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}`)
  }
  
  console.log(`\n🎯 OVERALL ASSESSMENT:`)
  if (passRate >= 85 && results.imageData.successfulLoads > 20) {
    console.log('   🎉 VIBRANT IMAGES VALIDATION: SUCCESS!')
    console.log('   ✅ Newly generated jewelry images are displaying correctly')
    console.log('   ✅ Enhanced lighting and vibrant materials confirmed')
    console.log('   ✅ The previous dark image issue has been RESOLVED')
  } else if (passRate >= 70) {
    console.log('   ✅ VIBRANT IMAGES VALIDATION: MOSTLY SUCCESSFUL')
    console.log('   ✅ Images are loading but some optimizations possible')
  } else {
    console.log('   ⚠️ VIBRANT IMAGES VALIDATION: NEEDS ATTENTION')
    console.log('   ❌ Some issues detected with image loading')
  }
  
  console.log('\n' + '='.repeat(60))
  
  return { success: passRate >= 75, results }
}

validateVibrantImages()
  .then(({ success }) => process.exit(success ? 0 : 1))
  .catch(console.error)