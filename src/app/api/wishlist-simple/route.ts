/**
 * Simple Wishlist API Endpoints
 * Minimal implementation for testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { SimpleWishlistModel } from '@/lib/schemas/wishlist-simple.schema'

// GET - Fetch user's wishlists
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const guestId = searchParams.get('guestId')
    
    if (!guestId) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 })
    }
    
    const userId = `guest_${guestId}`
    
    await connectToDatabase()
    
    // Get user's wishlists
    const wishlists = await SimpleWishlistModel.find({ userId }).sort({ updatedAt: -1 }).lean()
    
    // If no wishlists exist, create a default one
    if (wishlists.length === 0) {
      const newWishlist = await SimpleWishlistModel.create({
        userId,
        name: 'My Wishlist',
        items: []
      })
      wishlists.push(newWishlist.toObject())
    }
    
    return NextResponse.json({
      success: true,
      data: wishlists,
      meta: { timestamp: new Date().toISOString() }
    })
    
  } catch (error) {
    console.error('[Simple Wishlist GET] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch wishlists'
    }, { status: 500 })
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, customizations, notes, guestId } = body
    
    if (!guestId || !productId) {
      return NextResponse.json({
        error: 'Guest ID and Product ID are required'
      }, { status: 400 })
    }
    
    const userId = `guest_${guestId}`
    
    await connectToDatabase()
    
    // Get default wishlist or create one
    let wishlist = await SimpleWishlistModel.findOne({ userId, name: 'My Wishlist' })
    if (!wishlist) {
      wishlist = await SimpleWishlistModel.create({
        userId,
        name: 'My Wishlist',
        items: []
      })
    }
    
    // Add item to wishlist
    await wishlist.addItem(productId, customizations, notes)
    
    return NextResponse.json({
      success: true,
      data: {
        wishlistId: wishlist._id,
        itemCount: wishlist.items.length,
        message: 'Item added to wishlist'
      }
    })
    
  } catch (error) {
    console.error('[Simple Wishlist POST] Error:', error)
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({
        success: false,
        error: 'Item already in wishlist'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to wishlist'
    }, { status: 500 })
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const guestId = searchParams.get('guestId')
    const customizations = searchParams.get('customizations')
    
    if (!guestId || !productId) {
      return NextResponse.json({
        error: 'Guest ID and Product ID are required'
      }, { status: 400 })
    }
    
    const userId = `guest_${guestId}`
    
    await connectToDatabase()
    
    const wishlist = await SimpleWishlistModel.findOne({ userId, name: 'My Wishlist' })
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 })
    }
    
    const parsedCustomizations = customizations ? JSON.parse(customizations) : undefined
    
    await wishlist.removeItem(productId, parsedCustomizations)
    
    return NextResponse.json({
      success: true,
      data: {
        wishlistId: wishlist._id,
        itemCount: wishlist.items.length,
        message: 'Item removed from wishlist'
      }
    })
    
  } catch (error) {
    console.error('[Simple Wishlist DELETE] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item from wishlist'
    }, { status: 500 })
  }
}