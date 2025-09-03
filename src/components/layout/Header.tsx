'use client'

import React from 'react'
import { AuroraNavigationContainer } from '@/components/navigation/aurora'
import { NavigationErrorBoundary } from '@/components/navigation/shared/NavigationErrorBoundary'

/**
 * Header Component - Aurora Design System Navigation
 * CLAUDE_RULES compliant: Error-first coding with clear recovery paths
 * Pure Aurora Design System with luxury jewelry UX patterns
 * Mobile-first responsive design with performance optimization
 * WCAG 2.1 AA accessible with proper focus management
 */
export function Header() {
  return (
    <NavigationErrorBoundary>
      <AuroraNavigationContainer />
    </NavigationErrorBoundary>
  )
}
