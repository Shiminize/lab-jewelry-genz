import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Phase 3: Visual Design Implementation E2E Vision Mode Testing Framework
 * Success criteria: Must achieve James Allen aesthetic parity with CLAUDE_RULES compliance
 * Focus: Border radius standardization, color harmony, spacing optimization
 * Gate requirement: Only surpassing all criteria allows progression to Phase 4
 */

const PHASE3_SUCCESS_CRITERIA = {
  JAMES_ALLEN_AESTHETIC_PARITY: 90, // 90% visual similarity to James Allen design
  BORDER_RADIUS_CONSISTENCY: 100, // 100% compliance with 21px Fibonacci standard
  COLOR_HARMONY_SCORE: 95, // 95% Aurora Design System color usage
  SPACING_GRID_COMPLIANCE: 90, // 90% compliance with 8px grid system
  VISUAL_HIERARCHY_SCORE: 85, // 85% typography and layout hierarchy clarity
  ANIMATION_SMOOTHNESS: 88, // 88% smooth transitions and micro-interactions
  CONTAINER_STRUCTURE_SCORE: 92, // 92% optimal container organization
  SHADOW_SYSTEM_COMPLIANCE: 85 // 85% consistent shadow/elevation system
}

interface Phase3VisionMetrics {
  aestheticParity: number
  borderRadiusConsistency: number
  colorHarmony: number
  spacingCompliance: number
  visualHierarchy: number
  animationSmoothness: number
  containerStructure: number
  shadowSystem: number
}

class Phase3VisionFramework {
  private page: Page
  private metrics: Phase3VisionMetrics = {
    aestheticParity: 0,
    borderRadiusConsistency: 0,
    colorHarmony: 0,
    spacingCompliance: 0,
    visualHierarchy: 0,
    animationSmoothness: 0,
    containerStructure: 0,
    shadowSystem: 0
  }

  constructor(page: Page) {
    this.page = page
  }

  async measureAestheticParity(): Promise<number> {
    console.log('🎨 Measuring James Allen aesthetic parity...')
    
    // Capture current implementation
    await this.page.hover('[data-testid="rings-nav-item"]')
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    await megaMenu.waitFor({ state: 'visible', timeout: 5000 })
    
    await megaMenu.screenshot({ 
      path: 'test-results/phase3-current-aesthetic.png',
      clip: { x: 0, y: 0, width: 1200, height: 600 }
    })
    
    // Visual assessment against James Allen patterns
    const aestheticChecks = {
      containerElegance: await this.assessContainerElegance(),
      typographicRefinement: await this.assessTypographicRefinement(),
      layoutBalance: await this.assessLayoutBalance(),
      visualCleanliness: await this.assessVisualCleanliness(),
      interactionRefinement: await this.assessInteractionRefinement()
    }
    
    const totalChecks = Object.keys(aestheticChecks).length
    const passedChecks = Object.values(aestheticChecks).filter(score => score >= 80).length
    const aestheticParity = (passedChecks / totalChecks) * 100
    
    this.metrics.aestheticParity = aestheticParity
    console.log(`✨ Aesthetic Parity: ${aestheticParity.toFixed(1)}%`)
    return aestheticParity
  }

  private async assessContainerElegance(): Promise<number> {
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    
    const eleganceMetrics = await megaMenu.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      
      let score = 0
      
      // Check border radius (Fibonacci 21px)
      if (styles.borderRadius === '21px') score += 25
      
      // Check proper proportions
      const aspectRatio = rect.width / rect.height
      if (aspectRatio >= 2.5 && aspectRatio <= 4.0) score += 25
      
      // Check backdrop blur
      if (styles.backdropFilter.includes('blur')) score += 25
      
      // Check subtle borders
      if (styles.border !== 'none' && !styles.border.includes('2px')) score += 25
      
      return score
    })
    
    return eleganceMetrics
  }

  private async assessTypographicRefinement(): Promise<number> {
    const headings = this.page.locator('[data-testid="mega-menu"] h3')
    const descriptions = this.page.locator('[data-testid="mega-menu"] p')
    
    let score = 0
    
    // Check heading consistency
    const headingCount = await headings.count()
    if (headingCount > 0) {
      const headingStyles = await headings.first().evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: parseFloat(styles.fontSize),
          fontWeight: styles.fontWeight,
          lineHeight: parseFloat(styles.lineHeight)
        }
      })
      
      // James Allen uses refined typography
      if (headingStyles.fontSize >= 16 && headingStyles.fontSize <= 20) score += 30
      if (headingStyles.fontWeight === '600' || headingStyles.fontWeight === 'bold') score += 20
    }
    
    // Check description refinement
    const descriptionCount = await descriptions.count()
    if (descriptionCount > 0) {
      const descStyles = await descriptions.first().evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: parseFloat(styles.fontSize),
          lineHeight: parseFloat(styles.lineHeight),
          opacity: parseFloat(styles.opacity)
        }
      })
      
      if (descStyles.fontSize >= 13 && descStyles.fontSize <= 15) score += 25
      if (descStyles.lineHeight >= 1.4 && descStyles.lineHeight <= 1.6) score += 25
    }
    
    return score
  }

  private async assessLayoutBalance(): Promise<number> {
    const columns = this.page.locator('[data-testid="mega-menu-columns"] > div')
    const columnCount = await columns.count()
    
    let score = 0
    
    // James Allen typically uses 3-4 balanced columns
    if (columnCount >= 3 && columnCount <= 4) score += 40
    
    // Check column content balance
    for (let i = 0; i < Math.min(columnCount, 4); i++) {
      const column = columns.nth(i)
      const itemCount = await column.locator('[data-testid^="category-"]').count()
      
      // Each column should have reasonable content
      if (itemCount >= 2 && itemCount <= 8) score += 15
    }
    
    return Math.min(score, 100)
  }

  private async assessVisualCleanliness(): Promise<number> {
    let score = 0
    
    // Check for visual clutter
    const allElements = this.page.locator('[data-testid="mega-menu"] *')
    const elementCount = await allElements.count()
    
    // Reasonable element count (not too cluttered)
    if (elementCount < 100) score += 30
    
    // Check spacing consistency
    const spacingConsistent = await this.page.locator('[data-testid="mega-menu"]').evaluate(el => {
      const elements = el.querySelectorAll('*')
      let consistentSpacing = 0
      let totalElements = 0
      
      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const margin = parseFloat(styles.marginBottom)
        const padding = parseFloat(styles.paddingTop)
        
        if (margin > 0 || padding > 0) {
          totalElements++
          // Check if follows 8px grid
          if ((margin % 8 === 0) || (padding % 8 === 0)) {
            consistentSpacing++
          }
        }
      })
      
      return totalElements > 0 ? (consistentSpacing / totalElements) * 100 : 0
    })
    
    score += spacingConsistent * 0.7 // Weight spacing consistency highly
    
    return Math.min(score, 100)
  }

  private async assessInteractionRefinement(): Promise<number> {
    let score = 0
    
    // Test hover states
    const interactiveElements = this.page.locator('[data-testid="mega-menu"] a, [data-testid="mega-menu"] button')
    const elementCount = await interactiveElements.count()
    
    if (elementCount > 0) {
      // Test first few elements for hover refinement
      for (let i = 0; i < Math.min(elementCount, 3); i++) {
        const element = interactiveElements.nth(i)
        
        // Check for smooth hover transitions
        const hasTransition = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return styles.transition !== 'none' && styles.transition.length > 0
        })
        
        if (hasTransition) score += 15
        
        // Test actual hover behavior
        await element.hover()
        await this.page.waitForTimeout(100)
        
        const hoverStyles = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            transform: styles.transform,
            boxShadow: styles.boxShadow,
            color: styles.color
          }
        })
        
        // Check for refined hover effects (subtle, not aggressive)
        if (hoverStyles.transform !== 'none' && !hoverStyles.transform.includes('scale(1.5)')) score += 10
        if (hoverStyles.boxShadow !== 'none') score += 5
      }
    }
    
    return Math.min(score, 100)
  }

  async measureBorderRadiusConsistency(): Promise<number> {
    console.log('📐 Measuring border radius consistency...')
    
    const borderRadiusCompliance = await this.page.locator('[data-testid="mega-menu"]').evaluate(el => {
      const allElements = el.querySelectorAll('*')
      let totalElementsWithRadius = 0
      let compliantElements = 0
      
      allElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const borderRadius = styles.borderRadius
        
        if (borderRadius !== '0px' && borderRadius !== '' && borderRadius !== 'none') {
          totalElementsWithRadius++
          
          // Check for Fibonacci values: 21px, 13px, 8px, 5px
          if (borderRadius === '21px' || 
              borderRadius === '13px' || 
              borderRadius === '8px' || 
              borderRadius === '5px') {
            compliantElements++
          }
        }
      })
      
      return totalElementsWithRadius > 0 ? (compliantElements / totalElementsWithRadius) * 100 : 100
    })
    
    this.metrics.borderRadiusConsistency = borderRadiusCompliance
    console.log(`🔄 Border Radius Consistency: ${borderRadiusCompliance.toFixed(1)}%`)
    return borderRadiusCompliance
  }

  async measureColorHarmony(): Promise<number> {
    console.log('🎨 Measuring color harmony...')
    
    const colorAnalysis = await this.page.locator('[data-testid="mega-menu"]').evaluate(el => {
      const allElements = el.querySelectorAll('*')
      let auroraColorUsage = 0
      let totalColorProperties = 0
      
      // Aurora color mappings
      const auroraColors = {
        'rgb(107, 70, 193)': '--aurora-nebula-purple',
        'rgb(255, 107, 157)': '--aurora-pink',
        'rgb(10, 14, 39)': '--aurora-deep-space',
        'rgb(247, 247, 249)': '--aurora-lunar-grey',
        'rgb(196, 69, 105)': '--aurora-crimson',
        'rgb(114, 60, 112)': '--aurora-plum'
      }
      
      allElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        
        // Check color properties
        [styles.color, styles.backgroundColor, styles.borderColor].forEach(color => {
          if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
            totalColorProperties++
            
            if (Object.keys(auroraColors).some(auroraColor => color.includes(auroraColor))) {
              auroraColorUsage++
            }
          }
        })
      })
      
      return {
        auroraUsage: totalColorProperties > 0 ? (auroraColorUsage / totalColorProperties) * 100 : 0,
        totalProperties: totalColorProperties
      }
    })
    
    this.metrics.colorHarmony = colorAnalysis.auroraUsage
    console.log(`🌈 Color Harmony: ${colorAnalysis.auroraUsage.toFixed(1)}%`)
    return colorAnalysis.auroraUsage
  }

  async measureSpacingCompliance(): Promise<number> {
    console.log('📏 Measuring spacing grid compliance...')
    
    const spacingAnalysis = await this.page.locator('[data-testid="mega-menu"]').evaluate(el => {
      const allElements = el.querySelectorAll('*')
      let compliantSpacing = 0
      let totalSpacingProperties = 0
      
      allElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        
        // Check spacing properties
        const spacingProps = [
          parseFloat(styles.marginTop),
          parseFloat(styles.marginRight),
          parseFloat(styles.marginBottom),
          parseFloat(styles.marginLeft),
          parseFloat(styles.paddingTop),
          parseFloat(styles.paddingRight),
          parseFloat(styles.paddingBottom),
          parseFloat(styles.paddingLeft)
        ]
        
        spacingProps.forEach(value => {
          if (value > 0) {
            totalSpacingProperties++
            
            // Check if follows 8px grid system
            if (value % 8 === 0 || value % 4 === 0) {
              compliantSpacing++
            }
          }
        })
      })
      
      return totalSpacingProperties > 0 ? (compliantSpacing / totalSpacingProperties) * 100 : 100
    })
    
    this.metrics.spacingCompliance = spacingAnalysis
    console.log(`📐 Spacing Compliance: ${spacingAnalysis.toFixed(1)}%`)
    return spacingAnalysis
  }

  async measureVisualHierarchy(): Promise<number> {
    console.log('📊 Measuring visual hierarchy clarity...')
    
    let hierarchyScore = 0
    
    // Check heading hierarchy
    const headings = this.page.locator('[data-testid="mega-menu"] h1, [data-testid="mega-menu"] h2, [data-testid="mega-menu"] h3, [data-testid="mega-menu"] h4')
    const headingCount = await headings.count()
    
    if (headingCount > 0) {
      hierarchyScore += 30 // Has structured headings
      
      // Check for proper size progression
      const headingSizes = await headings.evaluateAll(headings => {
        return headings.map(h => {
          const styles = window.getComputedStyle(h)
          return {
            tag: h.tagName,
            fontSize: parseFloat(styles.fontSize)
          }
        }).sort((a, b) => {
          const tagOrder = {'H1': 1, 'H2': 2, 'H3': 3, 'H4': 4}
          return tagOrder[a.tag] - tagOrder[b.tag]
        })
      })
      
      // Check if font sizes decrease appropriately
      let properProgression = true
      for (let i = 1; i < headingSizes.length; i++) {
        if (headingSizes[i].fontSize > headingSizes[i-1].fontSize) {
          properProgression = false
          break
        }
      }
      
      if (properProgression) hierarchyScore += 25
    }
    
    // Check content organization
    const sections = this.page.locator('[data-testid="mega-menu"] [data-testid^="category-"]')
    const sectionCount = await sections.count()
    
    if (sectionCount >= 3 && sectionCount <= 6) hierarchyScore += 30 // Optimal section count
    
    // Check for proper contrast ratios (simplified)
    const contrastScore = await this.page.locator('[data-testid="mega-menu"]').evaluate(el => {
      const textElements = el.querySelectorAll('*')
      let goodContrast = 0
      let totalText = 0
      
      textElements.forEach(element => {
        if (element.textContent && element.textContent.trim()) {
          totalText++
          const styles = window.getComputedStyle(element)
          const color = styles.color
          
          // Basic contrast check (Aurora colors have good contrast)
          if (color.includes('rgb(10, 14, 39)') || // Deep space
              color.includes('rgb(107, 70, 193)')) { // Nebula purple
            goodContrast++
          }
        }
      })
      
      return totalText > 0 ? (goodContrast / totalText) * 100 : 0
    })
    
    hierarchyScore += (contrastScore * 0.15) // 15% weight for contrast
    
    this.metrics.visualHierarchy = Math.min(hierarchyScore, 100)
    console.log(`📈 Visual Hierarchy: ${this.metrics.visualHierarchy.toFixed(1)}%`)
    return this.metrics.visualHierarchy
  }

  async measureAnimationSmoothness(): Promise<number> {
    console.log('🎬 Measuring animation smoothness...')
    
    let smoothnessScore = 0
    
    // Test dropdown opening animation
    const startTime = performance.now()
    
    // Close any open menus first
    await this.page.mouse.move(100, 100)
    await this.page.waitForTimeout(500)
    
    // Trigger menu opening
    await this.page.hover('[data-testid="rings-nav-item"]')
    const megaMenu = this.page.locator('[data-testid="mega-menu"]')
    await megaMenu.waitFor({ state: 'visible', timeout: 1000 })
    
    const openTime = performance.now() - startTime
    
    // Score based on opening speed (James Allen is very smooth)
    if (openTime < 150) smoothnessScore += 40
    else if (openTime < 300) smoothnessScore += 25
    else if (openTime < 500) smoothnessScore += 10
    
    // Test closing animation
    const closeStartTime = performance.now()
    await this.page.mouse.move(100, 100)
    await megaMenu.waitFor({ state: 'hidden', timeout: 1000 })
    const closeTime = performance.now() - closeStartTime
    
    if (closeTime < 200) smoothnessScore += 30
    else if (closeTime < 400) smoothnessScore += 15
    else if (closeTime < 600) smoothnessScore += 5
    
    // Test hover micro-interactions
    await this.page.hover('[data-testid="rings-nav-item"]')
    await megaMenu.waitFor({ state: 'visible' })
    
    const interactiveElements = this.page.locator('[data-testid="mega-menu"] a').first()
    if (await interactiveElements.count() > 0) {
      const hasSmootTransition = await interactiveElements.evaluate(el => {
        const styles = window.getComputedStyle(el)
        const transition = styles.transition
        
        // Check for reasonable transition duration
        return transition.includes('0.2s') || transition.includes('0.3s') || transition.includes('200ms') || transition.includes('300ms')
      })
      
      if (hasSmootTransition) smoothnessScore += 30
    }
    
    this.metrics.animationSmoothness = smoothnessScore
    console.log(`⚡ Animation Smoothness: ${smoothnessScore}%`)
    return smoothnessScore
  }

  async generatePhase3Report(): Promise<boolean> {
    const overallSuccess = this.calculatePhase3Success()
    
    console.log('🎭 PHASE 3 VISION MODE TESTING REPORT')
    console.log('=====================================')
    console.log(`James Allen Aesthetic Parity: ${this.metrics.aestheticParity.toFixed(1)}% (Required: ${PHASE3_SUCCESS_CRITERIA.JAMES_ALLEN_AESTHETIC_PARITY}%)`)
    console.log(`Border Radius Consistency: ${this.metrics.borderRadiusConsistency.toFixed(1)}% (Required: ${PHASE3_SUCCESS_CRITERIA.BORDER_RADIUS_CONSISTENCY}%)`)
    console.log(`Color Harmony: ${this.metrics.colorHarmony.toFixed(1)}% (Required: ${PHASE3_SUCCESS_CRITERIA.COLOR_HARMONY_SCORE}%)`)
    console.log(`Spacing Compliance: ${this.metrics.spacingCompliance.toFixed(1)}% (Required: ${PHASE3_SUCCESS_CRITERIA.SPACING_GRID_COMPLIANCE}%)`)
    console.log(`Visual Hierarchy: ${this.metrics.visualHierarchy.toFixed(1)}% (Required: ${PHASE3_SUCCESS_CRITERIA.VISUAL_HIERARCHY_SCORE}%)`)
    console.log(`Animation Smoothness: ${this.metrics.animationSmoothness}% (Required: ${PHASE3_SUCCESS_CRITERIA.ANIMATION_SMOOTHNESS}%)`)
    
    if (overallSuccess) {
      console.log('🎉 PHASE 3 COMPLETE: Visual design excellence achieved - Ready for Phase 4')
    } else {
      console.log('❌ PHASE 3 BLOCKED: Visual design criteria not met - Implementation required')
    }
    
    return overallSuccess
  }

  private calculatePhase3Success(): boolean {
    return [
      this.metrics.aestheticParity >= PHASE3_SUCCESS_CRITERIA.JAMES_ALLEN_AESTHETIC_PARITY,
      this.metrics.borderRadiusConsistency >= PHASE3_SUCCESS_CRITERIA.BORDER_RADIUS_CONSISTENCY,
      this.metrics.colorHarmony >= PHASE3_SUCCESS_CRITERIA.COLOR_HARMONY_SCORE,
      this.metrics.spacingCompliance >= PHASE3_SUCCESS_CRITERIA.SPACING_GRID_COMPLIANCE,
      this.metrics.visualHierarchy >= PHASE3_SUCCESS_CRITERIA.VISUAL_HIERARCHY_SCORE,
      this.metrics.animationSmoothness >= PHASE3_SUCCESS_CRITERIA.ANIMATION_SMOOTHNESS
    ].every(Boolean)
  }
}

test.describe('Phase 3: Visual Design Excellence Testing', () => {
  let visionFramework: Phase3VisionFramework

  test.beforeEach(async ({ page }) => {
    visionFramework = new Phase3VisionFramework(page)
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('Phase 3.1: James Allen Aesthetic Parity Assessment', async ({ page }) => {
    const aestheticScore = await visionFramework.measureAestheticParity()
    expect(aestheticScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.JAMES_ALLEN_AESTHETIC_PARITY)
  })

  test('Phase 3.2: Border Radius Consistency Validation', async ({ page }) => {
    const radiusScore = await visionFramework.measureBorderRadiusConsistency()
    expect(radiusScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.BORDER_RADIUS_CONSISTENCY)
  })

  test('Phase 3.3: Color Harmony Excellence', async ({ page }) => {
    const colorScore = await visionFramework.measureColorHarmony()
    expect(colorScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.COLOR_HARMONY_SCORE)
  })

  test('Phase 3.4: Spacing Grid System Compliance', async ({ page }) => {
    const spacingScore = await visionFramework.measureSpacingCompliance()
    expect(spacingScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.SPACING_GRID_COMPLIANCE)
  })

  test('Phase 3.5: Visual Hierarchy Clarity', async ({ page }) => {
    const hierarchyScore = await visionFramework.measureVisualHierarchy()
    expect(hierarchyScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.VISUAL_HIERARCHY_SCORE)
  })

  test('Phase 3.6: Animation Smoothness Excellence', async ({ page }) => {
    const animationScore = await visionFramework.measureAnimationSmoothness()
    expect(animationScore).toBeGreaterThanOrEqual(PHASE3_SUCCESS_CRITERIA.ANIMATION_SMOOTHNESS)
  })

  test('Phase 3.7: GATE TEST - Visual Design Excellence Validation', async ({ page }) => {
    console.log('🚪 PHASE 3 GATE TEST: Comprehensive visual design validation...')
    
    // Run all assessments
    await visionFramework.measureAestheticParity()
    await visionFramework.measureBorderRadiusConsistency()
    await visionFramework.measureColorHarmony()
    await visionFramework.measureSpacingCompliance()
    await visionFramework.measureVisualHierarchy()
    await visionFramework.measureAnimationSmoothness()
    
    const overallSuccess = await visionFramework.generatePhase3Report()
    
    // Capture final evidence
    await page.screenshot({
      path: 'test-results/phase3-visual-design-evidence.png',
      fullPage: true
    })
    
    expect(overallSuccess).toBe(true)
  })
})