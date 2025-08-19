/**
 * Customer Segmentation API
 * GET /api/admin/email-marketing/segments - List all segments
 * POST /api/admin/email-marketing/segments - Create new segment
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

interface CustomerSegment {
  _id?: string
  name: string
  description: string
  type: 'behavioral' | 'demographic' | 'geographic' | 'psychographic' | 'transactional'
  criteria: {
    rules: Array<{
      field: string
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
      value: any
      logic?: 'AND' | 'OR'
    }>
    conditions: string // Human readable conditions
  }
  isActive: boolean
  customerCount: number
  lastCalculated: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/admin/email-marketing/segments - List segments
 */
async function getSegments(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build query filters
    const filters: any = {}
    if (type) filters.type = type
    if (isActive !== null) filters.isActive = isActive === 'true'
    
    // Build aggregation pipeline
    const pipeline = [
      { $match: filters },
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
      },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          segments: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]
    
    const [result] = await db.collection('customerSegments').aggregate(pipeline).toArray()
    const segments = result.segments || []
    const total = result.totalCount[0]?.count || 0
    
    // Get summary statistics
    const summaryPipeline = [
      {
        $group: {
          _id: null,
          totalSegments: { $sum: 1 },
          activeSegments: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalCustomers: { $sum: '$customerCount' },
          avgSegmentSize: { $avg: '$customerCount' },
          segmentsByType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      },
      {
        $addFields: {
          typeBreakdown: {
            $reduce: {
              input: '$segmentsByType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $let: {
                      vars: { type: '$$this.type' },
                      in: {
                        $arrayToObject: [
                          [{ k: '$$type', v: { $add: [{ $ifNull: [{ $getField: { field: '$$type', input: '$$value' } }, 0] }, '$$this.count'] } }]
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]
    
    const [summary] = await db.collection('customerSegments').aggregate(summaryPipeline).toArray()
    
    return ok({
      segments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: summary || {
        totalSegments: 0,
        activeSegments: 0,
        totalCustomers: 0,
        avgSegmentSize: 0,
        typeBreakdown: {}
      },
      filters: { type, isActive }
    })
    
  } catch (error) {
    console.error('Get segments error:', error)
    return fail('SEGMENTS_ERROR', 'Failed to retrieve segments', null, 500)
  }
}

/**
 * POST /api/admin/email-marketing/segments - Create segment
 */
async function createSegment(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      type,
      criteria,
      createdBy
    } = body
    
    // Validation
    if (!name || !type || !criteria?.rules) {
      return fail('VALIDATION_ERROR', 'Missing required fields: name, type, criteria.rules')
    }
    
    const validTypes = ['behavioral', 'demographic', 'geographic', 'psychographic', 'transactional']
    if (!validTypes.includes(type)) {
      return fail('VALIDATION_ERROR', `Type must be one of: ${validTypes.join(', ')}`)
    }
    
    if (!Array.isArray(criteria.rules) || criteria.rules.length === 0) {
      return fail('VALIDATION_ERROR', 'Criteria rules must be a non-empty array')
    }
    
    const { db } = await connectToDatabase()
    
    // Calculate initial customer count
    const customerCount = await calculateSegmentSize(db, criteria.rules)
    
    // Create segment document
    const segment: CustomerSegment = {
      name,
      description: description || '',
      type,
      criteria: {
        rules: criteria.rules,
        conditions: criteria.conditions || generateConditionsText(criteria.rules)
      },
      isActive: true,
      customerCount,
      lastCalculated: new Date(),
      createdBy: createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('customerSegments').insertOne(segment)
    
    if (!result.insertedId) {
      return fail('CREATION_ERROR', 'Failed to create segment')
    }
    
    // Return created segment with ID
    const createdSegment = { ...segment, _id: result.insertedId }
    
    return ok({
      segment: createdSegment,
      message: 'Segment created successfully'
    })
    
  } catch (error) {
    console.error('Create segment error:', error)
    return fail('CREATION_ERROR', 'Failed to create segment', null, 500)
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
export const GET = withAPIMonitoring('/api/admin/email-marketing/segments', getSegments)
export const POST = withAPIMonitoring('/api/admin/email-marketing/segments', createSegment)