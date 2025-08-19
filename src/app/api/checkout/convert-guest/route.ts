/**
 * Guest to Account Conversion API
 * Converts guest orders to user accounts with order history
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/database-api'
import { z } from 'zod'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

// Validation schema for guest conversion
const convertGuestSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  guestSessionId: z.string().optional(),
  orderNumber: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  marketingOptIn: z.boolean().default(false)
})

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T, pagination?: any) {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
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
 * POST /api/checkout/convert-guest - Convert guest checkout to user account
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'ACCOUNT_CONVERSION')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many conversion requests', null, 429)
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = convertGuestSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid conversion data', 
        validationResult.error.issues,
        400
      )
    }

    const { 
      email, 
      password, 
      guestSessionId, 
      orderNumber,
      firstName,
      lastName,
      marketingOptIn
    } = validationResult.data

    // Check if user already exists
    const existingUser = await DatabaseModels.User.findOne({ 
      email: email.toLowerCase() 
    })
    
    if (existingUser) {
      return fail(
        'USER_EXISTS', 
        'An account with this email already exists. Please sign in instead.',
        { loginUrl: '/auth/signin' },
        409
      )
    }

    // Find guest orders to convert
    let guestOrders = []
    
    if (guestSessionId) {
      // Find all orders for this guest session
      guestOrders = await DatabaseModels.Order.find({
        guestSessionId,
        isGuest: true,
        userId: null
      })
    } else if (orderNumber) {
      // Find specific order by order number
      const order = await DatabaseModels.Order.findOne({
        orderNumber,
        isGuest: true,
        userId: null,
        email: email.toLowerCase()
      })
      if (order) {
        guestOrders = [order]
      }
    } else {
      // Find all guest orders for this email
      guestOrders = await DatabaseModels.Order.find({
        email: email.toLowerCase(),
        isGuest: true,
        userId: null
      })
    }

    if (guestOrders.length === 0) {
      return fail(
        'NO_GUEST_ORDERS', 
        'No guest orders found for conversion',
        null,
        404
      )
    }

    // Create user account
    const newUser = await DatabaseModels.User.create({
      email: email.toLowerCase(),
      firstName,
      lastName,
      password, // Will be hashed by pre-save middleware
      emailVerified: false,
      createdVia: 'guest_conversion',
      marketingOptIn,
      profile: {
        // Extract phone from first order's shipping address
        phone: guestOrders[0]?.shippingAddress?.phone
      },
      addresses: []
    })

    // Extract unique addresses from guest orders
    const uniqueAddresses = new Map()
    
    guestOrders.forEach(order => {
      if (order.shippingAddress) {
        const addressKey = `${order.shippingAddress.address1}_${order.shippingAddress.city}_${order.shippingAddress.postalCode}`
        if (!uniqueAddresses.has(addressKey)) {
          uniqueAddresses.set(addressKey, {
            type: 'shipping',
            firstName: order.shippingAddress.firstName,
            lastName: order.shippingAddress.lastName,
            company: order.shippingAddress.company,
            address1: order.shippingAddress.address1,
            address2: order.shippingAddress.address2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
            phone: order.shippingAddress.phone,
            isDefault: uniqueAddresses.size === 0 // First address is default
          })
        }
      }
    })

    // Add addresses to user
    if (uniqueAddresses.size > 0) {
      newUser.addresses = Array.from(uniqueAddresses.values())
      await newUser.save()
    }

    // Convert guest orders to user orders
    const conversionResults = await Promise.allSettled(
      guestOrders.map(async (order) => {
        order.userId = newUser._id
        order.isGuest = false
        order.guestSessionId = null
        order.guestDetails = null
        
        // Add timeline event for conversion
        order.addTimelineEvent(
          'account_created',
          'Guest order converted to user account',
          {
            convertedAt: new Date(),
            userId: newUser._id.toString()
          }
        )
        
        return await order.save()
      })
    )

    // Count successful conversions
    const successfulConversions = conversionResults.filter(
      result => result.status === 'fulfilled'
    ).length

    // Send verification email
    try {
      const { sendVerificationEmail } = await import('@/lib/email-service')
      const verificationToken = crypto.randomBytes(32).toString('hex')
      
      // TODO: Store verification token in database with expiration
      
      await sendVerificationEmail(email, verificationToken, {
        firstName,
        lastName
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Don't fail the conversion if email fails
    }

    // Send account conversion welcome email
    try {
      const { sendAccountConversionEmail } = await import('@/lib/email-service')
      await sendAccountConversionEmail(email, {
        firstName,
        lastName,
        orderCount: successfulConversions,
        orderNumbers: guestOrders.map(o => o.orderNumber)
      })
    } catch (error) {
      console.error('Failed to send conversion email:', error)
    }

    return ok({
      account: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        created: true,
        emailVerificationRequired: true
      },
      conversion: {
        ordersConverted: successfulConversions,
        totalOrders: guestOrders.length,
        orderNumbers: guestOrders.map(o => o.orderNumber)
      },
      message: `Account created successfully! ${successfulConversions} order(s) have been added to your account. Please check your email to verify your account.`
    })

  } catch (error) {
    console.error('Guest conversion error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to convert guest to account', null, 500)
  }
}

/**
 * GET /api/checkout/convert-guest - Get guest order information for conversion
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'GUEST_INFO')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const guestSessionId = url.searchParams.get('guestSessionId')
    const orderNumber = url.searchParams.get('orderNumber')

    if (!email && !guestSessionId && !orderNumber) {
      return fail('MISSING_PARAMS', 'Email, guestSessionId, or orderNumber is required', null, 400)
    }

    let guestOrders = []

    if (guestSessionId) {
      guestOrders = await DatabaseModels.Order.find({
        guestSessionId,
        isGuest: true,
        userId: null
      }).select('orderNumber email status total createdAt items')
    } else if (orderNumber) {
      const order = await DatabaseModels.Order.findOne({
        orderNumber,
        isGuest: true,
        userId: null
      }).select('orderNumber email status total createdAt items')
      
      if (order) {
        guestOrders = [order]
      }
    } else if (email) {
      guestOrders = await DatabaseModels.Order.find({
        email: email.toLowerCase(),
        isGuest: true,
        userId: null
      }).select('orderNumber email status total createdAt items')
    }

    if (guestOrders.length === 0) {
      return fail('NO_GUEST_ORDERS', 'No guest orders found', null, 404)
    }

    return ok({
      guestOrders: guestOrders.map(order => ({
        orderNumber: order.orderNumber,
        email: order.email,
        status: order.status,
        total: order.total,
        itemCount: order.items.length,
        createdAt: order.createdAt
      })),
      eligibleForConversion: true,
      totalValue: guestOrders.reduce((sum, order) => sum + order.total, 0)
    })

  } catch (error) {
    console.error('Guest info retrieval error:', error)
    return fail('SERVER_ERROR', 'Failed to retrieve guest information', null, 500)
  }
}