'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const auroraCardVariants = cva(
  "aurora-card rounded-token-lg bg-white transition-all duration-500 transform-gpu shadow-token-md hover:shadow-token-lg",
  {
    variants: {
      variant: {
        default: "shadow-aurora-md hover:shadow-aurora-lg hover:-translate-y-2",
        floating: "shadow-aurora-lg hover:shadow-aurora-xl hover:-translate-y-4",
        premium: "shadow-aurora-xl hover:shadow-aurora-glow hover:-translate-y-6 aurora-premium-border",
        product: "shadow-aurora-md hover:shadow-aurora-lg hover:-translate-y-2",
        interactive: "shadow-aurora-md hover:shadow-aurora-lg cursor-pointer"
      },
      material: {
        neutral: "",
        gold: "hover:shadow-gold",
        platinum: "hover:shadow-platinum", 
        silver: "hover:shadow-aurora-lg",
        "rose-gold": "hover:shadow-rose-gold",
        diamond: "hover:shadow-diamond"
      },
      padding: {
        none: "p-0",
        sm: "p-token-md",
        default: "p-token-lg",
        lg: "p-token-xl",
        xl: "p-token-2xl"
      },
      border: {
        none: "border-0",
        default: "border border-border/20",
        accent: "border border-aurora-pink/30",
        premium: "border-2 border-gradient-to-r from-nebula-purple/30 via-aurora-pink/30 to-aurora-crimson/30"
      }
    },
    defaultVariants: {
      variant: "default",
      material: "neutral", 
      padding: "default",
      border: "default"
    }
  }
)

const auroraCardHeaderVariants = cva(
  "flex flex-col space-y-token-sm",
  {
    variants: {
      padding: {
        none: "p-0",
        default: "p-token-lg pb-token-md"
      }
    },
    defaultVariants: {
      padding: "default"
    }
  }
)

const auroraCardContentVariants = cva(
  "",
  {
    variants: {
      padding: {
        none: "p-0",
        default: "p-token-lg pt-0"
      }
    },
    defaultVariants: {
      padding: "default"
    }
  }
)

export interface AuroraCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraCardVariants> {}

export interface AuroraCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraCardHeaderVariants> {}

export interface AuroraCardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraCardContentVariants> {}

const AuroraCard = React.forwardRef<HTMLDivElement, AuroraCardProps>(
  ({ className, variant, material, padding, border, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(auroraCardVariants({ variant, material, padding, border }), className)}
      {...props}
    />
  )
)
AuroraCard.displayName = "AuroraCard"

const AuroraCardHeader = React.forwardRef<HTMLDivElement, AuroraCardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(auroraCardHeaderVariants({ padding }), className)}
      {...props}
    />
  )
)
AuroraCardHeader.displayName = "AuroraCardHeader"

const AuroraCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-token-display text-token-2xl font-semibold leading-tight tracking-tight aurora-gradient-text",
        className
      )}
      {...props}
    />
  )
)
AuroraCardTitle.displayName = "AuroraCardTitle"

const AuroraCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("font-token-primary text-token-base text-aurora-nav-muted bg-aurora-shimmer animate-aurora-shimmer-slow leading-relaxed", className)}
      {...props}
    />
  )
)
AuroraCardDescription.displayName = "AuroraCardDescription"

const AuroraCardContent = React.forwardRef<HTMLDivElement, AuroraCardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(auroraCardContentVariants({ padding }), className)}
      {...props}
    />
  )
)
AuroraCardContent.displayName = "AuroraCardContent"

const AuroraCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-token-lg pt-0 space-x-token-md", className)}
      {...props}
    />
  )
)
AuroraCardFooter.displayName = "AuroraCardFooter"

export { 
  AuroraCard, 
  AuroraCardHeader, 
  AuroraCardFooter, 
  AuroraCardTitle, 
  AuroraCardDescription, 
  AuroraCardContent,
  auroraCardVariants 
}