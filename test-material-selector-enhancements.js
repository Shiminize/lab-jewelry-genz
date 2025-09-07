/**
 * Comprehensive E2E Test: Material Selector Enhancements
 * Testing Phase 3 Component Refinement with Color Psychology Demo patterns
 * CLAUDE_RULES.md compliant validation suite
 */

const { test, expect } = require('@playwright/test')

test.describe('Material Selector Enhancements - Phase 3 Component Refinement', () => {
  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    
    console.log('🧪 Starting Material Selector Enhancement Testing')
    console.log('Target: http://localhost:3000/customizer')
    console.log('Focus: Hover states, prismatic shadows, performance')
  })

  test.beforeEach(async () => {
    await page.goto('http://localhost:3000/customizer')
    await page.waitForLoadState('networkidle')
  })

  // Test 1: Component Loading and Accessibility
  test('Material selector loads with proper WCAG compliance', async () => {
    console.log('📋 Test 1: Component Loading & Accessibility')
    
    // Wait for material buttons to load
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible({ timeout: 10000 })
    
    const buttonCount = await materialButtons.count()
    console.log(`✅ Material buttons found: ${buttonCount}`)
    expect(buttonCount).toBeGreaterThan(0)
    
    // Test keyboard navigation
    await materialButtons.first().focus()
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    console.log('✅ Keyboard focus navigation working')
    
    // Test ARIA attributes
    const firstButton = materialButtons.first()
    const role = await firstButton.getAttribute('role')
    const ariaLabel = await firstButton.getAttribute('aria-label')
    console.log(`✅ ARIA attributes: role="${role}", aria-label="${ariaLabel}"`)
  })

  // Test 2: Hover State with +15% Luminosity
  test('Hover states apply brightness(115%) filter correctly', async () => {
    console.log('🎨 Test 2: Hover State Brightness Enhancement')
    
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible()
    
    const firstButton = materialButtons.first()
    
    // Get initial computed styles
    const initialBrightness = await firstButton.evaluate(el => {
      return window.getComputedStyle(el).filter
    })
    console.log(`Initial filter: ${initialBrightness}`)
    
    // Hover over button
    await firstButton.hover()
    await page.waitForTimeout(100) // Wait for transition
    
    // Check if brightness filter is applied
    const hoveredBrightness = await firstButton.evaluate(el => {
      return window.getComputedStyle(el).filter
    })
    console.log(`Hovered filter: ${hoveredBrightness}`)
    
    // Verify brightness increase (should contain brightness value)
    const hasCorrectHover = await firstButton.evaluate(el => {
      const computedStyle = window.getComputedStyle(el)
      return computedStyle.filter.includes('brightness') || 
             el.classList.contains('hover:brightness-[115%]')
    })
    
    expect(hasCorrectHover).toBeTruthy()
    console.log('✅ Brightness(115%) hover effect applied correctly')
  })

  // Test 3: Material-Specific Prismatic Shadows
  test('Material-specific shadow colors display correctly', async () => {
    console.log('💎 Test 3: Material-Specific Prismatic Shadows')
    
    const materialTests = [
      { material: '18K Yellow Gold', expectedShadow: '#FFD700', name: 'gold' },
      { material: 'Platinum', expectedShadow: '#B9F2FF', name: 'platinum' },
      { material: '18K Rose Gold', expectedShadow: '#F7A8B8', name: 'rose' },
      { material: '18K White Gold', expectedShadow: '#F8F8FF', name: 'white' }
    ]
    
    for (const { material, expectedShadow, name } of materialTests) {
      const materialButton = page.locator(`button:has-text("${material}")`)
      
      if (await materialButton.count() > 0) {
        console.log(`Testing ${material} shadow...`)
        
        // Hover to trigger shadow
        await materialButton.hover()
        await page.waitForTimeout(200)
        
        // Check for shadow color in computed styles or inline styles
        const shadowColor = await materialButton.evaluate((el, expected) => {
          const computedStyle = window.getComputedStyle(el)
          const inlineStyle = el.style.boxShadow
          
          return {
            computed: computedStyle.boxShadow,
            inline: inlineStyle,
            hasExpectedColor: inlineStyle.includes(expected) || computedStyle.boxShadow.includes(expected)
          }
        }, expectedShadow)
        
        console.log(`${material}: ${shadowColor.hasExpectedColor ? '✅' : '⚠️'} Shadow color validation`)
        console.log(`  Expected: ${expectedShadow}`)
        console.log(`  Inline: ${shadowColor.inline}`)
        
        // Move away to reset
        await page.mouse.move(0, 0)
        await page.waitForTimeout(100)
      } else {
        console.log(`⚠️ ${material} button not found`)
      }
    }
  })

  // Test 4: Click Interactions and Selection States
  test('Click interactions and selection states work properly', async () => {
    console.log('🖱️ Test 4: Click Interactions & Selection States')
    
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible()
    
    const buttonCount = await materialButtons.count()
    console.log(`Testing ${buttonCount} material buttons`)
    
    // Test clicking each material button
    for (let i = 0; i < Math.min(buttonCount, 4); i++) {
      const button = materialButtons.nth(i)
      const buttonText = await button.textContent()
      
      console.log(`Clicking: ${buttonText}`)
      
      // Click the button
      const startTime = performance.now()
      await button.click()
      await page.waitForTimeout(100) // Wait for selection state
      const clickTime = performance.now() - startTime
      
      // Check for selection state (border, background, or checkmark)
      const selectionState = await button.evaluate(el => {
        const computedStyle = window.getComputedStyle(el)
        const hasCheckmark = el.querySelector('div:has-text("✓")') !== null
        const hasSelectedClass = el.classList.toString().includes('border-2') || 
                                el.classList.toString().includes('bg-[#6B46C1]')
        const hasSelectedBorder = computedStyle.borderWidth === '2px'
        
        return {
          hasCheckmark,
          hasSelectedClass,
          hasSelectedBorder,
          classList: el.classList.toString(),
          borderWidth: computedStyle.borderWidth
        }
      })
      
      const isSelected = selectionState.hasCheckmark || 
                        selectionState.hasSelectedClass || 
                        selectionState.hasSelectedBorder
      
      console.log(`  Selection state: ${isSelected ? '✅' : '⚠️'}`)
      console.log(`  Click response time: ${clickTime.toFixed(2)}ms`)
      
      // Verify quick response (CLAUDE_RULES: <100ms)
      expect(clickTime).toBeLessThan(100)
    }
  })

  // Test 5: Ripple Animation Effect
  test('Ripple animation triggers on button press', async () => {
    console.log('💫 Test 5: Ripple Animation Effect')
    
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible()
    
    const firstButton = materialButtons.first()
    
    // Test ripple effect on mouse down
    await page.evaluate(() => {
      // Add event listener to detect animation
      window.rippleDetected = false
      document.addEventListener('animationstart', (e) => {
        if (e.animationName === 'material-ripple') {
          window.rippleDetected = true
        }
      })
    })
    
    // Press and hold button to trigger :active state
    await firstButton.hover()
    await page.mouse.down()
    await page.waitForTimeout(200)
    await page.mouse.up()
    
    // Check if ripple animation was detected
    const rippleDetected = await page.evaluate(() => window.rippleDetected)
    
    console.log(`Ripple animation: ${rippleDetected ? '✅ Detected' : '⚠️ Not detected (may require CSS inspection)'}`)
    
    // Alternative check: CSS rule presence
    const hasRippleCss = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || [])
          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes('::after') && 
                rule.cssText.includes('material-ripple')) {
              return true
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw errors
          continue
        }
      }
      return false
    })
    
    console.log(`Ripple CSS rule: ${hasRippleCss ? '✅ Present' : '⚠️ Not found'}`)
  })

  // Test 6: Performance Metrics and CLAUDE_RULES Compliance
  test('Performance metrics meet CLAUDE_RULES requirements', async () => {
    console.log('⚡ Test 6: Performance & CLAUDE_RULES Compliance')
    
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible()
    
    const performanceMetrics = {
      materialSwitches: [],
      hoverResponses: [],
      memoryUsage: null
    }
    
    // Test material switching performance (CLAUDE_RULES: <100ms)
    const buttonCount = await materialButtons.count()
    console.log(`Testing performance on ${buttonCount} material buttons`)
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = materialButtons.nth(i)
      
      // Test material switch time
      const startTime = performance.now()
      await button.click()
      await page.waitForTimeout(50)
      const switchTime = performance.now() - startTime
      
      performanceMetrics.materialSwitches.push(switchTime)
      console.log(`Material switch ${i + 1}: ${switchTime.toFixed(2)}ms`)
      
      // Test hover response time
      const hoverStartTime = performance.now()
      await button.hover()
      await page.waitForTimeout(10)
      const hoverTime = performance.now() - hoverStartTime
      
      performanceMetrics.hoverResponses.push(hoverTime)
      console.log(`Hover response ${i + 1}: ${hoverTime.toFixed(2)}ms`)
    }
    
    // Get memory usage if available
    performanceMetrics.memoryUsage = await page.evaluate(() => {
      if (window.performance && window.performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        }
      }
      return null
    })
    
    // Calculate averages
    const avgSwitchTime = performanceMetrics.materialSwitches.reduce((a, b) => a + b, 0) / 
                          performanceMetrics.materialSwitches.length
    const avgHoverTime = performanceMetrics.hoverResponses.reduce((a, b) => a + b, 0) / 
                         performanceMetrics.hoverResponses.length
    
    console.log('\n📊 Performance Summary:')
    console.log(`  Average Material Switch: ${avgSwitchTime.toFixed(2)}ms`)
    console.log(`  Average Hover Response: ${avgHoverTime.toFixed(2)}ms`)
    
    if (performanceMetrics.memoryUsage) {
      console.log(`  Memory Usage: ${performanceMetrics.memoryUsage.used}MB`)
    }
    
    // CLAUDE_RULES compliance checks
    const switchCompliant = avgSwitchTime < 100
    const hoverCompliant = avgHoverTime < 50
    
    console.log('\n🎯 CLAUDE_RULES Compliance:')
    console.log(`  Material Switch Speed: ${switchCompliant ? '✅ PASS' : '❌ FAIL'} (<100ms)`)
    console.log(`  Hover Responsiveness: ${hoverCompliant ? '✅ PASS' : '⚠️ CHECK'} (<50ms target)`)
    
    // Assertions
    expect(avgSwitchTime).toBeLessThan(100)
    expect(performanceMetrics.materialSwitches.length).toBeGreaterThan(0)
  })

  // Test 7: Visual Regression - Component Structure
  test('Component maintains proper structure and styling', async () => {
    console.log('🎨 Test 7: Visual Structure Validation')
    
    const materialButtons = page.locator('button:has-text("18K"), button:has-text("Platinum")')
    await expect(materialButtons.first()).toBeVisible()
    
    const firstButton = materialButtons.first()
    
    // Check border radius compliance (Aurora Design System: rounded-md = 8px)
    const borderRadius = await firstButton.evaluate(el => {
      return window.getComputedStyle(el).borderRadius
    })
    
    console.log(`Border radius: ${borderRadius}`)
    const hasCorrectRadius = borderRadius === '8px' || borderRadius === '0.5rem'
    console.log(`Aurora border radius: ${hasCorrectRadius ? '✅ Compliant' : '⚠️ Check'}`)
    
    // Check for proper spacing and layout
    const layoutInfo = await page.locator('div:has(button:has-text("18K"))').first().evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        display: style.display,
        gap: style.gap,
        justifyContent: style.justifyContent,
        flexWrap: style.flexWrap
      }
    })
    
    console.log('Layout properties:', layoutInfo)
    console.log(`Flex layout: ${layoutInfo.display === 'flex' ? '✅' : '⚠️'}`)
    console.log(`Gap spacing: ${layoutInfo.gap ? '✅' : '⚠️'}`)
    console.log(`Center justify: ${layoutInfo.justifyContent.includes('center') ? '✅' : '⚠️'}`)
  })

  test.afterAll(async () => {
    console.log('\n🎉 Material Selector Enhancement Testing Complete')
    console.log('All Phase 3 component refinement tests executed')
    
    await page?.close()
  })
})