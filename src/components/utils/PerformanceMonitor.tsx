'use client'

import React, { useEffect, useState } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoadedTime: number
  firstContentfulPaint: number | null
  largestContentfulPaint: number | null
  cumulativeLayoutShift: number | null
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
      const domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart
      
      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      
      // Try to get LCP and CLS from observer
      let lcpValue: number | null = null
      let clsValue: number | null = null
      
      // Observe Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            lcpValue = lastEntry.startTime
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          
          // Observe Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsSum = 0
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsSum += entry.value
              }
            })
            clsValue = clsSum
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (error) {
          console.warn('Performance Observer not fully supported:', error)
        }
      }
      
      const performanceMetrics: PerformanceMetrics = {
        pageLoadTime,
        domContentLoadedTime,
        firstContentfulPaint: fcpEntry ? fcpEntry.startTime : null,
        largestContentfulPaint: lcpValue,
        cumulativeLayoutShift: clsValue
      }
      
      setMetrics(performanceMetrics)
      
      // Check CLAUDE_RULES compliance
      if (pageLoadTime > 1000) { // 1 second for overall page (less strict than 300ms API)
        console.warn(`⚠️ Page load time ${pageLoadTime.toFixed(0)}ms exceeds 1000ms target`)
      } else {

      }
      
      if (fcpEntry && fcpEntry.startTime > 1800) { // FCP should be under 1.8s
        console.warn(`⚠️ First Contentful Paint ${fcpEntry.startTime.toFixed(0)}ms exceeds 1800ms target`)
      }
    }
    
    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000)
      })
    }
    
    // Show metrics in development
    if (process.env.NODE_ENV === 'development') {
      const toggleVisibility = (e: KeyboardEvent) => {
        if (e.key === 'P' && e.ctrlKey && e.shiftKey) {
          setIsVisible(prev => !prev)
        }
      }
      
      window.addEventListener('keydown', toggleVisibility)
      return () => window.removeEventListener('keydown', toggleVisibility)
    }
  }, [])

  if (!isVisible || !metrics || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-token-lg p-4 text-sm font-mono shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">Performance</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-aurora-nav-muted hover:text-foreground"
          aria-label="Close performance monitor"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Page Load:</span>
          <span className={metrics.pageLoadTime > 1000 ? 'text-red-500' : 'text-green-500'}>
            {metrics.pageLoadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>DOM Ready:</span>
          <span className={metrics.domContentLoadedTime > 800 ? 'text-red-500' : 'text-green-500'}>
            {metrics.domContentLoadedTime.toFixed(0)}ms
          </span>
        </div>
        
        {metrics.firstContentfulPaint && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={metrics.firstContentfulPaint > 1800 ? 'text-red-500' : 'text-green-500'}>
              {metrics.firstContentfulPaint.toFixed(0)}ms
            </span>
          </div>
        )}
        
        {metrics.largestContentfulPaint && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={metrics.largestContentfulPaint > 2500 ? 'text-red-500' : 'text-green-500'}>
              {metrics.largestContentfulPaint.toFixed(0)}ms
            </span>
          </div>
        )}
        
        {metrics.cumulativeLayoutShift !== null && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={metrics.cumulativeLayoutShift > 0.1 ? 'text-red-500' : 'text-green-500'}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}