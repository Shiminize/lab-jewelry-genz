/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Design Token Migration from design-tokens.css
      colors: {
        // Brand Colors - Core Palette (from design-tokens.css)
        brand: {
          primary: '#6B46C1',    // --token-color-brand-primary (Nebula Purple)
          secondary: '#FF6B9D',  // --token-color-brand-secondary (Aurora Pink)  
          tertiary: '#C44569',   // --token-color-brand-tertiary (Aurora Crimson)
          accent: '#10B981',     // --token-color-brand-accent (Emerald Flash)
        },

        // Neutral Colors - Greyscale System
        neutral: {
          0: '#FFFFFF',          // --token-color-neutral-0 (Pure White)
          50: '#F7F7F9',         // --token-color-neutral-50 (Lunar Grey)
          100: '#F0F0F2',        // --token-color-neutral-100 (Light Grey)
          200: '#E5E7EB',        // --token-color-neutral-200 (Border Grey)
          500: '#6B7280',        // --token-color-neutral-500 (Mid Grey)
          900: '#0A0E27',        // --token-color-neutral-900 (Deep Space)
        },

        // Material Colors - Jewelry Specific
        material: {
          gold: '#FFD700',           // --token-color-material-gold
          'rose-gold': '#F7A8B8',    // --token-color-material-rose-gold
          'white-gold': '#F8F8FF',   // --token-color-material-white-gold
          platinum: '#B9F2FF',       // --token-color-material-platinum
        },

        // Semantic Colors - Functional States
        semantic: {
          success: '#10B981',    // --token-color-success
          warning: '#F59E0B',    // --token-color-warning
          error: '#EF4444',      // --token-color-error
          info: '#3B82F6',       // --token-color-info
        },

        // Component-Specific Colors
        nav: {
          background: '#F7F7F9',     // --token-nav-background
          text: '#0A0E27',           // --token-nav-text
          border: '#E5E7EB',         // --token-nav-border
        },

        card: {
          background: '#FFFFFF',     // --token-card-background
          border: '#E5E7EB',         // --token-card-border
        },

        button: {
          'primary-bg': '#6B46C1',       // --token-button-primary-bg
          'primary-text': '#FFFFFF',     // --token-button-primary-text
          'secondary-bg': 'transparent', // --token-button-secondary-bg
          'secondary-text': '#6B46C1',   // --token-button-secondary-text
          'secondary-border': '#6B46C1', // --token-button-secondary-border
        },

        input: {
          background: '#FFFFFF',     // --token-input-background
          border: '#E5E7EB',         // --token-input-border
          'border-focus': '#6B46C1', // --token-input-border-focus
          text: '#0A0E27',           // --token-input-text
          placeholder: '#6B7280',    // --token-input-placeholder
        },

        // Legacy Aurora colors (for backward compatibility)
        background: '#F7F7F9', // Aurora Lunar Grey (official Aurora color)
        foreground: '#0A0E27', // Aurora Deep Space (official Aurora color) 
        muted: '#F1F2F6',      // Aurora: Starlight Gray
        accent: '#6B46C1',     // Aurora: Nebula Purple (REPLACED champagne gold)
        'accent-secondary': '#FF6B9D', // Aurora: Pink for highlights
        'accent-interactive': '#C44569', // Aurora: Crimson for interactions
        cta: '#6B46C1',       // Aurora: Nebula Purple
        'cta-hover': '#5B3BA8', // Aurora: Nebula Purple darker
        
        // Aurora Essential Colors
        white: '#FFFFFF',           // Pure white
        'high-contrast': '#FFFFFF', // High contrast text (CLAUDE_RULES)
        'deep-space': '#0A0E27',    // Aurora: Deep Space base
        'cosmic-slate': '#1E293B',  // Aurora: Cosmic Slate
        'nebula-purple': '#6B46C1', // Aurora: Nebula Purple
        'starlight-gray': '#F1F2F6', // Aurora: Starlight Gray
        'gray-600': '#6B7280',      // Legacy muted gray
        'gray-700': '#374151',      // WCAG compliant text
        
        // Aurora Border Colors
        border: '#E2E8F0',          // Aurora: Quantum borders
        'border-muted': '#F1F2F6',  // Subtle Aurora borders
        
        // Aurora System Colors (enhanced with iridescence)
        error: '#DC2626',     // Error red
        success: '#10B981',   // Aurora: Enhanced success green
        warning: '#F59E0B',   // Aurora: Enhanced warning amber
        info: '#3B82F6',      // Aurora: Information blue
        
        // Aurora Navigation Colors
        'aurora-nav-surface': '#F7F7F9',      // Lunar grey for navigation backgrounds
        'aurora-nav-hover': '#F1F2F6',        // Subtle hover state (starlight gray)
        'aurora-nav-active': '#6B46C1',       // Nebula purple for active states
        'aurora-nav-text': '#0A0E27',         // Deep space for navigation text
        'aurora-nav-muted': '#6B7280',        // Aurora muted text (replacing text-gray-600)
        'aurora-nav-border': '#E2E8F0',       // Aurora quantum borders
        'aurora-nav-gradient-start': '#F7F7F9', // Lunar grey gradient start
        'aurora-nav-gradient-end': '#FFFFFF',   // Pure white gradient end
        
        // Material Colors (for customizer previews) - Aurora Mapped
        'material-gold': '#FFD700',      // Actual gold color (restored)
        'material-platinum': '#F7F7F9',  // Aurora: Lunar Grey (was #E5E4E2)
        'material-silver': '#E2E8F0',    // Aurora: Quantum border (was #C0C0C0)
        'material-white-gold': '#F1F2F6', // Aurora: Starlight Gray (was #F8F8FF)
        'material-rose-gold': '#FF6B9D',  // Aurora: Pink (was #E8B4B8)
        'stone-diamond': '#FFFFFF',       // Keep pure white for diamonds
        
        // Aurora Complete Color Psychology System (from demo)
        'aurora-pink': '#FF6B9D',        // Aurora: Primary pink accent
        'aurora-crimson': '#C44569',     // Aurora: Crimson for interactions
        'aurora-plum': '#723C70',        // Aurora: Deep plum accent
        'aurora-nebula-purple': '#6B46C1',  // Aurora: Nebula Purple (MISSING - CRITICAL FIX)
        'aurora-emerald-flash': '#10B981',   // Aurora: Success emerald (MISSING - CRITICAL FIX)
        'aurora-amber-glow': '#F59E0B',      // Aurora: Warning amber (MISSING - CRITICAL FIX)
        'lunar-grey': '#F7F7F9',         // Aurora: Lunar grey backgrounds
        'emerald-flash': '#10B981',      // Aurora: Success emerald
        'amber-glow': '#F59E0B',         // Aurora: Warning amber
        
        // Aurora Iridescent Accents
        'iridescent-pink': '#FF6B9D',    // Aurora: Iridescent Pink
        'iridescent-coral': '#C44569',   // Aurora: Iridescent Coral  
        'iridescent-plum': '#723C70',    // Aurora: Iridescent Plum
        
        // Aurora Gradient Foundations
        'gradient-start': '#0A0E27',     // Deep Space start
        'gradient-mid': '#1E293B',       // Cosmic Slate mid
        'gradient-end': '#6B46C1',       // Nebula Purple end
        
        // Aurora Dynamic Shadow Colors
        'shadow-color': '#6B46C1',       // Nebula purple shadows
        'shadow-gold': '#FFD700',        // Gold product shadows
        'shadow-diamond': '#B9F2FF',     // Diamond prismatic shadows
        'shadow-emerald': '#10B981',     // Emerald shadows
        
        // Semantic Surface Colors (Phase 3 - Token Migration)
        surface: {
          DEFAULT: '#FFFFFF',     // Pure white surface
          muted: '#F7F7F9',      // Aurora Lunar Grey - muted backgrounds
          hover: '#F1F2F6',      // Aurora Starlight Gray - hover states
          active: '#E2E8F0',     // Aurora Quantum borders - active states
        },

        // Semantic Text Colors (Phase 3 - Token Migration)
        text: {
          primary: '#0A0E27',    // Aurora Deep Space - primary text
          secondary: '#6B7280',  // Mid grey - secondary text
          muted: '#9CA3AF',      // Muted grey - tertiary text
          inverse: '#FFFFFF',    // White text for dark backgrounds
        },

        // Aurora CSS Variable Aliases (repaired - Phase 2)
        'aurora-bg': '#F7F7F9',                      // Lunar Grey - direct token value
        'aurora-text': '#0A0E27',                    // Deep Space - direct token value
        'aurora-accent': '#6B46C1',                  // Nebula Purple - direct token value
      },

      // Spacing Tokens (from design-tokens.css)
      spacing: {
        // Token Spacing System
        'token-xs': '0.25rem',    // --token-space-xs (4px)
        'token-sm': '0.5rem',     // --token-space-sm (8px) 
        'token-md': '1rem',       // --token-space-md (16px)
        'token-lg': '1.5rem',     // --token-space-lg (24px)
        'token-xl': '2rem',       // --token-space-xl (32px)
        'token-2xl': '3rem',      // --token-space-2xl (48px)
        'token-3xl': '4rem',      // --token-space-3xl (64px)
        
        // Component Spacing
        'component-gap': '1.5rem',   // --token-space-component-gap
        'section-gap': '4rem',       // --token-space-section-gap

        // Legacy spacing (keep for compatibility)
        '18': '4.5rem',
        '88': '22rem',
      },

      // Font Size Tokens (from design-tokens.css)
      fontSize: {
        // Token Font Sizes
        'token-xs': '0.75rem',     // --token-font-size-xs (12px)
        'token-sm': '0.875rem',    // --token-font-size-sm (14px)
        'token-base': '1rem',      // --token-font-size-base (16px)
        'token-lg': '1.125rem',    // --token-font-size-lg (18px)
        'token-xl': '1.25rem',     // --token-font-size-xl (20px)
        'token-2xl': '1.5rem',     // --token-font-size-2xl (24px)
        'token-3xl': '1.875rem',   // --token-font-size-3xl (30px)
        'token-4xl': '2.25rem',    // --token-font-size-4xl (36px)

        // Legacy font sizes
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      // Font Family Tokens (from design-tokens.css)
      fontFamily: {
        // Token Font Families
        'token-primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'token-display': ['Fraunces', 'Georgia', 'serif'],

        // Legacy font families
        headline: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },

      // Font Weight Tokens (from design-tokens.css)  
      fontWeight: {
        'token-normal': '400',     // --token-font-weight-normal
        'token-medium': '500',     // --token-font-weight-medium
        'token-semibold': '600',   // --token-font-weight-semibold
        'token-bold': '700',       // --token-font-weight-bold
      },

      // Line Height Tokens (from design-tokens.css)
      lineHeight: {
        'token-tight': '1.25',     // --token-line-height-tight
        'token-normal': '1.5',     // --token-line-height-normal
        'token-relaxed': '1.75',   // --token-line-height-relaxed
      },

      // Border Radius Tokens (from design-tokens.css)
      borderRadius: {
        // Token Border Radius
        'token-none': '0px',       // --token-border-radius-none
        'token-sm': '4px',         // --token-border-radius-sm
        'token-md': '8px',         // --token-border-radius-md
        'token-lg': '12px',        // --token-border-radius-lg
        'token-full': '9999px',    // --token-border-radius-full

        // Legacy border radius (keep for compatibility)
        'none': '0px',
        'micro': '3px',   // Aurora: Micro radius
        'sm': '5px',      // Aurora: Small radius  
        'DEFAULT': '8px', // Aurora: Medium radius
        'md': '8px',      // Aurora: Medium radius
        'lg': '13px',     // Aurora: Large radius
        'xl': '21px',     // Aurora: XL radius
        '2xl': '34px',    // Aurora: XXL radius
        '3xl': '34px',    // Aurora: XXL radius
        'full': '9999px', // Standard full radius for circles
      },

      // Border Width Tokens (from design-tokens.css)
      borderWidth: {
        'token-thin': '1px',       // --token-border-width-thin
        'token-medium': '2px',     // --token-border-width-medium
        'token-thick': '4px',      // --token-border-width-thick
      },

      // Size Tokens (from design-tokens.css)
      width: {
        'token-card-min': '280px', // --token-size-card-min-width
      },
      height: {
        'token-button': '2.75rem', // --token-size-button-height (44px)
        'token-input': '2.75rem',  // --token-size-input-height (44px)
        'token-nav': '4rem',       // --token-nav-height (64px)
      },

      // Icon Size Tokens (from design-tokens.css)
      size: {
        'token-icon-xs': '1rem',      // --token-size-icon-xs (16px)
        'token-icon-sm': '1.25rem',   // --token-size-icon-sm (20px)
        'token-icon-md': '1.5rem',    // --token-size-icon-md (24px)
        'token-icon-lg': '2rem',      // --token-size-icon-lg (32px)
      },

      // Duration Tokens (from design-tokens.css)
      transitionDuration: {
        'token-instant': '0ms',      // --token-duration-instant
        'token-fast': '150ms',       // --token-duration-fast
        'token-normal': '300ms',     // --token-duration-normal
        'token-slow': '500ms',       // --token-duration-slow
      },

      // Transition Timing Function Tokens (from design-tokens.css)
      transitionTimingFunction: {
        'token-linear': 'linear',                          // --token-ease-linear
        'token-in': 'cubic-bezier(0.4, 0, 1, 1)',        // --token-ease-in
        'token-out': 'cubic-bezier(0, 0, 0.2, 1)',       // --token-ease-out
        'token-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',  // --token-ease-in-out
      },

      // Z-Index Tokens (from design-tokens.css)
      zIndex: {
        'token-dropdown': '1000',    // --token-z-index-dropdown
        'token-modal': '1100',       // --token-z-index-modal
        'token-tooltip': '1200',     // --token-z-index-tooltip
        'token-toast': '1300',       // --token-z-index-toast
      },

      // Shadow Tokens (from design-tokens.css)
      boxShadow: {
        // Token Shadow System
        'token-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',                // --token-shadow-sm
        'token-md': '0 4px 8px rgba(0, 0, 0, 0.08)',                // --token-shadow-md
        'token-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',               // --token-shadow-lg
        'token-xl': '0 16px 48px rgba(0, 0, 0, 0.15)',              // --token-shadow-xl

        // Material-Specific Shadows (using color-mix from design-tokens.css)
        'token-gold': '0 8px 32px color-mix(in srgb, #FFD700 20%, transparent)',           // --token-shadow-gold
        'token-platinum': '0 8px 32px color-mix(in srgb, #B9F2FF 20%, transparent)',      // --token-shadow-platinum
        'token-rose-gold': '0 8px 32px color-mix(in srgb, #F7A8B8 20%, transparent)',     // --token-shadow-rose-gold
        'token-white-gold': '0 8px 32px color-mix(in srgb, #F8F8FF 20%, transparent)',    // --token-shadow-white-gold

        // Legacy Aurora Prismatic Shadow System - Enhanced with Pink accents
        'aurora-sm': '0 2px 4px rgba(107, 70, 193, 0.1), 0 1px 2px rgba(255, 107, 157, 0.08)',
        'aurora-md': '0 4px 6px rgba(107, 70, 193, 0.15), 0 2px 4px rgba(255, 107, 157, 0.1)',
        'aurora-lg': '0 10px 15px rgba(107, 70, 193, 0.2), 0 4px 6px rgba(255, 107, 157, 0.12)',
        'aurora-xl': '0 20px 25px rgba(107, 70, 193, 0.25), 0 10px 10px rgba(255, 107, 157, 0.15)',
        'aurora-2xl': '0 25px 50px rgba(107, 70, 193, 0.3), 0 20px 20px rgba(255, 107, 157, 0.18)',
        'aurora-inner': 'inset 0 2px 4px rgba(107, 70, 193, 0.1)',
        'aurora-glow': '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(107, 70, 193, 0.2)',
        'aurora-interactive': '0 4px 12px rgba(196, 69, 105, 0.15)', // Crimson interactive
        
        // Aurora Context-Aware Product Shadows
        'aurora-near': '0 2px 8px rgba(107, 70, 193, 0.2)',
        'aurora-float': '0 8px 24px rgba(107, 70, 193, 0.15)',
        'aurora-hover': '0 16px 48px rgba(107, 70, 193, 0.12)',
        'aurora-modal': '0 24px 64px rgba(107, 70, 193, 0.1)',
        
        // Aurora Shadow System - Exact specification
        'near': '0 2px 8px color-mix(in srgb, #6B46C1 20%, transparent)',
        'float': '0 8px 24px color-mix(in srgb, #6B46C1 15%, transparent)',
        'hover': '0 16px 48px color-mix(in srgb, #6B46C1 12%, transparent)',
        'modal': '0 24px 64px color-mix(in srgb, #6B46C1 10%, transparent)',
        
        // Aurora Material-Specific Shadows
        'aurora-gold': '0 8px 24px rgba(255, 215, 0, 0.15)',
        'aurora-diamond': '0 8px 24px rgba(185, 242, 255, 0.15)',
        'aurora-emerald': '0 8px 24px rgba(16, 185, 129, 0.15)',
        
        // Legacy shadows (keep for compatibility)
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      // Custom Brightness Values for Hover Effects
      brightness: {
        115: '1.15',  // +15% brightness for MinimalHoverCard
      },

      // Custom Scale Values for Hover Effects  
      scale: {
        101: '1.01',  // Subtle scale for MinimalHoverCard
      },

      minHeight: {
        '9': '2.25rem',
        '11': '2.75rem',
        '12': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        // Aurora Animation System
        'aurora-gradient-shift': 'gradientShift 4s ease-in-out infinite',
        'aurora-iridescent': 'iridescentShift 3s linear infinite',
        'aurora-rotate': 'rotate 30s linear infinite',
        'aurora-pulse': 'auroraPulse 2s ease-in-out infinite',
        'aurora-ticker': 'tickerScroll 20s linear infinite',
        'aurora-success-flash': 'successFlash 0.5s ease',
        'aurora-warning-pulse': 'warningPulse 1s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Aurora Keyframes System
        gradientShift: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        iridescentShift: {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '200% 50%' },
        },
        rotate: {
          '100%': { transform: 'rotate(360deg)' },
        },
        auroraPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        tickerScroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        successFlash: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        warningPulse: {
          '0%, 100%': { 'box-shadow': '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { 'box-shadow': '0 0 0 20px rgba(245, 158, 11, 0)' },
        },
      },
      // Background Gradient Utilities (Token-Based)
      backgroundImage: {
        'gradient-luxury-midnight': 'linear-gradient(145deg, #0B0C10, #1B1C22)',
        'gradient-primary': 'linear-gradient(135deg, var(--token-color-brand-primary, #6B46C1), var(--token-color-brand-secondary, #FF6B9D))',
        'gradient-tertiary': 'linear-gradient(135deg, var(--token-color-brand-secondary, #FF6B9D), var(--token-color-brand-tertiary, #C44569))',
        'gradient-surface': 'linear-gradient(135deg, var(--token-color-neutral-50, #F7F7F9), var(--token-color-neutral-0, #FFFFFF))',
        'gradient-material-gold': 'linear-gradient(135deg, var(--token-color-material-gold, #FFD700), rgba(255, 215, 0, 0.8))',
        'gradient-material-platinum': 'linear-gradient(135deg, var(--token-color-material-platinum, #B9F2FF), rgba(185, 242, 255, 0.8))',
        
        // Phase 3: Aurora Hero & Component Gradients (for inline style replacement)
        'aurora-hero': 'linear-gradient(135deg, #0A0E27 0%, #6B46C1 40%, rgba(255, 107, 157, 0.15) 100%)',
        'aurora-shimmer': 'linear-gradient(90deg, rgba(255, 107, 157, 0.1) 0%, rgba(196, 69, 105, 0.1) 25%, rgba(114, 60, 112, 0.1) 50%, rgba(196, 69, 105, 0.1) 75%, rgba(255, 107, 157, 0.1) 100%)',
        'aurora-radial': 'radial-gradient(circle, rgba(255, 107, 157, 0.1) 0%, transparent 50%)',
        'success-glow': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
        'legacy-overlay': 'linear-gradient(135deg, rgba(42,43,54,0.6) 0%, rgba(74,74,90,0.4) 50%, rgba(212,175,55,0.3) 100%)',
      },

      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}