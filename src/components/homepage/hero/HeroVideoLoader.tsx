/**
 * HeroVideoLoader Component
 * Aurora Design System - Batch 4 Migration
 * Extracted from HeroSection.tsx for Claude Rules compliance
 * Handles video loading states, progress indicators, and error handling
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

// Aurora-compliant CVA variants for loading states
const loaderContainerVariants = cva(
  'absolute inset-0 flex items-center justify-center backdrop-blur-sm',
  {
    variants: {
      style: {
        aurora: 'bg-gradient-to-br from-foreground to-foreground/80',
        minimal: 'bg-background/90',
        dark: 'bg-black/80'
      },
      visibility: {
        visible: 'opacity-100 z-30',
        hidden: 'opacity-0 pointer-events-none z-0'
      }
    },
    defaultVariants: {
      style: 'aurora',
      visibility: 'hidden'
    }
  }
)

const spinnerVariants = cva(
  'border-4 border-transparent rounded-full',
  {
    variants: {
      size: {
        small: 'w-16 h-16',
        medium: 'w-24 h-24',
        large: 'w-32 h-32'
      },
      style: {
        aurora: 'bg-gradient-to-r from-accent to-aurora-nav-muted',
        minimal: 'border-accent',
        gradient: 'bg-gradient-to-r from-accent via-aurora-nav-muted to-accent-secondary'
      }
    },
    defaultVariants: {
      size: 'large',
      style: 'aurora'
    }
  }
)

const progressBarVariants = cva(
  'h-3 rounded-full overflow-hidden border',
  {
    variants: {
      width: {
        small: 'w-48',
        medium: 'w-64',
        large: 'w-80'
      },
      style: {
        aurora: 'bg-background/10 border-high-contrast/20',
        minimal: 'bg-muted border-border',
        gradient: 'bg-gradient-to-r from-muted/20 to-muted/40 border-accent/30'
      }
    },
    defaultVariants: {
      width: 'medium',
      style: 'aurora'
    }
  }
)

const progressFillVariants = cva(
  'h-full transition-all duration-300',
  {
    variants: {
      style: {
        aurora: 'bg-gradient-to-r from-accent to-aurora-nav-muted',
        minimal: 'bg-accent',
        gradient: 'bg-gradient-to-r from-accent via-aurora-nav-muted to-accent-secondary'
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        glow: 'animate-aurora-glow'
      }
    },
    defaultVariants: {
      style: 'aurora',
      animation: 'none'
    }
  }
)

interface HeroVideoLoaderProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderContainerVariants>,
    VariantProps<typeof spinnerVariants>,
    VariantProps<typeof progressBarVariants> {
  /** Loading progress percentage (0-100) */
  progress: number
  /** Whether loader is visible */
  isVisible: boolean
  /** Custom loading message */
  loadingMessage?: string
  /** Show progress percentage */
  showPercentage?: boolean
  /** Show progress bar */
  showProgressBar?: boolean
  /** Enable loading animations */
  enableAnimations?: boolean
  /** Error state */
  hasError?: boolean
  /** Error message */
  errorMessage?: string
}

export function HeroVideoLoader({
  progress = 0,
  isVisible = false,
  loadingMessage = "Preparing Aurora Experience...",
  showPercentage = true,
  showProgressBar = true,
  enableAnimations = true,
  hasError = false,
  errorMessage = "Loading failed, using fallback content",
  style: containerStyle,
  visibility,
  style: spinnerStyle,
  size: spinnerSize,
  width: progressWidth,
  style: progressStyle,
  className,
  ...props
}: HeroVideoLoaderProps) {
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1,
      transition: { duration: 0.4 }
    }
  }

  const spinnerAnimation = {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  if (hasError) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              loaderContainerVariants({ 
                style: 'dark', 
                visibility: isVisible ? 'visible' : 'hidden' 
              }), 
              className
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            {...props}
          >
            <div className="flex flex-col items-center space-y-token-lg text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-xl font-bold">!</span>
                </div>
              </div>
              
              {/* Error Message */}
              <div className="text-white font-body text-lg">
                {errorMessage}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            loaderContainerVariants({ 
              style: containerStyle, 
              visibility: isVisible ? 'visible' : 'hidden' 
            }), 
            className
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          {...props}
        >
          <div className="flex flex-col items-center space-y-token-lg">
            {/* Aurora Loading Spinner */}
            <motion.div 
              className={cn(spinnerVariants({ size: spinnerSize, style: spinnerStyle }), 'p-token-xs')}
              animate={enableAnimations ? spinnerAnimation : {}}
            >
              <div className="w-full h-full bg-foreground rounded-full flex items-center justify-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full"
                  animate={enableAnimations ? pulseAnimation : {}}
                />
              </div>
            </motion.div>
            
            {/* Loading Text */}
            <motion.div 
              className="text-white font-body text-xl text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {loadingMessage}
              {showPercentage && ` ${progress.toFixed(0)}%`}
            </motion.div>
            
            {/* Progress Bar */}
            {showProgressBar && (
              <motion.div 
                className={cn(progressBarVariants({ width: progressWidth, style: progressStyle }))}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ delay: 0.4 }}
              >
                <motion.div 
                  className={cn(progressFillVariants({ style: progressStyle, animation: 'none' }))}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.div>
            )}

            {/* Additional loading dots animation */}
            {enableAnimations && (
              <div className="flex space-x-token-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-accent rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type HeroVideoLoaderVariant = VariantProps<typeof loaderContainerVariants>
export type VideoSpinnerVariant = VariantProps<typeof spinnerVariants>
export type VideoProgressVariant = VariantProps<typeof progressBarVariants>