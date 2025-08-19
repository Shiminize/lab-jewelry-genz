/**
 * Feature Flag System - Phase 4A Production Migration
 * Enables gradual rollout of database-driven customization with performance monitoring
 * Supports A/B testing, user-based flags, and real-time flag updates
 */

import { headers } from 'next/headers'

// Feature flag configuration
export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  userSegments: string[]
  conditions: FeatureFlagCondition[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    owner: string
    environment: 'development' | 'staging' | 'production'
  }
}

// Feature flag conditions
export interface FeatureFlagCondition {
  type: 'user_id' | 'user_segment' | 'percentage' | 'header' | 'query_param' | 'time_window' | 'geography'
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between'
  value: any
  weight?: number
}

// Feature flag evaluation context
export interface FeatureFlagContext {
  userId?: string
  userSegment?: string
  headers?: Record<string, string>
  queryParams?: Record<string, string>
  geography?: string
  timestamp?: Date
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  userAgent?: string
}

// Phase 4 specific feature flags
export const PHASE4_FEATURE_FLAGS: { [key: string]: FeatureFlag } = {
  DATABASE_CUSTOMIZER: {
    key: 'database_customizer',
    name: 'Database-Driven Customizer',
    description: 'Enable database-driven product customization instead of hardcoded variants',
    enabled: true,
    rolloutPercentage: 0, // Start at 0% for gradual rollout
    userSegments: ['beta_testers', 'internal'],
    conditions: [
      {
        type: 'user_segment',
        operator: 'in',
        value: ['beta_testers', 'internal', 'premium']
      },
      {
        type: 'header',
        operator: 'equals',
        value: { 'x-enable-database-customizer': 'true' }
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  },

  HYBRID_CUSTOMIZER: {
    key: 'hybrid_customizer',
    name: 'Hybrid Customizer Mode',
    description: 'Use database when available, fallback to hardcoded variants',
    enabled: true,
    rolloutPercentage: 100, // Default mode during migration
    userSegments: [],
    conditions: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  },

  CUSTOMIZER_PERFORMANCE_MONITORING: {
    key: 'customizer_performance_monitoring',
    name: 'Customizer Performance Monitoring',
    description: 'Enable detailed performance monitoring for customizer operations',
    enabled: true,
    rolloutPercentage: 100,
    userSegments: [],
    conditions: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  },

  DATABASE_FIRST_STRATEGY: {
    key: 'database_first_strategy',
    name: 'Database-First Loading Strategy',
    description: 'Try database first, fallback to hardcoded only on failure',
    enabled: false,
    rolloutPercentage: 10, // Gradual rollout
    userSegments: ['power_users'],
    conditions: [
      {
        type: 'percentage',
        operator: 'less_than',
        value: 10
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  },

  HARDCODED_DEPRECATION_WARNINGS: {
    key: 'hardcoded_deprecation_warnings',
    name: 'Hardcoded Variant Deprecation Warnings',
    description: 'Show deprecation warnings when using hardcoded variants',
    enabled: process.env.NODE_ENV === 'development',
    rolloutPercentage: 0, // Only in development initially
    userSegments: ['developers'],
    conditions: [
      {
        type: 'header',
        operator: 'equals',
        value: { 'x-show-deprecation-warnings': 'true' }
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  },

  CUSTOMIZER_ANALYTICS: {
    key: 'customizer_analytics',
    name: 'Customizer Usage Analytics',
    description: 'Track customizer usage patterns for migration insights',
    enabled: true,
    rolloutPercentage: 100,
    userSegments: [],
    conditions: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'phase4_migration',
      environment: process.env.NODE_ENV as any || 'development'
    }
  }
}

/**
 * Feature flag evaluation service
 */
export class FeatureFlagService {
  private static instance: FeatureFlagService
  private flags: Map<string, FeatureFlag> = new Map()
  private evaluationCache: Map<string, { result: boolean; timestamp: number }> = new Map()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Initialize with Phase 4 flags
    Object.values(PHASE4_FEATURE_FLAGS).forEach(flag => {
      this.flags.set(flag.key, flag)
    })
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService()
    }
    return FeatureFlagService.instance
  }

  /**
   * Evaluate a feature flag for a given context
   */
  public isEnabled(flagKey: string, context: FeatureFlagContext = {}): boolean {
    const cacheKey = `${flagKey}_${JSON.stringify(context)}`
    
    // Check cache
    const cached = this.evaluationCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result
    }

    const flag = this.flags.get(flagKey)
    if (!flag) {
      console.warn(`[FeatureFlags] Flag '${flagKey}' not found, defaulting to false`)
      return false
    }

    // Base enabled check
    if (!flag.enabled) {
      this.cacheResult(cacheKey, false)
      return false
    }

    try {
      // Evaluate conditions
      const result = this.evaluateFlag(flag, context)
      this.cacheResult(cacheKey, result)
      return result
    } catch (error) {
      console.error(`[FeatureFlags] Error evaluating flag '${flagKey}':`, error)
      this.cacheResult(cacheKey, false)
      return false
    }
  }

  /**
   * Get feature flag configuration
   */
  public getFlag(flagKey: string): FeatureFlag | undefined {
    return this.flags.get(flagKey)
  }

  /**
   * Update feature flag (for runtime updates)
   */
  public updateFlag(flagKey: string, updates: Partial<FeatureFlag>): void {
    const existingFlag = this.flags.get(flagKey)
    if (existingFlag) {
      const updatedFlag: FeatureFlag = {
        ...existingFlag,
        ...updates,
        metadata: {
          ...existingFlag.metadata,
          updatedAt: new Date()
        }
      }
      this.flags.set(flagKey, updatedFlag)
      this.clearCacheForFlag(flagKey)
    }
  }

  /**
   * Get all flags
   */
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.evaluationCache.clear()
  }

  /**
   * Private: Evaluate flag conditions
   */
  private evaluateFlag(flag: FeatureFlag, context: FeatureFlagContext): boolean {
    // Check user segments
    if (flag.userSegments.length > 0 && context.userSegment) {
      if (!flag.userSegments.includes(context.userSegment)) {
        return false
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const userHash = this.hashContext(context)
      const userPercentile = userHash % 100
      if (userPercentile >= flag.rolloutPercentage) {
        return false
      }
    }

    // Evaluate conditions
    if (flag.conditions.length > 0) {
      return flag.conditions.every(condition => this.evaluateCondition(condition, context))
    }

    return true
  }

  /**
   * Private: Evaluate individual condition
   */
  private evaluateCondition(condition: FeatureFlagCondition, context: FeatureFlagContext): boolean {
    switch (condition.type) {
      case 'user_id':
        return this.evaluateStringCondition(context.userId, condition)
      
      case 'user_segment':
        return this.evaluateStringCondition(context.userSegment, condition)
      
      case 'percentage':
        const userHash = this.hashContext(context)
        const percentile = userHash % 100
        return this.evaluateNumericCondition(percentile, condition)
      
      case 'header':
        if (!context.headers || !condition.value) return false
        return Object.entries(condition.value).every(([key, value]) => 
          context.headers![key] === value
        )
      
      case 'query_param':
        if (!context.queryParams || !condition.value) return false
        return Object.entries(condition.value).every(([key, value]) =>
          context.queryParams![key] === value
        )
      
      case 'time_window':
        if (!context.timestamp) return false
        return this.evaluateTimeWindow(context.timestamp, condition.value)
      
      case 'geography':
        return this.evaluateStringCondition(context.geography, condition)
      
      default:
        console.warn(`[FeatureFlags] Unknown condition type: ${condition.type}`)
        return false
    }
  }

  private evaluateStringCondition(value: string | undefined, condition: FeatureFlagCondition): boolean {
    if (!value) return false

    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'contains':
        return value.includes(condition.value)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      default:
        return false
    }
  }

  private evaluateNumericCondition(value: number, condition: FeatureFlagCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'greater_than':
        return value > condition.value
      case 'less_than':
        return value < condition.value
      case 'between':
        return Array.isArray(condition.value) && 
               value >= condition.value[0] && 
               value <= condition.value[1]
      default:
        return false
    }
  }

  private evaluateTimeWindow(timestamp: Date, timeWindow: any): boolean {
    // Implement time window evaluation (e.g., business hours, date ranges)
    return true // Simplified for now
  }

  /**
   * Private: Hash context for consistent percentage rollout
   */
  private hashContext(context: FeatureFlagContext): number {
    const hashString = `${context.userId || 'anonymous'}_${context.userSegment || 'default'}`
    return this.simpleHash(hashString)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private cacheResult(key: string, result: boolean): void {
    this.evaluationCache.set(key, { result, timestamp: Date.now() })
  }

  private clearCacheForFlag(flagKey: string): void {
    const keysToDelete = Array.from(this.evaluationCache.keys())
      .filter(key => key.startsWith(`${flagKey}_`))
    
    keysToDelete.forEach(key => this.evaluationCache.delete(key))
  }
}

/**
 * Convenience functions for common feature flag checks
 */
export const featureFlags = FeatureFlagService.getInstance()

export function isDatabaseCustomizerEnabled(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('database_customizer', context)
}

export function isHybridCustomizerEnabled(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('hybrid_customizer', context)
}

export function isDatabaseFirstStrategy(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('database_first_strategy', context)
}

export function shouldShowDeprecationWarnings(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('hardcoded_deprecation_warnings', context)
}

export function isPerformanceMonitoringEnabled(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('customizer_performance_monitoring', context)
}

export function isCustomizerAnalyticsEnabled(context: FeatureFlagContext = {}): boolean {
  return featureFlags.isEnabled('customizer_analytics', context)
}

/**
 * Server-side context extraction
 */
export function extractServerContext(): FeatureFlagContext {
  try {
    const headersList = headers()
    const context: FeatureFlagContext = {
      headers: Object.fromEntries(headersList.entries()),
      timestamp: new Date(),
    }

    // Extract user agent info
    const userAgent = headersList.get('user-agent') || ''
    context.userAgent = userAgent
    
    // Simple device type detection
    if (userAgent.includes('Mobile')) {
      context.deviceType = 'mobile'
    } else if (userAgent.includes('Tablet')) {
      context.deviceType = 'tablet'
    } else {
      context.deviceType = 'desktop'
    }

    // Extract user segment from headers (if available)
    context.userSegment = headersList.get('x-user-segment') || undefined
    context.userId = headersList.get('x-user-id') || undefined

    return context
  } catch (error) {
    // Fallback for client-side or when headers() is not available
    return {
      timestamp: new Date(),
      deviceType: 'desktop'
    }
  }
}

/**
 * Client-side context extraction
 */
export function extractClientContext(): FeatureFlagContext {
  if (typeof window === 'undefined') {
    return extractServerContext()
  }

  const context: FeatureFlagContext = {
    timestamp: new Date(),
    queryParams: Object.fromEntries(new URLSearchParams(window.location.search)),
    userAgent: navigator.userAgent,
  }

  // Device type detection
  if (window.matchMedia('(max-width: 768px)').matches) {
    context.deviceType = 'mobile'
  } else if (window.matchMedia('(max-width: 1024px)').matches) {
    context.deviceType = 'tablet'
  } else {
    context.deviceType = 'desktop'
  }

  // Extract user info from localStorage (if available)
  try {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const parsed = JSON.parse(userInfo)
      context.userId = parsed.id
      context.userSegment = parsed.segment
    }
  } catch (error) {
    // Ignore localStorage errors
  }

  return context
}

export default FeatureFlagService