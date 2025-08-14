'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { H1, BodyText, H2, MutedText } from '@/components/foundation/Typography'
import { ARTryOnCard } from '@/components/ar'
import { CustomizerContainer } from './CustomizerContainer'
import { MaterialSelector } from './MaterialSelector'
import { StoneQualityPicker } from './StoneQualityPicker'
import { SizeSelector } from './SizeSelector'
import { EngravingInput } from './EngravingInput'
import { PriceCalculator } from './PriceCalculator'
import { ActionButtons } from './ActionButtons'
import { MobileTouchControls } from './MobileTouchControls'
import { useProductCustomization } from '@/hooks/use-product-customization'
import { useAvailableProducts, useFallbackProducts } from '@/hooks/use-available-products'
import { ProductSelector, CompactProductSelector } from './ProductSelector'
import type { ProductBase, CustomizationOptions, Material, StoneQuality, RingSize } from '@/types/customizer'

interface JewelryCustomizerProps {
  productId?: string // Made optional for product selector functionality
  initialCustomization?: Partial<CustomizationOptions>
  onAddToCart?: (customization: CustomizationOptions, totalPrice: number) => Promise<void>
  onSaveDesign?: (customization: CustomizationOptions) => Promise<void>
  onShareDesign?: (customization: CustomizationOptions) => void
  className?: string
}

export function JewelryCustomizer({
  productId: initialProductId,
  initialCustomization,
  onAddToCart,
  onSaveDesign,
  onShareDesign,
  className
}: JewelryCustomizerProps) {
  // Product selection state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId || null)
  const [showProductSelector, setShowProductSelector] = useState(!initialProductId)
  
  // Load available products
  const { 
    products: availableProducts, 
    isLoading: isLoadingProducts,
    error: productsError 
  } = useAvailableProducts()
  
  // Fallback to seed data if API fails
  const fallbackProducts = useFallbackProducts()
  const products = productsError ? fallbackProducts : availableProducts

  // Use the new hook for product data management
  const {
    product,
    customization,
    pricing,
    isLoading,
    error,
    updateCustomization,
    saveDesign,
    shareDesign,
    hasChanges,
    isCustomizationValid
  } = useProductCustomization({ 
    productId: selectedProductId || '', 
    initialCustomization 
  })

  const [activeStep, setActiveStep] = useState<'material' | 'stone' | 'size' | 'engraving'>('material')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Handle product selection
  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId)
    setShowProductSelector(false)
    // Reset customization when changing products
    setActiveStep('material')
  }

  // Combined loading state
  const isLoadingAnyData = isLoading || isLoadingProducts
  
  // Show product selector if no product is selected
  if (showProductSelector || (!selectedProductId && products.length > 0)) {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Hero section */}
        <div className="bg-gradient-to-b from-muted/30 to-background py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <H1 className="mb-4">Choose Your Canvas</H1>
              <BodyText className="text-foreground max-w-2xl mx-auto">
                Every piece tells a story. Which one speaks to your soul?
              </BodyText>
            </div>
          </div>
        </div>

        {/* Product selector */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:hidden mb-6">
            <CompactProductSelector
              availableProducts={products}
              selectedProductId={selectedProductId || ''}
              onProductChange={handleProductChange}
            />
          </div>
          <div className="hidden md:block">
            <ProductSelector
              availableProducts={products}
              selectedProductId={selectedProductId || ''}
              onProductChange={handleProductChange}
            />
          </div>
          
          {products.length === 0 && !isLoadingProducts && (
            <div className="text-center py-12">
              <H2 className="text-foreground mb-2">No products available</H2>
              <BodyText className="text-foreground">
                Please check back later or contact support.
              </BodyText>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoadingAnyData) {
    return (
      <div className={cn('min-h-screen bg-background flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <H2 className="text-foreground mb-2">Loading your customizer...</H2>
          <BodyText className="text-foreground">
            Preparing your 3D design experience
          </BodyText>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className={cn('min-h-screen bg-background flex items-center justify-center', className)}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <H2 className="text-foreground mb-2">Unable to Load Product</H2>
          <BodyText className="text-foreground mb-4">
            {error || 'The product you requested could not be found.'}
          </BodyText>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cta text-background rounded-md hover:bg-cta-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Auto-advance to next step when selections are made
  useEffect(() => {
    if (customization.material && activeStep === 'material') {
      setTimeout(() => setActiveStep('stone'), 500)
    } else if (customization.stoneQuality && activeStep === 'stone') {
      setTimeout(() => setActiveStep('size'), 500)
    } else if (customization.size && activeStep === 'size') {
      setTimeout(() => setActiveStep('engraving'), 500)
    }
  }, [customization, activeStep])

  // Handle customization changes through the hook
  const handleMaterialChange = (material: Material) => {
    updateCustomization({ material })
  }

  const handleStoneQualityChange = (stoneQuality: StoneQuality) => {
    updateCustomization({ stoneQuality })
  }

  const handleSizeChange = (size: RingSize) => {
    updateCustomization({ size })
  }

  const handleEngravingChange = (engraving: string) => {
    updateCustomization({ engraving })
  }

  // Enhanced action handlers with pricing integration
  const handleAddToCart = async () => {
    if (!onAddToCart || !pricing || isAddingToCart) return
    
    try {
      setIsAddingToCart(true)
      await onAddToCart(customization, pricing.total)
    } catch (error) {
      console.error('Add to cart failed:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleSaveDesign = async () => {
    try {
      const result = await saveDesign()
      if (result.success) {
        console.log('Design saved:', result.designId)
        // TODO: Show success notification
      } else {
        console.error('Save failed:', result.error)
        // TODO: Show error notification
      }
      
      if (onSaveDesign) {
        await onSaveDesign(customization)
      }
    } catch (error) {
      console.error('Save design failed:', error)
    }
  }

  const handleShareDesign = async () => {
    try {
      const result = await shareDesign(true) // Include price in share
      if (result.success && result.shareUrl) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.shareUrl)
        // TODO: Show success notification
        console.log('Share URL copied:', result.shareUrl)
      } else {
        console.error('Share failed:', result.error)
      }
      
      if (onShareDesign) {
        onShareDesign(customization)
      }
    } catch (error) {
      console.error('Share design failed:', error)
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8 md:hidden">
      {(['material', 'stone', 'size', 'engraving'] as const).map((step, index) => (
        <button
          key={step}
          onClick={() => setActiveStep(step)}
          className={cn(
            'w-3 h-3 rounded-full transition-all',
            activeStep === step
              ? 'bg-accent scale-125'
              : customization[step as keyof CustomizationOptions]
              ? 'bg-success'
              : 'bg-border'
          )}
          aria-label={`Go to ${step} selection`}
        />
      ))}
    </div>
  )

  const MobileStepView = () => {
    switch (activeStep) {
      case 'material':
        return (
          <MaterialSelector
            materials={product.availableMaterials}
            selectedMaterial={customization.material}
            onMaterialChange={handleMaterialChange}
          />
        )
      case 'stone':
        return (
          <StoneQualityPicker
            stones={product.availableStones}
            selectedQuality={customization.stoneQuality}
            onQualityChange={handleStoneQualityChange}
          />
        )
      case 'size':
        return (
          <SizeSelector
            sizes={product.availableSizes}
            selectedSize={customization.size}
            onSizeChange={handleSizeChange}
          />
        )
      case 'engraving':
        return (
          <EngravingInput
            value={customization.engraving || ''}
            onChange={handleEngravingChange}
            maxLength={25}
            placeholder="Add a personal message (optional)"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Hero section */}
      <div className="bg-gradient-to-b from-muted/30 to-background py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <H1 className="mb-4">
              <span className="hidden md:inline">Create Your Unique Sparkle</span>
              <span className="md:hidden">Design Your Gem</span>
            </H1>
            <BodyText className="text-foreground max-w-2xl mx-auto">
              Ethical diamonds, personal design. Luxury that reflects your unique story.
            </BodyText>
            
            {/* Change design button */}
            <div className="mt-6">
              <button
                onClick={() => setShowProductSelector(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent hover:text-background transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-medium">Change Design ({products.length} available)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main customizer interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Viewer - Full width on mobile, left column on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <CustomizerContainer
              product={product.product}
              productCustomization={product}
              onCustomizationChange={updateCustomization}
              className="sticky top-4"
            />
          </div>

          {/* Mobile step indicator */}
          <div className="lg:hidden order-2">
            <StepIndicator />
          </div>

          {/* Customization panels */}
          <div className="order-4 lg:order-2">
            {/* Desktop: All panels stacked */}
            <div className="hidden lg:block space-y-8">
              <MaterialSelector
                materials={product.availableMaterials}
                selectedMaterial={customization.material}
                onMaterialChange={handleMaterialChange}
              />
              <StoneQualityPicker
                stones={product.availableStones}
                selectedQuality={customization.stoneQuality}
                onQualityChange={handleStoneQualityChange}
              />
              <SizeSelector
                sizes={product.availableSizes}
                selectedSize={customization.size}
                onSizeChange={handleSizeChange}
              />
              <EngravingInput
                value={customization.engraving || ''}
                onChange={handleEngravingChange}
                maxLength={25}
                placeholder="Add a personal message (optional)"
              />
              
              {/* AR Try-On Preview */}
              <ARTryOnCard
                productName={product.product.name}
                onWaitlistSignup={async (email) => {
                  console.log('AR waitlist signup:', email)
                  // TODO: Implement AR waitlist API call
                  return new Promise(resolve => setTimeout(resolve, 1000))
                }}
              />
            </div>

            {/* Mobile: Single active panel */}
            <div className="lg:hidden">
              <MobileStepView />
            </div>
          </div>

          {/* Price calculator and actions */}
          <div className="order-3 lg:order-3 lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              <PriceCalculator
                product={product.product}
                customization={customization}
                pricing={pricing}
              />
              <ActionButtons
                product={product.product}
                customization={customization}
                totalPrice={pricing?.total || product.product.basePrice}
                onAddToCart={handleAddToCart}
                onSaveDesign={handleSaveDesign}
                onShare={handleShareDesign}
                isLoading={isAddingToCart}
                hasChanges={hasChanges}
                isValid={isCustomizationValid}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile touch controls */}
      <MobileTouchControls
        onRotateLeft={() => console.log('Rotate left')}
        onRotateRight={() => console.log('Rotate right')}
        onZoomIn={() => console.log('Zoom in')}
        onZoomOut={() => console.log('Zoom out')}
        onReset={() => console.log('Reset view')}
      />

      {/* Mobile navigation between steps */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const steps = ['material', 'stone', 'size', 'engraving'] as const
              const currentIndex = steps.indexOf(activeStep)
              if (currentIndex > 0) {
                setActiveStep(steps[currentIndex - 1])
              }
            }}
            disabled={activeStep === 'material'}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md transition-colors',
              activeStep === 'material'
                ? 'text-muted cursor-not-allowed'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="text-center">
            <BodyText className="text-sm font-medium text-foreground capitalize">
              {activeStep === 'stone' ? 'Stone Quality' : activeStep}
            </BodyText>
          </div>

          <button
            onClick={() => {
              const steps = ['material', 'stone', 'size', 'engraving'] as const
              const currentIndex = steps.indexOf(activeStep)
              if (currentIndex < steps.length - 1) {
                setActiveStep(steps[currentIndex + 1])
              }
            }}
            disabled={activeStep === 'engraving'}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md transition-colors',
              activeStep === 'engraving'
                ? 'text-muted cursor-not-allowed'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}