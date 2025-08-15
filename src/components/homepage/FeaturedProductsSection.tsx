'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/Button'
import { PageContainer, Section } from '@/components/layout'
import { H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import type { ProductBase } from '@/types/customizer'

// Mock featured products data representing different categories
const FEATURED_PRODUCTS: ProductBase[] = [
  {
    _id: 'featured-1',
    name: 'Eternal Solitaire Ring',
    basePrice: 2499,
    originalPrice: 2899,
    category: 'rings',
    images: {
      primary: '/images/products/eternal-solitaire-ring.jpg',
      gallery: [
        '/images/products/eternal-solitaire-ring.jpg',
        '/images/products/eternal-solitaire-ring-side.jpg'
      ]
    }
  },
  {
    _id: 'featured-2', 
    name: 'Celestial Stacking Set',
    basePrice: 899,
    category: 'rings',
    images: {
      primary: '/images/products/celestial-stacking-set.jpg',
      gallery: [
        '/images/products/celestial-stacking-set.jpg',
        '/images/products/celestial-stacking-set-worn.jpg'
      ]
    }
  },
  {
    _id: 'featured-3',
    name: 'Aurora Drop Earrings',
    basePrice: 1299,
    originalPrice: 1599,
    category: 'earrings',
    images: {
      primary: '/images/products/aurora-drop-earrings.jpg',
      gallery: [
        '/images/products/aurora-drop-earrings.jpg',
        '/images/products/aurora-drop-earrings-worn.jpg'
      ]
    }
  },
  {
    _id: 'featured-4',
    name: 'Infinity Pendant Necklace',
    basePrice: 799,
    category: 'necklaces',
    images: {
      primary: '/images/products/infinity-pendant-necklace.jpg',
      gallery: [
        '/images/products/infinity-pendant-necklace.jpg',
        '/images/products/infinity-pendant-necklace-detail.jpg'
      ]
    }
  },
  {
    _id: 'featured-5',
    name: 'Tennis Bracelet',
    basePrice: 1899,
    category: 'bracelets',
    images: {
      primary: '/images/products/tennis-bracelet.jpg',
      gallery: [
        '/images/products/tennis-bracelet.jpg',
        '/images/products/tennis-bracelet-worn.jpg'
      ]
    }
  },
  {
    _id: 'featured-6',
    name: 'Custom Design Starter',
    basePrice: 999,
    category: 'rings',
    images: {
      primary: '/images/products/custom-design-starter.jpg',
      gallery: [
        '/images/products/custom-design-starter.jpg',
        '/images/products/custom-design-options.jpg'
      ]
    }
  }
]

interface FeaturedProductsSectionProps {
  className?: string
  /** Number of products to display (defaults to 6) */
  productCount?: number
  /** Show loading state */
  loading?: boolean
  /** Override products data */
  products?: ProductBase[]
  /** Callback handlers */
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
  products = FEATURED_PRODUCTS,
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

  // Get featured products subset
  const featuredProducts = products.slice(0, productCount)
  const activeWishlist = onAddToWishlist ? wishlistedItems : localWishlist

  return (
    <Section background="default" className={cn('py-16 lg:py-24', className)}>
      <PageContainer maxWidth="7xl">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <MutedText size="md" className="text-accent font-medium uppercase tracking-wider">
              Curated Collection
            </MutedText>
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          
          <H2 className="mb-4 lg:mb-6">
            Discover Your Perfect Piece
          </H2>
          
          <div className="max-w-2xl mx-auto">
            <BodyText size="lg" className="text-foreground">
              Curated collections for every style and milestone. Each piece represents our commitment to exceptional craftsmanship and timeless design.
            </BodyText>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="mb-12 lg:mb-16">
          <ProductGrid
            products={featuredProducts}
            loading={loading}
            variant="featured"
            columns={3}
            onAddToWishlist={handleAddToWishlist}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
            wishlistedItems={activeWishlist}
            className="mb-8"
            emptyMessage="No featured products available"
            emptyDescription="Check back soon for our latest curated collection."
          />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="max-w-md mx-auto mb-8">
            <BodyText size="md" className="text-foreground">
              Explore our complete collection of luxury jewelry pieces, each designed to tell your unique story.
            </BodyText>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              asChild
              className="min-w-48"
            >
              <Link href="/catalog">
                <span>View All Products</span>
              </Link>
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="min-w-48"
            >
              <Link href="/customizer">
                <span>Design Your Own</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <BodyText size="md" weight="semibold">
                Lab-Grown Diamonds
              </BodyText>
              <MutedText size="sm">
                Ethically sourced and environmentally conscious luxury
              </MutedText>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <BodyText size="md" weight="semibold">
                Conflict-Free
              </BodyText>
              <MutedText size="sm">
                Guaranteed responsible sourcing and fair trade practices
              </MutedText>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
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
      className={cn('py-12 lg:py-16', className)}
    />
  )
}

// Export the mock data for testing/development
export { FEATURED_PRODUCTS }