/**
 * Material Selector Visual Check
 * Debug test to understand the current page structure
 */

const { chromium } = require('playwright')

async function debugMaterialSelector() {
  console.log('🔍 Material Selector Debug Check')
  console.log('='.repeat(40))
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 })
  const page = await browser.newPage()
  
  try {
    console.log('📍 Navigating to customizer...')
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle', timeout: 15000 })
    
    // Wait for page to settle
    await page.waitForTimeout(3000)
    
    // Take full page screenshot to see current state
    await page.screenshot({ path: 'customizer-debug-full.png', fullPage: true })
    console.log('📸 Full page screenshot saved as customizer-debug-full.png')
    
    // Check for any buttons with material-related text
    console.log('🔍 Searching for material-related buttons...')
    
    const materialButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const materialKeywords = ['18K', 'Platinum', 'Gold', 'Rose', 'White', 'Yellow']
      
      const foundButtons = []
      buttons.forEach((btn, index) => {
        const text = btn.textContent || ''
        const hasKeyword = materialKeywords.some(keyword => text.includes(keyword))
        
        if (hasKeyword || btn.getAttribute('data-material')) {
          const rect = btn.getBoundingClientRect()
          foundButtons.push({
            index,
            text: text.trim(),
            visible: rect.width > 0 && rect.height > 0,
            className: btn.className,
            dataMaterial: btn.getAttribute('data-material'),
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          })
        }
      })
      
      return foundButtons
    })
    
    console.log(`Found ${materialButtons.length} material-related buttons:`)
    materialButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}" - Visible: ${btn.visible}`)
      console.log(`     Position: ${btn.position.width}x${btn.position.height} at (${btn.position.left}, ${btn.position.top})`)
      console.log(`     Classes: ${btn.className}`)
      if (btn.dataMaterial) console.log(`     Data-material: ${btn.dataMaterial}`)
    })
    
    // Check for ProductCustomizer component
    console.log('\n🔍 Looking for ProductCustomizer component...')
    const customizerComponent = await page.evaluate(() => {
      const customizer = document.querySelector('[data-testid="product-customizer"]')
      const materialSwitcher = document.querySelector('[data-testid="material-switcher"]')
      const anyCustomizer = document.querySelector('[class*="customizer"]')
      
      return {
        hasProductCustomizer: !!customizer,
        hasMaterialSwitcher: !!materialSwitcher,
        hasAnyCustomizer: !!anyCustomizer,
        customizerClasses: customizer?.className || 'not found',
        switcherClasses: materialSwitcher?.className || 'not found'
      }
    })
    
    console.log('ProductCustomizer info:')
    Object.entries(customizerComponent).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })
    
    // Look for any errors in console
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    if (logs.length > 0) {
      console.log('\n❌ Console errors found:')
      logs.forEach(log => console.log(`  - ${log}`))
    } else {
      console.log('\n✅ No console errors detected')
    }
    
    // Try to scroll to find material buttons
    if (materialButtons.length > 0) {
      console.log('\n📜 Attempting to scroll to material buttons...')
      const firstVisibleButton = materialButtons.find(btn => btn.visible)
      
      if (firstVisibleButton) {
        console.log(`Found visible button: "${firstVisibleButton.text}"`)
        // Try to click it
        const buttonSelector = `button:has-text("${firstVisibleButton.text}")`
        try {
          await page.locator(buttonSelector).click({ timeout: 5000 })
          console.log('✅ Successfully clicked material button')
        } catch (error) {
          console.log(`⚠️ Could not click button: ${error.message}`)
        }
      } else {
        console.log('⚠️ No visible material buttons found')
      }
    }
    
    console.log('\n🎉 Debug check completed')
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    await page.screenshot({ path: 'customizer-debug-error.png', fullPage: true })
  } finally {
    // Keep browser open for manual inspection
    console.log('\n👀 Browser kept open for manual inspection')
    console.log('Press Ctrl+C to close')
    
    // Wait indefinitely until manual close
    await new Promise(() => {})
  }
}

// Run the debug
debugMaterialSelector().catch(console.error)