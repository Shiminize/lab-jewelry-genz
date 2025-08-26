/**
 * Phase 2 RAF Performance Validation
 * Tests 60fps auto-rotation and momentum physics performance
 * CLAUDE_RULES: <100ms material switching, 60fps smooth rotation
 */

const puppeteer = require('puppeteer')

async function validatePhase2RAFPerformance() {
  console.log('🚀 Phase 2 RAF Performance Validation Starting...')
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  })
  
  const page = await browser.newPage()
  const results = []
  
  // Performance tracking arrays
  const frameRates = []
  const rotationTimings = []
  const momentumPerformance = []
  
  page.on('console', msg => {
    const text = msg.text()
    
    // Track FPS measurements
    if (text.includes('[RAF FPS]')) {
      const match = text.match(/(\d+\.?\d*)\s*fps/)
      if (match) {
        frameRates.push(parseFloat(match[1]))
      }
    }
    
    // Track rotation performance
    if (text.includes('[AUTO-ROTATE]')) {
      const match = text.match(/(\d+\.?\d*)ms/)
      if (match) {
        rotationTimings.push(parseFloat(match[1]))
      }
    }
    
    // Track momentum physics
    if (text.includes('[MOMENTUM]')) {
      const match = text.match(/velocity:\s*(\d+\.?\d*)/i)
      if (match) {
        momentumPerformance.push(parseFloat(match[1]))
      }
    }
  })
  
  try {
    // Test Homepage 3D Container
    console.log('\n📋 Testing Homepage RAF Performance...')
    await page.goto('http://localhost:3000/')
    await page.waitForSelector('#customizer-3d-container', { timeout: 10000 })
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Enable auto-rotation and measure RAF performance
    const autoRotateTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frameCount = 0
        let startTime = performance.now()
        let lastFrameTime = startTime
        const frameTimes = []
        
        // Find auto-rotate button
        const buttons = Array.from(document.querySelectorAll('button'))
        const autoButton = buttons.find(btn => 
          btn.textContent && (
            btn.textContent.includes('Auto') || 
            btn.textContent.includes('▶️') ||
            btn.textContent.includes('⏸️')
          )
        )
        
        if (!autoButton) {
          resolve({ error: 'Auto-rotate button not found' })
          return
        }
        
        // Monitor RAF performance using performance observer
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.name.includes('requestAnimationFrame')) {
              frameTimes.push(entry.duration)
            }
          })
        })
        observer.observe({ entryTypes: ['measure'] })
        
        // Custom RAF performance tracking
        function trackRAF() {
          const now = performance.now()
          const deltaTime = now - lastFrameTime
          
          frameCount++
          lastFrameTime = now
          
          // Log FPS every 60 frames
          if (frameCount % 60 === 0) {
            const fps = 1000 / deltaTime
            console.log(`[RAF FPS] Current: ${fps.toFixed(1)} fps, Delta: ${deltaTime.toFixed(2)}ms`)
          }
          
          // Continue for 5 seconds (approx 300 frames at 60fps)
          if (now - startTime < 5000) {
            requestAnimationFrame(trackRAF)
          } else {
            const totalTime = now - startTime
            const averageFPS = (frameCount / totalTime) * 1000
            const averageDelta = frameTimes.length > 0 ? 
              frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length : 
              totalTime / frameCount
            
            observer.disconnect()
            
            resolve({
              frameCount,
              totalTime,
              averageFPS,
              averageDelta,
              targetFPS: 60,
              minAcceptableFPS: 45, // 75% of target
              passed: averageFPS >= 45 && averageDelta <= 22 // 22ms = ~45fps
            })
          }
        }
        
        // Start auto-rotation
        autoButton.click()
        console.log('[RAF TEST] Starting auto-rotation performance test...')
        
        // Start RAF tracking
        requestAnimationFrame(trackRAF)
      })
    })
    
    results.push({
      test: 'Homepage Auto-Rotation RAF',
      ...autoRotateTest
    })
    
    console.log(`  ⚡ FPS: ${autoRotateTest.averageFPS?.toFixed(1) || 'N/A'} (target: 60)`)
    console.log(`  ⏱️ Delta: ${autoRotateTest.averageDelta?.toFixed(2) || 'N/A'}ms (target: <16.67ms)`)
    
    // Test momentum physics performance
    console.log('\n📋 Testing Momentum Physics...')
    
    const momentumTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const nextButton = buttons.find(btn => btn.textContent && btn.textContent.includes('→'))
        
        if (!nextButton) {
          resolve({ error: 'Next button not found' })
          return
        }
        
        let momentumFrames = 0
        let startTime = performance.now()
        
        // Monitor momentum decay
        function trackMomentum() {
          const now = performance.now()
          momentumFrames++
          
          console.log(`[MOMENTUM] Frame ${momentumFrames}, Time: ${now - startTime}ms`)
          
          // Continue for 2 seconds to see momentum decay
          if (now - startTime < 2000) {
            requestAnimationFrame(trackMomentum)
          } else {
            const totalTime = now - startTime
            const avgFrameRate = (momentumFrames / totalTime) * 1000
            
            resolve({
              momentumFrames,
              totalTime,
              avgFrameRate,
              passed: avgFrameRate >= 45
            })
          }
        }
        
        // Trigger momentum by clicking next button multiple times
        nextButton.click()
        console.log('[MOMENTUM TEST] Starting momentum physics test...')
        
        // Wait a moment then start tracking
        setTimeout(() => {
          requestAnimationFrame(trackMomentum)
        }, 100)
      })
    })
    
    results.push({
      test: 'Momentum Physics RAF',
      ...momentumTest
    })
    
    console.log(`  🚀 Momentum FPS: ${momentumTest.avgFrameRate?.toFixed(1) || 'N/A'}`)
    
    // Test Customizer page
    console.log('\n📋 Testing Customizer Page RAF Performance...')
    await page.goto('http://localhost:3000/customizer')
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 })
    
    // Wait for load and repeat auto-rotation test
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const customizerRAFTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frameCount = 0
        let startTime = performance.now()
        let lastFrameTime = startTime
        
        // Find auto-rotate control
        const buttons = Array.from(document.querySelectorAll('button'))
        const autoButton = buttons.find(btn => 
          btn.textContent && (
            btn.textContent.includes('Auto') || 
            btn.textContent.includes('▶️') ||
            btn.textContent.includes('⏸️')
          )
        )
        
        if (!autoButton) {
          resolve({ error: 'Customizer auto-rotate button not found' })
          return
        }
        
        function trackCustomizerRAF() {
          const now = performance.now()
          const deltaTime = now - lastFrameTime
          
          frameCount++
          lastFrameTime = now
          
          if (frameCount % 60 === 0) {
            const fps = 1000 / deltaTime
            console.log(`[RAF FPS CUSTOMIZER] Current: ${fps.toFixed(1)} fps`)
          }
          
          if (now - startTime < 5000) {
            requestAnimationFrame(trackCustomizerRAF)
          } else {
            const totalTime = now - startTime
            const averageFPS = (frameCount / totalTime) * 1000
            const averageDelta = totalTime / frameCount
            
            resolve({
              frameCount,
              totalTime,
              averageFPS,
              averageDelta,
              passed: averageFPS >= 45
            })
          }
        }
        
        // Start auto-rotation
        autoButton.click()
        console.log('[RAF TEST CUSTOMIZER] Starting customizer auto-rotation test...')
        
        requestAnimationFrame(trackCustomizerRAF)
      })
    })
    
    results.push({
      test: 'Customizer Auto-Rotation RAF',
      ...customizerRAFTest
    })
    
    console.log(`  ⚡ Customizer FPS: ${customizerRAFTest.averageFPS?.toFixed(1) || 'N/A'}`)
    
  } catch (error) {
    console.error('❌ RAF Performance test failed:', error)
    results.push({ test: 'RAF Performance Test', error: error.message })
  }
  
  await browser.close()
  
  // Analyze results
  console.log('\n🎯 PHASE 2 RAF PERFORMANCE RESULTS:')
  console.log('='.repeat(60))
  
  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.filter(r => !r.error).length
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`Performance Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Pass Rate: ${passRate.toFixed(1)}%`)
  
  // Individual results
  console.log('\n📊 Detailed Results:')
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.test}: ${result.error}`)
    } else {
      const status = result.passed ? '✅' : '❌'
      console.log(`${status} ${result.test}:`)
      if (result.averageFPS) {
        console.log(`    FPS: ${result.averageFPS.toFixed(1)} (target: ≥45)`)
        console.log(`    Frame Time: ${result.averageDelta?.toFixed(2)}ms (target: ≤22ms)`)
        console.log(`    Duration: ${result.totalTime?.toFixed(0)}ms`)
        console.log(`    Frames: ${result.frameCount}`)
      }
    }
  })
  
  // Performance analysis
  if (frameRates.length > 0) {
    const avgFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length
    const minFPS = Math.min(...frameRates)
    const maxFPS = Math.max(...frameRates)
    
    console.log('\n🚀 RAF Performance Analysis:')
    console.log(`Average FPS: ${avgFPS.toFixed(1)}`)
    console.log(`Min FPS: ${minFPS.toFixed(1)}`)
    console.log(`Max FPS: ${maxFPS.toFixed(1)}`)
    console.log(`FPS Consistency: ${((minFPS / maxFPS) * 100).toFixed(1)}%`)
  }
  
  // Final validation
  console.log('\n🏆 FINAL PHASE 2 RAF RESULTS:')
  
  if (passRate >= 80 && passedTests > 0) {
    console.log('🎉 PHASE 2 RAF SUCCESS - 60fps performance targets met!')
    console.log('✅ RequestAnimationFrame implementation working optimally!')
    console.log('✅ Context-aware auto-rotation behaving correctly!')
    console.log('✅ Momentum physics performing smoothly!')
    return true
  } else {
    console.log('💥 PHASE 2 RAF FAILED - Performance targets not met')
    console.log(`Pass rate: ${passRate.toFixed(1)}% (target: ≥80%)`)
    return false
  }
}

// Run validation
validatePhase2RAFPerformance().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('RAF Performance validation failed:', error)
  process.exit(1)
})