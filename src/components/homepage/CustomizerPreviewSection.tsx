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

// Full CSS 3D Product Customizer - replacing failing 3D viewer
import { ProductCustomizer } from '@/components/customizer/ProductCustomizer'

// CVA variants for the preview section - Mobile first approach
const previewSectionVariants = cva(
  'relative w-full overflow-hidden',
  {
    variants: {
      layout: {
        split: 'flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12',
        stacked: 'flex flex-col space-y-8',
        // Corrected: flex-col-reverse for mobile, 5-col grid for desktop
        'mobile-first': 'flex flex-col-reverse lg:grid lg:grid-cols-5 gap-6 lg:gap-6'
      },
      padding: {
        standard: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16',
        compact: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'
      }
    },
    defaultVariants: {
      layout: 'mobile-first',
      padding: 'standard'
    }
  }
)

const quickSelectorVariants = cva(
  'group flex items-center justify-between rounded-lg border-2 transition-all duration-200 cursor-pointer',
  {
    variants: {
      state: {
        default: 'border-border bg-background hover:border-accent/50 hover:bg-accent/5',
        selected: 'border-accent bg-accent/10 shadow-sm',
        disabled: 'opacity-50 cursor-not-allowed'
      },
      size: {
        compact: 'p-2 text-sm min-h-[44px]', // Mobile-first: 44px min touch target
        standard: 'p-3 text-base min-h-[48px] sm:min-h-[52px]' // Larger on desktop
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

// Simplified preview options matching existing system
const PREVIEW_MATERIALS: Material[] = [
  {
    id: 'silver',
    name: '925 Silver',
    description: 'Classic brilliance',
    priceMultiplier: 1.0,
    color: 'var(--muted)'
  },
  {
    id: 'gold-14k',
    name: '14k Gold',
    description: 'Timeless luxury',
    priceMultiplier: 1.5,
    color: 'var(--accent)'
  },
  {
    id: 'gold-18k',
    name: '18k Gold',
    description: 'Premium elegance',
    priceMultiplier: 2.0,
    color: 'var(--accent)'
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
  const [selectedOptions, setSelectedOptions] = useState<CustomizationOptions>({
    material: PREVIEW_MATERIALS[0],
    stoneQuality: PREVIEW_STONES[1], // Default to Moissanite
    size: null,
    engraving: ''
  })
  
  const [selectedSetting, setSelectedSetting] = useState(PREVIEW_SETTINGS[0])
  const [currentPrice, setCurrentPrice] = useState(299)
  const [is3DLoaded, setIs3DLoaded] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

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


  const handleOptionSelect = (type: 'material' | 'stone' | 'setting', option: Material | StoneQuality | SettingOption) => {
    if (type === 'material') {
      setSelectedOptions((prev: CustomizationOptions) => ({ ...prev, material: option as Material }))
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

  // Quick selector component - Mobile optimized
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
  }) => (
    <div className="space-y-3">
      <H3 className="text-sm font-medium text-foreground">{label}</H3>
      {/* Mobile: Vertical stack, Tablet+: Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {options.map((option) => {
          const isSelected = selected?.id === option.id
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option)}
              className={cn(
                quickSelectorVariants({ 
                  state: isSelected ? 'selected' : 'default',
                  size: 'standard'
                }),
                'w-full touch-manipulation' // Optimize for touch
              )}
              aria-label={`Select ${option.name} - ${option.description}`}
              role="radio"
              aria-checked={isSelected}
            >
              <div className="flex items-center space-x-3 flex-1">
                {type === 'material' && (
                  <div 
                    className="w-5 h-5 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: (option as Material).color || 'var(--muted)' }}
                    aria-hidden="true"
                  />
                )}
                {type === 'stone' && (
                  <div className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="text-accent">
                      <path d="M10 2L13 7L19 8L14.5 12L16 18L10 15L4 18L5.5 12L1 8L7 7L10 2Z" />
                    </svg>
                  </div>
                )}
                {type === 'setting' && (
                  <div className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="text-accent">
                      <circle cx="10" cy="10" r="8" strokeWidth="2" />
                      <circle cx="10" cy="10" r="3" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{option.name}</div>
                  <div className="text-xs text-muted truncate">{option.description}</div>
                </div>
              </div>
              {isSelected && (
                <svg className="w-5 h-5 text-accent flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )


  return (
    <section className={cn(previewSectionVariants({ layout, padding }), 'bg-background', className)}>
      <div className="max-w-7xl mx-auto">
        <div className={cn(previewSectionVariants({ layout }))}>
          {/* Left (Controls) - 40% on desktop */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8 lg:col-span-2">
            {/* Hero messaging */}
            <div className="space-y-3 sm:space-y-4">
              <H2 className="text-foreground leading-tight text-2xl sm:text-3xl lg:text-4xl">
                Create Your Legacy. Design a Piece as Unique as You Are.
              </H2>
              <BodyText className="text-foreground max-w-lg text-sm sm:text-base">
                From metal choices to lab gems, build a piece that tells your story. 
                Real-time 3D preview with ethical materials and expert craftsmanship.
              </BodyText>
            </div>

            {/* Options */}
            <div className={cn(
              "space-y-4 sm:space-y-6 lg:space-y-8",
              isMobileView && "max-h-[400px] overflow-y-auto scrollbar-thin"
            )}>
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
                label="Setting"
                options={PREVIEW_SETTINGS}
                selected={selectedSetting}
                onSelect={(option) => handleOptionSelect('setting', option)}
                type="setting"
              />
            </div>

            {/* Price & CTAs */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <BodyText className="font-medium text-foreground text-sm sm:text-base">Your Design</BodyText>
                  <MutedText size="sm" className="text-xs sm:text-sm">
                    {selectedOptions.material?.name} • {selectedOptions.stoneQuality?.name} • {selectedSetting.name}
                  </MutedText>
                </div>
                <div className="text-right">
                  <H3 className="text-foreground text-xl sm:text-2xl">${currentPrice}</H3>
                  <MutedText size="sm" className="text-xs sm:text-sm">Starting price</MutedText>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="primary" 
                size={isMobileView ? "md" : "lg"}
                onClick={handleStartDesigning}
                className="flex-1 sm:flex-none"
              >
                Start Designing
              </Button>
              <Button 
                variant="ghost" 
                size={isMobileView ? "md" : "lg"}
                onClick={handleChatWithDesigner}
              >
                Chat with Designer
              </Button>
            </div>
          </div>

          {/* Right (3D Preview) - 60% on desktop */}
          <div className="relative lg:col-span-3" id="customizer-3d-container">
            <ProductCustomizer
              layout="compact"
              showControls={false}
              autoRotate={true}
              onVariantChange={() => setIs3DLoaded(true)}
              onPriceChange={setCurrentPrice}
              className="shadow-lg"
            />
            {isMobileView && (
              <div className="absolute top-2 right-2">
                <button
                  className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
                  onClick={() => document.getElementById('customizer-3d-container')?.requestFullscreen()}
                  aria-label="Enter fullscreen mode"
                >
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🌱', text: '100% Conflict-Free' },
              { icon: '♻️', text: 'Recycled Metals' },
              { icon: '💎', text: 'Lab-Grown Gems' },
              { icon: '🎯', text: 'Custom Crafted' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl" role="img" aria-hidden="true">{item.icon}</span>
                </div>
                <MutedText size="sm" className="font-medium text-xs sm:text-sm">{item.text}</MutedText>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export type CustomizerPreviewSectionVariant = VariantProps<typeof previewSectionVariants>
