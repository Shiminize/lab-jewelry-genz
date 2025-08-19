/**
 * Wishlist API Endpoints
 * GET /api/wishlist - Get user's wishlists
 * POST /api/wishlist - Create new wishlist or add item
 * DELETE /api/wishlist - Remove item from wishlist
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { WishlistModel } from '@/lib/schemas/wishlist.schema'

// GET - Fetch user's wishlists
export async function GET(req: NextRequest) {
  const trackingId = `wishlist_get_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()
  
  try {
    // Get guest ID (simplified for now)
    const searchParams = req.nextUrl.searchParams
    const guestId = searchParams.get('guestId')
    
    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID required' },
        { status: 400 }
      )
    }
    
    const userId = `guest_${guestId}`
    
    // Connect to database
    await connectToDatabase()
    
    // Get user's wishlists
    const wishlists = await WishlistModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean()
    
    // If no wishlists exist, create a default one
    if (wishlists.length === 0) {
      const newWishlist = await WishlistModel.create({
        userId,
        name: 'My Wishlist',
        items: []
      })
      wishlists.push(newWishlist.toObject())
    }
    
    // Track performance (simplified)
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: wishlists,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: trackingId,
        duration: `${duration}ms`
      }
    })
    
  } catch (error) {
    console.error('[Wishlist GET] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wishlists'
      },
      { status: 500 }
    )
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  const trackingId = `wishlist_add_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()
  
  try {
    // Get request data
    const body = await req.json()
    const { productId, customizations, notes, wishlistId, guestId } = body
    
    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID required' },
        { status: 400 }
      )
    }
    
    const userId = `guest_${guestId}`
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectToDatabase()
    
    // Get or create wishlist
    let wishlist
    if (wishlistId) {
      wishlist = await WishlistModel.findOne({ _id: wishlistId, userId })
      if (!wishlist) {
        return NextResponse.json(
          { error: 'Wishlist not found' },
          { status: 404 }
        )
      }
    } else {
      // Get default wishlist or create one
      wishlist = await WishlistModel.findOne({ userId, name: 'My Wishlist' })
      if (!wishlist) {
        wishlist = await WishlistModel.create({
          userId,
          name: 'My Wishlist',
          items: []
        })
      }
    }
    
    // Add item to wishlist
    await wishlist.addItem(productId, customizations, notes)
    
    // Track performance (simplified)
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: {
        wishlistId: wishlist._id,
        itemCount: wishlist.itemCount,
        message: 'Item added to wishlist'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: trackingId,
        duration: `${duration}ms`
      }
    })
    
  } catch (error) {
    console.error('[Wishlist POST] Error:', error)
    
    // Check for duplicate item error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item already in wishlist'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to wishlist'
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
  const trackingId = `wishlist_remove_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()
  
  try {
    // Get request parameters
    const searchParams = req.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const wishlistId = searchParams.get('wishlistId')
    const guestId = searchParams.get('guestId')
    const customizations = searchParams.get('customizations')
    
    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID required' },
        { status: 400 }
      )
    }
    
    const userId = `guest_${guestId}`
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectToDatabase()
    
    // Get wishlist
    let wishlist
    if (wishlistId) {
      wishlist = await WishlistModel.findOne({ _id: wishlistId, userId })
    } else {
      wishlist = await WishlistModel.findOne({ userId, name: 'My Wishlist' })
    }
    
    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }
    
    // Parse customizations if provided
    const parsedCustomizations = customizations ? JSON.parse(customizations) : undefined
    
    // Remove item from wishlist
    await wishlist.removeItem(productId, parsedCustomizations)
    
    // Track performance (simplified)
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: {
        wishlistId: wishlist._id,
        itemCount: wishlist.itemCount,
        message: 'Item removed from wishlist'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: trackingId,
        duration: `${duration}ms`
      }
    })
    
  } catch (error) {
    console.error('[Wishlist DELETE] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from wishlist'
      },
      { status: 500 }
    )
  }
}