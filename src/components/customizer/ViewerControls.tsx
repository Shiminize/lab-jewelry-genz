/**
 * ViewerControls - 3D Rotation and Navigation Controls
 * Single responsibility: Handle frame navigation and rotation controls
 * CLAUDE_RULES.md compliant with WCAG 2.1 AA accessibility
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ViewerControlsProps } from './types'

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  currentFrame,
  totalFrames,
  onFrameChange,
  onNext,
  onPrevious,
  onAutoRotate,
  isAutoRotating,
  className
}) => {
  const autoRotateInterval = useRef<NodeJS.Timeout>()

  // Auto-rotation logic
  useEffect(() => {
    if (isAutoRotating) {
      autoRotateInterval.current = setInterval(() => {
        onNext()
      }, 100) // 100ms per frame for smooth rotation
    } else {
      if (autoRotateInterval.current) {
        clearInterval(autoRotateInterval.current)
      }
    }

    return () => {
      if (autoRotateInterval.current) {
        clearInterval(autoRotateInterval.current)
      }
    }
  }, [isAutoRotating, onNext])

  // Keyboard navigation - CLAUDE_RULES: WCAG 2.1 AA compliance
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          onPrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          onNext()
          break
        case 'Home':
          event.preventDefault()
          onFrameChange(0)
          break
        case 'End':
          event.preventDefault()
          onFrameChange(totalFrames - 1)
          break
        case ' ':
        case 'Space':
          event.preventDefault()
          onAutoRotate(!isAutoRotating)
          break
        case 'Escape':
          event.preventDefault()
          if (isAutoRotating) {
            onAutoRotate(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onPrevious, onFrameChange, onAutoRotate, isAutoRotating, totalFrames])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Rotation controls header */}
      <div>
        <h4 className="font-medium text-foreground mb-2">360° View Controls</h4>
        <p className="text-sm text-muted-foreground">
          Rotate to see every angle
        </p>
      </div>

      {/* Primary navigation buttons */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="md"
          onClick={onPrevious}
          aria-label="Previous frame"
          className="w-12 h-12 rounded-full"
        >
          ←
        </Button>

        <Button
          variant={isAutoRotating ? "primary" : "ghost"}
          size="md"
          onClick={() => onAutoRotate(!isAutoRotating)}
          aria-label={isAutoRotating ? "Stop auto-rotation" : "Start auto-rotation"}
          className="px-6"
        >
          {isAutoRotating ? "⏸️ Pause" : "▶️ Auto"}
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onNext}
          aria-label="Next frame"
          className="w-12 h-12 rounded-full"
        >
          →
        </Button>
      </div>

      {/* Frame progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Frame {currentFrame + 1}</span>
          <span>of {totalFrames}</span>
        </div>
        
        {/* Progress bar */}
        <div className="relative">
          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-200 ease-out"
              style={{ 
                width: `${((currentFrame + 1) / totalFrames) * 100}%`
              }}
              aria-hidden="true"
            />
          </div>
          
          {/* Clickable frame segments for direct navigation */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.min(totalFrames, 36) }).map((_, index) => {
              const frameIndex = Math.floor((index / 35) * (totalFrames - 1))
              return (
                <button
                  key={index}
                  className="flex-1 h-full opacity-0 hover:opacity-20 hover:bg-cta transition-opacity"
                  onClick={() => onFrameChange(frameIndex)}
                  aria-label={`Go to frame ${frameIndex + 1}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick navigation shortcuts */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFrameChange(0)}
          className="text-xs"
        >
          Front
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFrameChange(Math.floor(totalFrames / 4))}
          className="text-xs"
        >
          Side
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFrameChange(Math.floor(totalFrames / 2))}
          className="text-xs"
        >
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFrameChange(Math.floor((totalFrames * 3) / 4))}
          className="text-xs"
        >
          Side
        </Button>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/10 rounded">
        <div className="font-medium mb-1">Keyboard shortcuts:</div>
        <div className="space-y-0.5">
          <div>← → Arrow keys: Rotate</div>
          <div>Space: Auto-rotate</div>
          <div>Home/End: First/Last frame</div>
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

export default ViewerControls