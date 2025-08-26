/**
 * Test JavaScript Image Loading
 * Test if JavaScript can load images from the same origin
 */

const { chromium } = require('playwright')

async function testJavaScriptImageLoading() {
  console.log('🧪 Testing JavaScript Image Loading...\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // Navigate to the site
    console.log('📍 Loading site...')
    await page.goto('http://localhost:3001/customizer')
    
    // Test JavaScript image loading
    console.log('🖼️ Testing JavaScript image loading...')
    const result = await page.evaluate(() => {
      return new Promise((resolve) => {
        const img = new Image()
        
        img.onload = () => {
          resolve({
            success: true,
            width: img.width,
            height: img.height,
            src: img.src
          })
        }
        
        img.onerror = (error) => {
          resolve({
            success: false,
            error: error.toString(),
            src: img.src
          })
        }
        
        // Test loading the first image
        img.src = '/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence/0.webp'
        
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve({
            success: false,
            error: 'timeout',
            src: img.src
          })
        }, 5000)
      })
    })
    
    console.log(`📊 Result:`, result)
    
    if (result.success) {
      console.log('✅ SUCCESS: JavaScript image loading works!')
      return true
    } else {
      console.log(`❌ FAIL: JavaScript image loading failed - ${result.error}`)
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
testJavaScriptImageLoading().then(success => {
  console.log(`\n${success ? '🎉 JS IMAGE LOADING WORKING' : '❌ JS IMAGE LOADING FAILED'}`)
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Test crashed:', error)
  process.exit(1)
})