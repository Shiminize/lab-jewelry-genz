/*
 * Phase 4: ProductCard Token Migration Validation
 * Simple Node.js validation script to check token compliance
 */

const { readFileSync } = require('fs')
const path = require('path')

console.log('🧪 Phase 4: ProductCard Token Migration Validation')
console.log('=' .repeat(50))

// Read ProductCard and ProductCardVariants files
const productCardPath = path.join(__dirname, 'src/components/products/ProductCard.tsx')
const productCardVariantsPath = path.join(__dirname, 'src/components/products/ProductCardVariants.tsx')

let productCardContent = ''
let variantsContent = ''

try {
  productCardContent = readFileSync(productCardPath, 'utf8')
  console.log('✅ ProductCard.tsx loaded')
} catch (error) {
  console.log('❌ Failed to load ProductCard.tsx:', error.message)
  process.exit(1)
}

try {
  variantsContent = readFileSync(productCardVariantsPath, 'utf8')
  console.log('✅ ProductCardVariants.tsx loaded')
} catch (error) {
  console.log('❌ Failed to load ProductCardVariants.tsx:', error.message)
  process.exit(1)
}

console.log('\n🔍 Analyzing token compliance...')

// Combined content for analysis
const combinedContent = productCardContent + '\n' + variantsContent

// Test 1: Token spacing usage
const tokenSpacingPatterns = [
  /space-y-token-/g,
  /space-x-token-/g,
  /p-token-/g,
  /px-token-/g,
  /py-token-/g,
  /mt-token-/g,
  /mb-token-/g,
  /ml-token-/g,
  /mr-token-/g
]

let tokenSpacingCount = 0
tokenSpacingPatterns.forEach(pattern => {
  const matches = combinedContent.match(pattern) || []
  tokenSpacingCount += matches.length
  if (matches.length > 0) {
    console.log(`  ✅ Found ${matches.length} ${pattern.source} uses`)
  }
})

// Test 2: Token border radius usage
const tokenRadiusPatterns = [
  /rounded-token-/g
]

let tokenRadiusCount = 0
tokenRadiusPatterns.forEach(pattern => {
  const matches = combinedContent.match(pattern) || []
  tokenRadiusCount += matches.length
  if (matches.length > 0) {
    console.log(`  ✅ Found ${matches.length} ${pattern.source} uses`)
  }
})

// Test 3: Token shadow usage  
const tokenShadowPatterns = [
  /shadow-near/g,
  /shadow-hover/g,
  /shadow-far/g,
  /shadow-soft/g
]

let tokenShadowCount = 0
tokenShadowPatterns.forEach(pattern => {
  const matches = combinedContent.match(pattern) || []
  tokenShadowCount += matches.length
  if (matches.length > 0) {
    console.log(`  ✅ Found ${matches.length} ${pattern.source} uses`)
  }
})

// Test 4: Check for legacy patterns that should be removed
const legacyPatterns = [
  { pattern: /color-mix\(in srgb/g, name: 'color-mix functions (should use token shadows)' },
  { pattern: /rounded-34/g, name: 'rounded-34 (should use token radius)' },
  { pattern: /style=\{[^}]*boxShadow/g, name: 'inline boxShadow styles' },
  { pattern: /w-16|h-16/g, name: 'hardcoded 16 dimensions (should use token-2xl)' },
  { pattern: /space-y-[2-6](?![0-9])/g, name: 'non-token space-y values' },
  { pattern: /space-x-[2-6](?![0-9])/g, name: 'non-token space-x values' },
]

let legacyCount = 0
legacyPatterns.forEach(({ pattern, name }) => {
  const matches = combinedContent.match(pattern) || []
  if (matches.length > 0) {
    legacyCount += matches.length
    console.log(`  ⚠️ Found ${matches.length} ${name}`)
  }
})

// Test 5: Check for proper token imports and dependencies
const hasProperImports = combinedContent.includes('import { cn }') && 
                         combinedContent.includes('variantStyles')

console.log(`  ${hasProperImports ? '✅' : '❌'} Proper imports and dependencies`)

// Calculate score
let score = 0

// Token usage (40 points total)
if (tokenSpacingCount >= 15) score += 20
else if (tokenSpacingCount >= 10) score += 15
else if (tokenSpacingCount >= 5) score += 10
else if (tokenSpacingCount > 0) score += 5

if (tokenRadiusCount >= 10) score += 10
else if (tokenRadiusCount >= 5) score += 8
else if (tokenRadiusCount > 0) score += 5

if (tokenShadowCount >= 5) score += 10
else if (tokenShadowCount >= 3) score += 8
else if (tokenShadowCount > 0) score += 5

// Legacy removal (30 points)
if (legacyCount === 0) score += 30
else if (legacyCount <= 2) score += 25
else if (legacyCount <= 5) score += 20
else if (legacyCount <= 8) score += 15
else if (legacyCount <= 10) score += 10

// Architecture quality (20 points)
if (hasProperImports) score += 10

// Check for component separation (ProductCardVariants extracted)
const hasVariantSeparation = variantsContent.length > 500 // Has substantial content
if (hasVariantSeparation) score += 10

// CLAUDE_RULES compliance (10 points)
const productCardLines = productCardContent.split('\n').length
const variantsLines = variantsContent.split('\n').length

if (productCardLines < 350 && variantsLines < 100) score += 10
else if (productCardLines < 400) score += 5

console.log('\n📊 Phase 4: ProductCard Token Migration Results:')
console.log('=' .repeat(50))
console.log(`Token Spacing Uses: ${tokenSpacingCount}`)
console.log(`Token Radius Uses: ${tokenRadiusCount}`)
console.log(`Token Shadow Uses: ${tokenShadowCount}`)
console.log(`Legacy Patterns Found: ${legacyCount}`)
console.log(`ProductCard Lines: ${productCardLines}`)
console.log(`ProductCardVariants Lines: ${variantsLines}`)
console.log(`Has Proper Architecture: ${hasProperImports && hasVariantSeparation}`)
console.log('=' .repeat(50))
console.log(`🎯 PHASE 4 SCORE: ${score}/100`)
console.log('=' .repeat(50))

// Success criteria 
const isSuccessful = score >= 85 && 
                    tokenSpacingCount >= 10 && 
                    tokenRadiusCount >= 5 &&
                    legacyCount <= 3

if (isSuccessful) {
  console.log('🎉 PHASE 4: ProductCard Token Migration - SUCCESSFUL ✅')
  console.log('✅ Excellent token compliance achieved')
  console.log('✅ Legacy patterns minimized')
  console.log('✅ Architecture properly structured')
} else {
  console.log('⚠️ PHASE 4: ProductCard Token Migration - NEEDS IMPROVEMENT ❌')
  
  if (score < 85) console.log('❌ Overall score below target (85/100)')
  if (tokenSpacingCount < 10) console.log('❌ Need more token spacing usage')
  if (tokenRadiusCount < 5) console.log('❌ Need more token radius usage')  
  if (legacyCount > 3) console.log('❌ Too many legacy patterns remaining')
}

// Provide specific recommendations
console.log('\n💡 Recommendations:')
if (tokenSpacingCount < 15) {
  console.log('- Consider migrating more hardcoded spacing to token utilities')
}
if (tokenRadiusCount < 10) {
  console.log('- Migrate remaining rounded-* classes to rounded-token-* equivalents')
}
if (tokenShadowCount < 5) {
  console.log('- Replace complex shadow styles with token shadow utilities')
}
if (legacyCount > 0) {
  console.log('- Remove remaining legacy patterns for full token compliance')
}

console.log(`\n🎯 Phase 4 ProductCard token migration completed with score: ${score}/100`)
process.exit(isSuccessful ? 0 : 1)