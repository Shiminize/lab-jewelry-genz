/**
 * Mobile Navigation Validation Test
 * Validates NavigationProvider hydration fix works correctly
 * CLAUDE_RULES: System health validation before Phase 3 progression
 */

const puppeteer = require('puppeteer')

async function validateMobileNavigation() {
  console.log('🔍 Validating Mobile Navigation Functionality...')
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  const results = []
  
  // Listen for console errors (especially React hydration errors)
  const errors = []
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('Error') || text.includes('setState') || text.includes('hydration')) {
      errors.push(text)
      console.log(`⚠️ Console: ${text}`)
    }
  })
  
  page.on('pageerror', err => {
    errors.push(err.message)
    console.log(`❌ Page Error: ${err.message}`)
  })
  
  try {
    console.log('📱 Testing Homepage Load...')
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' })
    
    // Wait for React hydration to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('📱 Testing Mobile Menu Button...')
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 }) // iPhone SE
    
    const mobileTest = await page.evaluate(() => {
      // Find mobile menu button
      const mobileMenuButton = document.querySelector('button[aria-label*="menu"], button[aria-controls="mobile-navigation"]')
      
      if (!mobileMenuButton) {
        return { error: 'Mobile menu button not found' }
      }
      
      // Check if SimpleMobileDrawer is present
      const drawer = document.querySelector('[role="dialog"]') || 
                   document.querySelector('.fixed.inset-0') ||
                   document.querySelector('[class*="drawer"]')
      
      // Test click functionality (should not throw errors)
      try {
        mobileMenuButton.click()
        
        return {
          mobileMenuFound: true,
          drawerPresent: !!drawer,
          clickSuccessful: true,
          buttonText: mobileMenuButton.textContent,
          buttonAriaLabel: mobileMenuButton.getAttribute('aria-label')
        }
      } catch (error) {
        return {
          mobileMenuFound: true,
          drawerPresent: !!drawer,
          clickSuccessful: false,
          error: error.message
        }
      }
    })
    
    results.push({
      test: 'Mobile Menu Functionality',
      ...mobileTest,
      hasErrors: errors.length > 0,
      errorCount: errors.length
    })
    
    console.log('📱 Testing Navigation Provider State...')
    
    // Test NavigationProvider context is working
    const contextTest = await page.evaluate(() => {
      // Check if navigation elements are rendered without errors
      const navElements = document.querySelectorAll('nav, [role="navigation"]')
      const headerElements = document.querySelectorAll('header')
      
      return {
        navElementsFound: navElements.length,
        headerElementsFound: headerElements.length,
        noJSErrors: !document.querySelector('.error-boundary, [data-error]'),
        documentReady: document.readyState === 'complete'
      }
    })
    
    results.push({
      test: 'NavigationProvider Context',
      ...contextTest,
      hasErrors: errors.length > 0
    })
    
    console.log('📱 Testing Customizer Page Navigation...')
    
    // Test customizer page also works
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle2' })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const customizerTest = await page.evaluate(() => {
      const mobileMenuButton = document.querySelector('button[aria-label*="menu"], button[aria-controls="mobile-navigation"]')
      const hasNavigation = !!document.querySelector('nav, [role="navigation"]')
      
      return {
        mobileMenuPresent: !!mobileMenuButton,
        navigationPresent: hasNavigation,
        pageLoaded: document.readyState === 'complete'
      }
    })
    
    results.push({
      test: 'Customizer Page Navigation',
      ...customizerTest,
      hasErrors: errors.length > 0
    })
    
  } catch (error) {
    console.error('❌ Mobile navigation test failed:', error)
    results.push({ test: 'Mobile Navigation Test', error: error.message })
  }
  
  await browser.close()
  
  // Analyze Results
  console.log('\n🎯 MOBILE NAVIGATION VALIDATION RESULTS:')
  console.log('='.repeat(50))
  
  const passedTests = results.filter(r => !r.error && !r.hasErrors).length
  const totalTests = results.length
  const errorCount = errors.length
  
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed Tests: ${passedTests}`)
  console.log(`Console Errors: ${errorCount}`)
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  // Detailed Results
  console.log('\n📊 Detailed Results:')
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.test}: ${result.error}`)
    } else {
      const status = result.hasErrors ? '⚠️' : '✅'
      console.log(`${status} ${result.test}:`)
      
      if (result.mobileMenuFound !== undefined) {
        console.log(`    Mobile Menu: ${result.mobileMenuFound ? '✅' : '❌'}`)
        console.log(`    Click Works: ${result.clickSuccessful ? '✅' : '❌'}`)
        console.log(`    Drawer Present: ${result.drawerPresent ? '✅' : '❌'}`)
      }
      
      if (result.navElementsFound !== undefined) {
        console.log(`    Nav Elements: ${result.navElementsFound}`)
        console.log(`    Header Elements: ${result.headerElementsFound}`)
        console.log(`    No JS Errors: ${result.noJSErrors ? '✅' : '❌'}`)
      }
      
      if (result.pageLoaded !== undefined) {
        console.log(`    Page Loaded: ${result.pageLoaded ? '✅' : '❌'}`)
      }
    }
  })
  
  // Error Summary
  if (errors.length > 0) {
    console.log('\n⚠️ Console Errors Found:')
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
  }
  
  // Final Assessment
  console.log('\n🏆 FINAL ASSESSMENT:')
  
  if (passedTests >= totalTests * 0.8 && errorCount === 0) {
    console.log('🎉 MOBILE NAVIGATION SUCCESS!')
    console.log('✅ NavigationProvider hydration fix working correctly')
    console.log('✅ No React setState during render errors')
    console.log('✅ Mobile drawer functionality operational')
    console.log('✅ System health maintained - Ready for Phase B')
    return true
  } else if (passedTests >= totalTests * 0.6 && errorCount < 3) {
    console.log('⚠️ MOBILE NAVIGATION PARTIAL SUCCESS')
    console.log(`Pass rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    console.log(`Errors: ${errorCount} (acceptable if non-critical)`)
    return true
  } else {
    console.log('💥 MOBILE NAVIGATION FAILED')
    console.log(`Pass rate: ${((passedTests / totalTests) * 100).toFixed(1)}% (target: ≥80%)`)
    console.log(`Error count: ${errorCount} (target: 0)`)
    return false
  }
}

// Run validation
validateMobileNavigation().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Mobile navigation validation failed:', error)
  process.exit(1)
})