/**
 * Material Pipeline Health API
 * Provides real-time health metrics for material pipeline system
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialPipelineService } from '@/lib/services/material-pipeline.service'
import { getProductionConfig, ProductionLogger } from '@/lib/production-config'

const config = getProductionConfig()
const logger = new ProductionLogger(config)

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const service = MaterialPipelineService.getInstance()
    
    const health = service.getSystemHealth()
    const responseTime = Date.now() - startTime
    
    logger.debug('Material pipeline health check', { ...health, responseTime })
    
    return NextResponse.json({
      ...health,
      responseTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Material pipeline health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      materialsLoaded: 0,
      cacheSize: 0,
      averageSwitchTime: 0,
      claudeRulesCompliance: 0,
      memoryUsage: '0MB',
      error: 'Health check failed'
    }, { status: 500 })
  }
}