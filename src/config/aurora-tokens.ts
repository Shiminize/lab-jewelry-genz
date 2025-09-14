/**
 * Aurora Design System Tokens
 * Complete implementation of PRD specifications with Claude 4.1 demo standards
 * Neuroscience-backed color psychology and mathematical harmony
 */

// =========================================
// AURORA COLOR PSYCHOLOGY SYSTEM
// =========================================

export const auroraColors = {
  // Core Aurora Palette - Neuroscience Backed
  primary: {
    'deep-space': '#0A0E27',        // Premium dark foundation
    'cosmic-slate': '#1E293B',      // Mid-range depth
    'nebula-purple': '#6B46C1',     // High-consideration purchase optimization
    'aurora-pink': '#FF6B9D',       // 47% more memorable than traditional luxury
    'aurora-crimson': '#C44569',    // Passion and luxury engagement
    'aurora-plum': '#723C70',       // Deep luxury accent
  },
  
  // Functional Colors - Context Aware
  functional: {
    'lunar-grey': '#F7F7F9',        // Optimal 4.8:1 contrast ratio
    'starlight-gray': '#F1F2F6',    // Subtle differentiation
    'high-contrast': '#FFFFFF',     // Accessibility compliance
    'emerald-flash': '#10B981',     // Eco-conscious success states
    'amber-glow': '#F59E0B',        // Urgency without aggression
  },
  
  // Material-Specific Colors - Product Aware
  materials: {
    'material-gold': '#FFD700',          // Accurate gold representation
    'material-platinum': '#B9F2FF',      // Prismatic platinum
    'material-silver': '#E2E8F0',        // Refined silver
    'material-rose-gold': '#FF6B9D',     // Aurora Pink integration
    'material-white-gold': '#F1F2F6',    // Starlight Gray mapping
    'stone-diamond': '#FFFFFF',          // Maximum brilliance
  },
  
  // Iridescent System - Dopamine Response Triggers
  iridescent: {
    'iridescent-pink': '#FF6B9D',
    'iridescent-coral': '#C44569', 
    'iridescent-plum': '#723C70',
  },
  
  // Shadow Colors - Physics-Based Lighting
  shadows: {
    'shadow-nebula': 'rgba(107, 70, 193, 0.2)',
    'shadow-aurora': 'rgba(255, 107, 157, 0.15)',
    'shadow-gold': 'rgba(255, 215, 0, 0.2)',
    'shadow-platinum': 'rgba(185, 242, 255, 0.2)',
    'shadow-diamond': 'rgba(255, 255, 255, 0.3)',
  }
} as const

// =========================================
// AURORA TYPOGRAPHY SYSTEM
// =========================================

export const auroraTypography = {
  // Font Families - Multi-Script Support
  fonts: {
    primary: {
      family: 'Inter',
      fallback: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      usage: 'Body text, UI elements, optimized for screen reading'
    },
    display: {
      family: 'Fraunces', 
      fallback: 'ui-serif, Georgia, Cambria, serif',
      usage: 'Headlines, emotional content, luxury positioning'
    },
    variable: {
      family: '"Celestial Sans"',
      axes: {
        weight: '100-900',
        width: '75-125%',
        opticalSize: '8-144pt'
      }
    }
  },
  
  // 10-Level Hierarchy - Responsive Scaling
  hierarchy: {
    'hero-display': {
      size: 'clamp(3rem, 8vw, 6rem)',
      weight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      usage: 'Maximum impact headlines'
    },
    'statement': {
      size: 'clamp(2.5rem, 6vw, 4rem)', 
      weight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      usage: 'Emotional section headers'
    },
    'title-xl': {
      size: 'clamp(2rem, 4vw, 3rem)',
      weight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      usage: 'Major section headers'
    },
    'title-l': {
      size: 'clamp(1.5rem, 3vw, 2.25rem)',
      weight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
      usage: 'Subsection headers'
    },
    'title-m': {
      size: 'clamp(1.25rem, 2.5vw, 1.75rem)',
      weight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
      usage: 'Component headers'
    },
    'body-xl': {
      size: 'clamp(1.125rem, 2vw, 1.5rem)',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
      usage: 'Lead paragraphs and introductions'
    },
    'body-l': {
      size: '1.125rem',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
      usage: 'Important content and emphasis'
    },
    'body-m': {
      size: '1rem',
      weight: 400, 
      lineHeight: 1.6,
      letterSpacing: '0',
      usage: 'Standard body text (DEFAULT)'
    },
    'small': {
      size: '0.875rem',
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      usage: 'Supporting details and secondary'
    },
    'micro': {
      size: '0.75rem',
      weight: 400,
      lineHeight: 1.4,
      letterSpacing: '0',
      usage: 'Legal text and fine print'
    }
  },
  
  // Cultural Script Adaptations
  scripts: {
    latin: { lineHeight: 1.6, letterSpacing: 'normal' },
    arabic: { lineHeight: 1.8, direction: 'rtl' },
    hebrew: { lineHeight: 1.8, direction: 'rtl' },
    cjk: { lineHeight: 1.8, letterSpacing: '0.05em' },
    devanagari: { lineHeight: 1.7, letterSpacing: '0.02em' }
  }
} as const

// =========================================
// FIBONACCI BORDER RADIUS SYSTEM  
// =========================================

export const auroraBorderRadius = {
  // Fibonacci Sequence - Mathematical Harmony
  'token-micro': '3px',    // F2 - fine details
  'token-sm': '5px',       // F3 - small interactive elements
  'token-md': '8px',       // F4 - standard components (DEFAULT)
  'token-lg': '13px',      // F5 - cards and major elements
  'token-xl': '21px',      // F6 - section containers
  'token-xxl': '34px',     // F7 - hero sections and modals
  'token-full': '9999px',  // perfect circles
  
  // Component Mapping
  mapping: {
    buttons: 'token-md',
    cards: 'token-lg', 
    modals: 'token-xl',
    hero: 'token-xxl',
    inputs: 'token-md',
    pills: 'token-full'
  }
} as const

// =========================================
// AURORA SPACING SYSTEM
// =========================================

export const auroraSpacing = {
  // Base Token System - Mathematical Progression  
  tokens: {
    'token-xs': '0.25rem',   // 4px - micro spacing
    'token-sm': '0.5rem',    // 8px - small spacing
    'token-md': '1rem',      // 16px - standard spacing (DEFAULT)
    'token-lg': '1.5rem',    // 24px - section separation
    'token-xl': '2rem',      // 32px - major breaks
    'token-2xl': '3rem',     // 48px - section-level
    'token-3xl': '4rem',     // 64px - page-level impact
  },
  
  // Semantic Applications
  semantic: {
    'component-gap': '1.5rem',
    'section-gap': '4rem', 
    'card-padding': '2rem',
    'button-padding-x': '1.5rem',
    'button-padding-y': '0.75rem',
    'form-spacing': '1rem',
    'nav-spacing': '2rem'
  },
  
  // Responsive Multipliers
  responsive: {
    mobile: 1,
    tablet: 1.25,
    desktop: 1.5,
    xl: 1.75
  }
} as const

// =========================================
// AURORA SHADOW SYSTEM
// =========================================

export const auroraShadows = {
  // Prismatic Base Shadows - Multi-Layer
  base: {
    'aurora-sm': '0 2px 4px rgba(107, 70, 193, 0.1), 0 1px 2px rgba(255, 107, 157, 0.08)',
    'aurora-md': '0 4px 6px rgba(107, 70, 193, 0.15), 0 2px 4px rgba(255, 107, 157, 0.1)',
    'aurora-lg': '0 10px 15px rgba(107, 70, 193, 0.2), 0 4px 6px rgba(255, 107, 157, 0.12)',
    'aurora-xl': '0 20px 25px rgba(107, 70, 193, 0.25), 0 10px 10px rgba(255, 107, 157, 0.15)',
    'aurora-glow': '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(107, 70, 193, 0.2)'
  },
  
  // Context-Aware Shadows
  contextual: {
    near: '0 2px 8px color-mix(in srgb, #6B46C1 20%, transparent)',
    float: '0 8px 24px color-mix(in srgb, #6B46C1 15%, transparent)',
    hover: '0 16px 48px color-mix(in srgb, #6B46C1 12%, transparent)',
    modal: '0 24px 64px color-mix(in srgb, #6B46C1 10%, transparent)'
  },
  
  // Material-Specific Shadows  
  materials: {
    gold: '0 8px 32px color-mix(in srgb, #FFD700 20%, transparent)',
    platinum: '0 8px 32px color-mix(in srgb, #B9F2FF 20%, transparent)', 
    'rose-gold': '0 8px 32px color-mix(in srgb, #FF6B9D 20%, transparent)',
    diamond: '0 8px 32px color-mix(in srgb, #FFFFFF 30%, transparent)'
  },
  
  // Interactive States
  interactive: {
    focus: '0 0 0 3px rgba(107, 70, 193, 0.2)',
    active: '0 2px 4px rgba(107, 70, 193, 0.3)',
    disabled: '0 1px 2px rgba(107, 70, 193, 0.05)'
  }
} as const

// =========================================
// AURORA ANIMATION SYSTEM
// =========================================

export const auroraAnimations = {
  // Physics-Based Timing
  timing: {
    'aurora-swift': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    'aurora-smooth': '300ms cubic-bezier(0.4, 0, 0.2, 1)', 
    'aurora-luxe': '500ms cubic-bezier(0.23, 1, 0.32, 1)',
    'aurora-dramatic': '800ms cubic-bezier(0.16, 1, 0.3, 1)',
    'aurora-float': '6s ease-in-out infinite',
    'aurora-shimmer': '3s linear infinite',
    'aurora-drift': '8s ease-in-out infinite'
  },
  
  // Keyframe Names
  keyframes: {
    drift: 'aurora-drift',
    shimmer: 'aurora-shimmer-slow', 
    rotate: 'aurora-rotate',
    float: 'aurora-float',
    glow: 'aurora-glow-pulse',
    sparkle: 'aurora-sparkle'
  }
} as const

// =========================================
// AURORA GRID SYSTEM
// =========================================

export const auroraGrid = {
  // Container Constraints
  containers: {
    sm: '768px',
    md: '1024px', 
    lg: '1280px',
    xl: '1440px',
    '2xl': '1600px'
  },
  
  // Grid Columns - 24 Column System
  columns: 24,
  
  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px', 
    xl: '1280px',
    '2xl': '1536px'
  }
} as const

// =========================================
// AURORA COMPONENT VARIANTS
// =========================================

export const auroraVariants = {
  // Button System
  buttons: {
    primary: {
      background: 'nebula-purple',
      text: 'white',
      shadow: 'aurora-md',
      hover: { shadow: 'aurora-lg', brightness: 115 }
    },
    secondary: {
      border: 'nebula-purple',
      text: 'nebula-purple',
      background: 'transparent',
      hover: { background: 'nebula-purple', text: 'white' }
    },
    accent: {
      background: 'aurora-crimson',
      text: 'white',
      shadow: 'aurora-md',
      hover: { shadow: 'aurora-glow', brightness: 110 }
    }
  },
  
  // Card System
  cards: {
    default: { shadow: 'aurora-md', hover: 'aurora-lg' },
    floating: { shadow: 'aurora-lg', hover: 'aurora-xl' },
    premium: { shadow: 'aurora-xl', hover: 'aurora-glow' }
  }
} as const

// =========================================
// TYPE DEFINITIONS
// =========================================

export type AuroraColorKey = keyof typeof auroraColors.primary | keyof typeof auroraColors.functional | keyof typeof auroraColors.materials
export type AuroraTypographyLevel = keyof typeof auroraTypography.hierarchy  
export type AuroraBorderRadiusToken = keyof typeof auroraBorderRadius
export type AuroraSpacingToken = keyof typeof auroraSpacing.tokens
export type AuroraShadowVariant = keyof typeof auroraShadows.base
export type AuroraAnimationTiming = keyof typeof auroraAnimations.timing

// =========================================
// TOKEN EXPORT
// =========================================

export const auroraTokens = {
  colors: auroraColors,
  typography: auroraTypography,
  borderRadius: auroraBorderRadius,
  spacing: auroraSpacing,
  shadows: auroraShadows,
  animations: auroraAnimations,
  grid: auroraGrid,
  variants: auroraVariants
} as const

export default auroraTokens