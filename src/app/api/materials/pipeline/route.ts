/**
 * Material Pipeline API Routes
 * RESTful API for managing optimized material configuration and switching
 * CLAUDE_RULES.md compliant with <100ms material switches
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialPipelineService } from '@/lib/services/material-pipeline.service'
import { getProductionConfig, ProductionLogger } from '@/lib/production-config'

// Production configuration and logging
const config = getProductionConfig()
const logger = new ProductionLogger(config)

// GET: Get all materials or pipeline health
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  logger.info('Material Pipeline API GET request', { action })

  try {
    const startTime = Date.now()
    const service = MaterialPipelineService.getInstance()
    
    let result: NextResponse
    
    switch (action) {
      case 'health':
        const health = service.getSystemHealth()
        result = NextResponse.json(health)
        break
        
      case 'metrics':
        const metrics = service.getMetrics()
        result = NextResponse.json({ metrics })
        break
        
      case 'materials':
      default:
        const materials = await service.getAllMaterials()
        const health2 = service.getSystemHealth()
        result = NextResponse.json({ 
          materials, 
          health: health2,
          count: materials.length 
        })
        break
    }
    
    const responseTime = Date.now() - startTime
    logger.info('Material Pipeline API response', { action, responseTime, status: result.status })
    
    // Check CLAUDE_RULES compliance (<300ms)
    if (responseTime > 300) {
      logger.warn('Material Pipeline API response time exceeds CLAUDE_RULES target', { 
        action, 
        responseTime, 
        target: 300 
      })
    }
    
    return result
  } catch (error) {
    logger.error('Material Pipeline API Error in GET handler', { 
      action, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Material operations (switch, optimize)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    logger.info('Material Pipeline API POST request', { action })

    const service = MaterialPipelineService.getInstance()
    
    switch (action) {
      case 'switch':
        return handleMaterialSwitch(body, service)
        
      case 'optimize':
        return handlePipelineOptimization(service)
        
      case 'generate':
        return handleMaterialGeneration(body, service)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Material Pipeline API Error in POST handler', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper Functions

async function handleMaterialSwitch(body: any, service: MaterialPipelineService) {
  const { fromMaterialId, toMaterialId } = body
  
  if (!fromMaterialId || !toMaterialId) {
    return NextResponse.json({ 
      error: 'Missing required parameters: fromMaterialId, toMaterialId' 
    }, { status: 400 })
  }
  
  logger.info('Material switch requested', { fromMaterialId, toMaterialId })
  
  try {
    const startTime = Date.now()
    const result = await service.switchMaterial(fromMaterialId, toMaterialId)
    const totalTime = Date.now() - startTime
    
    logger.info('Material switch completed', {
      fromMaterialId,
      toMaterialId,
      switchTime: result.switchTime,
      totalTime,
      cacheHit: result.cacheHit,
      claudeRulesCompliant: result.switchTime <= 100
    })
    
    return NextResponse.json({
      ...result,
      totalTime,
      claudeRulesCompliant: result.switchTime <= 100
    })
  } catch (error) {
    logger.error('Material switch failed', {
      fromMaterialId,
      toMaterialId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Material switch failed'
    }, { status: 500 })
  }
}

async function handlePipelineOptimization(service: MaterialPipelineService) {
  logger.info('Material pipeline optimization requested')
  
  try {
    const startTime = Date.now()
    await service.optimizePipeline()
    const optimizationTime = Date.now() - startTime
    
    const health = service.getSystemHealth()
    
    logger.info('Material pipeline optimization completed', {
      optimizationTime,
      ...health
    })
    
    return NextResponse.json({
      success: true,
      optimizationTime,
      health,
      message: 'Material pipeline optimized successfully'
    })
  } catch (error) {
    logger.error('Material pipeline optimization failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Pipeline optimization failed'
    }, { status: 500 })
  }
}

async function handleMaterialGeneration(body: any, service: MaterialPipelineService) {
  const { materialId, modelId } = body
  
  if (!materialId || !modelId) {
    return NextResponse.json({ 
      error: 'Missing required parameters: materialId, modelId' 
    }, { status: 400 })
  }
  
  logger.info('Material sequence generation requested', { materialId, modelId })
  
  try {
    const result = await service.generateMaterialSequence(materialId, modelId)
    
    logger.info('Material sequence generation completed', {
      materialId,
      modelId,
      ...result
    })
    
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Material sequence generation failed', {
      materialId,
      modelId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Material generation failed'
    }, { status: 500 })
  }
}