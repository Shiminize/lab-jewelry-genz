/**
 * ViewerControls - 3D Rotation and Navigation Controls
 * Single responsibility: Handle frame navigation and rotation controls
 * CLAUDE_RULES.md compliant with WCAG 2.1 AA accessibility
 */

'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ViewerControlsProps, EnhancedViewerControlsProps, TouchGestureState } from './types'
import { TouchGestureService, type GestureCallbacks } from '@/services/TouchGestureService'

// Enhanced ViewerControls with touch gesture support
export const EnhancedViewerControls: React.FC<EnhancedViewerControlsProps> = ({
  currentFrame,
  totalFrames,
  onFrameChange,
  onNext,
  onPrevious,
  onAutoRotate,
  isAutoRotating,
  className,
  enableTouchGestures = true,
  onTouchGesture,
  touchSensitivity = 1.0
}) => {
  // Touch gesture service integration
  const touchGestureService = useRef<TouchGestureService | null>(null)
  const touchContainerRef = useRef<HTMLDivElement>(null)
  const touchGestureState = useRef<TouchGestureState>({
    isActive: false,
    gestureType: null,
    velocity: { x: 0, y: 0 },
    scale: 1
  })
  const animationFrameRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  const rotationSpeed = useRef<number>(360 / 3600) // degrees per ms (360° in 3.6 seconds)
  
  // Momentum physics state
  const momentum = useRef<{
    velocity: number // frames per second
    isDecelerating: boolean
    lastMomentumTime: number
  }>({
    velocity: 0,
    isDecelerating: false,
    lastMomentumTime: 0
  })

  // Context-aware behavior state
  const contextualState = useRef<{
    userInteracting: boolean
    pauseTimeout: NodeJS.Timeout | null
    respectsReducedMotion: boolean
    lastInteractionTime: number
  }>({
    userInteracting: false,
    pauseTimeout: null,
    respectsReducedMotion: false,
    lastInteractionTime: 0
  })

  // Touch gesture callbacks - integrated with existing momentum system
  const touchGestureCallbacks: GestureCallbacks = {
    onPanStart: (position) => {
      handleUserInteraction()
      stopMomentum()
      touchGestureState.current = {
        isActive: true,
        gestureType: 'pan',
        velocity: { x: 0, y: 0 },
        scale: 1
      }
      onTouchGesture?.(touchGestureState.current)
    },

    onPanMove: (delta, velocity) => {
      // Convert horizontal pan delta to frame navigation
      const sensitivityAdjustedDelta = delta.x * touchSensitivity
      const frameChangeThreshold = 30 // pixels needed to advance one frame
      
      if (Math.abs(sensitivityAdjustedDelta) > frameChangeThreshold) {
        const framesToAdvance = Math.floor(Math.abs(sensitivityAdjustedDelta) / frameChangeThreshold)
        
        for (let i = 0; i < framesToAdvance; i++) {
          if (sensitivityAdjustedDelta > 0) {
            onNext()
          } else {
            onPrevious()
          }
        }
      }

      touchGestureState.current.velocity = velocity
      onTouchGesture?.(touchGestureState.current)
    },

    onPanEnd: (velocity) => {
      // Convert pan velocity to momentum rotation
      const velocityX = Math.abs(velocity.x) * touchSensitivity
      const momentumVelocity = Math.min(velocityX / 100, 10) // Convert px/s to frames/s, cap at 10fps
      
      if (momentumVelocity > 1) {
        startMomentum(momentumVelocity)
      }

      touchGestureState.current = {
        isActive: false,
        gestureType: null,
        velocity: { x: 0, y: 0 },
        scale: 1
      }
      onTouchGesture?.(touchGestureState.current)
    },

    onTap: (position) => {
      handleUserInteraction()
      // Single tap toggles auto-rotation
      onAutoRotate(!isAutoRotating)
      
      touchGestureState.current = {
        isActive: true,
        gestureType: 'tap',
        velocity: { x: 0, y: 0 },
        scale: 1
      }
      onTouchGesture?.(touchGestureState.current)
      
      // Reset after brief moment
      setTimeout(() => {
        touchGestureState.current = {
          isActive: false,
          gestureType: null,
          velocity: { x: 0, y: 0 },
          scale: 1
        }
        onTouchGesture?.(touchGestureState.current)
      }, 100)
    },

    onDoubleTap: (position) => {
      handleUserInteraction()
      // Double tap goes to front view (frame 0)
      onFrameChange(0)
      
      touchGestureState.current = {
        isActive: true,
        gestureType: 'tap',
        velocity: { x: 0, y: 0 },
        scale: 1
      }
      onTouchGesture?.(touchGestureState.current)
      
      setTimeout(() => {
        touchGestureState.current = {
          isActive: false,
          gestureType: null,
          velocity: { x: 0, y: 0 },
          scale: 1
        }
        onTouchGesture?.(touchGestureState.current)
      }, 100)
    },

    onPinchStart: (scale, center) => {
      handleUserInteraction()
      touchGestureState.current = {
        isActive: true,
        gestureType: 'pinch',
        velocity: { x: 0, y: 0 },
        scale: scale
      }
      onTouchGesture?.(touchGestureState.current)
    },

    onPinchMove: (scale, center) => {
      touchGestureState.current.scale = scale
      onTouchGesture?.(touchGestureState.current)
    },

    onPinchEnd: (finalScale) => {
      // Pinch gesture complete
      touchGestureState.current = {
        isActive: false,
        gestureType: null,
        velocity: { x: 0, y: 0 },
        scale: 1
      }
      onTouchGesture?.(touchGestureState.current)
    }
  }

  // Initialize touch gesture service
  useEffect(() => {
    if (enableTouchGestures && touchContainerRef.current) {
      touchGestureService.current = new TouchGestureService(touchGestureCallbacks)
      touchGestureService.current.attachToElement(touchContainerRef.current)
    }

    return () => {
      if (touchGestureService.current) {
        touchGestureService.current.destroy()
        touchGestureService.current = null
      }
    }
  }, [enableTouchGestures, touchSensitivity])

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = () => {
      contextualState.current.respectsReducedMotion = 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    
    checkReducedMotion()
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addListener(checkReducedMotion)
    
    return () => mediaQuery.removeListener(checkReducedMotion)
  }, [])

  // Handle user interaction context
  const handleUserInteraction = useCallback(() => {
    contextualState.current.userInteracting = true
    contextualState.current.lastInteractionTime = performance.now()
    
    // Clear existing pause timeout
    if (contextualState.current.pauseTimeout) {
      clearTimeout(contextualState.current.pauseTimeout)
    }
    
    // Set timeout to resume auto-rotation after 3 seconds of inactivity
    contextualState.current.pauseTimeout = setTimeout(() => {
      contextualState.current.userInteracting = false
      contextualState.current.pauseTimeout = null
    }, 3000)
  }, [])

  // Enhanced animation with auto-rotation and momentum physics
  const animate = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastFrameTime.current
    let shouldContinue = false
    
    // Respect reduced motion preference
    if (contextualState.current.respectsReducedMotion) {
      return
    }
    
    // Handle auto-rotation (pause if user is interacting)
    if (isAutoRotating && !momentum.current.isDecelerating && !contextualState.current.userInteracting) {
      // Update at 60fps intervals (~16.67ms)
      if (deltaTime >= 16.67) {
        const rotationDelta = deltaTime * rotationSpeed.current
        const frameDelta = (rotationDelta / 360) * totalFrames
        
        // Only advance frame if we've accumulated enough rotation
        if (frameDelta >= 1) {
          onNext()
          lastFrameTime.current = currentTime
        }
      }
      shouldContinue = true
    }
    
    // Handle momentum physics
    if (momentum.current.isDecelerating && momentum.current.velocity > 0) {
      const momentumDelta = currentTime - momentum.current.lastMomentumTime
      
      if (momentumDelta >= 16.67) { // 60fps
        const currentVelocity = momentum.current.velocity
        const deceleration = 0.95 // Deceleration factor (5% reduction per frame)
        
        // Apply momentum frame advance
        if (currentVelocity > 0.1) { // Minimum velocity threshold
          const frameAdvance = (currentVelocity * momentumDelta) / 1000
          
          if (frameAdvance >= 1) {
            const framesToAdvance = Math.floor(frameAdvance)
            for (let i = 0; i < framesToAdvance; i++) {
              onNext()
            }
            momentum.current.lastMomentumTime = currentTime
          }
          
          // Apply deceleration
          momentum.current.velocity *= deceleration
          shouldContinue = true
        } else {
          // Stop momentum when velocity is too low
          momentum.current.isDecelerating = false
          momentum.current.velocity = 0
        }
      } else {
        shouldContinue = true
      }
    }
    
    // Continue animation loop if needed
    if (shouldContinue) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [isAutoRotating, onNext, totalFrames])

  // Start momentum effect
  const startMomentum = useCallback((initialVelocity: number) => {
    momentum.current.velocity = Math.abs(initialVelocity)
    momentum.current.isDecelerating = true
    momentum.current.lastMomentumTime = performance.now()
    
    // Start animation if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  // Stop momentum
  const stopMomentum = useCallback(() => {
    momentum.current.isDecelerating = false
    momentum.current.velocity = 0
  }, [])

  // Enhanced button handlers with momentum and user interaction tracking
  const handleNextWithMomentum = useCallback(() => {
    handleUserInteraction() // Track user interaction for context-aware behavior
    stopMomentum()
    onNext()
    startMomentum(3) // Start with 3 frames/sec momentum
  }, [handleUserInteraction, onNext, startMomentum, stopMomentum])

  const handlePreviousWithMomentum = useCallback(() => {
    handleUserInteraction() // Track user interaction for context-aware behavior
    stopMomentum()
    onPrevious()
    startMomentum(3) // Start with 3 frames/sec momentum
  }, [handleUserInteraction, onPrevious, startMomentum, stopMomentum])

  // Auto-rotation effect with RAF and momentum support
  useEffect(() => {
    const shouldAnimate = isAutoRotating || momentum.current.isDecelerating
    
    if (shouldAnimate && !animationFrameRef.current) {
      lastFrameTime.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(animate)
    } else if (!shouldAnimate && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Clean up pause timeout on unmount
      if (contextualState.current.pauseTimeout) {
        clearTimeout(contextualState.current.pauseTimeout)
        contextualState.current.pauseTimeout = null
      }
    }
  }, [isAutoRotating, animate])

  // Keyboard navigation - CLAUDE_RULES: WCAG 2.1 AA compliance
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePreviousWithMomentum()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNextWithMomentum()
          break
        case 'Home':
          event.preventDefault()
          handleUserInteraction()
          onFrameChange(0)
          break
        case 'End':
          event.preventDefault()
          handleUserInteraction()
          onFrameChange(totalFrames - 1)
          break
        case ' ':
        case 'Space':
          event.preventDefault()
          handleUserInteraction()
          onAutoRotate(!isAutoRotating)
          break
        case 'Escape':
          event.preventDefault()
          handleUserInteraction()
          if (isAutoRotating) {
            onAutoRotate(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextWithMomentum, handlePreviousWithMomentum, handleUserInteraction, onFrameChange, onAutoRotate, isAutoRotating, totalFrames])

  return (
    <div 
      ref={touchContainerRef}
      className={cn("space-y-4", className)}
      style={{ 
        touchAction: enableTouchGestures ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Primary navigation buttons */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="md"
          onClick={handlePreviousWithMomentum}
          aria-label="Previous frame"
          className="w-12 h-12 rounded-full"
        >
          ←
        </Button>

        <Button
          variant={isAutoRotating ? "primary" : "ghost"}
          size="md"
          onClick={() => {
            handleUserInteraction()
            onAutoRotate(!isAutoRotating)
          }}
          aria-label={isAutoRotating ? "Stop auto-rotation" : "Start auto-rotation"}
          className="px-6"
        >
          {isAutoRotating ? "⏸️ Pause" : "▶️ Auto"}
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={handleNextWithMomentum}
          aria-label="Next frame"
          className="w-12 h-12 rounded-full"
        >
          →
        </Button>
      </div>

      {/* Invisible frame navigation for accessibility - touch/keyboard only */}
      <div className="sr-only">
        {/* Hidden clickable frame segments for keyboard navigation */}
        <div className="flex">
          {Array.from({ length: Math.min(totalFrames, 36) }).map((_, index) => {
            const frameIndex = Math.floor((index / 35) * (totalFrames - 1))
            return (
              <button
                key={index}
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:text-foreground focus:p-2 focus:rounded focus:shadow-lg"
                onClick={() => {
                  handleUserInteraction()
                  onFrameChange(frameIndex)
                }}
                aria-label={`Go to frame ${frameIndex + 1} of ${totalFrames}`}
              />
            )
          })}
        </div>
        
        {/* Hidden quick navigation for keyboard users */}
        <div className="flex gap-2">
          <button
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:text-foreground focus:px-3 focus:py-1 focus:rounded focus:shadow-lg"
            onClick={() => {
              handleUserInteraction()
              onFrameChange(0)
            }}
            aria-label="View front of jewelry"
          >
            Front View
          </button>
          <button
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:text-foreground focus:px-3 focus:py-1 focus:rounded focus:shadow-lg"
            onClick={() => {
              handleUserInteraction()
              onFrameChange(Math.floor(totalFrames / 4))
            }}
            aria-label="View side of jewelry"
          >
            Side View
          </button>
          <button
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:text-foreground focus:px-3 focus:py-1 focus:rounded focus:shadow-lg"
            onClick={() => {
              handleUserInteraction()
              onFrameChange(Math.floor(totalFrames / 2))
            }}
            aria-label="View back of jewelry"
          >
            Back View
          </button>
          <button
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:text-foreground focus:px-3 focus:py-1 focus:rounded focus:shadow-lg"
            onClick={() => {
              handleUserInteraction()
              onFrameChange(Math.floor((totalFrames * 3) / 4))
            }}
            aria-label="View other side of jewelry"
          >
            Other Side View
          </button>
        </div>
      </div>

      {/* WCAG 2.1 AA - Live region for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {isAutoRotating 
          ? `Auto-rotating, currently on frame ${currentFrame + 1} of ${totalFrames}` 
          : `Static view, frame ${currentFrame + 1} of ${totalFrames}`
        }
      </div>
    </div>
  )
}

// Original ViewerControls component (backward compatibility)
export const ViewerControls: React.FC<ViewerControlsProps> = (props) => {
  return <EnhancedViewerControls {...props} enableTouchGestures={true} />
}

export default EnhancedViewerControls