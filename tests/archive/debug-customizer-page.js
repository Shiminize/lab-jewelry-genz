/**
 * Debug script to check customizer page elements
 */

const puppeteer = require('puppeteer')

async function debugCustomizerPage() {
  console.log('🔍 Debugging customizer page...')
  
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle2' })
    console.log('✅ Customizer page loaded')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Check page content
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasProductCustomizer: document.querySelector('.ProductCustomizer') !== null,
        has3DContainer: document.querySelector('#customizer-3d-container') !== null,
        hasDataTestId: document.querySelector('[data-testid="product-customizer"]') !== null,
        allCustomizerElements: Array.from(document.querySelectorAll('[class*="customizer"], [id*="customizer"]')).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        })),
        pageText: document.body.textContent?.substring(0, 200)
      }
    })
    
    console.log('📋 Customizer page info:', pageInfo)
    
    // Check for errors
    const errors = await page.evaluate(() => {
      const errors = []
      if (window.console && window.console.error) {
        // Can't access console.error from here, but we can check for error elements
      }
      return errors
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
  
  await browser.close()
}

debugCustomizerPage().catch(console.error)