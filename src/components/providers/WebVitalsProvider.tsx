/**
 * Web Vitals Provider - React 18 Client Component
 * Initializes Core Web Vitals monitoring for CLAUDE_RULES compliance
 */
'use client'

import React, { useEffect } from 'react'
import { initWebVitals } from '@/lib/performance/web-vitals'

interface WebVitalsProviderProps {
  children: React.ReactNode
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  useEffect(() => {
    // Initialize Web Vitals monitoring on mount
    initWebVitals()
  }, [])

  return <>{children}</>
}

export default WebVitalsProvider