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
  'p-0': 'aurora-p-0',
  'p-1': 'aurora-p-token-xs',
  'p-2': 'aurora-p-token-sm',
  'p-3': 'aurora-p-token-sm',
  'p-4': 'aurora-p-token-md',
  'p-5': 'aurora-p-token-md',
  'p-6': 'aurora-p-token-lg',
  'p-8': 'aurora-p-token-xl',
  'p-12': 'aurora-p-token-2xl',
  'p-16': 'aurora-p-token-3xl',
  'p-20': 'aurora-p-token-4xl',
  
  // Padding X
  'px-0': 'aurora-px-0',
  'px-1': 'aurora-px-token-xs',
  'px-2': 'aurora-px-token-sm',
  'px-3': 'aurora-px-token-sm',
  'px-4': 'aurora-px-token-md',
  'px-5': 'aurora-px-token-md',
  'px-6': 'aurora-px-token-lg',
  'px-8': 'aurora-px-token-xl',
  'px-12': 'aurora-px-token-2xl',
  'px-16': 'aurora-px-token-3xl',
  
  // Padding Y  
  'py-0': 'aurora-py-0',
  'py-1': 'aurora-py-token-xs',
  'py-2': 'aurora-py-token-sm',
  'py-3': 'aurora-py-token-sm',
  'py-4': 'aurora-py-token-md',
  'py-5': 'aurora-py-token-md',
  'py-6': 'aurora-py-token-lg',
  'py-8': 'aurora-py-token-xl',
  'py-12': 'aurora-py-token-2xl',
  'py-16': 'aurora-py-token-3xl',
  
  // Margin
  'm-0': 'aurora-m-0',
  'm-1': 'aurora-m-token-xs',
  'm-2': 'aurora-m-token-sm',
  'm-3': 'aurora-m-token-sm',
  'm-4': 'aurora-m-token-md',
  'm-5': 'aurora-m-token-md',
  'm-6': 'aurora-m-token-lg',
  'm-8': 'aurora-m-token-xl',
  'm-12': 'aurora-m-token-2xl',
  'm-16': 'aurora-m-token-3xl',
  
  // Margin Bottom
  'mb-0': 'aurora-mb-0',
  'mb-1': 'aurora-mb-token-xs',
  'mb-2': 'aurora-mb-token-sm',
  'mb-3': 'aurora-mb-token-sm',
  'mb-4': 'aurora-mb-token-md',
  'mb-5': 'aurora-mb-token-md',
  'mb-6': 'aurora-mb-token-lg',
  'mb-8': 'aurora-mb-token-xl',
  'mb-12': 'aurora-mb-token-2xl',
  'mb-16': 'aurora-mb-token-3xl',
  
  // Margin Top
  'mt-0': 'aurora-mt-0',
  'mt-1': 'aurora-mt-token-xs',
  'mt-2': 'aurora-mt-token-sm',
  'mt-3': 'aurora-mt-token-sm',
  'mt-4': 'aurora-mt-token-md',
  'mt-5': 'aurora-mt-token-md',
  'mt-6': 'aurora-mt-token-lg',
  'mt-8': 'aurora-mt-token-xl',
  'mt-12': 'aurora-mt-token-2xl',
  'mt-16': 'aurora-mt-token-3xl',
  
  // Space Between Y
  'space-y-0': 'aurora-space-y-0',
  'space-y-1': 'aurora-space-y-token-xs',
  'space-y-2': 'aurora-space-y-token-sm',
  'space-y-3': 'aurora-space-y-token-sm',
  'space-y-4': 'aurora-space-y-token-md',
  'space-y-5': 'aurora-space-y-token-md',
  'space-y-6': 'aurora-space-y-token-lg',
  'space-y-8': 'aurora-space-y-token-xl',
  
  // Space Between X
  'space-x-0': 'aurora-space-x-0',
  'space-x-1': 'aurora-space-x-token-xs',
  'space-x-2': 'aurora-space-x-token-sm',
  'space-x-3': 'aurora-space-x-token-sm',
  'space-x-4': 'aurora-space-x-token-md',
  'space-x-5': 'aurora-space-x-token-md',
  'space-x-6': 'aurora-space-x-token-lg',
  'space-x-8': 'aurora-space-x-token-xl',
  
  // Gap
  'gap-0': 'aurora-gap-0',
  'gap-1': 'aurora-gap-token-xs',
  'gap-2': 'aurora-gap-token-sm',
  'gap-3': 'aurora-gap-token-sm',
  'gap-4': 'aurora-gap-token-md',
  'gap-5': 'aurora-gap-token-md',
  'gap-6': 'aurora-gap-token-lg',
  'gap-8': 'aurora-gap-token-xl',
  
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
  'rounded-none': 'aurora-rounded-none',
  'rounded-sm': 'aurora-rounded-token-sm',
  'rounded': 'aurora-rounded-token-md',
  'rounded-md': 'aurora-rounded-token-md',
  'rounded-lg': 'aurora-rounded-token-lg',
  'rounded-xl': 'aurora-rounded-token-xl',
  'rounded-2xl': 'aurora-rounded-token-2xl',
  'rounded-3xl': 'aurora-rounded-token-2xl',
  'rounded-full': 'aurora-rounded-token-full',
  
  // Responsive variants
  'rounded-t-sm': 'aurora-rounded-t-token-sm',
  'rounded-t-md': 'aurora-rounded-t-token-md',
  'rounded-t-lg': 'aurora-rounded-t-token-lg',
  'rounded-t-xl': 'aurora-rounded-t-token-xl',
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
  'shadow-sm': 'aurora-shadow-aurora-sm',
  'shadow': 'aurora-shadow-aurora-md',
  'shadow-md': 'aurora-shadow-aurora-md',
  'shadow-lg': 'aurora-shadow-aurora-lg',
  'shadow-xl': 'aurora-shadow-aurora-xl',
  'shadow-2xl': 'aurora-shadow-aurora-xl',
  
  // Special material shadows
  'hover:shadow-lg': 'hover:aurora-shadow-material-gold',
  'hover:shadow-xl': 'hover:aurora-shadow-material-gold-hover',
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