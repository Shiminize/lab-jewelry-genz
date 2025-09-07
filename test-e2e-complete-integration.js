/**
 * Comprehensive E2E Integration Test
 * Validates MinimalHoverCard, MaterialControls, and overall customizer functionality
 */

const { test, expect, chromium } = require('@playwright/test')

async function runCompleteIntegrationTest() {
  console.log('🧪 COMPLETE E2E INTEGRATION TEST')
  console.log('='.repeat(60))
  console.log('Testing all components work together after MinimalHoverCard implementation')
  console.log('')
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // Collect console logs and errors
  const consoleLogs = []
  const consoleErrors = []
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    } else {
      consoleLogs.push({ type: msg.type(), text: msg.text() })
    }
  })
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message)
  })
  
  const testResults = {
    pageLoad: false,
    componentsFound: {},
    hoverEffects: {},
    interactions: {},
    performance: {},
    errors: []
  }
  
  try {
    // Test 1: Page Load and Initial Render
    console.log('📍 Test 1: Page Load and Initial Render')
    console.log('-'.repeat(40))
    
    const loadStartTime = Date.now()
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    const loadTime = Date.now() - loadStartTime
    
    testResults.pageLoad = true
    testResults.performance.pageLoadTime = loadTime
    console.log(`✅ Page loaded in ${loadTime}ms`)
    
    // Wait for dynamic imports to complete
    await page.waitForTimeout(3000)
    
    // Take initial screenshot
    await page.screenshot({ path: 'e2e-initial-load.png' })
    console.log('📸 Screenshot: e2e-initial-load.png')
    
    // Test 2: Component Detection
    console.log('\n📦 Test 2: Component Detection')
    console.log('-'.repeat(40))
    
    // Check for MinimalHoverCard components
    const minimalHoverCards = await page.locator('[class*="min-w-\\[140px\\]"]').count()
    testResults.componentsFound.minimalHoverCards = minimalHoverCards
    console.log(`MinimalHoverCard components: ${minimalHoverCards > 0 ? '✅' : '❌'} (${minimalHoverCards} found)`)
    
    // Check for MaterialControls container
    const materialControls = await page.locator('[class*="flex-wrap"][class*="gap-3"][class*="justify-center"]').count()
    testResults.componentsFound.materialControls = materialControls
    console.log(`MaterialControls container: ${materialControls > 0 ? '✅' : '❌'} (${materialControls} found)`)
    
    // Check for ImageViewer
    const imageViewer = await page.locator('[class*="aspect-square"]').count()
    testResults.componentsFound.imageViewer = imageViewer
    console.log(`ImageViewer component: ${imageViewer > 0 ? '✅' : '❌'} (${imageViewer} found)`)
    
    // Check if old MaterialTagChip is still present (should not be in MaterialControls)
    const oldMaterialTags = await page.locator('[class*="MaterialTagChip"]').count()
    testResults.componentsFound.oldMaterialTags = oldMaterialTags
    console.log(`Old MaterialTagChip in controls: ${oldMaterialTags === 0 ? '✅ Not present (good)' : '⚠️ Still present'}`)
    
    // Test 3: Hover Effects Validation
    console.log('\n🎨 Test 3: Hover Effects Validation')
    console.log('-'.repeat(40))
    
    if (minimalHoverCards > 0) {
      const firstCard = page.locator('[class*="min-w-\\[140px\\]"]').first()
      
      // Get initial styles
      const initialStyles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          filter: computed.filter,
          transform: computed.transform,
          boxShadow: computed.boxShadow,
          background: computed.background
        }
      })
      
      console.log('Initial state captured')
      
      // Trigger hover
      await firstCard.hover()
      await page.waitForTimeout(350) // Wait for 0.3s transition
      
      // Get hover styles
      const hoverStyles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          filter: computed.filter,
          transform: computed.transform,
          boxShadow: computed.boxShadow,
          background: computed.background
        }
      })
      
      // Check for brightness enhancement
      testResults.hoverEffects.brightnessApplied = 
        hoverStyles.filter.includes('brightness') && hoverStyles.filter.includes('1.15')
      console.log(`Brightness +15%: ${testResults.hoverEffects.brightnessApplied ? '✅' : '❌'} (${hoverStyles.filter})`)
      
      // Check for glow shadow
      testResults.hoverEffects.glowShadow = 
        hoverStyles.boxShadow !== initialStyles.boxShadow && 
        hoverStyles.boxShadow.includes('60px')
      console.log(`Glow shadow (60px): ${testResults.hoverEffects.glowShadow ? '✅' : '❌'}`)
      
      // Check for scale transform
      testResults.hoverEffects.scaleTransform = 
        hoverStyles.transform !== initialStyles.transform
      console.log(`Scale transform: ${testResults.hoverEffects.scaleTransform ? '✅' : '❌'}`)
      
      // Take hover screenshot
      await page.screenshot({ path: 'e2e-hover-state.png' })
      console.log('📸 Screenshot: e2e-hover-state.png')
      
      // Reset hover
      await page.mouse.move(0, 0)
      await page.waitForTimeout(350)
    }
    
    // Test 4: Click Interactions
    console.log('\n🖱️ Test 4: Click Interactions')
    console.log('-'.repeat(40))
    
    if (minimalHoverCards > 0) {
      // Test each material button
      const materials = ['Platinum', '18K Rose Gold', '18K White Gold', '18K Yellow Gold']
      
      for (let i = 0; i < Math.min(minimalHoverCards, materials.length); i++) {
        const materialCard = page.locator('[class*="min-w-\\[140px\\]"]').nth(i)
        const materialText = await materialCard.textContent()
        
        console.log(`Testing material: ${materialText}`)
        
        // Measure click performance
        const clickStartTime = Date.now()
        await materialCard.click()
        const clickTime = Date.now() - clickStartTime
        
        testResults.interactions[`material_${i}_clickTime`] = clickTime
        console.log(`  Click time: ${clickTime}ms ${clickTime < 100 ? '✅' : '⚠️'}`)
        
        // Wait for selection state
        await page.waitForTimeout(200)
        
        // Check for selection indicators
        const selectionState = await materialCard.evaluate(el => {
          const hasCheckmark = el.querySelector('[class*="absolute"][class*="top-2"]') !== null
          const hasRing = el.className.includes('ring-1') || window.getComputedStyle(el).boxShadow.includes('purple')
          const hasBackground = window.getComputedStyle(el).background.includes('purple')
          return { hasCheckmark, hasRing, hasBackground }
        })
        
        testResults.interactions[`material_${i}_selected`] = 
          selectionState.hasCheckmark || selectionState.hasRing || selectionState.hasBackground
        
        console.log(`  Selection state: ${testResults.interactions[`material_${i}_selected`] ? '✅' : '⚠️'}`)
      }
      
      // Take screenshot with selection
      await page.screenshot({ path: 'e2e-selection-state.png' })
      console.log('📸 Screenshot: e2e-selection-state.png')
    }
    
    // Test 5: Performance Metrics
    console.log('\n⚡ Test 5: Performance Metrics')
    console.log('-'.repeat(40))
    
    // Check for performance logs in console
    const performanceLogs = consoleLogs.filter(log => 
      log.text.includes('[MATERIAL SWITCH]')
    )
    
    testResults.performance.materialSwitchLogs = performanceLogs.length
    console.log(`Material switch logs found: ${performanceLogs.length}`)
    
    if (performanceLogs.length > 0) {
      performanceLogs.forEach(log => {
        const match = log.text.match(/(\d+\.?\d*)ms/)
        if (match) {
          const time = parseFloat(match[1])
          console.log(`  Switch time: ${time}ms ${time < 100 ? '✅' : '⚠️'}`)
        }
      })
    }
    
    // Get memory usage
    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        }
      }
      return null
    })
    
    if (memoryUsage) {
      testResults.performance.memoryUsage = memoryUsage
      console.log(`Memory usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB`)
    }
    
    // Test 6: Error Detection
    console.log('\n🔍 Test 6: Error Detection')
    console.log('-'.repeat(40))
    
    testResults.errors = consoleErrors
    
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected')
    } else {
      console.log(`❌ ${consoleErrors.length} errors found:`)
      consoleErrors.slice(0, 5).forEach(error => {
        console.log(`  - ${error.substring(0, 100)}...`)
      })
    }
    
    // Test 7: Responsive Design
    console.log('\n📱 Test 7: Responsive Design')
    console.log('-'.repeat(40))
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    const mobileCarousel = await page.locator('[class*="MaterialCarousel"]').count()
    testResults.componentsFound.mobileCarousel = mobileCarousel
    console.log(`Mobile carousel (< lg): ${mobileCarousel > 0 ? '✅' : '⚠️'} Present`)
    
    await page.screenshot({ path: 'e2e-mobile-view.png' })
    console.log('📸 Screenshot: e2e-mobile-view.png')
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    const desktopControls = await page.locator('[class*="hidden"][class*="lg:block"]').count()
    testResults.componentsFound.desktopControls = desktopControls
    console.log(`Desktop controls (hidden lg:block): ${desktopControls > 0 ? '✅' : '⚠️'} Present`)
    
    // Final Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 E2E INTEGRATION TEST SUMMARY')
    console.log('='.repeat(60))
    
    // Calculate success metrics
    const componentTests = Object.values(testResults.componentsFound).filter(v => v > 0).length
    const totalComponentTests = Object.keys(testResults.componentsFound).length - 1 // Exclude oldMaterialTags
    
    const hoverTests = Object.values(testResults.hoverEffects).filter(Boolean).length
    const totalHoverTests = Object.keys(testResults.hoverEffects).length
    
    const interactionTests = Object.entries(testResults.interactions)
      .filter(([key, value]) => key.includes('selected') ? value : value < 100).length
    const totalInteractionTests = Object.keys(testResults.interactions).length
    
    console.log('\n✅ Successes:')
    console.log(`  - Page Load: ${testResults.pageLoad ? 'PASS' : 'FAIL'} (${testResults.performance.pageLoadTime}ms)`)
    console.log(`  - Components: ${componentTests}/${totalComponentTests} detected`)
    console.log(`  - Hover Effects: ${hoverTests}/${totalHoverTests} working`)
    console.log(`  - Interactions: ${interactionTests}/${totalInteractionTests} responsive`)
    console.log(`  - Errors: ${testResults.errors.length === 0 ? 'None' : testResults.errors.length + ' found'}`)
    
    const overallScore = 
      (testResults.pageLoad ? 1 : 0) +
      (componentTests / totalComponentTests) +
      (hoverTests / totalHoverTests) +
      (interactionTests / totalInteractionTests) +
      (testResults.errors.length === 0 ? 1 : 0)
    
    const percentage = Math.round((overallScore / 5) * 100)
    
    console.log(`\n🎯 Overall Integration Score: ${percentage}%`)
    
    if (percentage >= 80) {
      console.log('🎉 E2E Integration Test PASSED - Components working together successfully!')
    } else if (percentage >= 60) {
      console.log('⚠️ E2E Integration Test PARTIAL - Some components need attention')
    } else {
      console.log('❌ E2E Integration Test FAILED - Major issues detected')
    }
    
    // Save detailed report
    const fs = require('fs').promises
    await fs.writeFile('e2e-test-report.json', JSON.stringify(testResults, null, 2))
    console.log('\n📄 Detailed report saved to e2e-test-report.json')
    
  } catch (error) {
    console.error('\n❌ E2E Test Failed with Error:')
    console.error(error.message)
    await page.screenshot({ path: 'e2e-error-state.png', fullPage: true })
    console.log('📸 Error screenshot: e2e-error-state.png')
  } finally {
    await browser.close()
  }
}

// Run the complete integration test
runCompleteIntegrationTest().catch(console.error)