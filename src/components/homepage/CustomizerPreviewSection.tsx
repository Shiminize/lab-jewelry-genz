/**
 * CustomizerPreviewSection - Homepage 3D Customization Preview
 * Showcases 3D customization capabilities with simplified controls
 * Follows CLAUDE_RULES design system and performance requirements
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import type { Material, StoneQuality, CustomizationOptions, ProductBase } from '@/types/customizer'

// Full CSS 3D Product Customizer - Pure Bridge Service Mode
import { ProductCustomizer } from '@/components/customizer/ProductCustomizer'
import { StickyBoundary, type MaterialSelection } from '@/components/customizer/StickyBoundary'
import { useCustomizableProduct } from '@/hooks/useCustomizableProduct'

// CVA variants for the preview section - Mobile first approach
const previewSectionVariants = cva(
  'relative w-full',
  {
    variants: {
      layout: {
        split: 'flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8',
        stacked: 'flex flex-col space-y-4',
        // Mobile-first: 3D viewer first on mobile, 50/50 desktop split
        'mobile-first': 'flex flex-col-reverse lg:grid lg:grid-cols-2 gap-4 lg:gap-8'
      },
      padding: {
        standard: 'p-4 sm:p-6 lg:p-8',
        compact: 'p-3 sm:p-4 lg:p-6'
      }
    },
    defaultVariants: {
      layout: 'mobile-first',
      padding: 'standard'
    }
  }
)

const quickSelectorVariants = cva(
  'group flex items-center justify-between rounded-lg border-2 transition-all duration-200 cursor-pointer touch-manipulation',
  {
    variants: {
      state: {
        default: 'border-border bg-background text-foreground hover:border-accent/50 hover:bg-accent/10 active:bg-accent/20',
        selected: 'border-accent bg-white text-foreground shadow-lg ring-2 ring-accent/20',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      },
      size: {
        compact: 'p-3 text-sm min-h-[48px]', // WCAG AA: 48px minimum touch target
        standard: 'p-4 text-base min-h-[56px] sm:min-h-[64px]' // Larger desktop targets with generous padding
      }
    },
    defaultVariants: {
      state: 'default',
      size: 'standard'
    }
  }
)

interface CustomizerPreviewSectionProps extends VariantProps<typeof previewSectionVariants> {
  className?: string
  onStartDesigning?: () => void
  onChatWithDesigner?: () => void
}

// Bridge service materials for preview UI
const PREVIEW_MATERIALS: Material[] = [
  {
    id: '18k-rose-gold',
    name: '18K Rose Gold',
    displayName: '18K Rose Gold',
    color: '#e8b4b8',
    metalness: 0.8,
    roughness: 0.2,
    priceMultiplier: 1.2,
    description: 'Modern romance meets timeless elegance'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    displayName: 'Platinum',
    color: '#e5e4e2',
    metalness: 0.9,
    roughness: 0.1,
    priceMultiplier: 1.5,
    description: 'Premium white metal for lasting beauty'
  },
  {
    id: '18k-white-gold',
    name: '18K White Gold',
    displayName: '18K White Gold',
    color: '#f8f8f8',
    metalness: 0.85,
    roughness: 0.15,
    priceMultiplier: 1.1,
    description: 'Classic elegance with contemporary appeal'
  },
  {
    id: '18k-yellow-gold',
    name: '18K Yellow Gold',
    displayName: '18K Yellow Gold',
    color: '#ffd700',
    metalness: 0.8,
    roughness: 0.2,
    priceMultiplier: 1.0,
    description: 'Timeless warmth and traditional luxury'
  }
]

const PREVIEW_STONES: StoneQuality[] = [
  {
    id: 'lab-diamond',
    name: 'Lab Diamond',
    description: 'Brilliant clarity',
    priceMultiplier: 1.8,
    grade: 'premium'
  },
  {
    id: 'moissanite',
    name: 'Moissanite',
    description: 'Fire & brilliance',
    priceMultiplier: 1.0,
    grade: 'signature'
  },
  {
    id: 'lab-emerald',
    name: 'Lab Emerald',
    description: 'Vibrant green',
    priceMultiplier: 1.4,
    grade: 'classic'
  }
]

const PREVIEW_SETTINGS = [
  { id: 'classic', name: 'Classic', description: 'Timeless elegance' },
  { id: 'modern', name: 'Modern', description: 'Contemporary style' },
  { id: 'vintage', name: 'Vintage', description: 'Classic heritage' }
]

// Simple setting option interface for preview
interface SettingOption {
  id: string
  name: string
  description: string
}

// Sample product for preview
const SAMPLE_PRODUCT: ProductBase = {
  _id: 'preview-ring',
  name: 'Custom Ring',
  basePrice: 299,
  category: 'rings',
  images: {
    primary: '/images/ring-preview.jpg',
    gallery: []
  },
  modelPath: '/doji_diamond_ring.glb' // Corrected modelPath
}


export function CustomizerPreviewSection({
  layout = 'mobile-first',
  padding = 'standard',
  className,
  onStartDesigning,
  onChatWithDesigner
}: CustomizerPreviewSectionProps) {
  // Use bridge service for product data
  const { 
    currentVariant, 
    availableMaterials, 
    changeMaterial, 
    isLoading: isProductLoading 
  } = useCustomizableProduct({
    productId: 'ring-001',
    initialMaterialId: '18k-rose-gold'
  })
  
  const defaultMaterial = PREVIEW_MATERIALS[0] // Rose gold as default

  const [selectedOptions, setSelectedOptions] = useState<CustomizationOptions>({
    material: defaultMaterial,
    stoneQuality: PREVIEW_STONES[1], // Default to Moissanite
    size: null,
    engraving: ''
  })
  
  const [selectedSetting, setSelectedSetting] = useState(PREVIEW_SETTINGS[0])
  const [currentPrice, setCurrentPrice] = useState(299)
  const [is3DLoaded, setIs3DLoaded] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('ring-001-18k-rose-gold')

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate price based on selections
  useEffect(() => {
    let price = SAMPLE_PRODUCT.basePrice
    if (selectedOptions.material) {
      price *= selectedOptions.material.priceMultiplier
    }
    if (selectedOptions.stoneQuality) {
      price *= selectedOptions.stoneQuality.priceMultiplier
    }
    setCurrentPrice(Math.round(price))
  }, [selectedOptions])


  const handleOptionSelect = async (type: 'material' | 'stone' | 'setting', option: Material | StoneQuality | SettingOption) => {
    if (type === 'material') {
      setSelectedOptions((prev: CustomizationOptions) => ({ ...prev, material: option as Material }))
      
      // Change material through bridge service
      try {
        await changeMaterial((option as Material).id)
        setSelectedVariantId(`ring-001-${(option as Material).id}`)
      } catch (error) {
        console.error('Failed to change material:', error)
      }
    } else if (type === 'stone') {
      setSelectedOptions((prev: CustomizationOptions) => ({ ...prev, stoneQuality: option as StoneQuality }))
    } else if (type === 'setting') {
      setSelectedSetting(option as SettingOption)
    }
  }

  const handleStartDesigning = () => {
    if (onStartDesigning) {
      onStartDesigning()
    } else {
      // Default navigation to customizer
      window.location.href = '/customizer'
    }
  }

  const handleChatWithDesigner = () => {
    if (onChatWithDesigner) {
      onChatWithDesigner()
    } else {
      // Default action - could open chat widget
      console.log('Open chat with designer')
    }
  }

  // Quick selector component - Enhanced with WCAG 2.1 AA keyboard navigation
  const QuickSelector = ({ 
    label, 
    options, 
    selected, 
    onSelect, 
    type 
  }: {
    label: string
    options: Material[] | StoneQuality[] | SettingOption[]
    selected: Material | StoneQuality | SettingOption | null
    onSelect: (option: Material | StoneQuality | SettingOption) => void
    type: 'material' | 'stone' | 'setting'
  }) => {
    const handleKeyDown = (event: React.KeyboardEvent, option: Material | StoneQuality | SettingOption) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(option)
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const currentIndex = options.findIndex(opt => opt.id === option.id)
        let nextIndex: number
        
        if (event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % options.length
        } else {
          nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
        }
        
        // Focus the next option
        const nextButton = document.querySelector(`[data-option-id="${options[nextIndex].id}"]`) as HTMLButtonElement
        if (nextButton) {
          nextButton.focus()
        }
      }
    }

    return (
      <div className="space-y-4" role="radiogroup" aria-labelledby={`${type}-selector-label`}>
        <H3 id={`${type}-selector-label`} className="text-sm font-medium text-foreground">
          {label}
        </H3>
        {/* Mobile: Vertical stack, Tablet+: Optimized grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {options.map((option, index) => {
            const isSelected = selected?.id === option.id
            return (
              <button
                key={option.id}
                data-option-id={option.id}
                onClick={() => onSelect(option)}
                onKeyDown={(e) => handleKeyDown(e, option)}
                className={cn(
                  quickSelectorVariants({ 
                    state: isSelected ? 'selected' : 'default',
                    size: 'standard'
                  }),
                  'w-full focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-none'
                )}
                role="radio"
                aria-checked={isSelected}
                aria-describedby={`${option.id}-description`}
                tabIndex={isSelected ? 0 : -1}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Material color indicator with enhanced styling */}
                  {type === 'material' && (
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                      style={{ backgroundColor: (option as Material).color || '#E8D7D3' }}
                      aria-hidden="true"
                    />
                  )}
                  {/* Stone icon with improved visibility */}
                  {type === 'stone' && (
                    <div className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-accent w-full h-full">
                        <path d="M12 2L15.5 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L8.5 8.5L12 2Z" />
                      </svg>
                    </div>
                  )}
                  {/* Setting icon with improved contrast */}
                  {type === 'setting' && (
                    <div className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent w-full h-full">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate text-sm sm:text-base">
                      {option.name}
                    </div>
                    <div id={`${option.id}-description`} className="text-xs text-gray-600 bg-background truncate">
                      {option.description}
                    </div>
                  </div>
                </div>
                {/* Enhanced selection indicator */}
                {isSelected && (
                  <div className="flex-shrink-0 ml-3" aria-hidden="true">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }


  return (
    <section className={cn('bg-background', className)}>
      <div className={cn(previewSectionVariants({ layout, padding }), 'max-w-7xl mx-auto lg:items-start')}>
          {/* Left Panel (Controls) - Enhanced hierarchy */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
            {/* Hero messaging - Improved typography */}
            <div className="space-y-4 lg:space-y-6">
              <H2 className="text-foreground leading-tight text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                Create Your Legacy
              </H2>
              <H3 className="text-gray-600 bg-background text-lg sm:text-xl lg:text-2xl font-normal">
                Design a Piece as Unique as You Are
              </H3>
              <BodyText className="text-gray-600 bg-background max-w-lg text-base sm:text-lg">
                From metal choices to lab gems, build a piece that tells your story. 
                Real-time 3D preview with ethical materials and expert craftsmanship.
              </BodyText>
            </div>

            {/* Customization Options - Clean separation */}
            <div className="space-y-6 lg:space-y-8" role="main" aria-label="Customization options">
              <QuickSelector
                label="Metal"
                options={PREVIEW_MATERIALS}
                selected={selectedOptions.material}
                onSelect={(option) => handleOptionSelect('material', option)}
                type="material"
              />
              <QuickSelector
                label="Stone"
                options={PREVIEW_STONES}
                selected={selectedOptions.stoneQuality}
                onSelect={(option) => handleOptionSelect('stone', option)}
                type="stone"
              />
              <QuickSelector
                label="Setting Style"
                options={PREVIEW_SETTINGS}
                selected={selectedSetting}
                onSelect={(option) => handleOptionSelect('setting', option)}
                type="setting"
              />
            </div>

            {/* Price Summary - Enhanced visual emphasis */}
            <div className="bg-white border border-accent/20 rounded-lg p-4 lg:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <H3 className="text-foreground bg-white text-lg">Your Design</H3>
                  <BodyText className="text-gray-600 bg-background text-sm">
                    {selectedOptions.material?.name} • {selectedOptions.stoneQuality?.name} • {selectedSetting.name}
                  </BodyText>
                </div>
                <div className="text-right">
                  <div className="text-3xl lg:text-4xl font-headline text-foreground bg-white">
                    ${currentPrice.toLocaleString()}
                  </div>
                  <BodyText className="text-gray-600 bg-background text-sm">Starting price</BodyText>
                </div>
              </div>
            </div>

            {/* Action Buttons - Improved layout */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleStartDesigning}
                className="flex-1 sm:flex-none text-base px-8 py-4"
                aria-describedby="start-designing-description"
              >
                Start Designing
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleChatWithDesigner}
                className="flex-1 sm:flex-none text-base px-6"
              >
                Chat with Designer
              </Button>
            </div>
            <div id="start-designing-description" className="sr-only">
              Opens the full customizer with all design options
            </div>
          </div>

          {/* Right Panel (3D Preview) - Hero focus */}
          <div className="relative lg:sticky lg:top-6 lg:self-start" id="customizer-3d-container">
            <div className="bg-white rounded-xl shadow-xl border border-accent/10 overflow-hidden">
              <ProductCustomizer
                key={selectedVariantId}
                productId="ring-001"
                useBridgeService={true}
                layout="compact"
                showControls={false}
                showStatusBar={true}
                showFrameIndicator={false}
                autoRotate={true}
                onVariantChange={() => setIs3DLoaded(true)}
                onPriceChange={setCurrentPrice}
                className="aspect-square"
              />
            </div>
            
            {/* Mobile fullscreen button */}
            {isMobileView && (
              <button
                className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border"
                onClick={() => document.getElementById('customizer-3d-container')?.requestFullscreen()}
                aria-label="View in fullscreen"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}

            {/* Sticky Boundary - Layout stopper positioned under sticky container */}
            <StickyBoundary
              materialSelection={{
                metal: selectedOptions.material.displayName,
                stone: selectedOptions.stoneQuality.displayName, 
                style: selectedSetting.name
              }}
              isVisible={true}
              showControls={false}
              className="mt-4"
            />
          </div>
        </div>

        {/* Trust Indicators - Refined styling */}
        <div className="col-span-full mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: '🌱', text: '100% Conflict-Free' },
              { icon: '♻️', text: 'Recycled Metals' },
              { icon: '💎', text: 'Lab-Grown Gems' },
              { icon: '🎯', text: 'Custom Crafted' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl lg:text-2xl">{item.icon}</span>
                </div>
                <BodyText className="text-gray-600 bg-background font-medium text-sm lg:text-base">
                  {item.text}
                </BodyText>
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}

export type CustomizerPreviewSectionVariant = VariantProps<typeof previewSectionVariants>
