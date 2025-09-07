/**
 * Aurora Design System Feature Flags
 * 
 * Controls the gradual rollout of Aurora Design System components
 * Supports A/B testing and safe migration patterns
 */

export interface FeatureFlagConfig {
  // Component-specific Aurora flags
  AURORA_HERO: boolean;
  AURORA_PRODUCT_CARD: boolean;
  AURORA_NAVIGATION: boolean;
  AURORA_CUSTOMIZER: boolean;
  AURORA_CART: boolean;
  AURORA_CHECKOUT: boolean;
  AURORA_ADMIN: boolean;
  AURORA_FOOTER: boolean;
  
  // Global design version control
  DESIGN_VERSION: 'legacy' | 'demo' | 'hybrid';
  
  // A/B testing controls
  AB_TEST_ENABLED: boolean;
  AB_TEST_PERCENTAGE: number;
  
  // Development tools
  DEV_AURORA_TOGGLE: boolean;
  DEV_VISUAL_DEBUG: boolean;
}

// Environment-based feature flag configuration
const getFeatureFlags = (): FeatureFlagConfig => {
  // Check if running in development
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    // Component-specific flags (can be controlled individually)
    AURORA_HERO: process.env.NEXT_PUBLIC_AURORA_HERO === 'true',
    AURORA_PRODUCT_CARD: process.env.NEXT_PUBLIC_AURORA_PRODUCT_CARD === 'true',
    AURORA_NAVIGATION: process.env.NEXT_PUBLIC_AURORA_NAVIGATION === 'true',
    AURORA_CUSTOMIZER: process.env.NEXT_PUBLIC_AURORA_CUSTOMIZER === 'true',
    AURORA_CART: process.env.NEXT_PUBLIC_AURORA_CART === 'true',
    AURORA_CHECKOUT: process.env.NEXT_PUBLIC_AURORA_CHECKOUT === 'true',
    AURORA_ADMIN: process.env.NEXT_PUBLIC_AURORA_ADMIN === 'true',
    AURORA_FOOTER: process.env.NEXT_PUBLIC_AURORA_FOOTER === 'true',
    
    // Global design version
    DESIGN_VERSION: (process.env.NEXT_PUBLIC_DESIGN_VERSION as FeatureFlagConfig['DESIGN_VERSION']) || 'legacy',
    
    // A/B testing configuration
    AB_TEST_ENABLED: process.env.NEXT_PUBLIC_AB_TEST_ENABLED === 'true',
    AB_TEST_PERCENTAGE: parseInt(process.env.NEXT_PUBLIC_AB_TEST_PERCENTAGE || '50', 10),
    
    // Development tools (only in dev)
    DEV_AURORA_TOGGLE: isDev && process.env.NEXT_PUBLIC_DEV_AURORA_TOGGLE === 'true',
    DEV_VISUAL_DEBUG: isDev && process.env.NEXT_PUBLIC_DEV_VISUAL_DEBUG === 'true',
  };
};

export const FEATURE_FLAGS = getFeatureFlags();

// Migration schedule for automatic progression
export const MIGRATION_SCHEDULE = {
  '2025-09-06': ['hero', 'productCard'],        // Pilot phase
  '2025-09-08': ['navigation', 'footer'],       // Week 2
  '2025-09-10': ['customizer', 'products'],     // Week 2 continued
  '2025-09-12': ['cart', 'checkout'],           // Week 2 end
  '2025-09-14': ['adminPanel'],                 // Week 3
  '2025-09-20': ['allComponents'],              // Full rollout
} as const;

/**
 * Get components that should be active based on migration schedule
 */
export const getScheduledActiveComponents = (): string[] => {
  const today = new Date().toISOString().split('T')[0];
  
  return Object.entries(MIGRATION_SCHEDULE)
    .filter(([date]) => date <= today)
    .flatMap(([_, components]) => components);
};

/**
 * Component names mapping for flag resolution
 */
export const COMPONENT_FLAG_MAP = {
  'hero': 'AURORA_HERO',
  'productCard': 'AURORA_PRODUCT_CARD', 
  'navigation': 'AURORA_NAVIGATION',
  'customizer': 'AURORA_CUSTOMIZER',
  'cart': 'AURORA_CART',
  'checkout': 'AURORA_CHECKOUT',
  'adminPanel': 'AURORA_ADMIN',
  'footer': 'AURORA_FOOTER',
  'allComponents': null, // Special case for full rollout
} as const;

/**
 * Check if a component should use Aurora design
 * @param componentName - Name of the component to check
 * @returns 'aurora' | 'legacy'
 */
export const getDesignVersion = (componentName: string): 'aurora' | 'legacy' => {
  const flags = FEATURE_FLAGS;
  
  // If global design version is set to demo, use Aurora everywhere
  if (flags.DESIGN_VERSION === 'demo') {
    return 'aurora';
  }
  
  // If global design version is legacy, use legacy everywhere (unless component flag overrides)
  if (flags.DESIGN_VERSION === 'legacy') {
    const componentFlag = getComponentFlag(componentName);
    return componentFlag ? 'aurora' : 'legacy';
  }
  
  // Hybrid mode: check individual component flags and schedule
  if (flags.DESIGN_VERSION === 'hybrid') {
    // Check if component is explicitly enabled
    const componentFlag = getComponentFlag(componentName);
    if (componentFlag !== null) {
      return componentFlag ? 'aurora' : 'legacy';
    }
    
    // Check migration schedule
    const activeComponents = getScheduledActiveComponents();
    const isScheduledActive = activeComponents.includes(componentName) || activeComponents.includes('allComponents');
    
    return isScheduledActive ? 'aurora' : 'legacy';
  }
  
  return 'legacy';
};

/**
 * Get the flag value for a specific component
 */
function getComponentFlag(componentName: string): boolean | null {
  const flags = FEATURE_FLAGS;
  
  switch (componentName) {
    case 'hero':
      return flags.AURORA_HERO;
    case 'productCard':
      return flags.AURORA_PRODUCT_CARD;
    case 'navigation':
      return flags.AURORA_NAVIGATION;
    case 'customizer':
      return flags.AURORA_CUSTOMIZER;
    case 'cart':
      return flags.AURORA_CART;
    case 'checkout':
      return flags.AURORA_CHECKOUT;
    case 'adminPanel':
      return flags.AURORA_ADMIN;
    case 'footer':
      return flags.AURORA_FOOTER;
    default:
      return null;
  }
}

/**
 * Simple hash function for consistent A/B testing
 */
export const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get A/B test group for a user
 * @param userId - User identifier for consistent grouping
 * @returns 'control' | 'demo'
 */
export const getABTestGroup = (userId: string): 'control' | 'demo' => {
  if (!FEATURE_FLAGS.AB_TEST_ENABLED) {
    return 'control';
  }
  
  const hash = simpleHash(userId);
  const percentage = hash % 100;
  
  return percentage < FEATURE_FLAGS.AB_TEST_PERCENTAGE ? 'demo' : 'control';
};

/**
 * Development tools for Aurora testing
 */
export const getDevelopmentTools = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return {
    toggleEnabled: FEATURE_FLAGS.DEV_AURORA_TOGGLE,
    visualDebug: FEATURE_FLAGS.DEV_VISUAL_DEBUG,
    
    // Helper to toggle Aurora for specific components
    toggleAurora: (componentName: string, enabled: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`aurora_${componentName}`, enabled.toString());
        window.location.reload();
      }
    },
    
    // Helper to get local override
    getLocalOverride: (componentName: string): boolean | null => {
      if (typeof window === 'undefined') return null;
      
      const stored = localStorage.getItem(`aurora_${componentName}`);
      return stored ? stored === 'true' : null;
    },
  };
};

/**
 * Export for use in components
 */
export { FEATURE_FLAGS as default };

/**
 * Type exports for TypeScript support
 */
export type DesignVersion = 'aurora' | 'legacy';
export type ComponentName = keyof typeof COMPONENT_FLAG_MAP;
export type ABTestGroup = 'control' | 'demo';