/**
 * Simple Customizer Test
 * Quick check of customizer page functionality
 */

const puppeteer = require('puppeteer')

async function testCustomizerSimple() {
  console.log('🧪 Simple Customizer Test')
  
  const browser = await puppeteer.launch({ headless: false, devtools: true })
  const page = await browser.newPage()
  
  try {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message))
    
    console.log('📝 Loading customizer page...')
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle0' })
    
    const pageTitle = await page.title()
    console.log(`✅ Page loaded: ${pageTitle}`)
    
    // Check for any visible content
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.log(`✅ Page content preview: ${bodyText.substring(0, 200)}...`)
    
    // Check for any buttons or interactive elements
    const buttons = await page.$$eval('button', btns => btns.length)
    console.log(`✅ Found ${buttons} buttons`)
    
    // Check for error messages
    const errorMessages = await page.$$eval('[class*="error"], .error', errors => 
      errors.map(e => e.textContent)
    )
    
    if (errorMessages.length > 0) {
      console.log('⚠️ Error messages found:')
      errorMessages.forEach(msg => console.log(`   • ${msg}`))
    }
    
    // Wait a bit to see what loads
    console.log('📝 Waiting for dynamic content...')
    await page.waitForTimeout(3000)
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'customizer-debug.png', fullPage: true })
    console.log('✅ Screenshot saved as customizer-debug.png')
    
    console.log('\n🎉 Customizer page test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testCustomizerSimple()
  .then(success => process.exit(success ? 0 : 1))
  .catch(console.error)