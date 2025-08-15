/**
 * System Optimization API
 * Performs system optimizations and cleanup operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { ResourceOptimizer } from '@/lib/resource-optimizer'

let resourceOptimizer: ResourceOptimizer | null = null

function getResourceOptimizer(): ResourceOptimizer {
  if (!resourceOptimizer) {
    resourceOptimizer = new ResourceOptimizer()
  }
  return resourceOptimizer
}

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Optimization type is required' },
        { status: 400 }
      )
    }

    const optimizer = getResourceOptimizer()
    let result: any = {}

    switch (type) {
      case 'memory':
        result = await optimizeMemory(optimizer)
        break
        
      case 'disk':
        result = await optimizeDisk(optimizer)
        break
        
      case 'full':
        result = await performFullOptimization(optimizer)
        break
        
      case 'generation':
        result = await optimizeForGeneration(optimizer)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown optimization type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Optimization failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function optimizeMemory(optimizer: ResourceOptimizer): Promise<any> {
  const beforeMetrics = optimizer.getMetrics()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
  
  // Wait a moment for GC to complete
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const afterMetrics = await optimizer.updateMetrics()
  
  return {
    action: 'memory_optimization',
    before: {
      used: beforeMetrics.memory.used,
      percentage: beforeMetrics.memory.percentage
    },
    after: {
      used: afterMetrics.memory.used,
      percentage: afterMetrics.memory.percentage
    },
    memoryFreed: beforeMetrics.memory.used - afterMetrics.memory.used
  }
}

async function optimizeDisk(optimizer: ResourceOptimizer): Promise<any> {
  const beforeMetrics = optimizer.getMetrics()
  
  // Perform disk cleanup
  await optimizer.performCleanup()
  
  const afterMetrics = await optimizer.updateMetrics()
  
  return {
    action: 'disk_optimization',
    before: {
      used: beforeMetrics.disk.used,
      percentage: beforeMetrics.disk.percentage
    },
    after: {
      used: afterMetrics.disk.used,
      percentage: afterMetrics.disk.percentage
    },
    spaceFreed: beforeMetrics.disk.used - afterMetrics.disk.used
  }
}

async function performFullOptimization(optimizer: ResourceOptimizer): Promise<any> {
  const beforeMetrics = optimizer.getMetrics()
  
  // Perform comprehensive cleanup
  await optimizer.performCleanup()
  
  // Force garbage collection
  if (global.gc) {
    global.gc()
  }
  
  // Get optimization recommendations and apply auto-fixes
  const recommendations = await optimizer.performOptimizations()
  
  const afterMetrics = await optimizer.updateMetrics()
  
  return {
    action: 'full_optimization',
    before: beforeMetrics,
    after: afterMetrics,
    recommendationsApplied: recommendations.filter(r => r.autoFixAvailable).length,
    improvements: {
      memoryReduction: beforeMetrics.memory.used - afterMetrics.memory.used,
      diskSpaceFreed: beforeMetrics.disk.used - afterMetrics.disk.used
    }
  }
}

async function optimizeForGeneration(optimizer: ResourceOptimizer): Promise<any> {
  const beforeMetrics = optimizer.getMetrics()
  
  // Pre-generation optimization
  await optimizer.optimizeForGeneration()
  
  const afterMetrics = await optimizer.updateMetrics()
  
  return {
    action: 'generation_optimization',
    before: beforeMetrics,
    after: afterMetrics,
    readyForGeneration: afterMetrics.memory.percentage < 75 && afterMetrics.disk.percentage < 85,
    improvements: {
      memoryReduction: beforeMetrics.memory.used - afterMetrics.memory.used,
      diskSpaceFreed: beforeMetrics.disk.used - afterMetrics.disk.used
    }
  }
}