'use client'

import Link, { type LinkProps } from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

type ButtonTone = 'coral' | 'sky' | 'magenta' | 'lime' | 'volt' | 'cyan' | 'ink'
type LegacyGlow = 'aqua' | 'digital' | 'holo' | 'volt'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-none border border-transparent px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary focus-visible:ring-offset-surface-base disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-surface-base shadow-soft hover:bg-accent-primary/90 hover:shadow-[0_0_20px_var(--color-accent-glow)]',
        inverse: 'bg-surface-base text-ink shadow-soft hover:bg-surface-base/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        accent: 'border border-accent-primary bg-transparent text-accent-primary hover:bg-accent-primary hover:text-surface-base',
        glass: 'border border-border-subtle/70 bg-surface-base/80 text-text-primary backdrop-blur hover:bg-surface-base hover:border-accent-primary/50',
        outline: 'border border-border-subtle bg-transparent text-text-primary hover:border-accent-primary hover:text-accent-primary',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-base/50',
        link: 'p-0 text-sm font-medium tracking-normal underline-offset-4 hover:underline shadow-none',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-8 py-3 text-sm',
        lg: 'px-10 py-4 text-base',
      },
      tone: {
        default: '',
        coral: '',
        sky: '',
        magenta: '',
        lime: '',
        volt: '',
        cyan: '',
        ink: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        tone: 'coral',
        className: 'bg-accent-primary text-surface-base hover:bg-accent-primary/90',
      },
      // Simplified compound variants as the new system relies more on the base variant definitions
      {
        variant: 'outline',
        tone: 'ink',
        className: 'border-border-subtle text-text-primary hover:bg-surface-base/75',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      tone: 'default',
      size: 'md',
    },
  }
)

type SharedProps = Omit<VariantProps<typeof buttonVariants>, 'variant' | 'tone'> & {
  variant?: VariantProps<typeof buttonVariants>['variant'] | 'solid'
  tone?: ButtonTone
  glow?: LegacyGlow
  className?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

type ButtonProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type AnchorProps = SharedProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'href'> &
  Pick<LinkProps, 'href'> & {
    disabled?: boolean
  }

export type ButtonComponentProps = ButtonProps | AnchorProps

const glowToneMap: Record<LegacyGlow, ButtonTone> = {
  aqua: 'sky',
  digital: 'sky',
  holo: 'magenta',
  volt: 'volt',
}

export function Button(props: ButtonComponentProps) {
  const {
    className,
    variant: rawVariant,
    tone: toneProp,
    glow,
    size,
    leftIcon,
    rightIcon,
    children,
    ...rest
  } = props as any

  const variant = rawVariant === 'solid' ? 'accent' : rawVariant
  const glowTone = (glow ?? undefined) as LegacyGlow | undefined
  const resolvedTone: ButtonTone = toneProp ?? (glowTone ? glowToneMap[glowTone] : undefined) ?? 'ink'

  const classes = cn(buttonVariants({ variant, tone: resolvedTone, size }), className)
  const content = (
    <>
      {leftIcon && <span className="inline-flex items-center" aria-hidden>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex items-center" aria-hidden>{rightIcon}</span>}
    </>
  )

  if ('href' in props && props.href) {
    const { href, disabled: anchorDisabled = false, ...linkProps } = rest as AnchorProps
    if (anchorDisabled) {
      const disabledClass = cn(classes, 'pointer-events-none opacity-60')
      return (
        <span role="link" aria-disabled="true" className={disabledClass} {...linkProps}>
          {content}
        </span>
      )
    }
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  const buttonProps = rest as ButtonProps
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  )
}

export type { ButtonComponentProps as ButtonProps }
