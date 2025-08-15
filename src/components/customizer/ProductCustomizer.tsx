/**
 * ProductCustomizer - Complete CSS 3D Integration Component
 * Combines ImageSequenceViewer with material selection controls
 * Follows CLAUDE_RULES design system and accessibility standards
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { HybridViewer } from './HybridViewer'
import { WithViewerErrorBoundary } from './ViewerErrorBoundary'
import { AdvancedMaterialEditor } from './AdvancedMaterialEditor'
import type { ProductVariant, Material } from '@/types/customizer'
import { RING_VARIANTS, DEFAULT_VARIANT, getVariantById } from '@/data/product-variants'

// CVA variants for layout and spacing
const customizerVariants = cva(
  'w-full space-y-6',
  {
    variants: {
      layout: {
        stacked: 'flex flex-col',
        split: 'grid lg:grid-cols-2 gap-8',
        compact: 'space-y-4'
      }
    },
    defaultVariants: {
      layout: 'stacked'
    }
  }
)

const controlsVariants = cva(
  'space-y-4',
  {
    variants: {
      position: {
        below: 'order-2',
        side: 'order-1 lg:order-2',
        above: 'order-1'
      }
    },
    defaultVariants: {
      position: 'below'
    }
  }
)

const materialButtonVariants = cva(
  'group relative flex items-center justify-start h-auto p-4 transition-all duration-200 border-2',
  {
    variants: {
      state: {
        default: 'border-border bg-background hover:border-accent/50 hover:bg-accent/5',
        selected: 'border-accent bg-accent/10 shadow-sm',
        loading: 'border-border bg-background opacity-75 cursor-wait'
      },
      size: {
        compact: 'p-3',
        standard: 'p-4',
        large: 'p-5'
      }
    },
    defaultVariants: {
      state: 'default',
      size: 'standard'
    }
  }
)

interface ProductCustomizerProps extends VariantProps<typeof customizerVariants> {
  initialVariantId?: string
  className?: string
  showControls?: boolean
  autoRotate?: boolean
  onVariantChange?: (variant: ProductVariant) => void
  onPriceChange?: (price: number) => void
}

export function ProductCustomizer({
  initialVariantId = DEFAULT_VARIANT.id,
  layout = 'stacked',
  className,
  showControls = true,
  autoRotate = false,
  onVariantChange,
  onPriceChange
}: ProductCustomizerProps) {
  // State management
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [viewerError, setViewerError] = useState<Error | null>(null)
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false)
  const [customMaterial, setCustomMaterial] = useState<any>(null)
  const [currentViewerMode, setCurrentViewerMode] = useState<'sequences' | 'threejs' | 'ar'>('sequences')

  // Get current variant
  const selectedVariant = getVariantById(selectedVariantId) || DEFAULT_VARIANT
  
  // Get unique materials for controls
  const availableMaterials = React.useMemo(() => {
    const materialMap = new Map<string, Material>()
    RING_VARIANTS.forEach(variant => {
      materialMap.set(variant.material.id, variant.material)
    })
    return Array.from(materialMap.values())
  }, [])

  // Handle variant selection
  const handleVariantSelect = useCallback(async (variantId: string) => {
    if (variantId === selectedVariantId) return

    const newVariant = getVariantById(variantId)
    if (!newVariant) return

    // Don't set global loading for quick material switches
    setViewerError(null)
    setSelectedVariantId(variantId)
    setCurrentFrame(0) // Reset to first frame
    
    onVariantChange?.(newVariant)
    
    // Calculate and report price change
    const basePrice = 1000 // Base price (will come from product data)
    const newPrice = Math.round(basePrice * newVariant.material.priceMultiplier)
    onPriceChange?.(newPrice)
  }, [selectedVariantId, onVariantChange, onPriceChange])

  // Handle viewer events
  const handleViewerLoad = useCallback(() => {
    // Defer the state update to avoid "setState in render" warning
    setTimeout(() => {
      setIsLoading(false)
    }, 0)
  }, [])

  const handleViewerError = useCallback((error: Error) => {
    setViewerError(error)
    setIsLoading(false)
  }, [])

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame)
  }, [])

  // Handle advanced material changes
  const handleAdvancedMaterialChange = useCallback((material: any) => {
    setCustomMaterial(material)
  }, [])

  // Handle viewer mode changes to show/hide advanced editor
  const handleViewerModeChange = useCallback((mode: 'sequences' | 'threejs' | 'ar') => {
    setCurrentViewerMode(mode)
    // Show advanced editor for Three.js and AR modes
    setShowAdvancedEditor(mode !== 'sequences')
  }, [])

  // Material selector component
  const MaterialSelector = () => (
    <div className="space-y-4">
      <div>
        <H3 className="text-foreground mb-2">Your Story, Your Shine</H3>
        <MutedText size="sm" className="mb-4">
          Choose your preferred metal for the ring setting
        </MutedText>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableMaterials.map((material) => {
          // Find variant with this material
          const variantWithMaterial = RING_VARIANTS.find(v => v.material.id === material.id)
          if (!variantWithMaterial) return null

          const isSelected = selectedVariant.material.id === material.id
          const isLoadingThis = isLoading && variantWithMaterial.id === selectedVariantId

          return (
            <Button
              key={material.id}
              variant="ghost"
              onClick={() => handleVariantSelect(variantWithMaterial.id)}
              disabled={isLoadingThis}
              className={cn(
                materialButtonVariants({ 
                  state: isLoadingThis ? 'loading' : (isSelected ? 'selected' : 'default')
                }),
                'w-full'
              )}
              aria-label={`Select ${material.name} - ${material.description}`}
              aria-pressed={isSelected ? 'true' : 'false'}
              data-material={material.id}
              data-selected={isSelected}
            >
              <div className="flex items-center space-x-3 w-full">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-border flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: material.color }}
                  aria-hidden="true"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-foreground text-sm">
                    {material.name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {material.description}
                  </div>
                  {material.priceMultiplier !== 1.0 && (
                    <div className="text-xs text-accent mt-1">
                      {material.priceMultiplier > 1.0 ? '+' : ''}
                      {((material.priceMultiplier - 1.0) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 ml-2">
                    <svg 
                      className="w-5 h-5 text-accent" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {isLoadingThis && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )

  // Current selection display
  const SelectionSummary = () => (
    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <BodyText className="font-medium text-foreground mb-1">
            Current Selection
          </BodyText>
          <MutedText size="sm">
            {selectedVariant.name}
          </MutedText>
        </div>
        {viewerError && (
          <div className="text-destructive text-xs bg-destructive/10 px-2 py-1 rounded">
            Preview Error
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Your Story, Your Shine:</span>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: selectedVariant.material.color }}
            aria-hidden="true"
          />
          <span className="text-foreground font-medium">
            {selectedVariant.material.name}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
        <span className="text-gray-600">Explore Every Angle:</span>
        <span className="text-foreground">
          {Math.round((currentFrame / 36) * 360)}°
        </span>
      </div>
    </div>
  )

  return (
    <div className={cn(customizerVariants({ layout }), className)}>
      {/* 3D Viewer Section */}
      <div className="space-y-4">
        <div>
          <H3 className="text-foreground mb-2">Infinite Perspectives</H3>
          <MutedText size="sm">
            Spin Your Story | Swipe. Tap. Transform.
          </MutedText>
        </div>

        <WithViewerErrorBoundary 
          onError={(error, errorInfo) => {
            console.error('3D Viewer Error:', error, errorInfo)
            setViewerError(error)
            setIsLoading(false)
          }}
        >
          <HybridViewer
            imagePath={selectedVariant.assetPath}
            modelPath={selectedVariant.modelPath}
            imageCount={selectedVariant.imageCount || 36}
            material={customMaterial || (selectedVariant.material ? {
              metalness: selectedVariant.material.properties?.metalness || 1.0,
              roughness: selectedVariant.material.properties?.roughness || 0.1,
              color: selectedVariant.material.properties?.color || selectedVariant.material.color || '#ffffff'
            } : undefined)}
            onLoad={handleViewerLoad}
            onError={handleViewerError}
            onModeChange={handleViewerModeChange}
            className="shadow-lg h-[400px] sm:h-[500px] lg:h-[600px]"
          />
        </WithViewerErrorBoundary>
        
        <SelectionSummary />
      </div>

      {/* Controls Section */}
      {showControls && (
        <div className={cn(controlsVariants())}>
          <MaterialSelector />
          
          {/* Advanced Material Editor for Premium Modes */}
          {showAdvancedEditor && (currentViewerMode === 'threejs' || currentViewerMode === 'ar') && (
            <div className="pt-4 border-t border-border">
              <AdvancedMaterialEditor
                initialMaterial={{
                  metalness: selectedVariant.material.properties?.metalness || 1.0,
                  roughness: selectedVariant.material.properties?.roughness || 0.1,
                  color: selectedVariant.material.properties?.color || selectedVariant.material.color || '#ffffff',
                  reflectivity: 0.8,
                  clearcoat: 0.5,
                  clearcoatRoughness: 0.2,
                  envMapIntensity: 1.0
                }}
                onMaterialChange={handleAdvancedMaterialChange}
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Additional Controls for Non-Premium Modes */}
          {!showAdvancedEditor && (
            <div className="pt-4 border-t border-border">
              <div className="text-center space-y-2">
                <MutedText size="sm">
                  Switch to Premium 3D or AR mode for advanced material customization
                </MutedText>
                {currentViewerMode === 'sequences' && (
                  <MutedText size="sm" className="text-accent">
                    Advanced material editor available in Premium 3D mode
                  </MutedText>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Enhancement */}
      <div className="sr-only">
        <p>
          Product customizer with 360-degree view. Currently showing {selectedVariant.name}.
          {viewerError && ' 3D preview is currently unavailable.'}
          Use the material selector to change the metal type.
        </p>
      </div>
    </div>
  )
}

export type ProductCustomizerVariant = VariantProps<typeof customizerVariants>