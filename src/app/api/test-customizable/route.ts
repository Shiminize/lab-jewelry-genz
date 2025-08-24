import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    // Test the exact async validation function
    const assetPath = 'images/products/3d-sequences/ring-luxury-001-platinum'
    const formats = ['webp', 'avif', 'png']
    const frameAvailability: Record<number, string[]> = {}
    const availableFormats = new Set<string>()
    let totalValidFrames = 0
    
    // Create all file paths to check
    const filePaths: Array<{frame: number, format: string, path: string}> = []
    for (let frame = 0; frame < 36; frame++) {
      for (const format of formats) {
        const filePath = path.join(process.cwd(), 'public', assetPath, `${frame}.${format}`)
        filePaths.push({ frame, format, path: filePath })
      }
    }
    
    // Batch async file existence checks
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
    
    return NextResponse.json({
      success: true,
      assetPath,
      available,
      totalValidFrames,
      availableFormats: Array.from(availableFormats),
      message: 'Async validation working correctly'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}