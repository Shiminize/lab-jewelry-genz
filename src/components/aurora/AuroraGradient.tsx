'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const auroraGradientVariants = cva(
  "aurora-gradient relative",
  {
    variants: {
      variant: {
        // Core Aurora gradients from PRD
        hero: "bg-gradient-to-br from-deep-space via-cosmic-slate to-nebula-purple",
        shimmer: "bg-gradient-to-r from-transparent via-aurora-pink/20 to-transparent",
        radial: "bg-aurora-radial",
        iridescent: "bg-gradient-to-r from-aurora-pink via-nebula-purple to-aurora-crimson",
        
        // Material-specific gradients
        gold: "bg-gradient-to-br from-material-gold/80 via-amber-glow/60 to-material-gold/40",
        platinum: "bg-gradient-to-br from-material-platinum via-high-contrast to-material-platinum/80",
        silver: "bg-gradient-to-br from-material-silver via-border to-material-silver/60",
        "rose-gold": "bg-gradient-to-br from-material-rose-gold via-aurora-pink to-material-rose-gold/80",
        diamond: "bg-gradient-to-br from-stone-diamond via-aurora-pink/10 to-stone-diamond",
        
        // Functional gradients
        luxury: "bg-gradient-to-br from-deep-space/90 via-nebula-purple/70 to-aurora-pink/50",
        premium: "bg-gradient-to-r from-aurora-crimson/80 via-nebula-purple/60 to-aurora-pink/40",
        elegant: "bg-gradient-to-b from-lunar-grey to-high-contrast/5",
        sophisticated: "bg-gradient-to-tr from-cosmic-slate/80 via-nebula-purple/40 to-aurora-pink/20"
      },
      opacity: {
        10: "opacity-10",
        20: "opacity-20", 
        30: "opacity-30",
        40: "opacity-40",
        50: "opacity-50",
        60: "opacity-60",
        70: "opacity-70",
        80: "opacity-80",
        90: "opacity-90",
        100: "opacity-100"
      },
      animation: {
        none: "",
        drift: "animate-aurora-drift",
        shimmer: "animate-aurora-shimmer-slow",
        rotate: "animate-aurora-rotate",
        pulse: "animate-pulse",
        float: "animate-aurora-float"
      },
      size: {
        sm: "w-32 h-32",
        default: "w-full h-full",
        lg: "w-screen h-screen",
        cover: "absolute inset-0"
      }
    },
    defaultVariants: {
      variant: "hero",
      opacity: 100,
      animation: "none",
      size: "default"
    }
  }
)

const auroraOverlayVariants = cva(
  "aurora-overlay absolute inset-0 pointer-events-none",
  {
    variants: {
      type: {
        shimmer: "bg-aurora-shimmer",
        glow: "aurora-glow-effect", 
        sparkle: "aurora-sparkle-field",
        iridescent: "aurora-iridescent-overlay"
      },
      intensity: {
        subtle: "opacity-20",
        medium: "opacity-40",
        strong: "opacity-60",
        dramatic: "opacity-80"
      }
    },
    defaultVariants: {
      type: "shimmer",
      intensity: "medium"
    }
  }
)

export interface AuroraGradientProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraGradientVariants> {}

export interface AuroraOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraOverlayVariants> {}

const AuroraGradient = React.forwardRef<HTMLDivElement, AuroraGradientProps>(
  ({ className, variant, opacity, animation, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        auroraGradientVariants({ variant, opacity, animation, size }),
        className
      )}
      {...props}
    />
  )
)
AuroraGradient.displayName = "AuroraGradient"

const AuroraOverlay = React.forwardRef<HTMLDivElement, AuroraOverlayProps>(
  ({ className, type, intensity, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        auroraOverlayVariants({ type, intensity }),
        className
      )}
      {...props}
    />
  )
)
AuroraOverlay.displayName = "AuroraOverlay"

// Specialized gradient components
const AuroraHeroBackground = React.forwardRef<HTMLDivElement, AuroraGradientProps>(
  ({ className, ...props }, ref) => (
    <div className="relative overflow-hidden">
      <AuroraGradient
        ref={ref}
        variant="hero"
        size="cover"
        animation="drift"
        className={cn("z-0", className)}
        {...props}
      />
      <AuroraOverlay 
        type="shimmer" 
        intensity="subtle"
        className="z-10 animate-aurora-shimmer-slow"
      />
      <AuroraGradient
        variant="radial"
        size="cover" 
        animation="rotate"
        opacity={30}
        className="z-4"
      />
    </div>
  )
)
AuroraHeroBackground.displayName = "AuroraHeroBackground"

const AuroraCardGradient = React.forwardRef<HTMLDivElement, { material?: string } & AuroraGradientProps>(
  ({ className, material = "default", ...props }, ref) => {
    const gradientVariant = material === "gold" ? "gold" : 
                           material === "platinum" ? "platinum" :
                           material === "silver" ? "silver" :
                           material === "rose-gold" ? "rose-gold" :
                           material === "diamond" ? "diamond" : "luxury"
    
    return (
      <AuroraGradient
        ref={ref}
        variant={gradientVariant as any}
        size="cover"
        opacity={20}
        className={cn("rounded-inherit", className)}
        {...props}
      />
    )
  }
)
AuroraCardGradient.displayName = "AuroraCardGradient"

const AuroraTextGradient = React.forwardRef<HTMLSpanElement, { 
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'luxury' | 'iridescent'
}>(
  ({ children, variant = 'primary', className, ...props }, ref) => {
    const gradientClasses = {
      primary: "bg-gradient-to-r from-nebula-purple to-aurora-pink bg-clip-text text-transparent",
      accent: "bg-gradient-to-r from-aurora-pink to-aurora-crimson bg-clip-text text-transparent",
      luxury: "bg-gradient-to-r from-deep-space via-nebula-purple to-aurora-pink bg-clip-text text-transparent",
      iridescent: "bg-gradient-to-r from-aurora-pink via-nebula-purple via-aurora-crimson to-aurora-pink bg-clip-text text-transparent animate-aurora-shimmer-slow"
    }
    
    return (
      <span
        ref={ref}
        className={cn("aurora-text-gradient", gradientClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)
AuroraTextGradient.displayName = "AuroraTextGradient"

export { 
  AuroraGradient, 
  AuroraOverlay,
  AuroraHeroBackground,
  AuroraCardGradient,
  AuroraTextGradient,
  auroraGradientVariants,
  auroraOverlayVariants 
}