/**
 * Email Marketing Campaigns API
 * GET /api/admin/email-marketing/campaigns - List all campaigns
 * POST /api/admin/email-marketing/campaigns - Create new campaign
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

interface EmailCampaign {
  _id?: string
  name: string
  type: 'newsletter' | 'promotional' | 'abandoned-cart' | 'welcome-series' | 'product-launch' | 'seasonal'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  subject: string
  template: string
  segments: string[] // Customer segment IDs
  trigger?: {
    type: 'immediate' | 'scheduled' | 'behavioral'
    scheduledAt?: Date
    conditions?: any[]
  }
  content: {
    html: string
    text: string
    preheader?: string
  }
  analytics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
    openRate: number
    clickRate: number
    conversionRate: number
    revenue: number
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  completedAt?: Date
}

/**
 * GET /api/admin/email-marketing/campaigns - List campaigns
 */
async function getCampaigns(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build query filters
    const filters: any = {}
    if (status) filters.status = status
    if (type) filters.type = type
    
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
              'Unknown'
            ]
          }
        }
      },
      {
        $project: {
          creator: 0,
          'content.html': 0, // Exclude large HTML content from list view
          'content.text': 0
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          campaigns: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]
    
    const [result] = await db.collection('emailCampaigns').aggregate(pipeline).toArray()
    const campaigns = result.campaigns || []
    const total = result.totalCount[0]?.count || 0
    
    // Get summary statistics
    const summaryPipeline = [
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          draftCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          completedCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalSent: { $sum: '$analytics.sent' },
          totalOpened: { $sum: '$analytics.opened' },
          totalClicked: { $sum: '$analytics.clicked' },
          totalRevenue: { $sum: '$analytics.revenue' },
          avgOpenRate: { $avg: '$analytics.openRate' },
          avgClickRate: { $avg: '$analytics.clickRate' }
        }
      }
    ]
    
    const [summary] = await db.collection('emailCampaigns').aggregate(summaryPipeline).toArray()
    
    return ok({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: summary || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        draftCampaigns: 0,
        completedCampaigns: 0,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalRevenue: 0,
        avgOpenRate: 0,
        avgClickRate: 0
      },
      filters: { status, type }
    })
    
  } catch (error) {
    console.error('Get campaigns error:', error)
    return fail('CAMPAIGNS_ERROR', 'Failed to retrieve campaigns', null, 500)
  }
}

/**
 * POST /api/admin/email-marketing/campaigns - Create campaign
 */
async function createCampaign(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      subject,
      template,
      segments = [],
      trigger,
      content,
      createdBy
    } = body
    
    // Validation
    if (!name || !type || !subject || !content?.html) {
      return fail('VALIDATION_ERROR', 'Missing required fields: name, type, subject, content.html')
    }
    
    const validTypes = ['newsletter', 'promotional', 'abandoned-cart', 'welcome-series', 'product-launch', 'seasonal']
    if (!validTypes.includes(type)) {
      return fail('VALIDATION_ERROR', `Type must be one of: ${validTypes.join(', ')}`)
    }
    
    const { db } = await connectToDatabase()
    
    // Create campaign document
    const campaign: EmailCampaign = {
      name,
      type,
      status: 'draft',
      subject,
      template: template || 'default',
      segments,
      trigger,
      content: {
        html: content.html,
        text: content.text || stripHtml(content.html),
        preheader: content.preheader
      },
      analytics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenue: 0
      },
      createdBy: createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('emailCampaigns').insertOne(campaign)
    
    if (!result.insertedId) {
      return fail('CREATION_ERROR', 'Failed to create campaign')
    }
    
    // Return created campaign with ID
    const createdCampaign = { ...campaign, _id: result.insertedId }
    
    return ok({
      campaign: createdCampaign,
      message: 'Campaign created successfully'
    })
    
  } catch (error) {
    console.error('Create campaign error:', error)
    return fail('CREATION_ERROR', 'Failed to create campaign', null, 500)
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
export const GET = withAPIMonitoring('/api/admin/email-marketing/campaigns', getCampaigns)
export const POST = withAPIMonitoring('/api/admin/email-marketing/campaigns', createCampaign)