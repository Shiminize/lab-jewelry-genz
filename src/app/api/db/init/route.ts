/**
 * Database Initialization API Route
 * Creates indexes and sets up database structure
 * Only for development/staging environments
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, productRepository } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development/staging
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_INIT !== 'true') {
      return NextResponse.json({
        error: 'Database initialization not allowed in production'
      }, { status: 403 })
    }

    // Initialize database and create indexes
    await initializeDatabase()

    return NextResponse.json({
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({
      error: 'Failed to initialize database',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}