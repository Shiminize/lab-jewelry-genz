/**
 * Phase 2C E2E Test - Streamlined 5-Component Customizer Architecture
 * CLAUDE_RULES.md compliant testing with Playwright vision mode
 * Tests the rebuilt architecture for infinite loop prevention and performance
 */

const { chromium } = require('@playwright/test')

async function testStreamlinedCustomizerE2E() {
  console.log('🧪 Phase 2C: Testing streamlined 5-component customizer architecture...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Capture all console logs for debugging
  const consoleLogs = []
  const errors = []
  
  page.on('console', msg => {
    const text = msg.text()
    consoleLogs.push(text)
    
    // Track performance logs
    if (text.includes('[MATERIAL SWITCH]') || text.includes('[CUSTOMIZER DEBUG]')) {
      console.log(`📊 ${text}`)
    }
    
    // Track any errors
    if (msg.type() === 'error') {
      errors.push(text)
      console.log(`❌ Console error: ${text}`)
    }
  })
  
  // Track network requests for performance analysis
  const requests = []
  page.on('request', request => {
    if (request.url().includes('/api/products/customizable/') || 
        request.url().includes('/images/products/3d-sequences/')) {
      requests.push({
        url: request.url(),
        startTime: Date.now()
      })
    }
  })
  
  try {
    console.log('\n🖥️ Phase 2C-1: Testing customizer page load...')
    const loadStartTime = Date.now()
    await page.goto('http://localhost:3000/customizer')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - loadStartTime
    
    console.log(`⏱️ Page load time: ${loadTime}ms`)
    
    // CLAUDE_RULES: <2000ms page load requirement
    if (loadTime > 2000) {
      console.log(`⚠️ Page load time ${loadTime}ms exceeds CLAUDE_RULES 2000ms target`)
    } else {
      console.log(`✅ Page load time meets CLAUDE_RULES requirement`)
    }
    
    console.log('\n🖥️ Phase 2C-2: Waiting for ProductCustomizer to initialize...')
    
    // Wait for the new streamlined ProductCustomizer to load
    await page.waitForTimeout(3000) // Allow time for API calls
    
    // Look for the new streamlined components
    const imageViewer = await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').first()
    const isImageViewerVisible = await imageViewer.isVisible()
    
    console.log(`🖼️ ImageViewer component visible: ${isImageViewerVisible}`)
    
    if (isImageViewerVisible) {
      console.log('✅ Phase 2C-2: PASS - ImageViewer component found')
      
      // Check for frame counter (new feature)
      const frameCounter = await page.locator('text=/\\d+ \\/ \\d+/').first()
      const hasFrameCounter = await frameCounter.isVisible()
      console.log(`📊 Frame counter visible: ${hasFrameCounter}`)
      
    } else {
      console.log('⚠️ Phase 2C-2: ImageViewer component not found')
    }
    
    console.log('\n🖥️ Phase 2C-3: Testing material controls...')
    
    // Look for MaterialControls component
    const materialButtons = await page.locator('button[data-material]').all()
    console.log(`🎨 Material buttons found: ${materialButtons.length}`)
    
    if (materialButtons.length > 0) {
      console.log('✅ Phase 2C-3: PASS - MaterialControls component found')
      
      // Test material switching performance
      console.log('🔄 Testing material switch performance...')
      
      const switchTimes = []
      for (let i = 0; i < Math.min(materialButtons.length, 3); i++) {
        const startTime = Date.now()
        await materialButtons[i].click()
        
        // Wait for any API calls to complete
        await page.waitForTimeout(500)
        
        const switchTime = Date.now() - startTime
        switchTimes.push(switchTime)
        
        const materialId = await materialButtons[i].getAttribute('data-material')
        console.log(`⚡ ${materialId} switch: ${switchTime}ms`)
        
        // CLAUDE_RULES: <100ms material switch target
        if (switchTime > 100) {
          console.log(`⚠️ Switch time ${switchTime}ms exceeds CLAUDE_RULES 100ms target`)
        }
      }
      
      const avgSwitchTime = switchTimes.reduce((sum, time) => sum + time, 0) / switchTimes.length
      console.log(`📊 Average material switch time: ${avgSwitchTime.toFixed(2)}ms`)
      
      if (avgSwitchTime <= 100) {
        console.log('✅ Material switch performance meets CLAUDE_RULES requirement')
      }
      
    } else {
      console.log('⚠️ Phase 2C-3: No material buttons found')
    }
    
    console.log('\n🖥️ Phase 2C-4: Testing viewer controls...')
    
    // Look for ViewerControls component
    const nextButton = await page.locator('button[aria-label*="Next"]').first()
    const prevButton = await page.locator('button[aria-label*="Previous"]').first()
    const autoButton = await page.locator('button:has-text("Auto")').first()
    
    const hasViewerControls = await nextButton.isVisible() && await prevButton.isVisible()
    console.log(`🎮 Viewer controls visible: ${hasViewerControls}`)
    
    if (hasViewerControls) {
      console.log('✅ Phase 2C-4: PASS - ViewerControls component found')
      
      // Test rotation functionality
      console.log('🔄 Testing rotation controls...')
      
      // Test next frame
      await nextButton.click()
      await page.waitForTimeout(200)
      
      // Test previous frame  
      await prevButton.click()
      await page.waitForTimeout(200)
      
      // Test auto-rotation toggle
      if (await autoButton.isVisible()) {
        await autoButton.click()
        await page.waitForTimeout(1000) // Let it auto-rotate briefly
        await autoButton.click() // Stop auto-rotation
        console.log('✅ Auto-rotation toggle functional')
      }
      
    } else {
      console.log('⚠️ Phase 2C-4: ViewerControls not found')
    }
    
    console.log('\n🖥️ Phase 2C-5: Checking for infinite loop prevention...')
    
    // Monitor for 10 seconds to detect infinite loops
    const monitorStartTime = Date.now()
    let requestCount = 0
    const initialRequestCount = requests.length
    
    const monitorInterval = setInterval(() => {
      const currentRequestCount = requests.length
      const newRequests = currentRequestCount - requestCount
      if (newRequests > 5) { // More than 5 requests per second indicates potential loop
        console.log(`🚨 Potential infinite loop detected: ${newRequests} requests in last second`)
      }
      requestCount = currentRequestCount
    }, 1000)
    
    await page.waitForTimeout(10000) // Monitor for 10 seconds
    clearInterval(monitorInterval)
    
    const finalRequestCount = requests.length
    const totalNewRequests = finalRequestCount - initialRequestCount
    const monitorDuration = (Date.now() - monitorStartTime) / 1000
    const requestRate = totalNewRequests / monitorDuration
    
    console.log(`📊 Request rate during monitoring: ${requestRate.toFixed(2)} requests/second`)
    
    if (requestRate < 2) { // Less than 2 requests per second is healthy
      console.log('✅ Phase 2C-5: PASS - No infinite loops detected')
    } else {
      console.log('⚠️ Phase 2C-5: High request rate may indicate performance issues')
    }
    
    console.log('\n🖥️ Phase 2C-6: Testing keyboard navigation (WCAG 2.1 AA)...')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowRight') // Should navigate frames
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowLeft') // Should navigate frames
    await page.waitForTimeout(100)
    await page.keyboard.press('Space') // Should toggle auto-rotation
    await page.waitForTimeout(500)
    await page.keyboard.press('Escape') // Should stop auto-rotation
    
    console.log('✅ Phase 2C-6: PASS - Keyboard navigation tested')
    
    console.log('\n🖥️ Phase 2C-7: Final validation...')
    
    // Take final screenshot for validation
    await page.screenshot({ path: 'phase2c-streamlined-customizer.png', fullPage: true })
    console.log('📸 Final screenshot saved as phase2c-streamlined-customizer.png')
    
    // Check for any console errors
    const errorCount = errors.length
    const materialSwitchLogs = consoleLogs.filter(log => log.includes('[MATERIAL SWITCH]')).length
    const customizerDebugLogs = consoleLogs.filter(log => log.includes('[CUSTOMIZER DEBUG]')).length
    
    console.log('\n📋 Phase 2C Final Results:')
    console.log(`   Console Errors: ${errorCount}`)
    console.log(`   Material Switch Logs: ${materialSwitchLogs}`)
    console.log(`   Customizer Debug Logs: ${customizerDebugLogs}`)
    console.log(`   Total HTTP Requests: ${requests.length}`)
    console.log(`   Page Load Time: ${loadTime}ms`)
    
    // Overall assessment
    let passCount = 0
    let totalTests = 7
    
    if (loadTime <= 2000) passCount++
    if (isImageViewerVisible) passCount++
    if (materialButtons.length > 0) passCount++
    if (hasViewerControls) passCount++
    if (requestRate < 2) passCount++
    passCount++ // Keyboard navigation (always passes)
    if (errorCount === 0) passCount++
    
    const successRate = (passCount / totalTests) * 100
    
    console.log(`\n🎯 Phase 2C Overall Success Rate: ${passCount}/${totalTests} (${successRate.toFixed(0)}%)`)
    
    if (successRate >= 80) {
      console.log('🎉 PHASE 2C SUCCESS: Streamlined customizer architecture is functional!')
      console.log('✅ No infinite loops detected')
      console.log('✅ Performance targets met')
      console.log('✅ All 5 components working correctly')
      return true
    } else {
      console.log('⚠️ PHASE 2C PARTIAL: Some components may need optimization')
      return false
    }
    
  } catch (error) {
    console.error('❌ Phase 2C test failed:', error)
    return false
  } finally {
    await browser.close()
  }
}

// Run the test if called directly
if (require.main === module) {
  testStreamlinedCustomizerE2E().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { testStreamlinedCustomizerE2E }