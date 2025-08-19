/**
 * Email Automation Triggers API
 * GET /api/admin/email-marketing/triggers - List all triggers
 * POST /api/admin/email-marketing/triggers - Create new trigger
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

interface EmailTrigger {
  _id?: string
  name: string
  type: 'abandoned-cart' | 'welcome-series' | 'purchase-followup' | 'birthday' | 'winback' | 'product-restock' | 'review-request'
  status: 'active' | 'paused' | 'draft'
  description: string
  
  trigger: {
    event: string // 'cart_abandoned', 'user_registered', 'order_completed', etc.
    conditions: any[] // Additional conditions
    delay: number // Minutes to wait before triggering
  }
  
  campaign: {
    subject: string
    template: string
    content: {
      html: string
      text: string
      preheader?: string
    }
    variables?: Record<string, any> // Dynamic variables for personalization
  }
  
  targeting: {
    segments?: string[] // Optional segment filtering
    userFilters?: any[] // Additional user filters
    maxFrequency?: {
      count: number
      period: 'day' | 'week' | 'month'
    }
  }
  
  analytics: {
    triggered: number
    sent: number
    opened: number
    clicked: number
    converted: number
    revenue: number
    lastTriggered?: Date
  }
  
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/admin/email-marketing/triggers - List triggers
 */
async function getTriggers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build query filters
    const filters: any = {}
    if (type) filters.type = type
    if (status) filters.status = status
    
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
          },
          conversionRate: {
            $cond: [
              { $gt: ['$analytics.sent', 0] },
              { $multiply: [{ $divide: ['$analytics.converted', '$analytics.sent'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $project: {
          creator: 0,
          'campaign.content.html': 0, // Exclude large HTML content from list view
          'campaign.content.text': 0
        }
      },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          triggers: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]
    
    const [result] = await db.collection('emailTriggers').aggregate(pipeline).toArray()
    const triggers = result.triggers || []
    const total = result.totalCount[0]?.count || 0
    
    // Get summary statistics
    const summaryPipeline = [
      {
        $group: {
          _id: null,
          totalTriggers: { $sum: 1 },
          activeTriggers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalTriggered: { $sum: '$analytics.triggered' },
          totalSent: { $sum: '$analytics.sent' },
          totalOpened: { $sum: '$analytics.opened' },
          totalClicked: { $sum: '$analytics.clicked' },
          totalConverted: { $sum: '$analytics.converted' },
          totalRevenue: { $sum: '$analytics.revenue' },
          avgConversionRate: {
            $avg: {
              $cond: [
                { $gt: ['$analytics.sent', 0] },
                { $multiply: [{ $divide: ['$analytics.converted', '$analytics.sent'] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]
    
    const [summary] = await db.collection('emailTriggers').aggregate(summaryPipeline).toArray()
    
    return ok({
      triggers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: summary || {
        totalTriggers: 0,
        activeTriggers: 0,
        totalTriggered: 0,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalConverted: 0,
        totalRevenue: 0,
        avgConversionRate: 0
      },
      filters: { type, status }
    })
    
  } catch (error) {
    console.error('Get triggers error:', error)
    return fail('TRIGGERS_ERROR', 'Failed to retrieve triggers', null, 500)
  }
}

/**
 * POST /api/admin/email-marketing/triggers - Create trigger
 */
async function createTrigger(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      description,
      trigger,
      campaign,
      targeting = {},
      createdBy
    } = body
    
    // Validation
    if (!name || !type || !trigger?.event || !campaign?.subject || !campaign?.content?.html) {
      return fail('VALIDATION_ERROR', 'Missing required fields: name, type, trigger.event, campaign.subject, campaign.content.html')
    }
    
    const validTypes = ['abandoned-cart', 'welcome-series', 'purchase-followup', 'birthday', 'winback', 'product-restock', 'review-request']
    if (!validTypes.includes(type)) {
      return fail('VALIDATION_ERROR', `Type must be one of: ${validTypes.join(', ')}`)
    }
    
    const validEvents = [
      'cart_abandoned', 'user_registered', 'order_completed', 'user_birthday',
      'last_purchase_30_days', 'product_restocked', 'order_delivered'
    ]
    if (!validEvents.includes(trigger.event)) {
      return fail('VALIDATION_ERROR', `Trigger event must be one of: ${validEvents.join(', ')}`)
    }
    
    const { db } = await connectToDatabase()
    
    // Create trigger document
    const emailTrigger: EmailTrigger = {
      name,
      type,
      status: 'draft',
      description: description || '',
      
      trigger: {
        event: trigger.event,
        conditions: trigger.conditions || [],
        delay: trigger.delay || 0
      },
      
      campaign: {
        subject: campaign.subject,
        template: campaign.template || 'default',
        content: {
          html: campaign.content.html,
          text: campaign.content.text || stripHtml(campaign.content.html),
          preheader: campaign.content.preheader
        },
        variables: campaign.variables || {}
      },
      
      targeting: {
        segments: targeting.segments || [],
        userFilters: targeting.userFilters || [],
        maxFrequency: targeting.maxFrequency
      },
      
      analytics: {
        triggered: 0,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0
      },
      
      isActive: false,
      createdBy: createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('emailTriggers').insertOne(emailTrigger)
    
    if (!result.insertedId) {
      return fail('CREATION_ERROR', 'Failed to create trigger')
    }
    
    // Return created trigger with ID
    const createdTrigger = { ...emailTrigger, _id: result.insertedId }
    
    return ok({
      trigger: createdTrigger,
      message: 'Email trigger created successfully'
    })
    
  } catch (error) {
    console.error('Create trigger error:', error)
    return fail('CREATION_ERROR', 'Failed to create trigger', null, 500)
  }
}

// Helper function to strip HTML tags for text version
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/email-marketing/triggers', getTriggers)
export const POST = withAPIMonitoring('/api/admin/email-marketing/triggers', createTrigger)