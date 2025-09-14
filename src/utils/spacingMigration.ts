/**
 * Spacing Migration Utility
 * CLAUDE_RULES compliant: Simple, maintainable utility for token to Tailwind migration
 * Maps design tokens to direct Tailwind spacing classes
 */

export const tokenToSpacing = {
  // Padding/Margin tokens to Tailwind
  'token-xs': '1',     // 0.25rem = 4px
  'token-sm': '2',     // 0.5rem = 8px
  'token-md': '4',     // 1rem = 16px
  'token-lg': '6',     // 1.5rem = 24px
  'token-xl': '8',     // 2rem = 32px
  'token-2xl': '12',   // 3rem = 48px
  'token-3xl': '16',   // 4rem = 64px
  'token-4xl': '20',   // 5rem = 80px
  'token-5xl': '24',   // 6rem = 96px
  'token-6xl': '32',   // 8rem = 128px
  'token-8xl': '48',   // 12rem = 192px
} as const

export const containerWidthMap = {
  // Standardize container widths
  'max-w-7xl': 'max-w-6xl',  // 80rem → 72rem (1280px → 1152px)
  'max-w-6xl': 'max-w-6xl',  // Keep 72rem (1152px)
  'max-w-5xl': 'max-w-4xl',  // 64rem → 56rem (1024px → 896px)
  'max-w-4xl': 'max-w-4xl',  // Keep 56rem (896px) for content
  'max-w-3xl': 'max-w-3xl',  // Keep 48rem (768px) for forms
  'max-w-2xl': 'max-w-2xl',  // Keep 42rem (672px) for modals
  'max-w-xl': 'max-w-xl',    // Keep 36rem (576px) for narrow content
} as const

/**
 * Convert token-based spacing class to direct Tailwind class
 * @param className - The class string containing token references
 * @returns The converted class string with direct Tailwind spacing
 */
export function migrateSpacingClass(className: string): string {
  let migratedClass = className
  
  // Replace padding tokens
  Object.entries(tokenToSpacing).forEach(([token, spacing]) => {
    migratedClass = migratedClass
      .replace(new RegExp(`py-${token}\\b`, 'g'), `py-${spacing}`)
      .replace(new RegExp(`px-${token}\\b`, 'g'), `px-${spacing}`)
      .replace(new RegExp(`pt-${token}\\b`, 'g'), `pt-${spacing}`)
      .replace(new RegExp(`pb-${token}\\b`, 'g'), `pb-${spacing}`)
      .replace(new RegExp(`pl-${token}\\b`, 'g'), `pl-${spacing}`)
      .replace(new RegExp(`pr-${token}\\b`, 'g'), `pr-${spacing}`)
      .replace(new RegExp(`p-${token}\\b`, 'g'), `p-${spacing}`)
  })
  
  // Replace margin tokens
  Object.entries(tokenToSpacing).forEach(([token, spacing]) => {
    migratedClass = migratedClass
      .replace(new RegExp(`my-${token}\\b`, 'g'), `my-${spacing}`)
      .replace(new RegExp(`mx-${token}\\b`, 'g'), `mx-${spacing}`)
      .replace(new RegExp(`mt-${token}\\b`, 'g'), `mt-${spacing}`)
      .replace(new RegExp(`mb-${token}\\b`, 'g'), `mb-${spacing}`)
      .replace(new RegExp(`ml-${token}\\b`, 'g'), `ml-${spacing}`)
      .replace(new RegExp(`mr-${token}\\b`, 'g'), `mr-${spacing}`)
      .replace(new RegExp(`m-${token}\\b`, 'g'), `m-${spacing}`)
  })
  
  // Replace gap tokens
  Object.entries(tokenToSpacing).forEach(([token, spacing]) => {
    migratedClass = migratedClass
      .replace(new RegExp(`gap-${token}\\b`, 'g'), `gap-${spacing}`)
      .replace(new RegExp(`gap-x-${token}\\b`, 'g'), `gap-x-${spacing}`)
      .replace(new RegExp(`gap-y-${token}\\b`, 'g'), `gap-y-${spacing}`)
  })
  
  // Replace space tokens
  Object.entries(tokenToSpacing).forEach(([token, spacing]) => {
    migratedClass = migratedClass
      .replace(new RegExp(`space-x-${token}\\b`, 'g'), `space-x-${spacing}`)
      .replace(new RegExp(`space-y-${token}\\b`, 'g'), `space-y-${spacing}`)
  })
  
  // Standardize container widths
  Object.entries(containerWidthMap).forEach(([old, standardized]) => {
    migratedClass = migratedClass.replace(new RegExp(`\\b${old}\\b`, 'g'), standardized)
  })
  
  return migratedClass
}

/**
 * Get responsive spacing classes with migration
 * @param base - Base spacing token
 * @param sm - Small breakpoint token
 * @param md - Medium breakpoint token
 * @param lg - Large breakpoint token
 * @returns Migrated responsive spacing classes
 */
export function getResponsiveSpacing(
  base: keyof typeof tokenToSpacing,
  sm?: keyof typeof tokenToSpacing,
  md?: keyof typeof tokenToSpacing,
  lg?: keyof typeof tokenToSpacing
): string {
  const classes = [`py-${tokenToSpacing[base]}`]
  
  if (sm) classes.push(`sm:py-${tokenToSpacing[sm]}`)
  if (md) classes.push(`md:py-${tokenToSpacing[md]}`)
  if (lg) classes.push(`lg:py-${tokenToSpacing[lg]}`)
  
  return classes.join(' ')
}

/**
 * Feature flag for gradual spacing migration
 * This will be replaced with actual feature flag service
 */
export const SPACING_MIGRATION_FLAGS = {
  hero: true,
  valueProp: true,
  products: true,
  navigation: false,
  customizer: false,
  forms: false,
  admin: false,
} as const

/**
 * Check if a component should use migrated spacing
 * @param component - Component name to check
 * @returns Boolean indicating if migration is enabled
 */
export function useSpacingMigration(component: keyof typeof SPACING_MIGRATION_FLAGS): boolean {
  return SPACING_MIGRATION_FLAGS[component] || false
}