/**
 * Performance Monitoring API - Phase 3: API Layer Enhancement
 * Exposes real-time performance metrics and CLAUDE_RULES compliance data
 * 
 * GET /api/performance - Get performance statistics and alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/middleware/performance-monitor'
import { materialValidationService } from '@/lib/services/material-validation.service'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'

/**
 * GET /api/performance
 * Get comprehensive performance statistics
 * Performance target: <50ms (this endpoint should be fast!)
 */
async function getHandler(request: NextRequest) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '3600000' // Default: 1 hour
    const includeAlerts = searchParams.get('alerts') === 'true'
    const includeRecommendations = searchParams.get('recommendations') === 'true'
    
    const timeRangeMs = parseInt(timeRange)
    
    // Get performance statistics
    const stats = performanceMonitor.getStats(timeRangeMs)
    const claudeRulesCompliance = performanceMonitor.getClaudeRulesCompliance(timeRangeMs)
    const materialMetrics = materialValidationService.getMetrics()
    
    // Calculate additional metrics
    const compliancePercentage = claudeRulesCompliance.percentage
    const performanceTier = compliancePercentage >= 95 ? 'excellent' :
                           compliancePercentage >= 90 ? 'good' :
                           compliancePercentage >= 80 ? 'acceptable' : 'needs-improvement'
    
    const responseData: any = {
      summary: {
        claudeRulesCompliance: {
          percentage: compliancePercentage,
          compliant: claudeRulesCompliance.compliant,
          total: claudeRulesCompliance.total,
          tier: performanceTier
        },
        responseTime: {
          average: stats.averageResponseTime,
          p95: stats.p95ResponseTime,
          p99: stats.p99ResponseTime,
          target: 300 // CLAUDE_RULES target
        },
        caching: {
          hitRate: stats.cacheHitRate,
          effectiveness: stats.cacheHitRate >= 80 ? 'excellent' :
                        stats.cacheHitRate >= 60 ? 'good' :
                        stats.cacheHitRate >= 40 ? 'acceptable' : 'poor'
        },
        alerts: {
          critical: stats.alertCounts.critical,
          warning: stats.alertCounts.warning,
          total: stats.alertCounts.critical + stats.alertCounts.warning + stats.alertCounts.error
        }
      },
      
      details: {
        totalRequests: stats.total,
        topSlowEndpoints: stats.topSlowEndpoints,
        materialValidation: {
          cacheSize: materialMetrics.cacheSize,
          cacheHitRate: Math.round(materialMetrics.cacheHitRate * 100),
          approvedMaterials: materialMetrics.approvedMaterialsCount
        }
      }
    }

    // Include alerts if requested
    if (includeAlerts) {
      responseData.alerts = {
        recent: performanceMonitor.getRecentAlerts(10),
        claudeRulesViolations: claudeRulesCompliance.violations.slice(0, 5)
      }
    }

    // Include optimization recommendations if requested
    if (includeRecommendations) {
      responseData.recommendations = generateOptimizationRecommendations(stats, claudeRulesCompliance)
    }

    const responseTime = performance.now() - startTime
    
    // This endpoint should be very fast
    if (responseTime > 50) {
      console.warn(`⚠️ Performance API itself took ${responseTime}ms (target: <50ms)`)
    }

    const response = {
      success: true,
      data: responseData,
      performance: {
        responseTime: `${Math.round(responseTime)}ms`,
        claudeRulesCompliant: responseTime < 300,
        monitoringOverhead: 'minimal'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        timeRange: `${timeRangeMs}ms`,
        apiLayer: 'performance-monitoring'
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=10', // Very short cache for real-time data
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': 'true',
        'X-Performance-Tier': performanceTier,
        'X-API-Version': '3.0.0',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error('GET /api/performance error:', error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch performance metrics',
      [],
      500
    )
  }
}

/**
 * Generate optimization recommendations based on performance data
 */
function generateOptimizationRecommendations(
  stats: any, 
  compliance: any
): Array<{
  priority: 'high' | 'medium' | 'low'
  category: string
  issue: string
  recommendation: string
  impact: string
}> {
  const recommendations: any[] = []
  
  // CLAUDE_RULES compliance issues
  if (compliance.percentage < 95) {
    recommendations.push({
      priority: 'high',
      category: 'CLAUDE_RULES Compliance',
      issue: `${100 - compliance.percentage}% of requests exceed 300ms threshold`,
      recommendation: 'Implement aggressive caching and optimize slow endpoints',
      impact: 'Critical for CLAUDE_RULES compliance'
    })
  }
  
  // Cache hit rate issues
  if (stats.cacheHitRate < 60) {
    recommendations.push({
      priority: 'medium',
      category: 'Caching',
      issue: `Cache hit rate is ${stats.cacheHitRate}% (target: >80%)`,
      recommendation: 'Review caching strategy and increase TTL for stable data',
      impact: 'Significant performance improvement potential'
    })
  }
  
  // P95 response time issues
  if (stats.p95ResponseTime > 200) {
    recommendations.push({
      priority: 'medium',
      category: 'Response Time',
      issue: `95th percentile response time is ${stats.p95ResponseTime}ms`,
      recommendation: 'Optimize database queries and implement connection pooling',
      impact: 'Improves user experience for most requests'
    })
  }
  
  // Slow endpoint issues
  if (stats.topSlowEndpoints.length > 0 && stats.topSlowEndpoints[0].avgTime > 150) {
    recommendations.push({
      priority: 'high',
      category: 'Endpoint Optimization',
      issue: `Slowest endpoint (${stats.topSlowEndpoints[0].endpoint}) averages ${stats.topSlowEndpoints[0].avgTime}ms`,
      recommendation: 'Focus optimization efforts on this endpoint first',
      impact: 'Targeted improvement for worst-performing areas'
    })
  }
  
  // Alert frequency issues
  const totalAlerts = stats.alertCounts.critical + stats.alertCounts.warning + stats.alertCounts.error
  if (totalAlerts > 10) {
    recommendations.push({
      priority: 'medium',
      category: 'System Stability',
      issue: `${totalAlerts} performance alerts in monitoring period`,
      recommendation: 'Investigate root causes and implement preventive measures',
      impact: 'Reduces operational overhead and improves reliability'
    })
  }
  
  // Success recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      category: 'Optimization',
      issue: 'Performance is meeting all targets',
      recommendation: 'Consider implementing predictive caching for future growth',
      impact: 'Maintains excellent performance as usage scales'
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Export handlers
export const GET = withErrorHandling(getHandler, 'performance_metrics')