/**
 * CustomizerPreviewSection - Aurora Design System Compliant
 * Orchestrates 3D customization preview with extracted components
 * CLAUDE_RULES compliant: <350 lines with service→hook→component architecture
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { H2, H3, BodyText, AuroraStatement, AuroraTitleL, AuroraBodyL } from '../foundation/Typography'
import { AuroraButton } from '../aurora/AuroraButton'
import { Container } from '../layout/Container'
import type { Material, StoneQuality, CustomizationOptions } from '../../types/customizer'

// Extracted components for CLAUDE_RULES compliance
import { QuickSelector } from './customizer-preview/QuickSelector'
import { PriceSummary } from './customizer-preview/PriceSummary'
import { TrustIndicators } from './customizer-preview/TrustIndicators'
import { PREVIEW_MATERIALS, PREVIEW_STONES, PREVIEW_SETTINGS, SAMPLE_PRODUCT, type SettingOption } from './customizer-preview/previewData'

// 3D Customizer components
import { ProductCustomizer } from '../customizer/ProductCustomizer'
import { StickyBoundary, type MaterialSelection } from '../customizer/StickyBoundary'
import { useCustomizationState } from '../../hooks/useCustomizationState'

// Aurora-compliant CVA variants
const previewSectionVariants = cva(
  'relative w-full',
  {
    variants: {
      layout: {
        split: 'flex flex-col lg:grid lg:grid-cols-2 gap-token-md lg:gap-token-2xl',
        stacked: 'flex flex-col space-y-token-md',
        'mobile-first': 'flex flex-col-reverse lg:grid lg:grid-cols-2 gap-token-md lg:gap-token-2xl'
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

interface CustomizerPreviewSectionProps extends VariantProps<typeof previewSectionVariants> {
  className?: string
  onStartDesigning?: () => void
  onChatWithDesigner?: () => void
}

export function CustomizerPreviewSection({
  layout = 'mobile-first',
  padding = 'standard',
  className,
  onStartDesigning,
  onChatWithDesigner
}: CustomizerPreviewSectionProps) {
  const { state, actions } = useCustomizationState({
    productId: 'ring-001',
    initialMaterialId: '18k-rose-gold'
  })
  
  const [selectedOptions, setSelectedOptions] = useState<CustomizationOptions>({
    material: PREVIEW_MATERIALS[0],
    stoneQuality: PREVIEW_STONES[1],
    size: null,
    engraving: ''
  })
  
  const [selectedSetting, setSelectedSetting] = useState(PREVIEW_SETTINGS[0])
  const [currentPrice, setCurrentPrice] = useState(299)
  const [is3DLoaded, setIs3DLoaded] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('ring-001-18k-rose-gold')

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    let price = SAMPLE_PRODUCT.basePrice
    if (selectedOptions.material) price *= selectedOptions.material.priceMultiplier
    if (selectedOptions.stoneQuality) price *= selectedOptions.stoneQuality.priceMultiplier
    setCurrentPrice(Math.round(price))
  }, [selectedOptions])

  const handleOptionSelect = async (type: 'material' | 'stone' | 'setting', option: Material | StoneQuality | SettingOption) => {
    if (type === 'material') {
      setSelectedOptions(prev => ({ ...prev, material: option as Material }))
      try {
        await actions.changeMaterial((option as Material).id)
        setSelectedVariantId(`ring-001-${(option as Material).id}`)
      } catch (error) {
        console.error('Failed to change material:', error)
      }
    } else if (type === 'stone') {
      setSelectedOptions(prev => ({ ...prev, stoneQuality: option as StoneQuality }))
    } else if (type === 'setting') {
      setSelectedSetting(option as SettingOption)
    }
  }

  const handleStartDesigning = () => {
    onStartDesigning ? onStartDesigning() : (window.location.href = '/customizer')
  }

  const handleChatWithDesigner = () => {
    onChatWithDesigner ? onChatWithDesigner() : console.log('Open chat with designer')
  }

  return (
    <section className={cn('bg-background', className)} data-section="customizer-preview">
      <Container maxWidth="default">
        <div className={cn(previewSectionVariants({ layout, padding }), 'lg:items-start')}>
          {/* Left Panel (Controls) */}
          <div className="flex flex-col justify-center space-y-token-lg lg:space-y-token-2xl">
            <div className="space-y-token-md lg:space-y-token-lg">
              <AuroraStatement className="aurora-gradient-text animate-aurora-glow-pulse">
                Create Your Legacy
              </AuroraStatement>
              <AuroraTitleL className="text-deep-space/80">
                Design a Piece as Unique as You Are
              </AuroraTitleL>
              <AuroraBodyL className="text-deep-space/70 max-w-lg">
                From metal choices to lab gems, build a piece that tells your story. 
                Real-time 3D preview with ethical materials and expert craftsmanship.
              </AuroraBodyL>
            </div>

            <div className="space-y-token-lg lg:space-y-token-2xl" role="main" aria-label="Customization options">
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

            <PriceSummary
              material={selectedOptions.material}
              stoneQuality={selectedOptions.stoneQuality}
              setting={selectedSetting}
              currentPrice={currentPrice}
            />

            <div className="flex flex-col sm:flex-row gap-token-md">
              <AuroraButton 
                variant="primary" 
                size="lg"
                luxury="premium"
                onClick={handleStartDesigning}
                className="flex-1 sm:flex-none text-base px-token-2xl py-token-md shadow-aurora-md hover:shadow-aurora-lg animate-aurora-float"
              >
                Start Designing
              </AuroraButton>
              <AuroraButton 
                variant="accent" 
                size="lg"
                luxury="premium"
                onClick={handleChatWithDesigner}
                className="flex-1 sm:flex-none text-base px-token-lg shadow-aurora-md hover:shadow-aurora-lg"
              >
                Chat with Designer
              </AuroraButton>
            </div>
          </div>

          <div className="relative lg:sticky lg:top-6 lg:self-start" id="customizer-3d-container">
            <div className="bg-background shadow-xl rounded-xl overflow-hidden">
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
            
            {isMobileView && (
              <button
                className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-token-md p-3 shadow-lg border border-border"
                onClick={() => document.getElementById('customizer-3d-container')?.requestFullscreen()}
                aria-label="View in fullscreen"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}

            <StickyBoundary
              materialSelection={{
                metal: selectedOptions.material?.name || '',
                stone: selectedOptions.stoneQuality?.name || '', 
                style: selectedSetting.name
              }}
              isVisible={true}
              showControls={false}
              className="mt-4"
            />
          </div>
        </div>

        <TrustIndicators />
      </Container>
    </section>
  )
}

export type CustomizerPreviewSectionVariant = VariantProps<typeof previewSectionVariants>
