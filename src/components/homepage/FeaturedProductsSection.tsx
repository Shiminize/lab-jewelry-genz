'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/Button'
import { PageContainer, Section } from '@/components/layout'
import { H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import type { ProductDisplayDTO } from '@/types/product-dto'

// Fallback products for error states (minimal, material-only compliant)
const FALLBACK_PRODUCTS: ProductDisplayDTO[] = [
  {
    _id: 'fallback-1',
    name: 'Lab Diamond Ring',
    description: 'Premium lab-grown diamond ring',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'lab-diamond-ring',
    basePrice: 1299,
    currency: 'USD',
    primaryImage: '/images/placeholder-product.jpg',
    images: {
      primary: '/images/placeholder-product.jpg',
      gallery: ['/images/placeholder-product.jpg']
    },
    materialSpecs: {
      primaryMetal: {
        type: '14k-gold',
        purity: '14K',
        displayName: '14K Gold'
      }
    },
    inventory: {
      available: true,
      isCustomMade: true
    },
    metadata: {
      featured: true,
      bestseller: false,
      newArrival: true,
      tags: ['lab-grown', 'customizable']
    },
    seo: {
      slug: 'lab-diamond-ring'
    }
  }
]

interface FeaturedProductsSectionProps {
  className?: string
  /** Number of products to display (defaults to 6) */
  productCount?: number
  /** Show loading state */
  loading?: boolean
  /** Products data (unified ProductDisplayDTO format) */
  products?: ProductDisplayDTO[]
  /** Callback handlers - optional for graceful degradation */
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  /** Wishlisted product IDs */
  wishlistedItems?: string[]
}

export function FeaturedProductsSection({
  className,
  productCount = 6,
  loading = false,
  products = FALLBACK_PRODUCTS,
  onAddToWishlist,
  onQuickView,
  onAddToCart,
  wishlistedItems = []
}: FeaturedProductsSectionProps) {
  // Local state for wishlist management if no handler provided
  const [localWishlist, setLocalWishlist] = useState<string[]>(wishlistedItems)

  // Memoized handlers with fallbacks
  const handleAddToWishlist = useCallback((productId: string) => {
    if (onAddToWishlist) {
      onAddToWishlist(productId)
    } else {
      // Fallback: manage locally
      setLocalWishlist(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      )
    }
  }, [onAddToWishlist])

  const handleQuickView = useCallback((productId: string) => {
    if (onQuickView) {
      onQuickView(productId)
    } else {
      // Fallback: navigate to product page
      window.location.href = `/products/${productId}`
    }
  }, [onQuickView])

  const handleAddToCart = useCallback((productId: string) => {
    if (onAddToCart) {
      onAddToCart(productId)
    } else {
      // Fallback: navigate to product page for customization
      window.location.href = `/products/${productId}`
    }
  }, [onAddToCart])

  // Get featured products subset (no normalization needed with unified ProductDisplayDTO)
  const featuredProducts = products.slice(0, productCount)
  const activeWishlist = onAddToWishlist ? wishlistedItems : localWishlist

  return (
    <Section background="default" className={cn('py-token-2xl lg:py-24', className)}>
      <PageContainer maxWidth="7xl">
        {/* Section Header */}
        <div className="text-center mb-token-xl lg:mb-token-2xl">
          <div className="flex items-center justify-center space-x-token-sm mb-4">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <MutedText size="md" className="text-accent font-medium uppercase tracking-wider">
              Curated Collection
            </MutedText>
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          
          <H2 className="mb-token-md lg:mb-token-lg">
            Discover Your Perfect Piece
          </H2>
          
          <div className="max-w-2xl mx-auto">
            <BodyText size="lg" className="text-foreground">
              Curated collections for every style and milestone. Each piece represents our commitment to exceptional craftsmanship and timeless design.
            </BodyText>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="mb-token-xl lg:mb-token-2xl">
          <ProductGrid
            products={featuredProducts}
            loading={loading}
            variant="featured"
            columns={3}
            onAddToWishlist={handleAddToWishlist}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
            wishlistedItems={activeWishlist}
            className="mb-token-xl"
            emptyMessage="No featured products available"
            emptyDescription="Check back soon for our latest curated collection."
          />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="max-w-md mx-auto mb-token-xl">
            <BodyText size="md" className="text-foreground">
              Explore our complete collection of luxury jewelry pieces, each designed to tell your unique story.
            </BodyText>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-token-md">
            <Button
              variant="primary"
              size="lg"
              asChild
              className="min-w-48"
            >
              <Link href="/catalog">
                <span>Explore Collection</span>
              </Link>
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="min-w-48"
            >
              <Link href="/customizer">
                <span>Start Designing</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="mt-token-2xl pt-token-xl border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-token-xl text-center">
            <div className="space-y-token-sm">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-34 flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <BodyText size="md" weight="semibold">
                Lab-Grown Diamonds
              </BodyText>
              <MutedText size="sm">
                Ethically sourced and environmentally conscious luxury
              </MutedText>
            </div>
            
            <div className="space-y-token-sm">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-34 flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <BodyText size="md" weight="semibold">
                Conflict-Free
              </BodyText>
              <MutedText size="sm">
                Guaranteed responsible sourcing and fair trade practices
              </MutedText>
            </div>
            
            <div className="space-y-token-sm">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-34 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <BodyText size="md" weight="semibold">
                Lifetime Warranty
              </BodyText>
              <MutedText size="sm">
                Comprehensive coverage for craftsmanship and materials
              </MutedText>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  )
}

// Alternative compact version for smaller sections
interface FeaturedProductsCompactProps extends Omit<FeaturedProductsSectionProps, 'productCount'> {
  /** Show only 4 products in a more compact layout */
  variant?: 'compact'
}

export function FeaturedProductsCompact({
  className,
  variant = 'compact',
  ...props
}: FeaturedProductsCompactProps) {
  return (
    <FeaturedProductsSection
      {...props}
      productCount={4}
      className={cn('py-token-xl lg:py-token-2xl', className)}
    />
  )
}

// Export the fallback data for testing/development
export { FALLBACK_PRODUCTS }