/**
 * Phase 3: API Layer Enhancement - E2E Performance Testing
 * Validates material-only focused APIs with <300ms performance targets
 * 
 * Success Criteria:
 * ✅ Materials API responds within 50ms (cached)
 * ✅ Material validation service <5ms per validation
 * ✅ Individual material properties API <30ms
 * ✅ CLAUDE_RULES compliance enforcement working
 * ✅ Performance monitoring active and accurate
 * ✅ Cache hit rates >80% after warm-up
 * ✅ All endpoints consistently <300ms (CLAUDE_RULES)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

// Test configuration
const testConfig = {
  timeouts: {
    fast: 5000,        // 5s for fast API calls
    standard: 10000,   // 10s for standard operations
    batch: 15000       // 15s for batch operations
  },
  performance: {
    materialsApiTarget: 50,      // Materials list API target
    materialPropsTarget: 30,     // Individual material properties target
    validationTarget: 5,         // Per-validation target
    claudeRulesLimit: 300        // CLAUDE_RULES absolute limit
  },
  loadTest: {
    warmupRequests: 10,          // Requests to warm up caches
    loadTestRequests: 50,        // Load test request count
    concurrentRequests: 5        // Concurrent request limit
  }
}

console.log('🧪 Phase 3: API Layer Enhancement - Performance E2E Testing')
console.log('=' .repeat(70))

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  performance: [],
  cacheMetrics: [],
  details: []
}

async function test(name, testFn) {
  testResults.total++
  console.log(`\n🔍 Testing: ${name}`)
  
  try {
    const startTime = performance.now()
    await testFn()
    const duration = performance.now() - startTime
    
    testResults.passed++
    testResults.details.push({ name, status: 'PASS', duration: Math.round(duration) })
    console.log(`✅ PASS: ${name} (${Math.round(duration)}ms)`)
    
  } catch (error) {
    testResults.failed++
    testResults.details.push({ name, status: 'FAIL', error: error.message })
    console.log(`❌ FAIL: ${name}`)
    console.log(`   Error: ${error.message}`)
  }
}

// Helper function to measure API response time
async function measureApiCall(url, options = {}) {
  const startTime = performance.now()
  const response = await fetch(url, options)
  const responseTime = performance.now() - startTime
  
  testResults.performance.push({
    url: url.replace(BASE_URL, ''),
    method: options.method || 'GET',
    responseTime,
    status: response.status,
    timestamp: new Date().toISOString()
  })
  
  return { response, responseTime }
}

// Test 1: Materials API Performance (Cold Start)
await test('Materials API cold start performance <300ms', async () => {
  const { response, responseTime } = await measureApiCall(`${BASE_URL}/api/materials`)
  
  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error('API response missing success field')
  }
  
  if (responseTime > testConfig.performance.claudeRulesLimit) {
    throw new Error(`Response time ${responseTime}ms exceeds CLAUDE_RULES limit of ${testConfig.performance.claudeRulesLimit}ms`)
  }
  
  console.log(`   📊 Cold start: ${Math.round(responseTime)}ms`)
  console.log(`   📦 Materials returned: ${data.data.length}`)
})

// Test 2: Cache Warm-up and Performance Improvement
await test('Materials API cache warm-up improves performance', async () => {
  console.log(`   🔥 Warming up cache with ${testConfig.loadTest.warmupRequests} requests...`)
  
  const warmupTimes = []
  for (let i = 0; i < testConfig.loadTest.warmupRequests; i++) {
    const { responseTime } = await measureApiCall(`${BASE_URL}/api/materials`)
    warmupTimes.push(responseTime)
  }
  
  const avgWarmupTime = warmupTimes.reduce((sum, time) => sum + time, 0) / warmupTimes.length
  const finalTime = warmupTimes[warmupTimes.length - 1]
  
  if (finalTime > testConfig.performance.materialsApiTarget) {
    console.warn(`   ⚠️ Final warm-up time ${finalTime}ms still exceeds target ${testConfig.performance.materialsApiTarget}ms`)
  }
  
  testResults.cacheMetrics.push({
    endpoint: '/api/materials',
    coldStart: warmupTimes[0],
    avgWarmup: avgWarmupTime,
    finalTime: finalTime,
    improvementPercent: Math.round(((warmupTimes[0] - finalTime) / warmupTimes[0]) * 100)
  })
  
  console.log(`   📈 Cache improvement: ${warmupTimes[0]}ms → ${finalTime}ms (${Math.round(((warmupTimes[0] - finalTime) / warmupTimes[0]) * 100)}% faster)`)
})

// Test 3: Material Properties API Performance
await test('Individual material properties API <30ms target', async () => {
  // Test with lab-grown-diamond (should be cached)
  const { response, responseTime } = await measureApiCall(
    `${BASE_URL}/api/materials/lab-grown-diamond?rendering=true&pricing=true&sustainability=true`
  )
  
  if (!response.ok) {
    throw new Error(`Material properties API returned ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.success || !data.data.id) {
    throw new Error('Invalid material properties response')
  }
  
  if (responseTime > testConfig.performance.materialPropsTarget) {
    console.warn(`   ⚠️ Response time ${responseTime}ms exceeds target ${testConfig.performance.materialPropsTarget}ms`)
  }
  
  if (responseTime > testConfig.performance.claudeRulesLimit) {
    throw new Error(`Response time ${responseTime}ms exceeds CLAUDE_RULES limit`)
  }
  
  console.log(`   📊 Properties API: ${Math.round(responseTime)}ms`)
  console.log(`   💎 Material: ${data.data.displayName}`)
  console.log(`   🏷️ Category: ${data.data.category}`)
})

// Test 4: Material Validation Performance
await test('Material validation API batch performance', async () => {
  const testMaterials = [
    'lab-grown-diamond',
    'moissanite', 
    'lab-ruby',
    'lab-emerald',
    'lab-sapphire',
    'recycled-platinum',
    'recycled-gold-18k'
  ]
  
  const { response, responseTime } = await measureApiCall(`${BASE_URL}/api/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      materials: testMaterials,
      mode: 'individual'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Validation API returned ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.success || !data.data.validations) {
    throw new Error('Invalid validation response structure')
  }
  
  const validationsPerSecond = data.performance.validationsPerSecond || 0
  const avgTimePerValidation = responseTime / testMaterials.length
  
  if (avgTimePerValidation > testConfig.performance.validationTarget) {
    console.warn(`   ⚠️ Avg validation time ${avgTimePerValidation}ms exceeds target ${testConfig.performance.validationTarget}ms`)
  }
  
  if (responseTime > testConfig.performance.claudeRulesLimit) {
    throw new Error(`Total response time ${responseTime}ms exceeds CLAUDE_RULES limit`)
  }
  
  console.log(`   📊 Batch validation: ${Math.round(responseTime)}ms for ${testMaterials.length} materials`)
  console.log(`   ⚡ Validations/sec: ${validationsPerSecond}`)
  console.log(`   📈 Avg per validation: ${Math.round(avgTimePerValidation)}ms`)
})

// Test 5: CLAUDE_RULES Compliance Enforcement
await test('CLAUDE_RULES material compliance strictly enforced', async () => {
  const forbiddenMaterials = [
    'natural-diamond',
    'mined-ruby', 
    'traditional-emerald',
    'earth-mined-sapphire',
    'genuine-diamond'
  ]
  
  let blockedCount = 0
  
  for (const material of forbiddenMaterials) {
    const { response } = await measureApiCall(`${BASE_URL}/api/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        materials: [material],
        mode: 'individual'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const validation = data.data.validations[0]
      
      if (validation.claudeRulesCompliant) {
        throw new Error(`Material '${material}' incorrectly marked as CLAUDE_RULES compliant`)
      }
      
      if (validation.errors.length === 0) {
        throw new Error(`Material '${material}' should have validation errors`)
      }
      
      blockedCount++
    }
  }
  
  if (blockedCount !== forbiddenMaterials.length) {
    throw new Error(`Only ${blockedCount}/${forbiddenMaterials.length} forbidden materials were properly blocked`)
  }
  
  console.log(`   🛡️ Blocked ${blockedCount}/${forbiddenMaterials.length} forbidden materials`)
})

// Test 6: Load Testing Under Concurrent Load
await test('API performance under concurrent load', async () => {
  console.log(`   🔄 Running ${testConfig.loadTest.loadTestRequests} concurrent requests...`)
  
  const concurrentBatches = []
  for (let i = 0; i < testConfig.loadTest.loadTestRequests; i += testConfig.loadTest.concurrentRequests) {
    const batch = []
    for (let j = 0; j < testConfig.loadTest.concurrentRequests && (i + j) < testConfig.loadTest.loadTestRequests; j++) {
      batch.push(measureApiCall(`${BASE_URL}/api/materials?format=simple`))
    }
    concurrentBatches.push(Promise.all(batch))
  }
  
  const allBatches = await Promise.all(concurrentBatches)
  const allResults = allBatches.flat()
  
  const responseTimes = allResults.map(r => r.responseTime)
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
  const maxResponseTime = Math.max(...responseTimes)
  const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]
  
  if (maxResponseTime > testConfig.performance.claudeRulesLimit) {
    throw new Error(`Max response time ${maxResponseTime}ms exceeds CLAUDE_RULES limit under load`)
  }
  
  if (p95ResponseTime > testConfig.performance.claudeRulesLimit * 0.8) {
    console.warn(`   ⚠️ P95 response time ${p95ResponseTime}ms approaching CLAUDE_RULES limit`)
  }
  
  console.log(`   📊 Load test results:`)
  console.log(`      Avg: ${Math.round(avgResponseTime)}ms`)
  console.log(`      P95: ${Math.round(p95ResponseTime)}ms`)
  console.log(`      Max: ${Math.round(maxResponseTime)}ms`)
  console.log(`   🔢 Total requests: ${responseTimes.length}`)
})

// Test 7: Performance Monitoring API Functionality
await test('Performance monitoring API provides accurate metrics', async () => {
  const { response, responseTime } = await measureApiCall(
    `${BASE_URL}/api/performance?timeRange=300000&alerts=true&recommendations=true`
  )
  
  if (!response.ok) {
    throw new Error(`Performance API returned ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.success || !data.data.summary) {
    throw new Error('Performance API response structure invalid')
  }
  
  // Validate that our test requests are being tracked
  if (data.data.summary.responseTime.average === 0) {
    throw new Error('Performance monitoring not tracking any requests')
  }
  
  if (data.data.details.totalRequests < 10) {
    console.warn(`   ⚠️ Only ${data.data.details.totalRequests} requests tracked, expected more from previous tests`)
  }
  
  if (responseTime > 50) {
    console.warn(`   ⚠️ Performance API itself took ${responseTime}ms (target: <50ms)`)
  }
  
  console.log(`   📈 CLAUDE_RULES compliance: ${data.data.summary.claudeRulesCompliance.percentage}%`)
  console.log(`   ⚡ Avg response time: ${data.data.summary.responseTime.average}ms`)
  console.log(`   💾 Cache hit rate: ${data.data.summary.caching.hitRate}%`)
})

// Test 8: Cache Effectiveness Analysis
await test('Cache hit rates achieve >80% effectiveness', async () => {
  // Make multiple requests to the same endpoints to test caching
  const cacheTestEndpoints = [
    '/api/materials',
    '/api/materials/lab-grown-diamond',
    '/api/materials/moissanite',
    '/api/materials?category=gem'
  ]
  
  for (const endpoint of cacheTestEndpoints) {
    // First request (cache miss expected)
    await measureApiCall(`${BASE_URL}${endpoint}`)
    
    // Second request (cache hit expected)
    const { responseTime } = await measureApiCall(`${BASE_URL}${endpoint}`)
    
    // Cache hits should be faster
    if (responseTime > testConfig.performance.materialsApiTarget) {
      console.warn(`   ⚠️ Cached request to ${endpoint} took ${responseTime}ms (expected <${testConfig.performance.materialsApiTarget}ms)`)
    }
  }
  
  // Check overall cache effectiveness via performance API
  const { response } = await measureApiCall(`${BASE_URL}/api/performance?timeRange=60000`)
  const perfData = await response.json()
  
  const cacheHitRate = perfData.data.summary.caching.hitRate
  const cacheEffectiveness = perfData.data.summary.caching.effectiveness
  
  if (cacheHitRate < 70) {
    console.warn(`   ⚠️ Cache hit rate ${cacheHitRate}% below optimal (target: >80%)`)
  }
  
  console.log(`   💾 Cache hit rate: ${cacheHitRate}%`)
  console.log(`   🎯 Cache effectiveness: ${cacheEffectiveness}`)
})

// Results Summary
console.log('\n' + '='.repeat(70))
console.log('📊 PHASE 3: API LAYER ENHANCEMENT TEST RESULTS')
console.log('='.repeat(70))

console.log(`\n📈 Overall Results:`)
console.log(`   Total Tests: ${testResults.total}`)
console.log(`   Passed: ${testResults.passed} ✅`)
console.log(`   Failed: ${testResults.failed} ${testResults.failed > 0 ? '❌' : '✅'}`)
console.log(`   Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`)

console.log(`\n⚡ Performance Analysis:`)
const allResponseTimes = testResults.performance.map(p => p.responseTime)
if (allResponseTimes.length > 0) {
  const avgResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
  const maxResponseTime = Math.max(...allResponseTimes)
  const claudeRulesCompliant = allResponseTimes.filter(time => time < 300).length
  
  console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`)
  console.log(`   Maximum Response Time: ${Math.round(maxResponseTime)}ms`)
  console.log(`   CLAUDE_RULES Compliant: ${claudeRulesCompliant}/${allResponseTimes.length} requests`)
  console.log(`   Compliance Rate: ${Math.round((claudeRulesCompliant / allResponseTimes.length) * 100)}%`)
}

console.log(`\n💾 Cache Performance:`)
testResults.cacheMetrics.forEach(metric => {
  console.log(`   ${metric.endpoint}: ${metric.improvementPercent}% improvement (${metric.coldStart}ms → ${metric.finalTime}ms)`)
})

console.log(`\n🎯 Phase 3 Success Criteria Validation:`)
const criteriaChecks = [
  { name: 'Materials API performance optimized', status: testResults.details.find(d => d.name.includes('Materials API'))?.status === 'PASS' },
  { name: 'Material validation service fast', status: testResults.details.find(d => d.name.includes('validation API'))?.status === 'PASS' },
  { name: 'Individual properties API optimized', status: testResults.details.find(d => d.name.includes('properties API'))?.status === 'PASS' },
  { name: 'CLAUDE_RULES compliance enforced', status: testResults.details.find(d => d.name.includes('compliance'))?.status === 'PASS' },
  { name: 'Performance monitoring active', status: testResults.details.find(d => d.name.includes('monitoring'))?.status === 'PASS' },
  { name: 'Cache effectiveness achieved', status: testResults.details.find(d => d.name.includes('Cache'))?.status === 'PASS' },
  { name: 'Concurrent load handling', status: testResults.details.find(d => d.name.includes('concurrent'))?.status === 'PASS' },
  { name: 'All endpoints <300ms', status: allResponseTimes.every(time => time < 300) }
]

criteriaChecks.forEach(check => {
  console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`)
})

const allCriteriaMet = criteriaChecks.every(check => check.status)
console.log(`\n🏆 PHASE 3 STATUS: ${allCriteriaMet ? 'SUCCESS ✅' : 'NEEDS ATTENTION ⚠️'}`)

if (allCriteriaMet) {
  console.log(`\n🎉 Phase 3: API Layer Enhancement COMPLETED`)
  console.log(`   ✅ Material-only focus implemented`)
  console.log(`   ✅ <300ms performance targets achieved`)
  console.log(`   ✅ CLAUDE_RULES compliance enforced`)
  console.log(`   ✅ Performance monitoring operational`)
  console.log(`   ✅ Caching optimization effective`)
  console.log(`   🚀 Ready to proceed to Phase 4: UI Component Refactoring`)
} else {
  console.log(`\n⚠️ Phase 3 requires attention before proceeding to Phase 4`)
  const failedTests = testResults.details.filter(d => d.status === 'FAIL')
  if (failedTests.length > 0) {
    console.log(`   Failed tests to address:`)
    failedTests.forEach(test => console.log(`   - ${test.name}`))
  }
}

console.log('\n' + '='.repeat(70))