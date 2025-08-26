/**
 * Test Direct Image Access
 * Bypass the viewer and test direct image loading
 */

const { chromium } = require('playwright')

async function testDirectImageAccess() {
  console.log('🖼️ Testing Direct Image Access...\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // Navigate directly to image URL
    console.log('📍 Testing direct WebP image access...')
    const response = await page.goto('http://localhost:3001/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence/0.webp')
    
    console.log(`📊 Response status: ${response.status()}`)
    console.log(`📊 Response headers:`, await response.allHeaders())
    
    if (response.status() === 200) {
      console.log('✅ SUCCESS: Direct image access works!')
      return true
    } else {
      console.log('❌ FAIL: Direct image access failed')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
    
  } finally {
    await browser.close()
  }
}

// Run test
testDirectImageAccess().then(success => {
  console.log(`\n${success ? '🎉 DIRECT IMAGE ACCESS WORKING' : '❌ DIRECT IMAGE ACCESS FAILED'}`)
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Test crashed:', error)
  process.exit(1)
})