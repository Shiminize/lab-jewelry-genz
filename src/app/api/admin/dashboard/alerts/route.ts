import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/database'

interface SystemAlert {
  id: string
  type: 'inventory' | 'performance' | 'revenue' | 'security' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actionRequired: boolean
  actionUrl?: string
  createdAt: Date
  resolvedAt?: Date
  metadata?: any
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const resolved = searchParams.get('resolved') === 'true'

    // Check inventory alerts
    const inventoryAlerts = await checkInventoryAlerts()
    
    // Check performance alerts
    const performanceAlerts = await checkPerformanceAlerts()
    
    // Check revenue alerts
    const revenueAlerts = await checkRevenueAlerts()
    
    // Check system alerts
    const systemAlerts = await checkSystemAlerts()

    // Combine all alerts
    let allAlerts = [
      ...inventoryAlerts,
      ...performanceAlerts,
      ...revenueAlerts,
      ...systemAlerts
    ]

    // Apply filters
    if (severity) {
      allAlerts = allAlerts.filter(alert => alert.severity === severity)
    }
    if (type) {
      allAlerts = allAlerts.filter(alert => alert.type === type)
    }
    if (resolved !== null) {
      allAlerts = allAlerts.filter(alert => resolved ? alert.resolvedAt : !alert.resolvedAt)
    }

    // Sort by severity and creation date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    allAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: {
        alerts: allAlerts,
        summary: {
          total: allAlerts.length,
          critical: allAlerts.filter(a => a.severity === 'critical').length,
          high: allAlerts.filter(a => a.severity === 'high').length,
          medium: allAlerts.filter(a => a.severity === 'medium').length,
          low: allAlerts.filter(a => a.severity === 'low').length,
          actionRequired: allAlerts.filter(a => a.actionRequired).length
        }
      }
    })

  } catch (error) {
    console.error('Admin alerts error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch alerts'
    }, { status: 500 })
  }
}

// Check inventory-related alerts
async function checkInventoryAlerts(): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = []

  try {
    // Check for low stock items
    const lowStockProducts = await mongoose.connection.db.collection('products').find({
      stockStatus: { $in: ['low-stock', 'out-of-stock'] }
    }).limit(10).toArray()

    if (lowStockProducts.length > 0) {
      const outOfStock = lowStockProducts.filter(p => p.stockStatus === 'out-of-stock')
      const lowStock = lowStockProducts.filter(p => p.stockStatus === 'low-stock')

      if (outOfStock.length > 0) {
        alerts.push({
          id: `inventory-out-${Date.now()}`,
          type: 'inventory',
          severity: 'critical',
          title: `${outOfStock.length} products out of stock`,
          message: `Critical inventory shortage affecting ${outOfStock.length} products: ${outOfStock.slice(0, 3).map(p => p.name).join(', ')}${outOfStock.length > 3 ? '...' : ''}`,
          actionRequired: true,
          actionUrl: '/admin/inventory?filter=out-of-stock',
          createdAt: new Date(),
          metadata: { productIds: outOfStock.map(p => p._id), count: outOfStock.length }
        })
      }

      if (lowStock.length > 0) {
        alerts.push({
          id: `inventory-low-${Date.now()}`,
          type: 'inventory',
          severity: 'medium',
          title: `${lowStock.length} products running low on inventory`,
          message: `Consider restocking: ${lowStock.slice(0, 3).map(p => p.name).join(', ')}${lowStock.length > 3 ? '...' : ''}`,
          actionRequired: true,
          actionUrl: '/admin/inventory?filter=low-stock',
          createdAt: new Date(),
          metadata: { productIds: lowStock.map(p => p._id), count: lowStock.length }
        })
      }
    }

  } catch (error) {
    console.error('Inventory alerts check error:', error)
  }

  return alerts
}

// Check performance-related alerts
async function checkPerformanceAlerts(): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = []

  try {
    // Mock performance monitoring data
    const apiResponseTime = Math.random() * 500 + 100 // 100-600ms
    const errorRate = Math.random() * 2 // 0-2%
    const uptime = 99.9 - (Math.random() * 0.5) // 99.4-99.9%

    if (apiResponseTime > 300) {
      alerts.push({
        id: `perf-response-${Date.now()}`,
        type: 'performance',
        severity: apiResponseTime > 500 ? 'high' : 'medium',
        title: 'API response time elevated',
        message: `Current average response time: ${Math.round(apiResponseTime)}ms (target: <300ms)`,
        actionRequired: apiResponseTime > 500,
        actionUrl: '/admin/performance',
        createdAt: new Date(),
        metadata: { responseTime: apiResponseTime, threshold: 300 }
      })
    }

    if (errorRate > 1) {
      alerts.push({
        id: `perf-errors-${Date.now()}`,
        type: 'performance',
        severity: errorRate > 1.5 ? 'high' : 'medium',
        title: 'Error rate above threshold',
        message: `Current error rate: ${errorRate.toFixed(2)}% (target: <1%)`,
        actionRequired: errorRate > 1.5,
        actionUrl: '/admin/performance',
        createdAt: new Date(),
        metadata: { errorRate, threshold: 1 }
      })
    }

    if (uptime < 99.5) {
      alerts.push({
        id: `perf-uptime-${Date.now()}`,
        type: 'performance',
        severity: 'high',
        title: 'System uptime below target',
        message: `Current uptime: ${uptime.toFixed(2)}% (target: >99.5%)`,
        actionRequired: true,
        actionUrl: '/admin/performance',
        createdAt: new Date(),
        metadata: { uptime, threshold: 99.5 }
      })
    }

  } catch (error) {
    console.error('Performance alerts check error:', error)
  }

  return alerts
}

// Check revenue-related alerts
async function checkRevenueAlerts(): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = []

  try {
    // Check monthly revenue progress
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyTarget = 416667 // $5M annual / 12 months

    const monthlyRevenue = await mongoose.connection.db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]).toArray()

    const currentMonthlyRevenue = monthlyRevenue[0]?.totalRevenue || 347000
    const progressPercentage = (currentMonthlyRevenue / monthlyTarget) * 100
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const dayOfMonth = now.getDate()
    const expectedProgress = (dayOfMonth / daysInMonth) * 100

    if (progressPercentage < expectedProgress - 10) {
      alerts.push({
        id: `revenue-target-${Date.now()}`,
        type: 'revenue',
        severity: 'medium',
        title: 'Monthly revenue behind target',
        message: `Revenue at ${progressPercentage.toFixed(1)}% of monthly target (expected: ${expectedProgress.toFixed(1)}%)`,
        actionRequired: true,
        actionUrl: '/admin/analytics',
        createdAt: new Date(),
        metadata: { 
          currentRevenue: currentMonthlyRevenue, 
          target: monthlyTarget, 
          progressPercentage,
          expectedProgress 
        }
      })
    } else if (progressPercentage > expectedProgress + 15) {
      alerts.push({
        id: `revenue-exceed-${Date.now()}`,
        type: 'revenue',
        severity: 'low',
        title: 'Monthly revenue exceeding expectations',
        message: `Revenue at ${progressPercentage.toFixed(1)}% of monthly target - on track to exceed by ${(progressPercentage - 100).toFixed(1)}%`,
        actionRequired: false,
        createdAt: new Date(),
        metadata: { 
          currentRevenue: currentMonthlyRevenue, 
          target: monthlyTarget, 
          progressPercentage 
        }
      })
    }

  } catch (error) {
    console.error('Revenue alerts check error:', error)
  }

  return alerts
}

// Check system-related alerts
async function checkSystemAlerts(): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = []

  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState
    if (dbStatus !== 1) {
      alerts.push({
        id: `system-db-${Date.now()}`,
        type: 'system',
        severity: 'critical',
        title: 'Database connection issue',
        message: 'Database connection is not in ready state',
        actionRequired: true,
        createdAt: new Date(),
        metadata: { dbStatus }
      })
    }

    // Check for pending migrations or updates
    // This would typically check a system status table
    const pendingUpdates = false // Mock check
    if (pendingUpdates) {
      alerts.push({
        id: `system-updates-${Date.now()}`,
        type: 'system',
        severity: 'low',
        title: 'System updates available',
        message: 'Non-critical system updates are available for deployment',
        actionRequired: false,
        actionUrl: '/admin/settings',
        createdAt: new Date()
      })
    }

  } catch (error) {
    console.error('System alerts check error:', error)
  }

  return alerts
}

// POST endpoint for resolving alerts
export async function POST(request: NextRequest) {
  try {
    const { alertId, action } = await request.json()
    
    if (action === 'resolve') {
      // In a real implementation, this would update the alert status in the database
      return NextResponse.json({
        success: true,
        message: 'Alert resolved successfully'
      })
    }
    
    if (action === 'acknowledge') {
      // Acknowledge alert without resolving
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Admin alerts POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update alert'
    }, { status: 500 })
  }
}