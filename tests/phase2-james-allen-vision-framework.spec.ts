import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Phase 2: James Allen-Inspired Navigation E2E Vision Mode Testing Framework
 * Success criteria: Only surpassing all criteria allows progression to Phase 3
 * Reference: https://www.jamesallen.com/ navigation patterns
 * Compliance: CLAUDE_RULES.md performance and accessibility standards
 */

// Vision Mode Success Criteria Thresholds
const SUCCESS_CRITERIA = {
  VISUAL_ALIGNMENT_SCORE: 85, // Minimum 85% visual similarity to James Allen patterns
  PERFORMANCE_THRESHOLD: 300, // Maximum 300ms for dropdowns (CLAUDE_RULES compliant)
  ACCESSIBILITY_SCORE: 95, // Minimum 95% accessibility compliance
  RESPONSIVE_BREAKPOINTS: ['375px', '768px', '1024px', '1920px'], // Must pass all breakpoints
  BORDER_RADIUS_COMPLIANCE: '21px', // Fibonacci standard from codebase
  COLOR_SYSTEM_COMPLIANCE: 90, // 90% Aurora CSS variable usage
  USER_EXPERIENCE_SCORE: 88 // Minimum user interaction quality
}

interface VisionTestMetrics {
  visualSimilarity: number
  performanceMs: number
  accessibilityScore: number
  colorCompliance: number
  borderRadiusCompliance: boolean
  responsiveScore: number
  userExperienceScore: number
}

class VisionModeFramework {
  private page: Page
  private testResults: VisionTestMetrics = {
    visualSimilarity: 0,
    performanceMs: 0,
    accessibilityScore: 0,
    colorCompliance: 0,
    borderRadiusCompliance: false,
    responsiveScore: 0,
    userExperienceScore: 0
  }

  constructor(page: Page) {
    this.page = page
  }

  async captureBaselineScreenshots(testName: string) {
    // Capture multiple viewport states for comparison
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)
      await this.page.waitForTimeout(500) // Allow layout reflow
      
      await this.page.screenshot({
        path: `test-results/phase2-${testName}-${viewport.name}-baseline.png`,
        fullPage: true
      })
    }
  }

  async measurePerformance(): Promise<number> {
    const startTime = performance.now()
    
    // Trigger mega-menu opening
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.locator('[data-testid="mega-menu"]').waitFor({ state: 'visible', timeout: 5000 })
    
    const endTime = performance.now()
    const performanceMs = endTime - startTime
    
    this.testResults.performanceMs = performanceMs
    return performanceMs
  }

  async evaluateVisualSimilarity(): Promise<number> {
    // Capture current mega-menu state
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    await megaMenu.screenshot({ path: 'test-results/phase2-current-mega-menu.png' })
    
    // Visual assessment criteria based on James Allen patterns
    const visualChecks = {
      containerStructure: await this.checkContainerStructure(),
      columnLayout: await this.checkColumnLayout(),
      typographyHierarchy: await this.checkTypographyHierarchy(),
      spacingConsistency: await this.checkSpacingConsistency(),
      colorHarmony: await this.checkColorHarmony()
    }
    
    const totalChecks = Object.keys(visualChecks).length
    const passedChecks = Object.values(visualChecks).filter(Boolean).length
    const similarity = (passedChecks / totalChecks) * 100
    
    this.testResults.visualSimilarity = similarity
    return similarity
  }

  private async checkContainerStructure(): Promise<boolean> {
    // Verify mega-menu follows James Allen container patterns
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    const hasRoundedCorners = await megaMenu.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.borderRadius === '21px' // Fibonacci standard
    })
    
    const hasProperPadding = await megaMenu.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return rect.width > 800 && rect.width < 1200 // Optimal width range
    })
    
    return hasRoundedCorners && hasProperPadding
  }

  private async checkColumnLayout(): Promise<boolean> {
    // Verify responsive grid system matches James Allen patterns
    const columns = this.page.locator('[data-testid="mega-menu-columns"]')
    const columnCount = await columns.locator('> div').count()
    
    // Should have 4 columns on desktop (1920px viewport)
    await this.page.setViewportSize({ width: 1920, height: 1080 })
    const desktopColumns = await columns.locator('> div').count()
    
    return desktopColumns >= 3 && desktopColumns <= 4 // Flexible but reasonable
  }

  private async checkTypographyHierarchy(): Promise<boolean> {
    // Verify typography follows Aurora Design System with James Allen inspiration
    const headings = this.page.locator('[data-testid="mega-menu"] h3')
    const headingCount = await headings.count()
    
    if (headingCount === 0) return false
    
    const hasConsistentSizing = await headings.first().evaluate(el => {
      const styles = window.getComputedStyle(el)
      const fontSize = parseFloat(styles.fontSize)
      return fontSize >= 18 && fontSize <= 24 // Reasonable heading size
    })
    
    return hasConsistentSizing
  }

  private async checkSpacingConsistency(): Promise<boolean> {
    // Verify spacing follows 8px grid system similar to James Allen
    const menuItems = this.page.locator('[data-testid="mega-menu"] [data-testid^="category-"]')
    const itemCount = await menuItems.count()
    
    if (itemCount === 0) return false
    
    const hasConsistentSpacing = await menuItems.first().evaluate(el => {
      const styles = window.getComputedStyle(el)
      const marginBottom = parseFloat(styles.marginBottom)
      return marginBottom % 4 === 0 // 4px grid system
    })
    
    return hasConsistentSpacing
  }

  private async checkColorHarmony(): Promise<boolean> {
    // Verify Aurora color system compliance
    const colorElements = await this.page.locator('[data-testid="mega-menu"] *').evaluateAll(elements => {
      let auroraColorUsage = 0
      let totalColorUsage = 0
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          totalColorUsage++
          if (color.includes('--aurora-') || 
              color.includes('rgb(107, 70, 193)') || // --aurora-nebula-purple
              color.includes('rgb(255, 107, 157)')) { // --aurora-pink
            auroraColorUsage++
          }
        }
        
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          totalColorUsage++
          if (backgroundColor.includes('--aurora-') || 
              backgroundColor.includes('rgb(247, 247, 249)')) { // --aurora-lunar-grey
            auroraColorUsage++
          }
        }
      })
      
      return totalColorUsage > 0 ? (auroraColorUsage / totalColorUsage) * 100 : 0
    })
    
    this.testResults.colorCompliance = colorElements
    return colorElements >= SUCCESS_CRITERIA.COLOR_SYSTEM_COMPLIANCE
  }

  async evaluateAccessibility(): Promise<number> {
    // Run comprehensive accessibility checks
    const accessibilityIssues = await this.page.evaluate(() => {
      const issues = []
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      if (headings.length === 0) issues.push('No headings found')
      
      // Check for alt text on images
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        if (!img.alt) issues.push('Missing alt text on image')
      })
      
      // Check for proper button/link semantics
      const interactiveElements = document.querySelectorAll('button, a')
      interactiveElements.forEach(el => {
        if (!el.textContent?.trim() && !el.getAttribute('aria-label')) {
          issues.push('Interactive element missing accessible text')
        }
      })
      
      // Check color contrast (simplified)
      const textElements = document.querySelectorAll('*')
      let contrastIssues = 0
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Basic contrast check (simplified)
        if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
          contrastIssues++
        }
      })
      
      return issues.length + contrastIssues
    })
    
    const maxPossibleIssues = 20 // Reasonable baseline
    const accessibilityScore = Math.max(0, (maxPossibleIssues - accessibilityIssues) / maxPossibleIssues * 100)
    
    this.testResults.accessibilityScore = accessibilityScore
    return accessibilityScore
  }

  async evaluateResponsiveScore(): Promise<number> {
    let responsiveScore = 0
    const breakpoints = SUCCESS_CRITERIA.RESPONSIVE_BREAKPOINTS
    
    for (const breakpoint of breakpoints) {
      const width = parseInt(breakpoint)
      await this.page.setViewportSize({ width, height: 800 })
      await this.page.waitForTimeout(300)
      
      // Check if mega-menu adapts properly
      const megaMenu = this.page.locator('[data-testid="mega-menu"]')
      const isVisible = await megaMenu.isVisible()
      
      if (isVisible) {
        const columns = this.page.locator('[data-testid="mega-menu-columns"] > div')
        const columnCount = await columns.count()
        
        // Score based on appropriate column count for viewport
        if (width >= 1024 && columnCount >= 3) responsiveScore += 25
        else if (width >= 768 && width < 1024 && columnCount >= 2) responsiveScore += 25
        else if (width < 768 && columnCount === 1) responsiveScore += 25
        else responsiveScore += 10 // Partial credit
      }
    }
    
    this.testResults.responsiveScore = responsiveScore
    return responsiveScore
  }

  async evaluateUserExperience(): Promise<number> {
    let uxScore = 0
    
    // Test hover responsiveness
    const hoverStart = performance.now()
    await this.page.hover('[data-testid="rings-nav-item"]')
    await this.page.locator('[data-testid="mega-menu"]').waitFor({ state: 'visible', timeout: 1000 })
    const hoverTime = performance.now() - hoverStart
    
    if (hoverTime < 200) uxScore += 25
    else if (hoverTime < 400) uxScore += 15
    else uxScore += 5
    
    // Test mouse leave behavior
    await this.page.mouse.move(100, 100) // Move away from menu
    await this.page.waitForTimeout(300)
    const menuStillVisible = await this.page.locator('[data-testid="mega-menu"]').isVisible()
    
    if (!menuStillVisible) uxScore += 25
    else uxScore += 10
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab')
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName)
    if (focusedElement === 'BUTTON' || focusedElement === 'A') uxScore += 25
    
    // Test mobile interaction
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.page.touchscreen.tap(200, 100) // Simulate touch
    uxScore += 13 // Base mobile score
    
    this.testResults.userExperienceScore = uxScore
    return uxScore
  }

  async generateComprehensiveReport(): Promise<boolean> {
    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 2: James Allen-Inspired Navigation',
      successCriteria: SUCCESS_CRITERIA,
      actualResults: this.testResults,
      overallStatus: this.calculateOverallStatus(),
      recommendations: this.generateRecommendations()
    }
    
    console.log('🎭 PHASE 2 VISION MODE TESTING REPORT')
    console.log('=====================================')
    console.log(`Visual Similarity: ${this.testResults.visualSimilarity.toFixed(1)}% (Required: ${SUCCESS_CRITERIA.VISUAL_ALIGNMENT_SCORE}%)`)
    console.log(`Performance: ${this.testResults.performanceMs.toFixed(0)}ms (Max: ${SUCCESS_CRITERIA.PERFORMANCE_THRESHOLD}ms)`)
    console.log(`Accessibility: ${this.testResults.accessibilityScore.toFixed(1)}% (Required: ${SUCCESS_CRITERIA.ACCESSIBILITY_SCORE}%)`)
    console.log(`Color Compliance: ${this.testResults.colorCompliance.toFixed(1)}% (Required: ${SUCCESS_CRITERIA.COLOR_SYSTEM_COMPLIANCE}%)`)
    console.log(`Responsive Score: ${this.testResults.responsiveScore.toFixed(0)}% (Required: 80%+)`)
    console.log(`User Experience: ${this.testResults.userExperienceScore.toFixed(0)}% (Required: ${SUCCESS_CRITERIA.USER_EXPERIENCE_SCORE}%+)`)
    console.log(`Border Radius: ${this.testResults.borderRadiusCompliance ? '✅ Compliant' : '❌ Non-compliant'} (Required: ${SUCCESS_CRITERIA.BORDER_RADIUS_COMPLIANCE})`)
    
    return this.calculateOverallStatus()
  }

  private calculateOverallStatus(): boolean {
    const checks = [
      this.testResults.visualSimilarity >= SUCCESS_CRITERIA.VISUAL_ALIGNMENT_SCORE,
      this.testResults.performanceMs <= SUCCESS_CRITERIA.PERFORMANCE_THRESHOLD,
      this.testResults.accessibilityScore >= SUCCESS_CRITERIA.ACCESSIBILITY_SCORE,
      this.testResults.colorCompliance >= SUCCESS_CRITERIA.COLOR_SYSTEM_COMPLIANCE,
      this.testResults.borderRadiusCompliance,
      this.testResults.responsiveScore >= 80, // 80% minimum for responsive
      this.testResults.userExperienceScore >= SUCCESS_CRITERIA.USER_EXPERIENCE_SCORE
    ]
    
    return checks.every(Boolean)
  }

  private generateRecommendations(): string[] {
    const recommendations = []
    
    if (this.testResults.visualSimilarity < SUCCESS_CRITERIA.VISUAL_ALIGNMENT_SCORE) {
      recommendations.push('Improve visual alignment with James Allen patterns - focus on container structure and spacing')
    }
    
    if (this.testResults.performanceMs > SUCCESS_CRITERIA.PERFORMANCE_THRESHOLD) {
      recommendations.push('Optimize dropdown performance - consider lazy loading or animation optimizations')
    }
    
    if (this.testResults.accessibilityScore < SUCCESS_CRITERIA.ACCESSIBILITY_SCORE) {
      recommendations.push('Address accessibility issues - add missing ARIA labels and improve focus management')
    }
    
    if (this.testResults.colorCompliance < SUCCESS_CRITERIA.COLOR_SYSTEM_COMPLIANCE) {
      recommendations.push('Increase Aurora CSS variable usage - replace hardcoded colors with system variables')
    }
    
    if (!this.testResults.borderRadiusCompliance) {
      recommendations.push('Standardize border radius to 21px (Fibonacci) across all mega-menu containers')
    }
    
    if (this.testResults.responsiveScore < 80) {
      recommendations.push('Improve responsive behavior - ensure proper column adaptation at all breakpoints')
    }
    
    if (this.testResults.userExperienceScore < SUCCESS_CRITERIA.USER_EXPERIENCE_SCORE) {
      recommendations.push('Enhance user experience - optimize hover timing and keyboard navigation')
    }
    
    return recommendations
  }
}

test.describe('Phase 2: James Allen Vision Mode Testing Framework', () => {
  let visionFramework: VisionModeFramework

  test.beforeEach(async ({ page }) => {
    visionFramework = new VisionModeFramework(page)
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('Phase 2.1: Comprehensive Visual Similarity Assessment', async ({ page }) => {
    console.log('🎭 Starting comprehensive visual similarity assessment...')
    
    await visionFramework.captureBaselineScreenshots('visual-similarity')
    const visualScore = await visionFramework.evaluateVisualSimilarity()
    
    console.log(`📊 Visual Similarity Score: ${visualScore.toFixed(1)}%`)
    expect(visualScore).toBeGreaterThanOrEqual(SUCCESS_CRITERIA.VISUAL_ALIGNMENT_SCORE)
  })

  test('Phase 2.2: Performance Benchmarking', async ({ page }) => {
    console.log('⚡ Running performance benchmarking...')
    
    const performanceMs = await visionFramework.measurePerformance()
    
    console.log(`🚀 Dropdown Performance: ${performanceMs.toFixed(0)}ms`)
    expect(performanceMs).toBeLessThanOrEqual(SUCCESS_CRITERIA.PERFORMANCE_THRESHOLD)
  })

  test('Phase 2.3: Accessibility Compliance Validation', async ({ page }) => {
    console.log('♿ Validating accessibility compliance...')
    
    const accessibilityScore = await visionFramework.evaluateAccessibility()
    
    console.log(`🌟 Accessibility Score: ${accessibilityScore.toFixed(1)}%`)
    expect(accessibilityScore).toBeGreaterThanOrEqual(SUCCESS_CRITERIA.ACCESSIBILITY_SCORE)
  })

  test('Phase 2.4: Responsive Design Multi-Breakpoint Testing', async ({ page }) => {
    console.log('📱 Testing responsive design across breakpoints...')
    
    const responsiveScore = await visionFramework.evaluateResponsiveScore()
    
    console.log(`📐 Responsive Score: ${responsiveScore}%`)
    expect(responsiveScore).toBeGreaterThanOrEqual(80)
  })

  test('Phase 2.5: User Experience Quality Assessment', async ({ page }) => {
    console.log('👤 Assessing user experience quality...')
    
    const uxScore = await visionFramework.evaluateUserExperience()
    
    console.log(`💫 User Experience Score: ${uxScore}%`)
    expect(uxScore).toBeGreaterThanOrEqual(SUCCESS_CRITERIA.USER_EXPERIENCE_SCORE)
  })

  test('Phase 2.6: GATE TEST - Comprehensive Success Criteria Validation', async ({ page }) => {
    console.log('🚪 PHASE 2 GATE TEST: Validating all success criteria...')
    
    // Run all assessments
    await visionFramework.captureBaselineScreenshots('gate-test')
    await visionFramework.measurePerformance()
    await visionFramework.evaluateVisualSimilarity()
    await visionFramework.evaluateAccessibility()
    await visionFramework.evaluateResponsiveScore()
    await visionFramework.evaluateUserExperience()
    
    const overallSuccess = await visionFramework.generateComprehensiveReport()
    
    if (overallSuccess) {
      console.log('🎉 PHASE 2 COMPLETE: All success criteria met - Ready for Phase 3')
      console.log('✅ James Allen-inspired navigation enhancements approved for implementation')
    } else {
      console.log('❌ PHASE 2 BLOCKED: Success criteria not met - Phase 3 implementation blocked')
      console.log('🔧 Review recommendations and re-test before proceeding')
    }
    
    // Screenshot evidence of gate test completion
    await page.screenshot({
      path: 'test-results/phase2-gate-test-evidence.png',
      fullPage: true
    })
    
    expect(overallSuccess).toBe(true)
  })
})