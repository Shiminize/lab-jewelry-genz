/**
 * Aurora Design System Tokens
 * CLAUDE_RULES compliant design tokens for consistent theming
 * Phase 3: Color and Animation Integration
 */

// Aurora Color Palette - CLAUDE_RULES Compliant
export const AURORA_COLORS = {
  // Primary Aurora Colors (Updated 2025-08-27)
  deepSpace: '#0A0E27',        // Deep navy foundation color
  nebulaPurple: '#6B46C1',     // Primary brand purple
  pink: '#FF6B9D',             // Romantic accent pink
  crimson: '#C44569',          // Bold statement red
  plum: '#723C70',             // Sophisticated deep purple
  lunarGrey: '#F7F7F9',        // Light neutral grey
  emeraldFlash: '#10B981',     // Success/accent green
  amberGlow: '#F59E0B',        // Warning/highlight amber

  // Extended Aurora Palette
  white: '#FFFFFF',
  background: '#FEFCF9',       // High contrast background
  muted: 'rgba(107, 70, 193, 0.1)', // Muted purple overlay
} as const;

// Aurora CSS Custom Properties
export const AURORA_CSS_VARS = {
  '--aurora-deep-space': AURORA_COLORS.deepSpace,
  '--aurora-nebula-purple': AURORA_COLORS.nebulaPurple,
  '--aurora-pink': AURORA_COLORS.pink,
  '--aurora-crimson': AURORA_COLORS.crimson,
  '--aurora-plum': AURORA_COLORS.plum,
  '--aurora-lunar-grey': AURORA_COLORS.lunarGrey,
  '--aurora-emerald-flash': AURORA_COLORS.emeraldFlash,
  '--aurora-amber-glow': AURORA_COLORS.amberGlow,
} as const;

// Aurora Animation Durations
export const AURORA_TIMING = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.4s',
  shimmer: '2s',
  float: '3s',
  pulse: '2.5s',
} as const;

// Aurora Easing Functions
export const AURORA_EASING = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  ease: 'ease-in-out',
  linear: 'linear',
} as const;

// Aurora Animation Classes (CSS-in-JS compatible)
export const AURORA_ANIMATIONS = {
  pulse: {
    animation: `aurora-pulse ${AURORA_TIMING.pulse} ${AURORA_EASING.ease} infinite`,
  },
  
  shimmerOverlay: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${AURORA_COLORS.muted}, transparent)`,
      animation: `aurora-shimmer-overlay ${AURORA_TIMING.shimmer} infinite`,
    },
  },
  
  interactiveShadow: {
    transition: `all ${AURORA_TIMING.normal} ${AURORA_EASING.smooth}`,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${AURORA_COLORS.muted}`,
    },
  },
  
  gradientText: {
    background: `linear-gradient(135deg, ${AURORA_COLORS.nebulaPurple}, ${AURORA_COLORS.pink})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% 200%',
    animation: `aurora-gradient-text ${AURORA_TIMING.float} ${AURORA_EASING.ease} infinite`,
  },
  
  floating: {
    animation: `aurora-floating ${AURORA_TIMING.shimmer} ${AURORA_EASING.ease} infinite`,
  },
} as const;

// Aurora Keyframe Definitions (for CSS-in-JS injection)
export const AURORA_KEYFRAMES = `
  @keyframes aurora-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }

  @keyframes aurora-shimmer-overlay {
    0% { left: -100%; }
    50% { left: 100%; }
    100% { left: 100%; }
  }

  @keyframes aurora-gradient-text {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes aurora-floating {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-3px) rotate(90deg); }
    50% { transform: translateY(-6px) rotate(180deg); }
    75% { transform: translateY(-3px) rotate(270deg); }
  }

  @keyframes aurora-interactive-shadow {
    0% { box-shadow: 0 4px 15px rgba(107, 70, 193, 0.1); }
    100% { box-shadow: 0 8px 30px rgba(107, 70, 193, 0.3); }
  }
`;

// Aurora Gradient Definitions
export const AURORA_GRADIENTS = {
  primary: `linear-gradient(135deg, ${AURORA_COLORS.nebulaPurple} 0%, ${AURORA_COLORS.pink} 100%)`,
  secondary: `linear-gradient(135deg, ${AURORA_COLORS.plum} 0%, ${AURORA_COLORS.crimson} 100%)`,
  accent: `linear-gradient(135deg, ${AURORA_COLORS.emeraldFlash} 0%, ${AURORA_COLORS.amberGlow} 100%)`,
  neutral: `linear-gradient(135deg, ${AURORA_COLORS.lunarGrey} 0%, ${AURORA_COLORS.white} 100%)`,
  cosmic: `linear-gradient(135deg, ${AURORA_COLORS.deepSpace} 0%, ${AURORA_COLORS.plum} 100%)`,
} as const;

// Aurora Shadow Definitions
export const AURORA_SHADOWS = {
  subtle: `0 2px 10px rgba(107, 70, 193, 0.1)`,
  medium: `0 4px 20px rgba(107, 70, 193, 0.15)`,
  strong: `0 8px 30px rgba(107, 70, 193, 0.2)`,
  interactive: `0 8px 25px rgba(107, 70, 193, 0.3)`,
  glow: `0 0 20px rgba(107, 70, 193, 0.4)`,
} as const;

// Aurora Typography Scales
export const AURORA_TYPOGRAPHY = {
  fontHeadline: 'Fraunces', // CLAUDE_RULES font-headline
  fontBody: 'Inter',        // CLAUDE_RULES font-body
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Aurora Spacing Scale (CLAUDE_RULES p-1..p-9)
export const AURORA_SPACING = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
} as const;

// Aurora Border Radius
export const AURORA_RADII = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// Aurora Z-Index Scale
export const AURORA_Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1001,
  modal: 1002,
  tooltip: 1003,
} as const;

// Aurora Breakpoints
export const AURORA_BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Utility function to inject Aurora CSS variables
export function injectAuroraVars(target?: HTMLElement | null): void {
  const element = target || document.documentElement;
  
  Object.entries(AURORA_CSS_VARS).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// Utility function to get Aurora color with opacity
export function auroraColor(color: keyof typeof AURORA_COLORS, opacity?: number): string {
  const baseColor = AURORA_COLORS[color];
  
  if (opacity !== undefined && opacity < 1) {
    // Convert hex to rgba
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return baseColor;
}

// Utility function to create Aurora-compliant component styles
export function createAuroraStyles(styles: Record<string, any>): Record<string, any> {
  return {
    ...styles,
    // Inject Aurora variables automatically
    ':root': {
      ...AURORA_CSS_VARS,
      ...(styles[':root'] || {}),
    },
    
    // Include Aurora keyframes
    '@keyframes aurora-pulse': {
      '0%, 100%': { opacity: 1, transform: 'scale(1)' },
      '50%': { opacity: 0.8, transform: 'scale(1.05)' },
    },
    
    '@keyframes aurora-shimmer-overlay': {
      '0%': { left: '-100%' },
      '50%': { left: '100%' },
      '100%': { left: '100%' },
    },
    
    '@keyframes aurora-gradient-text': {
      '0%, 100%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
    },
    
    '@keyframes aurora-floating': {
      '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
      '25%': { transform: 'translateY(-3px) rotate(90deg)' },
      '50%': { transform: 'translateY(-6px) rotate(180deg)' },
      '75%': { transform: 'translateY(-3px) rotate(270deg)' },
    },
  };
}

export default {
  AURORA_COLORS,
  AURORA_CSS_VARS,
  AURORA_TIMING,
  AURORA_EASING,
  AURORA_ANIMATIONS,
  AURORA_KEYFRAMES,
  AURORA_GRADIENTS,
  AURORA_SHADOWS,
  AURORA_TYPOGRAPHY,
  AURORA_SPACING,
  AURORA_RADII,
  AURORA_Z_INDEX,
  AURORA_BREAKPOINTS,
  injectAuroraVars,
  auroraColor,
  createAuroraStyles,
};