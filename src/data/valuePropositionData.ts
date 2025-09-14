/**
 * Value Proposition Data & Configuration
 * Aurora Design System - Batch 1 Migration
 * Extracted from EnhancedValueProposition.tsx for better maintainability
 */

import type { ComponentType } from 'react'

// Type definitions for Value Proposition content
export interface TrustSignal {
  icon: ComponentType<{ className?: string; size?: number }>
  text: string
  description?: string
}

export interface ValueProp {
  id: string
  icon: ComponentType<{ className?: string; size?: number }>
  headline: string
  description: string
  trustSignals: TrustSignal[]
  details?: string
}

export interface ValuePropositionContent {
  headline: string
  description: string
  ctaText?: string
  ctaHref?: string
}

export interface AnimationConfig {
  enableAnimation: boolean
  animationDelay: number
  intersectionThreshold: number
  enableInteraction: boolean
}

export interface ResponsiveConfig {
  mobileBreakpoint: 'sm' | 'md' | 'lg'
  cardColumnsDesktop: number
  cardColumnsMobile: number
}

// Default content configuration
export const DEFAULT_VALUE_PROPOSITION_CONTENT: ValuePropositionContent = {
  headline: 'Luxury That Aligns With Your Values',
  description: 'We believe true luxury comes from knowing your choices make a positive impact. Every piece is crafted with ethical sourcing, sustainable practices, and the freedom to express your authentic self.',
  ctaText: 'Explore Our Values',
  ctaHref: '/values'
}

// Default value propositions structure (icons imported from ValuesIcons)
export const VALUE_PROPOSITION_DATA = [
  {
    id: 'ethical-sourcing',
    iconName: 'EthicalSourcingIcon',
    headline: 'Ethically Sourced & Conflict-Free',
    description: 'Every piece tells a story of responsibility. Our lab-grown diamonds and ethically sourced materials mean you can wear your values with pride, knowing your jewelry creates positive impact.',
    trustSignals: [
      { 
        iconName: 'ConflictFreeIcon', 
        text: '100% Conflict-Free',
        description: 'Certified conflict-free diamonds from controlled laboratory environments'
      },
      { 
        iconName: 'LabGrownIcon', 
        text: 'Lab-Grown Certified',
        description: 'IGI and GIA certified lab-grown diamonds with full traceability'
      }
    ],
    details: 'Our certification process includes third-party verification and complete supply chain transparency.'
  },
  {
    id: 'custom-vision',
    iconName: 'CustomVisionIcon',
    headline: 'Your Vision, Your Voice',
    description: 'Self-expression shouldn\'t be limited by what\'s on the shelf. Design jewelry that speaks your language - from subtle statements to bold declarations of who you are.',
    trustSignals: [
      { 
        iconName: 'UnlimitedCustomizationIcon', 
        text: 'Unlimited Customization',
        description: 'Complete design freedom with our advanced 3D modeling tools'
      },
      { 
        iconName: 'PremiumQualityIcon', 
        text: 'Master-Crafted Luxury',
        description: 'Expert craftsmanship ensures every custom piece meets our luxury standards'
      }
    ],
    details: 'Work with our design team to create truly one-of-a-kind pieces that reflect your personal style.'
  },
  {
    id: 'planet-positive',
    iconName: 'PlanetPositiveIcon',
    headline: 'Planet-Positive Luxury',
    description: 'True luxury means caring about tomorrow. Our sustainable practices and recycled metals prove that conscious choices can be absolutely stunning.',
    trustSignals: [
      { 
        iconName: 'CarbonNeutralIcon', 
        text: 'Carbon Neutral',
        description: 'Offset all emissions from production to delivery'
      },
      { 
        iconName: 'RecycledMetalIcon', 
        text: 'Recycled Metals',
        description: '80% recycled precious metals in all our jewelry settings'
      }
    ],
    details: 'Our environmental impact is 95% lower than traditional mining operations.'
  }
] as const

// Animation configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enableAnimation: true,
  animationDelay: 200, // ms between card animations
  intersectionThreshold: 0.2,
  enableInteraction: true
}

// Responsive configuration
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  mobileBreakpoint: 'lg',
  cardColumnsDesktop: 3,
  cardColumnsMobile: 1
}

// Trust signals configuration
export const TRUST_SIGNALS_CONFIG = {
  showByDefault: true,
  animationDelay: 100,
  hoverEffects: true
} as const

// Global trust signals (not specific to individual value props)
export const GLOBAL_TRUST_SIGNALS = [
  {
    iconName: 'PremiumQualityIcon',
    text: 'Premium Quality',
    description: 'Master-crafted pieces with lifetime warranty'
  },
  {
    iconName: 'ConflictFreeIcon',
    text: 'Ethically Sourced',
    description: 'Certified conflict-free and responsibly sourced materials'
  },
  {
    iconName: 'CarbonNeutralIcon',
    text: 'Carbon Neutral',
    description: 'All emissions offset from production to delivery'
  },
  {
    iconName: 'UnlimitedCustomizationIcon',
    text: 'Custom Design',
    description: 'Unlimited customization with expert design support'
  }
] as const

// CSS class configurations for Aurora Design System compliance
export const AURORA_CLASSES = {
  section: {
    comfortable: 'py-token-4xl sm:py-token-5xl lg:py-token-6xl',
    compact: 'py-token-3xl sm:py-token-4xl lg:py-token-5xl',
    spacious: 'py-token-5xl sm:py-token-6xl lg:py-token-8xl'
  },
  layout: {
    default: 'px-token-md sm:px-token-lg lg:px-token-xl',
    wide: 'px-token-lg sm:px-token-xl lg:px-token-3xl',
    contained: 'px-token-md sm:px-token-lg lg:px-token-xl max-w-7xl mx-auto'
  },
  card: {
    glassmorphism: 'bg-background shadow-xl',
    minimal: 'space-y-token-xl bg-background',
    bordered: 'shadow-xl bg-background'
  },
  cardStates: {
    default: 'hover:shadow-xl hover:scale-105 hover:-translate-y-token-sm',
    active: 'shadow-xl scale-105 -translate-y-token-sm bg-muted',
    dimmed: 'opacity-60 scale-95 translate-y-token-xs'
  },
  iconContainer: {
    small: 'w-token-4xl h-token-4xl',
    medium: 'w-token-5xl h-token-5xl',
    large: 'w-token-6xl h-token-6xl'
  },
  trustBadge: {
    glassmorphism: 'bg-background shadow-lg',
    accent: 'bg-background text-accent',
    minimal: 'bg-muted'
  }
} as const

// Motion animation presets
export const MOTION_PRESETS = {
  cardEntry: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  iconHover: {
    scale: 1.1,
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
  cardHover: {
    scale: 1.05,
    y: -8,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
} as const

// Accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  cardRole: 'article',
  sectionAriaLabel: 'Value propositions section',
  trustSignalRole: 'list',
  trustSignalItemRole: 'listitem'
} as const

// Export types for external usage
export type ValuePropType = typeof VALUE_PROPOSITION_DATA[0]
export type TrustSignalType = typeof GLOBAL_TRUST_SIGNALS[0]
export type ValuePropositionContentType = typeof DEFAULT_VALUE_PROPOSITION_CONTENT
export type AnimationConfigType = typeof DEFAULT_ANIMATION_CONFIG
export type ResponsiveConfigType = typeof DEFAULT_RESPONSIVE_CONFIG