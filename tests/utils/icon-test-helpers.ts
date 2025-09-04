/**
 * Icon Test Utilities and Helper Functions
 * Supporting Atlas Icons E2E Testing
 * 
 * This module provides reusable functions for:
 * - Icon validation and verification
 * - Performance measurement
 * - Visual consistency checking
 * - Accessibility validation
 */

import { Page, Locator, expect } from '@playwright/test'

// Icon mapping definitions for testing
export const ICON_MAPPINGS = {
  // Navigation icons
  'search': 'SearchMessage',
  'shopping-cart': 'ShoppingCart',
  'user': 'User',
  'menu': 'MenuSquare',
  'x': 'XmarkCircle',
  'close': 'XmarkCircle',
  
  // Product icons
  'heart': 'Heart',
  'star': 'Star',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-down': 'ArrowDown',
  'arrow-up': 'ArrowUpCircle',
  
  // E-commerce icons
  'shopping-bag': 'ShoppingBag',
  'credit-card': 'CreditCard',
  'gift': 'GiftBox',
  'truck': 'DeliveryTruck',
  'package': 'Package',
  
  // Jewelry specific
  'sparkles': 'MagicWandSparkles',
  'gem': 'DiamondRing',
  'ring': 'DiamondRing'
} as const

export const EXPECTED_ICON_SIZES = [16, 20, 24, 32, 48] as const

export const AURORA_COLOR_VARIABLES = [
  'var(--aurora-pink)',
  'var(--aurora-nebula-purple)',
  'var(--aurora-emerald-flash)',
  'var(--aurora-amber-glow)',
  'var(--aurora-deep-space)',
  'var(--aurora-lunar-grey)'
] as const

export const TEST_PAGES = [
  '/',
  '/icon-test',
  '/catalog'
] as const

/**
 * Icon Validation Utilities
 */
export class IconValidator {
  constructor(private page: Page) {}

  /**
   * Verify that an icon is properly rendered and visible
   */
  async validateIconRendering(iconLocator: Locator): Promise<void> {
    // Check visibility
    await expect(iconLocator).toBeVisible()

    // Check it's an SVG element
    const tagName = await iconLocator.evaluate(el => el.tagName.toLowerCase())
    expect(tagName).toBe('svg')

    // Check it has dimensions
    const boundingBox = await iconLocator.boundingBox()
    expect(boundingBox).toBeTruthy()
    expect(boundingBox!.width).toBeGreaterThan(0)
    expect(boundingBox!.height).toBeGreaterThan(0)
  }

  /**
   * Verify icon accessibility attributes
   */
  async validateIconAccessibility(iconLocator: Locator): Promise<void> {
    // Check for aria-label on icon or parent element
    const iconAriaLabel = await iconLocator.getAttribute('aria-label')
    const parentAriaLabel = await iconLocator.locator('..').getAttribute('aria-label')
    const parentTextContent = await iconLocator.locator('..').textContent()

    const hasAccessibleName = iconAriaLabel || parentAriaLabel || parentTextContent?.trim()
    expect(hasAccessibleName).toBeTruthy()
  }

  /**
   * Verify icon sizing
   */
  async validateIconSize(iconLocator: Locator, expectedSize?: number): Promise<void> {
    const sizeAttribute = await iconLocator.getAttribute('size')
    
    if (expectedSize) {
      expect(sizeAttribute).toBe(expectedSize.toString())
    } else {
      // Should have some size attribute
      expect(sizeAttribute).toBeTruthy()
      expect(parseInt(sizeAttribute!)).toBeGreaterThan(0)
    }
  }

  /**
   * Verify Aurora color integration
   */
  async validateAuroraColor(iconLocator: Locator): Promise<void> {
    const colorAttribute = await iconLocator.getAttribute('color')
    
    if (colorAttribute) {
      expect(AURORA_COLOR_VARIABLES.some(color => 
        colorAttribute.includes(color)
      )).toBeTruthy()
    }
  }

  /**
   * Count icons on a page
   */
  async countIcons(): Promise<number> {
    return await this.page.locator('svg').count()
  }

  /**
   * Get all icon elements on page
   */
  getIconElements(): Locator {
    return this.page.locator('svg')
  }
}

/**
 * Performance Measurement Utilities
 */
export class PerformanceValidator {
  constructor(private page: Page) {}

  /**
   * Measure page load time with icons
   */
  async measurePageLoadTime(url: string): Promise<number> {
    const startTime = Date.now()
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
    return Date.now() - startTime
  }

  /**
   * Measure time for icons to render
   */
  async measureIconRenderTime(): Promise<number> {
    const startTime = performance.now()
    
    // Wait for at least one icon to be visible
    await this.page.waitForSelector('svg', { timeout: 5000 })
    
    return performance.now() - startTime
  }

  /**
   * Monitor network requests for icon loading
   */
  async monitorIconNetworkRequests(): Promise<string[]> {
    const iconRequests: string[] = []
    
    this.page.on('response', response => {
      const url = response.url()
      if (url.includes('atlas') || url.includes('icon') || url.includes('svg')) {
        iconRequests.push(url)
      }
    })

    return iconRequests
  }

  /**
   * Measure bundle size impact
   */
  async measureBundleSize(): Promise<{ total: number; iconRelated: number }> {
    const responses: { url: string; size: number }[] = []
    
    this.page.on('response', async response => {
      try {
        const buffer = await response.body()
        responses.push({
          url: response.url(),
          size: buffer.length
        })
      } catch {
        // Ignore failed requests
      }
    })

    await this.page.waitForLoadState('networkidle')

    const totalSize = responses.reduce((sum, r) => sum + r.size, 0)
    const iconSize = responses
      .filter(r => r.url.includes('atlas') || r.url.includes('icon'))
      .reduce((sum, r) => sum + r.size, 0)

    return { total: totalSize, iconRelated: iconSize }
  }
}

/**
 * Console Monitoring Utilities
 */
export class ConsoleMonitor {
  private errors: string[] = []
  private warnings: string[] = []

  constructor(private page: Page) {
    this.setupConsoleMonitoring()
  }

  private setupConsoleMonitoring(): void {
    this.page.on('console', msg => {
      const text = msg.text()
      
      switch (msg.type()) {
        case 'error':
          this.errors.push(text)
          break
        case 'warning':
          this.warnings.push(text)
          break
      }
    })
  }

  getIconRelatedErrors(): string[] {
    return this.errors.filter(error =>
      error.toLowerCase().includes('icon') ||
      error.toLowerCase().includes('atlas') ||
      error.toLowerCase().includes('svg')
    )
  }

  getIconRelatedWarnings(): string[] {
    return this.warnings.filter(warning =>
      warning.toLowerCase().includes('icon') ||
      warning.toLowerCase().includes('atlas') ||
      warning.toLowerCase().includes('not found')
    )
  }

  getAllErrors(): string[] {
    return [...this.errors]
  }

  getAllWarnings(): string[] {
    return [...this.warnings]
  }

  clearLogs(): void {
    this.errors = []
    this.warnings = []
  }

  hasNoIconErrors(): boolean {
    return this.getIconRelatedErrors().length === 0
  }
}

/**
 * Visual Comparison Utilities
 */
export class VisualValidator {
  constructor(private page: Page) {}

  /**
   * Compare icon sections across different pages
   */
  async compareIconSections(pages: string[], sectionName: string): Promise<boolean> {
    const screenshots: Buffer[] = []
    
    for (const pageUrl of pages) {
      await this.page.goto(pageUrl)
      await this.page.waitForLoadState('networkidle')
      
      const section = this.page.locator('h2', { hasText: sectionName }).locator('..')
      
      if (await section.count() > 0) {
        const screenshot = await section.screenshot()
        screenshots.push(screenshot)
      }
    }

    // Basic comparison - check if we have screenshots
    return screenshots.length === pages.length
  }

  /**
   * Verify icon consistency across viewport sizes
   */
  async validateResponsiveIconRendering(viewports: { width: number; height: number }[]): Promise<void> {
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)
      await this.page.reload()
      await this.page.waitForLoadState('networkidle')

      // Check that icons are still visible
      const iconCount = await this.page.locator('svg').count()
      expect(iconCount).toBeGreaterThan(0)

      // Verify at least first icon is visible
      await expect(this.page.locator('svg').first()).toBeVisible()
    }
  }
}

/**
 * Migration Safety Utilities
 */
export class MigrationValidator {
  constructor(private page: Page) {}

  /**
   * Check for icon library conflicts
   */
  async checkIconLibraryConflicts(): Promise<{ hasConflicts: boolean; conflicts: string[] }> {
    const conflicts: string[] = []
    
    // Check if both Lucide and Atlas icons are present
    const lucideImports = await this.page.evaluate(() => {
      // Check for Lucide React in the global scope
      return typeof (window as any).lucide !== 'undefined' ||
             typeof (window as any).LucideReact !== 'undefined'
    })

    const atlasImports = await this.page.evaluate(() => {
      // Check for Atlas Icons in the global scope
      return typeof (window as any).AtlasIcons !== 'undefined'
    })

    if (lucideImports && atlasImports) {
      conflicts.push('Both Lucide React and Atlas Icons detected')
    }

    // Check for naming conflicts in icon elements
    const iconElements = await this.page.locator('svg').all()
    const iconClasses: string[] = []
    
    for (const icon of iconElements) {
      const className = await icon.getAttribute('class')
      if (className) {
        iconClasses.push(className)
      }
    }

    // Look for duplicate patterns
    const duplicates = iconClasses.filter((item, index) => 
      iconClasses.indexOf(item) !== index && item !== ''
    )

    if (duplicates.length > 0) {
      conflicts.push(`Duplicate icon classes found: ${duplicates.join(', ')}`)
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    }
  }

  /**
   * Validate gradual migration compatibility
   */
  async validateMigrationPath(): Promise<{ isCompatible: boolean; issues: string[] }> {
    const issues: string[] = []
    
    try {
      // Test that both icon systems can coexist
      const iconCount = await this.page.locator('svg').count()
      
      if (iconCount === 0) {
        issues.push('No icons found on page')
      }

      // Check for JavaScript errors
      const jsErrors = await this.page.evaluate(() => {
        return (window as any).__iconErrors || []
      })

      if (jsErrors.length > 0) {
        issues.push(`JavaScript errors: ${jsErrors.join(', ')}`)
      }

    } catch (error) {
      issues.push(`Migration validation error: ${error}`)
    }

    return {
      isCompatible: issues.length === 0,
      issues
    }
  }
}

/**
 * Test Data Providers
 */
export const TestDataProvider = {
  getCommonIcons: () => Object.keys(ICON_MAPPINGS),
  getExpectedSizes: () => [...EXPECTED_ICON_SIZES],
  getAuroraColors: () => [...AURORA_COLOR_VARIABLES],
  getTestPages: () => [...TEST_PAGES],
  
  getResponsiveViewports: () => [
    { width: 375, height: 667 },   // Mobile
    { width: 768, height: 1024 },  // Tablet
    { width: 1200, height: 800 },  // Desktop
    { width: 1920, height: 1080 }  // Large Desktop
  ]
}

/**
 * Test Report Generator
 */
export class TestReportGenerator {
  private results: Array<{
    test: string
    status: 'pass' | 'fail'
    message: string
    timestamp: Date
  }> = []

  addResult(test: string, status: 'pass' | 'fail', message: string): void {
    this.results.push({
      test,
      status,
      message,
      timestamp: new Date()
    })
  }

  generateSummary(): {
    total: number
    passed: number
    failed: number
    passRate: number
    summary: string
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const passRate = total > 0 ? (passed / total) * 100 : 0

    const summary = `
Atlas Icons Integration Test Summary
===================================
Total Tests: ${total}
Passed: ${passed}
Failed: ${failed}
Pass Rate: ${passRate.toFixed(1)}%

${failed > 0 ? '\nFailed Tests:' : ''}
${this.results
  .filter(r => r.status === 'fail')
  .map(r => `- ${r.test}: ${r.message}`)
  .join('\n')}
    `.trim()

    return { total, passed, failed, passRate, summary }
  }

  getDetailedResults(): typeof this.results {
    return [...this.results]
  }
}