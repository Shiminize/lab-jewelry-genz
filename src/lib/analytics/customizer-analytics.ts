/**
 * Analytics tracking for OptimizedMaterialSwitcher
 * Tracks user interactions, performance metrics, and engagement patterns
 */

interface CustomizerAnalyticsEvent {
  eventName: string
  properties: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
}

interface MaterialSwitchEvent {
  materialFrom: string
  materialTo: string
  switchTime: number
  method: 'button' | 'comparison' | 'auto-rotate'
  zoomLevel: number
  currentFrame: number
}

interface UserInteractionEvent {
  interactionType: 'zoom' | 'rotate' | 'touch' | 'auto_rotate_toggle' | 'comparison_toggle'
  value?: number
  duration?: number
  touchPoints?: number
}

interface PerformanceEvent {
  metricType: 'preload_complete' | 'material_switch' | 'error_occurred' | 'retry_attempt'
  duration?: number
  successRate?: number
  imageCount?: number
  errorType?: string
}

interface EngagementEvent {
  engagementType: 'session_start' | 'session_end' | 'feature_discovery' | 'comparison_used'
  sessionDuration?: number
  featuresUsed?: string[]
  materialsViewed?: string[]
  totalInteractions?: number
}

export class CustomizerAnalytics {
  private sessionId: string
  private sessionStartTime: number
  private events: CustomizerAnalyticsEvent[] = []
  private interactions: number = 0
  private materialsViewed: Set<string> = new Set()
  private featuresUsed: Set<string> = new Set()
  private isInitialized: boolean = false
  private userId?: string

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
    this.userId = userId
    
    // Defer initialization to client-side only
    this.initializeClientSide()
  }

  private initializeClientSide() {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return // Skip initialization on server-side
    }

    try {
      // Track session start with browser APIs
      this.trackEngagement('session_start', {
        userId: this.userId,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window
      })

      // Track session end on page unload
      window.addEventListener('beforeunload', () => {
        this.trackEngagement('session_end', {
          sessionDuration: Date.now() - this.sessionStartTime,
          totalInteractions: this.interactions,
          materialsViewed: Array.from(this.materialsViewed),
          featuresUsed: Array.from(this.featuresUsed)
        })
        this.flush()
      })

      this.isInitialized = true
    } catch (error) {
      console.warn('CustomizerAnalytics initialization failed:', error)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private trackEvent(eventName: string, properties: Record<string, any>) {
    const event: CustomizerAnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    }

    this.events.push(event)
    this.interactions++

    // Console logging for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      // Keep output minimal to avoid noise during tests
      // eslint-disable-next-line no-console
      console.debug('[CustomizerAnalytics] event', eventName)
    }

    // Auto-flush every 10 events to prevent data loss
    if (this.events.length >= 10) {
      this.flush()
    }
  }

  // Material switching analytics
  trackMaterialSwitch(eventData: MaterialSwitchEvent) {
    this.materialsViewed.add(eventData.materialTo)
    this.featuresUsed.add('material_switching')
    
    this.trackEvent('material_switch', {
      materialFrom: eventData.materialFrom,
      materialTo: eventData.materialTo,
      switchTime: eventData.switchTime,
      method: eventData.method,
      zoomLevel: eventData.zoomLevel,
      currentFrame: eventData.currentFrame,
      isInstantSwitch: eventData.switchTime < 100, // CLAUDE_RULES compliance
      performanceGrade: eventData.switchTime < 10 ? 'A+' : 
                       eventData.switchTime < 50 ? 'A' : 
                       eventData.switchTime < 100 ? 'B' : 'C'
    })
  }

  // User interaction analytics
  trackInteraction(eventData: UserInteractionEvent) {
    this.featuresUsed.add(eventData.interactionType)
    
    this.trackEvent('user_interaction', {
      interactionType: eventData.interactionType,
      value: eventData.value,
      duration: eventData.duration,
      touchPoints: eventData.touchPoints,
      timestamp: Date.now()
    })

    // Track specific feature usage
    if (eventData.interactionType === 'comparison_toggle') {
      this.featuresUsed.add('comparison_mode')
    }
    if (eventData.interactionType === 'auto_rotate_toggle') {
      this.featuresUsed.add('auto_rotation')
    }
  }

  // Performance metrics analytics
  trackPerformance(eventData: PerformanceEvent) {
    this.trackEvent('performance_metric', {
      metricType: eventData.metricType,
      duration: eventData.duration,
      successRate: eventData.successRate,
      imageCount: eventData.imageCount,
      errorType: eventData.errorType,
      claudeRulesCompliant: eventData.duration ? eventData.duration < 100 : undefined
    })
  }

  // Engagement analytics
  trackEngagement(engagementType: EngagementEvent['engagementType'], additionalData: Record<string, any> = {}) {
    this.trackEvent('engagement', {
      engagementType,
      sessionDuration: Date.now() - this.sessionStartTime,
      totalInteractions: this.interactions,
      materialsViewed: Array.from(this.materialsViewed),
      featuresUsed: Array.from(this.featuresUsed),
      ...additionalData
    })
  }

  // Feature discovery analytics
  trackFeatureDiscovery(feature: string, discoveryMethod: 'click' | 'hover' | 'touch' | 'auto') {
    this.featuresUsed.add(feature)
    
    this.trackEvent('feature_discovery', {
      feature,
      discoveryMethod,
      timeToDiscover: Date.now() - this.sessionStartTime,
      sessionInteractionsAtDiscovery: this.interactions
    })
  }

  // Error analytics
  trackError(errorType: string, errorMessage: string, context: Record<string, any> = {}) {
    this.trackEvent('error_occurred', {
      errorType,
      errorMessage,
      context,
      sessionAge: Date.now() - this.sessionStartTime,
      interactionsBeforeError: this.interactions
    })
  }

  // Conversion analytics (for business metrics)
  trackConversion(conversionType: 'customization_complete' | 'add_to_cart' | 'save_design' | 'share_design', value?: number) {
    this.trackEvent('conversion', {
      conversionType,
      value,
      sessionDuration: Date.now() - this.sessionStartTime,
      materialsViewedCount: this.materialsViewed.size,
      featuresUsedCount: this.featuresUsed.size,
      totalInteractions: this.interactions
    })
  }

  // A/B testing support
  trackExperiment(experimentName: string, variant: string, outcome?: string) {
    this.trackEvent('experiment', {
      experimentName,
      variant,
      outcome,
      sessionAge: Date.now() - this.sessionStartTime
    })
  }

  // Get session summary for reporting
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStartTime,
      interactions: this.interactions,
      materialsViewed: Array.from(this.materialsViewed),
      featuresUsed: Array.from(this.featuresUsed),
      eventsCount: this.events.length
    }
  }

  // Flush events to analytics service
  async flush() {
    if (this.events.length === 0) return

    try {
      // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to your analytics endpoint
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            events: this.events
          })
        })
      } else {
        // Development: Log to console with summary
        const summary = this.getSessionSummary()
        // eslint-disable-next-line no-console
        console.debug('[CustomizerAnalytics] flush', {
          sessionId: this.sessionId,
          events: this.events.length,
          interactions: summary.interactions,
        })
      }

      // Clear events after successful flush
      this.events = []
    } catch (error) {
      console.error('Failed to flush analytics events:', error)
      // Keep events for retry
    }
  }
}

// Singleton instance for global use
let analyticsInstance: CustomizerAnalytics | null = null

export const getCustomizerAnalytics = (userId?: string): CustomizerAnalytics => {
  // Always return a valid instance, even on server-side
  if (!analyticsInstance) {
    analyticsInstance = new CustomizerAnalytics(userId)
  }
  return analyticsInstance
}

// Client-side only initialization hook
export const initializeAnalytics = (userId?: string): CustomizerAnalytics | null => {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null
  }
  
  return getCustomizerAnalytics(userId)
}