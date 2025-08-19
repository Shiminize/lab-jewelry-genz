'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'
import { SimpleImageViewer } from './SimpleImageViewer'
import { Dynamic3DViewer } from './Dynamic3DViewer'
import { detectDeviceCapabilities, shouldUsePremiumMode, type DeviceCapabilities } from '@/lib/device-capabilities'
import { performanceMonitor } from '@/lib/performance-monitor'

interface HybridViewerProps {
  imagePath: string
  modelPath?: string
  imageCount?: number
  material?: {
    metalness: number
    roughness: number
    color: string
  }
  className?: string
  forceMode?: 'sequences' | 'threejs'
  onModeChange?: (mode: 'sequences' | 'threejs') => void
  onLoad?: () => void
  onError?: (error: Error) => void
  onFrameChange?: (frame: number) => void
}

export function HybridViewer({
  imagePath,
  modelPath,
  imageCount = 36,
  material,
  className,
  forceMode,
  onModeChange,
  onLoad,
  onError,
  onFrameChange
}: HybridViewerProps) {
  const [currentMode, setCurrentMode] = useState<'sequences' | 'threejs'>('sequences')
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [isCapabilityDetectionDone, setIsCapabilityDetectionDone] = useState(false)
  const [showModeToggle, setShowModeToggle] = useState(false)
  const [switchingMode, setSwitchingMode] = useState(false)
  const [loadTimes, setLoadTimes] = useState<{ sequences: number; threejs: number }>({ sequences: 0, threejs: 0 })

  // Detect device capabilities on mount
  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        const caps = await detectDeviceCapabilities()
        
        setCapabilities(caps)
        
        // Determine initial mode
        if (forceMode) {
          setCurrentMode(forceMode)
        } else if (shouldUsePremiumMode(caps)) {
          setCurrentMode('threejs')
          setShowModeToggle(true)
        } else {
          setCurrentMode('sequences')
          // Show toggle for capable devices with 3D models
          setShowModeToggle(caps.tier === 'high' && caps.isDesktop && modelPath)
        }
        
        setIsCapabilityDetectionDone(true)
      } catch (error) {
        console.error('Failed to detect device capabilities:', error)
        setCurrentMode('sequences')
        setIsCapabilityDetectionDone(true)
      }
    }

    detectCapabilities()
  }, [forceMode, modelPath])

  // Handle mode switching
  const switchMode = useCallback(async (newMode: 'sequences' | 'threejs') => {
    if (newMode === currentMode || switchingMode) return
    
    setSwitchingMode(true)
    const startTime = performance.now()
    
    try {
      // Smooth transition
      await new Promise(resolve => setTimeout(resolve, 50))
      
      setCurrentMode(newMode)
      onModeChange?.(newMode)
      
      const switchTime = performance.now() - startTime
      console.log(`🔄 Mode switched to ${newMode} in ${switchTime.toFixed(1)}ms`)
      
      // Start performance tracking for new mode
      if (capabilities) {
        performanceMonitor.startTracking(newMode, capabilities.tier)
      }
      
    } finally {
      setTimeout(() => setSwitchingMode(false), 100)
    }
  }, [currentMode, switchingMode, onModeChange])

  // Handle load timing
  const handleSequencesLoad = useCallback(() => {
    if (currentMode === 'sequences') {
      const time = performance.now()
      setLoadTimes(prev => ({ ...prev, sequences: time }))
      onLoad?.()
    }
  }, [currentMode, onLoad])

  const handleThreeJSLoad = useCallback(() => {
    if (currentMode === 'threejs') {
      const time = performance.now()
      setLoadTimes(prev => ({ ...prev, threejs: time }))
      onLoad?.()
    }
  }, [currentMode, onLoad])

  // Capability detection loading state
  if (!isCapabilityDetectionDone) {
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center bg-background', className)}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <MutedText size="sm">Optimizing your experience...</MutedText>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn('relative w-full h-full', className)}
      role="img"
      aria-label={`Interactive 360° jewelry view - ${currentMode} mode`}
      tabIndex={0}
    >
      {/* Mode Switching Overlay */}
      {switchingMode && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <MutedText size="sm">Switching view...</MutedText>
          </div>
        </div>
      )}

      {/* Image Sequences Viewer */}
      {currentMode === 'sequences' && (
        <SimpleImageViewer
          imagePath={imagePath}
          imageCount={imageCount}
          onLoad={handleSequencesLoad}
          onError={onError}
          className="w-full h-full"
          onFrameChange={onFrameChange}
        />
      )}

      {/* Three.js Viewer - Dynamic Loading for Performance */}
      {currentMode === 'threejs' && modelPath && (
        <Dynamic3DViewer
          modelPath={modelPath}
          material={material || { metalness: 1.0, roughness: 0.1, color: '#ffffff' }}
          onLoad={handleThreeJSLoad}
          onError={(error) => {
            console.error('Three.js viewer failed, falling back to sequences:', error)
            switchMode('sequences')
            onError?.(error)
          }}
          autoRotate={false}
          className="w-full h-full"
        />
      )}


      {/* Mode Toggle Controls */}
      {showModeToggle && !switchingMode && (
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 border border-border shadow-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => switchMode('sequences')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all duration-200',
                  currentMode === 'sequences'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent/20'
                )}
              >
                360° View
              </button>
              <button
                onClick={() => switchMode('threejs')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all duration-200',
                  currentMode === 'threejs'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent/20'
                )}
                disabled={!modelPath}
              >
                Premium 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-30">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          <MutedText size="sm" className="text-accent font-medium">
            360° Interactive
          </MutedText>
        </div>
      </div>

      {/* Device Tier Indicator */}
      {capabilities && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
            <MutedText size="sm" className="text-gray-600">
              {capabilities.tier.charAt(0).toUpperCase() + capabilities.tier.slice(1)} Device
            </MutedText>
          </div>
        </div>
      )}

      {/* Screen Reader Content */}
      <div className="sr-only">
        <p>Interactive 360° jewelry viewer currently showing {currentMode} mode. Use arrow keys to rotate or drag to interact.</p>
      </div>
    </div>
  )
}