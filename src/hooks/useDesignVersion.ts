/**
 * Aurora Design System Version Management Hook with A/B Testing
 * 
 * Provides React components with design version control and A/B testing
 * Integrates with feature flags for safe Aurora migration and includes
 * user ID assignment with localStorage persistence for consistent experience
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getDesignVersion, 
  getABTestGroup, 
  getDevelopmentTools,
  type DesignVersion, 
  type ComponentName, 
  type ABTestGroup 
} from '@/config/featureFlags';

// A/B Testing Configuration
const AB_TEST_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_AB_TEST_ENABLED === 'true',
  splitRatio: 0.5, // 50/50 split
  userIdKey: 'genzjewelry_user_id',
  assignmentKey: 'genzjewelry_ab_assignment'
};

/**
 * Generates or retrieves a persistent user ID for A/B testing
 */
function getUserId(): string {
  if (typeof window === 'undefined') return 'ssr-user';
  
  let userId = localStorage.getItem(AB_TEST_CONFIG.userIdKey);
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(AB_TEST_CONFIG.userIdKey, userId);
  }
  
  return userId;
}

/**
 * Deterministic assignment based on user ID hash for consistent variants
 */
function assignUserToVariant(userId: string): DesignVersion {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const normalizedHash = Math.abs(hash) / 2147483647;
  return normalizedHash < AB_TEST_CONFIG.splitRatio ? 'aurora' : 'legacy';
}

/**
 * Gets or creates A/B test assignment with localStorage persistence
 */
function getABTestAssignment(): { version: DesignVersion; userId: string; isNewUser: boolean } {
  if (typeof window === 'undefined') {
    return { version: 'legacy', userId: 'ssr-user', isNewUser: false };
  }
  
  const userId = getUserId();
  const assignmentKey = `${AB_TEST_CONFIG.assignmentKey}_${userId}`;
  const stored = localStorage.getItem(assignmentKey);
  
  if (stored && (stored === 'legacy' || stored === 'aurora')) {
    return { version: stored as DesignVersion, userId, isNewUser: false };
  }
  
  // New user - assign variant and persist
  const assignment = assignUserToVariant(userId);
  localStorage.setItem(assignmentKey, assignment);
  
  return { version: assignment, userId, isNewUser: true };
}

interface UseDesignVersionOptions {
  componentName?: ComponentName;
  enableABTest?: boolean;
  userId?: string;
  defaultVersion?: DesignVersion;
}

interface UseDesignVersionReturn {
  designVersion: DesignVersion;
  isAurora: boolean;
  isLegacy: boolean;
  abTestGroup: ABTestGroup | null;
  
  // A/B Testing data
  abTestUserId: string;
  isABTestActive: boolean;
  isNewUser: boolean;
  
  // Development tools (only in dev)
  devTools: {
    toggle: () => void;
    forceAurora: () => void;
    forceLegacy: () => void;
    getLocalOverride: () => boolean | null;
  } | null;
  
  // Utility functions
  getClassName: (legacy: string, aurora: string) => string;
  getMigrationStatus: () => {
    version: DesignVersion;
    source: 'flag' | 'schedule' | 'abtest' | 'default';
    timestamp: number;
  };
}

/**
 * Hook for managing design version in React components
 */
export const useDesignVersion = (options: UseDesignVersionOptions = {}): UseDesignVersionReturn => {
  const {
    componentName,
    enableABTest = false,
    userId,
    defaultVersion = 'legacy'
  } = options;

  const [designVersion, setDesignVersion] = useState<DesignVersion>(defaultVersion);
  const [abTestGroup, setABTestGroup] = useState<ABTestGroup | null>(null);
  const [migrationSource, setMigrationSource] = useState<'flag' | 'schedule' | 'abtest' | 'default'>('default');

  // Get development tools (only in dev)
  const devTools = useMemo(() => {
    const tools = getDevelopmentTools();
    if (!tools || !componentName) return null;

    return {
      toggle: () => {
        const current = getDesignVersion(componentName);
        const newVersion = current === 'aurora' ? 'legacy' : 'aurora';
        tools.toggleAurora(componentName, newVersion === 'aurora');
        setDesignVersion(newVersion);
      },
      
      forceAurora: () => {
        if (tools.toggleAurora && componentName) {
          tools.toggleAurora(componentName, true);
          setDesignVersion('aurora');
        }
      },
      
      forceLegacy: () => {
        if (tools.toggleAurora && componentName) {
          tools.toggleAurora(componentName, false);
          setDesignVersion('legacy');
        }
      },
      
      getLocalOverride: () => {
        return tools.getLocalOverride && componentName ? tools.getLocalOverride(componentName) : null;
      },
    };
  }, [componentName]);

  // A/B Testing state
  const [abTestUserId, setAbTestUserId] = useState<string>('');
  const [isABTestActive, setIsABTestActive] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  // Determine design version based on feature flags and A/B testing
  useEffect(() => {
    let version: DesignVersion = defaultVersion;
    let source: typeof migrationSource = 'default';
    let testGroup: ABTestGroup | null = null;

    // Check for local development override first
    const localOverride = devTools?.getLocalOverride ? devTools.getLocalOverride() : null;
    if (localOverride !== null) {
      version = localOverride ? 'aurora' : 'legacy';
      source = 'flag';
    }

    // Handle A/B testing if enabled
    if (enableABTest && AB_TEST_CONFIG.enabled && localOverride === null) {
      const abTestResult = getABTestAssignment();
      setAbTestUserId(abTestResult.userId);
      setIsNewUser(abTestResult.isNewUser);
      setIsABTestActive(true);
      
      version = abTestResult.version;
      testGroup = abTestResult.version === 'aurora' ? 'demo' : 'control';
      source = 'abtest';
    }
    // If component name is provided and no A/B testing, check feature flags
    else if (componentName && localOverride === null) {
      version = getDesignVersion(componentName);
      source = 'flag';
      
      // Still try to get user ID for tracking purposes
      if (typeof window !== 'undefined') {
        setAbTestUserId(getUserId());
      }
    }
    // Fallback to provided userId or generate one
    else if (!enableABTest && typeof window !== 'undefined') {
      setAbTestUserId(userId || getUserId());
    }

    setDesignVersion(version);
    setABTestGroup(testGroup);
    setMigrationSource(source);
  }, [componentName, enableABTest, userId, defaultVersion, devTools]);

  // Utility function for className selection
  const getClassName = useCallback((legacy: string, aurora: string): string => {
    return designVersion === 'aurora' ? aurora : legacy;
  }, [designVersion]);

  // Migration status for debugging and analytics
  const getMigrationStatus = useCallback(() => ({
    version: designVersion,
    source: migrationSource,
    timestamp: Date.now(),
  }), [designVersion, migrationSource]);

  return {
    designVersion,
    isAurora: designVersion === 'aurora',
    isLegacy: designVersion === 'legacy',
    abTestGroup,
    
    // A/B Testing data
    abTestUserId,
    isABTestActive,
    isNewUser,
    
    devTools,
    getClassName,
    getMigrationStatus,
  };
};

/**
 * Hook specifically for material selection components
 * Includes material-specific Aurora features
 */
interface UseMaterialDesignOptions extends UseDesignVersionOptions {
  material?: 'gold' | 'platinum' | 'roseGold';
  enableEmotionalTriggers?: boolean;
}

interface UseMaterialDesignReturn extends UseDesignVersionReturn {
  materialClasses: {
    shadow: string;
    hoverShadow: string;
    prismatic: string;
    emotional: string;
    ripple: string;
  };
  
  triggerAnimation: (type: 'select' | 'hover' | 'ripple') => void;
}

export const useMaterialDesign = (options: UseMaterialDesignOptions = {}): UseMaterialDesignReturn => {
  const { material = 'gold', enableEmotionalTriggers = true, ...baseOptions } = options;
  const baseReturn = useDesignVersion(baseOptions);
  
  const [animationTrigger, setAnimationTrigger] = useState<string>('');

  // Material-specific class mappings
  const materialClasses = useMemo(() => {
    if (baseReturn.designVersion === 'legacy') {
      return {
        shadow: 'shadow-lg',
        hoverShadow: 'hover:shadow-xl',
        prismatic: '',
        emotional: '',
        ripple: '',
      };
    }

    const materialMap = {
      gold: {
        shadow: 'aurora-shadow-material-gold',
        hoverShadow: 'hover:aurora-shadow-material-gold-hover',
        prismatic: 'aurora-bg-material-gold-prismatic',
        emotional: enableEmotionalTriggers ? 'luxury-emotional-trigger' : '',
        ripple: 'aurora-animate-material-ripple',
      },
      platinum: {
        shadow: 'aurora-shadow-material-platinum',
        hoverShadow: 'hover:aurora-shadow-material-platinum-hover',
        prismatic: 'aurora-bg-material-platinum-prismatic',
        emotional: enableEmotionalTriggers ? 'luxury-emotional-trigger' : '',
        ripple: 'aurora-animate-material-ripple',
      },
      roseGold: {
        shadow: 'aurora-shadow-material-rose-gold',
        hoverShadow: 'hover:aurora-shadow-material-rose-gold-hover',
        prismatic: 'aurora-bg-material-roseGold-prismatic',
        emotional: enableEmotionalTriggers ? 'romantic-emotional-trigger' : '',
        ripple: 'aurora-animate-material-ripple',
      },
    };

    return materialMap[material];
  }, [baseReturn.designVersion, material, enableEmotionalTriggers]);

  // Animation trigger function
  const triggerAnimation = useCallback((type: 'select' | 'hover' | 'ripple') => {
    if (baseReturn.designVersion === 'aurora') {
      setAnimationTrigger(type);
      // Reset after animation completes
      setTimeout(() => setAnimationTrigger(''), 800);
    }
  }, [baseReturn.designVersion]);

  return {
    ...baseReturn,
    materialClasses,
    triggerAnimation,
  };
};

/**
 * Hook for A/B testing Aurora design changes
 * Provides analytics tracking and conversion metrics
 */
interface UseAuroraABTestOptions {
  testName: string;
  componentName: ComponentName;
  userId?: string;
  onTestAssignment?: (group: ABTestGroup, metadata: any) => void;
  onConversion?: (group: ABTestGroup, event: string, metadata: any) => void;
}

interface UseAuroraABTestReturn {
  testGroup: ABTestGroup;
  designVersion: DesignVersion;
  trackConversion: (event: string, metadata?: any) => void;
  trackEvent: (event: string, metadata?: any) => void;
}

export const useAuroraABTest = (options: UseAuroraABTestOptions): UseAuroraABTestReturn => {
  const {
    testName,
    componentName,
    userId = 'anonymous',
    onTestAssignment,
    onConversion,
  } = options;

  const { designVersion, abTestGroup } = useDesignVersion({
    componentName,
    enableABTest: true,
    userId,
  });

  const testGroup = abTestGroup || 'control';

  // Track test assignment on mount
  useEffect(() => {
    if (onTestAssignment) {
      onTestAssignment(testGroup, {
        testName,
        componentName,
        designVersion,
        timestamp: Date.now(),
        userId,
      });
    }
  }, [testGroup, testName, componentName, designVersion, userId, onTestAssignment]);

  // Conversion tracking
  const trackConversion = useCallback((event: string, metadata: any = {}) => {
    if (onConversion) {
      onConversion(testGroup, event, {
        testName,
        componentName,
        designVersion,
        timestamp: Date.now(),
        userId,
        ...metadata,
      });
    }
  }, [testGroup, testName, componentName, designVersion, userId, onConversion]);

  // General event tracking
  const trackEvent = useCallback((event: string, metadata: any = {}) => {
    // Could integrate with analytics service here
    if (process.env.NODE_ENV === 'development') {
      console.log('🔬 Aurora A/B Test Event:', {
        event,
        testGroup,
        testName,
        componentName,
        designVersion,
        metadata,
      });
    }
  }, [testGroup, testName, componentName, designVersion]);

  return {
    testGroup,
    designVersion,
    trackConversion,
    trackEvent,
  };
};

/**
 * Simple hook for conditional Aurora styling
 * Useful for quick className switching
 */
export const useAuroraClassName = (
  componentName: ComponentName,
  legacyClass: string,
  auroraClass: string
): string => {
  const { getClassName } = useDesignVersion({ componentName });
  return getClassName(legacyClass, auroraClass);
};

/**
 * Development-only hook for Aurora debugging
 * Shows migration status and provides testing tools
 */
export const useAuroraDebug = (componentName?: ComponentName) => {
  const versionData = useDesignVersion({ componentName });
  
  const debugTools = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return {
      ...versionData,
      
      logStatus: () => {
        console.group(`🎨 Aurora Debug: ${componentName || 'Global'}`);
        console.log('Design Version:', versionData.designVersion);
        console.log('Migration Status:', versionData.getMigrationStatus());
        console.log('Development Tools:', versionData.devTools);
        console.groupEnd();
      },
      
      runMigrationTest: () => {
        if (!componentName) return;
        
        console.log('🧪 Running migration test...');
        const legacy = versionData.getClassName('p-4 rounded-lg shadow-md', 'aurora-p-token-md aurora-rounded-token-lg aurora-shadow-aurora-md');
        console.log('Migration result:', legacy);
      },
    };
  }, [versionData, componentName]);

  return debugTools;
};

/**
 * A/B Test Event Tracking Utility
 * Tracks user interactions for A/B test analysis
 */
export function trackABTestEvent(
  event: 'impression' | 'interaction' | 'conversion',
  component: string,
  version: DesignVersion,
  userId: string,
  metadata: Record<string, any> = {}
) {
  if (typeof window === 'undefined') return;

  const eventData = {
    event,
    component,
    version,
    userId,
    timestamp: Date.now(),
    url: window.location.pathname,
    ...metadata
  };

  // Store in localStorage for development/debugging
  const events = JSON.parse(localStorage.getItem('genzjewelry_ab_events') || '[]');
  events.push(eventData);

  // Keep only last 200 events
  if (events.length > 200) {
    events.splice(0, events.length - 200);
  }

  localStorage.setItem('genzjewelry_ab_events', JSON.stringify(events));

  // In development, also log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 A/B Test Event:', eventData);
  }

  // In production, this would send to analytics service
  // analyticsService.track('ab_test_event', eventData);
}

/**
 * Simplified hook for A/B testing with automatic event tracking
 */
export function useABTest(componentName: string, enableTracking: boolean = true) {
  const { 
    designVersion, 
    isAurora, 
    abTestUserId, 
    isABTestActive 
  } = useDesignVersion({ 
    enableABTest: true,
    componentName: componentName as ComponentName 
  });

  // Track impression on mount
  useEffect(() => {
    if (enableTracking && isABTestActive && abTestUserId) {
      trackABTestEvent('impression', componentName, designVersion, abTestUserId);
    }
  }, [componentName, designVersion, abTestUserId, isABTestActive, enableTracking]);

  const trackInteraction = useCallback((metadata: Record<string, any> = {}) => {
    if (enableTracking && abTestUserId) {
      trackABTestEvent('interaction', componentName, designVersion, abTestUserId, metadata);
    }
  }, [componentName, designVersion, abTestUserId, enableTracking]);

  const trackConversion = useCallback((metadata: Record<string, any> = {}) => {
    if (enableTracking && abTestUserId) {
      trackABTestEvent('conversion', componentName, designVersion, abTestUserId, metadata);
    }
  }, [componentName, designVersion, abTestUserId, enableTracking]);

  return {
    version: designVersion,
    isAurora,
    isABTestActive,
    userId: abTestUserId,
    trackInteraction,
    trackConversion
  };
};