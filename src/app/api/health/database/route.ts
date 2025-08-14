/**
 * Database Health Check API Route
 * Comprehensive MongoDB connection, performance, and CLAUDE_RULES compliance monitoring
 * Implements CLAUDE_RULES.md API envelope format with <300ms performance tracking
 */

import { NextRequest } from 'next/server'
import { checkDatabaseHealth, DatabaseMonitor } from '@/lib/mongoose'
import { productRepository, userRepository } from '@/lib/database'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

async function databaseHealthHandler(request: NextRequest) {
  const healthCheckStart = Date.now()
  
  try {
    // Check basic database connection with performance metrics
    const connectionHealth = await checkDatabaseHealth()
    
    // Get comprehensive performance metrics from monitor
    const performanceMetrics = DatabaseMonitor.getPerformanceMetrics()
    
    // Run critical query performance tests for CLAUDE_RULES compliance
    const queryTests = await runQueryPerformanceTests()
    
    // Calculate overall health score
    const healthScore = calculateHealthScore(connectionHealth, performanceMetrics, queryTests)
    
    const isHealthy = connectionHealth.status === 'connected' && 
                     performanceMetrics.claudeRulesCompliant &&
                     healthScore >= 80
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      healthScore,
      claudeRulesCompliant: performanceMetrics.claudeRulesCompliant,
      database: {
        connection: connectionHealth,
        performance: {
          ...performanceMetrics,
          claudeRulesTarget: '<300ms',
          queryTests
        },
        recommendations: generateRecommendations(performanceMetrics, queryTests)
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      healthCheckDuration: Date.now() - healthCheckStart
    }
    
    return createSuccessResponse(
      healthData,
      undefined,
      isHealthy ? 200 : 503
    )
  } catch (error) {
    const healthCheckDuration = Date.now() - healthCheckStart
    console.error('Database health check failed:', error)
    
    return createErrorResponse(
      'DATABASE_HEALTH_CHECK_FAILED',
      'Failed to perform database health check',
      [error instanceof Error ? error.message : 'Unknown error'],
      503
    )
  }
}

/**
 * Run performance tests on critical queries for CLAUDE_RULES compliance
 */
async function runQueryPerformanceTests(): Promise<{
  productSearch: { executionTime: number; compliant: boolean }
  userLookup: { executionTime: number; compliant: boolean }
  indexUsage: { available: boolean; optimized: boolean }
}> {
  const tests = {
    productSearch: { executionTime: 0, compliant: false },
    userLookup: { executionTime: 0, compliant: false },
    indexUsage: { available: true, optimized: true }
  }

  try {
    // Test product search performance (critical for CLAUDE_RULES <300ms)
    const productSearchStart = Date.now()
    await productRepository.searchProducts({
      query: 'ring',
      page: 1,
      limit: 10
    })
    tests.productSearch.executionTime = Date.now() - productSearchStart
    tests.productSearch.compliant = tests.productSearch.executionTime < 300

    // Test user lookup performance (should be <100ms)
    const userLookupStart = Date.now()
    await userRepository.findByEmail('test@example.com')
    tests.userLookup.executionTime = Date.now() - userLookupStart
    tests.userLookup.compliant = tests.userLookup.executionTime < 100

  } catch (error) {
    console.error('Query performance test failed:', error)
    tests.indexUsage.available = false
  }

  return tests
}

/**
 * Calculate overall health score (0-100) based on CLAUDE_RULES criteria
 */
function calculateHealthScore(
  healthCheck: any,
  performanceMetrics: any,
  queryTests: any
): number {
  let score = 0

  // Connection health (30 points)
  if (healthCheck.status === 'connected') {
    score += 25
    if (healthCheck.responseTime < 100) score += 5
    else if (healthCheck.responseTime < 200) score += 3
  }

  // CLAUDE_RULES performance compliance (40 points)
  if (performanceMetrics.claudeRulesCompliant) {
    score += 35
  } else if (performanceMetrics.averageQueryTime < 500) {
    score += 20
  } else if (performanceMetrics.averageQueryTime < 1000) {
    score += 10
  }
  
  if (performanceMetrics.slowQueryRate < 5) score += 5
  else if (performanceMetrics.slowQueryRate < 15) score += 2

  // Critical query tests (30 points)
  if (queryTests.productSearch.compliant) score += 20 // Most important
  if (queryTests.userLookup.compliant) score += 8
  if (queryTests.indexUsage.optimized) score += 2

  return Math.min(score, 100)
}

/**
 * Generate optimization recommendations based on performance metrics
 */
function generateRecommendations(performanceMetrics: any, queryTests: any): string[] {
  const recommendations: string[] = []

  if (!performanceMetrics.claudeRulesCompliant) {
    recommendations.push('CRITICAL: Average query time exceeds CLAUDE_RULES 300ms target - immediate optimization required')
  }

  if (performanceMetrics.slowQueryRate > 10) {
    recommendations.push('High slow query rate detected - review and optimize query patterns and indexes')
  }

  if (!queryTests.productSearch.compliant) {
    recommendations.push('Product search exceeds 300ms target - optimize aggregation pipeline and indexes')
  }

  if (!queryTests.userLookup.compliant) {
    recommendations.push('User lookup performance suboptimal - ensure email field has proper compound index')
  }

  if (performanceMetrics.connectionErrors > 5) {
    recommendations.push('Multiple connection errors - review connection pool configuration and network stability')
  }

  if (performanceMetrics.averageQueryTime > 200 && performanceMetrics.averageQueryTime < 300) {
    recommendations.push('Query performance approaching CLAUDE_RULES limit - proactive optimization recommended')
  }

  if (recommendations.length === 0) {
    recommendations.push('Database performance is optimal and fully CLAUDE_RULES compliant')
  }

  return recommendations
}

// Export handlers with error handling wrapper
export const GET = withErrorHandling(databaseHealthHandler)
export const OPTIONS = handleCORS