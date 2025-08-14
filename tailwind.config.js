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
      fontFamily: {
        headline: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // Core HTML Demo Colors (Simplified)
        background: '#FEFCF9', // Ivory mist
        foreground: '#2D3A32', // Graphite green
        muted: '#E8D7D3', // Rose beige
        accent: '#D4AF37', // Champagne gold
        cta: '#C17B47', // Coral gold
        'cta-hover': '#B5653A', // Burnt coral
        
        // Essential colors
        white: '#FFFFFF', // Pure white for cards and text on colored backgrounds
        'gray-600': '#6B7280', // Muted text gray
        
        // Border colors
        border: '#E5E5E5', // Standard borders
        
        // System colors
        error: '#DC2626', // Error red
        success: '#059669', // Success green
        warning: '#D97706', // Warning amber
        
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
    },
  },
  plugins: [],
}