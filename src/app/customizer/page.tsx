'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { H1, H2, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'

// Full CSS 3D Product Customizer replacement for 3D viewer
import { ProductCustomizer } from '@/components/customizer/ProductCustomizer'

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

interface MaterialOption {
  id: string
  name: string
  priceModifier: number
  color: string
}

interface CustomizationState {
  selectedProduct: ProductSelection | null
  selectedMaterial: MaterialOption | null
  selectedStone: MaterialOption | null
  selectedSize: string
  totalPrice: number
}

const MATERIALS: MaterialOption[] = [
  { id: 'platinum', name: 'Platinum', priceModifier: 0, color: 'rgb(229, 228, 226)' }, // material-platinum
  { id: '18k-white-gold', name: '18K White Gold', priceModifier: -200, color: 'rgb(248, 248, 255)' }, // material-white-gold
  { id: '18k-yellow-gold', name: '18K Yellow Gold', priceModifier: -300, color: 'rgb(255, 215, 0)' }, // material-gold
  { id: '18k-rose-gold', name: '18K Rose Gold', priceModifier: -250, color: 'rgb(232, 180, 184)' } // material-rose-gold
]

const STONE_OPTIONS: MaterialOption[] = [
  { id: 'lab-diamond-1ct', name: '1 Carat Lab Diamond', priceModifier: 0, color: 'rgb(255, 255, 255)' }, // stone-diamond
  { id: 'lab-diamond-075ct', name: '0.75 Carat Lab Diamond', priceModifier: -400, color: 'rgb(255, 255, 255)' }, // stone-diamond
  { id: 'lab-diamond-125ct', name: '1.25 Carat Lab Diamond', priceModifier: 600, color: 'rgb(255, 255, 255)' }, // stone-diamond
  { id: 'lab-diamond-15ct', name: '1.5 Carat Lab Diamond', priceModifier: 1200, color: 'rgb(255, 255, 255)' } // stone-diamond
]

const SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']

export default function CustomizerPage() {
  const [products, setProducts] = useState<ProductSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const [customization, setCustomization] = useState<CustomizationState>({
    selectedProduct: null,
    selectedMaterial: MATERIALS[0],
    selectedStone: STONE_OPTIONS[0],
    selectedSize: '7',
    totalPrice: 0
  })

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
            const firstProduct = data.data[0]
            setCustomization(prev => ({
              ...prev,
              selectedProduct: firstProduct,
              totalPrice: firstProduct.basePrice
            }))
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

  // Calculate total price when customization changes
  const updatePrice = useCallback((newState: Partial<CustomizationState>) => {
    const updated = { ...customization, ...newState }
    
    if (updated.selectedProduct && updated.selectedMaterial && updated.selectedStone) {
      const totalPrice = updated.selectedProduct.basePrice + 
                        updated.selectedMaterial.priceModifier + 
                        updated.selectedStone.priceModifier
      
      setCustomization({ ...updated, totalPrice })
    }
  }, [customization])

  const handleProductSelect = useCallback((product: ProductSelection) => {
    updatePrice({ selectedProduct: product })
  }, [updatePrice])

  const handleMaterialSelect = useCallback((material: MaterialOption) => {
    updatePrice({ selectedMaterial: material })
  }, [updatePrice])

  const handleStoneSelect = useCallback((stone: MaterialOption) => {
    updatePrice({ selectedStone: stone })
  }, [updatePrice])

  const handleSizeSelect = useCallback((size: string) => {
    updatePrice({ selectedSize: size })
  }, [updatePrice])

  const handleSaveDesign = useCallback(async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implement save to API with CLAUDE_RULES envelope format
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      
      // Generate shareable URL
      const designParams = new URLSearchParams({
        product: customization.selectedProduct?.id || '',
        material: customization.selectedMaterial?.id || '',
        stone: customization.selectedStone?.id || '',
        size: customization.selectedSize
      })
      
      const shareUrl = `${window.location.origin}/customize?${designParams.toString()}`
      
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
  }, [customization])

  return (
    <PageContainer className="py-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <H1 className="text-foreground">Design Your Perfect Ring</H1>
        <MutedText className="text-lg max-w-2xl mx-auto">
          Create a one-of-a-kind piece that reflects your unique style. 
          Our 3D customizer lets you see every detail in real-time.
        </MutedText>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 3D Viewer Section */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <H2 className="text-foreground mb-2">Live Preview</H2>
            <MutedText>Interact with your design in 3D</MutedText>
          </div>

          <ProductCustomizer
            layout="stacked"
            showControls={true}
            autoRotate={false}
            onVariantChange={(variant) => {
              console.log('Customizer variant changed:', variant.name)
            }}
            onPriceChange={(price) => {
              console.log('Customizer price changed:', price)
            }}
            className="shadow-lg"
          />

          {/* Product Info Display */}
          {customization.selectedProduct && (
            <div className="bg-muted/10 rounded-lg p-4 space-y-2">
              <h3 className="font-headline text-lg text-foreground">
                {customization.selectedProduct.name}
              </h3>
              <MutedText className="text-sm">
                {customization.selectedProduct.description}
              </MutedText>
              <div className="text-xs text-accent">
                {customization.selectedProduct.socialAppeal}
              </div>
            </div>
          )}

          {/* Mobile Controls Hint */}
          <div className="lg:hidden bg-muted/20 rounded-lg p-4">
            <MutedText className="text-center text-sm">
              💡 Pinch to zoom • Drag to rotate • Tap to focus
            </MutedText>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-6">
          {/* Ring Design Selection */}
          <div className="space-y-4">
            <H2 className="text-foreground">Choose Your Style</H2>
            
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                    <div className="aspect-square bg-muted/20 rounded animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {apiError && (
              <div className="bg-cta/10 border border-cta/20 rounded-lg p-4 text-center">
                <MutedText className="text-cta">{apiError}</MutedText>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2
                      ${customization.selectedProduct?.id === product.id 
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
                        <div className="text-xs text-muted bg-accent/10 rounded px-1 py-0.5 line-clamp-1">
                          ✨ {product.targetEmotion}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Material Selection */}
          <div className="space-y-4">
            <H2 className="text-foreground">Metal Type</H2>
            <div className="grid grid-cols-2 gap-3">
              {MATERIALS.map((material) => (
                <Button
                  key={material.id}
                  variant={customization.selectedMaterial?.id === material.id ? 'default' : 'ghost'}
                  onClick={() => handleMaterialSelect(material)}
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: material.color }}
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium">{material.name}</div>
                      <div className="text-xs text-muted">
                        {material.priceModifier >= 0 ? '+' : ''}${material.priceModifier}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Stone Selection */}
          <div className="space-y-4">
            <H2 className="text-foreground">Diamond Size</H2>
            <div className="space-y-2">
              {STONE_OPTIONS.map((stone) => (
                <Button
                  key={stone.id}
                  variant={customization.selectedStone?.id === stone.id ? 'default' : 'ghost'}
                  onClick={() => handleStoneSelect(stone)}
                  className="w-full justify-between h-auto p-4"
                >
                  <span className="text-sm font-medium">{stone.name}</span>
                  <span className="text-xs text-muted">
                    {stone.priceModifier >= 0 ? '+' : ''}${stone.priceModifier}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-4">
            <H2 className="text-foreground">Ring Size</H2>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((size) => (
                <Button
                  key={size}
                  variant={customization.selectedSize === size ? 'default' : 'ghost'}
                  onClick={() => handleSizeSelect(size)}
                  className="aspect-square"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-muted/20 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-medium">Total Price:</span>
              <span className="text-2xl font-headline text-cta">
                ${customization.totalPrice.toLocaleString()}
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
              Add to Cart
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="ghost" 
                className="h-12"
                onClick={handleSaveDesign}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Share'}
              </Button>
              
              <Button 
                variant="ghost" 
                className="h-12"
              >
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}