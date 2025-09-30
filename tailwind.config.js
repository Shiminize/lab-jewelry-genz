const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.{ts,tsx,js,jsx}', 'public/**/*.html'],
  safelist: [{ pattern: /^(gradient|glass|shadow-neon|rounded)-(.*)/ }],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        'volt-glow': 'rgb(var(--volt-glow-rgb) / <alpha-value>)',
        'cyber-pink': 'rgb(var(--cyber-pink-rgb) / <alpha-value>)',
        'holo-purple': 'rgb(var(--holo-purple-rgb) / <alpha-value>)',
        'digital-blue': 'rgb(var(--digital-blue-rgb) / <alpha-value>)',
        'acid-yellow': 'rgb(var(--acid-yellow-rgb) / <alpha-value>)',
        void: {
          50: 'rgb(var(--void-50-rgb) / <alpha-value>)',
          200: 'rgb(var(--void-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--void-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--void-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--void-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--void-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--void-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--void-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--void-900-rgb) / <alpha-value>)',
          950: 'rgb(var(--void-950-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        sharp: 'var(--radius-sharp)',
        soft: 'var(--radius-soft)',
        round: 'var(--radius-round)',
        ultra: 'var(--radius-ultra)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        'neon-volt': '0 0 30px rgb(var(--volt-glow-rgb) / 0.5)',
        'neon-cyber': '0 0 30px rgb(var(--cyber-pink-rgb) / 0.5)',
        'neon-holo': '0 0 30px rgb(var(--holo-purple-rgb) / 0.5)',
        'neon-digital': '0 0 30px rgb(var(--digital-blue-rgb) / 0.5)',
        'neon-acid': '0 0 30px rgb(var(--acid-yellow-rgb) / 0.45)',
      },
      backgroundImage: {
        'gradient-volt': 'linear-gradient(135deg, var(--volt-glow) 0%, var(--digital-blue) 100%)',
        'gradient-cyber': 'linear-gradient(135deg, var(--cyber-pink) 0%, var(--digital-blue) 100%)',
        'gradient-holo':
          'linear-gradient(135deg, var(--holo-purple) 0%, var(--cyber-pink) 50%, var(--digital-blue) 100%)',
        'gradient-acid': 'linear-gradient(135deg, var(--acid-yellow) 0%, var(--volt-glow) 100%)',
        'gradient-digital': 'linear-gradient(135deg, var(--digital-blue) 0%, var(--holo-purple) 100%)',
      },
      keyframes: {
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease infinite',
        sparkle: 'sparkle 3s infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.shadow-neon-volt': { boxShadow: theme('boxShadow.neon-volt') },
        '.shadow-neon-cyber': { boxShadow: theme('boxShadow.neon-cyber') },
        '.shadow-neon-holo': { boxShadow: theme('boxShadow.neon-holo') },
        '.shadow-neon-digital': { boxShadow: theme('boxShadow.neon-digital') },
        '.shadow-neon-acid': { boxShadow: theme('boxShadow.neon-acid') },
    })
    }),
    plugin(function ({ addVariant }) {
      addVariant('supports-backdrop', '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))')
    }),
  ],
}
