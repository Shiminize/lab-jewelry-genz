/**
 * Aurora Design System Migration Utilities
 * 
 * Provides safe migration patterns between legacy and Aurora design tokens
 * Supports gradual rollout with feature flags
 */

import { getDesignVersion, type DesignVersion, type ComponentName } from '@/config/featureFlags';
import { clsx, type ClassValue } from 'clsx';

// Migration mapping from legacy Tailwind classes to Aurora tokens
const SPACING_MIGRATION_MAP = {
  // Padding
  'p-0': 'p-0',
  'p-1': 'p-token-xs',
  'p-2': 'p-token-sm',
  'p-3': 'p-token-sm',
  'p-4': 'p-token-md',
  'p-5': 'p-token-md',
  'p-6': 'p-token-lg',
  'p-8': 'p-token-xl',
  'p-12': 'p-token-2xl',
  'p-16': 'p-token-3xl',
  'p-20': 'p-token-4xl',
  
  // Padding X
  'px-0': 'px-0',
  'px-1': 'px-token-xs',
  'px-2': 'px-token-sm',
  'px-3': 'px-token-sm',
  'px-4': 'px-token-md',
  'px-5': 'px-token-md',
  'px-6': 'px-token-lg',
  'px-8': 'px-token-xl',
  'px-12': 'px-token-2xl',
  'px-16': 'px-token-3xl',
  
  // Padding Y  
  'py-0': 'py-0',
  'py-1': 'py-token-xs',
  'py-2': 'py-token-sm',
  'py-3': 'py-token-sm',
  'py-4': 'py-token-md',
  'py-5': 'py-token-md',
  'py-6': 'py-token-lg',
  'py-8': 'py-token-xl',
  'py-12': 'py-token-2xl',
  'py-16': 'py-token-3xl',
  
  // Margin
  'm-0': 'm-0',
  'm-1': 'm-token-xs',
  'm-2': 'm-token-sm',
  'm-3': 'm-token-sm',
  'm-4': 'm-token-md',
  'm-5': 'm-token-md',
  'm-6': 'm-token-lg',
  'm-8': 'm-token-xl',
  'm-12': 'm-token-2xl',
  'm-16': 'm-token-3xl',
  
  // Margin Bottom
  'mb-0': 'mb-0',
  'mb-1': 'mb-token-xs',
  'mb-2': 'mb-token-sm',
  'mb-3': 'mb-token-sm',
  'mb-4': 'mb-token-md',
  'mb-5': 'mb-token-md',
  'mb-6': 'mb-token-lg',
  'mb-8': 'mb-token-xl',
  'mb-12': 'mb-token-2xl',
  'mb-16': 'mb-token-3xl',
  
  // Margin Top
  'mt-0': 'mt-0',
  'mt-1': 'mt-token-xs',
  'mt-2': 'mt-token-sm',
  'mt-3': 'mt-token-sm',
  'mt-4': 'mt-token-md',
  'mt-5': 'mt-token-md',
  'mt-6': 'mt-token-lg',
  'mt-8': 'mt-token-xl',
  'mt-12': 'mt-token-2xl',
  'mt-16': 'mt-token-3xl',
  
  // Space Between Y
  'space-y-0': 'space-y-0',
  'space-y-1': 'space-y-token-xs',
  'space-y-2': 'space-y-token-sm',
  'space-y-3': 'space-y-token-sm',
  'space-y-4': 'space-y-token-md',
  'space-y-5': 'space-y-token-md',
  'space-y-6': 'space-y-token-lg',
  'space-y-8': 'space-y-token-xl',
  
  // Space Between X
  'space-x-0': 'space-x-0',
  'space-x-1': 'space-x-token-xs',
  'space-x-2': 'space-x-token-sm',
  'space-x-3': 'space-x-token-sm',
  'space-x-4': 'space-x-token-md',
  'space-x-5': 'space-x-token-md',
  'space-x-6': 'space-x-token-lg',
  'space-x-8': 'space-x-token-xl',
  
  // Gap
  'gap-0': 'gap-0',
  'gap-1': 'gap-token-xs',
  'gap-2': 'gap-token-sm',
  'gap-3': 'gap-token-sm',
  'gap-4': 'gap-token-md',
  'gap-5': 'gap-token-md',
  'gap-6': 'gap-token-lg',
  'gap-8': 'gap-token-xl',
  
  // Positioning
  'top-0': 'aurora-top-0',
  'top-1': 'aurora-top-token-xs',
  'top-2': 'aurora-top-token-sm',
  'top-4': 'aurora-top-token-md',
  'top-6': 'aurora-top-token-lg',
  'top-8': 'aurora-top-token-xl',
  
  'bottom-0': 'aurora-bottom-0',
  'bottom-1': 'aurora-bottom-token-xs',
  'bottom-2': 'aurora-bottom-token-sm',
  'bottom-4': 'aurora-bottom-token-md',
  'bottom-6': 'aurora-bottom-token-lg',
  'bottom-8': 'aurora-bottom-token-xl',
  
  'left-0': 'aurora-left-0',
  'left-1': 'aurora-left-token-xs',
  'left-2': 'aurora-left-token-sm',
  'left-4': 'aurora-left-token-md',
  'left-6': 'aurora-left-token-lg',
  'left-8': 'aurora-left-token-xl',
  
  'right-0': 'aurora-right-0',
  'right-1': 'aurora-right-token-xs',
  'right-2': 'aurora-right-token-sm',
  'right-4': 'aurora-right-token-md',
  'right-6': 'aurora-right-token-lg',
  'right-8': 'aurora-right-token-xl',
} as const;

const BORDER_RADIUS_MIGRATION_MAP = {
  'rounded-none': 'rounded-none',
  'rounded-sm': 'rounded-token-sm',
  'rounded': 'rounded-token-md',
  'rounded-md': 'rounded-token-md',
  'rounded-lg': 'rounded-token-lg',
  'rounded-xl': 'rounded-token-xl',
  'rounded-2xl': 'rounded-token-2xl',
  'rounded-3xl': 'rounded-token-2xl',
  'rounded-full': 'rounded-token-full',

  // Responsive variants
  'rounded-t-sm': 'rounded-t-token-sm',
  'rounded-t-md': 'rounded-t-token-md',
  'rounded-t-lg': 'rounded-t-token-lg',
  'rounded-t-xl': 'rounded-t-token-xl',
} as const;

const COLOR_MIGRATION_MAP = {
  // Background colors
  'bg-purple-600': 'aurora-bg-brand-nebulaPurple',
  'bg-purple-700': 'aurora-bg-brand-luxuryMidnight',
  'bg-gray-100': 'aurora-bg-brand-lunarGrey',
  'bg-gray-800': 'aurora-bg-brand-cosmicBlack',
  'bg-gray-900': 'aurora-bg-brand-luxuryMidnight',
  
  // Text colors
  'text-purple-600': 'aurora-text-brand-nebulaPurple',
  'text-gray-600': 'aurora-text-brand-lunarGrey',
  'text-gray-800': 'aurora-text-brand-cosmicBlack',
  'text-white': 'aurora-text-white',
  
  // Border colors
  'border-purple-200': 'aurora-border-brand-nebulaPurple',
  'border-gray-200': 'aurora-border-brand-lunarGrey',
  'border-gray-300': 'aurora-border-brand-lunarGrey',
} as const;

const SHADOW_MIGRATION_MAP = {
  'shadow-sm': 'shadow-token-sm',
  'shadow': 'shadow-token-md',
  'shadow-md': 'shadow-token-md',
  'shadow-lg': 'shadow-token-lg',
  'shadow-xl': 'shadow-token-xl',
  'shadow-2xl': 'shadow-token-xl',

  // Hover variants mapped to token shadows
  'hover:shadow-sm': 'hover:shadow-token-sm',
  'hover:shadow': 'hover:shadow-token-md',
  'hover:shadow-md': 'hover:shadow-token-md',
  'hover:shadow-lg': 'hover:shadow-token-lg',
  'hover:shadow-xl': 'hover:shadow-token-xl',
  'hover:shadow-2xl': 'hover:shadow-token-xl',
} as const;

// Complete migration map
export const MIGRATION_MAP = {
  ...SPACING_MIGRATION_MAP,
  ...BORDER_RADIUS_MIGRATION_MAP,
  ...COLOR_MIGRATION_MAP,
  ...SHADOW_MIGRATION_MAP,
} as const;

/**
 * Get the appropriate className based on design version
 * 
 * @param legacy - Legacy Tailwind className
 * @param aurora - Aurora Design System className
 * @param componentName - Name of the component (for feature flag lookup)
 * @returns The appropriate className based on current design version
 */
export const getClassName = (
  legacy: string,
  aurora: string,
  componentName?: ComponentName
): string => {
  const designVersion = componentName ? getDesignVersion(componentName) : 'legacy';
  return designVersion === 'aurora' ? aurora : legacy;
};

/**
 * Automatically migrate a className string based on the migration map
 * 
 * @param className - Space-separated className string
 * @param componentName - Name of the component (for feature flag lookup)
 * @returns Migrated className string
 */
export const migrateClassName = (
  className: string,
  componentName?: ComponentName
): string => {
  const designVersion = componentName ? getDesignVersion(componentName) : 'legacy';
  
  if (designVersion === 'legacy') {
    return className;
  }
  
  // Split classes and migrate each one
  const classes = className.split(' ').filter(Boolean);
  const migratedClasses = classes.map(cls => {
    // Check if this class has a direct migration
    if (cls in MIGRATION_MAP) {
      return MIGRATION_MAP[cls as keyof typeof MIGRATION_MAP];
    }
    
    // Handle responsive variants (e.g., md:p-4 -> md:aurora-p-token-md)
    const responsiveMatch = cls.match(/^(sm|md|lg|xl|2xl):(.+)$/);
    if (responsiveMatch) {
      const [, breakpoint, baseClass] = responsiveMatch;
      if (baseClass in MIGRATION_MAP) {
        return `${breakpoint}:${MIGRATION_MAP[baseClass as keyof typeof MIGRATION_MAP]}`;
      }
    }
    
    // Handle hover variants (e.g., hover:p-4 -> hover:aurora-p-token-md)
    const hoverMatch = cls.match(/^(hover|focus|active):(.+)$/);
    if (hoverMatch) {
      const [, state, baseClass] = hoverMatch;
      if (baseClass in MIGRATION_MAP) {
        return `${state}:${MIGRATION_MAP[baseClass as keyof typeof MIGRATION_MAP]}`;
      }
    }
    
    // Return original class if no migration found
    return cls;
  });
  
  return migratedClasses.join(' ');
};

/**
 * Enhanced className helper that combines clsx with Aurora migration
 * 
 * @param componentName - Component name for feature flag lookup
 * @param classes - Class values (same as clsx)
 * @returns Migrated and combined className string
 */
export const cn = (componentName: ComponentName | null, ...classes: ClassValue[]): string => {
  const combinedClassName = clsx(...classes);
  
  if (!componentName) {
    return combinedClassName;
  }
  
  return migrateClassName(combinedClassName, componentName);
};

/**
 * Material-specific className helper for jewelry customization
 * 
 * @param material - Material type ('gold', 'platinum', 'roseGold')
 * @param baseClasses - Base className string
 * @param componentName - Component name for feature flag lookup
 * @returns Material-specific Aurora classes
 */
export const getMaterialClassName = (
  material: 'gold' | 'platinum' | 'roseGold',
  baseClasses: string,
  componentName?: ComponentName
): string => {
  const designVersion = componentName ? getDesignVersion(componentName) : 'legacy';
  
  if (designVersion === 'legacy') {
    return baseClasses;
  }
  
  const materialClassMap = {
    gold: {
      shadow: 'aurora-shadow-material-gold',
      hoverShadow: 'hover:aurora-shadow-material-gold-hover',
      bg: 'aurora-bg-material-gold-base',
      hoverBg: 'hover:aurora-bg-material-gold-hover',
      text: 'aurora-text-material-gold-warm',
      prismatic: 'aurora-bg-material-gold-prismatic',
      emotional: 'luxury-emotional-trigger',
    },
    platinum: {
      shadow: 'aurora-shadow-material-platinum',
      hoverShadow: 'hover:aurora-shadow-material-platinum-hover',
      bg: 'aurora-bg-material-platinum-base',
      hoverBg: 'hover:aurora-bg-material-platinum-hover',
      text: 'aurora-text-material-platinum-cool',
      prismatic: 'aurora-bg-material-platinum-prismatic',
      emotional: 'luxury-emotional-trigger',
    },
    roseGold: {
      shadow: 'aurora-shadow-material-rose-gold',
      hoverShadow: 'hover:aurora-shadow-material-rose-gold-hover',
      bg: 'aurora-bg-material-roseGold-base',
      hoverBg: 'hover:aurora-bg-material-roseGold-hover',
      text: 'aurora-text-material-roseGold-romantic',
      prismatic: 'aurora-bg-material-roseGold-prismatic',
      emotional: 'romantic-emotional-trigger',
    },
  };
  
  // Migrate base classes and add material-specific classes
  const migratedBase = migrateClassName(baseClasses, componentName);
  const materialClasses = materialClassMap[material];
  
  return `${migratedBase} ${materialClasses.shadow} ${materialClasses.emotional}`;
};

/**
 * Emotional trigger className helper
 * 
 * @param emotion - Emotion type ('luxury', 'romantic', 'trust', 'warning')
 * @param baseClasses - Base className string
 * @param componentName - Component name for feature flag lookup
 * @returns Classes with emotional triggers applied
 */
export const getEmotionalClassName = (
  emotion: 'luxury' | 'romantic' | 'trust' | 'warning',
  baseClasses: string,
  componentName?: ComponentName
): string => {
  const designVersion = componentName ? getDesignVersion(componentName) : 'legacy';
  
  if (designVersion === 'legacy') {
    return baseClasses;
  }
  
  const emotionalTriggerMap = {
    luxury: 'luxury-emotional-trigger',
    romantic: 'romantic-emotional-trigger',
    trust: 'eco-trust-trigger',
    warning: 'aurora-bg-emotion-warning aurora-text-white',
  };
  
  const migratedBase = migrateClassName(baseClasses, componentName);
  const emotionalClass = emotionalTriggerMap[emotion];
  
  return `${migratedBase} ${emotionalClass}`;
};

/**
 * Debug helper to compare legacy vs Aurora classNames
 * Only available in development
 */
export const debugClassNames = (
  legacy: string,
  componentName?: ComponentName
): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const migrated = componentName ? migrateClassName(legacy, componentName) : legacy;
  
  console.group(`🎨 Aurora Migration Debug: ${componentName || 'Unknown'}`);

  console.groupEnd();
};

/**
 * Batch migration helper for multiple className patterns
 * Useful for migrating entire files
 */
export const batchMigrateClassNames = (
  classNameMap: Record<string, string>,
  componentName?: ComponentName
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  Object.entries(classNameMap).forEach(([key, className]) => {
    result[key] = componentName ? migrateClassName(className, componentName) : className;
  });
  
  return result;
};

/**
 * Type exports for TypeScript support
 */
export type MigrationMap = typeof MIGRATION_MAP;
export type LegacyClassName = keyof MigrationMap;
export type AuroraClassName = MigrationMap[LegacyClassName];

/**
 * Utility to check if a className needs migration
 */
export const needsMigration = (className: string): boolean => {
  return className.split(' ').some(cls => cls in MIGRATION_MAP);
};

/**
 * Get migration statistics for a className string
 */
export const getMigrationStats = (className: string) => {
  const classes = className.split(' ').filter(Boolean);
  const migratableClasses = classes.filter(cls => cls in MIGRATION_MAP);
  
  return {
    totalClasses: classes.length,
    migratableClasses: migratableClasses.length,
    migrationPercentage: Math.round((migratableClasses.length / classes.length) * 100),
    unmigratableClasses: classes.filter(cls => !(cls in MIGRATION_MAP)),
  };
};