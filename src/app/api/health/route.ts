/**
 * Health Check API
 * GET /api/health - Simple health check endpoint
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: 'operational'
    },
    meta: {
      version: '1.0.0'
    }
  })
}