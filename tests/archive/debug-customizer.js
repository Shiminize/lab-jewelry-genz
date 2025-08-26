/**
 * Debug Script: Check customizer page current state
 */

const { chromium } = require('playwright')

async function debugCustomizer() {
  console.log('🔍 Debugging customizer page state...')
  
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Wait for components to load
    
    // Check for any error messages
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'customizer-debug.png', fullPage: true })
    console.log('📸 Screenshot saved as customizer-debug.png')
    
    // Check what's actually on the page
    const pageContent = await page.locator('body').innerHTML()
    
    // Look for material-related elements
    console.log('\n🔍 Looking for material controls...')
    const materialElements = await page.locator('[data-material], [aria-label*="Gold"], [aria-label*="Platinum"]').count()
    console.log(`Found ${materialElements} material-related elements`)
    
    // Check for ProductCustomizer
    const customizerComponent = await page.locator('[data-testid="product-customizer"]').count()
    console.log(`ProductCustomizer components found: ${customizerComponent}`)
    
    // Check for MaterialControls specifically
    const materialControlsSelector = '.grid-cols-4, [class*="material"], button[aria-pressed]'
    const materialControls = await page.locator(materialControlsSelector).count()
    console.log(`Material controls found: ${materialControls}`)
    
    // Check for loading states
    const loadingElements = await page.locator('text="Building your masterpiece", .animate-spin').count()
    console.log(`Loading indicators: ${loadingElements}`)
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console errors detected:')
      consoleErrors.forEach(error => console.log(`  - ${error}`))
    }
    
    console.log('\n✅ Debug complete - check customizer-debug.png for visual state')
    
  } catch (error) {
    console.error('Debug error:', error)
  } finally {
    await browser.close()
  }
}

debugCustomizer()