/**
 * Guest Checkout API Endpoint
 * Handles guest checkout flow with email capture and account creation option
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/database-api'
import { z } from 'zod'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

// Validation schema for guest checkout
const guestCheckoutSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
  email: z.string().email('Valid email is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Street address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Street address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required')
  }).optional(),
  customerNotes: z.string().optional(),
  createAccount: z.boolean().default(false),
  password: z.string().min(8).optional(),
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

// Generate unique guest session ID
function generateGuestSessionId(): string {
  return `guest_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * POST /api/checkout/guest - Process guest checkout
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'GUEST_CHECKOUT')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many checkout requests', null, 429)
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = guestCheckoutSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid checkout data', 
        validationResult.error.issues,
        400
      )
    }

    const { 
      cartId, 
      email, 
      shippingAddress, 
      billingAddress,
      customerNotes,
      createAccount,
      password,
      marketingOptIn
    } = validationResult.data

    // Find the cart
    const cart = await DatabaseModels.Cart.findById(cartId)
    if (!cart || cart.items.length === 0) {
      return fail('CART_NOT_FOUND', 'Cart not found or empty', null, 404)
    }

    // Check if user already exists with this email
    const existingUser = await DatabaseModels.User.findOne({ email: email.toLowerCase() })
    
    // If user exists and trying to create account, return error
    if (existingUser && createAccount) {
      return fail(
        'USER_EXISTS', 
        'An account with this email already exists. Please sign in or continue as guest.',
        { loginUrl: '/auth/signin' },
        409
      )
    }

    // Validate cart items and inventory
    const isValid = await cart.validateItems()
    if (!isValid) {
      return fail('INVENTORY_ERROR', 'Some items are no longer available', null, 400)
    }

    // Reserve inventory for checkout
    const inventoryReserved = await cart.reserveInventory()
    if (!inventoryReserved) {
      return fail('INVENTORY_UNAVAILABLE', 'Unable to reserve inventory for all items', null, 400)
    }

    let userId = null
    let accountCreated = false

    // Create account if requested and password provided
    if (createAccount && password && !existingUser) {
      try {
        const newUser = await DatabaseModels.User.create({
          email: email.toLowerCase(),
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          password, // Will be hashed by pre-save middleware
          emailVerified: false, // Will need to verify email
          createdVia: 'guest_checkout',
          marketingOptIn,
          profile: {
            phone: shippingAddress.phone
          },
          addresses: [
            {
              type: 'shipping',
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              company: shippingAddress.company,
              address1: shippingAddress.address1,
              address2: shippingAddress.address2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
              isDefault: true
            }
          ]
        })
        
        userId = newUser._id
        accountCreated = true
        
        // Send welcome email with verification
        try {
          const { sendVerificationEmail } = await import('@/lib/email-service')
          const verificationToken = crypto.randomBytes(32).toString('hex')
          // TODO: Store verification token in database
          await sendVerificationEmail(email, verificationToken, {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName
          })
        } catch (error) {
          console.error('Failed to send verification email:', error)
        }
        
      } catch (error) {
        console.error('Failed to create user account:', error)
        // Continue with guest checkout if account creation fails
        return fail('ACCOUNT_CREATION_FAILED', 'Failed to create account, please try guest checkout', null, 500)
      }
    }

    // Generate guest session if no account created
    const guestSessionId = !userId ? generateGuestSessionId() : null

    // Convert cart to order format
    const orderItems = await cart.convertToOrder(userId || guestSessionId)
    
    // Generate order number
    const orderNumber = `GG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    // Create guest order
    const order = await DatabaseModels.Order.create({
      orderNumber,
      userId: userId || null,
      guestSessionId: guestSessionId || null,
      email: email.toLowerCase(),
      status: 'pending', // Will be updated to 'confirmed' after payment
      items: orderItems.items,
      subtotal: orderItems.subtotal,
      shipping: orderItems.estimatedShipping,
      tax: orderItems.estimatedTax,
      discount: 0,
      total: orderItems.total,
      currency: 'USD',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: 'pending',
        transactionId: 'pending',
        status: 'pending',
        amount: orderItems.total,
        currency: 'USD'
      },
      shipping: {
        method: 'standard',
        carrier: 'UPS',
        service: 'Ground',
        cost: orderItems.estimatedShipping,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      notes: customerNotes,
      isGuest: !userId,
      guestDetails: !userId ? {
        email,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        marketingOptIn
      } : null
    })

    // Clear the cart after order creation
    await cart.clearCart()

    // Create payment intent for the order
    const { createPaymentIntent } = await import('@/lib/stripe')
    
    try {
      const paymentIntent = await createPaymentIntent({
        amount: Math.round(orderItems.total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          email,
          orderNumber,
          isGuest: (!userId).toString()
        }
      })

      // Update order with payment intent
      order.payment.transactionId = paymentIntent.id
      order.payment.stripePaymentIntentId = paymentIntent.id
      await order.save()

      return ok({
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          currency: order.currency,
          isGuest: !userId,
          accountCreated
        },
        payment: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        },
        account: accountCreated ? {
          created: true,
          emailVerificationRequired: true,
          message: 'Account created successfully! Please check your email to verify your account.'
        } : {
          created: false,
          guestSessionId,
          message: 'Order created as guest. You can create an account after completing payment.'
        }
      })

    } catch (error) {
      console.error('Payment intent creation failed:', error)
      
      // Cleanup: Delete the order if payment intent creation fails
      await DatabaseModels.Order.findByIdAndDelete(order._id)
      
      return fail('PAYMENT_SETUP_FAILED', 'Failed to setup payment processing', null, 500)
    }

  } catch (error) {
    console.error('Guest checkout error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to process guest checkout', null, 500)
  }
}