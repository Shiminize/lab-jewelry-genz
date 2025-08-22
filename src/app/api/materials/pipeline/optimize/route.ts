/**
 * Material Pipeline Optimize API
 * Triggers material pipeline optimization for performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialPipelineService } from '@/lib/services/material-pipeline.service'
import { getProductionConfig, ProductionLogger } from '@/lib/production-config'

const config = getProductionConfig()
const logger = new ProductionLogger(config)

export async function POST(request: NextRequest) {
  try {
    logger.info('Material pipeline optimization requested')
    
    const service = MaterialPipelineService.getInstance()
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
      message: 'Material pipeline optimized successfully',
      timestamp: new Date().toISOString()
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