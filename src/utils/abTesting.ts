/**
 * Aurora Design System A/B Testing Infrastructure
 * 
 * Provides safe A/B testing for Aurora design migration
 * Includes analytics integration and conversion tracking
 */

import { getABTestGroup, simpleHash, type ABTestGroup } from '@/config/featureFlags';

// Test configuration interface
export interface ABTestConfig {
  testName: string;
  description: string;
  startDate: string;
  endDate?: string;
  trafficSplit: number; // Percentage for test group (0-100)
  enabled: boolean;
  components: string[];
  conversionEvents: string[];
  metadata?: Record<string, any>;
}

// Test result interface
export interface ABTestResult {
  testName: string;
  userId: string;
  group: ABTestGroup;
  assignmentTime: number;
  userAgent?: string;
  sessionId?: string;
}

// Conversion event interface
export interface ConversionEvent {
  testName: string;
  userId: string;
  group: ABTestGroup;
  event: string;
  timestamp: number;
  value?: number;
  metadata?: Record<string, any>;
}

// Active A/B tests configuration
export const ACTIVE_TESTS: Record<string, ABTestConfig> = {
  'aurora-hero-pilot': {
    testName: 'aurora-hero-pilot',
    description: 'Test Aurora Design System implementation on Hero section',
    startDate: '2025-09-06',
    endDate: '2025-09-20',
    trafficSplit: 50,
    enabled: true,
    components: ['hero'],
    conversionEvents: ['hero_cta_click', 'page_scroll_50', 'navigation_click'],
    metadata: {
      hypothesis: 'Aurora gradients and animations will increase user engagement',
      successMetrics: ['cta_conversion_rate', 'time_on_page', 'scroll_depth'],
    },
  },
  
  'aurora-product-card-pilot': {
    testName: 'aurora-product-card-pilot',
    description: 'Test Aurora Design System on ProductCard components',
    startDate: '2025-09-06',
    endDate: '2025-09-20',
    trafficSplit: 50,
    enabled: true,
    components: ['productCard'],
    conversionEvents: ['product_card_click', 'add_to_cart', 'customizer_open'],
    metadata: {
      hypothesis: 'Material-specific prismatic shadows will increase product engagement',
      successMetrics: ['card_click_rate', 'customizer_conversion', 'cart_addition_rate'],
    },
  },
  
  'aurora-material-selection': {
    testName: 'aurora-material-selection',
    description: 'Test Aurora material selection with emotional triggers',
    startDate: '2025-09-08',
    endDate: '2025-09-22',
    trafficSplit: 30,
    enabled: false, // Will be enabled after pilot
    components: ['customizer', 'materialSelection'],
    conversionEvents: ['material_selection', 'customization_complete', 'purchase_intent'],
    metadata: {
      hypothesis: 'Emotional triggers and prismatic effects increase material selection confidence',
      successMetrics: ['selection_time', 'customization_completion', 'purchase_conversion'],
    },
  },
};

/**
 * AB Testing Service Class
 */
export class ABTestingService {
  private static instance: ABTestingService;
  private testAssignments: Map<string, ABTestResult> = new Map();
  private conversionEvents: ConversionEvent[] = [];

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  /**
   * Assign user to A/B test group
   */
  assignUserToTest(
    testName: string,
    userId: string,
    sessionId?: string
  ): ABTestResult | null {
    const testConfig = ACTIVE_TESTS[testName];
    
    if (!testConfig || !testConfig.enabled) {
      return null;
    }

    // Check if test is active (within date range)
    if (!this.isTestActive(testConfig)) {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = this.testAssignments.get(`${testName}_${userId}`);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Assign to group based on consistent hash
    const group = this.getTestGroup(userId, testConfig.trafficSplit);
    
    const result: ABTestResult = {
      testName,
      userId,
      group,
      assignmentTime: Date.now(),
      sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    // Store assignment
    this.testAssignments.set(`${testName}_${userId}`, result);
    
    // Track assignment event
    this.trackEvent('test_assignment', {
      testName,
      userId,
      group,
      sessionId,
    });

    return result;
  }

  /**
   * Get test group for user with custom traffic split
   */
  private getTestGroup(userId: string, trafficSplit: number): ABTestGroup {
    const hash = simpleHash(userId);
    const percentage = hash % 100;
    return percentage < trafficSplit ? 'demo' : 'control';
  }

  /**
   * Check if test is currently active
   */
  private isTestActive(config: ABTestConfig): boolean {
    const now = new Date();
    const startDate = new Date(config.startDate);
    
    if (now < startDate) return false;
    
    if (config.endDate) {
      const endDate = new Date(config.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  }

  /**
   * Track conversion event
   */
  trackConversion(
    testName: string,
    userId: string,
    event: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const assignment = this.testAssignments.get(`${testName}_${userId}`);
    if (!assignment) return;

    const testConfig = ACTIVE_TESTS[testName];
    if (!testConfig || !testConfig.conversionEvents.includes(event)) return;

    const conversionEvent: ConversionEvent = {
      testName,
      userId,
      group: assignment.group,
      event,
      timestamp: Date.now(),
      value,
      metadata: {
        ...metadata,
        assignmentTime: assignment.assignmentTime,
        sessionId: assignment.sessionId,
      },
    };

    this.conversionEvents.push(conversionEvent);
    
    this.trackEvent('conversion', conversionEvent);
  }

  /**
   * Get test results for analysis
   */
  getTestResults(testName: string): {
    assignments: ABTestResult[];
    conversions: ConversionEvent[];
    summary: {
      totalUsers: number;
      controlUsers: number;
      testUsers: number;
      conversionsByGroup: Record<ABTestGroup, number>;
      conversionRateByGroup: Record<ABTestGroup, number>;
    };
  } {
    const assignments = Array.from(this.testAssignments.values())
      .filter(assignment => assignment.testName === testName);

    const conversions = this.conversionEvents
      .filter(conversion => conversion.testName === testName);

    const controlUsers = assignments.filter(a => a.group === 'control').length;
    const testUsers = assignments.filter(a => a.group === 'demo').length;
    
    const controlConversions = conversions.filter(c => c.group === 'control').length;
    const testConversions = conversions.filter(c => c.group === 'demo').length;

    return {
      assignments,
      conversions,
      summary: {
        totalUsers: assignments.length,
        controlUsers,
        testUsers,
        conversionsByGroup: {
          control: controlConversions,
          demo: testConversions,
        },
        conversionRateByGroup: {
          control: controlUsers > 0 ? controlConversions / controlUsers : 0,
          demo: testUsers > 0 ? testConversions / testUsers : 0,
        },
      },
    };
  }

  /**
   * Export test data for analysis
   */
  exportTestData(testName?: string): {
    tests: ABTestConfig[];
    assignments: ABTestResult[];
    conversions: ConversionEvent[];
    exportTime: number;
  } {
    const filteredAssignments = testName 
      ? Array.from(this.testAssignments.values()).filter(a => a.testName === testName)
      : Array.from(this.testAssignments.values());

    const filteredConversions = testName
      ? this.conversionEvents.filter(c => c.testName === testName)
      : this.conversionEvents;

    const relevantTests = testName
      ? [ACTIVE_TESTS[testName]].filter(Boolean)
      : Object.values(ACTIVE_TESTS);

    return {
      tests: relevantTests,
      assignments: filteredAssignments,
      conversions: filteredConversions,
      exportTime: Date.now(),
    };
  }

  /**
   * Clear test data (development only)
   */
  clearTestData(): void {
    if (process.env.NODE_ENV === 'development') {
      this.testAssignments.clear();
      this.conversionEvents.length = 0;
      console.log('🧪 A/B Test data cleared');
    }
  }

  /**
   * Internal event tracking
   */
  private trackEvent(eventType: string, data: any): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔬 AB Test Event: ${eventType}`, data);
    }

    // In production, integrate with analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventType, {
        event_category: 'ab_test',
        event_label: data.testName,
        custom_map: data,
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, data }),
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    }
  }
}

/**
 * React hook for A/B testing
 */
export const useABTest = (
  testName: string,
  userId: string = 'anonymous',
  sessionId?: string
) => {
  const service = ABTestingService.getInstance();
  
  // Assign user to test
  const assignment = service.assignUserToTest(testName, userId, sessionId);
  
  return {
    group: assignment?.group || 'control',
    isTestUser: assignment?.group === 'demo',
    isControlUser: assignment?.group === 'control',
    
    trackConversion: (event: string, value?: number, metadata?: Record<string, any>) => {
      service.trackConversion(testName, userId, event, value, metadata);
    },
    
    getTestConfig: () => ACTIVE_TESTS[testName],
    
    assignment,
  };
};

/**
 * Helper function to get user ID from various sources
 */
export const getUserId = (): string => {
  if (typeof window === 'undefined') return 'ssr-user';
  
  // Try to get from localStorage
  let userId = localStorage.getItem('aurora_user_id');
  
  if (!userId) {
    // Generate new user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('aurora_user_id', userId);
  }
  
  return userId;
};

/**
 * Helper function to get session ID
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr-session';
  
  // Try to get from sessionStorage
  let sessionId = sessionStorage.getItem('aurora_session_id');
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('aurora_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Development helper to simulate different user groups
 */
export const devSetTestGroup = (
  testName: string,
  group: ABTestGroup
): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const userId = getUserId();
  const service = ABTestingService.getInstance();
  
  // Override assignment
  const result: ABTestResult = {
    testName,
    userId,
    group,
    assignmentTime: Date.now(),
    sessionId: getSessionId(),
  };
  
  service['testAssignments'].set(`${testName}_${userId}`, result);
  console.log(`🧪 Dev Override: ${testName} → ${group} for user ${userId}`);
};

// Export service instance
export default ABTestingService.getInstance();