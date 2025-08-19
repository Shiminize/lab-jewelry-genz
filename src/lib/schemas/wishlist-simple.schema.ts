/**
 * Simple Wishlist Schema for Testing
 * Minimal implementation to get basic functionality working
 */

import mongoose, { Schema, Document } from 'mongoose'

export interface SimpleWishlistItem {
  productId: string
  productName: string
  productImage: string
  currentPrice: number
  addedAt: Date
  customizations?: any
  notes?: string
}

export interface SimpleWishlistDocument extends Document {
  userId: string
  name: string
  items: SimpleWishlistItem[]
  createdAt: Date
  updatedAt: Date
  
  // Simple methods
  addItem(productId: string, customizations?: any, notes?: string): Promise<void>
  removeItem(productId: string, customizations?: any): Promise<void>
}

// Simple wishlist item schema
const simpleWishlistItemSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  currentPrice: { type: Number, required: true, default: 0 },
  addedAt: { type: Date, default: Date.now },
  customizations: { type: Schema.Types.Mixed },
  notes: { type: String, maxlength: 500 }
}, { _id: false })

// Simple wishlist schema
const simpleWishlistSchema = new Schema<SimpleWishlistDocument>({
  userId: { type: String, required: true },
  name: { type: String, required: true, default: 'My Wishlist' },
  items: { type: [simpleWishlistItemSchema], default: [] }
}, {
  timestamps: true,
  collection: 'simplewishlists'
})

// Simple indexes
simpleWishlistSchema.index({ userId: 1 })

// Simple add item method
simpleWishlistSchema.methods.addItem = async function(
  productId: string, 
  customizations?: any, 
  notes?: string
): Promise<void> {
  // Check if item already exists
  const existingItem = this.items.find((item: SimpleWishlistItem) => {
    return item.productId === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (existingItem) {
    throw new Error('Item already exists in wishlist')
  }
  
  // Add new item
  this.items.push({
    productId,
    productName: `Product ${productId}`,
    productImage: '/images/placeholder-product.jpg',
    currentPrice: 0,
    customizations,
    addedAt: new Date(),
    notes
  })
  
  await this.save()
}

// Simple remove item method
simpleWishlistSchema.methods.removeItem = async function(
  productId: string, 
  customizations?: any
): Promise<void> {
  const itemIndex = this.items.findIndex((item: SimpleWishlistItem) => {
    return item.productId === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    throw new Error('Item not found in wishlist')
  }
  
  this.items.splice(itemIndex, 1)
  await this.save()
}

// Export the model
export const SimpleWishlistModel = mongoose.models.SimpleWishlist || mongoose.model<SimpleWishlistDocument>('SimpleWishlist', simpleWishlistSchema)