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
        accent: '#D4AF37',     // Champagne gold (keep existing)
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
        
        // Material Colors (for customizer previews)
        'material-gold': '#FFD700',
        'material-platinum': '#E5E4E2', 
        'material-silver': '#C0C0C0',
        'material-white-gold': '#F8F8FF',
        'material-rose-gold': '#E8B4B8',
        'stone-diamond': '#FFFFFF',
        
        // 3D Material Colors for WebGL compatibility
        material: {
          'recycled-sterling-silver': '#E6E6EB', // [0.9, 0.9, 0.92] converted
          'recycled-14k-gold': '#CCC04D', // [0.8, 0.7, 0.3] converted  
          'recycled-18k-gold': '#D9C066', // [0.85, 0.75, 0.4] converted
          'lab-grown-platinum': '#CCD1D6', // [0.8, 0.82, 0.84] converted
          'recycled-rose-gold': '#E6997F', // [0.9, 0.6, 0.5] converted
          'lab-created-titanium': '#808099', // [0.5, 0.5, 0.6] converted
        },
        
        // Aurora Iridescent Accents
        'iridescent-pink': '#FF6B9D',    // Aurora: Iridescent Pink
        'iridescent-coral': '#C44569',   // Aurora: Iridescent Coral  
        'iridescent-plum': '#723C70',    // Aurora: Iridescent Plum
        
        // Aurora Gradient Foundations
        'gradient-start': '#0A0E27',     // Deep Space start
        'gradient-mid': '#1E293B',       // Cosmic Slate mid
        'gradient-end': '#6B46C1',       // Nebula Purple end
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
      },
      screens: {
        'xs': '475px',
      },
      boxShadow: {
        // Aurora Prismatic Shadow System
        'aurora-sm': '0 2px 4px rgba(107, 70, 193, 0.1), 0 1px 2px rgba(196, 69, 105, 0.08)',
        'aurora-md': '0 4px 6px rgba(107, 70, 193, 0.15), 0 2px 4px rgba(196, 69, 105, 0.1)',
        'aurora-lg': '0 10px 15px rgba(107, 70, 193, 0.2), 0 4px 6px rgba(196, 69, 105, 0.12)',
        'aurora-xl': '0 20px 25px rgba(107, 70, 193, 0.25), 0 10px 10px rgba(196, 69, 105, 0.15)',
        'aurora-2xl': '0 25px 50px rgba(107, 70, 193, 0.3), 0 20px 20px rgba(196, 69, 105, 0.18)',
        'aurora-inner': 'inset 0 2px 4px rgba(107, 70, 193, 0.1)',
        'aurora-glow': '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(107, 70, 193, 0.2)',
        // Legacy shadows (keep for compatibility)
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}