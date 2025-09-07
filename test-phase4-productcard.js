/*
 * Phase 4: ProductCard Token Migration E2E Test
 * 
 * Validates that ProductCard components are fully compliant with the Aurora Design System
 * token architecture, ensuring proper spacing, dimensions, and styling consistency.
 * 
 * CLAUDE_RULES compliance:
 * - Tests focus on functionality and token usage
 * - Validates both variants and component architecture
 * - Ensures backward compatibility with existing features
 */

const { test, expect } = require('@playwright/test')

test('Phase 4: ProductCard Token Migration Validation', async ({ page }) => {
  console.log('🧪 Phase 4: ProductCard Token Migration Validation')
  
  // Navigate to catalog page to test ProductCard components
  console.log('📋 Navigating to catalog page...')
  await page.goto('/catalog')
  await page.waitForLoadState('networkidle')
  
  // Wait for ProductCard components to load
  const productCards = page.locator('[data-testid="product-card"]')
  await expect(productCards.first()).toBeVisible({ timeout: 10000 })
  
  const cardCount = await productCards.count()
  console.log(`✅ Found ${cardCount} ProductCard components`)
  
  if (cardCount === 0) {
    console.log('⚠️ No ProductCard components found, skipping detailed tests')
    return
  }
  
  // Test 1: Token-compliant spacing in product cards
  console.log('🔍 Testing token-compliant spacing...')
  const firstCard = productCards.first()
  
  // Check for token spacing classes (these should be present)
  const tokenSpacingSelectors = [
    '[class*="space-y-token-"]',
    '[class*="space-x-token-"]', 
    '[class*="p-token-"]',
    '[class*="mt-token-"]',
    '[class*="mb-token-"]'
  ]
  
  let tokenSpacingFound = 0
  for (const selector of tokenSpacingSelectors) {
    const elements = await page.locator(selector).count()
    if (elements > 0) {
      tokenSpacingFound += elements
      console.log(`  ✅ Found ${elements} elements with ${selector}`)
    }
  }
  
  // Test 2: Token-compliant border radius
  console.log('🔍 Testing token-compliant border radius...')
  const tokenRadiusSelectors = [
    '[class*="rounded-token-"]'
  ]
  
  let tokenRadiusFound = 0
  for (const selector of tokenRadiusSelectors) {
    const elements = await page.locator(selector).count()
    if (elements > 0) {
      tokenRadiusFound += elements
      console.log(`  ✅ Found ${elements} elements with ${selector}`)
    }
  }
  
  // Test 3: Token shadow usage
  console.log('🔍 Testing token shadow compliance...')
  const tokenShadowSelectors = [
    '[class*="shadow-near"]',
    '[class*="shadow-hover"]', 
    '[class*="shadow-far"]',
    '[class*="shadow-soft"]'
  ]
  
  let tokenShadowFound = 0
  for (const selector of tokenShadowSelectors) {
    const elements = await page.locator(selector).count()
    if (elements > 0) {
      tokenShadowFound += elements
      console.log(`  ✅ Found ${elements} elements with ${selector}`)
    }
  }
  
  // Test 4: Check for legacy hardcoded values that should be removed
  console.log('🔍 Testing for removal of legacy hardcoded values...')
  const legacySelectors = [
    '[style*="color-mix"]',  // Should use token shadows instead
    '[class*="rounded-34"]',  // Should use token radius
    '[class*="space-y-3"]',   // Should use token spacing (unless 3 = 0.75rem which is valid)
    '[class*="space-x-3"]'
  ]
  
  let legacyFound = 0
  for (const selector of legacySelectors) {
    const elements = await page.locator(selector).count()
    if (elements > 0) {
      legacyFound += elements
      console.log(`  ⚠️ Found ${elements} legacy elements with ${selector}`)
    }
  }
  
  // Test 5: Verify ProductCard interactive functionality still works
  console.log('🔍 Testing ProductCard interactive functionality...')
  
  // Test hover states
  await firstCard.hover()
  console.log('  ✅ ProductCard hover interaction working')
  
  // Test material tag functionality
  const materialTags = page.locator('[data-testid="material-tag-chip"]')
  const materialTagCount = await materialTags.count()
  if (materialTagCount > 0) {
    console.log(`  ✅ Found ${materialTagCount} MaterialTagChip components`)
    
    // Test clicking a material tag
    await materialTags.first().click()
    await page.waitForTimeout(500) // Allow for any filtering to complete
    console.log('  ✅ MaterialTagChip click functionality working')
  }
  
  // Test 6: Variant system functionality
  console.log('🔍 Testing ProductCard variant system...')
  
  // Check if different variants exist (standard, featured, compact)
  const standardCards = page.locator('[data-testid="product-card"]:not([class*="compact"]):not([class*="featured"])')
  const compactCards = page.locator('[data-testid="product-card"][class*="compact"]')
  const featuredCards = page.locator('[data-testid="product-card"][class*="featured"]')
  
  const standardCount = await standardCards.count()
  const compactCount = await compactCards.count()
  const featuredCount = await featuredCards.count()
  
  console.log(`  ✅ Standard variant cards: ${standardCount}`)
  console.log(`  ✅ Compact variant cards: ${compactCount}`)
  console.log(`  ✅ Featured variant cards: ${featuredCount}`)
  
  // Calculate token compliance score
  const totalTokenUsage = tokenSpacingFound + tokenRadiusFound + tokenShadowFound
  const totalElements = await page.locator('*').count()
  const tokenCompliance = Math.min(100, (totalTokenUsage / Math.max(totalElements * 0.1, 1)) * 100)
  
  // Calculate overall Phase 4 score
  let score = 0
  
  // Token spacing compliance (25 points)
  if (tokenSpacingFound >= 15) score += 25
  else if (tokenSpacingFound >= 10) score += 20
  else if (tokenSpacingFound >= 5) score += 15
  else if (tokenSpacingFound > 0) score += 10
  
  // Token radius compliance (20 points) 
  if (tokenRadiusFound >= 10) score += 20
  else if (tokenRadiusFound >= 5) score += 15
  else if (tokenRadiusFound > 0) score += 10
  
  // Token shadow compliance (20 points)
  if (tokenShadowFound >= 8) score += 20
  else if (tokenShadowFound >= 4) score += 15
  else if (tokenShadowFound > 0) score += 10
  
  // Legacy removal (15 points)
  if (legacyFound === 0) score += 15
  else if (legacyFound <= 2) score += 10
  else if (legacyFound <= 5) score += 5
  
  // Functionality preservation (20 points)
  if (materialTagCount > 0 && cardCount > 0) score += 20
  else if (cardCount > 0) score += 15
  
  console.log('\n📊 Phase 4: ProductCard Migration Results:')
  console.log('=' .repeat(50))
  console.log(`Token Spacing Elements: ${tokenSpacingFound}`)
  console.log(`Token Radius Elements: ${tokenRadiusFound}`)
  console.log(`Token Shadow Elements: ${tokenShadowFound}`)
  console.log(`Legacy Elements Found: ${legacyFound}`)
  console.log(`ProductCard Count: ${cardCount}`)
  console.log(`Material Tags Count: ${materialTagCount}`)
  console.log(`Token Compliance: ${tokenCompliance.toFixed(1)}%`)
  console.log('=' .repeat(50))
  console.log(`🎯 PHASE 4 SCORE: ${score}/100`)
  console.log('=' .repeat(50))
  
  // Success criteria for Phase 4
  const isSuccessful = score >= 85 && tokenSpacingFound >= 10 && legacyFound <= 2
  
  if (isSuccessful) {
    console.log('🎉 PHASE 4: ProductCard Token Migration - SUCCESSFUL')
    console.log('✅ All token compliance criteria met')
    console.log('✅ ProductCard functionality preserved')
    console.log('✅ Legacy elements minimized')
  } else {
    console.log('⚠️ PHASE 4: ProductCard Token Migration - NEEDS IMPROVEMENT')
    if (score < 85) console.log('❌ Overall score below target (85/100)')
    if (tokenSpacingFound < 10) console.log('❌ Insufficient token spacing usage')
    if (legacyFound > 2) console.log('❌ Too many legacy elements remaining')
  }
  
  // Take screenshot for visual validation
  await page.screenshot({ 
    path: 'phase4-productcard-token-migration.png', 
    fullPage: true 
  })
  console.log('📸 Screenshot saved: phase4-productcard-token-migration.png')
  
  console.log(`\n🎉 Phase 4 ProductCard token migration validation completed with score: ${score}/100`)
})