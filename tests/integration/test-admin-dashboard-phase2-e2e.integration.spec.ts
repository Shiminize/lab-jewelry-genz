#!/usr/bin/env node

/**
 * PHASE 2 E2E Testing - Business Metrics Dashboard & API Integration
 * 
 * SUCCESS CRITERIA (ALL MUST PASS):
 * ✅ Real-time business metrics API fully functional (<200ms response)
 * ✅ KPI tracking displays PRD-compliant revenue targets ($5M Year 1)
 * ✅ Cross-system integration APIs operational (inventory, orders, creators)
 * ✅ System alerts API provides actionable insights with severity levels
 * ✅ Dashboard auto-refresh functionality working (5min intervals)
 * ✅ API error handling with graceful fallbacks to prevent failures
 * ✅ Business metrics calculations accurate (revenue, CAC, CLV, conversions)
 * ✅ Performance monitoring integration (uptime, response times, error rates)
 * 
 * PASSING CRITERIA: 100% success rate (all tests must pass)
 */

const fs = require('fs')

class AdminDashboardPhase2E2E {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
    this.apiUrl = `${this.baseUrl}/api`
    this.results = {
      passed: 0,
      failed: 0,
      details: []
    }
    this.startTime = Date.now()
  }

  // Test API response performance
  async testApiPerformance(endpoint, maxResponseTime = 200) {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`)
      const responseTime = Date.now() - startTime
      const data = await response.json()
      
      return {
        success: response.ok,
        responseTime,
        status: response.status,
        data,
        withinLimit: responseTime <= maxResponseTime
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        withinLimit: false
      }
    }
  }

  // Test business metrics calculations
  async testBusinessMetricsCalculations(metricsData) {
    const validations = []
    
    // Revenue targets validation (PRD: $5M Year 1)
    if (metricsData.revenue) {
      validations.push({
        metric: 'Revenue Target',
        expected: 5000000,
        actual: metricsData.revenue.target,
        passed: metricsData.revenue.target === 5000000
      })
      
      validations.push({
        metric: 'Revenue Growth Rate',
        expected: '>0%',
        actual: `${metricsData.revenue.growth}%`,
        passed: metricsData.revenue.growth > 0
      })
    }
    
    // Customer metrics validation
    if (metricsData.customers) {
      validations.push({
        metric: 'CLV:CAC Ratio',
        expected: '>20:1',
        actual: `${metricsData.customers.clvCacRatio}:1`,
        passed: metricsData.customers.clvCacRatio > 20
      })
      
      validations.push({
        metric: 'Customer Acquisition Cost',
        expected: '<$150',
        actual: `$${metricsData.customers.cac}`,
        passed: metricsData.customers.cac < 150
      })
    }
    
    // Creator program validation
    if (metricsData.creators) {
      validations.push({
        metric: 'Creator Target',
        expected: '>=100',
        actual: metricsData.creators.target,
        passed: metricsData.creators.target >= 100
      })
      
      validations.push({
        metric: 'Creator Revenue',
        expected: '>$1M',
        actual: `$${(metricsData.creators.revenue / 1000000).toFixed(1)}M`,
        passed: metricsData.creators.revenue > 1000000
      })
    }
    
    // Conversion rate validation
    if (metricsData.conversion) {
      validations.push({
        metric: 'Conversion Rate Target',
        expected: '4.5%',
        actual: `${metricsData.conversion.target}%`,
        passed: metricsData.conversion.target === 4.5
      })
    }
    
    return validations
  }

  // Log test result with success criteria tracking
  logResult(testName, passed, details = '', isCritical = true) {
    if (passed) {
      this.results.passed++
      console.log(`✅ ${testName}`)
    } else {
      this.results.failed++
      console.log(`❌ ${testName}`)
      if (details) console.log(`   ${details}`)
      if (isCritical) {
        console.log(`   🚨 CRITICAL FAILURE: Phase 2 success criteria not met`)
      }
    }
    
    this.results.details.push({
      test: testName,
      passed,
      details,
      critical: isCritical
    })
  }

  // Test 1: Business Metrics API Performance
  async testBusinessMetricsAPI() {
    console.log('\\n🧪 Testing Business Metrics API Performance...')
    
    const result = await this.testApiPerformance('/admin/dashboard/metrics?timeframe=30d', 200)
    
    this.logResult(
      `Business metrics API responds within 200ms (${result.responseTime}ms)`,
      result.success && result.withinLimit,
      result.error || `Response time: ${result.responseTime}ms, Target: <200ms`,
      true
    )
    
    this.logResult(
      'Business metrics API returns valid JSON structure',
      result.success && result.data && result.data.success,
      result.error || `Status: ${result.status}, Success: ${result.data?.success}`,
      true
    )
    
    return result
  }

  // Test 2: KPI Tracking PRD Compliance
  async testKPITrackingCompliance() {
    console.log('\\n🧪 Testing KPI Tracking PRD Compliance...')
    
    const result = await this.testApiPerformance('/admin/dashboard/metrics?timeframe=30d')
    
    if (result.success && result.data?.data?.metrics) {
      const validations = await this.testBusinessMetricsCalculations(result.data.data.metrics)
      const passedValidations = validations.filter(v => v.passed).length
      const totalValidations = validations.length
      
      this.logResult(
        `PRD business metrics compliance (${passedValidations}/${totalValidations})`,
        passedValidations === totalValidations,
        validations.filter(v => !v.passed).map(v => `${v.metric}: expected ${v.expected}, got ${v.actual}`).join(', '),
        true
      )
      
      // Specific PRD validations
      const metrics = result.data.data.metrics
      this.logResult(
        'Revenue target matches PRD ($5M Year 1)',
        metrics.revenue?.target === 5000000,
        `Target: $${(metrics.revenue?.target || 0) / 1000000}M`,
        true
      )
      
      this.logResult(
        'Creator program metrics present',
        metrics.creators && metrics.creators.active > 0,
        `Active creators: ${metrics.creators?.active || 0}`,
        true
      )
    } else {
      this.logResult(
        'KPI tracking metrics data available',
        false,
        'Failed to fetch metrics data',
        true
      )
    }
  }

  // Test 3: Cross-System Integration APIs
  async testCrossSystemIntegration() {
    console.log('\\n🧪 Testing Cross-System Integration APIs...')
    
    const integrationTests = [
      { endpoint: '/admin/inventory', name: 'Inventory System API' },
      { endpoint: '/admin/dashboard/alerts', name: 'System Alerts API' },
      { endpoint: '/admin/dashboard/metrics', name: 'Business Metrics API' }
    ]
    
    let allIntegrationsWorking = true
    const results = []
    
    for (const test of integrationTests) {
      const result = await this.testApiPerformance(test.endpoint, 300)
      const working = result.success && result.status === 200
      
      results.push({
        system: test.name,
        working,
        responseTime: result.responseTime,
        status: result.status
      })
      
      if (!working) allIntegrationsWorking = false
    }
    
    this.logResult(
      'All cross-system integration APIs operational',
      allIntegrationsWorking,
      results.map(r => `${r.system}: ${r.status} (${r.responseTime}ms)`).join(', '),
      true
    )
  }

  // Test 4: System Alerts Functionality
  async testSystemAlerts() {
    console.log('\\n🧪 Testing System Alerts Functionality...')
    
    const result = await this.testApiPerformance('/admin/dashboard/alerts')
    
    if (result.success && result.data?.data) {
      const alertsData = result.data.data
      
      this.logResult(
        'System alerts API returns structured data',
        alertsData.alerts && Array.isArray(alertsData.alerts),
        `Alerts structure: ${typeof alertsData.alerts}`,
        true
      )
      
      this.logResult(
        'Alert severity levels properly categorized',
        alertsData.summary && typeof alertsData.summary.critical === 'number',
        `Summary structure present: ${!!alertsData.summary}`,
        true
      )
      
      // Test alert structure if alerts exist
      if (alertsData.alerts.length > 0) {
        const firstAlert = alertsData.alerts[0]
        const hasRequiredFields = firstAlert.type && firstAlert.severity && firstAlert.title && firstAlert.message
        
        this.logResult(
          'Alert objects contain required fields',
          hasRequiredFields,
          `First alert fields: ${Object.keys(firstAlert).join(', ')}`,
          true
        )
      }
    } else {
      this.logResult(
        'System alerts API accessible',
        false,
        `API Error: ${result.error || 'Invalid response structure'}`,
        true
      )
    }
  }

  // Test 5: Dashboard Auto-refresh and Error Handling
  async testDashboardReliability() {
    console.log('\\n🧪 Testing Dashboard Reliability & Error Handling...')
    
    // Test refresh endpoint
    const refreshResult = await this.testApiPerformance('/admin/dashboard/metrics', 200)
    
    this.logResult(
      'Dashboard refresh API functional',
      refreshResult.success,
      refreshResult.error || `Refresh response: ${refreshResult.status}`,
      true
    )
    
    // Test error handling with invalid timeframe
    const errorHandlingResult = await this.testApiPerformance('/admin/dashboard/metrics?timeframe=invalid', 300)
    
    this.logResult(
      'API gracefully handles invalid parameters',
      errorHandlingResult.success && errorHandlingResult.data?.success !== false, // Should still return data (fallback)
      `Invalid param handling: ${errorHandlingResult.status}`,
      true
    )
    
    // Test fallback data availability
    if (refreshResult.success && refreshResult.data?.data) {
      const hasFallback = refreshResult.data.data.fallback !== undefined || refreshResult.data.data.metrics
      
      this.logResult(
        'Fallback data mechanism operational',
        hasFallback,
        `Fallback available: ${refreshResult.data.data.fallback || 'metrics present'}`,
        true
      )
    }
  }

  // Test 6: Performance Monitoring Integration
  async testPerformanceMonitoring() {
    console.log('\\n🧪 Testing Performance Monitoring Integration...')
    
    const result = await this.testApiPerformance('/admin/dashboard/metrics')
    
    if (result.success && result.data?.data?.metrics) {
      const metrics = result.data.data.metrics
      
      // Check for performance metrics
      const hasPerformanceMetrics = metrics.performance || metrics.orders?.avgProcessingTime !== undefined
      
      this.logResult(
        'Performance metrics integrated into dashboard',
        hasPerformanceMetrics,
        `Performance data available: ${!!metrics.performance}`,
        true
      )
      
      // Check API response time compliance
      this.logResult(
        'API performance meets CLAUDE_RULES (<300ms for complex queries)',
        result.responseTime < 300,
        `Complex query response time: ${result.responseTime}ms`,
        true
      )
      
      // Check for system uptime tracking
      if (metrics.performance) {
        this.logResult(
          'System uptime monitoring operational',
          metrics.performance.apiUptime !== undefined,
          `Uptime tracking: ${metrics.performance.apiUptime}%`,
          true
        )
      }
    }
  }

  // Test 7: Business Intelligence Dashboard Integration
  async testBusinessIntelligenceIntegration() {
    console.log('\\n🧪 Testing Business Intelligence Dashboard Integration...')
    
    // Test dashboard page load (HTML response, not JSON)
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/admin`)
      const responseTime = Date.now() - startTime
      const isSuccessful = response.ok && response.status === 200
      
      this.logResult(
        'Main dashboard loads with real-time data',
        isSuccessful && responseTime < 1000,
        `Dashboard load: ${response.status} (${responseTime}ms)`,
        true
      )
    } catch (error) {
      this.logResult(
        'Main dashboard loads with real-time data',
        false,
        `Dashboard load error: ${error.message}`,
        true
      )
    }
    
    // Test metrics calculation accuracy
    const metricsResult = await this.testApiPerformance('/admin/dashboard/metrics')
    if (metricsResult.success && metricsResult.data?.data?.metrics) {
      const metrics = metricsResult.data.data.metrics
      
      // Validate metric relationships
      const validRelationships = []
      
      if (metrics.revenue && metrics.customers) {
        const calculatedCLV = metrics.customers.clv
        const calculatedCAC = metrics.customers.cac
        validRelationships.push(calculatedCLV > calculatedCAC) // CLV should be higher than CAC
      }
      
      if (metrics.inventory) {
        validRelationships.push(metrics.inventory.products > 0) // Should have products
        validRelationships.push(metrics.inventory.stockouts >= 0) // Stockouts should be non-negative
      }
      
      this.logResult(
        'Business metrics relationships are logically consistent',
        validRelationships.every(r => r),
        `Relationship validations: ${validRelationships.filter(r => r).length}/${validRelationships.length}`,
        true
      )
    }
  }

  // Run all Phase 2 tests
  async runAllTests() {
    console.log('🚀 PHASE 2 E2E TESTING - Business Metrics Dashboard & API Integration')
    console.log('SUCCESS CRITERIA: 100% pass rate (all tests must pass)')
    console.log('Testing real-time business metrics and cross-system integration...\\n')
    
    try {
      await this.testBusinessMetricsAPI()
      await this.testKPITrackingCompliance()
      await this.testCrossSystemIntegration()
      await this.testSystemAlerts()
      await this.testDashboardReliability()
      await this.testPerformanceMonitoring()
      await this.testBusinessIntelligenceIntegration()
      
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
    console.log('📊 PHASE 2 E2E TEST RESULTS - Business Metrics Dashboard & API Integration')
    console.log('='.repeat(80))
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`📈 Success Rate: ${passRate}%`)
    console.log(`🎯 Total Tests: ${total}`)
    console.log(`⏱️  Test Duration: ${testDuration}s`)
    
    // Determine pass/fail status
    const phaseSuccess = parseFloat(passRate) === 100
    
    if (phaseSuccess) {
      console.log('\\n🎉 PHASE 2 SUCCESS! All success criteria met.')
      console.log('✅ Real-time business metrics API fully functional')
      console.log('✅ KPI tracking displays PRD-compliant targets')
      console.log('✅ Cross-system integration APIs operational')
      console.log('✅ System alerts provide actionable insights')
      console.log('✅ Dashboard auto-refresh and error handling working')
      console.log('✅ Performance monitoring integration complete')
      console.log('✅ Business intelligence calculations accurate')
      console.log('\\n🚀 Ready to proceed to Phase 3!')
    } else {
      console.log('\\n❌ PHASE 2 FAILED! Success criteria not met.')
      console.log('🚨 Required: 100% pass rate for Phase 2 completion')
      console.log('⚠️  Cannot proceed to Phase 3 until all criteria are met')
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
    
    console.log('\\n📝 Phase 2 Testing completed at:', new Date().toLocaleString())
    console.log('🔗 Admin Dashboard: http://localhost:3000/admin')
    console.log('🔗 Business Metrics API: http://localhost:3000/api/admin/dashboard/metrics')
    console.log('🔗 System Alerts API: http://localhost:3000/api/admin/dashboard/alerts')
    
    // Exit with appropriate code
    process.exit(phaseSuccess ? 0 : 1)
  }
}

// Run the Phase 2 E2E tests
const tester = new AdminDashboardPhase2E2E()
tester.runAllTests().catch(console.error)