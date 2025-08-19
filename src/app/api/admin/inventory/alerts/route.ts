/**
 * Inventory Alerts API
 * GET /api/admin/inventory/alerts - Get inventory alerts and notifications
 * POST /api/admin/inventory/alerts/settings - Update alert settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { withAPIMonitoring } from '@/lib/performance'
import crypto from 'crypto'

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

interface InventoryAlert {
  type: 'low-stock' | 'out-of-stock' | 'reorder-point' | 'no-supplier' | 'cost-increase'
  severity: 'low' | 'medium' | 'high' | 'critical'
  productId: string
  productName: string
  category: string
  message: string
  data: any
  createdAt: Date
}

/**
 * GET /api/admin/inventory/alerts - Get inventory alerts
 */
async function getInventoryAlerts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') // 'low', 'medium', 'high', 'critical'
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build aggregation pipeline for alerts
    const pipeline = []
    
    // Match active products only
    pipeline.push({
      $match: {
        status: 'active',
        trackInventory: true
      }
    })
    
    // Add inventory calculations and generate alerts
    pipeline.push({
      $addFields: {
        inventoryArray: {
          $cond: {
            if: { $isArray: '$inventory' },
            then: '$inventory',
            else: []
          }
        }
      }
    })
    
    // Simplify alert generation - check for basic stock issues
    pipeline.push({
      $addFields: {
        hasAnyAlerts: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: '$inventoryArray',
                  as: 'item',
                  cond: {
                    $or: [
                      { $eq: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] },
                      { $lte: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, '$$item.lowStockThreshold'] }
                    ]
                  }
                }
              }
            }, 0
          ]
        },
        alertType: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$inventoryArray',
                      as: 'item',
                      cond: { $eq: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] }
                    }
                  }
                }, 0
              ]
            },
            'out-of-stock',
            'low-stock'
          ]
        },
        alertSeverity: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$inventoryArray',
                      as: 'item',
                      cond: { $eq: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] }
                    }
                  }
                }, 0
              ]
            },
            'critical',
            'high'
          ]
        }
      }
    })
    
    // Filter products that have alerts
    pipeline.push({
      $match: {
        hasAnyAlerts: true
      }
    })
    
    // Create alert objects
    pipeline.push({
      $addFields: {
        alert: {
          type: '$alertType',
          severity: '$alertSeverity',
          productId: { $toString: '$_id' },
          productName: '$name',
          category: '$category',
          subcategory: '$subcategory',
          message: {
            $concat: [
              '$name',
              {
                $cond: [
                  { $eq: ['$alertType', 'out-of-stock'] },
                  ' is out of stock',
                  ' is low on stock'
                ]
              }
            ]
          },
          data: {
            totalInventory: { $sum: '$inventoryArray.quantity' },
            availableInventory: {
              $sum: {
                $map: {
                  input: '$inventoryArray',
                  as: 'item',
                  in: { $subtract: ['$$item.quantity', '$$item.reserved'] }
                }
              }
            }
          },
          createdAt: new Date()
        }
      }
    })
    
    // Filter by severity if specified
    if (severity) {
      pipeline.push({
        $match: { 'alert.severity': severity }
      })
    }
    
    // Filter by type if specified
    if (type) {
      pipeline.push({
        $match: { 'alert.type': type }
      })
    }
    
    // Filter by category if specified
    if (category) {
      pipeline.push({
        $match: { category: category }
      })
    }
    
    // Project final alert structure
    pipeline.push({
      $replaceRoot: { newRoot: '$alert' }
    })
    
    // Add manual severity ordering
    pipeline.push({
      $addFields: {
        severityOrder: {
          $switch: {
            branches: [
              { case: { $eq: ['$severity', 'critical'] }, then: 1 },
              { case: { $eq: ['$severity', 'high'] }, then: 2 },
              { case: { $eq: ['$severity', 'medium'] }, then: 3 },
              { case: { $eq: ['$severity', 'low'] }, then: 4 }
            ],
            default: 5
          }
        }
      }
    })
    
    pipeline.push({
      $sort: { severityOrder: 1 }
    })
    
    // Limit results
    pipeline.push({ $limit: limit })
    
    // Remove the helper field
    pipeline.push({
      $project: { severityOrder: 0 }
    })
    
    const alerts = await db.collection('products').aggregate(pipeline).toArray()
    
    // Get summary statistics
    const summaryPipeline = [
      {
        $match: {
          status: 'active',
          trackInventory: true
        }
      },
      {
        $addFields: {
          inventoryArray: {
            $cond: {
              if: { $isArray: '$inventory' },
              then: '$inventory',
              else: []
            }
          }
        }
      },
      {
        $addFields: {
          totalInventory: { $sum: '$inventoryArray.quantity' },
          availableInventory: {
            $sum: {
              $map: {
                input: '$inventoryArray',
                as: 'item',
                in: { $subtract: ['$$item.quantity', '$$item.reserved'] }
              }
            }
          },
          hasLowStock: {
            $gt: [{
              $size: {
                $filter: {
                  input: '$inventoryArray',
                  as: 'item',
                  cond: {
                    $and: [
                      { $gt: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] },
                      { $lte: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, '$$item.lowStockThreshold'] }
                    ]
                  }
                }
              }
            }, 0]
          },
          hasOutOfStock: {
            $gt: [{
              $size: {
                $filter: {
                  input: '$inventoryArray',
                  as: 'item',
                  cond: { $eq: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] }
                }
              }
            }, 0]
          },
          needsReorder: {
            $gt: [{
              $size: {
                $filter: {
                  input: '$inventoryArray',
                  as: 'item',
                  cond: {
                    $and: [
                      { $gt: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, 0] },
                      { $lte: [{ $subtract: ['$$item.quantity', '$$item.reserved'] }, '$$item.reorderPoint'] }
                    ]
                  }
                }
              }
            }, 0]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStockProducts: { $sum: { $cond: ['$hasLowStock', 1, 0] } },
          outOfStockProducts: { $sum: { $cond: ['$hasOutOfStock', 1, 0] } },
          reorderProducts: { $sum: { $cond: ['$needsReorder', 1, 0] } },
          totalInventoryValue: { $sum: { $multiply: ['$totalInventory', '$basePrice'] } },
          criticalAlerts: { $sum: { $cond: ['$hasOutOfStock', 1, 0] } },
          highAlerts: { $sum: { $cond: ['$hasLowStock', 1, 0] } },
          mediumAlerts: { $sum: { $cond: ['$needsReorder', 1, 0] } }
        }
      }
    ]
    
    const [summary] = await db.collection('products').aggregate(summaryPipeline).toArray()
    
    return ok({
      alerts,
      summary: summary || {
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        reorderProducts: 0,
        totalInventoryValue: 0,
        criticalAlerts: 0,
        highAlerts: 0,
        mediumAlerts: 0
      },
      filters: {
        severity,
        type,
        category
      },
      alertCounts: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    })
    
  } catch (error) {
    console.error('Inventory alerts error:', error)
    return fail('ALERTS_ERROR', 'Failed to retrieve inventory alerts', null, 500)
  }
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/inventory/alerts', getInventoryAlerts)