'use client'

/**
 * 3D Customizer Loading State Component
 * CLAUDE_RULES compliant loading states for 3D customization experience
 * Follows approved color combinations (lines 12-21) and Gen Z brand voice (lines 189-190)
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Progress } from './Progress'

const loadingVariants = cva(
  'flex flex-col items-center justify-center space-y-6 p-6 transition-all duration-300',
  {
    variants: {
      variant: {
        luxury: 'text-foreground bg-background border border-border', // Main content on ivory
        patience: 'text-foreground bg-muted border border-border', // Content on section backgrounds  
        recovery: 'text-foreground bg-background border border-border' // Content on cards/surfaces
      },
      size: {
        sm: 'min-h-[200px] max-w-sm',
        md: 'min-h-[300px] max-w-md', 
        lg: 'min-h-[400px] max-w-lg'
      }
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'md'
    }
  }
)

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-t-transparent',
  {
    variants: {
      variant: {
        luxury: 'border-accent', // Champagne gold
        patience: 'border-cta', // Coral gold
        recovery: 'border-foreground' // Graphite green
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
      }
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'md'
    }
  }
)

const messageVariants = cva(
  'text-center transition-opacity duration-500',
  {
    variants: {
      variant: {
        luxury: 'text-foreground', // Graphite green on ivory
        patience: 'text-foreground', // Graphite green on muted
        recovery: 'text-foreground' // Graphite green on white
      },
      size: {
        sm: 'space-y-token-sm',
        md: 'space-y-3',
        lg: 'space-y-token-md'
      }
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'md'
    }
  }
)

export interface CustomizerLoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  /** Loading progress from 0-1 */
  progress?: number
  /** Current loading message */
  message?: string
  /** Show loading tips and frame information */
  showTips?: boolean
  /** Total number of frames expected */
  frameCount?: number
  /** Currently loaded frames */
  loadedFrames?: number
  /** Estimated time remaining in seconds */
  estimatedTime?: number
  /** Custom loading tips */
  tips?: string[]
}

const defaultMessages = {
  initial: "Crafting your perfect view...",
  extended: "Our artisans are preparing each angle...",
  fallback: "We'll show you stunning angles while perfecting the rest"
}

const defaultTips = [
  "Pro tip: Rotate with your finger to see every angle",
  "Each piece is uniquely rendered for you",
  "Lab-grown diamonds shine just like natural ones",
  "Try different materials to find your perfect match"
]

export function CustomizerLoadingState({
  variant = 'luxury',
  size = 'md',
  progress = 0,
  message,
  showTips = false,
  frameCount = 36,
  loadedFrames = 0,
  estimatedTime,
  tips = defaultTips,
  className,
  ...props
}: CustomizerLoadingStateProps) {
  // Auto-generate message based on progress if none provided
  const displayMessage = message || (
    progress < 0.1 ? defaultMessages.initial :
    progress < 0.8 ? defaultMessages.extended :
    defaultMessages.fallback
  )

  // Calculate percentage for display
  const percentage = Math.round(progress * 100)
  
  // Get random tip for display
  const [currentTip] = React.useState(() => 
    tips[Math.floor(Math.random() * tips.length)]
  )

  return (
    <div 
      className={cn(loadingVariants({ variant, size, className }))}
      role="status"
      aria-live="polite"
      aria-label={`Loading: ${displayMessage}`}
      {...props}
    >
      {/* Loading Spinner */}
      <div 
        className={cn(spinnerVariants({ variant, size }))}
        aria-hidden="true"
      >
        <span className="sr-only">Loading</span>
      </div>

      {/* Loading Messages */}
      <div className={cn(messageVariants({ variant, size }))}>
        {/* Main Message */}
        <h3 className="font-headline text-xl font-semibold">
          {displayMessage}
        </h3>
        
        {/* Progress Information */}
        {(progress > 0 || loadedFrames > 0) && (
          <div className="space-y-3 w-full max-w-xs">
            {/* Progress Bar */}
            <Progress 
              value={progress * 100}
              max={100}
              variant={variant === 'luxury' ? 'accent' : 'default'}
              size="md"
              className="w-full"
              aria-label={`Loading progress: ${percentage}%`}
            />
            
            {/* Progress Details */}
            <div className="flex justify-between items-center text-sm text-aurora-nav-muted font-body">
              <span>{percentage}% complete</span>
              {estimatedTime && estimatedTime > 0 && (
                <span>{estimatedTime}s remaining</span>
              )}
            </div>
            
            {/* Frame Counter */}
            {frameCount > 0 && (
              <div className="text-sm text-aurora-nav-muted font-body text-center">
                {loadedFrames} of {frameCount} angles ready
              </div>
            )}
          </div>
        )}

        {/* Loading Tips */}
        {showTips && (
          <div className="mt-4 p-4 bg-muted border border-border max-w-sm">
            <p className="text-sm text-aurora-nav-muted font-body italic">
              {currentTip}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Touch Target Helper */}
      <div className="min-h-[44px] w-full" aria-hidden="true" />
    </div>
  )
}

export default CustomizerLoadingState