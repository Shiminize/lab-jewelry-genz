'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageContainer, Section, Flex } from '@/components/layout'
import { ProductGrid, ProductFilters, ProductSort, type FilterOptions } from '@/components/products'
import { CartSidebar } from '@/components/cart'
import { ARTryOnBanner } from '@/components/ar'
import { Button } from '@/components/ui/Button'
import { H1, H2, BodyText } from '@/components/foundation/Typography'
import type { ProductBase } from '@/types/customizer'

// Enhanced mock product data with more details
import Image from 'next/image'

const sampleProducts: ProductBase[] = [
  {
    _id: 'eternal-solitaire-ring',
    name: 'Eternal Solitaire Ring',
    basePrice: 2400,
    originalPrice: 2800,
    category: 'rings',
    images: {
      primary: '/images/eternal-solitaire-ring.jpg',
      gallery: ['/images/eternal-solitaire-ring-2.jpg']
    }
  },
  {
    _id: 'classic-tennis-bracelet',
    name: 'Classic Tennis Bracelet',
    basePrice: 1800,
    category: 'bracelets',
    images: {
      primary: '/images/classic-tennis-bracelet.jpg',
      gallery: []
    }
  },
  {
    _id: 'diamond-drop-earrings',
    name: 'Diamond Drop Earrings',
    basePrice: 1200,
    originalPrice: 1500,
    category: 'earrings',
    images: {
      primary: '/images/diamond-drop-earrings.jpg',
      gallery: []
    }
  },
  {
    _id: 'infinity-pendant-necklace',
    name: 'Infinity Pendant Necklace',
    basePrice: 950,
    category: 'necklaces',
    images: {
      primary: '/images/infinity-pendant-necklace.jpg',
      gallery: []
    }
  },
  {
    _id: 'vintage-halo-ring',
    name: 'Vintage Halo Ring',
    basePrice: 3200,
    category: 'rings',
    images: {
      primary: '/images/vintage-halo-ring.jpg',
      gallery: []
    }
  },
  {
    _id: 'minimalist-stud-earrings',
    name: 'Minimalist Stud Earrings',
    basePrice: 650,
    category: 'earrings',
    images: {
      primary: '/images/minimalist-stud-earrings.jpg',
      gallery: []
    }
  }
]

interface CartItem extends ProductBase {
  quantity: number
  selectedSize?: string
  customizations?: {
    metalType: string
    stoneType: string
  }
}

const initialFilters: FilterOptions = {
  priceRange: [0, 10000],
  categories: [],
  materials: [],
  stoneTypes: [],
  stoneQualities: [],
  sizes: [],
  inStock: false,
}

export default function InteractiveDemoPage() {
  // Filter and sort state
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [wishlistedItems, setWishlistedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  
  // Modal states
  const [quickViewProduct, setQuickViewProduct] = useState<ProductBase | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  // Filter products based on current filters
  const filteredProducts = sampleProducts.filter(product => {
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false
    }
    if (product.basePrice < filters.priceRange[0] || product.basePrice > filters.priceRange[1]) {
      return false
    }
    return true
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name)
      case 'name-desc': return b.name.localeCompare(a.name)
      case 'price-asc': return a.basePrice - b.basePrice
      case 'price-desc': return b.basePrice - a.basePrice
      default: return 0
    }
  })

  // Cart functions
  const handleAddToCart = (productId: string) => {
    const product = sampleProducts.find(p => p._id === productId)
    if (!product) return

    const existingItem = cartItems.find(item => item._id === productId)
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        item._id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        selectedSize: product.category === 'rings' ? '6' : undefined,
        customizations: {
          metalType: '14K Yellow Gold',
          stoneType: 'Lab-Grown Diamond'
        }
      }
      setCartItems(prev => [...prev, newItem])
    }

    // Show success message
    setShowSuccessMessage(`${product.name} added to cart!`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
    
    // Auto-open cart for demo
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId)
      return
    }
    setCartItems(prev => prev.map(item => 
      item._id === itemId ? { ...item, quantity } : item
    ))
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId))
  }

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!')
    console.log('Checkout with items:', cartItems)
  }

  // Wishlist functions
  const handleAddToWishlist = (productId: string) => {
    setWishlistedItems(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
    
    const product = sampleProducts.find(p => p._id === productId)
    const action = wishlistedItems.includes(productId) ? 'removed from' : 'added to'
    setShowSuccessMessage(`${product?.name} ${action} wishlist!`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  // Quick view modal
  const handleQuickView = (productId: string) => {
    const product = sampleProducts.find(p => p._id === productId)
    setQuickViewProduct(product || null)
  }

  const handleClearFilters = () => {
    setFilters(initialFilters)
  }

  const handleARWaitlistSignup = async (email: string) => {
    console.log('AR waitlist signup:', email)
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div>
      {/* Demo Header */}
      <Section>
        <PageContainer>
          <div className="text-center space-y-6 mb-8">
            <H1>Interactive E-commerce Demo</H1>
            <BodyText size="lg" className="text-muted max-w-3xl mx-auto">
              This interactive demonstration showcases the complete user experience including:
              product browsing, filtering, cart functionality, and responsive design.
            </BodyText>
            
            {/* Demo Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/catalog">
                <Button variant="outline">Original Catalog</Button>
              </Link>
              <Link href="/products/sample-ring">
                <Button variant="outline">Product Detail Demo</Button>
              </Link>
              <Link href="/cart-demo">
                <Button variant="outline">Cart UI Demo</Button>
              </Link>
              <Button 
                variant="secondary" 
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                View Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cta text-background text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Hero Section with AR Banner */}
      <Section background="muted">
        <PageContainer padding="lg">
          <div className="text-center space-y-6">
            <H2>Sustainable Luxury Jewelry</H2>
            <BodyText size="lg" className="text-muted max-w-2xl mx-auto">
              Discover our collection of lab-grown diamond jewelry. Each piece is ethically sourced, 
              fully customizable, and crafted with the finest materials.
            </BodyText>
            
            <div className="max-w-4xl mx-auto">
              <ARTryOnBanner onWaitlistSignup={handleARWaitlistSignup} />
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Main Catalog Section */}
      <Section>
        <PageContainer>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
                isLoading={isLoading}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Sort and View Controls */}
              <ProductSort
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalResults={sortedProducts.length}
                isLoading={isLoading}
              />

              {/* Products Grid */}
              <ProductGrid
                products={sortedProducts}
                loading={isLoading}
                variant={viewMode === 'list' ? 'compact' : 'standard'}
                columns={viewMode === 'grid' ? 3 : 2}
                onAddToWishlist={handleAddToWishlist}
                onQuickView={handleQuickView}
                onAddToCart={handleAddToCart}
                wishlistedItems={wishlistedItems}
                emptyMessage="No jewelry found"
                emptyDescription="Try adjusting your filters to see more products."
              />
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-success text-background px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {showSuccessMessage}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <H2>{quickViewProduct.name}</H2>
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={quickViewProduct.images.primary} 
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-token-md">
                  <div className="text-2xl font-semibold text-accent">
                    ${quickViewProduct.basePrice.toLocaleString()}
                  </div>
                  
                  <BodyText className="text-muted">
                    This is a sample product description that would contain detailed information 
                    about the jewelry piece, its materials, and craftsmanship.
                  </BodyText>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => {
                        handleAddToCart(quickViewProduct._id)
                        setQuickViewProduct(null)
                      }}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddToWishlist(quickViewProduct._id)}
                    >
                      {wishlistedItems.includes(quickViewProduct._id) ? 'Remove from' : 'Add to'} Wishlist
                    </Button>
                  </div>
                  
                  <Link href={`/products/${quickViewProduct._id}`}>
                    <Button variant="ghost" className="w-full">
                      View Full Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}