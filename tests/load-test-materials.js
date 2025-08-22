/**
 * Load Testing Script for Material Tag Performance
 * Validates <300ms API response and <50ms material extraction requirements
 * Uses k6 for realistic load simulation
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const materialFilterTime = new Trend('material_filter_time')
const cacheHitRate = new Rate('cache_hits')
const materialExtractionTime = new Trend('material_extraction_time')

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm-up
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '3m', target: 100 },   // Back to normal load
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    // CLAUDE_RULES requirements
    http_req_duration: ['p(95)<300', 'p(99)<500'],  // 95% under 300ms
    material_filter_time: ['p(95)<300'],             // Material filtering under 300ms
    material_extraction_time: ['p(95)<50'],          // Extraction under 50ms
    errors: ['rate<0.01'],                           // Error rate under 1%
    cache_hits: ['rate>0.7'],                        // Cache hit rate over 70%
    http_req_failed: ['rate<0.01'],                  // Failed requests under 1%
  },
  ext: {
    loadimpact: {
      projectID: 'genz-jewelry',
      name: 'Material Tag Performance Test'
    }
  }
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test data
const METAL_FILTERS = [
  ['silver'],
  ['14k-gold'],
  ['18k-gold'],
  ['platinum'],
  ['silver', '14k-gold'],
  ['14k-gold', '18k-gold'],
  ['silver', 'platinum']
]

const STONE_FILTERS = [
  ['lab-diamond'],
  ['moissanite'],
  ['lab-ruby'],
  ['lab-sapphire'],
  ['lab-emerald'],
  ['lab-diamond', 'moissanite'],
  ['lab-ruby', 'lab-sapphire']
]

const PRICE_RANGES = [
  { min: 0, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 2000, max: 5000 },
  { min: 100, max: 1500 }
]

/**
 * Helper function to get random element from array
 */
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Test 1: Material filtering performance
 */
export function testMaterialFiltering() {
  group('Material Filtering', () => {
    const metals = getRandomElement(METAL_FILTERS)
    const stones = getRandomElement(STONE_FILTERS)
    const priceRange = getRandomElement(PRICE_RANGES)
    
    const params = new URLSearchParams({
      page: Math.ceil(Math.random() * 5).toString(),
      limit: '20',
      sortBy: getRandomElement(['price', 'popularity', 'newest']),
      'filters[metals]': JSON.stringify(metals),
      'filters[stones]': JSON.stringify(stones),
      'filters[priceRange]': JSON.stringify(priceRange)
    })
    
    const startTime = Date.now()
    const response = http.get(`${BASE_URL}/api/products?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Test-Type': 'material-filter'
      },
      tags: { name: 'MaterialFilter' }
    })
    const duration = Date.now() - startTime
    
    materialFilterTime.add(duration)
    
    // Check response
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
      'has valid structure': (r) => {
        const body = JSON.parse(r.body)
        return body.success && body.data && Array.isArray(body.data)
      },
      'has products': (r) => {
        const body = JSON.parse(r.body)
        return body.data.length > 0
      },
      'has material specs': (r) => {
        const body = JSON.parse(r.body)
        return body.data.length > 0 && body.data[0].materialSpecs !== undefined
      },
      'material specs have required fields': (r) => {
        const body = JSON.parse(r.body)
        if (body.data.length === 0) return true
        const specs = body.data[0].materialSpecs
        return specs && specs.primaryMetal && specs.metalDisplay
      },
      'response includes performance metrics': (r) => {
        const body = JSON.parse(r.body)
        return body.meta && body.meta.responseTime && body.meta.performance
      },
      'performance is compliant': (r) => {
        const body = JSON.parse(r.body)
        return body.meta && body.meta.performance && body.meta.performance.compliant === true
      }
    })
    
    // Check cache headers
    const cacheHit = response.headers['X-Cache-Status'] === 'HIT'
    cacheHitRate.add(cacheHit)
    
    // Track extraction time from response meta
    if (response.status === 200) {
      const body = JSON.parse(response.body)
      if (body.meta && body.meta.extractionTime) {
        materialExtractionTime.add(parseFloat(body.meta.extractionTime))
      }
    }
    
    errorRate.add(!success)
  })
}

/**
 * Test 2: Material tag click response
 */
export function testMaterialTagClick() {
  group('Material Tag Click', () => {
    const metal = getRandomElement(['silver', '14k-gold', '18k-gold', 'platinum'])
    
    const params = new URLSearchParams({
      page: '1',
      limit: '20',
      'filters[materialTags]': JSON.stringify([metal])
    })
    
    const response = http.get(`${BASE_URL}/api/products?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Test-Type': 'material-tag-click'
      },
      tags: { name: 'MaterialTagClick' }
    })
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
      'filters applied correctly': (r) => {
        const body = JSON.parse(r.body)
        return body.meta && body.meta.filters && 
               body.meta.filters.applied && 
               body.meta.filters.applied.materialTags
      }
    })
    
    errorRate.add(!success)
  })
}

/**
 * Test 3: Complex multi-filter queries
 */
export function testComplexFiltering() {
  group('Complex Filtering', () => {
    const params = new URLSearchParams({
      query: getRandomElement(['ring', 'necklace', 'earring', 'bracelet']),
      page: Math.ceil(Math.random() * 3).toString(),
      limit: '20',
      sortBy: 'price',
      sortOrder: getRandomElement(['asc', 'desc']),
      'filters[metals]': JSON.stringify(getRandomElement(METAL_FILTERS)),
      'filters[stones]': JSON.stringify(getRandomElement(STONE_FILTERS)),
      'filters[priceRange]': JSON.stringify(getRandomElement(PRICE_RANGES)),
      'filters[category]': JSON.stringify(['rings', 'necklaces']),
      'filters[inStock]': 'true',
      'filters[customizable]': 'true'
    })
    
    const response = http.get(`${BASE_URL}/api/products?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Test-Type': 'complex-filter'
      },
      tags: { name: 'ComplexFilter' }
    })
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
      'all filters applied': (r) => {
        const body = JSON.parse(r.body)
        const applied = body.meta?.filters?.applied
        return applied && 
               applied.metals && 
               applied.stones && 
               applied.priceRange && 
               applied.category
      }
    })
    
    errorRate.add(!success)
  })
}

/**
 * Test 4: Cache warming and hit rate
 */
export function testCachePerformance() {
  group('Cache Performance', () => {
    // Use same parameters to test cache
    const params = new URLSearchParams({
      page: '1',
      limit: '20',
      'filters[metals]': JSON.stringify(['silver', '14k-gold'])
    })
    
    // First request (potential cache miss)
    const response1 = http.get(`${BASE_URL}/api/products?${params}`, {
      headers: { 'Accept': 'application/json' }
    })
    
    sleep(0.1) // Small delay
    
    // Second request (should be cache hit)
    const response2 = http.get(`${BASE_URL}/api/products?${params}`, {
      headers: { 'Accept': 'application/json' }
    })
    
    check(response2, {
      'second request faster': (r) => r.timings.duration < response1.timings.duration,
      'cache hit indicated': (r) => r.headers['X-Cache-Status'] === 'HIT'
    })
  })
}

/**
 * Test 5: Concurrent requests stress test
 */
export function testConcurrentRequests() {
  group('Concurrent Requests', () => {
    const batch = []
    
    // Create 5 concurrent requests with different filters
    for (let i = 0; i < 5; i++) {
      const params = new URLSearchParams({
        page: (i + 1).toString(),
        limit: '10',
        'filters[metals]': JSON.stringify([getRandomElement(['silver', '14k-gold', '18k-gold'])])
      })
      
      batch.push({
        method: 'GET',
        url: `${BASE_URL}/api/products?${params}`,
        params: {
          headers: { 'Accept': 'application/json' }
        }
      })
    }
    
    const responses = http.batch(batch)
    
    responses.forEach((response, index) => {
      check(response, {
        [`request ${index + 1} successful`]: (r) => r.status === 200,
        [`request ${index + 1} < 300ms`]: (r) => r.timings.duration < 300
      })
    })
  })
}

/**
 * Main test scenario
 */
export default function () {
  // Run different test scenarios with weighted distribution
  const scenario = Math.random()
  
  if (scenario < 0.4) {
    testMaterialFiltering() // 40% of traffic
  } else if (scenario < 0.6) {
    testMaterialTagClick() // 20% of traffic
  } else if (scenario < 0.8) {
    testComplexFiltering() // 20% of traffic
  } else if (scenario < 0.95) {
    testCachePerformance() // 15% of traffic
  } else {
    testConcurrentRequests() // 5% of traffic
  }
  
  sleep(Math.random() * 2 + 1) // Random think time 1-3 seconds
}

/**
 * Setup function (run once before tests)
 */
export function setup() {
  // Warm up cache with common queries
  const warmupQueries = [
    { 'filters[metals]': JSON.stringify(['silver']) },
    { 'filters[metals]': JSON.stringify(['14k-gold']) },
    { 'filters[stones]': JSON.stringify(['lab-diamond']) },
    { 'filters[category]': JSON.stringify(['rings']) }
  ]
  
  warmupQueries.forEach(filters => {
    const params = new URLSearchParams({
      page: '1',
      limit: '20',
      ...filters
    })
    
    http.get(`${BASE_URL}/api/products?${params}`, {
      headers: { 'Accept': 'application/json' }
    })
  })
  
  console.log('Cache warmed up with common queries')
  
  return { startTime: Date.now() }
}

/**
 * Teardown function (run once after tests)
 */
export function teardown(data) {
  const duration = Date.now() - data.startTime
  console.log(`Total test duration: ${duration}ms`)
}

/**
 * Handle test summary
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.html': htmlReport(data)
  }
}

/**
 * Generate HTML report
 */
function htmlReport(data) {
  const metrics = data.metrics
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Material Tag Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
    .pass { color: green; }
    .fail { color: red; }
    .value { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Material Tag Performance Test Results</h1>
  
  <div class="metric">
    <h3>Response Time (95th percentile)</h3>
    <p class="${metrics.http_req_duration.p95 < 300 ? 'pass' : 'fail'}">
      <span class="value">${metrics.http_req_duration.p95.toFixed(2)}ms</span>
      (Target: <300ms)
    </p>
  </div>
  
  <div class="metric">
    <h3>Material Filter Time (95th percentile)</h3>
    <p class="${metrics.material_filter_time.p95 < 300 ? 'pass' : 'fail'}">
      <span class="value">${metrics.material_filter_time.p95.toFixed(2)}ms</span>
      (Target: <300ms)
    </p>
  </div>
  
  <div class="metric">
    <h3>Material Extraction Time (95th percentile)</h3>
    <p class="${metrics.material_extraction_time.p95 < 50 ? 'pass' : 'fail'}">
      <span class="value">${metrics.material_extraction_time.p95.toFixed(2)}ms</span>
      (Target: <50ms)
    </p>
  </div>
  
  <div class="metric">
    <h3>Cache Hit Rate</h3>
    <p class="${metrics.cache_hits.rate > 0.7 ? 'pass' : 'fail'}">
      <span class="value">${(metrics.cache_hits.rate * 100).toFixed(1)}%</span>
      (Target: >70%)
    </p>
  </div>
  
  <div class="metric">
    <h3>Error Rate</h3>
    <p class="${metrics.errors.rate < 0.01 ? 'pass' : 'fail'}">
      <span class="value">${(metrics.errors.rate * 100).toFixed(2)}%</span>
      (Target: <1%)
    </p>
  </div>
  
  <h2>Test Summary</h2>
  <ul>
    <li>Total Requests: ${metrics.http_reqs.count}</li>
    <li>Virtual Users: ${metrics.vus.max}</li>
    <li>Test Duration: ${data.state.testRunDurationMs}ms</li>
    <li>Data Received: ${(metrics.data_received.count / 1024 / 1024).toFixed(2)} MB</li>
    <li>Data Sent: ${(metrics.data_sent.count / 1024 / 1024).toFixed(2)} MB</li>
  </ul>
</body>
</html>
  `
}