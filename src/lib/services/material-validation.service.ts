/**
 * Material Validation Service - Phase 3: API Layer Enhancement
 * Ensures CLAUDE_RULES compliance for all material-related operations
 * Performance optimized with caching and validation shortcuts
 * 
 * CLAUDE_RULES: Lab-grown materials only (no traditional/mined gems)
 * Performance Target: <5ms validation time
 */

import { LRUCache } from 'lru-cache'

export interface MaterialValidation {
  isValid: boolean
  material: string
  normalizedId: string
  category: 'gem' | 'metal' | 'unknown'
  claudeRulesCompliant: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    isLabGrown: boolean
    isSustainable: boolean
    carbonFootprint: 'low' | 'medium' | 'high'
    certifications: string[]
  }
}

export interface MaterialProperties {
  id: string
  name: string
  displayName: string
  category: 'gem' | 'metal'
  isLabGrown: boolean
  properties: {
    metalness: number
    roughness: number
    reflectivity: number
    color: string
    density?: number
    hardness?: number
  }
  sustainability: {
    carbonFootprint: 'low' | 'medium' | 'high'
    recyclable: boolean
    certifications: string[]
  }
  pricing: {
    baseCostMultiplier: number
    marketDemand: 'low' | 'medium' | 'high' | 'very-high'
  }
}

class MaterialValidationService {
  private static instance: MaterialValidationService
  private validationCache: LRUCache<string, MaterialValidation>
  private propertiesCache: LRUCache<string, MaterialProperties>
  
  // CLAUDE_RULES compliant materials database
  private readonly approvedMaterials: Map<string, MaterialProperties> = new Map([
    // Lab-grown gems
    ['lab-grown-diamond', {
      id: 'lab-grown-diamond',
      name: 'Lab-Grown Diamond',
      displayName: 'Lab-Grown Diamond',
      category: 'gem',
      isLabGrown: true,
      properties: {
        metalness: 0.0,
        roughness: 0.0,
        reflectivity: 0.95,
        color: '#ffffff',
        density: 3.52,
        hardness: 10
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['SCS-007', 'IGI', 'GIA']
      },
      pricing: {
        baseCostMultiplier: 0.7,
        marketDemand: 'very-high'
      }
    }],
    ['moissanite', {
      id: 'moissanite',
      name: 'Moissanite',
      displayName: 'Moissanite',
      category: 'gem',
      isLabGrown: true,
      properties: {
        metalness: 0.0,
        roughness: 0.1,
        reflectivity: 0.92,
        color: '#f8f8ff',
        density: 3.21,
        hardness: 9.25
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Charles & Colvard', 'GCAL']
      },
      pricing: {
        baseCostMultiplier: 0.3,
        marketDemand: 'high'
      }
    }],
    ['lab-ruby', {
      id: 'lab-ruby',
      name: 'Lab-Created Ruby',
      displayName: 'Lab Ruby',
      category: 'gem',
      isLabGrown: true,
      properties: {
        metalness: 0.0,
        roughness: 0.2,
        reflectivity: 0.85,
        color: '#cc0000',
        density: 4.0,
        hardness: 9
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Lotus Gemology', 'AGL']
      },
      pricing: {
        baseCostMultiplier: 0.4,
        marketDemand: 'medium'
      }
    }],
    ['lab-emerald', {
      id: 'lab-emerald',
      name: 'Lab-Created Emerald',
      displayName: 'Lab Emerald',
      category: 'gem',
      isLabGrown: true,
      properties: {
        metalness: 0.0,
        roughness: 0.3,
        reflectivity: 0.80,
        color: '#00cc66',
        density: 2.7,
        hardness: 7.5
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Gubelin', 'SSEF']
      },
      pricing: {
        baseCostMultiplier: 0.45,
        marketDemand: 'medium'
      }
    }],
    ['lab-sapphire', {
      id: 'lab-sapphire',
      name: 'Lab-Created Sapphire',
      displayName: 'Lab Sapphire',
      category: 'gem',
      isLabGrown: true,
      properties: {
        metalness: 0.0,
        roughness: 0.2,
        reflectivity: 0.85,
        color: '#0066cc',
        density: 4.0,
        hardness: 9
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['GIA', 'Lotus Gemology']
      },
      pricing: {
        baseCostMultiplier: 0.4,
        marketDemand: 'high'
      }
    }],
    // Sustainable metals
    ['recycled-platinum', {
      id: 'recycled-platinum',
      name: 'Recycled Platinum',
      displayName: 'Recycled Platinum',
      category: 'metal',
      isLabGrown: false, // Not lab-grown but sustainable
      properties: {
        metalness: 0.9,
        roughness: 0.1,
        reflectivity: 0.7,
        color: '#e5e4e2',
        density: 21.45,
        hardness: 4.5
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['RJC', 'SCS']
      },
      pricing: {
        baseCostMultiplier: 1.2,
        marketDemand: 'high'
      }
    }],
    ['recycled-gold-14k', {
      id: 'recycled-gold-14k',
      name: 'Recycled 14K Gold',
      displayName: '14K Recycled Gold',
      category: 'metal',
      isLabGrown: false,
      properties: {
        metalness: 0.8,
        roughness: 0.2,
        reflectivity: 0.6,
        color: '#ffd700',
        density: 13.07,
        hardness: 3.5
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Fairmined', 'RJC']
      },
      pricing: {
        baseCostMultiplier: 0.8,
        marketDemand: 'very-high'
      }
    }],
    ['recycled-gold-18k', {
      id: 'recycled-gold-18k',
      name: 'Recycled 18K Gold',
      displayName: '18K Recycled Gold',
      category: 'metal',
      isLabGrown: false,
      properties: {
        metalness: 0.85,
        roughness: 0.15,
        reflectivity: 0.65,
        color: '#ffdf00',
        density: 15.58,
        hardness: 3.0
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Fairmined', 'RJC']
      },
      pricing: {
        baseCostMultiplier: 1.0,
        marketDemand: 'high'
      }
    }],
    ['recycled-rose-gold', {
      id: 'recycled-rose-gold',
      name: 'Recycled Rose Gold',
      displayName: 'Rose Gold (Recycled)',
      category: 'metal',
      isLabGrown: false,
      properties: {
        metalness: 0.8,
        roughness: 0.2,
        reflectivity: 0.6,
        color: '#e8b4b8',
        density: 13.5,
        hardness: 3.5
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['Fairmined', 'RJC']
      },
      pricing: {
        baseCostMultiplier: 0.85,
        marketDemand: 'very-high'
      }
    }],
    ['recycled-silver', {
      id: 'recycled-silver',
      name: 'Recycled Sterling Silver',
      displayName: 'Recycled Silver',
      category: 'metal',
      isLabGrown: false,
      properties: {
        metalness: 0.85,
        roughness: 0.15,
        reflectivity: 0.75,
        color: '#c0c0c0',
        density: 10.49,
        hardness: 2.5
      },
      sustainability: {
        carbonFootprint: 'low',
        recyclable: true,
        certifications: ['RJC', 'SCS']
      },
      pricing: {
        baseCostMultiplier: 0.3,
        marketDemand: 'medium'
      }
    }]
  ])

  // Forbidden patterns for CLAUDE_RULES compliance
  private readonly forbiddenPatterns = [
    /natural[\s-]?diamond/i,
    /mined[\s-]?(?:diamond|ruby|emerald|sapphire)/i,
    /earth[\s-]?mined/i,
    /traditional[\s-]?gem/i,
    /genuine[\s-]?diamond/i,
    /conflict[\s-]?diamond/i,
    /blood[\s-]?diamond/i,
    /real[\s-]?diamond/i, // 'Real' often implies mined
    /authentic[\s-]?(?:ruby|emerald|sapphire)/i // Without 'lab' prefix
  ]

  private constructor() {
    // Enhanced LRU cache for Phase 2 performance optimization
    // Increased capacity from 500 to 5000 for better hit rates
    this.validationCache = new LRUCache<string, MaterialValidation>({
      max: 5000, // Increased from 500 for better E2E test performance
      ttl: 1000 * 60 * 15, // Increased to 15 minutes for better cache persistence
      updateAgeOnGet: true, // Reset TTL on access for frequently used materials
      allowStale: true, // Allow stale entries while revalidating
      noDeleteOnFetchRejection: true, // Keep cache entries on validation errors
      fetchMethod: async (materialId: string) => {
        // Auto-revalidation for expired entries
        return this.performMaterialValidation(materialId)
      }
    })
    
    this.propertiesCache = new LRUCache<string, MaterialProperties>({
      max: 1000, // Increased from 100 for better coverage
      ttl: 1000 * 60 * 30, // Increased to 30 minutes (properties change less frequently)
      updateAgeOnGet: true,
      allowStale: true,
      noDeleteOnFetchRejection: true
    })

    // Pre-warm cache with commonly used materials for immediate performance
    this.prewarmCache()
  }

  /**
   * Pre-warm cache with approved materials for instant validation
   */
  private prewarmCache(): void {

    const startTime = performance.now()
    
    // Pre-validate all approved materials
    for (const materialId of this.approvedMaterials.keys()) {
      this.performMaterialValidation(materialId)
    }
    
    // Pre-validate common material variations
    const commonVariations = [
      'lab-diamond', 'lab-grown-diamond', 'labgrown-diamond',
      'moissanite', 'lab-moissanite',
      'lab-ruby', 'lab-sapphire', 'lab-emerald',
      '14k-gold', '18k-gold', 'white-gold', 'yellow-gold', 'rose-gold',
      'platinum', 'silver', 'sterling-silver'
    ]
    
    for (const material of commonVariations) {
      this.performMaterialValidation(material)
    }
    
    const warmupTime = performance.now() - startTime

  }

  static getInstance(): MaterialValidationService {
    if (!MaterialValidationService.instance) {
      MaterialValidationService.instance = new MaterialValidationService()
    }
    return MaterialValidationService.instance
  }

  /**
   * Validate a material for CLAUDE_RULES compliance
   * Performance target: <5ms
   */
  validateMaterial(materialId: string): MaterialValidation {
    const startTime = performance.now()
    
    // Enhanced cache lookup with automatic background refresh
    let cached = this.validationCache.get(materialId)
    if (cached) {
      const cacheTime = performance.now() - startTime
      
      // Log cache performance for E2E optimization
      if (cacheTime > 1) {
        console.warn(`Cache lookup took ${cacheTime}ms (target: <1ms for cache hits)`)
      } else {

      }
      
      return cached
    }

    // Cache miss - perform validation and cache result

    const validation = this.performMaterialValidation(materialId)
    
    const validationTime = performance.now() - startTime
    
    // Enhanced performance logging for E2E optimization
    if (validationTime > 5) {
      console.warn(`Material validation took ${validationTime}ms (target: <5ms, cache miss)`)
    } else {

    }
    
    return validation
  }

  /**
   * Core material validation logic (extracted for cache integration)
   */
  private performMaterialValidation(materialId: string): MaterialValidation {
    const validation: MaterialValidation = {
      isValid: false,
      material: materialId,
      normalizedId: this.normalizeMaterialId(materialId),
      category: 'unknown',
      claudeRulesCompliant: false,
      errors: [],
      warnings: [],
      metadata: {
        isLabGrown: false,
        isSustainable: false,
        carbonFootprint: 'high',
        certifications: []
      }
    }

    // Check for forbidden patterns first (fastest check)
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(materialId)) {
        validation.errors.push(`Material "${materialId}" violates CLAUDE_RULES: Traditional/mined gems are forbidden`)
        this.validationCache.set(materialId, validation)
        return validation
      }
    }

    // Check if material is in approved list
    const normalizedId = validation.normalizedId
    const approved = this.approvedMaterials.get(normalizedId)
    
    if (approved) {
      validation.isValid = true
      validation.category = approved.category
      validation.claudeRulesCompliant = true
      validation.metadata = {
        isLabGrown: approved.isLabGrown,
        isSustainable: true,
        carbonFootprint: approved.sustainability.carbonFootprint,
        certifications: approved.sustainability.certifications
      }
    } else {
      // Enhanced fallback logic for lab-grown detection
      const isLabGrownPattern = /lab[_\s-]*(grown|created|made|diamond|ruby|emerald|sapphire|gem)/i
      const isSustainablePattern = /recycled|sustainable|eco|ethical/i
      
      if (isLabGrownPattern.test(materialId) || isSustainablePattern.test(materialId)) {
        validation.isValid = true
        validation.claudeRulesCompliant = true
        validation.category = materialId.toLowerCase().includes('gold') || 
                              materialId.toLowerCase().includes('silver') || 
                              materialId.toLowerCase().includes('platinum') ? 'metal' : 'gem'
        validation.metadata.isLabGrown = isLabGrownPattern.test(materialId)
        validation.metadata.isSustainable = true
        validation.metadata.carbonFootprint = 'low'
        validation.warnings.push(`Material "${materialId}" not in database but appears to be CLAUDE_RULES compliant`)
      } else {
        validation.errors.push(`Material "${materialId}" is not approved for CLAUDE_RULES compliance`)
      }
    }

    // Cache the result with enhanced caching
    this.validationCache.set(materialId, validation)
    
    return validation
  }

  /**
   * Validate multiple materials in batch
   * Optimized for performance with parallel validation
   */
  validateMaterials(materialIds: string[]): MaterialValidation[] {
    return materialIds.map(id => this.validateMaterial(id))
  }

  /**
   * Get material properties for rendering and pricing
   */
  getMaterialProperties(materialId: string): MaterialProperties | null {
    const normalized = this.normalizeMaterialId(materialId)
    
    // Check cache
    const cached = this.propertiesCache.get(normalized)
    if (cached) return cached
    
    // Get from database
    const properties = this.approvedMaterials.get(normalized)
    if (properties) {
      this.propertiesCache.set(normalized, properties)
      return properties
    }
    
    return null
  }

  /**
   * Get all approved materials by category
   */
  getApprovedMaterials(category?: 'gem' | 'metal'): MaterialProperties[] {
    const materials = Array.from(this.approvedMaterials.values())
    
    if (category) {
      return materials.filter(m => m.category === category)
    }
    
    return materials
  }

  /**
   * Check if a material combination is valid
   */
  validateMaterialCombination(gem: string, metal: string): {
    valid: boolean
    errors: string[]
    recommendations: string[]
  } {
    const gemValidation = this.validateMaterial(gem)
    const metalValidation = this.validateMaterial(metal)
    
    const result = {
      valid: false,
      errors: [] as string[],
      recommendations: [] as string[]
    }
    
    // Check individual validations
    if (!gemValidation.isValid) {
      result.errors.push(...gemValidation.errors)
    }
    if (!metalValidation.isValid) {
      result.errors.push(...metalValidation.errors)
    }
    
    if (result.errors.length > 0) {
      return result
    }
    
    // Check category compatibility
    if (gemValidation.category !== 'gem') {
      result.errors.push(`${gem} is not a valid gem material`)
    }
    if (metalValidation.category !== 'metal') {
      result.errors.push(`${metal} is not a valid metal material`)
    }
    
    if (result.errors.length === 0) {
      result.valid = true
      
      // Add style recommendations
      const gemProps = this.getMaterialProperties(gem)
      const metalProps = this.getMaterialProperties(metal)
      
      if (gemProps && metalProps) {
        // Color harmony recommendations
        if (gemProps.properties.color === '#ffffff' && metalProps.id.includes('platinum')) {
          result.recommendations.push('Excellent choice! Diamond and platinum create a timeless, elegant combination')
        }
        if (gemProps.id === 'lab-ruby' && metalProps.id.includes('rose-gold')) {
          result.recommendations.push('Beautiful pairing! Ruby and rose gold create a warm, romantic aesthetic')
        }
        if (gemProps.id === 'lab-sapphire' && metalProps.id.includes('white-gold')) {
          result.recommendations.push('Classic combination! Sapphire and white gold offer sophisticated contrast')
        }
      }
    }
    
    return result
  }

  /**
   * Normalize material ID for consistent lookup
   */
  private normalizeMaterialId(materialId: string): string {
    return materialId
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/^(14|18)k-/, '$1k-gold-')
      .replace(/-(14|18)k$/, '-$1k')
      .replace(/white-gold/, 'recycled-gold-18k')
      .replace(/yellow-gold/, 'recycled-gold-14k')
      .replace(/^platinum$/, 'recycled-platinum')
      .replace(/^silver$/, 'recycled-silver')
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const validationCacheInfo = this.validationCache.dump()
    const propertiesCacheInfo = this.propertiesCache.dump()
    
    // Calculate enhanced cache metrics for E2E optimization
    const validationHits = this.validationCache.calculatedSize || 0
    const validationMisses = (this.validationCache as any).misses || 0
    const totalValidationRequests = validationHits + validationMisses
    
    const propertiesHits = this.propertiesCache.calculatedSize || 0
    const propertiesMisses = (this.propertiesCache as any).misses || 0
    const totalPropertiesRequests = propertiesHits + propertiesMisses
    
    const metrics = {
      // Cache size metrics
      validationCacheSize: this.validationCache.size,
      validationCacheMaxSize: this.validationCache.max,
      propertiesCacheSize: this.propertiesCache.size,
      propertiesCacheMaxSize: this.propertiesCache.max,
      
      // Performance metrics for E2E optimization
      validationCacheHitRate: totalValidationRequests > 0 ? 
        (validationHits / totalValidationRequests) * 100 : 0,
      propertiesCacheHitRate: totalPropertiesRequests > 0 ? 
        (propertiesHits / totalPropertiesRequests) * 100 : 0,
      
      // Cache utilization
      validationCacheUtilization: (this.validationCache.size / this.validationCache.max) * 100,
      propertiesCacheUtilization: (this.propertiesCache.size / this.propertiesCache.max) * 100,
      
      // Material database metrics
      approvedMaterialsCount: this.approvedMaterials.size,
      forbiddenPatternsCount: this.forbiddenPatterns.length,
      
      // E2E performance indicators
      cacheWarmedUp: this.validationCache.size >= this.approvedMaterials.size,
      optimalPerformanceReady: this.validationCache.size >= this.approvedMaterials.size && 
                               totalValidationRequests > 0 && 
                               (validationHits / totalValidationRequests) > 0.8,
      
      // Performance recommendations
      recommendations: this.getPerformanceRecommendations(
        totalValidationRequests > 0 ? (validationHits / totalValidationRequests) * 100 : 0,
        (this.validationCache.size / this.validationCache.max) * 100
      )
    }
    
    return metrics
  }

  /**
   * Get performance optimization recommendations
   */
  private getPerformanceRecommendations(hitRate: number, utilization: number): string[] {
    const recommendations: string[] = []
    
    if (hitRate < 50) {
      recommendations.push('Low cache hit rate detected - consider pre-warming more materials')
    }
    
    if (hitRate < 80 && hitRate >= 50) {
      recommendations.push('Moderate cache hit rate - monitor for common material patterns')
    }
    
    if (utilization > 90) {
      recommendations.push('Cache near capacity - consider increasing max size')
    }
    
    if (utilization < 20) {
      recommendations.push('Low cache utilization - consider reducing TTL or max size')
    }
    
    if (hitRate >= 90) {
      recommendations.push('Excellent cache performance - optimal for E2E tests')
    }
    
    return recommendations
  }

  /**
   * Clear caches (useful for testing)
   */
  clearCaches() {
    this.validationCache.clear()
    this.propertiesCache.clear()
  }
}

// Export singleton instance
export const materialValidationService = MaterialValidationService.getInstance()
export { MaterialValidationService }