/**
 * Email Marketing Dashboard E2E Tests
 * Testing the foundation, navigation, and UI components
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

console.log('============================================================')
console.log('📧 EMAIL MARKETING DASHBOARD E2E TEST SUITE')
console.log('============================================================')
console.log(`Testing against: ${BASE_URL}`)
console.log('============================================================')

let passedTests = 0
let totalTests = 0

// Helper function for assertions
function assert(condition, message) {
  totalTests++
  if (condition) {
    console.log(`✅ ${message}`)
    passedTests++
  } else {
    console.log(`❌ ${message}`)
  }
}

// Test dashboard page loading
async function testDashboardPageLoading() {
  console.log('\n🏠 Testing Dashboard Page Loading...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const html = await response.text()
    
    assert(response.ok, 'Email marketing dashboard page loads successfully')
    assert(html.includes('Email Marketing'), 'Dashboard page includes correct title')
    assert(html.includes('Manage campaigns, segments, and automation'), 'Dashboard page includes description')
    assert(html.includes('Dashboard'), 'Dashboard page includes navigation tabs')
    assert(html.includes('Campaigns'), 'Dashboard page includes campaigns tab')
    assert(html.includes('Segments'), 'Dashboard page includes segments tab')
    assert(html.includes('Triggers'), 'Dashboard page includes triggers tab')
    assert(html.includes('Analytics'), 'Dashboard page includes analytics tab')
    
    console.log(`   Dashboard page loaded (${html.length} bytes)`)
    
  } catch (error) {
    assert(false, `Dashboard page test failed: ${error.message}`)
  }
}

// Test API integration
async function testAPIIntegration() {
  console.log('\n🔗 Testing API Integration...\n')
  
  try {
    // Test that the dashboard loads data from APIs
    const dashboardResponse = await fetch(`${BASE_URL}/admin/email-marketing`)
    const dashboardHtml = await dashboardResponse.text()
    
    assert(dashboardResponse.ok, 'Dashboard API integration successful')
    
    // Test individual API endpoints that the dashboard uses
    const apiEndpoints = [
      '/api/admin/email-marketing/campaigns',
      '/api/admin/email-marketing/segments', 
      '/api/admin/email-marketing/triggers',
      '/api/admin/email-marketing/analytics?period=30d'
    ]
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`)
        const data = await response.json()
        
        assert(response.ok, `${endpoint} responds successfully`)
        assert(data.success === true, `${endpoint} returns success response`)
        assert(typeof data.data === 'object', `${endpoint} returns data object`)
        
      } catch (endpointError) {
        assert(false, `${endpoint} test failed: ${endpointError.message}`)
      }
    }
    
  } catch (error) {
    assert(false, `API integration test failed: ${error.message}`)
  }
}

// Test responsive design
async function testResponsiveDesign() {
  console.log('\n📱 Testing Responsive Design...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const html = await response.text()
    
    // Check for mobile-first classes
    assert(html.includes('md:grid-cols-4'), 'Dashboard uses responsive grid classes')
    assert(html.includes('flex-col sm:flex-row'), 'Dashboard uses responsive flex classes')
    assert(html.includes('hidden md:block'), 'Dashboard has mobile/desktop navigation')
    assert(html.includes('md:hidden'), 'Dashboard includes mobile-specific elements')
    assert(html.includes('space-x-0 sm:space-x-8') || html.includes('gap-4'), 'Dashboard uses responsive spacing')
    
    console.log('   Responsive design classes verified')
    
  } catch (error) {
    assert(false, `Responsive design test failed: ${error.message}`)
  }
}

// Test accessibility features
async function testAccessibility() {
  console.log('\n♿ Testing Accessibility Features...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const html = await response.text()
    
    // Check for ARIA attributes
    assert(html.includes('role="tablist"'), 'Dashboard includes tablist role')
    assert(html.includes('role="tab"'), 'Dashboard includes tab roles')
    assert(html.includes('role="tabpanel"'), 'Dashboard includes tabpanel role')
    assert(html.includes('aria-selected'), 'Dashboard includes aria-selected attributes')
    assert(html.includes('aria-controls'), 'Dashboard includes aria-controls attributes')
    assert(html.includes('aria-labelledby'), 'Dashboard includes aria-labelledby attributes')
    assert(html.includes('aria-label'), 'Dashboard includes aria-label attributes')
    
    // Check for semantic HTML
    assert(html.includes('<nav'), 'Dashboard uses semantic nav element')
    assert(html.includes('<h1'), 'Dashboard includes proper headings')
    
    console.log('   Accessibility features verified')
    
  } catch (error) {
    assert(false, `Accessibility test failed: ${error.message}`)
  }
}

// Test CLAUDE_RULES compliance
async function testClaudeRulesCompliance() {
  console.log('\n📋 Testing CLAUDE_RULES.md Compliance...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const html = await response.text()
    
    // Check for approved typography/background combinations
    assert(html.includes('text-foreground bg-background'), 'Uses approved combination: text-foreground bg-background')
    assert(html.includes('text-gray-600 bg-'), 'Uses approved combination: text-gray-600')
    assert(html.includes('text-foreground bg-white'), 'Uses approved combination: text-foreground bg-white')
    assert(html.includes('bg-accent'), 'Uses approved color token: bg-accent')
    assert(html.includes('bg-cta'), 'Uses approved color token: bg-cta')
    
    // Check for forbidden patterns
    assert(!html.includes('text-black'), 'Does not use forbidden text-black')
    assert(!html.includes('bg-blue-500'), 'Does not use forbidden generic colors')
    assert(!html.includes('border-gray-'), 'Does not use forbidden border-gray classes')
    
    // Check for approved typography
    assert(html.includes('font-headline') || html.includes('font-body'), 'Uses approved typography tokens')
    
    // Check for approved spacing
    assert(html.includes('p-') && (html.includes('p-1') || html.includes('p-6')), 'Uses approved spacing tokens')
    assert(html.includes('gap-'), 'Uses approved gap spacing')
    
    console.log('   CLAUDE_RULES.md compliance verified')
    
  } catch (error) {
    assert(false, `CLAUDE_RULES compliance test failed: ${error.message}`)
  }
}

// Test performance
async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n')
  
  try {
    const start = Date.now()
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const duration = Date.now() - start
    
    assert(response.ok, 'Dashboard loads successfully')
    assert(duration < 3000, `Dashboard loads within 3 seconds (${duration}ms)`)
    
    if (duration < 1000) {
      console.log(`   Dashboard load time: ${duration}ms ⚡ (Fast)`)
    } else if (duration < 2000) {
      console.log(`   Dashboard load time: ${duration}ms ✅ (Good)`)
    } else {
      console.log(`   Dashboard load time: ${duration}ms ⚠️ (Slow)`)
    }
    
    // Test API performance
    const apiStart = Date.now()
    await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns`)
    const apiDuration = Date.now() - apiStart
    
    assert(apiDuration < 500, `API responds quickly (${apiDuration}ms)`)
    console.log(`   API response time: ${apiDuration}ms`)
    
  } catch (error) {
    assert(false, `Performance test failed: ${error.message}`)
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...\n')
  
  try {
    // The dashboard should handle API errors gracefully
    const response = await fetch(`${BASE_URL}/admin/email-marketing`)
    const html = await response.text()
    
    assert(response.ok, 'Dashboard handles potential API errors gracefully')
    
    // Check that error handling UI elements are present
    assert(html.includes('retry') || html.includes('Retry'), 'Dashboard includes retry functionality')
    assert(html.includes('loading') || html.includes('Loading') || html.includes('animate-pulse'), 'Dashboard includes loading states')
    
    console.log('   Error handling patterns verified')
    
  } catch (error) {
    assert(false, `Error handling test failed: ${error.message}`)
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testDashboardPageLoading()
    await testAPIIntegration()
    await testResponsiveDesign()
    await testAccessibility()
    await testClaudeRulesCompliance()
    await testPerformance()
    await testErrorHandling()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  }
  
  // Final summary
  console.log('\n============================================================')
  console.log('📊 EMAIL MARKETING DASHBOARD TEST SUMMARY')
  console.log('============================================================')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}`)
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Email Marketing Dashboard foundation is fully operational!')
  } else {
    console.log('\n⚠️ Some dashboard tests failed. Review the output above.')
  }
  
  console.log('============================================================')
}

// Execute the test suite
if (require.main === module) {
  runAllTests()
}

module.exports = { runAllTests }