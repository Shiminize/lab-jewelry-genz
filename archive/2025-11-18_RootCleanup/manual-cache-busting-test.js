/**
 * Manual Cache-Busting Verification Test
 * Simplified version that manually verifies the cache-busting fix
 */

const { chromium } = require('playwright')

async function testCacheBusting() {
  console.log('🔍 Starting Cache-Busting Manual Verification Test...\n')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })
  const page = await context.newPage()

  try {
    // Track network requests
    const imageRequests = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
        imageRequests.push({
          url: url,
          timestamp: new Date().toISOString()
        })
        console.log(`📸 Image Request: ${url}`)
      }
    })

    // Track responses
    const imageResponses = []
    page.on('response', response => {
      const url = response.url()
      if (url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
        imageResponses.push({
          url: url,
          status: response.status(),
          fromCache: response.status() === 304,
          timestamp: new Date().toISOString()
        })
        console.log(`📥 Image Response: ${url} - Status: ${response.status()}`)
      }
    })

    console.log('🌐 Navigating to customizer...')
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle', timeout: 30000 })

    console.log('⏱️  Waiting for customizer to load...')
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 15000 })
    await page.waitForTimeout(3000) // Allow time for images to load

    // Test 1: Check cache-busting URLs
    console.log('\n🧪 TEST 1: Cache-busting URL format')
    const hasTimestampParams = imageRequests.every(req => {
      const hasTimestamp = req.url.includes('?v=') && /\?v=\d{13}/.test(req.url)
      if (!hasTimestamp) {
        console.log(`❌ Missing timestamp: ${req.url}`)
      }
      return hasTimestamp
    })
    
    console.log(`📊 Result: ${imageRequests.length} image requests, ${hasTimestampParams ? 'ALL' : 'SOME'} have cache-busting timestamps`)
    console.log(`✅ TEST 1: ${hasTimestampParams ? 'PASS' : 'FAIL'}`)

    // Test 2: Material switching
    console.log('\n🧪 TEST 2: Material switching with image loading')
    const materialButtons = await page.$$('button:has-text("Gold"), button:has-text("Platinum")')
    
    let materialSwitchResults = []
    for (let i = 0; i < Math.min(3, materialButtons.length); i++) {
      console.log(`🔄 Testing material switch ${i + 1}...`)
      const startTime = Date.now()
      
      await materialButtons[i].click()
      
      // Wait for image to update
      await page.waitForTimeout(2000)
      
      // Check if image is visible and loaded
      const imageElement = page.locator('img[alt*="3D jewelry view"]').first()
      const isVisible = await imageElement.isVisible()
      const endTime = Date.now()
      
      materialSwitchResults.push({
        switchNumber: i + 1,
        success: isVisible,
        duration: endTime - startTime
      })
      
      console.log(`⚡ Switch ${i + 1}: ${isVisible ? 'SUCCESS' : 'FAILED'} in ${endTime - startTime}ms`)
    }
    
    const successfulSwitches = materialSwitchResults.filter(r => r.success).length
    const avgSwitchTime = materialSwitchResults.reduce((acc, r) => acc + r.duration, 0) / materialSwitchResults.length
    
    console.log(`📊 Material switching: ${successfulSwitches}/${materialSwitchResults.length} successful, avg ${avgSwitchTime.toFixed(0)}ms`)
    console.log(`✅ TEST 2: ${successfulSwitches >= Math.ceil(materialSwitchResults.length * 0.75) ? 'PASS' : 'FAIL'}`)

    // Test 3: Take verification screenshots
    console.log('\n🧪 TEST 3: Visual verification screenshots')
    
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/manual-verification-full.png',
      fullPage: true 
    })
    
    // Take customizer-focused screenshot
    const customizer = page.locator('[data-testid="product-customizer"]')
    if (await customizer.isVisible()) {
      await customizer.screenshot({ 
        path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/manual-verification-customizer.png'
      })
    }
    
    console.log('📸 Screenshots saved: manual-verification-full.png, manual-verification-customizer.png')
    console.log('✅ TEST 3: PASS')

    // Final summary
    console.log('\n🎯 CACHE-BUSTING VERIFICATION SUMMARY')
    console.log('=====================================')
    console.log(`📊 Image requests tracked: ${imageRequests.length}`)
    console.log(`📊 Image responses tracked: ${imageResponses.length}`)
    console.log(`📊 Requests with cache-busting: ${hasTimestampParams ? 'ALL' : 'SOME'}`)
    console.log(`📊 Fresh responses (non-304): ${imageResponses.filter(r => !r.fromCache).length}`)
    console.log(`📊 Successful material switches: ${successfulSwitches}/${materialSwitchResults.length}`)
    console.log(`📊 Average switch time: ${avgSwitchTime.toFixed(0)}ms`)

    // Show sample URLs
    if (imageRequests.length > 0) {
      console.log('\n🔗 SAMPLE IMAGE URLS:')
      imageRequests.slice(0, 3).forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`)
      })
    }

    const overallSuccess = hasTimestampParams && (successfulSwitches >= Math.ceil(materialSwitchResults.length * 0.75))
    console.log(`\n🎉 OVERALL RESULT: ${overallSuccess ? 'SUCCESS ✅' : 'NEEDS ATTENTION ⚠️'}`)

    // Keep browser open for manual inspection
    console.log('\n👀 Browser kept open for manual inspection. Close browser to complete test.')
    await page.waitForTimeout(60000) // Wait 1 minute for manual inspection

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/manual-verification-error.png' })
  } finally {
    await browser.close()
  }
}

// Run the test
testCacheBusting().catch(console.error)