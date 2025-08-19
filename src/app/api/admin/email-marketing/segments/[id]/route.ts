/**
 * Customer Segment Management API
 * GET /api/admin/email-marketing/segments/[id] - Get segment details
 * PUT /api/admin/email-marketing/segments/[id] - Update segment
 * DELETE /api/admin/email-marketing/segments/[id] - Delete segment
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { withAPIMonitoring } from '@/lib/performance'
import { ObjectId } from 'mongodb'
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
 * GET /api/admin/email-marketing/segments/[id] - Get segment details
 */
async function getSegment(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid segment ID format')
    }
    
    const pipeline = [
      { $match: { _id: new ObjectId(params.id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $addFields: {
          creatorName: {
            $ifNull: [
              { $concat: [{ $arrayElemAt: ['$creator.firstName', 0] }, ' ', { $arrayElemAt: ['$creator.lastName', 0] }] },
              'System'
            ]
          }
        }
      },
      {
        $project: { creator: 0 }
      }
    ]
    
    const [segment] = await db.collection('customerSegments').aggregate(pipeline).toArray()
    
    if (!segment) {
      return fail('NOT_FOUND', 'Segment not found', null, 404)
    }
    
    // Get sample customers in this segment
    const sampleCustomers = await getSampleCustomers(db, segment.criteria.rules, 10)
    
    return ok({ 
      segment,
      sampleCustomers
    })
    
  } catch (error) {
    console.error('Get segment error:', error)
    return fail('FETCH_ERROR', 'Failed to retrieve segment', null, 500)
  }
}

/**
 * PUT /api/admin/email-marketing/segments/[id] - Update segment
 */
async function updateSegment(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid segment ID format')
    }
    
    const body = await request.json()
    const {
      name,
      description,
      type,
      criteria,
      isActive
    } = body
    
    // Check if segment exists
    const existingSegment = await db.collection('customerSegments').findOne({ _id: new ObjectId(params.id) })
    
    if (!existingSegment) {
      return fail('NOT_FOUND', 'Segment not found', null, 404)
    }
    
    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type) updateData.type = type
    if (isActive !== undefined) updateData.isActive = isActive
    
    if (criteria?.rules) {
      // Recalculate customer count if criteria changed
      const customerCount = await calculateSegmentSize(db, criteria.rules)
      
      updateData.criteria = {
        rules: criteria.rules,
        conditions: criteria.conditions || generateConditionsText(criteria.rules)
      }
      updateData.customerCount = customerCount
      updateData.lastCalculated = new Date()
    }
    
    const result = await db.collection('customerSegments').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return fail('UPDATE_ERROR', 'Failed to update segment')
    }
    
    // Return updated segment
    const updatedSegment = await db.collection('customerSegments').findOne({ _id: new ObjectId(params.id) })
    
    return ok({
      segment: updatedSegment,
      message: 'Segment updated successfully'
    })
    
  } catch (error) {
    console.error('Update segment error:', error)
    return fail('UPDATE_ERROR', 'Failed to update segment', null, 500)
  }
}

/**
 * DELETE /api/admin/email-marketing/segments/[id] - Delete segment
 */
async function deleteSegment(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid segment ID format')
    }
    
    // Check if segment exists
    const existingSegment = await db.collection('customerSegments').findOne({ _id: new ObjectId(params.id) })
    
    if (!existingSegment) {
      return fail('NOT_FOUND', 'Segment not found', null, 404)
    }
    
    // Check if segment is being used in any campaigns
    const campaignCount = await db.collection('emailCampaigns').countDocuments({
      segments: params.id,
      status: { $in: ['active', 'scheduled'] }
    })
    
    if (campaignCount > 0) {
      return fail('SEGMENT_IN_USE', 'Cannot delete segment that is being used in active campaigns')
    }
    
    const result = await db.collection('customerSegments').deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return fail('DELETE_ERROR', 'Failed to delete segment')
    }
    
    return ok({
      message: 'Segment deleted successfully',
      deletedId: params.id
    })
    
  } catch (error) {
    console.error('Delete segment error:', error)
    return fail('DELETE_ERROR', 'Failed to delete segment', null, 500)
  }
}

// Get sample customers matching segment criteria
async function getSampleCustomers(db: any, rules: any[], limit: number = 10): Promise<any[]> {
  try {
    const pipeline = buildSegmentationPipeline(rules)
    pipeline.push(
      { $limit: limit },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          createdAt: 1,
          lastPurchase: 1,
          totalSpent: 1,
          preferences: 1
        }
      }
    )
    
    const customers = await db.collection('users').aggregate(pipeline).toArray()
    return customers
    
  } catch (error) {
    console.error('Error getting sample customers:', error)
    return []
  }
}

// Calculate segment size based on criteria
async function calculateSegmentSize(db: any, rules: any[]): Promise<number> {
  try {
    const pipeline = buildSegmentationPipeline(rules)
    const result = await db.collection('users').aggregate([
      ...pipeline,
      { $count: 'count' }
    ]).toArray()
    
    return result[0]?.count || 0
    
  } catch (error) {
    console.error('Error calculating segment size:', error)
    return 0
  }
}

// Build MongoDB aggregation pipeline from segmentation rules
function buildSegmentationPipeline(rules: any[]): any[] {
  const pipeline: any[] = []
  
  // Base filter for active users with verified emails
  const baseMatch = {
    isActive: { $ne: false },
    emailVerified: true,
    marketingOptIn: { $ne: false }
  }
  
  // Build match conditions from rules
  const conditions: any[] = []
  
  for (const rule of rules) {
    const condition = buildRuleCondition(rule)
    if (condition) {
      conditions.push(condition)
    }
  }
  
  // Combine conditions with logic
  let finalMatch = baseMatch
  if (conditions.length > 0) {
    const logic = rules[0]?.logic || 'AND'
    if (logic === 'OR') {
      finalMatch = { ...baseMatch, $or: conditions }
    } else {
      finalMatch = { ...baseMatch, $and: conditions }
    }
  }
  
  pipeline.push({ $match: finalMatch })
  
  return pipeline
}

// Build individual rule condition
function buildRuleCondition(rule: any): any {
  const { field, operator, value } = rule
  
  switch (operator) {
    case 'equals':
      return { [field]: value }
    case 'not_equals':
      return { [field]: { $ne: value } }
    case 'contains':
      return { [field]: { $regex: value, $options: 'i' } }
    case 'not_contains':
      return { [field]: { $not: { $regex: value, $options: 'i' } } }
    case 'greater_than':
      return { [field]: { $gt: value } }
    case 'less_than':
      return { [field]: { $lt: value } }
    case 'between':
      return { [field]: { $gte: value[0], $lte: value[1] } }
    case 'in':
      return { [field]: { $in: Array.isArray(value) ? value : [value] } }
    case 'not_in':
      return { [field]: { $nin: Array.isArray(value) ? value : [value] } }
    default:
      return null
  }
}

// Generate human-readable conditions text
function generateConditionsText(rules: any[]): string {
  return rules.map(rule => {
    const { field, operator, value } = rule
    const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    
    switch (operator) {
      case 'equals':
        return `${fieldName} equals "${value}"`
      case 'not_equals':
        return `${fieldName} does not equal "${value}"`
      case 'contains':
        return `${fieldName} contains "${value}"`
      case 'not_contains':
        return `${fieldName} does not contain "${value}"`
      case 'greater_than':
        return `${fieldName} is greater than ${value}`
      case 'less_than':
        return `${fieldName} is less than ${value}`
      case 'between':
        return `${fieldName} is between ${value[0]} and ${value[1]}`
      case 'in':
        return `${fieldName} is in [${Array.isArray(value) ? value.join(', ') : value}]`
      case 'not_in':
        return `${fieldName} is not in [${Array.isArray(value) ? value.join(', ') : value}]`
      default:
        return `${fieldName} ${operator} ${value}`
    }
  }).join(' AND ')
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/email-marketing/segments/[id]', getSegment)
export const PUT = withAPIMonitoring('/api/admin/email-marketing/segments/[id]', updateSegment)
export const DELETE = withAPIMonitoring('/api/admin/email-marketing/segments/[id]', deleteSegment)