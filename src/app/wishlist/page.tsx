/**
 * Wishlist Page
 * Displays user's wishlisted products with management options
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingCart, Share2, Heart, ArrowLeft } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { H1, H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Simple toast replacement for notifications
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message)
}

export default function WishlistPage() {
  const router = useRouter()
  const { 
    wishlists, 
    loading, 
    error, 
    removeFromWishlist,
    getWishlistCount
  } = useWishlist()
  
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const wishlistCount = getWishlistCount()
  
  // Get primary wishlist
  const primaryWishlist = wishlists[0]
  
  const handleRemoveItem = async (productId: string, customizations?: any) => {
    setRemovingItem(productId)
    const success = await removeFromWishlist(productId, customizations)
    if (success) {
      toast.success('Removed from wishlist')
    }
    setRemovingItem(null)
  }
  
  const handleMoveToCart = async (productId: string, customizations?: any) => {
    // TODO: Implement move to cart functionality
    toast.info('Moving to cart functionality coming soon')
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: `Check out my wishlist at GlowGlitch`,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Wishlist link copied to clipboard')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-token-md">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <MutedText>Loading your wishlist...</MutedText>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-24">
            <H2 className="mb-4 text-error">Something went wrong</H2>
            <BodyText className="text-muted mb-6">{error}</BodyText>
            <Button onClick={() => router.push('/catalog')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-background via-accent/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <BodyText>Back to Catalog</BodyText>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <H1 className="mb-2">My Wishlist</H1>
              <BodyText className="text-muted">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </BodyText>
            </div>
            
            {wishlistCount > 0 && (
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Wishlist
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {wishlistCount === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-accent" />
            </div>
            <H2 className="mb-4">Your wishlist is empty</H2>
            <BodyText className="text-muted mb-8 max-w-md mx-auto">
              Start adding items you love to your wishlist and they'll appear here
            </BodyText>
            <Button onClick={() => router.push('/catalog')}>
              Explore Catalog
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {primaryWishlist?.items.map((item) => (
              <div 
                key={`${item.productId}-${JSON.stringify(item.customizations)}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all duration-200"
              >
                {/* Product Image */}
                <Link href={`/products/${item.productId}`}>
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <Image
                      src={item.productImage || '/images/placeholder-product.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.originalPrice && item.currentPrice < item.originalPrice && (
                      <div className="absolute top-2 left-2 bg-cta text-background px-2 py-1 rounded text-xs font-semibold">
                        Sale
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <Link href={`/products/${item.productId}`}>
                    <BodyText className="font-semibold line-clamp-2 hover:text-accent transition-colors">
                      {item.productName}
                    </BodyText>
                  </Link>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <BodyText className="font-bold text-accent">
                      ${item.currentPrice.toLocaleString()}
                    </BodyText>
                    {item.originalPrice && item.currentPrice < item.originalPrice && (
                      <MutedText className="line-through text-sm">
                        ${item.originalPrice.toLocaleString()}
                      </MutedText>
                    )}
                  </div>
                  
                  {/* Customizations */}
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <div className="space-y-1">
                      <MutedText size="sm">Customizations:</MutedText>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <span 
                            key={key}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {key}: {value as string}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {item.notes && (
                    <MutedText size="sm" className="italic">
                      "{item.notes}"
                    </MutedText>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMoveToCart(item.productId, item.customizations)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(item.productId, item.customizations)}
                      disabled={removingItem === item.productId}
                    >
                      {removingItem === item.productId ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Continue Shopping */}
        {wishlistCount > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline"
              onClick={() => router.push('/catalog')}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}