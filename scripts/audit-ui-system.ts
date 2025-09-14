#!/usr/bin/env ts-node
/**
 * UI System Audit Script
 * CLAUDE_RULES compliant: Comprehensive validation for each migration phase
 * 
 * Usage: npx ts-node scripts/audit-ui-system.ts [phase]
 */

import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import { 
  generateMigrationReport, 
  validatePhaseCompletion,
  hasTypographyImports,
  needsTypographyMigration,
  AuditResult,
  MigrationReport
} from '../src/utils/uiSystemMigration'

interface FileStats {
  path: string
  lineCount: number
  violations: string[]
  claudeRulesCompliant: boolean
}

interface PhaseAuditConfig {
  name: string
  description: string
  filePatterns: string[]
  validationRules: string[]
  maxViolations: number
}

const PHASE_CONFIGS: Record<string, PhaseAuditConfig> = {
  foundation: {
    name: 'Foundation & Tooling',
    description: 'Migration utilities and ESLint rules setup',
    filePatterns: [
      './src/utils/uiSystemMigration.ts',
      './scripts/audit-ui-system.ts'
    ],
    validationRules: [
      'Migration utilities exist and are functional',
      'All utility files under 300 lines (CLAUDE_RULES)',
      'TypeScript compilation successful',
      'No ESLint violations'
    ],
    maxViolations: 0
  },
  colors: {
    name: 'Color System Migration', 
    description: 'All gray-* and legacy aurora colors migrated to neutral system',
    filePatterns: [
      'src/app/**/*.tsx',
      'src/components/**/*.tsx'
    ],
    validationRules: [
      'Zero gray-* color classes',
      'Zero aurora-nav-* classes', 
      'All colors from approved Tailwind config',
      'Visual regression tests pass'
    ],
    maxViolations: 0
  },
  typography: {
    name: 'Typography Standardization',
    description: 'All text elements use Typography components',
    filePatterns: [
      'src/app/**/*.tsx',
      'src/components/**/*.tsx'
    ],
    validationRules: [
      'Zero raw heading tags with className',
      'Zero raw paragraph tags with text classes',
      'All Typography imports present where needed',
      'Consistent font scaling'
    ],
    maxViolations: 0
  },
  components: {
    name: 'Component Consolidation',
    description: 'All UI elements use standardized components',
    filePatterns: [
      'src/app/**/*.tsx',
      'src/components/**/*.tsx'
    ],
    validationRules: [
      'Zero raw button elements',
      'All interactive elements use UI components',
      'Component files under 300 lines',
      'Proper variant usage'
    ],
    maxViolations: 0
  },
  spacing: {
    name: 'Spacing & Layout',
    description: 'All spacing uses token system',
    filePatterns: [
      'src/app/**/*.tsx', 
      'src/components/**/*.tsx'
    ],
    validationRules: [
      'All spacing uses token-* classes',
      'No arbitrary spacing values',
      'Consistent section patterns',
      'Responsive breakpoints correct'
    ],
    maxViolations: 0
  }
}

/**
 * Check if file complies with CLAUDE_RULES line limits
 */
async function checkClaudeRulesCompliance(filePath: string): Promise<FileStats> {
  const content = await fs.readFile(filePath, 'utf-8')
  const lineCount = content.split('\n').length
  const violations: string[] = []
  
  // CLAUDE_RULES: Max 300 lines for utilities, 450 for complex components
  const isUtility = filePath.includes('/utils/') || filePath.includes('/lib/')
  const isComplexComponent = filePath.includes('dashboard') || filePath.includes('admin') || filePath.includes('customizer')
  
  let maxLines = 300
  if (isComplexComponent) maxLines = 450
  
  if (lineCount > maxLines) {
    violations.push(`Exceeds CLAUDE_RULES limit: ${lineCount} lines (max ${maxLines})`)
  }
  
  return {
    path: filePath,
    lineCount,
    violations,
    claudeRulesCompliant: violations.length === 0
  }
}

/**
 * Audit specific phase implementation
 */
async function auditPhase(phaseName: string): Promise<AuditResult> {
  const config = PHASE_CONFIGS[phaseName]
  if (!config) {
    throw new Error(`Unknown phase: ${phaseName}`)
  }
  
  console.log(`🔍 Auditing ${config.name}...`)
  console.log(`📋 ${config.description}`)
  
  const allFiles: string[] = []
  const reports: MigrationReport[] = []
  const fileStats: FileStats[] = []
  
  // Gather all files for this phase
  for (const pattern of config.filePatterns) {
    const files = await glob(pattern)
    if (Array.isArray(files)) {
      allFiles.push(...files)
    } else if (typeof files === 'string') {
      allFiles.push(files)
    }
  }
  
  console.log(`📁 Found ${allFiles.length} files to audit`)
  
  // Audit each file
  for (const filePath of allFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Generate migration report
      const report = generateMigrationReport(filePath, content)
      reports.push(report)
      
      // Check CLAUDE_RULES compliance
      const stats = await checkClaudeRulesCompliance(filePath)
      fileStats.push(stats)
      
      // Phase-specific checks
      if (phaseName === 'typography') {
        const typographyIssues = needsTypographyMigration(content)
        if (typographyIssues.length > 0 && !hasTypographyImports(content)) {
          report.violations.push(...typographyIssues)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }
  
  // Validate phase completion
  const auditResult = validatePhaseCompletion(phaseName, reports)
  
  // Add CLAUDE_RULES violations
  const claudeViolations = fileStats.filter(s => !s.claudeRulesCompliant)
  claudeViolations.forEach(violation => {
    auditResult.violations.push(...violation.violations)
  })
  
  // Display results
  console.log(`\n📊 ${config.name} Audit Results:`)
  console.log(`✅ Files processed: ${allFiles.length}`)
  console.log(`📏 CLAUDE_RULES compliant: ${fileStats.filter(s => s.claudeRulesCompliant).length}/${fileStats.length}`)
  
  if (auditResult.violations.length === 0) {
    console.log(`🎉 ${config.name} PASSED - No violations found`)
  } else {
    console.log(`❌ ${config.name} FAILED - ${auditResult.violations.length} violations:`)
    auditResult.violations.forEach(violation => {
      console.log(`  • ${violation}`)
    })
  }
  
  if (auditResult.warnings.length > 0) {
    console.log(`⚠️  Warnings (${auditResult.warnings.length}):`)
    auditResult.warnings.forEach(warning => {
      console.log(`  • ${warning}`)
    })
  }
  
  // Update audit result with CLAUDE_RULES compliance
  auditResult.passed = auditResult.violations.length === 0
  
  return auditResult
}

/**
 * Audit all phases or specific phase
 */
async function main() {
  const args = process.argv.slice(2)
  const targetPhase = args[0]
  
  try {
    if (targetPhase) {
      // Audit specific phase
      const result = await auditPhase(targetPhase)
      process.exit(result.passed ? 0 : 1)
    } else {
      // Audit all phases
      console.log('🔍 Running comprehensive UI system audit...\n')
      
      const results: AuditResult[] = []
      const phases = Object.keys(PHASE_CONFIGS)
      
      for (const phase of phases) {
        const result = await auditPhase(phase)
        results.push(result)
        console.log('\n' + '='.repeat(60) + '\n')
      }
      
      // Summary
      const allPassed = results.every(r => r.passed)
      const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0)
      
      console.log('📋 COMPREHENSIVE AUDIT SUMMARY:')
      console.log(`✅ Phases passed: ${results.filter(r => r.passed).length}/${results.length}`)
      console.log(`❌ Total violations: ${totalViolations}`)
      
      if (allPassed) {
        console.log('🎉 ALL PHASES PASSED - UI system fully compliant!')
      } else {
        console.log('❌ Some phases failed - review violations above')
      }
      
      process.exit(allPassed ? 0 : 1)
    }
  } catch (error) {
    console.error('💥 Audit failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { auditPhase, PHASE_CONFIGS }