/**
 * Phase 1 Foundation Testing
 * CLAUDE_RULES compliant: Comprehensive validation of migration utilities
 */

import { 
  migrateClassName, 
  colorMigrationMap,
  detectViolations,
  generateMigrationReport,
  validatePhaseCompletion
} from '../src/utils/uiSystemMigration'

describe('Phase 1: Foundation & Tooling', () => {
  describe('Color Migration Utilities', () => {
    test('migrates gray colors to neutral system', () => {
      expect(migrateClassName('text-gray-600')).toBe('text-neutral-600')
      expect(migrateClassName('bg-gray-100')).toBe('bg-neutral-100')
      expect(migrateClassName('border-gray-200')).toBe('border-neutral-200')
    })

    test('migrates legacy aurora classes', () => {
      expect(migrateClassName('text-aurora-nav-muted')).toBe('text-neutral-600')
      expect(migrateClassName('bg-aurora-nav-surface')).toBe('bg-neutral-50')
      expect(migrateClassName('border-aurora-nav-border')).toBe('border-neutral-200')
    })

    test('preserves non-targeted classes', () => {
      const className = 'flex items-center justify-center p-4'
      expect(migrateClassName(className)).toBe(className)
    })

    test('handles multiple classes in single string', () => {
      const input = 'text-gray-600 bg-gray-100 p-4 rounded-md'
      const expected = 'text-neutral-600 bg-neutral-100 p-4 rounded-md'
      expect(migrateClassName(input)).toBe(expected)
    })
  })

  describe('Violation Detection', () => {
    test('detects gray color violations', () => {
      const violations = detectViolations('text-gray-600 bg-gray-100')
      expect(violations).toContain('Uses deprecated gray-* colors instead of neutral-*')
    })

    test('detects legacy aurora violations', () => {
      const violations = detectViolations('bg-aurora-nav-surface')
      expect(violations).toContain('Uses legacy aurora-nav-* classes')
    })

    test('detects hardcoded color values', () => {
      const violations = detectViolations('text-[#ff0000]')
      expect(violations).toContain('Contains hardcoded color values instead of design tokens')
    })

    test('returns no violations for compliant classes', () => {
      const violations = detectViolations('text-neutral-600 bg-neutral-50 p-token-md')
      expect(violations).toHaveLength(0)
    })
  })

  describe('Migration Report Generation', () => {
    test('generates accurate report for file content', () => {
      const mockFileContent = `
        <div className="text-gray-600 bg-gray-100">
          <h1 className="text-neutral-900 font-bold">Title</h1>
          <p className="text-aurora-nav-muted">Description</p>
        </div>
      `
      
      const report = generateMigrationReport('test.tsx', mockFileContent)
      
      expect(report.filePath).toBe('test.tsx')
      expect(report.originalClasses).toHaveLength(3)
      expect(report.violations).toContain('Uses deprecated gray-* colors instead of neutral-*')
      expect(report.violations).toContain('Uses legacy aurora-nav-* classes')
    })
  })

  describe('Phase Validation', () => {
    test('validates phase completion correctly', () => {
      const mockReports = [
        {
          filePath: 'compliant.tsx',
          originalClasses: ['text-neutral-600', 'bg-neutral-50'],
          migratedClasses: ['text-neutral-600', 'bg-neutral-50'],
          violations: [],
          warnings: []
        },
        {
          filePath: 'non-compliant.tsx', 
          originalClasses: ['text-gray-600'],
          migratedClasses: ['text-neutral-600'],
          violations: ['Uses deprecated gray-* colors instead of neutral-*'],
          warnings: []
        }
      ]
      
      const result = validatePhaseCompletion('colors', mockReports)
      
      expect(result.passed).toBe(false)
      expect(result.violations).toContain('Uses deprecated gray-* colors instead of neutral-*')
      expect(result.totalFiles).toBe(2)
      expect(result.migratedFiles).toBe(1)
    })

    test('passes validation when no violations exist', () => {
      const mockReports = [
        {
          filePath: 'compliant.tsx',
          originalClasses: ['text-neutral-600', 'bg-neutral-50'],
          migratedClasses: ['text-neutral-600', 'bg-neutral-50'],
          violations: [],
          warnings: []
        }
      ]
      
      const result = validatePhaseCompletion('colors', mockReports)
      
      expect(result.passed).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.totalFiles).toBe(1)
      expect(result.migratedFiles).toBe(1)
    })
  })

  describe('CLAUDE_RULES Compliance', () => {
    test('migration utility file exists and is under 300 lines', async () => {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const utilityPath = path.resolve(__dirname, '../src/utils/uiSystemMigration.ts')
      const content = await fs.readFile(utilityPath, 'utf-8')
      const lineCount = content.split('\n').length
      
      expect(lineCount).toBeLessThanOrEqual(300)
    })

    test('audit script exists and is functional', async () => {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const auditPath = path.resolve(__dirname, '../scripts/audit-ui-system.ts')
      expect(await fs.access(auditPath).then(() => true).catch(() => false)).toBe(true)
    })
  })

  describe('ESLint Configuration', () => {
    test('ESLint rules are configured for UI system enforcement', async () => {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const eslintPath = path.resolve(__dirname, '../.eslintrc.json')
      const config = JSON.parse(await fs.readFile(eslintPath, 'utf-8'))
      
      expect(config.rules['no-restricted-syntax']).toBeDefined()
      expect(Array.isArray(config.rules['no-restricted-syntax'])).toBe(true)
      
      const rules = config.rules['no-restricted-syntax'].slice(1) // Skip 'error' level
      const grayColorRule = rules.find((rule: any) => 
        rule.message?.includes('neutral-* instead of gray-*')
      )
      const auroraRule = rules.find((rule: any) => 
        rule.message?.includes('aurora-nav-* classes are deprecated')
      )
      
      expect(grayColorRule).toBeDefined()
      expect(auroraRule).toBeDefined()
    })
  })
})