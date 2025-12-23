/**
 * Rollout Utilities
 * 
 * Provides consistent user-based feature rollout functionality
 */

import { features } from '@/config/features'

/**
 * Simple hash function for consistent user assignment
 * Returns a number between 0-99
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash % 100)
}

/**
 * Determines if a user should see the new filter layout
 * 
 * @param userId - Optional user identifier for consistent assignment
 * @returns true if user should see new filters, false otherwise
 * 
 * @example
 * // In a component
 * const showNewFilters = shouldShowNewFilters(session?.user?.id)
 */
export function shouldShowNewFilters(userId?: string): boolean {
  // Feature flag must be enabled
  if (!features.ENABLE_NEW_FILTER_LAYOUT) {
    return false
  }
  
  // 100% rollout - show to everyone
  if (features.FILTER_ROLLOUT_PERCENTAGE === 100) {
    return true
  }
  
  // 0% rollout - show to no one
  if (features.FILTER_ROLLOUT_PERCENTAGE === 0) {
    return false
  }
  
  // Consistent hash-based rollout
  // If userId provided, use hash for consistent assignment
  // Otherwise use random (for anonymous users, will vary per session)
  const hash = userId ? simpleHash(userId) : Math.random() * 100
  
  return hash < features.FILTER_ROLLOUT_PERCENTAGE
}

/**
 * Get rollout status for debugging
 */
export function getRolloutStatus() {
  return {
    enabled: features.ENABLE_NEW_FILTER_LAYOUT,
    percentage: features.FILTER_ROLLOUT_PERCENTAGE,
  }
}

