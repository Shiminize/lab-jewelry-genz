'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { BodyText, MutedText } from '@/components/foundation/Typography'

interface MobileTouchControlsProps {
  onRotateLeft?: () => void
  onRotateRight?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onReset?: () => void
  className?: string
}

export function MobileTouchControls({
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onReset,
  className
}: MobileTouchControlsProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Show instructions on first load for mobile users
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('glowglitch-touch-instructions')
    const isMobile = window.innerWidth < 768
    
    if (!hasSeenInstructions && isMobile) {
      setShowInstructions(true)
    }
  }, [])

  const handleDismissInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('glowglitch-touch-instructions', 'true')
  }

  const handleControlAction = (action: (() => void) | undefined) => {
    if (action) {
      action()
      setHasInteracted(true)
    }
  }

  const InstructionsOverlay = () => (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-sm w-full animate-scale-in">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <BodyText className="font-semibold text-foreground mb-2">
              Touch Controls
            </BodyText>
            <MutedText size="sm">
              Use these gestures to explore your jewelry
            </MutedText>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <div>
                <BodyText className="text-sm font-medium text-foreground">
                  Swipe to rotate
                </BodyText>
                <MutedText size="sm">
                  Drag left or right to spin your jewelry
                </MutedText>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              <div>
                <BodyText className="text-sm font-medium text-foreground">
                  Pinch to zoom
                </BodyText>
                <MutedText size="sm">
                  Pinch in/out to see every detail
                </MutedText>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <BodyText className="text-sm font-medium text-foreground">
                  Tap to select
                </BodyText>
                <MutedText size="sm">
                  Touch any option to customize
                </MutedText>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDismissInstructions}
            variant="primary"
            className="w-full mt-6"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn('md:hidden', className)}>
        {/* Floating control buttons */}
        <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-40">
          <Button
            onClick={() => handleControlAction(onZoomIn)}
            variant="secondary"
            size="icon"
            className="bg-background/90 backdrop-blur-sm border border-border shadow-lg"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM15 10l-3 3-3-3" />
            </svg>
          </Button>

          <Button
            onClick={() => handleControlAction(onZoomOut)}
            variant="secondary"
            size="icon"
            className="bg-background/90 backdrop-blur-sm border border-border shadow-lg"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM9 10h6" />
            </svg>
          </Button>

          <Button
            onClick={() => handleControlAction(onReset)}
            variant="secondary"
            size="icon"
            className="bg-background/90 backdrop-blur-sm border border-border shadow-lg"
            aria-label="Reset view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {/* Bottom control bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-30">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => handleControlAction(onRotateLeft)}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1"
              aria-label="Rotate left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <MutedText size="sm" className="text-xs">
                Rotate
              </MutedText>
            </Button>

            <div className="flex-1 text-center">
              <MutedText size="sm">
                Swipe to explore, tap to personalize
              </MutedText>
            </div>

            <Button
              onClick={() => handleControlAction(onRotateRight)}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1"
              aria-label="Rotate right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
              <MutedText size="sm" className="text-xs">
                Rotate
              </MutedText>
            </Button>
          </div>
        </div>

        {/* Help button */}
        <Button
          onClick={() => setShowInstructions(true)}
          variant="ghost"
          size="icon"
          className="fixed top-20 right-4 bg-background/90 backdrop-blur-sm border border-border shadow-lg z-40"
          aria-label="Show touch controls help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      </div>

      {/* Instructions overlay */}
      {showInstructions && <InstructionsOverlay />}

      {/* First-time user hint (shows once) */}
      {!hasInteracted && !showInstructions && (
        <div className="md:hidden fixed bottom-32 left-4 right-4 bg-accent text-foreground px-4 py-3 rounded-lg shadow-lg animate-fade-in z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <BodyText className="text-sm font-medium">
                Pinch to zoom, tap to select
              </BodyText>
            </div>
            <button
              onClick={() => setHasInteracted(true)}
              className="p-1 rounded-full hover:bg-background/20 transition-colors"
              aria-label="Dismiss hint"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}