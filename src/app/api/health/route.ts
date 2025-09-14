/**
 * Health Check API Endpoint
 * Provides comprehensive system health status including database, memory, and WebSocket connections
 * Compliant with CLAUDE_RULES.md - Simple service layer implementation
 */

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  database: {
    connected: boolean
    responseTime?: number
    error?: string
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  connections: {
    active: number
  }
}

export async function GET() {
  const startTime = Date.now()
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: false
    },
    memory: {
      used: 0,
      total: 0,
      percentage: 0
    },
    connections: {
      active: 0
    }
  }

  // Check database connection
  try {
    const dbStartTime = Date.now()
    await connectToDatabase()
    const dbResponseTime = Date.now() - dbStartTime
    
    healthStatus.database = {
      connected: true,
      responseTime: dbResponseTime
    }

    // Degrade status if DB response is slow
    if (dbResponseTime > 1000) {
      healthStatus.status = 'degraded'
    }
  } catch (error) {
    healthStatus.database = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
    healthStatus.status = 'unhealthy'
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const totalMemory = memoryUsage.heapTotal
  const usedMemory = memoryUsage.heapUsed
  const memoryPercentage = (usedMemory / totalMemory) * 100

  healthStatus.memory = {
    used: Math.round(usedMemory / 1024 / 1024), // Convert to MB
    total: Math.round(totalMemory / 1024 / 1024), // Convert to MB
    percentage: Math.round(memoryPercentage)
  }

  // Degrade status if memory usage is high
  if (memoryPercentage > 80) {
    healthStatus.status = 'degraded'
  }

  // Check WebSocket connections (if available)
  try {
    const global_io = (global as any).io
    if (global_io) {
      healthStatus.connections.active = global_io.engine.clientsCount || 0
    }
  } catch (error) {
    // WebSocket info not critical for health status
    console.warn('Could not get WebSocket connection count:', error)
  }

  const responseTime = Date.now() - startTime
  const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503

  return NextResponse.json(
    {
      ...healthStatus,
      responseTime
    },
    { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  )
}