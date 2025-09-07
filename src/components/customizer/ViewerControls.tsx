/**
 * ViewerControls - Basic 3D Navigation Controls
 * Single responsibility: Handle frame navigation and rotation controls  
 * CLAUDE_RULES.md compliant - under 300 lines, simple implementation
 * Refactored from 536-line over-engineered version
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ViewerControlsProps } from './types'

export interface SimpleViewerControlsProps {
  currentFrame: number
  totalFrames: number
  onFrameChange: (frame: number) => void
  onNext: () => void
  onPrevious: () => void
  onAutoRotate?: (enabled: boolean) => void
  isAutoRotating?: boolean
  className?: string
  showFrameIndicator?: boolean
  controlsPosition?: 'top' | 'bottom' | 'sides'
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  currentFrame,
  totalFrames,
  onFrameChange,
  onNext,
  onPrevious,
  onAutoRotate,
  isAutoRotating = false,
  className,
  showFrameIndicator = true,
  controlsPosition = 'bottom'
}) => {
  // Quick navigation helpers
  const goToFrame = (frame: number) => {
    const clampedFrame = Math.max(0, Math.min(frame, totalFrames - 1))
    onFrameChange(clampedFrame)
  }

  const goToFront = () => goToFrame(0)
  const goToBack = () => goToFrame(Math.floor(totalFrames / 2))
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        onPrevious()
        break
      case 'ArrowRight':
        e.preventDefault()
        onNext()
        break
      case ' ':
        e.preventDefault()
        onAutoRotate?.(!isAutoRotating)
        break
    }
  }

  const controlsClasses = cn(
    "flex items-center justify-center gap-token-sm",
    controlsPosition === 'sides' && "absolute inset-y-0 w-full pointer-events-none",
    controlsPosition !== 'sides' && "w-full",
    className
  )

  return (
    <div 
      className={controlsClasses}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="toolbar"
      aria-label="3D viewer controls"
    >
      {controlsPosition === 'sides' ? (
        // Side controls layout
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="absolute left-token-sm top-1/2 -translate-y-1/2 pointer-events-auto bg-background/80 backdrop-blur-sm"
            aria-label="Previous view"
          >
            ←
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="absolute right-token-sm top-1/2 -translate-y-1/2 pointer-events-auto bg-background/80 backdrop-blur-sm"
            aria-label="Next view"
          >
            →
          </Button>
        </>
      ) : (
        // Bottom/Top controls layout
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            aria-label="Previous view"
          >
            ← Prev
          </Button>
          
          {showFrameIndicator && (
            <div className="flex items-center gap-token-sm text-sm text-muted-foreground">
              <span>{currentFrame + 1} / {totalFrames}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            aria-label="Next view"
          >
            Next →
          </Button>
          
          {onAutoRotate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAutoRotate(!isAutoRotating)}
              className={isAutoRotating ? "text-emerald-flash" : ""}
              aria-label={isAutoRotating ? "Stop rotation" : "Start rotation"}
            >
              {isAutoRotating ? "⏸️" : "▶️"}
            </Button>
          )}
        </>
      )}

      {/* Quick navigation shortcuts */}
      <div className="hidden md:flex items-center gap-token-xs ml-token-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToFront}
          className="text-xs"
        >
          Front
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToBack}
          className="text-xs"
        >
          Back
        </Button>
      </div>

      {/* Accessibility live region */}
      <div 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {isAutoRotating 
          ? `Auto-rotating, frame ${currentFrame + 1} of ${totalFrames}` 
          : `Frame ${currentFrame + 1} of ${totalFrames}`
        }
      </div>
    </div>
  )
}

// Enhanced ViewerControls with same interface for backward compatibility
export const EnhancedViewerControls: React.FC<ViewerControlsProps> = (props) => {
  return <ViewerControls {...props} />
}

// Default export
export default ViewerControls