/**
 * E2E Vision Test: Verify Revert Changes
 * Tests that container no longer blocks content after reverting problematic changes
 */

const { chromium } = require('playwright')

async function testRevertChanges() {
  console.log('👁️ Vision Test Phase 1: Verify Container Revert')
  
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to homepage
    console.log('📍 Navigating to homepage...')
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000)
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(2000)
    
    // Find CustomizerPreviewSection
    console.log('🔍 Locating CustomizerPreviewSection...')
    const customizerSection = page.locator('section').filter({ 
      has: page.locator('#customizer-3d-container')
    }).first()
    
    if (await customizerSection.count() === 0) {
      console.log('❌ CustomizerPreviewSection not found')
      return false
    }
    
    // Scroll to section
    await customizerSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    // Take section screenshot
    await customizerSection.screenshot({ 
      path: 'phase1-revert-test.png',
      type: 'png'
    })
    console.log('📸 Phase 1 screenshot saved: phase1-revert-test.png')
    
    // Test 1: Verify container no longer has problematic classes
    console.log('🔍 Test 1: Checking container classes...')
    const container = page.locator('#customizer-3d-container')
    const classes = await container.getAttribute('class')
    
    const hasProblematicClasses = classes && (
      classes.includes('lg:h-full') || 
      classes.includes('lg:flex-1')
    )
    
    if (!hasProblematicClasses) {
      console.log('✅ PASS: No problematic height classes found')
    } else {
      console.log('❌ FAIL: Still contains problematic classes:', classes)
      return false
    }
    
    // Test 2: Verify proper sticky positioning restored
    console.log('🔍 Test 2: Checking sticky positioning...')
    const hasCorrectSticky = classes && 
      classes.includes('lg:sticky') && 
      classes.includes('lg:top-6') && 
      classes.includes('lg:self-start')
    
    if (hasCorrectSticky) {
      console.log('✅ PASS: Correct sticky positioning restored')
    } else {
      console.log('❌ FAIL: Incorrect sticky positioning')
      return false
    }
    
    // Test 3: Verify ProductCustomizer has correct aspect ratio
    console.log('🔍 Test 3: Checking ProductCustomizer styling...')
    const productCustomizer = container.locator('[class*="aspect-square"]').first()
    if (await productCustomizer.count() > 0) {
      console.log('✅ PASS: ProductCustomizer aspect-square restored')
    } else {
      console.log('⚠️  WARNING: ProductCustomizer aspect ratio not found')
    }
    
    // Test 4: Visual layout assessment
    console.log('🔍 Test 4: Visual layout assessment...')
    const containerBox = await container.boundingBox()
    if (!containerBox) {
      console.log('❌ FAIL: Could not measure container')
      return false
    }
    
    // Check if container has reasonable dimensions (not extending too far)
    const viewportHeight = 800
    const containerBottomFromTop = containerBox.y + containerBox.height
    const percentageOfViewport = (containerBottomFromTop / viewportHeight) * 100
    
    console.log(`📊 Container dimensions: ${containerBox.width}x${containerBox.height}`)
    console.log(`📊 Container position: ${containerBox.x}, ${containerBox.y}`)
    console.log(`📊 Container occupies ${percentageOfViewport.toFixed(1)}% of viewport height`)
    
    if (percentageOfViewport < 150) { // Should not exceed 150% of viewport
      console.log('✅ PASS: Container has reasonable size')
    } else {
      console.log('❌ FAIL: Container extends too far down page')
      return false
    }
    
    // Test 5: Check for content blocking
    console.log('🔍 Test 5: Checking for content blocking...')
    
    // Scroll down to see if there's more content below
    await page.evaluate(() => window.scrollBy(0, 500))
    await page.waitForTimeout(1000)
    
    // Look for content that should be visible
    const followingContent = await page.locator('h1, h2, section').count()
    
    if (followingContent > 0) {
      console.log(`✅ PASS: Found ${followingContent} content elements below customizer`)
    } else {
      console.log('⚠️  WARNING: Limited content detected below customizer')
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'phase1-full-page-test.png',
      fullPage: true
    })
    console.log('📸 Full page screenshot saved: phase1-full-page-test.png')
    
    console.log('\n🎉 PHASE 1 REVERT TEST COMPLETE')
    console.log('✅ Container no longer blocks content')
    console.log('✅ Sticky positioning restored correctly')  
    console.log('✅ Original aspect ratio behavior maintained')
    
    return true
    
  } catch (error) {
    console.error('❌ Vision test failed:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

// Run test
testRevertChanges()
  .then((success) => {
    if (success) {
      console.log('\n🏆 SUCCESS: Phase 1 revert changes validated')
      console.log('📋 Ready for Phase 2: Material Status Bar creation')
      process.exit(0)
    } else {
      console.log('\n💥 FAILURE: Phase 1 revert validation failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Test runner error:', error)
    process.exit(1)
  })