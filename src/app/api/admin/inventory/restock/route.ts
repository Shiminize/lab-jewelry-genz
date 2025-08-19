/**
 * Inventory Restock API
 * POST /api/admin/inventory/restock - Restock inventory items
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
export const POST = withAPIMonitoring('/api/admin/inventory/restock', restockProducts)