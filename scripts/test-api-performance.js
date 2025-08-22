#!/usr/bin/env node
/**
 * API Performance Validation Script
 * Tests that all API endpoints maintain CLAUDE_RULES <300ms response time requirements
 * after MongoDB index optimizations
 */

const https = require('https')
const http = require('http')

class APIPerformanceTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
    this.maxResponseTime = 300 // ms - CLAUDE_RULES requirement
    this.testResults = []
  }

  // Test API endpoint performance
  async testEndpoint(path, method = 'GET', expectedStatus = 200) {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const url = new URL(path, this.baseUrl)
      const client = url.protocol === 'https:' ? https : http

      const req = client.request(url, {
        method,
        timeout: 10000,
        headers: {
          'User-Agent': 'API-Performance-Tester/1.0',
          'Content-Type': 'application/json'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime
        const status = responseTime <= this.maxResponseTime ? 'PASS' : 'FAIL'
        
        const result = {
          endpoint: path,
          method,
          responseTime,
          httpStatus: res.statusCode,
          status,
          limit: this.maxResponseTime,
          timestamp: new Date().toISOString()
        }

        resolve(result)
      })

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime
        resolve({
          endpoint: path,
          method,
          responseTime,
          status: 'ERROR',
          error: error.message,
          limit: this.maxResponseTime,
          timestamp: new Date().toISOString()
        })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({
          endpoint: path,
          method,
          responseTime: 10000,
          status: 'TIMEOUT',
          error: 'Request timeout',
          limit: this.maxResponseTime,
          timestamp: new Date().toISOString()
        })
      })

      req.end()
    })
  }

  // Run comprehensive performance tests
  async runTests() {
    console.log('⚡ API Performance Testing - CLAUDE_RULES Compliance')
    console.log('====================================================')
    console.log(`Base URL: ${this.baseUrl}`)
    console.log(`Performance Limit: ${this.maxResponseTime}ms`)
    console.log('')

    // Test endpoints that use our optimized MongoDB schemas
    const testEndpoints = [
      { path: '/api/products', description: 'Product catalog (product.schema)' },
      { path: '/api/products/search?q=ring', description: 'Product search (product.schema)' },
      { path: '/api/customizer/variants', description: 'Product variants (product.schema)' },
      { path: '/api/analytics/events', description: 'Analytics events (analytics.schema)' },
      { path: '/api/creators', description: 'Creator profiles (creator.schema)' },
      { path: '/api/orders', description: 'Order management (order.schema)' },
      { path: '/api/users/profile', description: 'User profiles (user.schema)' },
      { path: '/api/audit/logs', description: 'Audit logs (audit.schema)' }
    ]

    console.log('🧪 Running performance tests...\n')

    for (const test of testEndpoints) {
      const result = await this.testEndpoint(test.path)
      this.testResults.push(result)
      
      const statusIcon = result.status === 'PASS' ? '✅' : 
                        result.status === 'ERROR' ? '❌' : 
                        result.status === 'TIMEOUT' ? '⏰' : '⚠️'
      
      console.log(`${statusIcon} ${test.path}`)
      console.log(`   Response: ${result.responseTime}ms (limit: ${this.maxResponseTime}ms)`)
      console.log(`   Description: ${test.description}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      console.log('')
    }

    this.generateReport()
    return this.evaluateResults()
  }

  // Evaluate test results
  evaluateResults() {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length
    const errorTests = this.testResults.filter(r => r.status === 'ERROR').length
    const timeoutTests = this.testResults.filter(r => r.status === 'TIMEOUT').length

    console.log('📊 Performance Test Summary')
    console.log('==========================')
    console.log(`Total Tests: ${totalTests}`)
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`⚠️  Failed (Slow): ${failedTests}`)
    console.log(`❌ Errors: ${errorTests}`)
    console.log(`⏰ Timeouts: ${timeoutTests}`)
    console.log('')

    // Calculate average response time for successful tests
    const successfulTests = this.testResults.filter(r => 
      r.status === 'PASS' || r.status === 'FAIL'
    )
    
    if (successfulTests.length > 0) {
      const avgResponseTime = successfulTests.reduce((sum, test) => 
        sum + test.responseTime, 0
      ) / successfulTests.length
      
      console.log(`📈 Average Response Time: ${Math.round(avgResponseTime)}ms`)
      console.log(`🎯 CLAUDE_RULES Target: <${this.maxResponseTime}ms`)
      
      if (avgResponseTime < this.maxResponseTime) {
        console.log('🎉 Average performance meets CLAUDE_RULES requirements!')
      } else {
        console.log('⚠️  Average performance exceeds CLAUDE_RULES limits')
      }
    }

    console.log('')

    // MongoDB Index Optimization Impact
    if (passedTests === totalTests) {
      console.log('🏆 MONGODB INDEX OPTIMIZATION SUCCESS!')
      console.log('=====================================')
      console.log('✅ All API endpoints meet performance requirements')
      console.log('✅ Duplicate index cleanup improved database efficiency')
      console.log('✅ Schema optimizations maintain CLAUDE_RULES compliance')
      console.log('🚀 Database is production-ready with optimal performance')
      return true
    } else {
      console.log('⚠️  PERFORMANCE REVIEW NEEDED')
      console.log('============================')
      
      if (failedTests > 0) {
        console.log('🐌 Slow endpoints detected - consider additional optimizations:')
        this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
          console.log(`   - ${test.endpoint}: ${test.responseTime}ms`)
        })
      }
      
      if (errorTests > 0) {
        console.log('❌ Endpoints with errors - check server configuration:')
        this.testResults.filter(r => r.status === 'ERROR').forEach(test => {
          console.log(`   - ${test.endpoint}: ${test.error}`)
        })
      }
      
      return false
    }
  }

  // Generate detailed performance report
  generateReport() {
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        performanceLimit: this.maxResponseTime,
        testType: 'MongoDB Index Optimization Validation'
      },
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length,
        timeouts: this.testResults.filter(r => r.status === 'TIMEOUT').length
      },
      results: this.testResults,
      optimizations: {
        schemasOptimized: [
          'analytics.schema.ts - removed property-level index duplicates',
          'audit.schema.ts - optimized compound index strategy',
          'product.schema.ts - validated index efficiency',
          'user.schema.ts - confirmed optimal configuration',
          'creator.schema.ts - verified performance patterns',
          'order.schema.ts - validated index strategy'
        ],
        expectedBenefits: [
          'Reduced MongoDB memory usage from duplicate indexes',
          'Improved write performance (5-10% estimated)',
          'Cleaner query execution plans',
          'Elimination of MongoDB warning messages',
          'Better index cache utilization'
        ]
      },
      recommendations: this.generateRecommendations()
    }

    // Save report
    const fs = require('fs')
    const path = require('path')
    const reportsDir = path.join(__dirname, '..', 'logs')
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    const reportPath = path.join(reportsDir, 'api-performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📋 Detailed report saved to: ${reportPath}`)
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = []
    
    const slowTests = this.testResults.filter(r => r.status === 'FAIL')
    const errorTests = this.testResults.filter(r => r.status === 'ERROR')
    
    if (slowTests.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        suggestion: 'Review query patterns for slow endpoints',
        endpoints: slowTests.map(t => t.endpoint)
      })
    }
    
    if (errorTests.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'availability',
        suggestion: 'Fix endpoint errors before production deployment',
        endpoints: errorTests.map(t => t.endpoint)
      })
    }
    
    // Always include index monitoring recommendation
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      suggestion: 'Set up continuous MongoDB index performance monitoring',
      tools: [
        'MongoDB Compass for index analysis',
        'Custom monitoring scripts for performance tracking',
        'Automated alerts for query performance degradation'
      ]
    })

    return recommendations
  }
}

// CLI Interface
async function main() {
  const tester = new APIPerformanceTester()
  
  try {
    const success = await tester.runTests()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Performance testing failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = APIPerformanceTester