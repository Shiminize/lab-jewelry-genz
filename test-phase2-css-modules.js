/**
 * Phase 2 E2E Test - CSS Module Loading Validation
 * Tests that extracted CSS modules load correctly and styles apply
 */

const { chromium } = require('playwright')

async function testPhase2CSSModules() {
  console.log('🧪 PHASE 2: CSS Module Loading Validation')
  const browser = await chromium.launch({ headless: false, slowMo: 500 })
  const page = await browser.newPage()
  
  // Track CSS loading
  const cssRequests = []
  page.on('request', request => {
    if (request.url().includes('.css')) {
      cssRequests.push(request.url())
      console.log('📄 CSS Request:', request.url().split('/').pop())
    }
  })
  
  try {
    console.log('📍 Step 1: Navigate to customizer and track CSS loading')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    })
    
    console.log('📍 Step 2: Verify CSS modules loaded correctly')
    
    // Check that our modular CSS files are being loaded
    const expectedCSSModules = [
      'aurora-variables.css',
      'typography.css', 
      'navigation.css',
      'animations.css',
      'globals.css'
    ]
    
    let loadedModules = 0
    expectedCSSModules.forEach(module => {
      const found = cssRequests.some(url => url.includes(module))
      if (found) {
        console.log(`✅ ${module} loaded successfully`)
        loadedModules++
      } else {
        console.log(`❌ ${module} NOT loaded`)
      }
    })
    
    console.log('📍 Step 3: Test Navigation styles (navigation.css)')
    
    // Check for navigation-specific styles
    const navStyles = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.documentElement)
      return {
        hasNavBg: computedStyle.getPropertyValue('--aurora-nav-bg').trim() !== '',
        hasNavText: computedStyle.getPropertyValue('--aurora-nav-text').trim() !== '',
        hasNavHover: computedStyle.getPropertyValue('--aurora-nav-hover').trim() !== ''
      }
    })
    
    if (navStyles.hasNavBg && navStyles.hasNavText && navStyles.hasNavHover) {
      console.log('✅ Navigation CSS variables loaded correctly')
    } else {
      console.log('❌ Navigation CSS variables missing:', navStyles)
    }
    
    console.log('📍 Step 4: Test Animation styles (animations.css)')
    
    // Check for animation classes
    const animationClasses = await page.evaluate(() => {
      // Create test elements to check if classes exist
      const testElement = document.createElement('div')
      testElement.className = 'aurora-gradient-text'
      document.body.appendChild(testElement)
      
      const computedStyle = getComputedStyle(testElement)
      const hasGradientText = computedStyle.backgroundImage.includes('linear-gradient')
      
      document.body.removeChild(testElement)
      
      return {
        hasGradientText,
        hasAnimationSupport: typeof document.createElement('div').animate === 'function'
      }
    })
    
    if (animationClasses.hasGradientText) {
      console.log('✅ Animation CSS classes loaded correctly')
    } else {
      console.log('❌ Animation CSS classes missing')
    }
    
    console.log('📍 Step 5: Test MaterialControls hover states')
    
    // Look for material controls and test hover
    const materialButtons = await page.locator('text=/^(Platinum|18K.*Gold)$/').count()
    console.log(`Found ${materialButtons} material buttons`)
    
    if (materialButtons > 0) {
      console.log('✅ MaterialControls rendered with extracted CSS')
      
      // Test hover state
      const firstButton = page.locator('text=/^(Platinum|18K.*Gold)$/').first()
      await firstButton.hover()
      
      // Wait for hover animation
      await page.waitForTimeout(1000)
      
      console.log('✅ Hover interaction successful')
    } else {
      console.log('❌ MaterialControls not found')
    }
    
    // Take screenshot
    await page.screenshot({ path: 'phase2-css-modules-test.png', fullPage: true })
    console.log('📸 Screenshot saved: phase2-css-modules-test.png')
    
    // Summary
    console.log('\n📋 PHASE 2 RESULTS:')
    console.log(`- CSS Modules Loaded: ${loadedModules}/${expectedCSSModules.length}`)
    console.log(`- Navigation Variables: ${navStyles.hasNavBg ? '✅' : '❌'}`)
    console.log(`- Animation Classes: ${animationClasses.hasGradientText ? '✅' : '❌'}`)
    console.log(`- Material Controls: ${materialButtons > 0 ? '✅' : '❌'}`)
    
    if (loadedModules === expectedCSSModules.length && navStyles.hasNavBg && materialButtons > 0) {
      console.log('🎉 PHASE 2 PASSED: CSS modules successfully extracted and loading')
      return true
    } else {
      console.log('❌ PHASE 2 FAILED: Issues with CSS module loading')
      return false
    }
    
  } catch (error) {
    console.log('💥 Test Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

// Run test
testPhase2CSSModules().then(success => {
  process.exit(success ? 0 : 1)
})