/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for payment status updates
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { validateWebhookSignature, STRIPE_CONFIG } from '@/lib/stripe'
import { CartModel } from '@/lib/schemas/cart.schema'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/schemas'
import crypto from 'crypto'
import type { Stripe } from 'stripe'
import { processStripeConversion } from '@/lib/tracking-utils'

// Secure logging helper - sanitizes sensitive payment data
function logSecure(message: string, context?: Record<string, any>) {
  const sanitizedContext = context ? {
    ...context,
    paymentIntent: context.paymentIntent ? '[REDACTED]' : undefined,
    amount: context.amount ? '[REDACTED]' : undefined,
    customer: context.customer ? '[REDACTED]' : undefined,
    receipt_email: context.receipt_email ? '[REDACTED]' : undefined
  } : undefined
  
  console.log(message, sanitizedContext)
}

function errorSecure(message: string, error?: any) {
  const sanitizedError = error && typeof error === 'object' ? 
    { message: error.message, stack: error.stack } : error
  console.error(message, sanitizedError)
}

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

// Handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, request?: NextRequest) {
  try {
    await connectToDatabase()

    const { metadata } = paymentIntent
    const cartId = metadata?.cartId
    const userId = metadata?.userId !== 'guest' ? metadata?.userId : undefined

    if (!cartId) {
      errorSecure('Missing required metadata in webhook event')
      return
    }

    // Find the cart
    const cart = await CartModel.findById(cartId)
    if (!cart) {
      errorSecure('Cart not found for payment processing')
      return
    }

    // Create order from cart
    const orderData = {
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'paid',
      paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      totalAmount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      customerEmail: paymentIntent.receipt_email,
      notes: 'Payment completed via Stripe'
    }

    // Create order using the cart's conversion method
    const orderItems = await cart.convertToOrder(userId || 'guest')
    
    const order = await DatabaseModels.Order.create({
      ...orderItems,
      ...orderData,
      status: 'confirmed',
      paymentStatus: 'paid'
    })

    // Clear the cart after successful order creation
    await cart.clearCart()

    logSecure('Order created successfully', { orderId: order._id?.toString() })

    // Track affiliate conversion if applicable
    if (request) {
      try {
        const conversionResult = await processStripeConversion(request, order)
        if (conversionResult.success) {
          logSecure('Affiliate conversion tracked', { orderId: order._id?.toString() })
        } else if (conversionResult.error && conversionResult.error !== 'No referral attribution found in cookies') {
          console.warn('Failed to track conversion:', conversionResult.error)
        }
      } catch (error) {
        // Don't let conversion tracking failures affect order processing
        errorSecure('Conversion tracking error (non-blocking):', error)
      }
    }

    // TODO: Send order confirmation email
    // TODO: Update inventory quantities
    // TODO: Trigger fulfillment process

  } catch (error) {
    errorSecure('Webhook processing error: order creation handler failed', error)
    throw error
  }
}

// Handle payment intent payment failed
async function handlePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await connectToDatabase()

    const { metadata } = paymentIntent
    const cartId = metadata?.cartId

    if (!cartId) {
      errorSecure('Missing required metadata in webhook event')
      return
    }

    // Find the cart and release inventory reservations
    const cart = await CartModel.findById(cartId)
    if (cart) {
      await cart.releaseReservations()
      logSecure('Released inventory reservations for failed payment')
    }

    // TODO: Send payment failed notification email
    // TODO: Log payment failure for analytics

  } catch (error) {
    errorSecure('Webhook processing error: transaction failed handler failed', error)
    throw error
  }
}

// Handle payment intent canceled
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await connectToDatabase()

    const { metadata } = paymentIntent
    const cartId = metadata?.cartId

    if (!cartId) {
      errorSecure('Missing required metadata in webhook event')
      return
    }

    // Find the cart and release inventory reservations
    const cart = await CartModel.findById(cartId)
    if (cart) {
      await cart.releaseReservations()
      logSecure('Released inventory reservations for canceled transaction')
    }

    // TODO: Log cancellation for analytics

  } catch (error) {
    errorSecure('Webhook processing error: transaction canceled handler failed', error)
    throw error
  }
}

// Handle setup intent succeeded (for saved payment methods)
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    logSecure('Setup intent succeeded for saved payment method')
    
    // TODO: Update user's saved payment methods
    // TODO: Send confirmation of saved payment method

  } catch (error) {
    console.error('Error handling setup intent succeeded:', error)
    throw error
  }
}

/**
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return fail('MISSING_SIGNATURE', 'Missing Stripe signature', null, 400)
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable not set')
      return fail('SERVER_ERROR', 'Webhook configuration error', null, 500)
    }

    // Validate webhook signature
    let event: Stripe.Event
    try {
      event = validateWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error('Webhook signature validation failed:', error)
      return fail('INVALID_SIGNATURE', 'Invalid webhook signature', null, 400)
    }

    // Log webhook event for debugging
    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case STRIPE_CONFIG.WEBHOOK_ENDPOINTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, request)
        break

      case STRIPE_CONFIG.WEBHOOK_ENDPOINTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentPaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case STRIPE_CONFIG.WEBHOOK_ENDPOINTS.PAYMENT_INTENT_CANCELED:
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case STRIPE_CONFIG.WEBHOOK_ENDPOINTS.SETUP_INTENT_SUCCEEDED:
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return ok({ 
      received: true, 
      eventType: event.type,
      eventId: event.id 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    if (error instanceof Error) {
      return fail('WEBHOOK_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to process webhook', null, 500)
  }
}

// Disable body parsing for webhooks (Stripe needs raw body)
export const runtime = 'nodejs'