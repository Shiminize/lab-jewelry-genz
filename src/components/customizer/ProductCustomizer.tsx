/**
 * ProductCustomizer - Main 3D Customizer Container
 * Single responsibility: Orchestrate the 5-component architecture
 * CLAUDE_RULES.md compliant with system health-driven implementation
 */

'use client'

import React, { useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import ImageViewer from './ImageViewer'
import { useCustomizationState } from '@/hooks/useCustomizationState'
import type { UseCustomizationStateOptions } from '@/hooks/useCustomizationState'

// Performance: Re-enable dynamic imports for better code splitting
const MaterialControls = dynamic(() => import('./MaterialControls'), {
  loading: () => <div className="animate-pulse h-16 bg-muted/20 rounded-token-lg" />
})

const MaterialCarousel = dynamic(() => import('@/components/ui/MaterialCarousel').then(mod => ({ default: mod.MaterialCarousel })), {
  loading: () => <div className="animate-pulse h-20 bg-muted/20 rounded-token-lg" />
})

const MaterialStatusBar = dynamic(() => import('./MaterialStatusBar').then(mod => ({ default: mod.MaterialStatusBar })), {
  loading: () => <div className="animate-pulse h-8 bg-muted/20 rounded-token-lg" />
})

import type { ProductCustomizerProps } from './types'
import type { MaterialSelection } from './MaterialStatusBar'

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
  // Use unified customization state hook (replaces all duplicate logic)
  const { state, actions, isPending } = useCustomizationState({
    productId,
    initialMaterialId,
    onVariantChange,
    onPriceChange,
    enableServerValidation: !previewOnly // Disable server validation for preview mode
  })

  // Performance: Memoized current material to prevent unnecessary re-renders  
  const currentMaterial = useMemo(
    () => state.materials.find(m => m.id === state.selectedMaterial),
    [state.materials, state.selectedMaterial]
  )

  // Material selection for status bar
  const materialSelection: MaterialSelection = useMemo(() => ({
    metal: currentMaterial?.displayName || '18K Rose Gold',
    stone: 'Lab-Grown Diamond', // Static for CLAUDE_RULES material-only focus
    style: 'Classic' // Static for now, can be dynamic later
  }), [currentMaterial?.displayName])

  // CLAUDE_RULES: Error-first coding with clear recovery paths
  if (state.error) {
    return (
      <div className={cn("space-y-token-lg", className)}>
        <div className="flex items-center justify-center aspect-square bg-background/50 rounded-token-lg border border-border">
          <div className="text-center space-y-token-md p-token-xl">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">⚠️</div>
            </div>
            <div>
              <h3 className="font-headline text-lg text-foreground mb-token-sm">
                Customizer Unavailable
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Unable to load 3D customization. Please try refreshing the page.
              </p>
            </div>
            <button 
              onClick={() => actions.refreshAssets()}
              className="text-sm text-emerald-flash hover:text-emerald-flash/80"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(showControls ? "space-y-token-lg" : "space-y-0", className)}>
      {/* React 18 Concurrent Loading Indicator */}
      {isPending && (
        <div className="fixed top-token-md right-token-md z-50 bg-primary/10 backdrop-blur-sm rounded-full px-token-sm py-token-sm flex items-center gap-token-sm">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-primary">Switching material...</span>
        </div>
      )}
      
      {/* Main 3D viewer */}
      <div className="space-y-token-md">
        <ImageViewer
          assetPath={state.assets?.assetPaths[0] || ''}
          currentFrame={state.rotationState.currentFrame}
          totalFrames={state.rotationState.totalFrames}
          onFrameChange={actions.setFrame}
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
          {/* Material selection - Responsive components */}
          <div className="lg:hidden">
            <MaterialCarousel
              materials={state.materials}
              selectedMaterial={state.selectedMaterial}
              onMaterialChange={actions.changeMaterial}
              isDisabled={state.isLoading || isPending}
              enableTouchGestures={true}
              showScrollIndicators={true}
              itemWidth="md"
              layout="horizontal"
            />
          </div>
          
          <div className="hidden lg:block">
            <MaterialControls
              materials={state.materials}
              selectedMaterial={state.selectedMaterial}
              onMaterialChange={actions.changeMaterial}
              isDisabled={state.isLoading || isPending}
            />
          </div>

          {/* Price display removed for minimalist design */}
        </>
      )}

    </div>
  )
}

export default ProductCustomizer