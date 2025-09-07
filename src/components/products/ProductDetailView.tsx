'use client'

/**
 * Product Detail View Component
 * Enhanced static product experience with image gallery and detailed information
 * Clean architecture focused on product browsing and purchase decisions
 */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ProductDetailViewProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: {
      base: number
      current: number
      currency: string
    }
    media: {
      hero: string
      gallery: string[]
      video?: string
    }
    inventory: {
      inStock: number
      stockLevel: number
    }
    category: string
    subcategory?: string
    tags: string[]
    rating: number
    reviewCount: number
  }
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'care'>('description')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // All images for gallery (hero + gallery)
  const allImages = useMemo(() => {
    return [product.media.hero, ...product.media.gallery].filter(Boolean)
  }, [product.media])

  // Calculate savings if any
  const savings = useMemo(() => {
    if (product.price.current < product.price.base) {
      return product.price.base - product.price.current
    }
    return 0
  }, [product.price])

  // Add to cart handler
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true)
    
    try {
      const cartData = {
        productId: product.id,
        quantity,
        price: product.price.current
      }

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('Added to cart successfully:', result.data)
        // Success notification would go here
      } else {
        console.error('Failed to add to cart:', result.error)
        // Error notification would go here
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }, [product.id, quantity, product.price.current])

  // Stock status
  const stockStatus = useMemo(() => {
    if (product.inventory.inStock <= 0) return { status: 'out-of-stock', text: 'Out of Stock', color: 'text-error' }
    if (product.inventory.stockLevel <= 5) {
      return { status: 'low-stock', text: `Only ${product.inventory.stockLevel} left`, color: 'text-warning' }
    }
    return { status: 'in-stock', text: 'In Stock', color: 'text-success' }
  }, [product.inventory])

  // Rating stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-accent' : 'text-muted'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <div className="space-y-token-md">
        {/* Main Image */}
        <div className="aspect-square bg-muted overflow-hidden">
          <Image
            src={allImages[selectedImageIndex] || '/images/placeholder-product.jpg'}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allImages.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square bg-muted overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-accent' : 'border-transparent hover:border-border'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Customize This Style CTA */}
        <div className="bg-gradient-to-r from-background to-muted border border-border p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-headline font-semibold text-foreground">Love this style?</h3>
              <p className="font-body text-sm text-foreground/80">Create your own custom version with our 3D customizer</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => window.location.href = '/customizer'}
            >
              Start Designing
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Product Information */}
      <div className="space-y-6">
        {/* Product Header */}
        <div className="space-y-token-md">
          <div>
            <h1 className="font-headline text-4xl lg:text-5xl font-bold text-foreground">{product.name}</h1>
            <p className="font-body text-lg text-foreground/80 capitalize">{product.category}</p>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center space-x-token-md">
            <div className="flex items-center space-x-token-sm">
              {renderStars(product.rating)}
              <span className="font-body text-sm text-foreground/70">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Price Display */}
          <div className="space-y-token-sm">
            <div className="flex items-baseline space-x-3">
              <span className="font-headline text-3xl lg:text-4xl font-bold text-foreground">
                ${product.price.current.toFixed(2)}
              </span>
              {savings > 0 && (
                <>
                  <span className="font-body text-xl text-foreground/50 line-through">
                    ${product.price.base.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-accent/10 text-foreground font-body text-sm font-medium rounded-full">
                    Save ${savings.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className={`font-body text-sm font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="space-y-token-md md:space-y-6">
          <div className="flex items-center space-x-token-md">
            <div className="space-y-1">
              <label className="font-body text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center border border-border rounded-token-lg bg-background">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 md:p-2 hover:bg-muted transition-colors text-foreground min-h-[44px] md:min-h-auto"
                  disabled={quantity <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="font-body px-4 py-2 min-w-[3rem] text-center text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 md:p-2 hover:bg-muted transition-colors text-foreground min-h-[44px] md:min-h-auto"
                  disabled={quantity >= product.inventory.stockLevel}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.inventory.inStock <= 0 || isAddingToCart}
            variant={product.inventory.inStock > 0 ? 'primary' : 'secondary'}
            size="lg"
            className="w-full"
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center space-x-token-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-high-contrast"></div>
                <span>Adding to Cart...</span>
              </div>
            ) : product.inventory.inStock <= 0 ? (
              'Out of Stock'
            ) : (
              `Add to Cart • $${(product.price.current * quantity).toFixed(2)}`
            )}
          </Button>
        </div>

        {/* Product Information Tabs */}
        <div className="border-t border-border pt-6">
          <nav className="flex flex-wrap gap-4 md:space-x-8 md:gap-0 mb-6">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` },
              { id: 'care', label: 'Care Instructions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`font-body text-sm font-medium pb-2 border-b-2 transition-colors min-h-[44px] md:min-h-auto flex items-end ${
                  activeTab === tab.id
                    ? 'text-accent border-accent'
                    : 'text-foreground/60 border-transparent hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[200px]"
            >
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <div className={showFullDescription ? '' : 'line-clamp-4'}>
                    <p className="font-body text-foreground/80 leading-relaxed">{product.description}</p>
                  </div>
                  {product.description.length > 300 && (
                    <Button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 p-0 h-auto"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </Button>
                  )}

                  <div className="mt-6">
                    <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Key Features</h3>
                    <ul className="space-y-token-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">✓</span>
                        <span className="font-body text-foreground/80">Lab-grown diamonds</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">✓</span>
                        <span className="font-body text-foreground/80">Sustainable materials</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">✓</span>
                        <span className="font-body text-foreground/80">Conflict-free sourcing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">✓</span>
                        <span className="font-body text-foreground/80">Lifetime warranty</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-b border-border pb-2">
                      <dt className="font-body text-sm font-medium text-foreground/60">Category</dt>
                      <dd className="font-body text-sm text-foreground mt-1 capitalize">{product.category}</dd>
                    </div>
                    {product.subcategory && (
                      <div className="border-b border-border pb-2">
                        <dt className="font-body text-sm font-medium text-foreground/60">Type</dt>
                        <dd className="font-body text-sm text-foreground mt-1 capitalize">{product.subcategory}</dd>
                      </div>
                    )}
                    <div className="border-b border-border pb-2">
                      <dt className="font-body text-sm font-medium text-foreground/60">Price</dt>
                      <dd className="font-body text-sm text-foreground mt-1">${product.price.current}</dd>
                    </div>
                    <div className="border-b border-border pb-2">
                      <dt className="font-body text-sm font-medium text-foreground/60">Stock</dt>
                      <dd className="font-body text-sm text-foreground mt-1">{product.inventory.stockLevel} available</dd>
                    </div>
                  </dl>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="text-center py-12">
                    <div className="font-headline text-foreground/60 text-lg mb-2">Customer Reviews</div>
                    <div className="font-body text-foreground/40">
                      Reviews component will be loaded here
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div>
                  <div className="bg-muted/30 border border-border rounded-token-lg p-6">
                    <h3 className="font-headline text-lg font-semibold text-foreground mb-3">
                      How to Care for Your Jewelry
                    </h3>
                    <ul className="space-y-token-sm font-body text-foreground/80">
                      <li>• Store in a clean, dry place away from other jewelry</li>
                      <li>• Avoid contact with chemicals, perfumes, and lotions</li>
                      <li>• Clean gently with a soft cloth and mild soap</li>
                      <li>• Remove before swimming, exercising, or sleeping</li>
                      <li>• Have professionally cleaned and inspected annually</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust Signals */}
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-token-sm font-body text-sm text-foreground/70">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Lifetime Warranty</span>
            </div>
            <div className="flex items-center justify-center space-x-token-sm font-body text-sm text-foreground/70">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Free Shipping $500+</span>
            </div>
            <div className="flex items-center justify-center space-x-token-sm font-body text-sm text-foreground/70">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}