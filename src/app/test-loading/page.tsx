'use client'

/**
 * Test Page: 3D Customizer Loading States
 * Demonstrates all loading state variants for the 3D customizer
 */

import React, { useState, useEffect } from 'react'
import { CustomizerLoadingState } from '@/components/ui/CustomizerLoadingState'
import { Button } from '@/components/ui/Button'

export default function TestLoadingPage() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'initial' | 'extended' | 'recovery'>('initial')
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-animate progress
  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          setIsAnimating(false)
          return 1
        }
        return prev + 0.02
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isAnimating])

  // Auto-change phase based on progress
  useEffect(() => {
    if (progress < 0.1) {
      setPhase('initial')
    } else if (progress < 0.8) {
      setPhase('extended')
    } else {
      setPhase('recovery')
    }
  }, [progress])

  const resetAnimation = () => {
    setProgress(0)
    setPhase('initial')
    setIsAnimating(true)
  }

  const frameCount = 36
  const loadedFrames = Math.floor(progress * frameCount)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-headline text-3xl text-foreground">
            3D Customizer Loading States Demo
          </h1>
          <p className="font-body text-aurora-nav-muted bg-background">
            Interactive demonstration of CLAUDE_RULES compliant loading components
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="primary" 
            onClick={resetAnimation}
            disabled={isAnimating}
          >
            Start Animation
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? 'Pause' : 'Resume'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {setProgress(0); setIsAnimating(false)}}
          >
            Reset
          </Button>
        </div>

        {/* Progress Info */}
        <div className="text-center space-y-2">
          <div className="font-body text-sm text-aurora-nav-muted bg-background">
            Current Phase: <span className="font-semibold text-foreground">{phase}</span>
          </div>
          <div className="font-body text-sm text-aurora-nav-muted bg-background">
            Progress: <span className="font-semibold text-foreground">{Math.round(progress * 100)}%</span>
          </div>
          <div className="font-body text-sm text-aurora-nav-muted bg-background">
            Frames: <span className="font-semibold text-foreground">{loadedFrames}/{frameCount}</span>
          </div>
        </div>

        {/* Main Loading Component */}
        <div className="flex justify-center">
          <CustomizerLoadingState
            variant={phase === 'initial' ? 'luxury' : phase === 'extended' ? 'patience' : 'recovery'}
            size="lg"
            progress={progress}
            showTips={phase !== 'recovery'}
            frameCount={frameCount}
            loadedFrames={loadedFrames}
            estimatedTime={progress > 0 && progress < 1 ? Math.ceil((1 - progress) * 8) : 0}
          />
        </div>

        {/* Variant Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="space-y-4">
            <h3 className="font-headline text-xl text-foreground text-center">Luxury Variant</h3>
            <CustomizerLoadingState
              variant="luxury"
              size="sm"
              progress={0.3}
              showTips={false}
              frameCount={24}
              loadedFrames={7}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-xl text-foreground text-center">Patience Variant</h3>
            <CustomizerLoadingState
              variant="patience"
              size="sm"
              progress={0.6}
              showTips={false}
              frameCount={24}
              loadedFrames={14}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-xl text-foreground text-center">Recovery Variant</h3>
            <CustomizerLoadingState
              variant="recovery"
              size="sm"
              progress={0.9}
              showTips={false}
              frameCount={24}
              loadedFrames={22}
            />
          </div>
        </div>

        {/* CLAUDE_RULES Compliance Info */}
        <div className="mt-12 p-6 bg-muted rounded-lg border border-border">
          <h3 className="font-headline text-lg text-foreground mb-4">
            CLAUDE_RULES Compliance Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body text-sm text-aurora-nav-muted bg-muted">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Design System</h4>
              <ul className="space-y-1">
                <li>✅ Only approved color combinations used</li>
                <li>✅ CVA variant system implemented</li>
                <li>✅ Mobile-first responsive design</li>
                <li>✅ 44px minimum touch targets</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Accessibility</h4>
              <ul className="space-y-1">
                <li>✅ ARIA labels and live regions</li>
                <li>✅ Screen reader announcements</li>
                <li>✅ 4.5:1 contrast ratios maintained</li>
                <li>✅ Keyboard navigation support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}