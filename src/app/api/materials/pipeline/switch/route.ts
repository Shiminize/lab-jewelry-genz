/**
 * Material Pipeline Switch API
 * Handles material switching with <100ms CLAUDE_RULES compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialPipelineService } from '@/lib/services/material-pipeline.service'
import { getProductionConfig, ProductionLogger } from '@/lib/production-config'

const config = getProductionConfig()
const logger = new ProductionLogger(config)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromMaterialId, toMaterialId } = body
    
    if (!fromMaterialId || !toMaterialId) {
      return NextResponse.json({ 
        error: 'Missing required parameters: fromMaterialId, toMaterialId' 
      }, { status: 400 })
    }
    
    logger.info('Material switch requested', { fromMaterialId, toMaterialId })
    
    const service = MaterialPipelineService.getInstance()
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
      claudeRulesCompliant: result.switchTime <= 100,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Material switch failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      success: false,
      switchTime: 0,
      cacheHit: false,
      error: error instanceof Error ? error.message : 'Material switch failed'
    }, { status: 500 })
  }
}