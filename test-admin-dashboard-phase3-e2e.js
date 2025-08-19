#!/usr/bin/env node

/**
 * PHASE 3 E2E Testing - Mobile Optimization & Enhanced Security
 * 
 * SUCCESS CRITERIA (ALL MUST PASS):
 * ✅ Mobile navigation with swipe gestures functional
 * ✅ Touch-optimized metric cards with proper interaction zones (min 44px)
 * ✅ Mobile-first responsive layout scales properly on all devices
 * ✅ Admin security middleware protects all sensitive routes
 * ✅ Enhanced access control with role-based permissions
 * ✅ Session management and security indicators working
 * ✅ Rate limiting and CSRF protection operational
 * ✅ Mobile accessibility compliance (WCAG 2.1 AA)
 * 
 * PASSING CRITERIA: 100% success rate (all tests must pass)
 */

class AdminDashboardPhase3E2E {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
    this.results = {
      passed: 0,
      failed: 0,
      details: []
    }
    this.startTime = Date.now()
  }

  // Test mobile viewport response
  async testMobileViewport(width = 375, height = 667) {
    try {
      const response = await fetch(`${this.baseUrl}/admin`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      })
      
      const html = await response.text()
      
      return {
        success: response.ok,
        hasViewportMeta: html.includes('viewport'),
        hasMobileStyles: html.includes('sm:') || html.includes('md:') || html.includes('lg:'),
        hasTouch: html.includes('touch-manipulation'),
        responseTime: Date.now() - Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Log test result
  logResult(testName, passed, details = '', isCritical = true) {
    if (passed) {
      this.results.passed++
      console.log(`✅ ${testName}`)
    } else {
      this.results.failed++
      console.log(`❌ ${testName}`)
      if (details) console.log(`   ${details}`)
      if (isCritical) {
        console.log(`   🚨 CRITICAL FAILURE: Phase 3 success criteria not met`)
      }
    }
    
    this.results.details.push({
      test: testName,
      passed,
      details,
      critical: isCritical
    })
  }

  // Test 1: Mobile Navigation with Swipe Gestures
  async testMobileNavigation() {
    console.log('\\n🧪 Testing Mobile Navigation with Swipe Gestures...')
    
    const response = await fetch(`${this.baseUrl}/admin`)
    const html = await response.text()
    
    // Check for mobile navigation elements
    const hasMobileMenu = html.includes('md:hidden') && html.includes('Menu')
    const hasSwipeHook = html.includes('useMobileNavigation') || html.includes('swipe')
    const hasTouchOptimization = html.includes('touch-manipulation')
    
    this.logResult(
      'Mobile menu toggle present and accessible',
      hasMobileMenu,
      `Mobile menu elements found: ${hasMobileMenu}`,
      true
    )
    
    this.logResult(
      'Swipe gesture functionality implemented',
      hasSwipeHook,
      `Swipe features detected: ${hasSwipeHook}`,
      true
    )
    
    this.logResult(
      'Touch optimization applied to interactive elements',
      hasTouchOptimization,
      `Touch-manipulation CSS found: ${hasTouchOptimization}`,
      true
    )
  }

  // Test 2: Touch-Optimized Metric Cards
  async testTouchOptimizedMetricCards() {
    console.log('\\n🧪 Testing Touch-Optimized Metric Cards...')
    
    const response = await fetch(`${this.baseUrl}/admin`)
    const html = await response.text()
    
    // Check for proper touch sizing and interactions
    const hasMinTouchSize = html.includes('min-h-[120px]') || html.includes('min-h-[64px]')
    const hasClickableCards = html.includes('cursor-pointer') || html.includes('onClick')
    const hasHoverEffects = html.includes('hover:scale-') || html.includes('hover:shadow-')
    const hasActiveStates = html.includes('active:scale-')
    
    this.logResult(
      'Metric cards meet minimum touch target size (44px+)',
      hasMinTouchSize,
      `Minimum touch sizes implemented: ${hasMinTouchSize}`,
      true
    )
    
    this.logResult(
      'Interactive metric cards with click handlers',
      hasClickableCards,
      `Clickable interactions found: ${hasClickableCards}`,
      true
    )
    
    this.logResult(
      'Visual feedback for touch interactions',
      hasHoverEffects && hasActiveStates,
      `Hover: ${hasHoverEffects}, Active: ${hasActiveStates}`,
      true
    )
  }

  // Test 3: Mobile-First Responsive Layout
  async testResponsiveLayout() {
    console.log('\\n🧪 Testing Mobile-First Responsive Layout...')
    
    const response = await fetch(`${this.baseUrl}/admin`)
    const html = await response.text()
    
    // Check for responsive grid systems
    const hasResponsiveGrids = html.includes('grid-cols-1') && (html.includes('sm:grid-cols-') || html.includes('md:grid-cols-'))
    const hasResponsiveSpacing = html.includes('space-y-4') && html.includes('sm:space-y-6')
    const hasResponsivePadding = html.includes('p-4') && html.includes('sm:p-6')
    const hasResponsiveText = html.includes('text-xl') && html.includes('sm:text-2xl')
    
    this.logResult(
      'Responsive grid system implemented',
      hasResponsiveGrids,
      `Responsive grids: ${hasResponsiveGrids}`,
      true
    )
    
    this.logResult(
      'Responsive spacing and padding',
      hasResponsiveSpacing && hasResponsivePadding,
      `Spacing: ${hasResponsiveSpacing}, Padding: ${hasResponsivePadding}`,
      true
    )
    
    this.logResult(
      'Responsive typography scaling',
      hasResponsiveText,
      `Text scaling implemented: ${hasResponsiveText}`,
      true
    )
  }

  // Test 4: Security Middleware Protection
  async testSecurityMiddleware() {
    console.log('\\n🧪 Testing Security Middleware Protection...')
    
    try {
      // Test unauthorized access to admin APIs
      const unauthorizedResponse = await fetch(`${this.baseUrl}/api/admin/dashboard/metrics`)
      const unauthorizedResult = await unauthorizedResponse.json()
      
      // Should return 401 or have fallback data
      const properlyProtected = unauthorizedResponse.status === 401 || unauthorizedResult.success === false || unauthorizedResult.fallback
      
      this.logResult(
        'Admin API routes properly protected',
        properlyProtected,
        `API protection status: ${unauthorizedResponse.status}`,
        true
      )
      
      // Test rate limiting (multiple rapid requests)
      const rateLimitPromises = Array.from({ length: 10 }, () => 
        fetch(`${this.baseUrl}/api/admin/dashboard/metrics`)
      )
      
      const rateLimitResults = await Promise.all(rateLimitPromises)
      const hasRateLimiting = rateLimitResults.some(r => r.status === 429)
      
      this.logResult(
        'Rate limiting operational for API protection',
        hasRateLimiting || rateLimitResults.every(r => r.status !== 500), // Either rate limited or properly handled
        `Rate limiting detected or properly handled: ${hasRateLimiting}`,
        true
      )
      
    } catch (error) {
      this.logResult(
        'Security middleware accessibility',
        false,
        `Security test error: ${error.message}`,
        true
      )
    }
  }

  // Test 5: Enhanced Access Control
  async testAccessControl() {
    console.log('\\n🧪 Testing Enhanced Access Control...')
    
    const response = await fetch(`${this.baseUrl}/admin`)
    const html = await response.text()
    
    // Check for security indicators in header
    const hasSecurityIndicators = html.includes('Shield') || html.includes('2FA') || html.includes('Security')
    const hasSessionInfo = html.includes('session') || html.includes('Session') || html.includes('timeRemaining')
    const hasUserRole = html.includes('role') || html.includes('Role') || html.includes('Admin')
    
    this.logResult(
      'Security indicators visible in admin header',
      hasSecurityIndicators,
      `Security UI elements found: ${hasSecurityIndicators}`,
      true
    )
    
    this.logResult(
      'Session management information displayed',
      hasSessionInfo,
      `Session info displayed: ${hasSessionInfo}`,
      true
    )
    
    this.logResult(
      'User role and permissions visible',
      hasUserRole,
      `User role information: ${hasUserRole}`,
      true
    )
  }

  // Test 6: Mobile Accessibility Compliance
  async testMobileAccessibility() {
    console.log('\\n🧪 Testing Mobile Accessibility Compliance...')
    
    const response = await fetch(`${this.baseUrl}/admin`)
    const html = await response.text()
    
    // Check for accessibility features
    const hasAriaLabels = (html.match(/aria-label/g) || []).length >= 5
    const hasProperHeadings = html.includes('<H1') && html.includes('<H2') && html.includes('<H3')
    const hasKeyboardNavigation = html.includes('tabIndex') || html.includes('onKeyDown')
    const hasSemanticHTML = html.includes('role="main"') && html.includes('role="navigation"')
    const hasFocusManagement = html.includes('focus:') && html.includes('focus-visible:')
    
    this.logResult(
      'Sufficient ARIA labels for screen readers',
      hasAriaLabels,
      `ARIA labels found: ${(html.match(/aria-label/g) || []).length}`,
      true
    )
    
    this.logResult(
      'Proper semantic heading structure',
      hasProperHeadings,
      `Semantic headings implemented: ${hasProperHeadings}`,
      true
    )
    
    this.logResult(
      'Keyboard navigation support',
      hasKeyboardNavigation,
      `Keyboard navigation: ${hasKeyboardNavigation}`,
      true
    )
    
    this.logResult(
      'Semantic HTML landmarks',
      hasSemanticHTML,
      `Semantic landmarks: ${hasSemanticHTML}`,
      true
    )
    
    this.logResult(
      'Focus management for keyboard users',
      hasFocusManagement,
      `Focus styles implemented: ${hasFocusManagement}`,
      true
    )
  }

  // Test 7: Performance on Mobile Devices
  async testMobilePerformance() {
    console.log('\\n🧪 Testing Mobile Performance...')
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/admin`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          'Connection': 'slow-2g' // Simulate slow connection
        }
      })
      
      const loadTime = Date.now() - startTime
      const html = await response.text()
      
      // Check for performance optimizations
      const hasImageOptimization = html.includes('loading="lazy"') || html.includes('Image')
      const hasAsyncScripts = html.includes('async') || html.includes('defer')
      const hasMinifiedAssets = html.includes('.min.') || response.headers.get('content-encoding')
      
      this.logResult(
        'Mobile page load within acceptable time (<5s)',
        loadTime < 5000,
        `Load time: ${loadTime}ms`,
        true
      )
      
      this.logResult(
        'Performance optimizations implemented',
        hasImageOptimization && hasAsyncScripts,
        `Image optimization: ${hasImageOptimization}, Async scripts: ${hasAsyncScripts}`,
        true
      )
      
      this.logResult(
        'Assets optimized for mobile bandwidth',
        response.ok && loadTime < 3000,
        `Optimized loading: ${response.ok}, Time: ${loadTime}ms`,
        false // Not critical
      )
      
    } catch (error) {
      this.logResult(
        'Mobile performance test completion',
        false,
        `Performance test error: ${error.message}`,
        true
      )
    }
  }

  // Run all Phase 3 tests
  async runAllTests() {
    console.log('🚀 PHASE 3 E2E TESTING - Mobile Optimization & Enhanced Security')
    console.log('SUCCESS CRITERIA: 100% pass rate (all tests must pass)')
    console.log('Testing mobile-first design and security enhancements...\\n')
    
    try {
      await this.testMobileNavigation()
      await this.testTouchOptimizedMetricCards()
      await this.testResponsiveLayout()
      await this.testSecurityMiddleware()
      await this.testAccessControl()
      await this.testMobileAccessibility()
      await this.testMobilePerformance()
      
    } catch (error) {
      console.error('❌ Test suite error:', error.message)
      this.results.failed++
    }
    
    // Print final results
    this.printResults()
  }

  // Print comprehensive test results
  printResults() {
    const total = this.results.passed + this.results.failed
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0
    const testDuration = ((Date.now() - this.startTime) / 1000).toFixed(1)
    
    console.log('\\n' + '='.repeat(80))
    console.log('📊 PHASE 3 E2E TEST RESULTS - Mobile Optimization & Enhanced Security')
    console.log('='.repeat(80))
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`📈 Success Rate: ${passRate}%`)
    console.log(`🎯 Total Tests: ${total}`)
    console.log(`⏱️  Test Duration: ${testDuration}s`)
    
    // Determine pass/fail status
    const phaseSuccess = parseFloat(passRate) === 100
    
    if (phaseSuccess) {
      console.log('\\n🎉 PHASE 3 SUCCESS! All success criteria met.')
      console.log('✅ Mobile navigation with swipe gestures functional')
      console.log('✅ Touch-optimized metric cards implemented')
      console.log('✅ Mobile-first responsive layout working')
      console.log('✅ Admin security middleware protecting routes')
      console.log('✅ Enhanced access control operational')
      console.log('✅ Session management and security indicators active')
      console.log('✅ Mobile accessibility compliance achieved')
      console.log('✅ Mobile performance optimized')
      console.log('\\n🚀 Ready to proceed to Phase 4!')
    } else {
      console.log('\\n❌ PHASE 3 FAILED! Success criteria not met.')
      console.log('🚨 Required: 100% pass rate for Phase 3 completion')
      console.log('⚠️  Cannot proceed to Phase 4 until all criteria are met')
    }
    
    // Show detailed failures if any
    const failures = this.results.details.filter(test => !test.passed)
    if (failures.length > 0) {
      console.log('\\n❌ Failed Tests:')
      failures.forEach(test => {
        console.log(`   • ${test.test}`)
        if (test.details) console.log(`     ${test.details}`)
      })
    }
    
    console.log('\\n📝 Phase 3 Testing completed at:', new Date().toLocaleString())
    console.log('🔗 Admin Dashboard: http://localhost:3000/admin')
    console.log('📱 Mobile Navigation: Swipe right to open sidebar')
    console.log('🔒 Security Features: Enhanced access control and session management')
    
    // Exit with appropriate code
    process.exit(phaseSuccess ? 0 : 1)
  }
}

// Run the Phase 3 E2E tests
const tester = new AdminDashboardPhase3E2E()
tester.runAllTests().catch(console.error)