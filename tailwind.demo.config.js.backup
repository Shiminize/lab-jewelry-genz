/** @type {import('tailwindcss').Config} */
module.exports = {
  // Prefix to prevent conflicts with existing styles
  prefix: 'aurora-',
  
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // Semantic Aurora Design System Colors
      colors: {
        // Brand Identity Colors
        brand: {
          'luxuryMidnight': 'var(--deep-space)',       // Primary dark background
          'nebulaPurple': 'var(--nebula-purple)',      // Primary brand color
          'lunarGrey': 'var(--lunar-grey)',           // Neutral light
          'cosmicBlack': 'var(--cosmic-black)',       // Pure dark
        },

        // Material-Specific Psychology Colors
        material: {
          gold: {
            'base': '#FFD700',                          // Classic gold
            'shadow': 'color-mix(in srgb, #FFD700 20%, transparent)',
            'hover': 'color-mix(in srgb, #FFD700 80%, white)',
            'prismatic': 'color-mix(in srgb, #FFD700 25%, transparent)',
            'warm': '#FFD700',                          // Emotional trigger color
          },
          platinum: {
            'base': '#E5E4E2',                          // Platinum base
            'shadow': 'color-mix(in srgb, #B9F2FF 20%, transparent)',
            'hover': 'color-mix(in srgb, #E5E4E2 90%, white)',
            'prismatic': 'color-mix(in srgb, #B9F2FF 25%, transparent)',
            'cool': '#B9F2FF',                          // Emotional trigger color
          },
          roseGold: {
            'base': '#B76E79',                          // Rose gold base
            'shadow': 'color-mix(in srgb, #F7A8B8 20%, transparent)',
            'hover': 'color-mix(in srgb, #B76E79 85%, white)',
            'prismatic': 'color-mix(in srgb, #F7A8B8 25%, transparent)',
            'romantic': '#F7A8B8',                      // Emotional trigger color
          },
        },

        // Call-to-Action Gradients
        cta: {
          gradient: {
            'primary': 'linear-gradient(135deg, var(--nebula-purple), var(--aurora-crimson))',
            'secondary': 'linear-gradient(135deg, var(--deep-space), var(--nebula-purple))',
            'hero': 'linear-gradient(135deg, var(--deep-space) 0%, var(--nebula-purple) 100%)',
            'midnight': 'linear-gradient(135deg, var(--deep-space), var(--nebula-purple))',
            'romantic': 'linear-gradient(135deg, var(--aurora-pink), var(--plum-shadow))',
            'eco': 'linear-gradient(135deg, var(--emerald-flash), var(--deep-space))',
          },
        },

        // Emotional Trigger System
        emotion: {
          'luxury': 'var(--nebula-purple)',            // Premium positioning
          'romantic': 'var(--aurora-pink)',            // Romance & engagement
          'trust': 'var(--emerald-flash)',             // Sustainability & trust
          'warning': 'var(--amber-glow)',              // Caution states
          'success': 'var(--emerald-flash)',           // Success states
          'error': 'var(--aurora-crimson)',            // Error states
        },

        // Interactive States
        hover: {
          'gold': 'color-mix(in srgb, #FFD700 15%, white)',
          'platinum': 'color-mix(in srgb, #B9F2FF 15%, white)', 
          'roseGold': 'color-mix(in srgb, #F7A8B8 15%, white)',
          'luxury': 'color-mix(in srgb, var(--nebula-purple) 15%, white)',
        },
      },

      // Aurora Token-Based Spacing System
      spacing: {
        'token-xs': '0.25rem',    // 4px - micro spacing
        'token-sm': '0.5rem',     // 8px - small spacing
        'token-md': '1rem',       // 16px - standard spacing
        'token-lg': '1.5rem',     // 24px - large spacing
        'token-xl': '2rem',       // 32px - extra large spacing
        'token-2xl': '3rem',      // 48px - section spacing
        'token-3xl': '4rem',      // 64px - hero spacing
        'token-4xl': '5rem',      // 80px - major section spacing
      },

      // Aurora Border Radius System
      borderRadius: {
        'token-sm': '3px',        // Subtle rounding
        'token-md': '5px',        // Standard rounding
        'token-lg': '8px',        // Medium rounding
        'token-xl': '13px',       // Large rounding
        'token-2xl': '21px',      // Extra large rounding
        'token-full': '34px',     // Aurora geometric full
      },

      // Aurora Shadow System
      boxShadow: {
        // Material-specific prismatic shadows
        'material-gold': `
          0 2px 8px color-mix(in srgb, #FFD700 20%, transparent),
          0 4px 16px color-mix(in srgb, #FFD700 10%, transparent)
        `,
        'material-platinum': `
          0 2px 8px color-mix(in srgb, #B9F2FF 20%, transparent),
          0 4px 16px color-mix(in srgb, #B9F2FF 10%, transparent)
        `,
        'material-rose-gold': `
          0 2px 8px color-mix(in srgb, #F7A8B8 20%, transparent),
          0 4px 16px color-mix(in srgb, #F7A8B8 10%, transparent)
        `,
        
        // Interactive hover shadows
        'material-gold-hover': `
          0 4px 16px color-mix(in srgb, #FFD700 30%, transparent),
          0 8px 24px color-mix(in srgb, #FFD700 15%, transparent)
        `,
        'material-platinum-hover': `
          0 4px 16px color-mix(in srgb, #B9F2FF 30%, transparent),
          0 8px 24px color-mix(in srgb, #B9F2FF 15%, transparent)
        `,
        'material-rose-gold-hover': `
          0 4px 16px color-mix(in srgb, #F7A8B8 30%, transparent),
          0 8px 24px color-mix(in srgb, #F7A8B8 15%, transparent)
        `,

        // General Aurora shadows
        'aurora-sm': '0 2px 4px color-mix(in srgb, var(--nebula-purple) 10%, transparent)',
        'aurora-md': '0 4px 8px color-mix(in srgb, var(--nebula-purple) 15%, transparent)',
        'aurora-lg': '0 8px 16px color-mix(in srgb, var(--nebula-purple) 20%, transparent)',
        'aurora-xl': '0 16px 32px color-mix(in srgb, var(--nebula-purple) 25%, transparent)',
      },

      // Aurora Animation System
      animation: {
        // Gradient drift for hero sections
        'aurora-drift': 'aurora-drift 30s ease-in-out infinite',
        
        // Shimmer effects for featured products
        'aurora-shimmer': 'aurora-shimmer 2s ease-in-out infinite',
        'aurora-shimmer-slow': 'aurora-shimmer 3s ease-in-out infinite',
        
        // Pulse animations for emotional triggers
        'aurora-pulse': 'aurora-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'romantic-glow': 'romantic-glow 4s ease-in-out infinite',
        'eco-confidence': 'eco-confidence 2.5s ease-in-out infinite',
        'luxury-pulse': 'luxury-pulse 3s ease-in-out infinite',
        
        // Ripple effects for interactions
        'aurora-ripple': 'aurora-ripple 0.6s ease-out',
        'material-ripple': 'material-ripple 0.8s ease-out',
        
        // Hover and selection animations
        'aurora-hover': 'aurora-hover 0.3s ease-out',
        'material-select': 'material-select 0.4s ease-out',
      },

      // Aurora Keyframe Animations
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aurora-shimmer': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'aurora-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'romantic-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 10px color-mix(in srgb, var(--aurora-pink) 20%, transparent)' 
          },
          '50%': { 
            boxShadow: '0 0 20px color-mix(in srgb, var(--aurora-pink) 40%, transparent)' 
          },
        },
        'eco-confidence': {
          '0%, 100%': { 
            boxShadow: '0 0 8px color-mix(in srgb, var(--emerald-flash) 20%, transparent)' 
          },
          '50%': { 
            boxShadow: '0 0 16px color-mix(in srgb, var(--emerald-flash) 35%, transparent)' 
          },
        },
        'luxury-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--nebula-purple) 20%, transparent)' 
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--nebula-purple) 30%, transparent)' 
          },
        },
        'aurora-ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'material-ripple': {
          '0%': { 
            transform: 'scale(0.8)', 
            opacity: '0.6',
            filter: 'brightness(1)' 
          },
          '100%': { 
            transform: 'scale(1.1)', 
            opacity: '0',
            filter: 'brightness(1.15)' 
          },
        },
        'aurora-hover': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        'material-select': {
          '0%': { 
            transform: 'scale(1)',
            filter: 'brightness(1)' 
          },
          '50%': { 
            transform: 'scale(1.05)',
            filter: 'brightness(1.15)' 
          },
          '100%': { 
            transform: 'scale(1.02)',
            filter: 'brightness(1.1)' 
          },
        },
      },

      // Aurora Typography Scale
      fontSize: {
        'aurora-xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'aurora-sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'aurora-base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'aurora-lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'aurora-xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        'aurora-2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        'aurora-3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        'aurora-4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        'aurora-5xl': ['3rem', { lineHeight: '1' }],           // 48px
        'aurora-6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },

      // Aurora Container Sizes
      maxWidth: {
        'aurora-xs': '20rem',     // 320px
        'aurora-sm': '24rem',     // 384px
        'aurora-md': '28rem',     // 448px
        'aurora-lg': '32rem',     // 512px
        'aurora-xl': '36rem',     // 576px
        'aurora-2xl': '42rem',    // 672px
        'aurora-3xl': '48rem',    // 768px
        'aurora-4xl': '56rem',    // 896px
        'aurora-5xl': '64rem',    // 1024px
        'aurora-6xl': '72rem',    // 1152px
        'aurora-7xl': '80rem',    // 1280px
      },

      // Aurora Z-Index Scale
      zIndex: {
        'aurora-base': '10',
        'aurora-dropdown': '1000',
        'aurora-sticky': '1020',
        'aurora-fixed': '1030',
        'aurora-modal-backdrop': '1040',
        'aurora-modal': '1050',
        'aurora-popover': '1060',
        'aurora-tooltip': '1070',
        'aurora-toast': '1080',
      },

      // Aurora Transition System
      transitionDuration: {
        'aurora-fast': '150ms',
        'aurora-normal': '250ms',
        'aurora-slow': '350ms',
        'aurora-slower': '500ms',
      },

      transitionTimingFunction: {
        'aurora-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'aurora-ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'aurora-ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'aurora-ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [
    // Aurora Design System utilities
    function({ addUtilities, theme }) {
      addUtilities({
        // Emotional trigger classes
        '.luxury-emotional-trigger': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: `linear-gradient(135deg, ${theme('colors.emotion.luxury')}, transparent)`,
            borderRadius: 'inherit',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            zIndex: '-1',
          },
          '&:hover::before': {
            opacity: '0.2',
          },
        },

        '.romantic-emotional-trigger': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: `linear-gradient(45deg, ${theme('colors.emotion.romantic')}20, transparent)`,
            borderRadius: 'inherit',
            opacity: '0',
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
          },
          '&:hover::after': {
            opacity: '1',
          },
        },

        '.eco-trust-trigger': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-1px',
            background: `conic-gradient(from 0deg, ${theme('colors.emotion.trust')}, transparent, ${theme('colors.emotion.trust')})`,
            borderRadius: 'inherit',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            zIndex: '-1',
          },
          '&:hover::before': {
            opacity: '0.3',
          },
        },

        // Aurora gradient backgrounds
        '.aurora-hero-gradient': {
          background: theme('colors.cta.gradient.hero'),
          backgroundSize: '200% 200%',
          animation: 'aurora-drift 30s ease-in-out infinite',
        },

        '.aurora-midnight-luxury': {
          background: theme('colors.cta.gradient.midnight'),
          backgroundSize: '150% 150%',
        },

        '.aurora-romantic-gradient': {
          background: theme('colors.cta.gradient.romantic'),
          backgroundSize: '200% 200%',
        },

        // Aurora text gradients
        '.aurora-gradient-text': {
          background: `linear-gradient(135deg, ${theme('colors.brand.nebulaPurple')}, ${theme('colors.emotion.luxury')})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        },

        // Material selection states
        '.material-selected': {
          transform: 'scale(1.02)',
          filter: 'brightness(1.1)',
          transition: 'all 0.3s ease',
        },

        // Aurora mega menu specific
        '.aurora-mega-menu': {
          background: `linear-gradient(135deg, ${theme('colors.brand.lunarGrey')}, white)`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${theme('colors.brand.lunarGrey')}40`,
        },
      });
    },
  ],

  // Ensure Aurora tokens are properly resolved
  corePlugins: {
    preflight: true,
  },
};