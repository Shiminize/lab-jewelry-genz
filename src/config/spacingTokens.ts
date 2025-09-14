/**
 * Centralized Spacing Token Configuration
 * Aurora Design System - CLAUDE_RULES Compliant
 * 
 * This file provides guidelines and utilities for using spacing tokens consistently
 * across all components. All spacing should use these tokens instead of hardcoded values.
 */

export const SPACING_TOKENS = {
  // Core Token System (matches tailwind.config.js)
  XS: 'token-xs',     // 4px  - Minimal spacing, borders, fine details
  SM: 'token-sm',     // 8px  - Small component gaps, text spacing
  MD: 'token-md',     // 16px - Standard component spacing, button padding
  LG: 'token-lg',     // 24px - Component gaps, card spacing
  XL: 'token-xl',     // 32px - Section elements, headlines
  '2XL': 'token-2xl', // 48px - Large section gaps, hero elements
  '3XL': 'token-3xl', // 64px - Major section spacing
  '4XL': 'token-4xl', // 96px - Luxury section spacing
  '5XL': 'token-5xl', // 128px - Hero/showcase spacing
  '6XL': 'token-6xl', // 256px - Not defined in config, using 5XL max
  
  // Semantic aliases for better developer experience
  COMPONENT_GAP: 'token-lg',    // Standard gap between components
  SECTION_GAP: 'token-4xl',     // Gap between major sections
  HERO_SPACING: 'token-5xl',    // Hero section internal spacing
} as const

export const SPACING_GUIDELINES = {
  // Component Spacing Patterns
  CARD: {
    PADDING: SPACING_TOKENS.LG,          // p-token-lg (24px)
    GAP: SPACING_TOKENS.MD,              // gap-token-md (16px)
    MARGIN_BOTTOM: SPACING_TOKENS.XL,    // mb-token-xl (32px)
  },
  
  SECTION: {
    PADDING_Y: SPACING_TOKENS['4XL'],    // py-token-4xl (96px)
    PADDING_X: SPACING_TOKENS.MD,       // px-token-md (16px) mobile
    PADDING_X_DESKTOP: SPACING_TOKENS.XL, // lg:px-token-xl (32px) desktop
    MARGIN_BETWEEN: SPACING_TOKENS['4XL'], // mt-token-4xl (96px)
  },
  
  BUTTON: {
    PADDING_Y: SPACING_TOKENS.SM,       // py-token-sm (8px)
    PADDING_X: SPACING_TOKENS.LG,       // px-token-lg (24px)
    GAP: SPACING_TOKENS.MD,             // gap-token-md (16px) between buttons
  },
  
  TEXT: {
    HEADLINE_MARGIN: SPACING_TOKENS.XL,  // mb-token-xl (32px)
    PARAGRAPH_MARGIN: SPACING_TOKENS.LG, // mb-token-lg (24px)
    SMALL_MARGIN: SPACING_TOKENS.MD,     // mb-token-md (16px)
  },
  
  HERO: {
    PADDING_Y: SPACING_TOKENS['5XL'],    // py-token-5xl (128px)
    CONTENT_GAP: SPACING_TOKENS['2XL'],  // gap-token-2xl (48px)
    ELEMENT_SPACING: SPACING_TOKENS.XL,  // space-y-token-xl (32px)
  },
  
  GRID: {
    GAP_MOBILE: SPACING_TOKENS.MD,       // gap-token-md (16px)
    GAP_DESKTOP: SPACING_TOKENS.LG,      // lg:gap-token-lg (24px)
  }
} as const

export const RESPONSIVE_SPACING_PATTERNS = {
  // Common responsive spacing patterns
  SECTION_RESPONSIVE: 'py-token-3xl sm:py-token-4xl lg:py-token-5xl',
  PADDING_RESPONSIVE: 'px-token-md sm:px-token-lg lg:px-token-xl',
  GAP_RESPONSIVE: 'gap-token-md lg:gap-token-lg',
  MARGIN_RESPONSIVE: 'mb-token-lg lg:mb-token-xl',
} as const

/**
 * Utility function to get spacing class names
 */
export const getSpacingClass = (
  property: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mt' | 'mb' | 'ml' | 'mr' | 'gap' | 'space-x' | 'space-y',
  size: keyof typeof SPACING_TOKENS
): string => {
  return `${property}-${SPACING_TOKENS[size]}`
}

/**
 * Get responsive spacing classes
 */
export const getResponsiveSpacing = (
  property: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mt' | 'mb' | 'ml' | 'mr' | 'gap' | 'space-x' | 'space-y',
  mobile: keyof typeof SPACING_TOKENS,
  tablet?: keyof typeof SPACING_TOKENS,
  desktop?: keyof typeof SPACING_TOKENS
): string => {
  let classes = `${property}-${SPACING_TOKENS[mobile]}`
  
  if (tablet) {
    classes += ` sm:${property}-${SPACING_TOKENS[tablet]}`
  }
  
  if (desktop) {
    classes += ` lg:${property}-${SPACING_TOKENS[desktop]}`
  }
  
  return classes
}

/**
 * Common component spacing presets
 */
export const COMPONENT_SPACING_PRESETS = {
  HERO_SECTION: 'py-token-5xl px-token-md sm:px-token-lg lg:px-token-xl',
  CONTENT_SECTION: 'py-token-4xl px-token-md sm:px-token-lg lg:px-token-xl',
  CARD_CONTAINER: 'p-token-lg space-y-token-md',
  BUTTON_GROUP: 'flex gap-token-md',
  GRID_CONTAINER: 'grid gap-token-md lg:gap-token-lg',
  TEXT_CONTENT: 'space-y-token-lg',
} as const

export type SpacingToken = keyof typeof SPACING_TOKENS
export type SpacingGuideline = keyof typeof SPACING_GUIDELINES
export type SpacingPreset = keyof typeof COMPONENT_SPACING_PRESETS