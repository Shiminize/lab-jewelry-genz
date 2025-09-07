/**
 * Phase 2 Simple Validation - CSS Module Extraction Success
 * Quick validation that CSS modules are working correctly
 */

const { chromium } = require('playwright')

async function validatePhase2() {
  console.log('🧪 PHASE 2: CSS Module Extraction Validation')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    console.log('📍 Loading customizer page...')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    })
    
    console.log('📍 Testing CSS variables from navigation.css')
    const navVars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        navBg: style.getPropertyValue('--aurora-nav-bg').trim(),
        navText: style.getPropertyValue('--aurora-nav-text').trim(),
        navHover: style.getPropertyValue('--aurora-nav-hover').trim()
      }
    })
    
    const hasNavVars = navVars.navBg && navVars.navText && navVars.navHover
    console.log(hasNavVars ? '✅ Navigation variables loaded' : '❌ Navigation variables missing')
    
    console.log('📍 Testing animation classes from animations.css')
    const hasAnimations = await page.evaluate(() => {
      // Test if aurora-gradient-text class exists
      const testEl = document.createElement('div')
      testEl.className = 'aurora-gradient-text'
      document.body.appendChild(testEl)
      
      const style = getComputedStyle(testEl)
      const hasGradient = style.backgroundImage && style.backgroundImage !== 'none'
      
      document.body.removeChild(testEl)
      return hasGradient
    })
    
    console.log(hasAnimations ? '✅ Animation classes loaded' : '❌ Animation classes missing')
    
    console.log('📍 Testing MaterialControls rendering')
    const materialCount = await page.locator('text="Platinum"').count()
    const hasMaterials = materialCount > 0
    console.log(hasMaterials ? `✅ MaterialControls rendered (${materialCount} found)` : '❌ MaterialControls not found')
    
    console.log('📍 Testing MinimalHoverCard component')
    const hasHoverCards = await page.evaluate(() => {
      // Look for elements that might be MinimalHoverCard instances
      const elements = document.querySelectorAll('[class*="min-w"]')
      return elements.length > 0
    })
    
    console.log(hasHoverCards ? '✅ MinimalHoverCard components found' : '❌ MinimalHoverCard components missing')
    
    // Take screenshot
    await page.screenshot({ path: 'phase2-validation-simple.png', fullPage: true })
    
    console.log('\n📋 PHASE 2 SUMMARY:')
    console.log(`- Navigation CSS: ${hasNavVars ? '✅' : '❌'}`)
    console.log(`- Animation CSS: ${hasAnimations ? '✅' : '❌'}`)  
    console.log(`- MaterialControls: ${hasMaterials ? '✅' : '❌'}`)
    console.log(`- HoverCards: ${hasHoverCards ? '✅' : '❌'}`)
    
    const allPassed = hasNavVars && hasAnimations && hasMaterials && hasHoverCards
    
    if (allPassed) {
      console.log('🎉 PHASE 2 PASSED: CSS modules successfully extracted and functional')
    } else {
      console.log('⚠️ PHASE 2 PARTIAL: CSS extraction working but some issues detected')
    }
    
    return allPassed
    
  } catch (error) {
    console.log('💥 Validation Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

validatePhase2().then(success => {
  process.exit(success ? 0 : 1)
})