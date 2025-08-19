/**
 * Stripe Server Configuration
 * Handles Stripe integration for GlowGlitch payment processing
 * Follows CLAUDE_RULES.md security and error handling standards
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  // Enable telemetry for debugging in development
  telemetry: process.env.NODE_ENV === 'development',
  // Set app info for Stripe dashboard
  appInfo: {
    name: 'GlowGlitch',
    version: '1.0.0',
    url: 'https://glowglitch.com'
  }
})

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Payment methods to accept
  PAYMENT_METHODS: ['card', 'apple_pay', 'google_pay'] as const,
  
  // Currency
  CURRENCY: 'usd' as const,
  
  // Automatic payment methods
  AUTOMATIC_PAYMENT_METHODS: {
    enabled: true,
    allow_redirects: 'never' as const
  },
  
  // Capture method - manual for jewelry (allows for order verification)
  CAPTURE_METHOD: 'manual' as const,
  
  // Confirmation method
  CONFIRMATION_METHOD: 'manual' as const,
  
  // Webhook endpoints
  WEBHOOK_ENDPOINTS: {
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
    PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
    PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
    SETUP_INTENT_SUCCEEDED: 'setup_intent.succeeded'
  } as const
} as const

/**
 * Create a payment intent for a cart
 */
export async function createPaymentIntent(params: {
  amount: number
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
  description?: string
  automaticPaymentMethods?: boolean
}): Promise<Stripe.PaymentIntent> {
  try {
    const {
      amount,
      currency = STRIPE_CONFIG.CURRENCY,
      customerId,
      metadata = {},
      description,
      automaticPaymentMethods = true
    } = params

    // Validate amount (minimum $0.50 for Stripe)
    if (amount < 50) {
      throw new Error('Payment amount must be at least $0.50')
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      capture_method: STRIPE_CONFIG.CAPTURE_METHOD,
      confirmation_method: STRIPE_CONFIG.CONFIRMATION_METHOD,
      metadata: {
        ...metadata,
        platform: 'glowglitch',
        version: '1.0.0'
      }
    }

    // Add customer if provided
    if (customerId) {
      paymentIntentParams.customer = customerId
    }

    // Add description if provided
    if (description) {
      paymentIntentParams.description = description
    }

    // Add automatic payment methods
    if (automaticPaymentMethods) {
      paymentIntentParams.automatic_payment_methods = STRIPE_CONFIG.AUTOMATIC_PAYMENT_METHODS
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    return paymentIntent
  } catch (error) {
    console.error('Payment service error: intent creation failed')
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to create payment intent'
    )
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> {
  try {
    const confirmParams: Stripe.PaymentIntentConfirmParams = {
      return_url: `${process.env.NEXTAUTH_URL}/checkout/success`
    }

    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      confirmParams
    )

    return paymentIntent
  } catch (error) {
    console.error('Payment service error: intent confirmation failed')
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to confirm payment intent'
    )
  }
}

/**
 * Capture a payment intent (for manual capture)
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<Stripe.PaymentIntent> {
  try {
    const captureParams: Stripe.PaymentIntentCaptureParams = {}

    if (amountToCapture) {
      captureParams.amount_to_capture = amountToCapture
    }

    const paymentIntent = await stripe.paymentIntents.capture(
      paymentIntentId,
      captureParams
    )

    return paymentIntent
  } catch (error) {
    console.error('Payment service error: intent capture failed')
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to capture payment intent'
    )
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string,
  cancellationReason?: Stripe.PaymentIntentCancelParams.CancellationReason
): Promise<Stripe.PaymentIntent> {
  try {
    const cancelParams: Stripe.PaymentIntentCancelParams = {}

    if (cancellationReason) {
      cancelParams.cancellation_reason = cancellationReason
    }

    const paymentIntent = await stripe.paymentIntents.cancel(
      paymentIntentId,
      cancelParams
    )

    return paymentIntent
  } catch (error) {
    console.error('Payment service error: intent cancellation failed')
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to cancel payment intent'
    )
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer(params: {
  email: string
  name?: string
  userId: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  try {
    const { email, name, userId, metadata = {} } = params

    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0]
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        userId,
        platform: 'glowglitch'
      }
    })

    return customer
  } catch (error) {
    console.error('Error creating/retrieving customer:', error)
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to create or retrieve customer'
    )
  }
}

/**
 * Create a setup intent for saving payment methods
 */
export async function createSetupIntent(
  customerId: string,
  metadata?: Record<string, string>
): Promise<Stripe.SetupIntent> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        ...metadata,
        platform: 'glowglitch'
      }
    })

    return setupIntent
  } catch (error) {
    console.error('Error creating setup intent:', error)
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to create setup intent'
    )
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature validation failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Get payment method details
 */
export async function getPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    return paymentMethod
  } catch (error) {
    console.error('Payment service error: method retrieval failed')
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? `Stripe error: ${error.message}` 
        : 'Failed to retrieve payment method'
    )
  }
}

/**
 * Format amount for Stripe (convert dollars to cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}

// Type exports for use throughout the application
export type {
  Stripe,
  PaymentIntent,
  PaymentMethod,
  Customer,
  SetupIntent
} from 'stripe'