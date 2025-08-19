/**
 * Admin Inventory Management API
 * GET /api/admin/inventory - Get inventory overview
 * POST /api/admin/inventory/restock - Restock products
 * PUT /api/admin/inventory/[id] - Update inventory settings
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

/**
 * GET /api/admin/inventory - Get comprehensive inventory overview
 */
async function getInventoryOverview(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'low-stock', 'out-of-stock', 'in-stock'
    const category = searchParams.get('category')
    const supplier = searchParams.get('supplier')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build aggregation pipeline for inventory analysis
    const pipeline = []
    
    // Match stage for basic filtering
    const matchStage: any = {}
    if (category) {
      matchStage.category = category
    }
    
    pipeline.push({ $match: matchStage })
    
    // Add inventory calculations - handle cases where inventory might not be an array
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
    
    pipeline.push({
      $addFields: {
        totalInventory: { $sum: '$inventoryArray.quantity' },
        totalReserved: { $sum: '$inventoryArray.reserved' },
        availableInventory: {
          $sum: {
            $map: {
              input: '$inventoryArray',
              as: 'item',
              in: { $subtract: ['$$item.quantity', '$$item.reserved'] }
            }
          }
        },
        lowStockItems: {
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
        },
        stockStatus: {
          $switch: {
            branches: [
              { 
                case: { $eq: ['$availableInventory', 0] }, 
                then: 'out-of-stock' 
              },
              { 
                case: { $gt: ['$lowStockItems', 0] }, 
                then: 'low-stock' 
              }
            ],
            default: 'in-stock'
          }
        }
      }
    })
    
    // Filter by stock status if specified
    if (status && status !== 'all') {
      pipeline.push({
        $match: { stockStatus: status }
      })
    }
    
    // Filter by supplier if specified
    if (supplier) {
      pipeline.push({
        $match: { 'inventory.supplier': supplier }
      })
    }
    
    // Facet for pagination and summary
    pipeline.push({
      $facet: {
        products: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              category: 1,
              subcategory: 1,
              basePrice: 1,
              status: 1,
              inventory: '$inventoryArray',
              totalInventory: 1,
              totalReserved: 1,
              availableInventory: 1,
              stockStatus: 1,
              lowStockItems: 1,
              'analytics.views': 1,
              'analytics.purchases': 1,
              updatedAt: 1
            }
          }
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalInventoryValue: { 
                $sum: { $multiply: ['$totalInventory', '$basePrice'] } 
              },
              totalReservedValue: { 
                $sum: { $multiply: ['$totalReserved', '$basePrice'] } 
              },
              lowStockProducts: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'low-stock'] }, 1, 0] }
              },
              outOfStockProducts: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'out-of-stock'] }, 1, 0] }
              },
              inStockProducts: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'in-stock'] }, 1, 0] }
              }
            }
          }
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalValue: { $sum: { $multiply: ['$totalInventory', '$basePrice'] } },
              lowStock: { $sum: { $cond: [{ $eq: ['$stockStatus', 'low-stock'] }, 1, 0] } },
              outOfStock: { $sum: { $cond: [{ $eq: ['$stockStatus', 'out-of-stock'] }, 1, 0] } }
            }
          },
          { $sort: { totalValue: -1 } }
        ],
        supplierBreakdown: [
          { $unwind: { path: '$inventoryArray', preserveNullAndEmptyArrays: true } },
          {
            $match: {
              'inventoryArray.supplier': { $exists: true, $ne: null }
            }
          },
          {
            $group: {
              _id: '$inventoryArray.supplier',
              products: { $addToSet: '$_id' },
              totalItems: { $sum: '$inventoryArray.quantity' },
              totalValue: { $sum: { $multiply: ['$inventoryArray.quantity', '$inventoryArray.cost'] } }
            }
          },
          {
            $project: {
              supplier: '$_id',
              productCount: { $size: '$products' },
              totalItems: 1,
              totalValue: 1
            }
          },
          { $sort: { totalValue: -1 } }
        ]
      }
    })
    
    const [result] = await db.collection('products').aggregate(pipeline).toArray()
    
    const responseData = {
      products: result.products || [],
      pagination: {
        page,
        limit,
        total: result.summary[0]?.totalProducts || 0,
        totalPages: Math.ceil((result.summary[0]?.totalProducts || 0) / limit),
        hasNextPage: page < Math.ceil((result.summary[0]?.totalProducts || 0) / limit),
        hasPrevPage: page > 1
      },
      summary: result.summary[0] || {
        totalProducts: 0,
        totalInventoryValue: 0,
        totalReservedValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        inStockProducts: 0
      },
      categoryBreakdown: result.categoryBreakdown || [],
      supplierBreakdown: result.supplierBreakdown || [],
      filters: {
        status,
        category,
        supplier
      }
    }
    
    return ok(responseData)
    
  } catch (error) {
    console.error('Inventory overview error:', error)
    return fail('INVENTORY_ERROR', 'Failed to retrieve inventory overview', null, 500)
  }
}

/**
 * POST /api/admin/inventory/restock - Restock products
 */
async function restockProducts(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body // Array of { productId, inventoryItemId, quantity, cost?, supplier? }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return fail('VALIDATION_ERROR', 'Items array is required')
    }
    
    const { db } = await connectToDatabase()
    const results = []
    
    for (const item of items) {
      try {
        const { productId, inventoryItemId, quantity, cost, supplier } = item
        
        if (!productId || !inventoryItemId || !quantity || quantity <= 0) {
          results.push({
            productId,
            success: false,
            error: 'Invalid restock data'
          })
          continue
        }
        
        // Update specific inventory item
        const updateData: any = {
          $inc: { 'inventory.$.quantity': quantity },
          $set: { 'inventory.$.lastRestocked': new Date() }
        }
        
        if (cost !== undefined) {
          updateData.$set['inventory.$.cost'] = cost
        }
        
        if (supplier) {
          updateData.$set['inventory.$.supplier'] = supplier
        }
        
        const updateResult = await db.collection('products').updateOne(
          { 
            _id: productId, 
            'inventory._id': inventoryItemId 
          },
          updateData
        )
        
        if (updateResult.matchedCount === 0) {
          results.push({
            productId,
            success: false,
            error: 'Product or inventory item not found'
          })
        } else {
          results.push({
            productId,
            inventoryItemId,
            success: true,
            quantityAdded: quantity,
            restockedAt: new Date().toISOString()
          })
        }
        
      } catch (itemError) {
        results.push({
          productId: item.productId,
          success: false,
          error: 'Failed to restock item'
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    return ok({
      restockResults: results,
      summary: {
        totalItems: items.length,
        successful: successCount,
        failed: failureCount,
        processedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Restock error:', error)
    return fail('RESTOCK_ERROR', 'Failed to restock products', null, 500)
  }
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/inventory', getInventoryOverview)
export const POST = withAPIMonitoring('/api/admin/inventory/restock', restockProducts)