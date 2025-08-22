/**
 * ProductCustomizer - Main 3D Customizer Container
 * Single responsibility: Orchestrate the 5-component architecture
 * CLAUDE_RULES.md compliant with system health-driven implementation
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import ImageViewer from './ImageViewer'
import MaterialControls from './MaterialControls'
import ViewerControls from './ViewerControls'
import type { 
  ProductCustomizerProps, 
  CustomizerState, 
  Material, 
  MaterialId,
  AssetResponse 
} from './types'

// CLAUDE_RULES: Material-only focus with lab-grown gems
const AVAILABLE_MATERIALS: Material[] = [
  {
    id: 'platinum',
    name: 'platinum',
    displayName: 'Platinum',
    priceModifier: 0,
    pbrProperties: {
      metalness: 0.9,
      roughness: 0.05,
      reflectivity: 0.8,
      color: 'rgb(229, 228, 226)'
    }
  },
  {
    id: '18k-white-gold',
    name: '18k-white-gold',
    displayName: '18K White Gold',
    priceModifier: -200,
    pbrProperties: {
      metalness: 0.85,
      roughness: 0.08,
      reflectivity: 0.75,
      color: 'rgb(248, 248, 255)'
    }
  },
  {
    id: '18k-yellow-gold',
    name: '18k-yellow-gold',
    displayName: '18K Yellow Gold',
    priceModifier: -300,
    pbrProperties: {
      metalness: 0.88,
      roughness: 0.06,
      reflectivity: 0.82,
      color: 'rgb(255, 215, 0)'
    }
  },
  {
    id: '18k-rose-gold',
    name: '18k-rose-gold',
    displayName: '18K Rose Gold',
    priceModifier: -250,
    pbrProperties: {
      metalness: 0.86,
      roughness: 0.07,
      reflectivity: 0.78,
      color: 'rgb(232, 180, 184)'
    }
  }
]

export const ProductCustomizer: React.FC<ProductCustomizerProps> = ({
  productId = 'ring-001',
  initialMaterialId = '18k-rose-gold',
  onVariantChange,
  onPriceChange,
  className
}) => {
  // Centralized state management - single source of truth
  const [state, setState] = useState<CustomizerState>({
    product: null,
    selectedMaterial: initialMaterialId,
    rotationState: {
      currentFrame: 0,
      isRotating: false,
      totalFrames: 36
    },
    assets: null,
    isLoading: true,
    error: null
  })

  // Memoized current material to prevent unnecessary re-renders
  const currentMaterial = useMemo(
    () => AVAILABLE_MATERIALS.find(m => m.id === state.selectedMaterial),
    [state.selectedMaterial]
  )

  // Stable asset fetching function
  const fetchAssets = useCallback(async (materialId: MaterialId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const startTime = performance.now()
      const response = await fetch(
        `/api/products/customizable/${productId}/assets?materialId=${materialId}`,
        { cache: 'no-store' }
      )
      
      const responseTime = performance.now() - startTime
      console.log(`[CUSTOMIZER DEBUG] Asset fetch: ${responseTime.toFixed(2)}ms`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.status}`)
      }
      
      const data: AssetResponse = await response.json()
      
      if (data.success && data.data.assets.available) {
        setState(prev => ({
          ...prev,
          assets: data.data.assets,
          isLoading: false,
          error: null
        }))
      } else {
        throw new Error('Assets not available')
      }
    } catch (error) {
      console.error('[CUSTOMIZER ERROR]', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [productId])

  // Handle material change with performance tracking
  const handleMaterialChange = useCallback((materialId: MaterialId) => {
    const switchStartTime = performance.now()
    
    setState(prev => ({
      ...prev,
      selectedMaterial: materialId,
      rotationState: {
        ...prev.rotationState,
        isRotating: false // Stop auto-rotation when switching materials
      }
    }))
    
    // Fetch new assets for the material
    fetchAssets(materialId)
    
    // CLAUDE_RULES: <100ms material switch requirement
    const switchTime = performance.now() - switchStartTime
    console.log(`[MATERIAL SWITCH] ${materialId}: ${switchTime.toFixed(2)}ms`)
    
    // Notify parent components
    if (currentMaterial && onVariantChange) {
      onVariantChange({
        materialId,
        price: 1500 + currentMaterial.priceModifier // Base price calculation
      })
    }
    
    if (currentMaterial && onPriceChange) {
      onPriceChange(1500 + currentMaterial.priceModifier)
    }
  }, [fetchAssets, currentMaterial, onVariantChange, onPriceChange])

  // Handle frame navigation
  const handleFrameChange = useCallback((frame: number) => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: Math.max(0, Math.min(frame, prev.rotationState.totalFrames - 1))
      }
    }))
  }, [])

  // Handle next frame
  const handleNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: (prev.rotationState.currentFrame + 1) % prev.rotationState.totalFrames
      }
    }))
  }, [])

  // Handle previous frame
  const handlePrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: prev.rotationState.currentFrame === 0 
          ? prev.rotationState.totalFrames - 1 
          : prev.rotationState.currentFrame - 1
      }
    }))
  }, [])

  // Handle auto-rotation toggle
  const handleAutoRotate = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        isRotating: enabled
      }
    }))
  }, [])

  // Initial asset loading
  useEffect(() => {
    fetchAssets(state.selectedMaterial)
  }, [fetchAssets, state.selectedMaterial])

  // CLAUDE_RULES: Error-first coding with clear recovery paths
  if (state.error) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center aspect-square bg-background/50 rounded-lg border border-border">
          <div className="text-center space-y-4 p-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">⚠️</div>
            </div>
            <div>
              <h3 className="font-headline text-lg text-foreground mb-2">
                Customizer Unavailable
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Unable to load 3D customization. Please try refreshing the page.
              </p>
            </div>
            <button 
              onClick={() => fetchAssets(state.selectedMaterial)}
              className="text-sm text-accent hover:text-accent/80"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main 3D viewer */}
      <div className="space-y-4">
        <ImageViewer
          assetPath={state.assets?.assetPaths[0] || ''}
          currentFrame={state.rotationState.currentFrame}
          totalFrames={state.rotationState.totalFrames}
          onFrameChange={handleFrameChange}
          isLoading={state.isLoading}
          error={state.error}
          className="mx-auto max-w-md"
        />
        
        {/* Viewer controls */}
        <ViewerControls
          currentFrame={state.rotationState.currentFrame}
          totalFrames={state.rotationState.totalFrames}
          onFrameChange={handleFrameChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onAutoRotate={handleAutoRotate}
          isAutoRotating={state.rotationState.isRotating}
        />
      </div>

      {/* Material selection */}
      <MaterialControls
        materials={AVAILABLE_MATERIALS}
        selectedMaterial={state.selectedMaterial}
        onMaterialChange={handleMaterialChange}
        isDisabled={state.isLoading}
      />

      {/* Current price display */}
      {currentMaterial && (
        <div className="bg-muted/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              {currentMaterial.displayName}
            </span>
            <span className="text-lg font-headline text-cta">
              ${(1500 + currentMaterial.priceModifier).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Lab-grown gems • Ethically sourced • Lifetime warranty
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductCustomizer