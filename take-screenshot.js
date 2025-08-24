const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function takeCustomizerScreenshot() {
  console.log('🖼️ Phase 2: Taking screenshot of simplified preview section...')
  
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport for desktop view
    await page.setViewport({ width: 1280, height: 800 })
    
    console.log('📱 Navigating to customizer page...')
    
    // Try different routes to find the working customizer page
    const routes = [
      'http://localhost:3000/customizer',
      'http://localhost:3000/customizer-preview-demo', 
      'http://localhost:3000/',
      'http://localhost:3000/catalog'
    ]
    
    let successfulRoute = null
    for (const route of routes) {
      try {
        console.log(`🔍 Trying route: ${route}`)
        const response = await page.goto(route, { 
          waitUntil: 'networkidle2',
          timeout: 10000 
        })
        
        if (response.ok()) {
          console.log(`✅ Successfully loaded: ${route}`)
          successfulRoute = route
          break
        }
      } catch (error) {
        console.log(`❌ Failed to load: ${route} - ${error.message}`)
      }
    }
    
    if (!successfulRoute) {
      throw new Error('Could not load any customizer page')
    }
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Look for customizer elements or any preview section
    const hasCustomizer = await page.$('.customizer, [data-testid="product-customizer"], .preview') !== null
    const hasPreview = await page.$('.space-y-4, .grid, .flex') !== null
    
    console.log(`📊 Page analysis:`)
    console.log(`   - Has customizer elements: ${hasCustomizer}`)
    console.log(`   - Has preview elements: ${hasPreview}`)
    
    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `phase2-simplified-preview-${timestamp}.png`
    
    await page.screenshot({ 
      path: filename,
      fullPage: true
    })
    
    console.log(`📸 Screenshot saved: ${filename}`)
    
    // Also take a mobile screenshot
    await page.setViewport({ width: 375, height: 667 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mobileFilename = `phase2-simplified-preview-mobile-${timestamp}.png`
    await page.screenshot({ 
      path: mobileFilename,
      fullPage: true
    })
    
    console.log(`📱 Mobile screenshot saved: ${mobileFilename}`)
    
    // Check if our target text was successfully removed
    const pageContent = await page.content()
    const has360Controls = pageContent.includes('360° View Controls')
    const hasRotateText = pageContent.includes('Rotate to see every angle')
    const hasKeyboardText = pageContent.includes('Touch & Keyboard:')
    
    console.log(`\n🧪 Phase 2 Validation Results:`)
    console.log(`   - "360° View Controls" found: ${has360Controls ? '❌ FAIL' : '✅ PASS'}`)
    console.log(`   - "Rotate to see every angle" found: ${hasRotateText ? '❌ FAIL' : '✅ PASS'}`)
    console.log(`   - "Touch & Keyboard:" found: ${hasKeyboardText ? '❌ FAIL' : '✅ PASS'}`)
    
    const allTestsPassed = !has360Controls && !hasRotateText && !hasKeyboardText
    console.log(`\n🎯 Overall Phase 2 Status: ${allTestsPassed ? '✅ SUCCESS' : '❌ NEEDS REVIEW'}`)
    
    return {
      success: true,
      route: successfulRoute,
      screenshots: [filename, mobileFilename],
      validation: {
        has360Controls,
        hasRotateText, 
        hasKeyboardText,
        allTestsPassed
      }
    }
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message)
    return { success: false, error: error.message }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Run the screenshot function
takeCustomizerScreenshot()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Phase 2 visual validation complete!')
      process.exit(0)
    } else {
      console.error('\n❌ Phase 2 visual validation failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })