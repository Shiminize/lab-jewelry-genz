/**
 * Payment Intent Creation API
 * Creates Stripe payment intents for cart checkout
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CartModel } from '@/lib/schemas/cart.schema'
import { connectToDatabase } from '@/lib/mongoose'
import { 
  createPaymentIntent, 
  createOrRetrieveCustomer, 
  formatAmountForStripe,
  STRIPE_CONFIG 
} from '@/lib/stripe'
import { z } from 'zod'
import { headers } from 'next/headers'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'


// Validation schema
const createIntentSchema = z.object({
  cartId: z.string().optional(),
  sessionId: z.string().optional(),
  savePaymentMethod: z.boolean().optional().default(false),
  metadata: z.record(z.string()).optional()
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
 * POST /api/payments/create-intent - Create payment intent for cart checkout
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'PAYMENT')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many payment requests', null, 429)
    }

    const session = await auth()
    const body = await request.json()
    
    // Validate request body
    const validationResult = createIntentSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.errors,
        400
      )
    }

    const { cartId, sessionId, savePaymentMethod, metadata = {} } = validationResult.data

    // Get cart based on user session or guest session
    let cart
    if (session?.user?.id) {
      cart = await CartModel.findByUser(session.user.id)
    } else if (sessionId) {
      cart = await CartModel.findBySession(sessionId)
    } else {
      return fail('INVALID_REQUEST', 'User session or session ID required', null, 400)
    }

    if (!cart || cart.items.length === 0) {
      return fail('CART_EMPTY', 'Cart is empty or not found', null, 400)
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

    // Create or retrieve Stripe customer if user is authenticated
    let customerId: string | undefined
    if (session?.user?.id && session?.user?.email) {
      try {
        const customer = await createOrRetrieveCustomer({
          email: session.user.email,
          name: session.user.name || undefined,
          userId: session.user.id,
          metadata: {
            source: 'glowglitch_checkout'
          }
        })
        customerId = customer.id
      } catch (error) {
        console.error('Failed to create/retrieve customer:', error)
        // Continue without customer - payment will still work
      }
    }

    // Calculate total amount in cents for Stripe
    const amountInCents = formatAmountForStripe(cart.estimatedTotal)

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      currency: STRIPE_CONFIG.CURRENCY,
      customerId,
      description: `GlowGlitch Jewelry Order - ${cart.items.length} item(s)`,
      metadata: {
        ...metadata,
        cartId: cart._id.toString(),
        userId: session?.user?.id || 'guest',
        sessionId: sessionId || '',
        itemCount: cart.items.length.toString(),
        subtotal: cart.subtotal.toString(),
        tax: cart.estimatedTax.toString(),
        shipping: cart.estimatedShipping.toString(),
        total: cart.estimatedTotal.toString()
      }
    })

    // Update cart with payment intent ID
    cart.paymentIntentId = paymentIntent.id
    await cart.save()

    return ok({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      cart: {
        id: cart._id,
        total: cart.estimatedTotal,
        currency: cart.currency,
        itemCount: cart.itemCount,
        inventoryReserved: true,
        reservedUntil: cart.items[0]?.reservedUntil
      },
      customerId,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Stripe error:')) {
        return fail('PAYMENT_PROVIDER_ERROR', error.message, null, 400)
      }
      if (error.message.includes('Payment amount must be at least')) {
        return fail('INVALID_AMOUNT', error.message, null, 400)
      }
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to create payment intent', null, 500)
  }
}