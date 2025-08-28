'use client'

/**
 * Loading Spinner Component
 * CLAUDE_RULES compliant loading spinner for various UI states
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'accent' | 'cta' | 'foreground' | 'background'
  className?: string
  text?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'accent', 
  className = '',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variantClasses = {
    accent: 'border-accent',        // Champagne gold
    cta: 'border-cta',             // Coral gold  
    foreground: 'border-foreground', // Graphite green
    background: 'border-background'  // Ivory (for dark backgrounds)
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className={cn("text-aurora-nav-muted font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}