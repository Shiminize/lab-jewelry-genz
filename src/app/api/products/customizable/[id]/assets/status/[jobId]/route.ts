/**
 * Customizable Product 3D Asset Generation Status API - Phase 2: 3D Dashboard Integration
 * GET /api/products/customizable/[id]/assets/status/[jobId] - Get generation progress
 * 
 * Performance Target: <300ms response time (CLAUDE_RULES compliant)
 * Real-time Updates: WebSocket-compatible status tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { customizable3DBridgeService } from '@/lib/services/customizable-3d-bridge.service'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'

interface RouteParams {
  params: {
    id: string
    jobId: string
  }
}

/**
 * GET /api/products/customizable/[id]/assets/status/[jobId]
 * Get real-time generation progress for a 3D asset generation job
 */
async function getHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { id, jobId } = params
    
    if (!id || !jobId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Product ID and Job ID are required',
        [
          { field: 'id', message: 'Product ID parameter is missing' },
          { field: 'jobId', message: 'Job ID parameter is missing' }
        ].filter(error => (!id && error.field === 'id') || (!jobId && error.field === 'jobId')),
        400
      )
    }

    // Get generation progress from bridge service
    const progress = await customizable3DBridgeService.getGenerationProgress(jobId)
    
    if (!progress) {
      return createErrorResponse(
        'NOT_FOUND',
        'Generation job not found',
        [{ field: 'jobId', message: `Job with ID ${jobId} not found` }],
        404
      )
    }

    const responseTime = performance.now() - startTime
    
    // Log performance warning if threshold exceeded
    if (responseTime > 300) {
      console.warn(`⚠️ CLAUDE_RULES violation: GET /api/products/customizable/${id}/assets/status/${jobId} response time ${responseTime}ms exceeds 300ms`)
    }

    // Calculate additional progress information
    const currentTime = new Date()
    const estimatedCompletion = progress.estimatedCompletion ? new Date(progress.estimatedCompletion) : null
    const timeRemaining = estimatedCompletion ? Math.max(0, estimatedCompletion.getTime() - currentTime.getTime()) : null

    const response = {
      success: true,
      data: {
        jobId: progress.jobId,
        productId: id,
        status: progress.status,
        progress: progress.progress,
        currentTask: {
          material: progress.currentMaterial,
          frame: progress.currentFrame,
          totalFrames: progress.totalFrames,
          frameProgress: progress.currentFrame && progress.totalFrames 
            ? Math.round((progress.currentFrame / progress.totalFrames) * 100)
            : 0
        },
        timing: {
          estimatedCompletion: progress.estimatedCompletion,
          timeRemaining: timeRemaining ? Math.round(timeRemaining / 1000) : null, // seconds
          timeRemainingHuman: timeRemaining ? formatTimeRemaining(timeRemaining) : null
        },
        results: {
          generatedAssets: progress.generatedAssets || [],
          totalAssets: progress.generatedAssets?.length || 0,
          errors: progress.errors || []
        },
        webSocket: {
          available: true,
          endpoint: `/ws/generation/${jobId}`,
          events: ['progress', 'completed', 'error']
        }
      },
      performance: {
        responseTime: `<${Math.round(responseTime)}ms`,
        cacheStatus: 'real-time' // No caching for real-time data
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        integration: '3d-dashboard-bridge',
        refreshRate: progress.status === 'processing' ? '5s' : '30s'
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': progress.status === 'processing' 
          ? 'no-cache, no-store, must-revalidate' // No caching for active jobs
          : 'public, max-age=300', // Cache completed/error status for 5 min
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false',
        'X-3D-Integration': 'active',
        'X-Job-Status': progress.status,
        'X-Progress': progress.progress.toString(),
        'X-Content-Type-Options': 'nosniff',
        // Add CORS headers for real-time updates
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`GET /api/products/customizable/${params.id}/assets/status/${params.jobId} error:`, error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch generation status',
      [],
      500
    )
  }
}

/**
 * OPTIONS handler for CORS support
 */
async function optionsHandler(request: NextRequest, { params }: RouteParams) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  })
}

/**
 * Format time remaining in human-readable format
 */
function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Export handlers
export const GET = withErrorHandling(getHandler, 'customizable_product_assets_status_get')
export const OPTIONS = withErrorHandling(optionsHandler, 'customizable_product_assets_status_options')