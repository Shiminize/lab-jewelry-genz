/**
 * Quick Material Selector Validation Test
 * Focused test for Phase 3 Material Selector Enhancements
 */

const { chromium } = require('playwright')

async function testMaterialSelector() {
  console.log('🧪 Quick Material Selector Enhancement Validation')
  console.log('='.repeat(50))
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Navigate to customizer
    console.log('📍 Navigating to customizer...')
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'domcontentloaded', timeout: 10000 })
    
    // Take initial screenshot
    await page.screenshot({ path: 'material-selector-initial.png', fullPage: false })
    console.log('📸 Initial screenshot taken')
    
    // Wait for and find material buttons
    console.log('🔍 Looking for material buttons...')
    await page.waitForTimeout(2000) // Wait for any dynamic content
    
    // Find material buttons using various selectors
    const materialButtons = await page.locator('button:has-text("18K"), button:has-text("Platinum"), button:has-text("Gold")').count()
    console.log(`✅ Found ${materialButtons} material buttons`)
    
    if (materialButtons > 0) {
      const firstButton = page.locator('button:has-text("18K"), button:has-text("Platinum"), button:has-text("Gold")').first()
      
      // Test 1: Hover Effect
      console.log('🎨 Testing hover brightness effect...')
      await firstButton.hover()
      await page.waitForTimeout(200)
      
      // Check if hover classes are applied
      const hasHoverClass = await firstButton.evaluate(el => {
        return el.classList.toString().includes('hover:brightness-[115%]')
      })
      console.log(`Hover effect class: ${hasHoverClass ? '✅ Present' : '⚠️ Not found'}`)
      
      // Test 2: Click Interaction
      console.log('🖱️ Testing click interaction...')
      const startTime = Date.now()
      await firstButton.click()
      const clickTime = Date.now() - startTime
      
      await page.waitForTimeout(300)
      console.log(`Click response time: ${clickTime}ms ${clickTime < 100 ? '✅' : '⚠️'}`)
      
      // Test 3: Selection State
      console.log('🎯 Checking selection state...')
      const hasSelection = await firstButton.evaluate(el => {
        const hasCheckmark = el.textContent?.includes('✓') || el.querySelector('[class*="check"]')
        const hasSelectedBorder = el.classList.toString().includes('border-2')
        const hasSelectedBg = el.classList.toString().includes('bg-[#6B46C1]')
        
        return hasCheckmark || hasSelectedBorder || hasSelectedBg
      })
      console.log(`Selection indicator: ${hasSelection ? '✅ Present' : '⚠️ Not visible'}`)
      
      // Test 4: Aurora Border Radius
      console.log('📐 Checking Aurora border radius compliance...')
      const borderRadius = await firstButton.evaluate(el => {
        return window.getComputedStyle(el).borderRadius
      })
      const isCompliant = borderRadius === '8px' || borderRadius === '0.5rem'
      console.log(`Border radius: ${borderRadius} ${isCompliant ? '✅' : '⚠️'}`)
      
      // Take final screenshot
      await page.screenshot({ path: 'material-selector-final.png', fullPage: false })
      console.log('📸 Final screenshot taken')
      
      // Summary
      console.log('\n' + '='.repeat(50))
      console.log('📊 VALIDATION SUMMARY')
      console.log('='.repeat(50))
      console.log(`✅ Material buttons found: ${materialButtons}`)
      console.log(`${hasHoverClass ? '✅' : '⚠️'} Hover brightness effect`)
      console.log(`${clickTime < 100 ? '✅' : '⚠️'} Click response time (${clickTime}ms)`)
      console.log(`${hasSelection ? '✅' : '⚠️'} Selection state indicator`)
      console.log(`${isCompliant ? '✅' : '⚠️'} Aurora border radius (${borderRadius})`)
      
      const passCount = [hasHoverClass, clickTime < 100, hasSelection, isCompliant].filter(Boolean).length
      console.log(`\n🎯 Overall: ${passCount}/4 tests passed`)
      
      if (passCount >= 3) {
        console.log('🎉 Material selector enhancements successfully validated!')
      } else {
        console.log('⚠️ Some enhancements may need attention')
      }
      
    } else {
      console.log('❌ No material buttons found - component may not be loading')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'material-selector-error.png', fullPage: true })
    console.log('📸 Error screenshot saved')
  } finally {
    await browser.close()
  }
}

// Run the test
testMaterialSelector().catch(console.error)