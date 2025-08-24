/**
 * Quick Cache-Busting Verification
 * Direct inspection of image URLs and cache-busting parameters
 */

const { chromium } = require('playwright')

async function quickTest() {
  console.log('🚀 Quick Cache-Busting Verification\n')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slower for observation
  })
  
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  })

  const imageUrls = []

  // Track all image requests
  page.on('request', request => {
    const url = request.url()
    if (url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
      imageUrls.push(url)
      console.log(`📸 IMAGE URL: ${url}`)
      
      // Check cache-busting format immediately
      const hasCacheBusting = url.includes('?v=') && /\?v=\d{13}/.test(url)
      console.log(`   Cache-busting: ${hasCacheBusting ? '✅ YES' : '❌ NO'}`)
    }
  })

  try {
    console.log('🌐 Loading customizer page...')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    })
    
    console.log('⏱️  Waiting for customizer component...')
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 })
    
    console.log('🖼️  Waiting for initial images to load...')
    await page.waitForTimeout(5000)

    // Try to find and click material buttons
    console.log('🔄 Testing material switching...')
    const materialButtons = await page.$$('button')
    let materialsFound = 0
    
    for (const button of materialButtons) {
      try {
        const text = await button.textContent()
        if (text && (text.toLowerCase().includes('gold') || text.toLowerCase().includes('platinum'))) {
          console.log(`🎯 Found material button: "${text}"`)
          materialsFound++
          
          if (materialsFound <= 2) { // Test first 2 materials only
            await button.click()
            console.log(`   Clicked "${text}", waiting for images...`)
            await page.waitForTimeout(3000)
          }
        }
      } catch (e) {
        // Skip buttons that can't be interacted with
      }
    }

    console.log('\n📊 VERIFICATION RESULTS')
    console.log('========================')
    console.log(`Total image requests: ${imageUrls.length}`)
    
    if (imageUrls.length > 0) {
      const cacheBustedUrls = imageUrls.filter(url => url.includes('?v=') && /\?v=\d{13}/.test(url))
      const cacheBustingRate = (cacheBustedUrls.length / imageUrls.length) * 100
      
      console.log(`Cache-busted URLs: ${cacheBustedUrls.length}/${imageUrls.length} (${cacheBustingRate.toFixed(1)}%)`)
      
      console.log('\n📝 SAMPLE URLS:')
      imageUrls.slice(0, 5).forEach((url, i) => {
        const hasCacheBusting = url.includes('?v=') && /\?v=\d{13}/.test(url)
        console.log(`${i + 1}. ${url}`)
        console.log(`   Cache-busting: ${hasCacheBusting ? '✅' : '❌'}`)
      })

      // FINAL VERDICT
      console.log(`\n🎯 CACHE-BUSTING FIX STATUS: ${cacheBustingRate >= 90 ? '✅ SUCCESS' : '⚠️  NEEDS ATTENTION'}`)
    } else {
      console.log('⚠️  No image requests detected - may indicate loading issues')
    }

    // Take a screenshot for verification
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/quick-verification-screenshot.png',
      fullPage: true 
    })
    console.log('\n📸 Screenshot saved: quick-verification-screenshot.png')

    // Keep browser open for 30 seconds for manual inspection
    console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...')
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error('❌ Error during test:', error.message)
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/quick-verification-error.png' 
    })
  } finally {
    await browser.close()
    console.log('🏁 Test completed')
  }
}

quickTest().catch(console.error)