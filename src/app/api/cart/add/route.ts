/**
 * Add Item to Cart API Route
 * Handles adding products with customization to the shopping cart
 * Supports both guest and authenticated users
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { success, fail, handleAPIError } from '@/lib/api-response'
import { checkAPIRateLimit } from '@/lib/api-utils'
import { getCartById, createCart } from '@/lib/database-api'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Cart } from '@/lib/schemas/cart.schema'

// Validation schema for add to cart request
const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
  customization: z.object({
    material: z.string().optional(),
    gemstone: z.string().optional(),
    size: z.string().optional(),
    finish: z.string().optional(),
    engraving: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().min(0, 'Price must be non-negative')
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CART')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = addToCartSchema.safeParse(body)
    
    if (!validationResult.success) {
      return fail('VALIDATION_ERROR', 'Invalid request data', {
        details: validationResult.error.errors
      }, 400)
    }

    const { productId, quantity, customization } = validationResult.data

    // Connect to database
    await connectDB()

    // Get user session
    const session = await auth()
    const userId = session?.user?.id

    // Get or create cart
    let cart
    const cartIdCookie = request.cookies.get('cartId')?.value

    if (cartIdCookie) {
      cart = await getCartById(cartIdCookie)
    }

    if (!cart) {
      cart = await createCart(userId || undefined)
      
      // Set cart ID cookie for guest users
      if (!userId) {
        const response = success('ITEM_ADDED', 'Item added to cart', { cart })
        response.cookies.set('cartId', cart.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        return response
      }
    }

    // Check if item with same customization already exists
    const existingItemIndex = cart.items.findIndex((item: any) => {
      if (item.productId !== productId) return false
      
      // Compare customization if provided
      if (customization) {
        const itemCustomization = item.customization || {}
        return (
          itemCustomization.material === customization.material &&
          itemCustomization.gemstone === customization.gemstone &&
          itemCustomization.size === customization.size &&
          itemCustomization.finish === customization.finish &&
          itemCustomization.engraving === customization.engraving
        )
      }
      
      return !item.customization
    })

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity
      cart.items[existingItemIndex].updatedAt = new Date()
    } else {
      // Add new item to cart
      const newItem = {
        productId,
        quantity,
        customization: customization || null,
        addedAt: new Date(),
        updatedAt: new Date()
      }
      
      cart.items.push(newItem)
    }

    // Update cart metadata
    cart.updatedAt = new Date()
    cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Calculate total price if customization includes price
    if (customization?.price) {
      cart.totalAmount = cart.items.reduce((sum: number, item: any) => {
        const itemPrice = item.customization?.price || 0
        return sum + (itemPrice * item.quantity)
      }, 0)
    }

    // Save cart
    await cart.save()

    // Convert to plain object for response
    const cartData = {
      id: cart._id.toString(),
      userId: cart.userId?.toString(),
      sessionId: cart.sessionId,
      items: cart.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        customization: item.customization,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt
      })),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    }

    const response = success('ITEM_ADDED', 'Item added to cart successfully', {
      cart: cartData,
      addedItem: {
        productId,
        quantity,
        customization
      }
    })

    // Set cart ID cookie for guest users
    if (!userId && !cartIdCookie) {
      response.cookies.set('cartId', cart._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('Add to cart error:', error)
    return handleAPIError(error)
  }
}

// Optional: GET method to check if item can be added
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const quantity = parseInt(searchParams.get('quantity') || '1')

    if (!productId) {
      return fail('VALIDATION_ERROR', 'Product ID is required', null, 400)
    }

    // Here you could check inventory, product availability, etc.
    // For now, just return that the item can be added
    return success('CAN_ADD_TO_CART', 'Item can be added to cart', {
      productId,
      quantity,
      canAdd: true,
      maxQuantity: 99
    })

  } catch (error) {
    console.error('Add to cart check error:', error)
    return handleAPIError(error)
  }
}