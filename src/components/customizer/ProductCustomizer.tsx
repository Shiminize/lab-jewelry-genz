/**
 * ProductCustomizer - Main 3D Customizer Container
 * Single responsibility: Orchestrate the 5-component architecture
 * CLAUDE_RULES.md compliant with system health-driven implementation
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo, useTransition, useDeferredValue, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import ImageViewer from './ImageViewer'
import { assetCache } from '@/services/AssetCacheService'

// PHASE 2: Dynamic imports for bundle optimization
const MaterialControls = dynamic(() => import('./MaterialControls'), {
  loading: () => <div className="animate-pulse h-16 bg-muted/20 rounded-lg" />
})

const MaterialCarousel = dynamic(() => import('@/components/ui/MaterialCarousel'), {
  loading: () => <div className="animate-pulse h-20 bg-muted/20 rounded-lg" />
})

const MaterialStatusBar = dynamic(() => import('./MaterialStatusBar').then(mod => ({ default: mod.MaterialStatusBar })), {
  loading: () => <div className="animate-pulse h-8 bg-muted/20 rounded-lg" />
})

import type { 
  ProductCustomizerProps, 
  CustomizerState, 
  Material, 
  MaterialId,
  AssetResponse 
} from './types'
import type { MaterialSelection } from './MaterialStatusBar'

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
  className,
  layout = 'traditional',
  controlsPosition = 'bottom',
  showFrameIndicator = false,
  showControls = true,
  showStatusBar = false,
  previewOnly = false,
  useBridgeService = false,
  useOptimizedViewer = false,
  autoRotate = false
}) => {
  // React 18 Concurrent Features - CLAUDE_RULES: <100ms material switching
  const [isPending, startTransition] = useTransition()
  const [materialIdState, setMaterialIdState] = useState(initialMaterialId)
  const deferredMaterialId = useDeferredValue(materialIdState)
  
  // Centralized state management - single source of truth
  const [state, setState] = useState<CustomizerState>({
    product: null,
    selectedMaterial: deferredMaterialId,
    rotationState: {
      currentFrame: 0,
      isRotating: false,
      totalFrames: 36
    },
    assets: null,
    isLoading: true,
    error: null
  })

  // Status bar visibility state
  const [statusBarVisible, setStatusBarVisible] = useState(showStatusBar)

  // Memoized current material to prevent unnecessary re-renders
  const currentMaterial = useMemo(
    () => AVAILABLE_MATERIALS.find(m => m.id === state.selectedMaterial),
    [state.selectedMaterial]
  )

  // Material selection for status bar
  const materialSelection: MaterialSelection = useMemo(() => ({
    metal: currentMaterial?.displayName || '18K Rose Gold',
    stone: 'Lab-Grown Diamond', // Static for CLAUDE_RULES material-only focus
    style: 'Classic' // Static for now, can be dynamic later
  }), [currentMaterial?.displayName])

  // Optimized asset fetching with cache
  const fetchAssets = useCallback(async (materialId: MaterialId, useCache: boolean = true) => {
    try {
      // Check cache first for <90ms performance
      if (useCache) {
        const cachedAsset = assetCache.getCachedAsset(productId, materialId)
        if (cachedAsset) {
          setState(prev => ({
            ...prev,
            assets: { 
              available: true, 
              assetPaths: cachedAsset.assetPaths 
            },
            isLoading: false,
            error: null
          }))
          console.log(`[CACHE HIT] ${materialId} loaded from cache`)
          return
        }
      }
      
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

  // React 18 Concurrent Features - Non-blocking material changes
  const handleMaterialChange = useCallback(async (materialId: MaterialId) => {
    const switchStartTime = performance.now()
    
    // Start concurrent transition for non-blocking UI updates
    startTransition(() => {
      setMaterialIdState(materialId)
    })
    
    // Immediate UI feedback - keep UI responsive
    setState(prev => ({
      ...prev,
      selectedMaterial: materialId,
      rotationState: {
        ...prev.rotationState,
        isRotating: false // Stop auto-rotation when switching materials
      }
    }))
    
    // Update price immediately for optimistic feedback
    const newMaterial = AVAILABLE_MATERIALS.find(m => m.id === materialId)
    if (newMaterial) {
      const newPrice = 1500 + newMaterial.priceModifier
      if (onVariantChange) {
        onVariantChange({ materialId, price: newPrice })
      }
      if (onPriceChange) {
        onPriceChange(newPrice)
      }
    }
    
    // Check cache first for instant loading
    const cachedAsset = assetCache.getCachedAsset(productId, materialId)
    if (cachedAsset) {
      setState(prev => ({
        ...prev,
        assets: { 
          available: true, 
          assetPaths: cachedAsset.assetPaths 
        },
        isLoading: false,
        error: null
      }))
      
      const switchTime = performance.now() - switchStartTime
      console.log(`[MATERIAL SWITCH CACHED] ${materialId}: ${switchTime.toFixed(2)}ms`)
      return
    }
    
    // Fallback to fetching if not cached
    await fetchAssets(materialId, false)
    
    const switchTime = performance.now() - switchStartTime
    console.log(`[MATERIAL SWITCH FETCHED] ${materialId}: ${switchTime.toFixed(2)}ms`)
  }, [productId, onVariantChange, onPriceChange, fetchAssets])

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

  // Initial asset loading with prefetching for performance
  useEffect(() => {
    const initializeAssets = async () => {
      // Load initial material first
      await fetchAssets(state.selectedMaterial)
      
      // Pre-fetch all other materials in background for <90ms switching
      const otherMaterials = AVAILABLE_MATERIALS
        .map(m => m.id)
        .filter(id => id !== state.selectedMaterial)
      
      // Pre-fetch with high priority for critical performance
      if (otherMaterials.length > 0) {
        assetCache.prefetchMaterials(productId, otherMaterials, 'high')
          .then(() => {
            console.log(`[PREFETCH COMPLETE] Cached ${otherMaterials.length} materials for instant switching`)
          })
          .catch(error => {
            console.warn('[PREFETCH WARNING] Some materials failed to cache:', error)
          })
      }
    }
    
    initializeAssets()
  }, [fetchAssets, productId, state.selectedMaterial])

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
    <div className={cn(showControls ? "space-y-6" : "space-y-0", className)}>
      {/* React 18 Concurrent Loading Indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 z-50 bg-primary/10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-primary">Switching material...</span>
        </div>
      )}
      
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
          showFrameIndicator={false} // Always false for minimalist design
          enableTouchGestures={true}
          touchFeedback="subtle"
          autoRotate={autoRotate}
        />
      </div>

      {/* Material selection - Only show when controls are enabled */}
      {showControls && (
        <>
          {/* Material selection with Suspense boundaries - Dynamic component based on screen size */}
          <div className="lg:hidden">
            <Suspense fallback={<div className="animate-pulse h-20 bg-muted/20 rounded-lg" />}>
              <MaterialCarousel
                materials={AVAILABLE_MATERIALS}
                selectedMaterial={state.selectedMaterial}
                onMaterialChange={handleMaterialChange}
                isDisabled={state.isLoading || isPending}
                enableTouchGestures={true}
                showScrollIndicators={true}
                itemWidth="md"
                layout="horizontal"
              />
            </Suspense>
          </div>
          
          <div className="hidden lg:block">
            <Suspense fallback={<div className="animate-pulse h-16 bg-muted/20 rounded-lg" />}>
              <MaterialControls
                materials={AVAILABLE_MATERIALS}
                selectedMaterial={state.selectedMaterial}
                onMaterialChange={handleMaterialChange}
                isDisabled={state.isLoading || isPending}
              />
            </Suspense>
          </div>

          {/* Price display removed for minimalist design */}
        </>
      )}

    </div>
  )
}

export default ProductCustomizer