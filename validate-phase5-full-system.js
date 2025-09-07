/*
 * Phase 5: Full System Token Validation
 * 
 * Comprehensive validation of token usage across the entire codebase,
 * ensuring Aurora Design System compliance and identifying areas for improvement.
 * 
 * CLAUDE_RULES compliance:
 * - System-wide analysis without redundant processing
 * - Focuses on actionable metrics and recommendations
 * - Maintains performance with efficient file processing
 */

const { readdirSync, statSync, readFileSync } = require('fs')
const path = require('path')

console.log('🌟 Phase 5: Full System Token Validation')
console.log('=' .repeat(60))

// Configuration
const srcDir = path.join(__dirname, 'src')
const excludeDirs = ['node_modules', '.git', '.next', 'build', 'dist', 'coverage']
const includeExtensions = ['.tsx', '.ts', '.jsx', '.js']

// Token patterns to search for
const tokenPatterns = {
  spacing: {
    patterns: [
      /space-[xy]-token-/g,
      /p[xy]?-token-/g,
      /m[trbl]?-token-/g,
      /gap-token-/g
    ],
    name: 'Spacing Tokens'
  },
  colors: {
    patterns: [
      /text-neutral-/g,
      /bg-neutral-/g,
      /text-brand-/g,
      /bg-brand-/g,
      /text-material-/g,
      /bg-material-/g,
      /border-neutral-/g,
      /bg-gradient-/g
    ],
    name: 'Color Tokens'
  },
  radius: {
    patterns: [
      /rounded-token-/g
    ],
    name: 'Border Radius Tokens'
  },
  shadows: {
    patterns: [
      /shadow-near/g,
      /shadow-hover/g,
      /shadow-far/g,
      /shadow-soft/g
    ],
    name: 'Shadow Tokens'
  },
  typography: {
    patterns: [
      /text-token-/g,
      /font-token-/g,
      /leading-token-/g
    ],
    name: 'Typography Tokens'
  }
}

// Legacy patterns that should be migrated
const legacyPatterns = {
  hardcodedSpacing: {
    patterns: [
      /space-[xy]-[2-9](?![0-9])/g,
      /p-[2-9](?![0-9])/g,
      /m[trbl]?-[2-9](?![0-9])/g
    ],
    name: 'Hardcoded Spacing (should use tokens)'
  },
  hardcodedColors: {
    patterns: [
      /#[0-9A-Fa-f]{6}/g,
      /rgb\(/g,
      /rgba\(/g
    ],
    name: 'Hardcoded Colors (should use tokens)'
  },
  customShadows: {
    patterns: [
      /color-mix\(in srgb/g,
      /style=\{[^}]*boxShadow/g
    ],
    name: 'Custom Shadows (should use token shadows)'
  },
  legacyRadius: {
    patterns: [
      /rounded-[2-9][0-9]?(?![a-z])/g
    ],
    name: 'Legacy Radius Values'
  }
}

// Recursively get all files
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      const dirname = path.basename(filePath)
      if (!excludeDirs.includes(dirname)) {
        getAllFiles(filePath, fileList)
      }
    } else {
      const ext = path.extname(file)
      if (includeExtensions.includes(ext)) {
        fileList.push(filePath)
      }
    }
  })
  
  return fileList
}

// Analyze a single file
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const relativePath = path.relative(__dirname, filePath)
  
  const analysis = {
    path: relativePath,
    lines: content.split('\n').length,
    tokens: {},
    legacy: {},
    score: 0
  }
  
  // Count token usage
  Object.entries(tokenPatterns).forEach(([category, { patterns, name }]) => {
    let count = 0
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      count += matches.length
    })
    analysis.tokens[category] = count
  })
  
  // Count legacy patterns  
  Object.entries(legacyPatterns).forEach(([category, { patterns, name }]) => {
    let count = 0
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      count += matches.length
    })
    analysis.legacy[category] = count
  })
  
  // Calculate file score (0-100)
  const totalTokens = Object.values(analysis.tokens).reduce((sum, count) => sum + count, 0)
  const totalLegacy = Object.values(analysis.legacy).reduce((sum, count) => sum + count, 0)
  
  // Score based on token/legacy ratio
  if (totalTokens + totalLegacy > 0) {
    analysis.score = Math.round((totalTokens / (totalTokens + totalLegacy)) * 100)
  } else {
    analysis.score = 100 // No styling = perfect score
  }
  
  return analysis
}

// Main analysis
console.log('📂 Scanning codebase for components...')
const allFiles = getAllFiles(srcDir)
console.log(`✅ Found ${allFiles.length} component files`)

console.log('\n🔍 Analyzing token compliance...')
const results = []
const categoryTotals = {
  tokens: Object.fromEntries(Object.keys(tokenPatterns).map(k => [k, 0])),
  legacy: Object.fromEntries(Object.keys(legacyPatterns).map(k => [k, 0]))
}

let processedFiles = 0
allFiles.forEach(filePath => {
  const analysis = analyzeFile(filePath)
  results.push(analysis)
  
  // Accumulate totals
  Object.entries(analysis.tokens).forEach(([category, count]) => {
    categoryTotals.tokens[category] += count
  })
  
  Object.entries(analysis.legacy).forEach(([category, count]) => {
    categoryTotals.legacy[category] += count
  })
  
  processedFiles++
  if (processedFiles % 20 === 0) {
    console.log(`  📊 Processed ${processedFiles}/${allFiles.length} files...`)
  }
})

console.log(`✅ Analysis complete! Processed ${processedFiles} files`)

// Sort results by score (lowest first to highlight issues)
results.sort((a, b) => a.score - b.score)

// Calculate overall system metrics
const totalTokenUsage = Object.values(categoryTotals.tokens).reduce((sum, count) => sum + count, 0)
const totalLegacyUsage = Object.values(categoryTotals.legacy).reduce((sum, count) => sum + count, 0)
const overallTokenRatio = totalTokenUsage / (totalTokenUsage + totalLegacyUsage + 1) * 100

// Identify top issues and successes
const lowScoreFiles = results.filter(r => r.score < 70)
const highScoreFiles = results.filter(r => r.score >= 90)
const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length

console.log('\n📊 Phase 5: Full System Token Compliance Report')
console.log('=' .repeat(60))
console.log(`Total Files Analyzed: ${results.length}`)
console.log(`Average Token Compliance Score: ${averageScore.toFixed(1)}%`)
console.log(`Overall Token Usage Ratio: ${overallTokenRatio.toFixed(1)}%`)
console.log('')

console.log('🎯 Token Usage Summary:')
Object.entries(categoryTotals.tokens).forEach(([category, count]) => {
  const name = tokenPatterns[category].name
  console.log(`  ${name}: ${count} uses`)
})

console.log('\n⚠️ Legacy Pattern Summary:')
let totalLegacyCount = 0
Object.entries(categoryTotals.legacy).forEach(([category, count]) => {
  if (count > 0) {
    const name = legacyPatterns[category].name
    console.log(`  ${name}: ${count} occurrences`)
    totalLegacyCount += count
  }
})

if (totalLegacyCount === 0) {
  console.log('  🎉 No legacy patterns found!')
}

console.log(`\n📉 Files Needing Improvement (Score < 70): ${lowScoreFiles.length}`)
if (lowScoreFiles.length > 0) {
  lowScoreFiles.slice(0, 10).forEach(file => {
    console.log(`  📁 ${file.path} (${file.score}%)`)
  })
  if (lowScoreFiles.length > 10) {
    console.log(`  ... and ${lowScoreFiles.length - 10} more files`)
  }
}

console.log(`\n📈 Top Performing Files (Score ≥ 90): ${highScoreFiles.length}`)
highScoreFiles.slice(0, 5).forEach(file => {
  console.log(`  ✅ ${file.path} (${file.score}%)`)
})

// Calculate final Phase 5 score
let phase5Score = 0

// Average score weight (40%)
if (averageScore >= 90) phase5Score += 40
else if (averageScore >= 80) phase5Score += 35
else if (averageScore >= 70) phase5Score += 30
else if (averageScore >= 60) phase5Score += 25
else if (averageScore >= 50) phase5Score += 20
else phase5Score += Math.max(0, averageScore * 0.4)

// Token usage weight (30%)
if (totalTokenUsage >= 150) phase5Score += 30
else if (totalTokenUsage >= 100) phase5Score += 25
else if (totalTokenUsage >= 75) phase5Score += 20
else if (totalTokenUsage >= 50) phase5Score += 15
else if (totalTokenUsage >= 25) phase5Score += 10
else phase5Score += totalTokenUsage * 0.4

// Legacy reduction weight (20%)
if (totalLegacyCount === 0) phase5Score += 20
else if (totalLegacyCount <= 5) phase5Score += 18
else if (totalLegacyCount <= 10) phase5Score += 15
else if (totalLegacyCount <= 20) phase5Score += 12
else if (totalLegacyCount <= 30) phase5Score += 8
else phase5Score += Math.max(0, 20 - (totalLegacyCount - 30) * 0.5)

// High-performing files weight (10%)
const highPerformanceRatio = highScoreFiles.length / results.length
phase5Score += highPerformanceRatio * 10

phase5Score = Math.round(phase5Score)

console.log('\n' + '=' .repeat(60))
console.log(`🎯 PHASE 5 SYSTEM-WIDE SCORE: ${phase5Score}/100`)
console.log('=' .repeat(60))

// Success criteria
const isSuccessful = phase5Score >= 85 && 
                    averageScore >= 75 && 
                    totalLegacyCount <= 10 &&
                    totalTokenUsage >= 50

if (isSuccessful) {
  console.log('🎉 PHASE 5: Full System Token Validation - EXCELLENT ✅')
  console.log('✅ Outstanding system-wide token compliance')
  console.log('✅ Minimal legacy patterns remaining')
  console.log('✅ Strong token adoption across components')
  console.log('✅ Aurora Design System successfully integrated')
} else {
  console.log('⚠️ PHASE 5: Full System Token Validation - NEEDS WORK ❌')
  
  if (phase5Score < 85) console.log('❌ Overall system score below target (85/100)')
  if (averageScore < 75) console.log('❌ Average file compliance needs improvement')
  if (totalLegacyCount > 10) console.log('❌ Too many legacy patterns remaining')
  if (totalTokenUsage < 50) console.log('❌ Insufficient token adoption')
}

// Actionable recommendations
console.log('\n💡 System-wide Recommendations:')

if (lowScoreFiles.length > 0) {
  console.log(`- Focus migration efforts on ${lowScoreFiles.length} low-scoring files`)
}

if (categoryTotals.legacy.hardcodedSpacing > 0) {
  console.log('- Prioritize migrating hardcoded spacing to token-* utilities')
}

if (categoryTotals.legacy.hardcodedColors > 0) {
  console.log('- Replace hardcoded colors with neutral-*, brand-*, or material-* tokens')
}

if (categoryTotals.legacy.customShadows > 0) {
  console.log('- Simplify custom shadows to use shadow-near/hover/far/soft tokens')
}

if (categoryTotals.tokens.spacing < 50) {
  console.log('- Increase usage of spacing tokens (token-xs through token-3xl)')
}

if (categoryTotals.tokens.shadows < 10) {
  console.log('- Adopt more consistent shadow token usage across components')
}

console.log(`\n🌟 Phase 5 comprehensive system validation completed: ${phase5Score}/100`)
console.log('🎯 Aurora Design System integration assessment complete!')

process.exit(isSuccessful ? 0 : 1)