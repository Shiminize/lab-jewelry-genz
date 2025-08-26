/**
 * Phase 2 E2E Test Suite
 * Comprehensive testing for Analytics, Performance Monitoring, and Advanced Search
 * 
 * Run with: node test-phase2-e2e.js
 */

const { MongoClient } = require('mongodb')

// Test configuration
const BASE_URL = 'http://localhost:3000'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev'

// Test tracking
let totalTests = 0
let passedTests = 0
let failedTests = []

// Helper function to log test results
function logTest(testName, passed, error = null) {
  totalTests++
  if (passed) {
    passedTests++
    console.log(`✅ ${testName}`)
  } else {
    failedTests.push({ name: testName, error })
    console.log(`❌ ${testName}`)
    if (error) console.error(`   Error: ${error.message || error}`)
  }
}

// Helper to check API response format (CLAUDE_RULES compliance)
function validateApiResponse(response, testName) {
  if (!response.hasOwnProperty('success')) {
    throw new Error('Missing success field in API response')
  }
  if (!response.hasOwnProperty('meta')) {
    throw new Error('Missing meta field in API response')
  }
  if (!response.meta.timestamp || !response.meta.version) {
    throw new Error('Invalid meta object structure')
  }
  if (response.success && !response.hasOwnProperty('data')) {
    throw new Error('Successful response missing data field')
  }
  if (!response.success && !response.hasOwnProperty('error')) {
    throw new Error('Failed response missing error field')
  }
  return true
}

// Test Suite 1: Analytics Event Tracking
async function testAnalyticsEventTracking() {
  console.log('\n📊 Testing Analytics Event Tracking...\n')
  
  // Test 1: Track page view event
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        sessionId: `test_session_${Date.now()}`,
        properties: {
          page: '/test',
          referrer: 'https://google.com'
        },
        metadata: {
          userAgent: 'Test Agent',
          ip: '127.0.0.1',
          page: '/test',
          device: 'desktop'
        }
      })
    })
    
    const data = await response.json()
    validateApiResponse(data, 'Track page view')
    
    if (data.success && data.data.tracked) {
      logTest('Track page view event', true)
    } else {
      throw new Error('Event not tracked successfully')
    }
  } catch (error) {
    logTest('Track page view event', false, error)
  }
  
  // Test 2: Track product view event
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'product_view',
        sessionId: `test_session_${Date.now()}`,
        properties: {
          productId: 'test_product_123',
          productName: 'Test Diamond Ring',
          category: 'rings'
        },
        metadata: {
          userAgent: 'Test Agent',
          ip: '127.0.0.1',
          page: '/products/test',
          device: 'mobile'
        }
      })
    })
    
    const data = await response.json()
    if (data.success) {
      logTest('Track product view event', true)
    } else {
      throw new Error('Product view event failed')
    }
  } catch (error) {
    logTest('Track product view event', false, error)
  }
  
  // Test 3: Track search query event
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'search_query',
        sessionId: `test_session_${Date.now()}`,
        properties: {
          query: 'diamond rings',
          resultsCount: 15,
          filters: ['category:rings', 'material:gold']
        },
        metadata: {
          userAgent: 'Test Agent',
          ip: '127.0.0.1',
          page: '/search',
          device: 'tablet'
        }
      })
    })
    
    const data = await response.json()
    if (data.success) {
      logTest('Track search query event', true)
    } else {
      throw new Error('Search query event failed')
    }
  } catch (error) {
    logTest('Track search query event', false, error)
  }
  
  // Test 4: Get analytics events data
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events?timeframe=24h`)
    const data = await response.json()
    validateApiResponse(data, 'Get analytics events')
    
    if (data.success && data.data.events) {
      logTest('Get analytics events data', true)
    } else {
      throw new Error('Failed to retrieve analytics events')
    }
  } catch (error) {
    logTest('Get analytics events data', false, error)
  }
  
  // Test 5: Invalid event validation
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'invalid_event_type',
        sessionId: 'test'
      })
    })
    
    const data = await response.json()
    if (!data.success && data.error.code === 'VALIDATION_ERROR') {
      logTest('Event validation error handling', true)
    } else {
      throw new Error('Validation should have failed')
    }
  } catch (error) {
    logTest('Event validation error handling', false, error)
  }
}

// Test Suite 2: Performance Monitoring
async function testPerformanceMonitoring() {
  console.log('\n⚡ Testing Performance Monitoring...\n')
  
  // Test 1: Track performance metrics
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiResponseTime: 125,
        databaseQueryTime: 45,
        errorRate: 0,
        endpoint: '/api/products',
        memoryUsage: 1024000
      })
    })
    
    const data = await response.json()
    validateApiResponse(data, 'Track performance metrics')
    
    if (data.success && data.data.tracked) {
      logTest('Track performance metrics', true)
    } else {
      throw new Error('Performance metrics not tracked')
    }
  } catch (error) {
    logTest('Track performance metrics', false, error)
  }
  
  // Test 2: Get performance insights
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/performance`)
    const data = await response.json()
    validateApiResponse(data, 'Get performance insights')
    
    if (data.success && data.data.healthScore !== undefined) {
      logTest('Get performance insights', true)
      console.log(`   Health Score: ${data.data.healthScore}/100`)
    } else {
      throw new Error('Failed to get performance insights')
    }
  } catch (error) {
    logTest('Get performance insights', false, error)
  }
  
  // Test 3: Performance recommendations
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/performance`)
    const data = await response.json()
    
    if (data.success && Array.isArray(data.data.recommendations)) {
      logTest('Get performance recommendations', true)
      if (data.data.recommendations.length > 0) {
        console.log(`   Recommendations: ${data.data.recommendations[0]}`)
      }
    } else {
      throw new Error('Failed to get recommendations')
    }
  } catch (error) {
    logTest('Get performance recommendations', false, error)
  }
}

// Test Suite 3: Advanced Search
async function testAdvancedSearch() {
  console.log('\n🔍 Testing Advanced Search...\n')
  
  // Test 1: Basic search
  try {
    const response = await fetch(`${BASE_URL}/api/search?q=ring&limit=10`)
    const data = await response.json()
    validateApiResponse(data, 'Basic search')
    
    if (data.success && data.data.products) {
      logTest('Basic product search', true)
      console.log(`   Found ${data.data.products.length} products`)
    } else {
      throw new Error('Search failed')
    }
  } catch (error) {
    logTest('Basic product search', false, error)
  }
  
  // Test 2: Search with filters
  try {
    const params = new URLSearchParams({
      q: 'diamond',
      category: 'rings',
      priceMin: '500',
      priceMax: '5000',
      inStock: 'true',
      sortBy: 'price',
      sortOrder: 'asc'
    })
    
    const response = await fetch(`${BASE_URL}/api/search?${params}`)
    const data = await response.json()
    
    if (data.success) {
      logTest('Search with filters', true)
      console.log(`   Filtered results: ${data.data.resultsFound} items`)
    } else {
      throw new Error('Filtered search failed')
    }
  } catch (error) {
    logTest('Search with filters', false, error)
  }
  
  // Test 3: Faceted search
  try {
    const response = await fetch(`${BASE_URL}/api/search?q=jewelry&facets=true`)
    const data = await response.json()
    
    if (data.success && data.data.facets) {
      logTest('Faceted search', true)
      const facetKeys = Object.keys(data.data.facets)
      console.log(`   Facets available: ${facetKeys.join(', ')}`)
    } else {
      throw new Error('Faceted search failed')
    }
  } catch (error) {
    logTest('Faceted search', false, error)
  }
  
  // Test 4: Search autocomplete
  try {
    const response = await fetch(`${BASE_URL}/api/search/autocomplete?q=dia&limit=5`)
    const data = await response.json()
    validateApiResponse(data, 'Search autocomplete')
    
    if (data.success && Array.isArray(data.data.suggestions)) {
      logTest('Search autocomplete', true)
      console.log(`   Suggestions: ${data.data.suggestions.length}`)
    } else {
      throw new Error('Autocomplete failed')
    }
  } catch (error) {
    logTest('Search autocomplete', false, error)
  }
  
  // Test 5: Empty search handling
  try {
    const response = await fetch(`${BASE_URL}/api/search?q=`)
    const data = await response.json()
    
    if (data.success) {
      logTest('Empty search handling', true)
    } else {
      throw new Error('Empty search should return all products')
    }
  } catch (error) {
    logTest('Empty search handling', false, error)
  }
  
  // Test 6: Search pagination
  try {
    const response = await fetch(`${BASE_URL}/api/search?page=2&limit=5`)
    const data = await response.json()
    
    if (data.success && data.data.pagination) {
      const { page, limit, total, totalPages } = data.data.pagination
      logTest('Search pagination', true)
      console.log(`   Page ${page}/${totalPages}, ${total} total items`)
    } else {
      throw new Error('Pagination failed')
    }
  } catch (error) {
    logTest('Search pagination', false, error)
  }
}

// Test Suite 4: Analytics Dashboard
async function testAnalyticsDashboard() {
  console.log('\n📈 Testing Analytics Dashboard...\n')
  
  // Test 1: Get dashboard data
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/dashboard?timeframe=7d`)
    const data = await response.json()
    validateApiResponse(data, 'Get dashboard data')
    
    if (data.success && data.data.summary) {
      logTest('Get dashboard data', true)
      console.log(`   Total events: ${data.data.summary.events?.total || 0}`)
      console.log(`   Conversion rate: ${data.data.summary.conversions?.rate || 0}%`)
    } else {
      throw new Error('Dashboard data retrieval failed')
    }
  } catch (error) {
    logTest('Get dashboard data', false, error)
  }
  
  // Test 2: Real-time data
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/dashboard?timeframe=24h&realtime=true`)
    const data = await response.json()
    
    if (data.success) {
      logTest('Get real-time dashboard data', true)
      if (data.data.realtime) {
        console.log(`   Real-time events available`)
      }
    } else {
      throw new Error('Real-time data failed')
    }
  } catch (error) {
    logTest('Get real-time dashboard data', false, error)
  }
  
  // Test 3: Dashboard insights
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/dashboard?timeframe=30d`)
    const data = await response.json()
    
    if (data.success && Array.isArray(data.data.insights)) {
      logTest('Get dashboard insights', true)
      if (data.data.insights.length > 0) {
        console.log(`   Insight: ${data.data.insights[0]}`)
      }
    } else {
      throw new Error('Dashboard insights failed')
    }
  } catch (error) {
    logTest('Get dashboard insights', false, error)
  }
}

// Test Suite 5: Database Integration
async function testDatabaseIntegration() {
  console.log('\n💾 Testing Database Integration...\n')
  
  let client
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()
    
    // Test 1: Check analytics collections exist
    const collections = await db.listCollections().toArray()
    const analyticsCollections = [
      'analyticsEvents',
      'performanceMetrics',
      'businessMetrics',
      'userJourneys',
      'conversionFunnel'
    ]
    
    let allCollectionsExist = true
    for (const collName of analyticsCollections) {
      const exists = collections.some(c => c.name === collName)
      if (!exists) {
        console.log(`   Missing collection: ${collName}`)
        allCollectionsExist = false
      }
    }
    
    logTest('Analytics collections exist', allCollectionsExist)
    
    // Test 2: Check indexes
    try {
      const eventIndexes = await db.collection('analyticsEvents').indexes()
      const hasTimestampIndex = eventIndexes.some(idx => 
        idx.key && idx.key.timestamp !== undefined
      )
      logTest('Analytics indexes configured', hasTimestampIndex)
    } catch (error) {
      logTest('Analytics indexes configured', false, error)
    }
    
    // Test 3: Check TTL indexes
    try {
      const eventIndexes = await db.collection('analyticsEvents').indexes()
      const hasTTL = eventIndexes.some(idx => 
        idx.expireAfterSeconds !== undefined
      )
      logTest('TTL indexes for data retention', hasTTL)
      if (hasTTL) {
        const ttlIndex = eventIndexes.find(idx => idx.expireAfterSeconds !== undefined)
        console.log(`   Data retention: ${ttlIndex.expireAfterSeconds / 86400} days`)
      }
    } catch (error) {
      logTest('TTL indexes for data retention', false, error)
    }
    
  } catch (error) {
    logTest('Database connection', false, error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Test Suite 6: Performance Benchmarks
async function testPerformanceBenchmarks() {
  console.log('\n🏃 Testing Performance Benchmarks...\n')
  
  // Test 1: Search response time
  try {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/search?q=diamond&limit=20`)
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    const passed = data.success && responseTime < 300 // CLAUDE_RULES requirement
    logTest(`Search response time < 300ms (${responseTime}ms)`, passed)
  } catch (error) {
    logTest('Search response time benchmark', false, error)
  }
  
  // Test 2: Autocomplete response time
  try {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/search/autocomplete?q=ring`)
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    const passed = data.success && responseTime < 100
    logTest(`Autocomplete response time < 100ms (${responseTime}ms)`, passed)
  } catch (error) {
    logTest('Autocomplete response time benchmark', false, error)
  }
  
  // Test 3: Analytics event tracking response time
  try {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        sessionId: 'benchmark_test',
        properties: { page: '/benchmark' },
        metadata: {
          userAgent: 'Benchmark',
          ip: '127.0.0.1',
          page: '/benchmark',
          device: 'desktop'
        }
      })
    })
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    const passed = data.success && responseTime < 50
    logTest(`Event tracking response time < 50ms (${responseTime}ms)`, passed)
  } catch (error) {
    logTest('Event tracking response time benchmark', false, error)
  }
  
  // Test 4: Dashboard data aggregation
  try {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/analytics/dashboard?timeframe=7d`)
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    const passed = data.success && responseTime < 500
    logTest(`Dashboard aggregation < 500ms (${responseTime}ms)`, passed)
  } catch (error) {
    logTest('Dashboard aggregation benchmark', false, error)
  }
}

// Test Suite 7: Error Handling
async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...\n')
  
  // Test 1: Invalid search parameters
  try {
    const response = await fetch(`${BASE_URL}/api/search?limit=500`) // Over limit
    const data = await response.json()
    
    // Should still work but limit to max
    if (data.success && data.data.pagination.limit <= 100) {
      logTest('Search limit validation', true)
    } else {
      throw new Error('Limit validation failed')
    }
  } catch (error) {
    logTest('Search limit validation', false, error)
  }
  
  // Test 2: Invalid event type
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'not_a_valid_event',
        sessionId: 'error_test'
      })
    })
    
    const data = await response.json()
    if (!data.success && data.error) {
      logTest('Invalid event type handling', true)
    } else {
      throw new Error('Should have returned error')
    }
  } catch (error) {
    logTest('Invalid event type handling', false, error)
  }
  
  // Test 3: Missing required fields
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view'
        // Missing sessionId
      })
    })
    
    const data = await response.json()
    if (!data.success && data.error.code === 'VALIDATION_ERROR') {
      logTest('Missing required fields validation', true)
    } else {
      throw new Error('Should have returned validation error')
    }
  } catch (error) {
    logTest('Missing required fields validation', false, error)
  }
}

// Main test runner
async function runAllTests() {
  console.log('=' .repeat(60))
  console.log('🧪 PHASE 2 E2E TEST SUITE')
  console.log('=' .repeat(60))
  console.log(`Testing against: ${BASE_URL}`)
  console.log(`MongoDB: ${MONGODB_URI}`)
  console.log('=' .repeat(60))
  
  // Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/api/health`)
    if (!response.ok) {
      throw new Error('Server health check failed')
    }
    console.log('✅ Server is running\n')
  } catch (error) {
    console.error('❌ Server is not running or health check failed')
    console.error('Please ensure the development server is running: npm run dev')
    process.exit(1)
  }
  
  // Run all test suites
  await testAnalyticsEventTracking()
  await testPerformanceMonitoring()
  await testAdvancedSearch()
  await testAnalyticsDashboard()
  await testDatabaseIntegration()
  await testPerformanceBenchmarks()
  await testErrorHandling()
  
  // Print summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(60))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests.length}`)
  
  if (failedTests.length > 0) {
    console.log('\nFailed Tests:')
    failedTests.forEach(test => {
      console.log(`  - ${test.name}`)
      if (test.error) {
        console.log(`    ${test.error.message || test.error}`)
      }
    })
  }
  
  const passRate = ((passedTests / totalTests) * 100).toFixed(1)
  console.log(`\nPass Rate: ${passRate}%`)
  
  if (passRate >= 80) {
    console.log('\n🎉 Phase 2 Systems are operational!')
  } else if (passRate >= 60) {
    console.log('\n⚠️ Phase 2 Systems have some issues but are mostly functional')
  } else {
    console.log('\n❌ Phase 2 Systems have critical issues that need attention')
  }
  
  process.exit(failedTests.length > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error)
  process.exit(1)
})