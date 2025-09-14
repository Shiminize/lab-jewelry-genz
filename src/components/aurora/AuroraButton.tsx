'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const auroraButtonVariants = cva(
  "inline-flex items-center justify-center rounded-token-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-token-sm hover:shadow-token-md",
  {
    variants: {
      variant: {
        primary: "bg-nebula-purple text-white hover:brightness-115 focus-visible:ring-nebula-purple/50",
        secondary: "border-2 border-nebula-purple text-nebula-purple bg-transparent hover:bg-nebula-purple hover:text-white focus-visible:ring-nebula-purple/50",
        outline: "border-2 border-aurora-pink text-aurora-pink bg-transparent hover:bg-aurora-pink/10 focus-visible:ring-aurora-pink/50",
        ghost: "text-deep-space hover:bg-lunar-grey hover:text-deep-space",
        accent: "bg-aurora-crimson text-white hover:brightness-110 focus-visible:ring-aurora-crimson/50"
      },
      size: {
        sm: "h-9 px-3 text-xs min-w-[80px]",
        default: "h-11 px-4 py-2 min-w-[120px]",
        lg: "h-14 px-8 text-base min-w-[160px] font-semibold",
        xl: "h-16 px-10 text-lg min-w-[200px] font-semibold",
        icon: "h-10 w-10"
      },
      luxury: {
        standard: "",
        premium: "hover:scale-105 transform-gpu",
        exclusive: "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      luxury: "standard"
    }
  }
)

export interface AuroraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof auroraButtonVariants> {
  asChild?: boolean
}

const AuroraButton = React.forwardRef<HTMLButtonElement, AuroraButtonProps>(
  ({ className, variant, size, luxury, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(auroraButtonVariants({ variant, size, luxury, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
AuroraButton.displayName = "AuroraButton"

export { AuroraButton, auroraButtonVariants }