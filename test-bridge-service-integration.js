/**
 * Test Bridge Service Integration
 * Minimal test to verify the entire flow works
 */

const { chromium } = require('playwright')

async function testBridgeServiceIntegration() {
  console.log('🔗 Testing Bridge Service Integration...\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // Enable detailed console logging
    page.on('console', msg => {
      if (msg.text().includes('ProductCustomizer') || msg.text().includes('bridge service')) {
        console.log(`🖥️ Browser: ${msg.text()}`)
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('/api/products/customizable/')) {
        console.log(`🔄 API Call: ${response.status()} ${response.url()}`)
      }
    })
    
    // Navigate to customizer
    console.log('📍 Loading customizer page...')
    await page.goto('http://localhost:3001/customizer', { waitUntil: 'networkidle' })
    
    // Wait for ProductCustomizer to load and make API calls
    console.log('⏳ Waiting for bridge service API calls...')
    await page.waitForTimeout(5000)
    
    // Check if we can find the image sequence viewer
    const viewer = await page.$('[data-testid="image-sequence-viewer"]')
    if (viewer) {
      console.log('✅ Image sequence viewer found')
      
      // Check for loading or error states
      const hasLoading = await page.$('text=Loading your perfect view') !== null
      const hasError = await page.$('text=Preview Error') !== null
      const hasImageError = await page.$('text=Only 0/36 images loaded') !== null
      
      console.log(`📊 Status:`)
      console.log(`   Loading: ${hasLoading}`)
      console.log(`   Error: ${hasError}`)
      console.log(`   Image Load Error: ${hasImageError}`)
      
      if (!hasError && !hasImageError) {
        console.log('✅ SUCCESS: 3D viewer is working correctly!')
        return true
      } else {
        console.log('❌ FAIL: Still showing errors')
        return false
      }
    } else {
      console.log('❌ Image sequence viewer not found')
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
testBridgeServiceIntegration().then(success => {
  console.log(`\n${success ? '🎉 BRIDGE SERVICE INTEGRATION WORKING' : '❌ INTEGRATION STILL HAS ISSUES'}`)
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Test crashed:', error)
  process.exit(1)
})