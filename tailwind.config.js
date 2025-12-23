const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'app/**/*.{ts,tsx,js,jsx}',
    'src/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'public/**/*.html'
  ],
  safelist: ['bg-gradient-coral-sky', 'bg-gradient-sky-coral'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        xl: '3.5rem',
      },
      screens: {
        sm: '40rem',
        md: '56rem',
        lg: '64rem',
        xl: '80rem',
        '2xl': '90rem',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--ja-font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--ja-font-serif)', 'var(--ja-font-sans)', 'serif'],
      },
      spacing: {
        0: 'var(--ja-space-0)',
        1: 'var(--ja-space-1)',
        2: 'var(--ja-space-2)',
        3: 'var(--ja-space-3)',
        4: 'var(--ja-space-4)',
        5: 'var(--ja-space-5)',
        6: 'var(--ja-space-6)',
        8: 'var(--ja-space-8)',
        10: 'var(--ja-space-10)',
        12: 'var(--ja-space-12)',
        14: 'var(--ja-space-14)',
        16: 'var(--ja-space-16)',
        18: 'var(--ja-space-18)',
        24: 'var(--ja-space-24)',
        'catalog-filter': 'var(--catalog-filter-pad)',
        'catalog-gap-x': 'var(--catalog-gap-x)',
        'catalog-gap-y': 'var(--catalog-gap-y)',
      },
      maxWidth: {
        'catalog-container': 'var(--catalog-container)',
        'catalog-grid': 'var(--catalog-grid-width)',
      },
      colors: {
        accent: {
          primary: 'rgb(var(--ja-accent-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--ja-accent-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--ja-accent-muted-rgb) / <alpha-value>)',
        },
        neutral: {
          50: 'rgb(var(--ja-neutral-050-rgb) / <alpha-value>)',
          100: 'rgb(var(--ja-neutral-100-rgb) / <alpha-value>)',
          150: 'rgb(var(--ja-neutral-150-rgb) / <alpha-value>)',
          200: 'rgb(var(--ja-neutral-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--ja-neutral-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--ja-neutral-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--ja-neutral-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--ja-neutral-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--ja-neutral-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--ja-neutral-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--ja-neutral-900-rgb) / <alpha-value>)',
          950: 'rgb(var(--ja-neutral-950-rgb) / <alpha-value>)',
        },
        surface: {
          base: 'rgb(var(--ja-surface-base-rgb) / <alpha-value>)',
          panel: 'rgb(var(--ja-surface-panel-rgb) / <alpha-value>)',
          page: 'rgb(var(--ja-surface-page-rgb) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--ja-text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--ja-text-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--ja-text-muted-rgb) / <alpha-value>)',
        },
        border: {
          subtle: 'rgb(var(--ja-border-subtle-rgb) / <alpha-value>)',
          strong: 'rgb(var(--ja-border-strong-rgb) / <alpha-value>)',
        },
        success: 'rgb(var(--ja-success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--ja-warning-rgb) / <alpha-value>)',
        error: 'rgb(var(--ja-error-rgb) / <alpha-value>)',
        brand: {
          coral: 'rgb(var(--ja-accent-primary-rgb) / <alpha-value>)',
          sky: 'rgb(var(--ja-accent-secondary-rgb) / <alpha-value>)',
          accent: 'rgb(var(--ja-accent-muted-rgb) / <alpha-value>)',
          bg: 'rgb(var(--ja-surface-page-rgb) / <alpha-value>)',
          ink: 'rgb(var(--ja-text-primary-rgb) / <alpha-value>)',
          text: 'rgb(var(--ja-text-secondary-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        none: '0px',
        xs: 'var(--ja-radius-xs)',
        sm: 'var(--ja-radius-sm)',
        DEFAULT: 'var(--ja-radius-md)',
        md: 'var(--ja-radius-md)',
        lg: 'var(--ja-radius-lg)',
        xl: 'var(--ja-radius-xl)',
        '2xl': 'var(--ja-radius-xl)',
        pill: 'var(--ja-radius-pill)',
        full: 'var(--ja-radius-pill)',
      },
      boxShadow: {
        soft: 'var(--ja-shadow-soft)',
        medium: 'var(--ja-shadow-medium)',
        focus: 'var(--ja-shadow-focus)',
        'accent-glow': '0 16px 40px rgb(var(--ja-accent-secondary-rgb) / 0.28)',
      },
      backgroundImage: {
        'gradient-coral-sky': 'linear-gradient(0deg, var(--ja-neutral-050), var(--ja-neutral-050))',
        'gradient-sky-coral': 'linear-gradient(0deg, var(--ja-neutral-050), var(--ja-neutral-050))',
        'gradient-neutral-soft': 'linear-gradient(0deg, var(--ja-neutral-050), var(--ja-neutral-050))',
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
          background: 'rgb(var(--ja-surface-base-rgb) / 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgb(var(--ja-surface-base-rgb) / 0.2)',
        },
        '.glass-dark': {
          background: 'rgb(var(--ja-neutral-950-rgb) / 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgb(var(--ja-surface-base-rgb) / 0.1)',
        },
        '.shadow-soft': { boxShadow: theme('boxShadow.soft') },
        '.shadow-medium': { boxShadow: theme('boxShadow.medium') },
        '.shadow-focus-ring': { boxShadow: theme('boxShadow.focus') },
        '.shadow-accent-glow': { boxShadow: theme('boxShadow.accent-glow') },
      })
    }),
    plugin(function ({ addVariant }) {
      addVariant('supports-backdrop', '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))')
    }),
  ],
}
