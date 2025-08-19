/**
 * Migration Utilities - Client-Safe Types and Utilities
 * Client-side migration interfaces and utilities without server dependencies
 * Server-side migration logic moved to /api/admin/migration
 */

import type { ProductVariant, Material } from '@/types/customizer'

// Migration interfaces (client-safe)
export interface MigrationReport {
  status: 'success' | 'partial' | 'failed'
  summary: {
    totalVariants: number
    convertedVariants: number
    failedVariants: number
    skippedVariants: number
  }
  details: Array<{
    variantId: string
    status: 'converted' | 'failed' | 'skipped'
    reason?: string
    warnings?: string[]
    data?: any
  }>
  recommendations: string[]
  timestamp: Date
}

export interface DeprecationWarning {
  type: 'component' | 'function' | 'prop' | 'variant'
  severity: 'warning' | 'error' | 'info'
  component: string
  message: string
  replacement?: string
  migrationPath?: string
  deprecationDate: Date
  removalDate?: Date
}

// Client-safe hardcoded variant interface
export interface HardcodedVariant {
  id: string
  name: string
  price: number
  material?: {
    name: string
    color: string
    properties?: any
  }
  images?: string[]
  description?: string
}

/**
 * Client-side migration utilities (no server dependencies)
 */
export class ClientMigrationUtils {
  private static deprecationWarnings: DeprecationWarning[] = []

  /**
   * Log deprecation warning (client-safe)
   */
  public static logDeprecationWarning(
    component: string,
    message: string,
    options: Partial<DeprecationWarning> = {}
  ): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const warning: DeprecationWarning = {
        type: 'component',
        severity: 'warning',
        component,
        message,
        deprecationDate: new Date(),
        ...options
      }

      this.deprecationWarnings.push(warning)
      
      console.warn(`⚠️  DEPRECATION WARNING: ${component} - ${message}`, {
        replacement: warning.replacement,
        migrationPath: warning.migrationPath,
        severity: warning.severity
      })
    }
  }

  /**
   * Validate hardcoded variant structure (client-side validation)
   */
  public static validateVariantStructure(variant: HardcodedVariant): boolean {
    if (!variant.id || typeof variant.id !== 'string') {
      return false
    }
    
    if (!variant.name || typeof variant.name !== 'string') {
      return false
    }
    
    if (typeof variant.price !== 'number' || variant.price < 0) {
      return false
    }

    return true
  }

  /**
   * Convert hardcoded variant to API-ready format (client-side only)
   */
  public static prepareVariantForMigration(variant: HardcodedVariant): any {
    if (!this.validateVariantStructure(variant)) {
      throw new Error(`Invalid variant structure: ${variant.id}`)
    }

    return {
      id: variant.id,
      name: variant.name,
      pricing: {
        basePrice: variant.price,
        currency: 'USD'
      },
      material: variant.material ? {
        name: variant.material.name,
        color: variant.material.color,
        properties: variant.material.properties || {}
      } : undefined,
      media: {
        gallery: variant.images || [],
        primary: variant.images?.[0] || ''
      },
      description: variant.description || ''
    }
  }

  /**
   * Get all deprecation warnings (client-side)
   */
  public static getDeprecationWarnings(): DeprecationWarning[] {
    return [...this.deprecationWarnings]
  }

  /**
   * Clear deprecation warnings (client-side)
   */
  public static clearDeprecationWarnings(): void {
    this.deprecationWarnings = []
  }

  /**
   * Trigger migration via API (client-side wrapper)
   */
  public static async triggerMigration(
    productName: string,
    variants: HardcodedVariant[],
    options: {
      dryRun?: boolean
      validateOnly?: boolean
      createMissing?: boolean
      overrideExisting?: boolean
    } = {}
  ): Promise<MigrationReport> {
    try {
      const response = await fetch('/api/admin/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          variants: variants.map(v => this.prepareVariantForMigration(v)),
          options
        })
      })

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || result
    } catch (error) {
      console.error('Migration trigger failed:', error)
      throw error
    }
  }
}

/**
 * Client-safe deprecation logging function
 */
export function logDeprecationWarning(
  component: string,
  message: string,
  options?: Partial<DeprecationWarning>
): void {
  ClientMigrationUtils.logDeprecationWarning(component, message, options)
}

/**
 * Export default migration utils for backward compatibility
 */
export const migrationUtils = ClientMigrationUtils