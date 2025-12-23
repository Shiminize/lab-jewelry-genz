/**
 * Feature Flags Configuration
 * 
 * Controls feature rollout and A/B testing across the application.
 */

export const features = {
  /**
   * Enable new horizontal filter layout
   * Set to 'true' to enable the feature
   */
  ENABLE_NEW_FILTER_LAYOUT: process.env.NEXT_PUBLIC_ENABLE_NEW_FILTER_LAYOUT === 'true',
  
  /**
   * Percentage of users to show new filter layout (0-100)
   * Only applies when ENABLE_NEW_FILTER_LAYOUT is true
   */
  FILTER_ROLLOUT_PERCENTAGE: parseInt(process.env.NEXT_PUBLIC_FILTER_ROLLOUT_PERCENTAGE || '0', 10),
} as const

export type Features = typeof features

