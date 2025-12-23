/**
 * Feature Flag System for Aurora Concierge Widget
 * Enables safe, controlled rollout with instant rollback capability
 */

export interface FeatureFlags {
  CONCIERGE_ENABLED: boolean
  CONCIERGE_ROLLOUT_PERCENTAGE: number
  CONCIERGE_ALLOWED_USERS: string[]
}

/**
 * Get current feature flags from environment
 */
export function getFeatureFlags(): FeatureFlags {
  // Parse environment variables
  const enabled = process.env.NEXT_PUBLIC_CONCIERGE_ENABLED !== 'false'
  const percentage = parseInt(process.env.NEXT_PUBLIC_CONCIERGE_ROLLOUT_PERCENTAGE || '100', 10)
  const allowedUsers = process.env.NEXT_PUBLIC_CONCIERGE_ALLOWED_USERS
    ? process.env.NEXT_PUBLIC_CONCIERGE_ALLOWED_USERS.split(',').map((u) => u.trim())
    : []

  return {
    CONCIERGE_ENABLED: enabled,
    CONCIERGE_ROLLOUT_PERCENTAGE: Math.max(0, Math.min(100, percentage)),
    CONCIERGE_ALLOWED_USERS: allowedUsers,
  }
}

/**
 * Determine if widget should be enabled for a specific user
 * @param userId - User email or ID (optional for anonymous users)
 * @returns true if widget should render, false otherwise
 */
export function isWidgetEnabled(userId?: string): boolean {
  const flags = getFeatureFlags()

  // Master kill switch
  if (!flags.CONCIERGE_ENABLED) {
    return false
  }

  // Check if user is in allowed beta list
  if (userId && flags.CONCIERGE_ALLOWED_USERS.length > 0) {
    if (flags.CONCIERGE_ALLOWED_USERS.includes(userId)) {
      return true
    }
    // If allowed users list exists but user not in it, respect rollout percentage
  }

  // Rollout percentage check (deterministic based on userId or random for anonymous)
  if (flags.CONCIERGE_ROLLOUT_PERCENTAGE < 100) {
    if (userId) {
      // Deterministic hash for consistent experience per user
      const hash = simpleHash(userId)
      const bucket = hash % 100
      return bucket < flags.CONCIERGE_ROLLOUT_PERCENTAGE
    } else {
      // Random for anonymous users (will vary per page load)
      return Math.random() * 100 < flags.CONCIERGE_ROLLOUT_PERCENTAGE
    }
  }

  // Full rollout
  return true
}

/**
 * Simple string hash function for deterministic bucketing
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get widget visibility for server-side rendering
 * Use this in server components or API routes
 */
export function getWidgetVisibility(userId?: string): {
  enabled: boolean
  reason: string
} {
  const flags = getFeatureFlags()

  if (!flags.CONCIERGE_ENABLED) {
    return { enabled: false, reason: 'feature_disabled' }
  }

  if (userId && flags.CONCIERGE_ALLOWED_USERS.includes(userId)) {
    return { enabled: true, reason: 'beta_user' }
  }

  if (flags.CONCIERGE_ROLLOUT_PERCENTAGE === 0) {
    return { enabled: false, reason: 'rollout_0_percent' }
  }

  if (flags.CONCIERGE_ROLLOUT_PERCENTAGE === 100) {
    return { enabled: true, reason: 'full_rollout' }
  }

  const enabled = isWidgetEnabled(userId)
  return {
    enabled,
    reason: enabled ? `rollout_${flags.CONCIERGE_ROLLOUT_PERCENTAGE}_percent` : 'not_in_bucket',
  }
}

