'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const auroraContainerVariants = cva(
  "aurora-container",
  {
    variants: {
      size: {
        sm: "max-w-3xl",
        default: "max-w-4xl", 
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full"
      },
      padding: {
        none: "px-0",
        sm: "px-token-md",
        default: "px-token-lg sm:px-token-xl",
        lg: "px-token-xl sm:px-token-2xl",
        responsive: "px-token-md sm:px-token-lg lg:px-token-xl xl:px-token-2xl"
      },
      spacing: {
        none: "py-0",
        sm: "py-token-lg",
        default: "py-token-xl sm:py-token-2xl",
        lg: "py-token-2xl sm:py-token-3xl",
        xl: "py-token-3xl sm:py-token-3xl lg:py-token-2xl"
      },
      alignment: {
        left: "",
        center: "mx-auto",
        right: "ml-auto"
      }
    },
    defaultVariants: {
      size: "default",
      padding: "responsive", 
      spacing: "default",
      alignment: "center"
    }
  }
)

const auroraSectionVariants = cva(
  "aurora-section relative",
  {
    variants: {
      background: {
        transparent: "bg-transparent",
        default: "bg-white",
        muted: "bg-lunar-grey",
        gradient: "bg-gradient-to-b from-white to-lunar-grey",
        aurora: "bg-gradient-to-br from-deep-space via-cosmic-slate to-nebula-purple",
        hero: "bg-aurora-hero aurora-animated-background"
      },
      spacing: {
        none: "py-0",
        sm: "py-token-2xl",
        default: "py-token-3xl",
        lg: "py-section-gap",
        xl: "py-20 sm:py-28 lg:py-32"
      },
      overflow: {
        visible: "overflow-visible",
        hidden: "overflow-hidden",
        clip: "overflow-clip"
      }
    },
    defaultVariants: {
      background: "default",
      spacing: "default", 
      overflow: "visible"
    }
  }
)

const auroraGridVariants = cva(
  "aurora-grid grid gap-token-lg",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
        auto: "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
      },
      gap: {
        sm: "gap-token-md",
        default: "gap-token-lg",
        lg: "gap-token-xl",
        xl: "gap-token-2xl"
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch"
      }
    },
    defaultVariants: {
      cols: 3,
      gap: "default",
      align: "stretch"
    }
  }
)

export interface AuroraContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraContainerVariants> {}

export interface AuroraSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof auroraSectionVariants> {
  as?: keyof JSX.IntrinsicElements
}

export interface AuroraGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auroraGridVariants> {}

const AuroraContainer = React.forwardRef<HTMLDivElement, AuroraContainerProps>(
  ({ className, size, padding, spacing, alignment, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        auroraContainerVariants({ size, padding, spacing, alignment }),
        className
      )}
      {...props}
    />
  )
)
AuroraContainer.displayName = "AuroraContainer"

const AuroraSection = React.forwardRef<HTMLElement, AuroraSectionProps>(
  ({ className, background, spacing, overflow, as = "section", ...props }, ref) => {
    const Element = as as any
    
    return (
      <Element
        ref={ref}
        className={cn(
          auroraSectionVariants({ background, spacing, overflow }),
          className
        )}
        {...props}
      />
    )
  }
)
AuroraSection.displayName = "AuroraSection"

const AuroraGrid = React.forwardRef<HTMLDivElement, AuroraGridProps>(
  ({ className, cols, gap, align, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        auroraGridVariants({ cols, gap, align }),
        className
      )}
      {...props}
    />
  )
)
AuroraGrid.displayName = "AuroraGrid"

// Convenience layout components
const AuroraFlex = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 'sm' | 'default' | 'lg' | 'xl'
  wrap?: boolean
}>(
  ({ className, direction = 'row', align = 'center', justify = 'start', gap = 'default', wrap = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "aurora-flex flex",
        direction === 'row' ? 'flex-row' : 'flex-col',
        {
          'items-start': align === 'start',
          'items-center': align === 'center', 
          'items-end': align === 'end',
          'items-stretch': align === 'stretch'
        },
        {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end', 
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
          'justify-evenly': justify === 'evenly'
        },
        {
          'gap-token-md': gap === 'sm',
          'gap-token-lg': gap === 'default',
          'gap-token-xl': gap === 'lg', 
          'gap-token-2xl': gap === 'xl'
        },
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    />
  )
)
AuroraFlex.displayName = "AuroraFlex"

export { 
  AuroraContainer, 
  AuroraSection,
  AuroraGrid,
  AuroraFlex,
  auroraContainerVariants,
  auroraSectionVariants,
  auroraGridVariants 
}