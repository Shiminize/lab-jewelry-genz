'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { H1, H2, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'

// Streamlined 5-component 3D customizer - CLAUDE_RULES compliant
const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-background/50 rounded-lg animate-pulse">
        <div className="text-center space-y-token-md">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <MutedText className="font-medium">Building your masterpiece...</MutedText>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for 3D components
  }
)

// Types following CLAUDE_RULES TypeScript requirements
interface ProductSelection {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  keyFeatures: string[]
  socialAppeal: string
  targetEmotion: string
  customizationOptions: {
    materialsCount: number
    stonesCount: number
    hasEngraving: boolean
    sizeRange: string
  }
  metadata: {
    modelPath: string
    previewImage: string
    genZAppeal: string
    instagramability: string
  }
}

export default function CustomizerPage() {
  const [products, setProducts] = useState<ProductSelection[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('ring-001')
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('18k-rose-gold')
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/products/customizable')
        const data = await response.json()
        
        if (data.success && data.data) {
          setProducts(data.data)
          // Set first product as default selection
          if (data.data.length > 0) {
            setSelectedProductId(data.data[0].id)
            setCurrentPrice(data.data[0].basePrice)
          }
        } else {
          setApiError(data.error?.message || 'Failed to load products')
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setApiError('Failed to connect to the server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleProductSelect = (product: ProductSelection) => {
    setSelectedProductId(product.id)
    setCurrentPrice(product.basePrice)
  }

  const handleVariantChange = (variant: { materialId: string; price: number }) => {
    setSelectedMaterialId(variant.materialId)
    setCurrentPrice(variant.price)
  }

  const handleSaveDesign = async () => {
    setIsSaving(true)
    
    try {
      // Generate shareable URL
      const designParams = new URLSearchParams({
        product: selectedProductId,
        material: selectedMaterialId
      })
      
      const shareUrl = `${window.location.origin}/customizer?${designParams.toString()}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      
      // Show success message (will implement proper toast later)
      alert('Design saved and link copied to clipboard!')
      
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save design. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <PageContainer className="py-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-token-md">
        <H1 className="text-foreground">Your Ring, Your Vibe ✨</H1>
        <MutedText className="text-lg max-w-2xl mx-auto">
          Build something that&apos;s actually you. 
          Our 3D customizer lets you see every detail in real-time.
        </MutedText>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
        {/* 3D Viewer Section - Delegated to ProductCustomizer */}
        <div className="space-y-6">
          <div className="text-center lg:text-left space-y-3">
            <H2 className="text-foreground mb-2">See Your Vision ✨</H2>
            <MutedText>Spin it, love it, make it yours</MutedText>
          </div>

          {/* Core 3D Customizer - All material/stone logic handled internally */}
          <div data-testid="product-customizer">
            <ProductCustomizer
              key={`${selectedProductId}-${selectedMaterialId}`}
              productId={selectedProductId}
              initialMaterialId={selectedMaterialId}
              useOptimizedViewer={true}
              layout="clean-preview"
              showControls={true}
              showStatusBar={true}
              showFrameIndicator={false}
              autoRotate={true}
              onVariantChange={handleVariantChange}
              onPriceChange={setCurrentPrice}
              className="shadow-lg"
            />
          </div>

          {/* Product Info Display */}
          {selectedProduct && (
            <div className="bg-muted/10 rounded-lg p-4 space-y-token-sm">
              <h3 className="font-headline text-lg text-foreground">
                {selectedProduct.name}
              </h3>
              <MutedText className="text-sm">
                {selectedProduct.description}
              </MutedText>
              <div className="text-xs text-accent">
                {selectedProduct.socialAppeal}
              </div>
            </div>
          )}

          {/* Touch controls removed for minimalist design */}
        </div>

        {/* Product Selection and Actions */}
        <div className="space-y-6">
          {/* Material selection handled internally by ProductCustomizer component */}

          {/* Product Selection */}
          <div className="space-y-token-md">
            <H2 className="text-foreground">Choose Your Style</H2>
            
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-token-sm">
                    <div className="aspect-square bg-muted/20 rounded animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {apiError && (
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <MutedText className="text-foreground">{apiError}</MutedText>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !apiError && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3" data-testid="product-selection">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2
                      ${selectedProductId === product.id 
                        ? 'border-cta bg-cta/10' 
                        : 'border-border bg-background hover:border-cta/50'
                      }
                    `}
                  >
                    <div className="aspect-square bg-muted/20 rounded mb-2 flex items-center justify-center">
                      <MutedText className="text-xs text-center px-1">
                        {product.category}
                      </MutedText>
                    </div>
                    <div className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                      {product.name}
                    </div>
                    <div className="text-xs text-accent">${product.basePrice.toLocaleString()}</div>
                    
                    {/* Gen Z Appeal Badge */}
                    {product.metadata.genZAppeal && (
                      <div className="mt-1">
                        <div className="text-accent bg-background rounded px-1 py-0.5 line-clamp-1 text-xs">
                          ✨ {product.targetEmotion}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="bg-muted/20 rounded-lg p-6 space-y-token-md">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-medium">Total Price:</span>
              <span className="text-2xl font-headline text-cta">
                ${currentPrice.toLocaleString()}
              </span>
            </div>
            <MutedText className="text-sm text-center">
              Free shipping • 30-day returns • Lifetime warranty
            </MutedText>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full h-12 text-base"
              disabled={isSaving}
            >
              Make It Mine
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="ghost" 
                className="h-12"
                onClick={handleSaveDesign}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save My Vibe'}
              </Button>
              
              <Button 
                variant="ghost" 
                className="h-12"
              >
                Save for Later ❤️
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}