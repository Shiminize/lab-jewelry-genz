/**
 * Vision Mode E2E: Visual Alignment Analysis
 * Uses Playwright vision capabilities to examine exact positioning
 */

const { chromium } = require('playwright')

async function analyzeVisualAlignment() {
  console.log('👁️ Vision Mode Analysis: Preview Container Bottom Alignment')
  
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to homepage
    console.log('📍 Navigating to homepage...')
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Extended wait for all components
    
    // Set desktop viewport for analysis
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(2000)
    
    // Find the CustomizerPreviewSection
    console.log('🔍 Locating CustomizerPreviewSection...')
    const customizerSection = page.locator('section').filter({ 
      has: page.locator('#customizer-3d-container')
    }).first()
    
    if (await customizerSection.count() === 0) {
      console.log('❌ CustomizerPreviewSection not found')
      return false
    }
    
    // Scroll to the customizer section
    await customizerSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    // Take full section screenshot
    await customizerSection.screenshot({ 
      path: 'customizer-section-analysis.png',
      type: 'png'
    })
    console.log('📸 Section screenshot saved: customizer-section-analysis.png')
    
    // Measure left control panel (text content area)
    console.log('📏 Measuring left control panel dimensions...')
    const leftPanel = customizerSection.locator('div').first() // Left content panel
    const leftPanelBox = await leftPanel.boundingBox()
    
    // Measure right 3D preview container  
    console.log('📏 Measuring right preview container dimensions...')
    const rightPanel = page.locator('#customizer-3d-container')
    const rightPanelBox = await rightPanel.boundingBox()
    
    if (!leftPanelBox || !rightPanelBox) {
      console.log('❌ Could not measure panel dimensions')
      return false
    }
    
    // Calculate alignment metrics
    console.log('\n📊 ALIGNMENT ANALYSIS:')
    console.log(`Left Panel:  Top: ${leftPanelBox.y.toFixed(1)}px, Bottom: ${(leftPanelBox.y + leftPanelBox.height).toFixed(1)}px, Height: ${leftPanelBox.height.toFixed(1)}px`)
    console.log(`Right Panel: Top: ${rightPanelBox.y.toFixed(1)}px, Bottom: ${(rightPanelBox.y + rightPanelBox.height).toFixed(1)}px, Height: ${rightPanelBox.height.toFixed(1)}px`)
    
    const topDifference = Math.abs(leftPanelBox.y - rightPanelBox.y)
    const leftBottom = leftPanelBox.y + leftPanelBox.height
    const rightBottom = rightPanelBox.y + rightPanelBox.height
    const bottomDifference = Math.abs(leftBottom - rightBottom)
    
    console.log(`\n🎯 ALIGNMENT METRICS:`)
    console.log(`Top alignment difference: ${topDifference.toFixed(1)}px`)
    console.log(`Bottom alignment difference: ${bottomDifference.toFixed(1)}px`)
    
    // Visual alignment assessment
    if (topDifference <= 5) {
      console.log('✅ TOP ALIGNMENT: Perfect (≤5px difference)')
    } else if (topDifference <= 20) {
      console.log('⚠️ TOP ALIGNMENT: Good but could be better')
    } else {
      console.log('❌ TOP ALIGNMENT: Poor alignment detected')
    }
    
    if (bottomDifference <= 5) {
      console.log('✅ BOTTOM ALIGNMENT: Perfect (≤5px difference)')
    } else if (bottomDifference <= 50) {
      console.log('⚠️ BOTTOM ALIGNMENT: Misaligned - needs adjustment')
    } else {
      console.log('❌ BOTTOM ALIGNMENT: Significant misalignment detected')
    }
    
    // Provide specific positioning recommendations
    console.log('\n🔧 POSITIONING RECOMMENDATIONS:')
    
    if (rightBottom < leftBottom) {
      const neededHeight = leftBottom - rightPanelBox.y
      console.log(`📐 RIGHT CONTAINER TOO SHORT by ${(leftBottom - rightBottom).toFixed(1)}px`)
      console.log(`📝 SOLUTION: Increase right container height to ${neededHeight.toFixed(1)}px`)
      console.log(`📝 CSS FIX: Add 'min-height: ${neededHeight.toFixed(0)}px' to right container`)
    } else if (rightBottom > leftBottom) {
      console.log(`📐 RIGHT CONTAINER TOO TALL by ${(rightBottom - leftBottom).toFixed(1)}px`)
      console.log(`📝 SOLUTION: Reduce right container height or use flex alignment`)
    } else {
      console.log('✅ Heights are aligned!')
    }
    
    // Highlight the specific elements for visual reference
    await page.addStyleTag({
      content: `
        #customizer-3d-container {
          outline: 3px solid red !important;
          outline-offset: 2px;
        }
        #customizer-3d-container::before {
          content: "RIGHT PANEL";
          position: absolute;
          top: -30px;
          left: 0;
          background: red;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          z-index: 1000;
        }
      `
    })
    
    // Try to highlight left panel (finding the text content container)
    const leftContentContainer = customizerSection.locator('div').filter({ 
      hasText: /Choose Your|Start Designing|Chat with Designer/
    }).first()
    
    if (await leftContentContainer.count() > 0) {
      await page.addStyleTag({
        content: `
          div:has-text("Choose Your") {
            outline: 3px solid blue !important;
            outline-offset: 2px;
          }
        `
      })
    }
    
    // Take annotated screenshot
    await page.screenshot({ 
      path: 'alignment-analysis-annotated.png',
      fullPage: false
    })
    console.log('📸 Annotated screenshot saved: alignment-analysis-annotated.png')
    
    return {
      leftPanelBox,
      rightPanelBox,
      topDifference,
      bottomDifference,
      needsBottomFix: bottomDifference > 5
    }
    
  } catch (error) {
    console.error('❌ Vision analysis failed:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

// Run analysis
analyzeVisualAlignment()
  .then((result) => {
    if (result && result.needsBottomFix) {
      console.log('\n🎯 CONCLUSION: Bottom alignment needs fixing')
      console.log('📋 Next step: Apply the recommended CSS fixes')
    } else if (result) {
      console.log('\n✅ CONCLUSION: Alignment is acceptable')
    }
  })
  .catch((error) => {
    console.error('💥 Analysis error:', error)
  })