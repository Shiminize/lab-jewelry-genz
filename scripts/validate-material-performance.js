#!/usr/bin/env node

/**
 * Material Performance Validation Script
 * 
 * Validates that material-based queries meet CLAUDE_RULES.md <300ms requirement
 * Can be run in production to monitor ongoing performance
 * 
 * USAGE:
 *   node scripts/validate-material-performance.js
 *   npm run db:performance:validate
 */

const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch_jewelry'

// Performance thresholds
const PERFORMANCE_TARGETS = {
  maxResponseTime: 300, // ms
  maxDocumentsExamined: 1000,
  minIndexUsage: 80 // percentage of queries should use indexes
}

// Critical query patterns to validate
const CRITICAL_QUERIES = [
  {
    name: 'Simple Material Filter (Silver)',
    query: { 'materials': 'silver', 'metadata.status': 'active' },
    sort: { 'pricing.basePrice': 1 },
    limit: 20,
    expectedIndex: 'materials_price_active'
  },
  {
    name: 'Category + Material (Gold Rings)',
    query: { 'category': 'rings', 'materials': 'gold', 'metadata.status': 'active' },
    sort: { 'analytics.views': -1 },
    limit: 20,
    expectedIndex: 'active_category_materials'
  },
  {
    name: 'Gemstone Type Filter (Lab Diamonds)',
    query: { 'gemstones.type': 'diamond', 'metadata.status': 'active' },
    sort: { 'pricing.basePrice': 1 },
    limit: 20,
    expectedIndex: 'gemstone_type_carat_active'
  },
  {
    name: 'Price Range + Material',
    query: { 
      'materials': 'silver',
      'pricing.basePrice': { $gte: 100, $lte: 500 },
      'metadata.status': 'active'
    },
    sort: { 'pricing.basePrice': 1 },
    limit: 20,
    expectedIndex: 'materials_price_active'
  },
  {
    name: 'Featured Products with Materials',
    query: { 
      'metadata.featured': true,
      'materials': { $in: ['gold', 'silver'] },
      'metadata.status': 'active'
    },
    sort: { 'analytics.views': -1 },
    limit: 8,
    expectedIndex: 'featured_materials_views'
  },
  {
    name: 'Complex Multi-Material Search',
    query: { 
      $or: [
        { 'materials': 'gold', 'gemstones.type': 'diamond' },
        { 'materials': 'platinum', 'gemstones.type': 'emerald' }
      ],
      'metadata.status': 'active'
    },
    sort: { 'pricing.basePrice': -1 },
    limit: 20,
    expectedIndex: 'materials_gemstones_active'
  },
  {
    name: 'Inventory + Material Filter',
    query: {
      'inventory.available': { $gt: 0 },
      'materials': 'gold',
      'metadata.status': 'active'
    },
    sort: { 'createdAt': -1 },
    limit: 20,
    expectedIndex: 'inventory_materials_active'
  },
  {
    name: 'Category + Subcategory + Material',
    query: {
      'category': 'rings',
      'subcategory': 'engagement-rings',
      'materials': 'gold',
      'metadata.status': 'active'
    },
    sort: { 'pricing.basePrice': 1 },
    limit: 20,
    expectedIndex: 'category_subcategory_materials'
  }
]

// Test results storage
const testResults = []
let totalTests = 0
let passedTests = 0
let failedTests = 0

/**
 * Execute a single performance test
 */
async function executePerformanceTest(collection, test) {
  console.log(`\n🧪 Testing: ${test.name}`)
  
  const startTime = Date.now()
  
  try {
    // Build cursor with query, sort, and limit
    const cursor = collection.find(test.query)
    if (test.sort) cursor.sort(test.sort)
    if (test.limit) cursor.limit(test.limit)
    
    // Execute query and explain in parallel
    const [results, explainResult] = await Promise.all([
      cursor.toArray(),
      collection.find(test.query).sort(test.sort || {}).limit(test.limit || 20).explain('executionStats')
    ])
    
    const executionTime = Date.now() - startTime
    const stats = explainResult.executionStats
    
    // Analyze results
    const result = {
      name: test.name,
      query: test.query,
      executionTime,
      documentsReturned: results.length,
      documentsExamined: stats?.totalDocsExamined || 0,
      indexUsed: stats?.indexName || 'COLLSCAN',
      expectedIndex: test.expectedIndex,
      stage: stats?.stage || 'unknown',
      
      // Performance checks
      meetsTimeTarget: executionTime <= PERFORMANCE_TARGETS.maxResponseTime,
      meetsExaminedTarget: (stats?.totalDocsExamined || 0) <= PERFORMANCE_TARGETS.maxDocumentsExamined,
      usesExpectedIndex: stats?.indexName === test.expectedIndex,
      usesAnyIndex: stats?.indexName !== undefined && stats?.stage !== 'COLLSCAN',
      
      // Overall pass/fail
      passed: executionTime <= PERFORMANCE_TARGETS.maxResponseTime && 
              (stats?.totalDocsExamined || 0) <= PERFORMANCE_TARGETS.maxDocumentsExamined
    }
    
    testResults.push(result)
    totalTests++
    
    if (result.passed) {
      passedTests++
      console.log(`   ✅ PASSED: ${executionTime}ms (${result.documentsReturned} results, ${result.documentsExamined} examined)`)
      console.log(`   📊 Index: ${result.indexUsed}`)
    } else {
      failedTests++
      console.log(`   ❌ FAILED: ${executionTime}ms (${result.documentsReturned} results, ${result.documentsExamined} examined)`)
      console.log(`   ⚠️  Index: ${result.indexUsed} (expected: ${result.expectedIndex})`)
      
      // Detailed failure analysis
      if (!result.meetsTimeTarget) {
        console.log(`   🐌 Slow query: ${executionTime}ms > ${PERFORMANCE_TARGETS.maxResponseTime}ms target`)
      }
      if (!result.meetsExaminedTarget) {
        console.log(`   📈 Too many docs examined: ${result.documentsExamined} > ${PERFORMANCE_TARGETS.maxDocumentsExamined} target`)
      }
      if (!result.usesAnyIndex) {
        console.log(`   🔍 Collection scan detected - no index used`)
      }
    }
    
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`)
    testResults.push({
      name: test.name,
      error: error.message,
      passed: false
    })
    totalTests++
    failedTests++
  }
}

/**
 * Check index availability
 */
async function checkIndexAvailability(collection) {
  console.log('\n📋 Checking Index Availability')
  console.log('=' .repeat(40))
  
  const indexes = await collection.listIndexes().toArray()
  const indexNames = indexes.map(idx => idx.name)
  
  const requiredIndexes = [
    'active_category_materials',
    'materials_price_active',
    'gemstone_type_carat_active',
    'materials_gemstones_active',
    'category_subcategory_materials',
    'featured_materials_views',
    'inventory_materials_active'
  ]
  
  console.log(`Total indexes: ${indexes.length}`)
  
  const missingIndexes = []
  requiredIndexes.forEach(requiredIndex => {
    if (indexNames.includes(requiredIndex)) {
      console.log(`   ✅ ${requiredIndex}`)
    } else {
      console.log(`   ❌ ${requiredIndex} - MISSING`)
      missingIndexes.push(requiredIndex)
    }
  })
  
  if (missingIndexes.length > 0) {
    console.log(`\n⚠️  Missing ${missingIndexes.length} required indexes!`)
    console.log(`   Run: npm run db:indexes`)
    return false
  }
  
  console.log(`\n✅ All required indexes present`)
  return true
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
  console.log('\n📊 MATERIAL PERFORMANCE VALIDATION REPORT')
  console.log('=' .repeat(50))
  
  // Overall statistics
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
  const averageTime = testResults
    .filter(r => typeof r.executionTime === 'number')
    .reduce((sum, r) => sum + r.executionTime, 0) / passedTests || 0
  
  console.log(`\n🎯 Overall Performance:`)
  console.log(`   Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`)
  console.log(`   Average Response Time: ${Math.round(averageTime)}ms`)
  console.log(`   Target: <${PERFORMANCE_TARGETS.maxResponseTime}ms`)
  
  if (successRate >= 90) {
    console.log(`   Status: ✅ EXCELLENT (${successRate}% pass rate)`)
  } else if (successRate >= 75) {
    console.log(`   Status: ⚠️  ACCEPTABLE (${successRate}% pass rate)`)
  } else {
    console.log(`   Status: ❌ NEEDS ATTENTION (${successRate}% pass rate)`)
  }
  
  // Index usage analysis
  console.log(`\n🔍 Index Usage Analysis:`)
  const indexUsage = {}
  testResults.forEach(result => {
    if (result.indexUsed) {
      indexUsage[result.indexUsed] = (indexUsage[result.indexUsed] || 0) + 1
    }
  })
  
  Object.entries(indexUsage).forEach(([index, count]) => {
    const percentage = Math.round((count / totalTests) * 100)
    const icon = index === 'COLLSCAN' ? '❌' : '✅'
    console.log(`   ${icon} ${index}: ${count} queries (${percentage}%)`)
  })
  
  // Failed tests details
  const failedTestResults = testResults.filter(r => !r.passed)
  if (failedTestResults.length > 0) {
    console.log(`\n❌ Failed Tests (${failedTestResults.length}):`)
    failedTestResults.forEach(result => {
      console.log(`   • ${result.name}`)
      if (result.error) {
        console.log(`     Error: ${result.error}`)
      } else {
        console.log(`     Time: ${result.executionTime}ms, Examined: ${result.documentsExamined}, Index: ${result.indexUsed}`)
      }
    })
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`)
  if (successRate < 90) {
    console.log(`   1. Run index creation: npm run db:indexes`)
  }
  if (indexUsage.COLLSCAN > 0) {
    console.log(`   2. ${indexUsage.COLLSCAN} queries using collection scan - check indexes`)
  }
  if (averageTime > 200) {
    console.log(`   3. Average response time high (${Math.round(averageTime)}ms) - optimize slow queries`)
  }
  if (failedTestResults.length > 0) {
    console.log(`   4. Investigate ${failedTestResults.length} failing test patterns`)
  }
  
  console.log(`\n🎉 CLAUDE_RULES.md Compliance: ${successRate >= 90 ? '✅ ACHIEVED' : '❌ NOT MET'}`)
  
  return {
    passRate: successRate,
    averageTime: Math.round(averageTime),
    compliant: successRate >= 90 && averageTime <= PERFORMANCE_TARGETS.maxResponseTime
  }
}

/**
 * Save detailed results to file
 */
function saveDetailedResults() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `material-performance-validation-${timestamp}.json`
  const filePath = require('path').join(__dirname, '../test-results', filename)
  
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      averageResponseTime: Math.round(testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / passedTests || 0)
    },
    performanceTargets: PERFORMANCE_TARGETS,
    testResults: testResults,
    compliance: {
      claudeRules: passedTests >= totalTests * 0.9,
      responseTime: testResults.every(r => (r.executionTime || 0) <= PERFORMANCE_TARGETS.maxResponseTime),
      indexUsage: testResults.filter(r => r.usesAnyIndex).length >= totalTests * 0.8
    }
  }
  
  try {
    require('fs').writeFileSync(filePath, JSON.stringify(detailedReport, null, 2))
    console.log(`\n📄 Detailed results saved: ${filename}`)
  } catch (error) {
    console.log(`\n⚠️  Could not save detailed results: ${error.message}`)
  }
}

/**
 * Main validation function
 */
async function validateMaterialPerformance() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔗 Connecting to MongoDB...')
    await client.connect()
    
    const db = client.db(DATABASE_NAME)
    const collection = db.collection('products')
    
    console.log(`✅ Connected to database: ${DATABASE_NAME}`)
    
    // Check if required indexes exist
    const indexesAvailable = await checkIndexAvailability(collection)
    if (!indexesAvailable) {
      console.log('\n❌ Required indexes missing. Run npm run db:indexes first.')
      process.exit(1)
    }
    
    // Run performance tests
    console.log('\n🚀 Starting Material Performance Validation')
    console.log('=' .repeat(50))
    
    for (const test of CRITICAL_QUERIES) {
      await executePerformanceTest(collection, test)
    }
    
    // Generate and display report
    const report = generatePerformanceReport()
    
    // Save detailed results
    saveDetailedResults()
    
    // Exit with appropriate code
    if (report.compliant) {
      console.log('\n🎉 All material queries meet performance targets!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Some material queries need optimization.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Validation failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// CLI execution
if (require.main === module) {
  console.log('🧪 GlowGlitch Material Performance Validator')
  console.log('==========================================\n')
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Validates material-based query performance against CLAUDE_RULES.md targets')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/validate-material-performance.js')
    console.log('  npm run db:performance:validate')
    console.log('')
    console.log('Performance Targets:')
    console.log(`  Response Time: <${PERFORMANCE_TARGETS.maxResponseTime}ms`)
    console.log(`  Documents Examined: <${PERFORMANCE_TARGETS.maxDocumentsExamined}`)
    console.log(`  Index Usage: >${PERFORMANCE_TARGETS.minIndexUsage}%`)
    console.log('')
    console.log('Exit Codes:')
    console.log('  0 = All tests passed')
    console.log('  1 = Some tests failed or performance targets not met')
    process.exit(0)
  }
  
  validateMaterialPerformance().catch(console.error)
}

module.exports = { validateMaterialPerformance, CRITICAL_QUERIES, PERFORMANCE_TARGETS }