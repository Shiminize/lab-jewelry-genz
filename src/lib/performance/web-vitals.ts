/**
 * Web Vitals Integration for CLAUDE_RULES Performance Monitoring
 * Tracks Core Web Vitals and reports to performance monitoring system
 */
import React from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

// Type definition for performance metric
interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  labels: Record<string, string | number>
  threshold: {
    warning: number
    critical: number
  }
}

// Mock performance monitor interface for integration
interface PerformanceMonitor {
  recordMetric: (metric: PerformanceMetric) => void
}

// Global performance monitor instance
declare global {
  interface Window {
    performanceMonitor?: PerformanceMonitor
  }
}

/**
 * Initialize Web Vitals monitoring
 * CLAUDE_RULES: Track performance against <300ms response time targets
 */
export function initWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') return

  // Cumulative Layout Shift - Measures visual stability
  onCLS(metric => {
    recordWebVital({
      name: 'web_vitals_cls',
      value: metric.value,
      unit: 'score',
      timestamp: new Date(),
      labels: { 
        rating: metric.rating,
        navigation_type: metric.navigationType 
      },
      threshold: { warning: 0.1, critical: 0.25 }
    })
  })

  // Interaction to Next Paint - Measures interactivity (replaces FID in web-vitals v5)
  onINP(metric => {
    recordWebVital({
      name: 'web_vitals_inp',
      value: metric.value,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        rating: metric.rating,
        navigation_type: metric.navigationType 
      },
      threshold: { warning: 200, critical: 500 }
    })
  })

  // First Contentful Paint - Measures loading performance
  onFCP(metric => {
    recordWebVital({
      name: 'web_vitals_fcp',
      value: metric.value,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        rating: metric.rating,
        navigation_type: metric.navigationType 
      },
      threshold: { warning: 1800, critical: 3000 }
    })
  })

  // Largest Contentful Paint - Measures loading performance
  onLCP(metric => {
    recordWebVital({
      name: 'web_vitals_lcp',
      value: metric.value,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        rating: metric.rating,
        navigation_type: metric.navigationType 
      },
      threshold: { warning: 2500, critical: 4000 }
    })
  })

  // Time to First Byte - Measures server response time
  onTTFB(metric => {
    recordWebVital({
      name: 'web_vitals_ttfb',
      value: metric.value,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        rating: metric.rating,
        navigation_type: metric.navigationType 
      },
      threshold: { warning: 800, critical: 1800 }
    })
  })

}

/**
 * Record a web vital metric
 * Integrates with existing performance monitoring system
 */
function recordWebVital(metric: PerformanceMetric) {
  // Log performance violations
  const isWarning = metric.value > metric.threshold.warning
  const isCritical = metric.value > metric.threshold.critical

  if (isCritical) {
    console.error(`🚨 CRITICAL Web Vital: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${metric.threshold.critical}${metric.unit})`)
  } else if (isWarning) {
    console.warn(`⚠️ WARNING Web Vital: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${metric.threshold.warning}${metric.unit})`)
  } else {

  }

  // Send to performance monitoring system if available
  if (window.performanceMonitor?.recordMetric) {
    window.performanceMonitor.recordMetric(metric)
  }

  // Send to Google Analytics if available
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.labels.rating,
      custom_parameter: metric.labels.navigation_type,
    })
  }
}

/**
 * Get current Web Vitals summary
 * Returns performance overview for CLAUDE_RULES compliance checking
 */
export function getWebVitalsSummary(): {
  status: 'good' | 'needs_improvement' | 'poor'
  metrics: Record<string, { value: number; rating: string }>
  claudeRulesCompliant: boolean
} {
  // This would typically store metrics in memory or localStorage
  // For now, return a placeholder structure
  return {
    status: 'good',
    metrics: {},
    claudeRulesCompliant: true
  }
}

/**
 * React hook for Web Vitals integration
 */
export function useWebVitals() {
  const [vitals, setVitals] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    initWebVitals()
  }, [])

  return {
    vitals,
    isPerformant: Object.keys(vitals).length > 0
  }
}

// Export for global usage
export default {
  initWebVitals,
  getWebVitalsSummary,
  useWebVitals
}