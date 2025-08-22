/**
 * Debug Image Loading Issues
 * Check exactly what's happening in the ImageSequenceViewer
 */

const { chromium } = require('playwright')

async function debugImageLoading() {
  console.log('🔍 Debugging Image Loading Issues...\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // Capture ALL console logs
    page.on('console', msg => {
      console.log(`🖥️ ${msg.type().toUpperCase()}: ${msg.text()}`)
    })
    
    // Capture network failures
    page.on('response', response => {
      if (response.url().includes('/images/products/3d-sequences/') || response.url().includes('/api/products/customizable/')) {
        const status = response.status()
        const statusIcon = status === 200 ? '✅' : '❌'
        console.log(`${statusIcon} ${status} ${response.url()}`)
      }
    })
    
    page.on('requestfailed', request => {
      if (request.url().includes('/images/products/3d-sequences/')) {
        console.log(`❌ FAILED: ${request.url()} - ${request.failure()?.errorText}`)
      }
    })
    
    // Navigate to customizer
    console.log('📍 Loading customizer page...')
    await page.goto('http://localhost:3001/customizer', { waitUntil: 'networkidle' })
    
    // Wait for any loading to complete
    console.log('⏳ Waiting for image loading attempts...')
    await page.waitForTimeout(10000)
    
    // Check what path the ImageSequenceViewer is using
    const imagePath = await page.evaluate(() => {
      const viewer = document.querySelector('[data-testid="image-sequence-viewer"]')
      if (viewer) {
        return viewer.getAttribute('data-image-path') || 'not-found'
      }
      return null
    })
    
    console.log(`📁 Image path being used: ${imagePath}`)
    
    // Get error details
    const errorElements = await page.$$eval('[data-testid="image-sequence-viewer"] .text-foreground', 
      elements => elements.map(el => el.textContent)
    )
    
    if (errorElements.length > 0) {
      console.log('🚨 Error messages found:')
      errorElements.forEach((error, i) => console.log(`   ${i + 1}. ${error}`))
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    
  } finally {
    await browser.close()
  }
}

// Run debug
debugImageLoading().catch(console.error)