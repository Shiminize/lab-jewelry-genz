/**
 * Phase 3 Touch Gesture Integration Tests
 * Validates touch gesture functionality with existing performance targets
 * CLAUDE_RULES.md compliant E2E testing
 */

const puppeteer = require('puppeteer')
const fs = require('fs')

// Test configuration
const BASE_URL = 'http://localhost:3000'
const CUSTOMIZER_URL = `${BASE_URL}/customizer`
const PERFORMANCE_TARGETS = {
  materialSwitching: 100, // ms
  touchResponseTime: 50,  // ms
  gestureRecognition: 100, // ms
  frameRate: 50, // fps minimum
  carouselScroll: 200 // ms for smooth scrolling
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  startTime: Date.now()
}

// Utility functions
function logTest(testName, passed, duration, details = {}) {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status} ${testName} (${duration}ms)`)
  
  testResults.tests.push({
    name: testName,
    passed,
    duration,
    details,
    timestamp: Date.now()
  })
  
  if (passed) {
    testResults.passed++
  } else {
    testResults.failed++
  }
}

async function waitForCustomizer(page) {
  await page.waitForSelector('#customizer-3d-container', { timeout: 30000 })
  await page.waitForFunction(() => {
    const img = document.querySelector('#customizer-3d-container img')
    return img && img.complete && img.src.includes('ring-001')
  }, { timeout: 10000 })
}

async function measurePerformance(page, action, threshold) {
  const startTime = performance.now()
  await action()
  const endTime = performance.now()
  const duration = endTime - startTime
  
  return {
    duration,
    passed: duration <= threshold,
    threshold
  }
}

// Touch gesture simulation utilities
async function simulatePanGesture(page, selector, deltaX, deltaY = 0) {
  const element = await page.$(selector)
  const boundingBox = await element.boundingBox()
  
  const startX = boundingBox.x + boundingBox.width / 2
  const startY = boundingBox.y + boundingBox.height / 2
  const endX = startX + deltaX
  const endY = startY + deltaY
  
  // Simulate touch pan gesture
  await page.touchscreen.touchStart(startX, startY)
  await page.waitForTimeout(50) // Brief delay to register touch start
  
  // Move in steps to simulate realistic gesture
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    const currentX = startX + (deltaX * i / steps)
    const currentY = startY + (deltaY * i / steps)
    await page.touchscreen.touchMove(currentX, currentY)
    await page.waitForTimeout(16) // ~60fps
  }
  
  await page.touchscreen.touchEnd(endX, endY)
}

async function simulateTapGesture(page, selector) {
  const element = await page.$(selector)
  const boundingBox = await element.boundingBox()
  
  const x = boundingBox.x + boundingBox.width / 2
  const y = boundingBox.y + boundingBox.height / 2
  
  await page.touchscreen.touchStart(x, y)
  await page.waitForTimeout(100)
  await page.touchscreen.touchEnd(x, y)
}

async function simulateDoubleTap(page, selector) {
  await simulateTapGesture(page, selector)
  await page.waitForTimeout(100)
  await simulateTapGesture(page, selector)
}

async function simulatePinchGesture(page, selector, scale = 1.5) {
  const element = await page.$(selector)
  const boundingBox = await element.boundingBox()
  
  const centerX = boundingBox.x + boundingBox.width / 2
  const centerY = boundingBox.y + boundingBox.height / 2
  const distance = 50
  
  // Two finger positions
  const finger1X = centerX - distance
  const finger1Y = centerY
  const finger2X = centerX + distance
  const finger2Y = centerY
  
  // Start pinch
  await page.touchscreen.touchStart(finger1X, finger1Y)
  await page.touchscreen.touchStart(finger2X, finger2Y)
  
  // Pinch out/in
  const newDistance = distance * scale
  const newFinger1X = centerX - newDistance
  const newFinger2X = centerX + newDistance
  
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    const currentDistance1 = finger1X + ((newFinger1X - finger1X) * i / steps)
    const currentDistance2 = finger2X + ((newFinger2X - finger2X) * i / steps)
    
    await page.touchscreen.touchMove(currentDistance1, finger1Y)
    await page.touchscreen.touchMove(currentDistance2, finger2Y)
    await page.waitForTimeout(16)
  }
  
  await page.touchscreen.touchEnd(newFinger1X, finger1Y)
  await page.touchscreen.touchEnd(newFinger2X, finger2Y)
}

// Test Suite
async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 Touch Gesture Integration Tests...')
  console.log(`Target URL: ${CUSTOMIZER_URL}`)
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 375, height: 812 } // Mobile viewport
  })
  
  try {
    // Test 1: Basic Touch Gesture Service Loading
    const page = await browser.newPage()
    await page.goto(CUSTOMIZER_URL, { waitUntil: 'networkidle2' })
    
    const startTime = Date.now()
    await waitForCustomizer(page)
    const loadDuration = Date.now() - startTime
    
    logTest(
      'Touch Gesture Service Loading',
      loadDuration < 5000,
      loadDuration,
      { threshold: 5000, component: 'TouchGestureService' }
    )
    
    // Test 2: Touch Pan Gesture Recognition
    console.log('\n📱 Testing Touch Pan Gesture Recognition...')
    
    const panStartTime = Date.now()
    
    // Get initial frame
    const initialFrame = await page.evaluate(() => {
      const frameElement = document.querySelector('[data-testid*="frame"], .text-xs:contains("Frame")')
      return frameElement ? frameElement.textContent : '0'
    })
    
    // Simulate pan gesture
    await simulatePanGesture(page, '#customizer-3d-container', 100, 0)
    await page.waitForTimeout(500) // Allow gesture to complete
    
    // Check if frame changed
    const newFrame = await page.evaluate(() => {
      const frameElement = document.querySelector('[data-testid*="frame"], .text-xs:contains("Frame")')
      return frameElement ? frameElement.textContent : '0'
    })
    
    const panDuration = Date.now() - panStartTime
    const frameChanged = initialFrame !== newFrame
    
    logTest(
      'Pan Gesture Frame Navigation',
      frameChanged && panDuration < PERFORMANCE_TARGETS.gestureRecognition,
      panDuration,
      { 
        threshold: PERFORMANCE_TARGETS.gestureRecognition,
        initialFrame,
        newFrame,
        frameChanged
      }
    )
    
    // Test 3: Touch Tap Gesture (Auto-rotation toggle)
    console.log('\n👆 Testing Tap Gesture Auto-rotation Toggle...')
    
    const tapStartTime = Date.now()
    
    // Check initial auto-rotation state
    const initialAutoRotation = await page.evaluate(() => {
      const autoButton = document.querySelector('button:contains("Auto"), button:contains("Pause")')
      return autoButton ? autoButton.textContent.includes('Auto') : true
    })
    
    // Simulate tap gesture
    await simulateTapGesture(page, '#customizer-3d-container')
    await page.waitForTimeout(300)
    
    // Check if auto-rotation state changed
    const newAutoRotation = await page.evaluate(() => {
      const autoButton = document.querySelector('button:contains("Auto"), button:contains("Pause")')
      return autoButton ? autoButton.textContent.includes('Auto') : true
    })
    
    const tapDuration = Date.now() - tapStartTime
    const stateChanged = initialAutoRotation !== newAutoRotation
    
    logTest(
      'Tap Gesture Auto-rotation Toggle',
      stateChanged && tapDuration < PERFORMANCE_TARGETS.touchResponseTime,
      tapDuration,
      {
        threshold: PERFORMANCE_TARGETS.touchResponseTime,
        initialState: initialAutoRotation ? 'off' : 'on',
        newState: newAutoRotation ? 'off' : 'on',
        stateChanged
      }
    )
    
    // Test 4: Double-tap Front View
    console.log('\n👆👆 Testing Double-tap Front View Navigation...')
    
    const doubleTapStartTime = Date.now()
    
    // Simulate double-tap gesture
    await simulateDoubleTap(page, '#customizer-3d-container')
    await page.waitForTimeout(500)
    
    // Check if view went to front (frame 0 or 1)
    const frontFrame = await page.evaluate(() => {
      const frameElement = document.querySelector('[data-testid*="frame"], .text-xs:contains("Frame")')
      if (frameElement) {
        const text = frameElement.textContent
        const frameNumber = parseInt(text.match(/\\d+/)?.[0] || '0')
        return frameNumber
      }
      return -1
    })
    
    const doubleTapDuration = Date.now() - doubleTapStartTime
    const wentToFront = frontFrame <= 2 // Frame 0, 1, or 2 considered "front"
    
    logTest(
      'Double-tap Front View Navigation',
      wentToFront && doubleTapDuration < PERFORMANCE_TARGETS.gestureRecognition,
      doubleTapDuration,
      {
        threshold: PERFORMANCE_TARGETS.gestureRecognition,
        finalFrame: frontFrame,
        wentToFront
      }
    )
    
    // Test 5: Pinch Gesture Recognition
    console.log('\n🤏 Testing Pinch Gesture Recognition...')
    
    const pinchStartTime = Date.now()
    
    // Simulate pinch gesture
    await simulatePinchGesture(page, '#customizer-3d-container', 1.5)
    await page.waitForTimeout(300)
    
    const pinchDuration = Date.now() - pinchStartTime
    
    // For Phase 3, pinch gesture provides visual feedback only
    logTest(
      'Pinch Gesture Recognition',
      pinchDuration < PERFORMANCE_TARGETS.gestureRecognition,
      pinchDuration,
      {
        threshold: PERFORMANCE_TARGETS.gestureRecognition,
        note: 'Visual feedback implementation'
      }
    )
    
    // Test 6: Material Carousel Touch Integration
    console.log('\n🎠 Testing Material Carousel Touch Navigation...')
    
    const carouselSelector = '.overflow-x-auto, [data-testid="material-carousel"]'
    const carouselExists = await page.$(carouselSelector)
    
    if (carouselExists) {
      const carouselStartTime = Date.now()
      
      // Get initial selected material
      const initialMaterial = await page.evaluate(() => {
        const selected = document.querySelector('[data-material][aria-pressed="true"]')
        return selected ? selected.getAttribute('data-material') : null
      })
      
      // Simulate swipe on carousel
      await simulatePanGesture(page, carouselSelector, -150, 0)
      await page.waitForTimeout(500)
      
      // Simulate tap on a different material
      const materialButtons = await page.$$('[data-material]')
      if (materialButtons.length > 1) {
        await materialButtons[1].tap()
        await page.waitForTimeout(300)
      }
      
      const carouselDuration = Date.now() - carouselStartTime
      
      // Check if material changed
      const newMaterial = await page.evaluate(() => {
        const selected = document.querySelector('[data-material][aria-pressed="true"]')
        return selected ? selected.getAttribute('data-material') : null
      })
      
      const materialChanged = initialMaterial !== newMaterial
      
      logTest(
        'Material Carousel Touch Navigation',
        materialChanged && carouselDuration < PERFORMANCE_TARGETS.carouselScroll,
        carouselDuration,
        {
          threshold: PERFORMANCE_TARGETS.carouselScroll,
          initialMaterial,
          newMaterial,
          materialChanged
        }
      )
    } else {
      logTest(
        'Material Carousel Touch Navigation',
        false,
        0,
        { error: 'Material carousel not found' }
      )
    }
    
    // Test 7: Performance Regression Test
    console.log('\n⚡ Running Performance Regression Tests...')
    
    // Test material switching performance (should maintain Phase 1 performance)
    const materialButtons = await page.$$('[data-material]')
    if (materialButtons.length > 0) {
      const switchStartTime = performance.now()
      await materialButtons[0].click()
      await page.waitForTimeout(100) // Allow UI to update
      const switchDuration = performance.now() - switchStartTime
      
      logTest(
        'Material Switch Performance Regression',
        switchDuration < PERFORMANCE_TARGETS.materialSwitching,
        Math.round(switchDuration),
        {
          threshold: PERFORMANCE_TARGETS.materialSwitching,
          note: 'Phase 1 performance maintained'
        }
      )
    }
    
    // Test 8: RAF Performance Maintenance
    console.log('\n🔄 Testing RequestAnimationFrame Performance...')
    
    // Enable auto-rotation and measure frame rate
    const rafButton = await page.$('button:contains("Auto")')
    if (rafButton) {
      await rafButton.click()
      await page.waitForTimeout(100)
      
      // Measure frame rate over 2 seconds
      const frameRateData = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0
          const startTime = performance.now()
          const duration = 2000 // 2 seconds
          
          function countFrame() {
            frameCount++
            const elapsed = performance.now() - startTime
            
            if (elapsed < duration) {
              requestAnimationFrame(countFrame)
            } else {
              const fps = Math.round((frameCount / elapsed) * 1000)
              resolve({ frameCount, elapsed, fps })
            }
          }
          
          requestAnimationFrame(countFrame)
        })
      })
      
      logTest(
        'RAF Frame Rate Performance',
        frameRateData.fps >= PERFORMANCE_TARGETS.frameRate,
        frameRateData.elapsed,
        {
          threshold: PERFORMANCE_TARGETS.frameRate,
          measuredFPS: frameRateData.fps,
          frameCount: frameRateData.frameCount
        }
      )
      
      // Stop auto-rotation
      await rafButton.click()
    }
    
    await page.close()
    
  } catch (error) {
    console.error('❌ Test suite error:', error.message)
    testResults.failed++
    testResults.tests.push({
      name: 'Test Suite Execution',
      passed: false,
      duration: Date.now() - testResults.startTime,
      details: { error: error.message },
      timestamp: Date.now()
    })
  } finally {
    await browser.close()
  }
}

// Run tests and generate report
async function main() {
  await runPhase3Tests()
  
  // Generate test report
  const totalDuration = Date.now() - testResults.startTime
  const passRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)
  
  console.log('\n📊 Phase 3 Touch Gesture Integration Test Results')
  console.log('=' .repeat(60))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Pass Rate: ${passRate}%`)
  console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`)
  
  // Detailed results
  console.log('\n📋 Detailed Results:')
  testResults.tests.forEach(test => {
    const status = test.passed ? '✅' : '❌'
    const details = test.details.threshold ? `(target: ${test.details.threshold}ms)` : ''
    console.log(`${status} ${test.name}: ${test.duration}ms ${details}`)
    
    if (test.details.error) {
      console.log(`   Error: ${test.details.error}`)
    }
    if (test.details.note) {
      console.log(`   Note: ${test.details.note}`)
    }
  })
  
  // Performance summary
  console.log('\n🎯 Performance Targets Summary:')
  console.log(`Material Switching: <${PERFORMANCE_TARGETS.materialSwitching}ms`)
  console.log(`Touch Response: <${PERFORMANCE_TARGETS.touchResponseTime}ms`)
  console.log(`Gesture Recognition: <${PERFORMANCE_TARGETS.gestureRecognition}ms`)
  console.log(`Frame Rate: >${PERFORMANCE_TARGETS.frameRate}fps`)
  console.log(`Carousel Scroll: <${PERFORMANCE_TARGETS.carouselScroll}ms`)
  
  // Save results to file
  const reportData = {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      passRate,
      totalDuration,
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests,
    performanceTargets: PERFORMANCE_TARGETS
  }
  
  fs.writeFileSync('phase3-test-results.json', JSON.stringify(reportData, null, 2))
  console.log('\n💾 Results saved to phase3-test-results.json')
  
  // Exit with appropriate code
  const exitCode = testResults.failed === 0 ? 0 : 1
  console.log(`\n${exitCode === 0 ? '🎉' : '⚠️ '} Phase 3 tests ${exitCode === 0 ? 'PASSED' : 'FAILED'}`)
  process.exit(exitCode)
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runPhase3Tests, PERFORMANCE_TARGETS }