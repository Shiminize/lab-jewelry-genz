/**
 * Email Campaign Management API
 * GET /api/admin/email-marketing/campaigns/[id] - Get campaign details
 * PUT /api/admin/email-marketing/campaigns/[id] - Update campaign
 * DELETE /api/admin/email-marketing/campaigns/[id] - Delete campaign
 * POST /api/admin/email-marketing/campaigns/[id]/send - Send campaign
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
 * GET /api/admin/email-marketing/campaigns/[id] - Get campaign details
 */
async function getCampaign(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid campaign ID format')
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
              'Unknown'
            ]
          }
        }
      },
      {
        $project: { creator: 0 }
      }
    ]
    
    const [campaign] = await db.collection('emailCampaigns').aggregate(pipeline).toArray()
    
    if (!campaign) {
      return fail('NOT_FOUND', 'Campaign not found', null, 404)
    }
    
    return ok({ campaign })
    
  } catch (error) {
    console.error('Get campaign error:', error)
    return fail('FETCH_ERROR', 'Failed to retrieve campaign', null, 500)
  }
}

/**
 * PUT /api/admin/email-marketing/campaigns/[id] - Update campaign
 */
async function updateCampaign(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid campaign ID format')
    }
    
    const body = await request.json()
    const {
      name,
      type,
      subject,
      template,
      segments,
      trigger,
      content,
      status
    } = body
    
    // Check if campaign exists and is editable
    const existingCampaign = await db.collection('emailCampaigns').findOne({ _id: new ObjectId(params.id) })
    
    if (!existingCampaign) {
      return fail('NOT_FOUND', 'Campaign not found', null, 404)
    }
    
    if (['active', 'completed', 'cancelled'].includes(existingCampaign.status)) {
      return fail('INVALID_STATE', 'Cannot edit campaign in current status')
    }
    
    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (name) updateData.name = name
    if (type) updateData.type = type
    if (subject) updateData.subject = subject
    if (template) updateData.template = template
    if (segments) updateData.segments = segments
    if (trigger) updateData.trigger = trigger
    if (content) {
      updateData.content = {
        html: content.html,
        text: content.text || stripHtml(content.html),
        preheader: content.preheader
      }
    }
    if (status && ['draft', 'scheduled', 'paused'].includes(status)) {
      updateData.status = status
    }
    
    const result = await db.collection('emailCampaigns').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return fail('UPDATE_ERROR', 'Failed to update campaign')
    }
    
    // Return updated campaign
    const updatedCampaign = await db.collection('emailCampaigns').findOne({ _id: new ObjectId(params.id) })
    
    return ok({
      campaign: updatedCampaign,
      message: 'Campaign updated successfully'
    })
    
  } catch (error) {
    console.error('Update campaign error:', error)
    return fail('UPDATE_ERROR', 'Failed to update campaign', null, 500)
  }
}

/**
 * DELETE /api/admin/email-marketing/campaigns/[id] - Delete campaign
 */
async function deleteCampaign(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid campaign ID format')
    }
    
    // Check if campaign exists and can be deleted
    const existingCampaign = await db.collection('emailCampaigns').findOne({ _id: new ObjectId(params.id) })
    
    if (!existingCampaign) {
      return fail('NOT_FOUND', 'Campaign not found', null, 404)
    }
    
    if (['active', 'completed'].includes(existingCampaign.status)) {
      return fail('INVALID_STATE', 'Cannot delete active or completed campaigns')
    }
    
    const result = await db.collection('emailCampaigns').deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return fail('DELETE_ERROR', 'Failed to delete campaign')
    }
    
    return ok({
      message: 'Campaign deleted successfully',
      deletedId: params.id
    })
    
  } catch (error) {
    console.error('Delete campaign error:', error)
    return fail('DELETE_ERROR', 'Failed to delete campaign', null, 500)
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
export const GET = withAPIMonitoring('/api/admin/email-marketing/campaigns/[id]', getCampaign)
export const PUT = withAPIMonitoring('/api/admin/email-marketing/campaigns/[id]', updateCampaign)
export const DELETE = withAPIMonitoring('/api/admin/email-marketing/campaigns/[id]', deleteCampaign)