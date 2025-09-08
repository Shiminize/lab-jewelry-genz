/**
 * Email Trigger Processing API
 * POST /api/admin/email-marketing/triggers/process - Process pending triggers
 * This endpoint should be called by a cron job or background worker
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
 * POST /api/admin/email-marketing/triggers/process - Process triggers
 */
async function processTriggers(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    const body = await request.json()
    const { triggerType, maxProcessing = 100, dryRun = false } = body

    const processingResults = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }
    
    // Get active triggers
    const triggerFilter: any = { status: 'active', isActive: true }
    if (triggerType) triggerFilter.type = triggerType
    
    const triggers = await db.collection('emailTriggers').find(triggerFilter).toArray()

    for (const trigger of triggers) {
      try {
        const triggerResults = await processTriggerType(db, trigger, maxProcessing, dryRun)
        
        processingResults.processed += triggerResults.processed
        processingResults.sent += triggerResults.sent
        processingResults.failed += triggerResults.failed
        processingResults.skipped += triggerResults.skipped
        processingResults.errors.push(...triggerResults.errors)

      } catch (error) {
        processingResults.errors.push(`Failed to process trigger "${trigger.name}": ${error.message}`)
        console.error(`❌ Error processing trigger "${trigger.name}":`, error)
      }
    }
    
    return ok({
      summary: {
        triggersProcessed: triggers.length,
        eventsProcessed: processingResults.processed,
        emailsSent: processingResults.sent,
        failed: processingResults.failed,
        skipped: processingResults.skipped
      },
      errors: processingResults.errors,
      dryRun,
      processedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Process triggers error:', error)
    return fail('PROCESSING_ERROR', 'Failed to process triggers', null, 500)
  }
}

// Process a specific trigger type
async function processTriggerType(db: any, trigger: any, maxProcessing: number, dryRun: boolean) {
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[]
  }
  
  let pendingEvents: any[] = []
  
  switch (trigger.trigger.event) {
    case 'cart_abandoned':
      pendingEvents = await findAbandonedCartEvents(db, trigger, maxProcessing)
      break
    case 'user_registered':
      pendingEvents = await findNewUserEvents(db, trigger, maxProcessing)
      break
    case 'order_completed':
      pendingEvents = await findOrderCompletedEvents(db, trigger, maxProcessing)
      break
    case 'order_delivered':
      pendingEvents = await findOrderDeliveredEvents(db, trigger, maxProcessing)
      break
    case 'user_birthday':
      pendingEvents = await findBirthdayEvents(db, trigger, maxProcessing)
      break
    case 'last_purchase_30_days':
      pendingEvents = await findWinbackEvents(db, trigger, maxProcessing)
      break
    default:
      console.warn(`Unknown trigger event type: ${trigger.trigger.event}`)
      return results
  }

  for (const event of pendingEvents) {
    try {
      results.processed++
      
      // Check if user matches targeting criteria
      if (!await userMatchesTargeting(db, event.userId, trigger.targeting)) {
        results.skipped++
        continue
      }
      
      // Check frequency limits
      if (await exceedsFrequencyLimit(db, event.userId, trigger)) {
        results.skipped++
        continue
      }
      
      if (!dryRun) {
        // Send email
        const emailSent = await sendTriggerEmail(db, trigger, event)
        
        if (emailSent) {
          results.sent++
          
          // Update trigger analytics
          await db.collection('emailTriggers').updateOne(
            { _id: trigger._id },
            {
              $inc: {
                'analytics.triggered': 1,
                'analytics.sent': 1
              },
              $set: {
                'analytics.lastTriggered': new Date()
              }
            }
          )
          
          // Mark event as processed
          await markEventAsProcessed(db, trigger, event)
          
        } else {
          results.failed++
          results.errors.push(`Failed to send email for event ${event._id}`)
        }
      } else {
        // Dry run - just count what would be sent
        results.sent++

      }
      
    } catch (error) {
      results.failed++
      results.errors.push(`Failed to process event ${event._id}: ${error.message}`)
    }
  }
  
  return results
}

// Find abandoned cart events
async function findAbandonedCartEvents(db: any, trigger: any, limit: number) {
  const delayMinutes = trigger.trigger.delay || 60 // Default 1 hour
  const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000)
  
  const pipeline = [
    {
      $match: {
        status: 'abandoned',
        updatedAt: { $lt: cutoffTime },
        emailSent: { $ne: true }
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
        userId: '$user._id',
        userEmail: '$user.email',
        userFirstName: '$user.firstName',
        cartItems: '$items',
        cartValue: '$total',
        abandonedAt: '$updatedAt'
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('carts').aggregate(pipeline).toArray()
}

// Find new user registration events
async function findNewUserEvents(db: any, trigger: any, limit: number) {
  const delayMinutes = trigger.trigger.delay || 0 // Immediate for welcome emails
  const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000)
  
  const pipeline = [
    {
      $match: {
        emailVerified: true,
        createdAt: { $lt: cutoffTime },
        welcomeEmailSent: { $ne: true },
        marketingOptIn: { $ne: false }
      }
    },
    {
      $project: {
        userId: '$_id',
        userEmail: '$email',
        userFirstName: '$firstName',
        userLastName: '$lastName',
        registeredAt: '$createdAt'
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('users').aggregate(pipeline).toArray()
}

// Find order completed events
async function findOrderCompletedEvents(db: any, trigger: any, limit: number) {
  const delayMinutes = trigger.trigger.delay || 1440 // Default 24 hours
  const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000)
  
  const pipeline = [
    {
      $match: {
        status: 'completed',
        updatedAt: { $lt: cutoffTime },
        followupEmailSent: { $ne: true }
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
      $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        userId: { $ifNull: ['$user._id', null] },
        userEmail: { $ifNull: ['$user.email', '$email'] },
        userFirstName: { $ifNull: ['$user.firstName', '$shippingAddress.firstName'] },
        orderNumber: 1,
        orderTotal: '$total',
        completedAt: '$updatedAt',
        items: 1
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('orders').aggregate(pipeline).toArray()
}

// Find order delivered events  
async function findOrderDeliveredEvents(db: any, trigger: any, limit: number) {
  const delayMinutes = trigger.trigger.delay || 10080 // Default 7 days
  const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000)
  
  const pipeline = [
    {
      $match: {
        status: 'delivered',
        'shipping.deliveredAt': { $lt: cutoffTime },
        reviewRequestSent: { $ne: true }
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
      $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        userId: { $ifNull: ['$user._id', null] },
        userEmail: { $ifNull: ['$user.email', '$email'] },
        userFirstName: { $ifNull: ['$user.firstName', '$shippingAddress.firstName'] },
        orderNumber: 1,
        items: 1,
        deliveredAt: '$shipping.deliveredAt'
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('orders').aggregate(pipeline).toArray()
}

// Find birthday events
async function findBirthdayEvents(db: any, trigger: any, limit: number) {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  const pipeline = [
    {
      $match: {
        'profile.birthday': { $exists: true },
        emailVerified: true,
        marketingOptIn: { $ne: false },
        birthdayEmailSent: { $ne: `${today.getFullYear()}-${month}-${day}` }
      }
    },
    {
      $addFields: {
        birthdayMonth: { $month: '$profile.birthday' },
        birthdayDay: { $dayOfMonth: '$profile.birthday' }
      }
    },
    {
      $match: {
        birthdayMonth: month,
        birthdayDay: day
      }
    },
    {
      $project: {
        userId: '$_id',
        userEmail: '$email',
        userFirstName: '$firstName',
        birthday: '$profile.birthday'
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('users').aggregate(pipeline).toArray()
}

// Find winback events (users who haven't purchased in 30+ days)
async function findWinbackEvents(db: any, trigger: any, limit: number) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const pipeline = [
    {
      $match: {
        emailVerified: true,
        marketingOptIn: { $ne: false },
        lastPurchase: { $lt: thirtyDaysAgo },
        winbackEmailSent: { $ne: true }
      }
    },
    {
      $project: {
        userId: '$_id',
        userEmail: '$email',
        userFirstName: '$firstName',
        lastPurchase: 1,
        totalSpent: 1
      }
    },
    { $limit: limit }
  ]
  
  return await db.collection('users').aggregate(pipeline).toArray()
}

// Check if user matches targeting criteria
async function userMatchesTargeting(db: any, userId: string, targeting: any): Promise<boolean> {
  if (!targeting.segments || targeting.segments.length === 0) {
    return true // No segment restrictions
  }
  
  // Check if user is in any of the target segments
  const segmentMatch = await db.collection('customerSegments').findOne({
    _id: { $in: targeting.segments },
    userIds: userId
  })
  
  return !!segmentMatch
}

// Check frequency limits
async function exceedsFrequencyLimit(db: any, userId: string, trigger: any): Promise<boolean> {
  if (!trigger.targeting.maxFrequency) {
    return false // No frequency limits
  }
  
  const { count, period } = trigger.targeting.maxFrequency
  let periodStart: Date
  
  switch (period) {
    case 'day':
      periodStart = new Date(Date.now() - 24 * 60 * 60 * 1000)
      break
    case 'week':
      periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      return false
  }
  
  const recentEmails = await db.collection('emailEvents').countDocuments({
    triggerId: trigger._id,
    recipientId: userId,
    eventType: 'sent',
    timestamp: { $gte: periodStart }
  })
  
  return recentEmails >= count
}

// Send trigger email (simulate for now)
async function sendTriggerEmail(db: any, trigger: any, event: any): Promise<boolean> {
  try {
    // Simulate email sending

    // Log email event
    await db.collection('emailEvents').insertOne({
      triggerId: trigger._id,
      recipientId: event.userId,
      recipientEmail: event.userEmail,
      eventType: 'sent',
      campaignType: 'trigger',
      triggerEvent: trigger.trigger.event,
      timestamp: new Date()
    })
    
    return true
    
  } catch (error) {
    console.error('Error sending trigger email:', error)
    return false
  }
}

// Mark event as processed to prevent duplicate sends
async function markEventAsProcessed(db: any, trigger: any, event: any) {
  try {
    switch (trigger.trigger.event) {
      case 'cart_abandoned':
        await db.collection('carts').updateOne(
          { _id: event._id },
          { $set: { emailSent: true, emailSentAt: new Date() } }
        )
        break
      case 'user_registered':
        await db.collection('users').updateOne(
          { _id: event.userId },
          { $set: { welcomeEmailSent: true, welcomeEmailSentAt: new Date() } }
        )
        break
      case 'order_completed':
        await db.collection('orders').updateOne(
          { _id: event._id },
          { $set: { followupEmailSent: true, followupEmailSentAt: new Date() } }
        )
        break
      case 'order_delivered':
        await db.collection('orders').updateOne(
          { _id: event._id },
          { $set: { reviewRequestSent: true, reviewRequestSentAt: new Date() } }
        )
        break
      case 'user_birthday':
        const today = new Date()
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
        await db.collection('users').updateOne(
          { _id: event.userId },
          { $set: { birthdayEmailSent: dateString } }
        )
        break
      case 'last_purchase_30_days':
        await db.collection('users').updateOne(
          { _id: event.userId },
          { $set: { winbackEmailSent: true, winbackEmailSentAt: new Date() } }
        )
        break
    }
  } catch (error) {
    console.error('Error marking event as processed:', error)
  }
}

// Export with performance monitoring
export const POST = withAPIMonitoring('/api/admin/email-marketing/triggers/process', processTriggers)