import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Test basic fs operation
    const testPath = path.join(process.cwd(), 'public')
    
    // Test async fs operation
    const exists = await fs.promises.access(testPath).then(() => true).catch(() => false)
    
    return NextResponse.json({
      success: true,
      testPath,
      exists,
      cwd: process.cwd(),
      message: 'fs module working correctly'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}