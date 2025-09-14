import { cva } from 'class-variance-authority'

export const sustainabilityVariants = cva(
  'bg-background',
  {
    variants: {
      spacing: {
        comfortable: 'py-token-3xl sm:py-token-4xl lg:py-token-5xl',
        compact: 'py-token-2xl sm:py-token-3xl lg:py-token-4xl',
        spacious: 'py-token-4xl sm:py-token-5xl lg:py-token-6xl'
      },
      layout: {
        default: 'px-token-md sm:px-token-lg lg:px-token-xl',
        wide: 'px-token-lg sm:px-token-xl lg:px-token-2xl',
        contained: 'px-token-md sm:px-token-lg lg:px-token-xl'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      layout: 'contained'
    }
  }
)

export const heroGradientVariants = cva(
  'relative overflow-hidden p-12 lg:p-16',
  {
    variants: {
      style: {
        default: 'bg-gradient-to-br from-accent/10 via-background to-neutral-50',
        subtle: 'bg-muted/30',
        vibrant: 'bg-gradient-to-br from-accent/20 via-background to-accent/10'
      }
    },
    defaultVariants: {
      style: 'default'
    }
  }
)

export const comparisonCardVariants = cva(
  'relative p-6 lg:p-8',
  {
    variants: {
      type: {
        traditional: 'bg-muted/20 border border-muted/40',
        labgrown: 'bg-accent/10 border border-accent/30'
      }
    }
  }
)

export const metricCardVariants = cva(
  'group relative p-6 transition-all duration-300',
  {
    variants: {
      style: {
        default: 'bg-muted/30 hover:bg-muted/40',
        accent: 'bg-accent/10 hover:bg-accent/20',
        gradient: 'bg-gradient-to-br from-accent/10 to-neutral-100 hover:from-accent/20 hover:to-neutral-200'
      },
      emphasis: {
        none: '',
        hover: 'hover:scale-101 hover:shadow-token-lg'
      }
    },
    defaultVariants: {
      style: 'default',
      emphasis: 'hover'
    }
  }
)

export const processStepVariants = cva(
  'relative flex flex-col items-center text-center space-y-4',
  {
    variants: {
      connector: {
        none: '',
        arrow: 'after:absolute after:top-12 after:-right-4 lg:after:-right-8 after:content-["→"] after:text-neutral-400 after:text-2xl after:hidden lg:after:block last:after:hidden'
      }
    },
    defaultVariants: {
      connector: 'arrow'
    }
  }
)


