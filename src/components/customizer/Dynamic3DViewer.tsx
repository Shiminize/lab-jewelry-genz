'use client'

/**
 * Dynamic 3D Viewer - Optimized for Bundle Size
 * Loads Three.js components completely asynchronously to improve page load performance
 * Target: Reduce initial bundle by 500KB+ by moving Three.js to separate chunks
 */

import React, { lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'

// Dynamic import with chunk naming for webpack optimization and preloading
const ThreeJSViewerLazy = lazy(() => 
  import('./ThreeJSViewer' /* webpackChunkName: "three-js-viewer" */).then(module => ({
    default: module.ThreeJSViewer
  }))
)

// Preload Three.js chunk on hover/interaction for faster loading
let preloadPromise: Promise<any> | null = null
function preloadThreeJS() {
  if (!preloadPromise) {
    preloadPromise = import('./ThreeJSViewer' /* webpackChunkName: "three-js-viewer" */)
  }
  return preloadPromise
}

interface Dynamic3DViewerProps {
  modelPath: string
  material?: {
    metalness: number
    roughness: number
    color: string
  }
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  enableControls?: boolean
  autoRotate?: boolean
}

// Loading component optimized for 3D viewer
function ThreeJSLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-4 p-6">
        {/* Loading animation optimized for 3D context */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent/20 rounded-full animate-spin mx-auto" />
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" 
               style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        
        {/* Progressive loading messages */}
        <div className="space-y-2">
          <MutedText className="font-medium text-foreground">
            Loading Premium 3D Engine
          </MutedText>
          <MutedText size="sm" className="text-muted-foreground max-w-xs">
            Preparing WebGL renderer and materials...
          </MutedText>
        </div>
        
        {/* Visual enhancement for loading state */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-accent/70 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-accent/40 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  )
}

// Error boundary component for 3D viewer
function ThreeJSErrorFallback({ error, onRetry }: { error?: Error, onRetry?: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background/95">
      <div className="text-center space-y-4 p-6 max-w-md">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-destructive text-xl">⚠</span>
        </div>
        <MutedText className="font-medium text-foreground">
          3D Viewer Loading Failed
        </MutedText>
        <MutedText size="sm" className="text-muted-foreground">
          {error?.message || 'Failed to load 3D rendering engine'}
        </MutedText>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        )}
        <MutedText size="sm" className="text-accent">
          Falling back to image viewer...
        </MutedText>
      </div>
    </div>
  )
}

export function Dynamic3DViewer({
  modelPath,
  material = { metalness: 1.0, roughness: 0.1, color: '#ffffff' },
  className,
  onLoad,
  onError,
  onInteractionStart,
  onInteractionEnd,
  enableControls = true,
  autoRotate = false
}: Dynamic3DViewerProps) {
  const [hasErrored, setHasErrored] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const [isPreloaded, setIsPreloaded] = React.useState(false)

  // Preload Three.js on component mount for faster loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      preloadThreeJS().then(() => {
        setIsPreloaded(true)
      }).catch(console.error)
    }, 100) // Delay to not block initial render
    
    return () => clearTimeout(timer)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Dynamic 3D Viewer error:', error)
    setHasErrored(true)
    onError?.(error)
  }, [onError])

  const handleRetry = React.useCallback(() => {
    setHasErrored(false)
    setRetryCount(prev => prev + 1)
  }, [])

  // If errored, show error fallback
  if (hasErrored) {
    return (
      <div className={cn('relative w-full h-full', className)}>
        <ThreeJSErrorFallback error={new Error('3D engine failed to load')} onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      <Suspense fallback={<ThreeJSLoadingFallback />}>
        <ThreeJSViewerLazy
          key={retryCount} // Force remount on retry
          modelPath={modelPath}
          material={material}
          onLoad={onLoad}
          onError={handleError}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          enableControls={enableControls}
          autoRotate={autoRotate}
          className="w-full h-full"
        />
      </Suspense>
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-50">
          <div className="bg-background/95 backdrop-blur-sm rounded px-2 py-1 border border-accent/20">
            <MutedText size="sm" className="text-accent font-mono">
              Dynamic 3D {isPreloaded ? '(Preloaded)' : '(Loading...)'}
            </MutedText>
          </div>
        </div>
      )}
    </div>
  )
}

// Export additional optimization info for bundle analysis
export const componentInfo = {
  name: 'Dynamic3DViewer',
  chunkName: 'three-js-viewer',
  estimatedSize: '~500KB when loaded',
  fallbackSize: '~5KB initial',
  description: 'Dynamically loaded 3D viewer that reduces initial bundle size'
}