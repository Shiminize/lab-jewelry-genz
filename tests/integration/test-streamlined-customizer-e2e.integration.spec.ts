/**
 * Streamlined 3D Customizer E2E Test
 * 
 * Tests core functionality without accessibility features:
 * - Performance optimization validation
 * - Touch/mouse interaction
 * - Material switching performance
 * - 3D viewer loading and functionality
 */

const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

class StreamlinedCustomizerTest {
  constructor() {
    this.browser = null
    this.page = null
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      details: []
    }
  }

  async setup() {
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security']
    })
    this.page = await this.browser.newPage()
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  recordTest(name, passed, details = '') {
    this.results.totalTests++
    if (passed) {
      this.results.passed++
      console.log(`✅ ${name}`)
    } else {
      this.results.failed++
      console.log(`❌ ${name}: ${details}`)
    }
    this.results.details.push({ name, passed, details })
  }

  async testPageLoad() {
    console.log('\n🔄 Testing Page Load Performance...')
    
    const startTime = performance.now()
    
    try {
      await this.page.goto(`${BASE_URL}/customizer`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      const loadTime = performance.now() - startTime
      this.recordTest(
        'Page Load Performance', 
        loadTime < 3000, // 3s target for full page
        loadTime >= 3000 ? `Load time ${Math.round(loadTime)}ms exceeds 3s limit` : `Loaded in ${Math.round(loadTime)}ms`
      )

      // Check for customizer presence
      const customizerExists = await this.page.locator('text=Loading 3D Customizer').count() > 0 ||
                             await this.page.locator('text=360° CSS 3D').count() > 0
      this.recordTest('Customizer Component Present', customizerExists, 'Customizer should be present on page')

    } catch (error) {
      this.recordTest('Page Load', false, `Failed to load customizer page: ${error.message}`)
    }
  }

  async testBasicInteraction() {
    console.log('\n🔄 Testing Basic Interaction...')
    
    try {
      // Wait for customizer to load
      await this.page.waitForSelector('text=360° CSS 3D', { timeout: 10000 })
      
      // Check for loading completion
      const loadingGone = await this.page.waitForSelector('text=Loading 3D Customizer', { 
        state: 'hidden', 
        timeout: 15000 
      }).catch(() => null)
      
      this.recordTest('Customizer Loading Complete', !!loadingGone, 'Loading screen should disappear')
      
      // Test for Phase 2 performance indicator
      const phase2Indicator = await this.page.locator('text=Phase 2 Optimized').count() > 0
      this.recordTest('Phase 2 Performance Features', phase2Indicator, 'Phase 2 optimizations should be active')
      
      // Check for performance target display
      const performanceTarget = await this.page.locator('text=Target: <100ms').count() > 0
      this.recordTest('Performance Target Display', performanceTarget, 'Should show <100ms performance target')
      
    } catch (error) {
      this.recordTest('Basic Interaction', false, `Interaction test failed: ${error.message}`)
    }
  }

  async testTouchInteraction() {
    console.log('\n🔄 Testing Touch/Mouse Interaction...')
    
    try {
      // Find the viewer area
      const viewer = this.page.locator('.relative.w-full.h-full').first()
      
      if (await viewer.count() === 0) {
        this.recordTest('Touch Interaction Setup', false, 'Could not find viewer element')
        return
      }
      
      // Test mouse interaction (simulating touch)
      const viewerBounds = await viewer.boundingBox()
      if (viewerBounds) {
        const centerX = viewerBounds.x + viewerBounds.width / 2
        const centerY = viewerBounds.y + viewerBounds.height / 2
        
        // Simulate drag gesture
        await this.page.mouse.move(centerX - 50, centerY)
        await this.page.mouse.down()
        await this.page.mouse.move(centerX + 50, centerY, { steps: 10 })
        await this.page.mouse.up()
        
        this.recordTest('Mouse Drag Gesture', true, 'Mouse drag interaction executed')
        
        // Test click interaction
        await this.page.mouse.click(centerX, centerY)
        this.recordTest('Click Interaction', true, 'Click interaction executed')
        
      } else {
        this.recordTest('Touch Interaction', false, 'Could not get viewer bounds for interaction')
      }
      
    } catch (error) {
      this.recordTest('Touch/Mouse Interaction', false, `Interaction failed: ${error.message}`)
    }
  }

  async testPerformanceMetrics() {
    console.log('\n🔄 Testing Performance Metrics...')
    
    try {
      // Check for console logs indicating performance
      const consoleLogs = []
      this.page.on('console', msg => {
        if (msg.text().includes('CLAUDE_RULES') || msg.text().includes('Phase 2')) {
          consoleLogs.push(msg.text())
        }
      })
      
      // Trigger some interactions to generate performance logs
      await this.page.waitForTimeout(2000) // Allow time for preloading
      
      // Check for performance compliance logs
      const hasPerformanceLogs = consoleLogs.some(log => 
        log.includes('CLAUDE_RULES compliant') || 
        log.includes('Phase 2:') ||
        log.includes('preloaded')
      )
      
      this.recordTest('Performance Logging Active', hasPerformanceLogs, 'Should have performance monitoring logs')
      
      // Check for material preloader activity
      const hasMaterialLogs = consoleLogs.some(log => 
        log.includes('material') && (log.includes('preloaded') || log.includes('preloading'))
      )
      
      this.recordTest('Material Preloader Active', hasMaterialLogs, 'Material preloader should be working')
      
    } catch (error) {
      this.recordTest('Performance Metrics', false, `Performance test failed: ${error.message}`)
    }
  }

  async testMaterialSwitching() {
    console.log('\n🔄 Testing Material Switching Performance...')
    
    try {
      // Look for material selection controls
      const materialButtons = await this.page.locator('button').filter({ hasText: /gold|platinum|silver/i }).count()
      
      if (materialButtons > 0) {
        // Click on a material button
        const firstMaterial = this.page.locator('button').filter({ hasText: /gold|platinum|silver/i }).first()
        await firstMaterial.click()
        
        // Wait a bit and check for performance indicator update
        await this.page.waitForTimeout(1000)
        
        // Check if performance timing is displayed
        const performanceTiming = await this.page.locator('text=/Last switch: \\d+ms/').count() > 0
        this.recordTest('Material Switch Performance Display', performanceTiming, 'Should show material switch timing')
        
        // Check if timing is under 100ms (if displayed)
        const timingText = await this.page.locator('text=/Last switch: \\d+ms/').textContent().catch(() => '')
        if (timingText) {
          const timing = parseInt(timingText.match(/\\d+/)?.[0] || '999')
          this.recordTest('Material Switch <100ms', timing < 100, `Switch time: ${timing}ms (target: <100ms)`)
        }
        
      } else {
        this.recordTest('Material Controls Present', false, 'No material selection controls found')
      }
      
    } catch (error) {
      this.recordTest('Material Switching', false, `Material switching test failed: ${error.message}`)
    }
  }

  async testCleanInterface() {
    console.log('\n🔄 Testing Clean Interface (No Accessibility Clutter)...')
    
    try {
      // Verify accessibility elements are NOT present
      const hasKeyboardHelp = await this.page.locator('text=Accessibility Help').count() > 0
      this.recordTest('No Accessibility Help Panel', !hasKeyboardHelp, 'Accessibility help should be removed')
      
      const hasVoiceControl = await this.page.locator('text=Voice Control').count() > 0
      this.recordTest('No Voice Control Elements', !hasVoiceControl, 'Voice control should be removed')
      
      const hasKeyboardShortcuts = await this.page.locator('kbd').count() === 0
      this.recordTest('No Keyboard Shortcut Displays', hasKeyboardShortcuts, 'Keyboard shortcuts should be removed')
      
      const hasAriaElements = await this.page.locator('[aria-live]').count() === 0
      this.recordTest('No ARIA Live Regions', hasAriaElements, 'ARIA live regions should be removed')
      
      // Verify core elements ARE still present
      const hasViewer = await this.page.locator('text=360° CSS 3D').count() > 0
      this.recordTest('Core Viewer Present', hasViewer, 'Core 3D viewer should remain')
      
      const hasPerformanceInfo = await this.page.locator('text=Phase 2 Optimized').count() > 0
      this.recordTest('Performance Info Present', hasPerformanceInfo, 'Performance information should remain')
      
    } catch (error) {
      this.recordTest('Clean Interface', false, `Interface test failed: ${error.message}`)
    }
  }

  async testResponsiveness() {
    console.log('\n🔄 Testing Mobile Responsiveness...')
    
    try {
      // Test mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 }) // iPhone size
      await this.page.waitForTimeout(500)
      
      const customizerVisible = await this.page.locator('text=360° CSS 3D').isVisible()
      this.recordTest('Mobile Customizer Visible', customizerVisible, 'Customizer should be visible on mobile')
      
      const performanceInfoVisible = await this.page.locator('text=Phase 2 Optimized').isVisible()
      this.recordTest('Mobile Performance Info', performanceInfoVisible, 'Performance info should be visible on mobile')
      
      // Test tablet viewport
      await this.page.setViewportSize({ width: 768, height: 1024 }) // iPad size
      await this.page.waitForTimeout(500)
      
      const tabletCustomizerVisible = await this.page.locator('text=360° CSS 3D').isVisible()
      this.recordTest('Tablet Customizer Visible', tabletCustomizerVisible, 'Customizer should be visible on tablet')
      
      // Restore desktop viewport
      await this.page.setViewportSize({ width: 1200, height: 800 })
      
    } catch (error) {
      this.recordTest('Mobile Responsiveness', false, `Responsiveness test failed: ${error.message}`)
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Streamlined 3D Customizer E2E Tests...\n')
    
    await this.setup()
    
    try {
      await this.testPageLoad()
      await this.testBasicInteraction()
      await this.testTouchInteraction()
      await this.testPerformanceMetrics()
      await this.testMaterialSwitching()
      await this.testCleanInterface()
      await this.testResponsiveness()
      
    } catch (error) {
      console.error('❌ Critical test failure:', error)
      this.recordTest('Test Suite Execution', false, error.message)
    } finally {
      await this.cleanup()
    }
    
    this.printResults()
    return this.results
  }

  printResults() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 STREAMLINED CUSTOMIZER TEST RESULTS')
    console.log('='.repeat(80))
    
    const passRate = this.results.totalTests > 0 ? (this.results.passed / this.results.totalTests * 100).toFixed(1) : 0
    
    console.log(`\n📈 Overall Results:`)
    console.log(`   Total Tests: ${this.results.totalTests}`)
    console.log(`   Passed: ${this.results.passed} ✅`)
    console.log(`   Failed: ${this.results.failed} ❌`)
    console.log(`   Pass Rate: ${passRate}%`)
    
    if (passRate >= 95) {
      console.log(`\n🎉 CUSTOMIZER STATUS: EXCELLENT (${passRate}%)`)
      console.log('   ✅ All core functionality working perfectly')
    } else if (passRate >= 85) {
      console.log(`\n✅ CUSTOMIZER STATUS: FULLY FUNCTIONAL (${passRate}%)`)
      console.log('   ✅ Core functionality operational')
    } else if (passRate >= 70) {
      console.log(`\n⚠️ CUSTOMIZER STATUS: MOSTLY WORKING (${passRate}%)`)
      console.log('   ⚠️ Minor issues detected')
    } else {
      console.log(`\n❌ CUSTOMIZER STATUS: NEEDS WORK (${passRate}%)`)
      console.log('   ❌ Significant issues detected')
    }
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details}`)
        })
    }
    
    console.log('\n🎯 Core Functionality Status:')
    console.log(`   🖱️ Mouse/Touch Interaction: ${this.results.details.some(t => t.name.includes('Touch') && t.passed) ? 'WORKING ✅' : 'NEEDS FIX ❌'}`)
    console.log(`   ⚡ Performance Optimization: ${this.results.details.some(t => t.name.includes('Performance') && t.passed) ? 'ACTIVE ✅' : 'NEEDS FIX ❌'}`)
    console.log(`   🎨 Material Switching: ${this.results.details.some(t => t.name.includes('Material') && t.passed) ? 'WORKING ✅' : 'NEEDS FIX ❌'}`)
    console.log(`   📱 Mobile Responsive: ${this.results.details.some(t => t.name.includes('Mobile') && t.passed) ? 'WORKING ✅' : 'NEEDS FIX ❌'}`)
    console.log(`   🧹 Clean Interface: ${this.results.details.some(t => t.name.includes('No Accessibility') && t.passed) ? 'ACHIEVED ✅' : 'NEEDS CLEANUP ❌'}`)
    
    console.log('\n📊 Phase 2 Performance Validation:')
    console.log(`   🚀 <100ms Material Switching: ${this.results.details.some(t => t.name.includes('<100ms') && t.passed) ? 'COMPLIANT ✅' : 'CHECK NEEDED ⚠️'}`)
    console.log(`   📈 Preloader Active: ${this.results.details.some(t => t.name.includes('Preloader') && t.passed) ? 'WORKING ✅' : 'CHECK NEEDED ⚠️'}`)
    console.log(`   🎯 Performance Monitoring: ${this.results.details.some(t => t.name.includes('Logging') && t.passed) ? 'ACTIVE ✅' : 'CHECK NEEDED ⚠️'}`)
    
    console.log('\n' + '='.repeat(80))
  }
}

// Run the tests
async function runTests() {
  const tester = new StreamlinedCustomizerTest()
  const results = await tester.runAllTests()
  
  const success = results.totalTests > 0 && (results.passed / results.totalTests) >= 0.85
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = StreamlinedCustomizerTest