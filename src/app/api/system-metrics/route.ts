/**
 * System Metrics API
 * Provides real-time system performance metrics and optimization recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { ResourceOptimizer } from '@/lib/resource-optimizer'
import { EnhancedGenerationService } from '@/lib/enhanced-generation-service'

let resourceOptimizer: ResourceOptimizer | null = null

function getResourceOptimizer(): ResourceOptimizer {
  if (!resourceOptimizer) {
    resourceOptimizer = new ResourceOptimizer()
  }
  return resourceOptimizer
}

export async function GET() {
  try {
    const optimizer = getResourceOptimizer()
    const generationService = EnhancedGenerationService.getInstance()

    // Get current system metrics
    const metrics = await optimizer.updateMetrics()
    
    // Get optimization recommendations
    const recommendations = await optimizer.performOptimizations()
    
    // Get generation service metrics
    const generationMetrics = generationService.getMetrics()

    // Calculate additional derived metrics
    const derivedMetrics = {
      memoryPressure: optimizer.getMemoryPressure(),
      diskPressure: optimizer.getDiskPressure(),
      systemHealth: getSystemHealth(metrics, recommendations),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform
    }

    return NextResponse.json({
      success: true,
      metrics,
      recommendations,
      generationMetrics,
      derived: derivedMetrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch system metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getSystemHealth(metrics: any, recommendations: any[]): 'healthy' | 'warning' | 'critical' {
  // Check for critical recommendations
  const hasCritical = recommendations.some(r => r.severity === 'critical')
  if (hasCritical) return 'critical'

  // Check for high severity recommendations
  const hasHigh = recommendations.some(r => r.severity === 'high')
  if (hasHigh) return 'warning'

  // Check resource usage thresholds
  if (metrics.memory?.percentage > 85 || metrics.disk?.percentage > 90) {
    return 'warning'
  }

  if (metrics.memory?.percentage > 95 || metrics.disk?.percentage > 98) {
    return 'critical'
  }

  return 'healthy'
}