/**
 * Email Campaign Send API
 * POST /api/admin/email-marketing/campaigns/[id]/send - Send campaign to recipients
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
 * POST /api/admin/email-marketing/campaigns/[id]/send - Send campaign
 */
async function sendCampaign(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return fail('INVALID_ID', 'Invalid campaign ID format')
    }
    
    const body = await request.json()
    const { testMode = false, testEmail } = body
    
    // Get campaign details
    const campaign = await db.collection('emailCampaigns').findOne({ _id: new ObjectId(params.id) })
    
    if (!campaign) {
      return fail('NOT_FOUND', 'Campaign not found', null, 404)
    }
    
    if (campaign.status === 'completed') {
      return fail('INVALID_STATE', 'Campaign already completed')
    }
    
    if (campaign.status === 'active') {
      return fail('INVALID_STATE', 'Campaign is currently being sent')
    }
    
    // Validate campaign has required content
    if (!campaign.content?.html || !campaign.subject) {
      return fail('VALIDATION_ERROR', 'Campaign missing required content or subject')
    }
    
    let recipients = []
    let sendResults = {
      total: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    if (testMode) {
      // Test mode - send to specified test email only
      if (!testEmail) {
        return fail('VALIDATION_ERROR', 'Test email required for test mode')
      }
      
      recipients = [{ email: testEmail, firstName: 'Test', lastName: 'User' }]
      
    } else {
      // Production mode - get recipients from segments
      if (!campaign.segments || campaign.segments.length === 0) {
        return fail('VALIDATION_ERROR', 'Campaign has no target segments')
      }
      
      // Get recipients from customer segments
      recipients = await getSegmentRecipients(db, campaign.segments)
      
      if (recipients.length === 0) {
        return fail('NO_RECIPIENTS', 'No recipients found in target segments')
      }
      
      // Update campaign status to active
      await db.collection('emailCampaigns').updateOne(
        { _id: new ObjectId(params.id) },
        { 
          $set: { 
            status: 'active',
            sentAt: new Date(),
            updatedAt: new Date()
          } 
        }
      )
    }
    
    sendResults.total = recipients.length
    
    // Send emails (simulate for now - in production this would use the email service)
    for (const recipient of recipients) {
      try {
        // Simulate email sending
        const success = await simulateEmailSend(campaign, recipient)
        
        if (success) {
          sendResults.sent++
          
          // Log email send event
          await logEmailEvent(db, {
            campaignId: params.id,
            recipientEmail: recipient.email,
            eventType: 'sent',
            timestamp: new Date()
          })
          
        } else {
          sendResults.failed++
          sendResults.errors.push(`Failed to send to ${recipient.email}`)
        }
        
      } catch (error) {
        sendResults.failed++
        sendResults.errors.push(`Error sending to ${recipient.email}: ${error.message}`)
      }
    }
    
    if (!testMode) {
      // Update campaign analytics
      await db.collection('emailCampaigns').updateOne(
        { _id: new ObjectId(params.id) },
        { 
          $set: {
            status: sendResults.failed === 0 ? 'completed' : 'paused',
            completedAt: sendResults.failed === 0 ? new Date() : undefined,
            'analytics.sent': sendResults.sent,
            updatedAt: new Date()
          }
        }
      )
    }
    
    return ok({
      campaign: {
        id: params.id,
        name: campaign.name,
        status: testMode ? campaign.status : (sendResults.failed === 0 ? 'completed' : 'paused')
      },
      sendResults,
      testMode,
      message: testMode ? 'Test email sent successfully' : 'Campaign sent successfully'
    })
    
  } catch (error) {
    console.error('Send campaign error:', error)
    return fail('SEND_ERROR', 'Failed to send campaign', null, 500)
  }
}

// Get recipients from customer segments
async function getSegmentRecipients(db: any, segmentIds: string[]): Promise<any[]> {
  try {
    const pipeline = [
      {
        $match: {
          segmentId: { $in: segmentIds },
          isSubscribed: true,
          isActive: { $ne: false }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.emailVerified': true,
          'user.marketingOptIn': { $ne: false }
        }
      },
      {
        $project: {
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          preferences: '$user.preferences',
          lastPurchase: '$user.lastPurchase'
        }
      },
      {
        $group: {
          _id: '$email', // Deduplicate by email
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          preferences: { $first: '$preferences' },
          lastPurchase: { $first: '$lastPurchase' }
        }
      },
      {
        $project: {
          _id: 0,
          email: '$_id',
          firstName: 1,
          lastName: 1,
          preferences: 1,
          lastPurchase: 1
        }
      }
    ]
    
    const recipients = await db.collection('customerSegments').aggregate(pipeline).toArray()
    return recipients
    
  } catch (error) {
    console.error('Error getting segment recipients:', error)
    return []
  }
}

// Simulate email sending (replace with actual email service in production)
async function simulateEmailSend(campaign: any, recipient: any): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05
  
  if (success) {
    console.log(`📧 EMAIL SENT (Simulated)`)
    console.log(`   Campaign: ${campaign.name}`)
    console.log(`   To: ${recipient.email}`)
    console.log(`   Subject: ${campaign.subject}`)
  }
  
  return success
}

// Log email events for analytics
async function logEmailEvent(db: any, event: any) {
  try {
    await db.collection('emailEvents').insertOne({
      ...event,
      _id: new ObjectId(),
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Error logging email event:', error)
  }
}

// Export with performance monitoring
export const POST = withAPIMonitoring('/api/admin/email-marketing/campaigns/[id]/send', sendCampaign)