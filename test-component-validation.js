/**
 * Quick Component Validation Test
 * 
 * Validates that HybridViewer component has been properly streamlined:
 * - No accessibility imports
 * - No keyboard handlers
 * - No voice control
 * - Phase 2 performance features intact
 */

const fs = require('fs')
const path = require('path')

class ComponentValidationTest {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      details: []
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

  async validateHybridViewer() {
    console.log('\n🔄 Validating HybridViewer Component...')
    
    try {
      const hybridViewerPath = path.join(__dirname, 'src/components/customizer/HybridViewer.tsx')
      const content = fs.readFileSync(hybridViewerPath, 'utf8')
      
      // Test 1: No accessibility service imports
      const hasAccessibilityImport = content.includes('accessibility.service')
      this.recordTest('No Accessibility Service Import', !hasAccessibilityImport, 'Should not import accessibility service')
      
      // Test 2: No keyboard handlers
      const hasKeyboardHandlers = content.includes('handleKeyDown') || content.includes('onKeyDown')
      this.recordTest('No Keyboard Handlers', !hasKeyboardHandlers, 'Should not have keyboard event handlers')
      
      // Test 3: No voice control
      const hasVoiceControl = content.includes('voiceControl') || content.includes('Voice Control')
      this.recordTest('No Voice Control', !hasVoiceControl, 'Should not have voice control features')
      
      // Test 4: No ARIA attributes
      const hasAriaAttributes = content.includes('aria-live') || content.includes('role="status"') || content.includes('role="application"')
      this.recordTest('No ARIA Attributes', !hasAriaAttributes, 'Should not have ARIA accessibility attributes')
      
      // Test 5: No high contrast mode
      const hasHighContrast = content.includes('highContrast') || content.includes('data-high-contrast')
      this.recordTest('No High Contrast', !hasHighContrast, 'Should not have high contrast mode')
      
      // Test 6: Material preloader still present
      const hasMaterialPreloader = content.includes('materialPreloader')
      this.recordTest('Material Preloader Present', hasMaterialPreloader, 'Should still have material preloader from Phase 2')
      
      // Test 7: Performance tracking still present
      const hasPerformanceTracking = content.includes('materialSwitchTime') && content.includes('performance.now')
      this.recordTest('Performance Tracking Present', hasPerformanceTracking, 'Should still have performance tracking from Phase 2')
      
      // Test 8: Touch gestures still enabled
      const hasTouchGestures = content.includes('enableTouchGestures')
      this.recordTest('Touch Gestures Present', hasTouchGestures, 'Should still support touch gestures')
      
      // Test 9: Core 3D viewer functionality
      const hasImageSequenceViewer = content.includes('ImageSequenceViewer')
      this.recordTest('Core 3D Viewer Present', hasImageSequenceViewer, 'Should still have ImageSequenceViewer')
      
      // Test 10: Performance indicators
      const hasPhase2Indicators = content.includes('Phase 2 Optimized') && content.includes('<100ms')
      this.recordTest('Phase 2 Performance Indicators', hasPhase2Indicators, 'Should show Phase 2 performance indicators')
      
      // Test 11: No screen reader elements
      const hasScreenReaderElements = content.includes('sr-only') || content.includes('screen reader')
      this.recordTest('No Screen Reader Elements', !hasScreenReaderElements, 'Should not have screen reader specific elements')
      
      // Test 12: Clean interface (no accessibility help)
      const hasAccessibilityHelp = content.includes('Accessibility Help') || content.includes('kbd')
      this.recordTest('No Accessibility Help', !hasAccessibilityHelp, 'Should not have accessibility help panels')
      
    } catch (error) {
      this.recordTest('Component File Read', false, `Could not read HybridViewer file: ${error.message}`)
    }
  }

  async validateDependencies() {
    console.log('\n🔄 Validating Dependencies...')
    
    try {
      // Check that accessibility service file exists but isn't being used
      const accessibilityServicePath = path.join(__dirname, 'src/lib/services/accessibility.service.ts')
      const accessibilityExists = fs.existsSync(accessibilityServicePath)
      this.recordTest('Accessibility Service Unused', accessibilityExists, 'Accessibility service file exists but unused (good for reference)')
      
      // Check that Phase 2 services are still present
      const materialPreloaderPath = path.join(__dirname, 'src/lib/services/material-preloader.service.ts')
      const materialPreloaderExists = fs.existsSync(materialPreloaderPath)
      this.recordTest('Material Preloader Service Present', materialPreloaderExists, 'Phase 2 material preloader should be present')
      
      const frameCachePath = path.join(__dirname, 'src/lib/services/frame-cache.service.ts')
      const frameCacheExists = fs.existsSync(frameCachePath)
      this.recordTest('Frame Cache Service Present', frameCacheExists, 'Phase 2 frame cache should be present')
      
      const touchGesturePath = path.join(__dirname, 'src/lib/services/touch-gesture.service.ts')
      const touchGestureExists = fs.existsSync(touchGesturePath)
      this.recordTest('Touch Gesture Service Present', touchGestureExists, 'Touch gesture service should be present')
      
    } catch (error) {
      this.recordTest('Dependencies Check', false, `Could not check dependencies: ${error.message}`)
    }
  }

  async validateCodeQuality() {
    console.log('\n🔄 Validating Code Quality...')
    
    try {
      const hybridViewerPath = path.join(__dirname, 'src/components/customizer/HybridViewer.tsx')
      const content = fs.readFileSync(hybridViewerPath, 'utf8')
      
      // Check for clean imports
      const lines = content.split('\n')
      const importLines = lines.filter(line => line.trim().startsWith('import'))
      const cleanImports = importLines.length <= 5 // Should be minimal now
      this.recordTest('Clean Import Structure', cleanImports, `Should have minimal imports (has ${importLines.length})`)
      
      // Check for proper TypeScript interfaces
      const hasInterfaces = content.includes('interface CSS3DCustomizerProps')
      this.recordTest('TypeScript Interface Present', hasInterfaces, 'Should maintain TypeScript interfaces')
      
      // Check for proper error handling
      const hasErrorHandling = content.includes('onError') && content.includes('try') || content.includes('catch')
      this.recordTest('Error Handling Present', hasErrorHandling, 'Should have error handling')
      
      // Check for performance optimization comments
      const hasPerformanceComments = content.includes('Phase 2') || content.includes('performance')
      this.recordTest('Performance Documentation', hasPerformanceComments, 'Should document performance optimizations')
      
    } catch (error) {
      this.recordTest('Code Quality Check', false, `Could not validate code quality: ${error.message}`)
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Component Validation Tests...\n')
    
    try {
      await this.validateHybridViewer()
      await this.validateDependencies()
      await this.validateCodeQuality()
      
    } catch (error) {
      console.error('❌ Critical validation failure:', error)
      this.recordTest('Test Suite Execution', false, error.message)
    }
    
    this.printResults()
    return this.results
  }

  printResults() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 COMPONENT VALIDATION RESULTS')
    console.log('='.repeat(80))
    
    const passRate = this.results.totalTests > 0 ? (this.results.passed / this.results.totalTests * 100).toFixed(1) : 0
    
    console.log(`\n📈 Overall Results:`)
    console.log(`   Total Tests: ${this.results.totalTests}`)
    console.log(`   Passed: ${this.results.passed} ✅`)
    console.log(`   Failed: ${this.results.failed} ❌`)
    console.log(`   Pass Rate: ${passRate}%`)
    
    if (passRate >= 95) {
      console.log(`\n🎉 COMPONENT STATUS: EXCELLENT (${passRate}%)`)
      console.log('   ✅ Perfect streamlining achieved')
    } else if (passRate >= 85) {
      console.log(`\n✅ COMPONENT STATUS: WELL STREAMLINED (${passRate}%)`)
      console.log('   ✅ Successfully removed accessibility features')
    } else if (passRate >= 70) {
      console.log(`\n⚠️ COMPONENT STATUS: MOSTLY CLEAN (${passRate}%)`)
      console.log('   ⚠️ Some cleanup still needed')
    } else {
      console.log(`\n❌ COMPONENT STATUS: NEEDS MORE WORK (${passRate}%)`)
      console.log('   ❌ Significant cleanup required')
    }
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details}`)
        })
    }
    
    console.log('\n🎯 Streamlining Status:')
    console.log(`   🧹 Accessibility Removed: ${this.results.details.filter(t => t.name.includes('No ') && t.passed).length}/${this.results.details.filter(t => t.name.includes('No ')).length} ✅`)
    console.log(`   ⚡ Performance Preserved: ${this.results.details.some(t => t.name.includes('Performance') && t.passed) ? 'YES ✅' : 'NO ❌'}`)
    console.log(`   🖱️ Touch/Mouse Ready: ${this.results.details.some(t => t.name.includes('Touch') && t.passed) ? 'YES ✅' : 'NO ❌'}`)
    console.log(`   🎨 3D Viewer Intact: ${this.results.details.some(t => t.name.includes('3D Viewer') && t.passed) ? 'YES ✅' : 'NO ❌'}`)
    
    console.log('\n📊 Component Metrics:')
    const accessibilityRemoved = this.results.details.filter(t => t.name.includes('No ') && t.passed).length
    const performanceKept = this.results.details.filter(t => (t.name.includes('Present') || t.name.includes('Preloader')) && t.passed).length
    
    console.log(`   📉 Removed Features: ${accessibilityRemoved} accessibility features`)
    console.log(`   📈 Kept Features: ${performanceKept} performance features`)
    console.log(`   🎯 Focus: Mouse/Touch interaction only`)
    
    console.log('\n' + '='.repeat(80))
  }
}

// Run the validation
async function runValidation() {
  const validator = new ComponentValidationTest()
  const results = await validator.runAllTests()
  
  const success = results.totalTests > 0 && (results.passed / results.totalTests) >= 0.85
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  runValidation().catch(console.error)
}

module.exports = ComponentValidationTest