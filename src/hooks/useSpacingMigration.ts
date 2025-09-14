/**
 * useSpacingMigration Hook
 * CLAUDE_RULES compliant: Simple hook for spacing migration feature flags
 * Enables gradual rollout of spacing changes without affecting all components
 */

'use client'

import { useState, useEffect } from 'react'
import { migrateSpacingClass, SPACING_MIGRATION_FLAGS } from '@/utils/spacingMigration'

interface SpacingMigrationConfig {
  enabled: boolean
  component: keyof typeof SPACING_MIGRATION_FLAGS
}

/**
 * Hook to manage spacing migration for individual components
 * @param component - Component name to check for migration
 * @returns Object with migration utilities and status
 */
export function useSpacingMigration(component: keyof typeof SPACING_MIGRATION_FLAGS) {
  const [isEnabled, setIsEnabled] = useState(false)
  
  useEffect(() => {
    // Check if migration is enabled for this component
    setIsEnabled(SPACING_MIGRATION_FLAGS[component])
  }, [component])
  
  /**
   * Get the appropriate class name based on migration status
   * @param tokenClass - Original token-based class string
   * @param tailwindClass - Target Tailwind class string
   * @returns The appropriate class string
   */
  const getClassName = (tokenClass: string, tailwindClass: string): string => {
    return isEnabled ? tailwindClass : tokenClass
  }
  
  /**
   * Migrate a class string if feature is enabled
   * @param className - Class string to potentially migrate
   * @returns Migrated or original class string
   */
  const migrateClass = (className: string): string => {
    return isEnabled ? migrateSpacingClass(className) : className
  }
  
  /**
   * Get container class with migration support
   * @param tokenContainer - Original token-based container class
   * @param standardContainer - Target standardized container class
   * @returns Appropriate container class
   */
  const getContainerClass = (tokenContainer: string, standardContainer: string): string => {
    return isEnabled ? standardContainer : tokenContainer
  }
  
  return {
    isEnabled,
    getClassName,
    migrateClass,
    getContainerClass,
    component,
  }
}

/**
 * Hook for demo page components to always use new spacing
 * This is used for the demo components to test the new spacing system
 */
export function useDemoSpacing() {
  const getClassName = (tokenClass: string, tailwindClass: string): string => tailwindClass
  const migrateClass = (className: string): string => migrateSpacingClass(className)
  const getContainerClass = (tokenContainer: string, standardContainer: string): string => standardContainer
  
  return {
    isEnabled: true,
    getClassName,
    migrateClass,
    getContainerClass,
    component: 'demo' as const,
  }
}