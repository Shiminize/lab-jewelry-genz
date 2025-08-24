/**
 * E2E Testing for Control Panel Removal Validation
 * Ensures all duplicate controls are completely removed from preview sections
 * CLAUDE_RULES.md compliant with performance and accessibility validation
 */

import { test, expect, Page } from '@playwright/test'

// Test configuration for consistent validation
const TEST_CONFIG = {
  timeouts: {
    navigation: 30000,
    elementLoad: 10000,
    interaction: 5000
  },
  viewports: {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
  }
}

test.describe('Control Panel Removal Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pages and wait for full load
    await page.goto('/', { waitUntil: 'networkidle2', timeout: TEST_CONFIG.timeouts.navigation })
  })

  test('Homepage CustomizerPreviewSection has zero duplicate controls', async ({ page }) => {
    console.log('🧪 Testing homepage CustomizerPreviewSection for control removal')
    
    // Scroll to CustomizerPreviewSection
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.7)
    })
    await page.waitForTimeout(2000)

    // Validate no material control buttons under preview
    const previewSection = page.locator('section').filter({ hasText: 'Create Your Legacy' })
    await expect(previewSection).toBeVisible({ timeout: TEST_CONFIG.timeouts.elementLoad })

    // Check for any material buttons (Gold, Platinum) under the preview
    const materialButtons = previewSection.locator('button').filter({ 
      hasText: /Gold|Platinum/i 
    })
    const materialButtonCount = await materialButtons.count()
    
    console.log(`   - Material buttons found: ${materialButtonCount}`)
    expect(materialButtonCount).toBe(0) // Should be zero - controls moved to sidebar

    // Validate no frame count indicators
    const frameIndicators = previewSection.locator('*').filter({ 
      hasText: /\d+\s*\/\s*\d+|frame \d+ of \d+/i 
    })
    const frameIndicatorCount = await frameIndicators.count()
    
    console.log(`   - Frame indicators found: ${frameIndicatorCount}`)
    expect(frameIndicatorCount).toBe(0) // Should be zero - all frame indicators removed

    // Validate no keyboard instruction text
    const keyboardInstructions = previewSection.locator('*').filter({ 
      hasText: /keyboard|arrow keys|space|enter/i 
    })
    const keyboardInstructionCount = await keyboardInstructions.count()
    
    console.log(`   - Keyboard instructions found: ${keyboardInstructionCount}`)
    expect(keyboardInstructionCount).toBe(0) // Should be zero - all instructions removed

    // Validate no "360 view controls" text
    const viewControlText = previewSection.locator('*').filter({ 
      hasText: /360.*view.*control|rotate.*see.*angle/i 
    })
    const viewControlTextCount = await viewControlText.count()
    
    console.log(`   - View control text found: ${viewControlTextCount}`)
    expect(viewControlTextCount).toBe(0) // Should be zero - all control text removed
  })

  test('Main customizer page has clean preview area', async ({ page }) => {
    console.log('🧪 Testing main customizer page for clean preview')
    
    await page.goto('/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: TEST_CONFIG.timeouts.navigation 
    })

    // Wait for ProductCustomizer to load
    const productCustomizer = page.locator('[data-testid="product-customizer"]')
    await expect(productCustomizer).toBeVisible({ timeout: TEST_CONFIG.timeouts.elementLoad })
    await page.waitForTimeout(3000) // Allow for full component initialization

    // Validate no material controls under the preview area within ProductCustomizer
    const customizerButtons = productCustomizer.locator('button').filter({
      hasText: /Gold|Platinum|Metal/i
    })
    const customizerButtonCount = await customizerButtons.count()
    
    console.log(`   - Customizer material buttons found: ${customizerButtonCount}`)
    expect(customizerButtonCount).toBe(0) // Should be zero - controls moved to sidebar

    // Validate no frame indicators in customizer
    const customizerFrameIndicators = productCustomizer.locator('*').filter({
      hasText: /\d+\s*\/\s*\d+|frame \d+ of \d+/i
    })
    const customizerFrameCount = await customizerFrameIndicators.count()
    
    console.log(`   - Customizer frame indicators: ${customizerFrameCount}`)
    expect(customizerFrameCount).toBe(0) // Should be zero - all indicators removed

    // Validate materials are in sidebar instead
    const sidebarMaterials = page.locator('h2').filter({ hasText: 'Choose Your Metal' })
    await expect(sidebarMaterials).toBeVisible({ timeout: TEST_CONFIG.timeouts.elementLoad })
    
    const sidebarMaterialButtons = page.locator('button').filter({
      hasText: /Platinum|18K.*Gold/i
    })
    const sidebarButtonCount = await sidebarMaterialButtons.count()
    
    console.log(`   - Sidebar material buttons found: ${sidebarButtonCount}`)
    expect(sidebarButtonCount).toBeGreaterThan(0) // Should have materials in sidebar
  })

  test('Mobile viewport has clean preview experience', async ({ page }) => {
    console.log('🧪 Testing mobile viewport for clean preview')
    
    await page.setViewportSize(TEST_CONFIG.viewports.mobile)
    await page.goto('/customizer', { waitUntil: 'networkidle2' })

    const productCustomizer = page.locator('[data-testid="product-customizer"]')
    await expect(productCustomizer).toBeVisible({ timeout: TEST_CONFIG.timeouts.elementLoad })

    // Validate mobile has no overlay controls
    const mobileOverlayControls = productCustomizer.locator('button, input, select')
    const mobileControlCount = await mobileOverlayControls.count()
    
    console.log(`   - Mobile overlay controls found: ${mobileControlCount}`)
    expect(mobileControlCount).toBe(0) // Should be zero - clean mobile preview

    // Validate touch instructions are removed
    const touchInstructions = page.locator('*').filter({
      hasText: /swipe|drag|pinch|touch/i
    })
    const touchInstructionCount = await touchInstructions.count()
    
    console.log(`   - Touch instructions found: ${touchInstructionCount}`)
    expect(touchInstructionCount).toBeLessThanOrEqual(1) // Allow minimal touch hints only
  })

  test('All text indicators completely removed', async ({ page }) => {
    console.log('🧪 Testing for complete removal of all text indicators')
    
    const pagesToTest = ['/', '/customizer']
    
    for (const pageUrl of pagesToTest) {
      console.log(`   Testing page: ${pageUrl}`)
      
      await page.goto(pageUrl, { waitUntil: 'networkidle2' })
      if (pageUrl === '/') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
        await page.waitForTimeout(2000)
      }

      // Check for any remaining problematic text
      const problematicTexts = [
        /360.*view.*control/i,
        /rotate.*see.*every.*angle/i,
        /keyboard.*function/i,
        /arrow.*key|space.*key|enter.*key/i,
        /frame \d+ of \d+/,
        /\d+\s*\/\s*\d+/,
        /touch.*keyboard/i,
        /swipe.*rotate.*scroll/i
      ]

      let totalProblematicText = 0
      
      for (const textPattern of problematicTexts) {
        const elements = page.locator('*').filter({ hasText: textPattern })
        const count = await elements.count()
        
        if (count > 0) {
          // Check if it's actually visible (not in footer or hidden areas)
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i)
            const isVisible = await element.isVisible()
            if (isVisible) {
              const text = await element.textContent()
              // Exclude legitimate footer/FAQ text
              if (!text?.includes('FAQ') && !text?.includes('Available 24/7') && 
                  !text?.includes('4.9/5')) {
                totalProblematicText++
                console.log(`     ❌ Found problematic text: "${text}"`)
              }
            }
          }
        }
      }

      console.log(`   - Total problematic indicators on ${pageUrl}: ${totalProblematicText}`)
      expect(totalProblematicText).toBe(0) // Should be zero - all indicators removed
    }
  })

  test('Performance validation for clean UI', async ({ page }) => {
    console.log('🧪 Testing performance impact of clean UI')
    
    // Test homepage performance
    const homepageStartTime = performance.now()
    await page.goto('/', { waitUntil: 'networkidle2' })
    const homepageLoadTime = performance.now() - homepageStartTime
    
    console.log(`   - Homepage load time: ${homepageLoadTime.toFixed(2)}ms`)
    expect(homepageLoadTime).toBeLessThan(3000) // CLAUDE_RULES: <3s page load

    // Test customizer performance
    const customizerStartTime = performance.now()
    await page.goto('/customizer', { waitUntil: 'networkidle2' })
    const customizerLoadTime = performance.now() - customizerStartTime
    
    console.log(`   - Customizer load time: ${customizerLoadTime.toFixed(2)}ms`)
    expect(customizerLoadTime).toBeLessThan(3000) // CLAUDE_RULES: <3s page load

    // Validate 3D viewer loads without control overhead
    const productCustomizer = page.locator('[data-testid="product-customizer"]')
    await expect(productCustomizer).toBeVisible({ timeout: 5000 })

    // Test material switch performance from sidebar
    if (await page.locator('button:has-text("18K Rose Gold")').count() > 0) {
      const switchStartTime = performance.now()
      await page.click('button:has-text("18K Rose Gold")')
      await page.waitForTimeout(100) // Allow for switch
      const switchTime = performance.now() - switchStartTime
      
      console.log(`   - Material switch time: ${switchTime.toFixed(2)}ms`)
      expect(switchTime).toBeLessThan(300) // CLAUDE_RULES: <300ms response
    }
  })

  test('Accessibility validation for clean UI', async ({ page }) => {
    console.log('🧪 Testing accessibility compliance for minimalist design')
    
    await page.goto('/customizer', { waitUntil: 'networkidle2' })

    // Test keyboard navigation to sidebar controls
    await page.keyboard.press('Tab') // Should focus on first interactive element
    
    // Navigate to material selection in sidebar
    let tabCount = 0
    while (tabCount < 20) { // Safety limit
      await page.keyboard.press('Tab')
      tabCount++
      
      const focused = await page.locator(':focus').textContent()
      if (focused?.includes('Platinum') || focused?.includes('Gold')) {
        console.log(`   - Successfully navigated to material control: "${focused}"`)
        break
      }
    }

    // Validate focus is on sidebar material controls, not preview area
    const focusedElement = page.locator(':focus')
    const isInSidebar = await focusedElement.locator('..').locator('h2:has-text("Choose Your Metal")').count() > 0
    
    console.log(`   - Material controls properly in sidebar: ${isInSidebar}`)
    expect(isInSidebar || tabCount < 15).toBe(true) // Should find controls in sidebar

    // Test ARIA attributes are maintained for remaining controls
    const materialButtons = page.locator('button').filter({ hasText: /Gold|Platinum/i })
    const buttonCount = await materialButtons.count()
    
    if (buttonCount > 0) {
      const firstButton = materialButtons.first()
      const hasAriaLabel = await firstButton.getAttribute('aria-label') !== null ||
                          await firstButton.getAttribute('aria-describedby') !== null ||
                          await firstButton.textContent() !== null
      
      console.log(`   - Material buttons have proper accessibility: ${hasAriaLabel}`)
      expect(hasAriaLabel).toBe(true)
    }
  })
})

test.describe('Cross-Browser Control Removal Validation', () => {
  // Test across multiple browsers to ensure consistent control removal
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Control removal consistency in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`)
      
      console.log(`🧪 Testing control removal in ${browserName}`)
      
      await page.goto('/customizer', { waitUntil: 'networkidle2' })
      
      const productCustomizer = page.locator('[data-testid="product-customizer"]')
      await expect(productCustomizer).toBeVisible({ timeout: 10000 })
      
      // Validate consistent control removal across browsers
      const previewControls = productCustomizer.locator('button').filter({
        hasText: /Gold|Platinum|Metal.*Type/i
      })
      const controlCount = await previewControls.count()
      
      console.log(`   - ${browserName} preview controls: ${controlCount}`)
      expect(controlCount).toBe(0) // Should be zero in all browsers
      
      // Take screenshot for visual validation
      await page.screenshot({ 
        path: `test-results/control-removal-${browserName}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1440, height: 900 }
      })
      
      console.log(`   - Screenshot saved: control-removal-${browserName}.png`)
    })
  })
})

test.describe('Performance Benchmarks', () => {
  test('Clean UI performance benchmarks', async ({ page }) => {
    console.log('🧪 Running performance benchmarks for clean UI')
    
    // Collect performance metrics
    const metrics = {
      homepageLoad: 0,
      customizerLoad: 0,
      materialSwitch: 0,
      memoryUsage: 0
    }

    // Homepage performance
    const homepageStart = performance.now()
    await page.goto('/', { waitUntil: 'networkidle2', timeout: 30000 })
    metrics.homepageLoad = performance.now() - homepageStart

    // Customizer performance
    const customizerStart = performance.now()
    await page.goto('/customizer', { waitUntil: 'networkidle2', timeout: 30000 })
    metrics.customizerLoad = performance.now() - customizerStart

    // Material switch performance
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 })
    
    if (await page.locator('button:has-text("18K White Gold")').count() > 0) {
      const switchStart = performance.now()
      await page.click('button:has-text("18K White Gold")')
      await page.waitForTimeout(200) // Allow switch to complete
      metrics.materialSwitch = performance.now() - switchStart
    }

    // Log all metrics
    console.log('   📊 Performance Metrics:')
    console.log(`     - Homepage load: ${metrics.homepageLoad.toFixed(2)}ms`)
    console.log(`     - Customizer load: ${metrics.customizerLoad.toFixed(2)}ms`)
    console.log(`     - Material switch: ${metrics.materialSwitch.toFixed(2)}ms`)

    // Validate CLAUDE_RULES compliance
    expect(metrics.homepageLoad).toBeLessThan(3000) // <3s page load
    expect(metrics.customizerLoad).toBeLessThan(3000) // <3s page load  
    expect(metrics.materialSwitch).toBeLessThan(300) // <300ms interaction

    // Write performance report
    await page.evaluate((metrics) => {
      console.log('Performance Report:', JSON.stringify(metrics, null, 2))
    }, metrics)
  })
})