import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

/**
 * Test route for async batch validation - isolated from other services
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now()
  
  try {
    // Hardcoded test data to avoid any import issues
    const assetPath = 'images/products/3d-sequences/ring-luxury-001-platinum'
    const formats = ['webp', 'avif', 'png']
    
    // Async batch validation function
    const frameAvailability: Record<number, string[]> = {}
    const availableFormats = new Set<string>()
    let totalValidFrames = 0
    
    console.log(`🔍 [TEST CONCURRENCY] Checking availability for: ${assetPath}`)
    
    // Create all file paths to check
    const filePaths: Array<{frame: number, format: string, path: string}> = []
    for (let frame = 0; frame < 36; frame++) {
      for (const format of formats) {
        const filePath = path.join(process.cwd(), 'public', assetPath, `${frame}.${format}`)
        filePaths.push({ frame, format, path: filePath })
      }
    }
    
    // Batch async file existence checks - NEW APPROACH
    const validationPromises = filePaths.map(async ({ frame, format, path: filePath }) => {
      try {
        await fs.promises.access(filePath)
        return { frame, format, exists: true }
      } catch {
        return { frame, format, exists: false }
      }
    })
    
    // Wait for all validations in parallel
    const validationResults = await Promise.all(validationPromises)
    
    // Process results
    for (const { frame, format, exists } of validationResults) {
      if (exists) {
        if (!frameAvailability[frame]) {
          frameAvailability[frame] = []
        }
        frameAvailability[frame].push(format)
        availableFormats.add(format)
      }
    }
    
    // Count valid frames
    totalValidFrames = Object.keys(frameAvailability).length
    const available = totalValidFrames >= 30
    
    const responseTime = performance.now() - startTime
    
    // Return test results
    return NextResponse.json({
      success: true,
      data: {
        productId: 'ring-001',
        materialId: 'platinum',
        assets: {
          available,
          assetPaths: [`/${assetPath}`],
          lastGenerated: new Date().toISOString(),
          frameCount: totalValidFrames,
          availableFormats: Array.from(availableFormats),
          validationTimestamp: new Date().toISOString()
        }
      },
      performance: {
        responseTime: `${Math.round(responseTime)}ms`
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'test-1.0.0'
      }
    }, {
      headers: {
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false'
      }
    })
  } catch (error: any) {
    const responseTime = performance.now() - startTime
    console.error(`❌ [TEST CONCURRENCY] Error:`, error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      performance: {
        responseTime: `${Math.round(responseTime)}ms`
      }
    }, { status: 500 })
  }
}