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
      borderRadius: {
        'none': '0px',
        'sm': '3px',   // Fibonacci sequence: 3px
        'DEFAULT': '5px', // Fibonacci sequence: 5px
        'md': '8px',   // Fibonacci sequence: 8px
        'lg': '13px',  // Fibonacci sequence: 13px
        'xl': '21px',  // Fibonacci sequence: 21px
        '2xl': '34px', // Fibonacci sequence: 34px
        '3xl': '34px', // Max Aurora radius
        'full': '9999px', // Keep full for circular elements
      },
      fontFamily: {
        headline: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // Aurora Design System Foundation Colors
        background: '#FEFCF9', // Ivory mist (keep existing)
        foreground: '#2D3A32', // Graphite green (keep existing) 
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
        'material-gold': '#6B46C1',      // Aurora: Nebula Purple (was #FFD700)
        'material-platinum': '#F7F7F9',  // Aurora: Lunar Grey (was #E5E4E2)
        'material-silver': '#E2E8F0',    // Aurora: Quantum border (was #C0C0C0)
        'material-white-gold': '#F1F2F6', // Aurora: Starlight Gray (was #F8F8FF)
        'material-rose-gold': '#FF6B9D',  // Aurora: Pink (was #E8B4B8)
        'stone-diamond': '#FFFFFF',       // Keep pure white for diamonds
        
        // 3D Material Colors for WebGL compatibility - Aurora Enhanced
        material: {
          'recycled-sterling-silver': '#F1F2F6', // Aurora: Starlight Gray
          'recycled-14k-gold': '#6B46C1',        // Aurora: Nebula Purple
          'recycled-18k-gold': '#5B3BA8',        // Aurora: Deeper Nebula
          'lab-grown-platinum': '#F7F7F9',       // Aurora: Lunar Grey
          'recycled-rose-gold': '#FF6B9D',       // Aurora: Pink
          'lab-created-titanium': '#1E293B',     // Aurora: Cosmic Slate
        },
        
        // Aurora Complete Color Psychology System (from demo)
        'aurora-pink': '#FF6B9D',        // Aurora: Primary pink accent
        'aurora-crimson': '#C44569',     // Aurora: Crimson for interactions
        'aurora-plum': '#723C70',        // Aurora: Deep plum accent
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
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
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
      screens: {
        'xs': '475px',
      },
      boxShadow: {
        // Aurora Prismatic Shadow System - Enhanced with Pink accents
        'aurora-sm': '0 2px 4px rgba(107, 70, 193, 0.1), 0 1px 2px rgba(255, 107, 157, 0.08)',
        'aurora-md': '0 4px 6px rgba(107, 70, 193, 0.15), 0 2px 4px rgba(255, 107, 157, 0.1)',
        'aurora-lg': '0 10px 15px rgba(107, 70, 193, 0.2), 0 4px 6px rgba(255, 107, 157, 0.12)',
        'aurora-xl': '0 20px 25px rgba(107, 70, 193, 0.25), 0 10px 10px rgba(255, 107, 157, 0.15)',
        'aurora-2xl': '0 25px 50px rgba(107, 70, 193, 0.3), 0 20px 20px rgba(255, 107, 157, 0.18)',
        'aurora-inner': 'inset 0 2px 4px rgba(107, 70, 193, 0.1)',
        'aurora-glow': '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(107, 70, 193, 0.2)',
        'aurora-interactive': '0 4px 12px rgba(196, 69, 105, 0.15)', // Crimson interactive
        
        // Aurora Context-Aware Product Shadows (from demo)
        'aurora-near': '0 2px 8px rgba(107, 70, 193, 0.2)', // Near shadow
        'aurora-float': '0 8px 24px rgba(107, 70, 193, 0.15)', // Float shadow
        'aurora-hover': '0 16px 48px rgba(107, 70, 193, 0.12)', // Hover shadow
        'aurora-modal': '0 24px 64px rgba(107, 70, 193, 0.1)', // Modal shadow
        
        // Aurora Material-Specific Shadows
        'aurora-gold': '0 8px 24px rgba(255, 215, 0, 0.15)', // Gold product shadow
        'aurora-diamond': '0 8px 24px rgba(185, 242, 255, 0.15)', // Diamond prismatic shadow
        'aurora-emerald': '0 8px 24px rgba(16, 185, 129, 0.15)', // Emerald shadow
        
        // Legacy shadows (keep for compatibility)
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}