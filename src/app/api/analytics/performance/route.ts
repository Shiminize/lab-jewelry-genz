/**
 * Performance Analytics API
 * GET /api/analytics/performance - Get performance metrics
 * POST /api/analytics/performance - Track performance data
 */

import { NextRequest, NextResponse } from 'next/server'
import { analytics } from '@/lib/analytics'
import { PerformanceMetricsSchema } from '@/lib/schemas/analytics.schema'
import { withAPIMonitoring } from '@/lib/performance'
import crypto from 'crypto'

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

/**
 * GET /api/analytics/performance - Get performance insights
 */
async function getPerformanceAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const endpoint = searchParams.get('endpoint')
    
    // Get performance insights from analytics service
    const insights = await analytics.getPerformanceInsights()
    
    // Calculate simple health score based on insights
    const healthScore = calculateHealthScore(insights)
    
    const responseData = {
      insights,
      healthScore,
      recommendations: generateRecommendations(insights),
      timestamp: new Date().toISOString()
    }
    
    // Add endpoint filtering if specified
    if (endpoint) {
      responseData.endpointFilter = endpoint
    }
    
    return ok(responseData)
    
  } catch (error) {
    console.error('Performance analytics error:', error)
    return fail('PERFORMANCE_ERROR', 'Failed to retrieve performance analytics', null, 500)
  }
}

/**
 * POST /api/analytics/performance - Track performance metrics
 */
async function trackPerformance(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate performance data
    const validatedMetrics = PerformanceMetricsSchema.parse({
      ...body,
      timestamp: new Date()
    })
    
    // Track the performance metrics
    await analytics.trackPerformance(validatedMetrics)
    
    return ok({ 
      tracked: true,
      metricsId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Performance tracking error:', error)
    
    if (error.name === 'ZodError') {
      return fail('VALIDATION_ERROR', 'Invalid performance data', error.errors)
    }
    
    return fail('TRACKING_ERROR', 'Failed to track performance metrics', null, 500)
  }
}

/**
 * Calculate overall system health score (0-100)
 */
function calculateHealthScore(insights: any): number {
  let score = 100
  
  // Deduct points for slow API responses
  if (insights?.avgApiTime > 1000) {
    score -= 30 // Very slow
  } else if (insights?.avgApiTime > 500) {
    score -= 15 // Moderately slow
  } else if (insights?.avgApiTime > 200) {
    score -= 5 // Slightly slow
  }
  
  // Deduct points for slow database queries
  if (insights?.avgDbTime > 500) {
    score -= 25
  } else if (insights?.avgDbTime > 200) {
    score -= 10
  } else if (insights?.avgDbTime > 100) {
    score -= 5
  }
  
  // Deduct points for errors
  const errorRate = insights?.totalErrors / Math.max(insights?.totalRequests, 1) || 0
  if (errorRate > 0.05) {
    score -= 30 // High error rate
  } else if (errorRate > 0.01) {
    score -= 15 // Moderate error rate
  } else if (errorRate > 0.001) {
    score -= 5 // Low error rate
  }
  
  // Basic scoring based on database performance
  if (insights?.avgDbTime > 200) {
    score -= 15 // Slow database queries
  } else if (insights?.avgDbTime > 100) {
    score -= 5 // Moderately slow database
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(insights: any): string[] {
  const recommendations: string[] = []
  
  // API performance recommendations
  if (insights?.avgApiTime > 1000) {
    recommendations.push('Critical: API response times are very slow (>1s). Consider adding caching, optimizing database queries, or scaling infrastructure.')
  } else if (insights?.avgApiTime > 500) {
    recommendations.push('Warning: API response times are slow (>500ms). Review slow endpoints and optimize database queries.')
  }
  
  // Database performance recommendations
  if (insights?.avgDbTime > 200) {
    recommendations.push('Database queries are slow. Consider adding indexes, optimizing queries, or implementing connection pooling.')
  }
  
  // Error rate recommendations
  const errorRate = insights?.totalErrors / Math.max(insights?.totalRequests, 1) || 0
  if (errorRate > 0.01) {
    recommendations.push('High error rate detected. Review error logs and implement better error handling.')
  }
  
  // Additional recommendations based on available insights
  if (insights?.avgApiTime > 200 && insights?.avgDbTime < 100) {
    recommendations.push('API processing time is high despite fast database queries. Consider optimizing business logic or external API calls.')
  }
  
  if (insights?.totalRequests > 1000 && errorRate < 0.001) {
    recommendations.push('High traffic with low error rate - excellent system stability. Consider caching to optimize further.')
  }
  
  // Add positive feedback for good performance
  if (recommendations.length === 0) {
    recommendations.push('System performance is healthy. Continue monitoring and maintain current optimization practices.')
  }
  
  return recommendations
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/analytics/performance', getPerformanceAnalytics)
export const POST = withAPIMonitoring('/api/analytics/performance', trackPerformance)