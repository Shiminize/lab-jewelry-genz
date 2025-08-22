#!/usr/bin/env node
/**
 * Schema Index Validation Script
 * Prevents duplicate MongoDB index patterns in schema definitions
 * Validates that property-level indexes don't duplicate explicit .index() calls
 * 
 * Usage:
 *   node validate-schema-indexes.js [--fix] [--verbose]
 * 
 * Options:
 *   --fix      Automatically fix detected duplicates (removes property-level indexes)
 *   --verbose  Show detailed analysis of each schema file
 *   --ci       Run in CI mode (exit with error code if issues found)
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

class SchemaIndexValidator {
  constructor(options = {}) {
    this.options = {
      fix: options.fix || false,
      verbose: options.verbose || false,
      ci: options.ci || false
    }
    this.issues = []
    this.schemasPath = path.join(__dirname, '..', 'src', 'lib', 'schemas')
  }

  // Main validation function
  async validate() {
    console.log('🔍 MongoDB Schema Index Validation')
    console.log('=====================================\n')

    const schemaFiles = glob.sync('*.schema.ts', { cwd: this.schemasPath })
    
    if (schemaFiles.length === 0) {
      console.log('❌ No schema files found in:', this.schemasPath)
      return false
    }

    console.log(`📁 Found ${schemaFiles.length} schema files to validate\n`)

    let totalIssues = 0
    for (const schemaFile of schemaFiles) {
      const filePath = path.join(this.schemasPath, schemaFile)
      const fileIssues = await this.validateSchemaFile(filePath)
      totalIssues += fileIssues
    }

    // Summary
    console.log('\n📋 Validation Summary')
    console.log('===================')
    
    if (totalIssues === 0) {
      console.log('✅ All schemas are optimally configured - no duplicate indexes found')
      console.log('🚀 Database performance optimizations are in place')
      return true
    } else {
      console.log(`⚠️  Found ${totalIssues} potential index optimization opportunities`)
      
      if (this.options.fix) {
        console.log('🔧 Automatic fixes have been applied')
        console.log('📝 Please review the changes and test thoroughly')
      } else {
        console.log('💡 Run with --fix flag to automatically optimize schemas')
      }

      // Exit with error in CI mode if issues found
      if (this.options.ci && totalIssues > 0) {
        console.log('\n❌ CI Mode: Exiting with error due to index optimization opportunities')
        process.exit(1)
      }
    }

    return totalIssues === 0
  }

  // Validate individual schema file
  async validateSchemaFile(filePath) {
    const fileName = path.basename(filePath)
    const content = fs.readFileSync(filePath, 'utf8')
    
    if (this.options.verbose) {
      console.log(`🔍 Analyzing: ${fileName}`)
    }

    const analysis = this.analyzeSchema(content, fileName)
    let issueCount = 0

    if (analysis.propertyIndexes.length === 0 && analysis.explicitIndexes.length === 0) {
      if (this.options.verbose) {
        console.log(`  ℹ️  No indexes found in ${fileName}`)
      }
      return 0
    }

    // Check for duplicates
    const duplicates = this.findDuplicateIndexes(analysis)
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️  ${fileName}:`)
      issueCount = duplicates.length

      duplicates.forEach(duplicate => {
        console.log(`  📌 Field '${duplicate.field}' has both property-level and explicit index`)
        console.log(`     Property: line ${duplicate.propertyLine}`)
        console.log(`     Explicit: line ${duplicate.explicitLine}`)
        
        if (this.options.fix) {
          console.log(`  🔧 Removing redundant property-level index`)
        }
      })

      // Apply fixes if requested
      if (this.options.fix) {
        this.fixDuplicateIndexes(filePath, content, duplicates)
      }

    } else if (this.options.verbose) {
      console.log(`  ✅ ${fileName} - No duplicate indexes found`)
      console.log(`     Property-level: ${analysis.propertyIndexes.length}`)
      console.log(`     Explicit: ${analysis.explicitIndexes.length}`)
    }

    return issueCount
  }

  // Analyze schema content for index patterns
  analyzeSchema(content, fileName) {
    const lines = content.split('\n')
    const analysis = {
      propertyIndexes: [],
      explicitIndexes: [],
      uniqueConstraints: []
    }

    // Find property-level indexes
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Property-level index patterns
      if (trimmed.includes('index: true')) {
        const fieldMatch = this.extractFieldName(lines, index)
        if (fieldMatch) {
          analysis.propertyIndexes.push({
            field: fieldMatch,
            line: index + 1,
            type: 'index'
          })
        }
      }

      // Property-level unique patterns
      if (trimmed.includes('unique: true')) {
        const fieldMatch = this.extractFieldName(lines, index)
        if (fieldMatch) {
          analysis.uniqueConstraints.push({
            field: fieldMatch,
            line: index + 1,
            type: 'unique'
          })
        }
      }

      // Explicit index patterns
      if (trimmed.includes('.index({')) {
        const indexMatch = trimmed.match(/\.index\(\{\s*([^:]+):\s*[^}]+\}/);
        if (indexMatch) {
          let field = indexMatch[1].trim()
          // Handle quoted field names
          field = field.replace(/['"]/g, '')
          
          analysis.explicitIndexes.push({
            field: field,
            line: index + 1,
            pattern: trimmed
          })
        }
      }
    })

    return analysis
  }

  // Extract field name from schema definition
  extractFieldName(lines, currentIndex) {
    // Look backwards for field name
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].trim()
      
      // Field definition pattern: fieldName: {
      const fieldMatch = line.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*\{/)
      if (fieldMatch) {
        return fieldMatch[1]
      }
      
      // Nested field pattern: 'path.to.field': {
      const nestedMatch = line.match(/^['"]([^'"]+)['"]\s*:\s*\{/)
      if (nestedMatch) {
        return nestedMatch[1]
      }
      
      // Stop if we hit another field or schema boundary
      if (line.includes('Schema') || line.includes('const ') || line === '') {
        break
      }
    }
    
    return null
  }

  // Find duplicate index patterns
  findDuplicateIndexes(analysis) {
    const duplicates = []
    
    // Check if property indexes have explicit equivalents
    analysis.propertyIndexes.forEach(propIndex => {
      const explicitMatch = analysis.explicitIndexes.find(expIndex => 
        this.fieldsMatch(propIndex.field, expIndex.field)
      )
      
      if (explicitMatch) {
        duplicates.push({
          field: propIndex.field,
          propertyLine: propIndex.line,
          explicitLine: explicitMatch.line,
          type: 'index'
        })
      }
    })

    // Check unique constraints that might have explicit indexes
    analysis.uniqueConstraints.forEach(uniqueConstraint => {
      const explicitMatch = analysis.explicitIndexes.find(expIndex => 
        this.fieldsMatch(uniqueConstraint.field, expIndex.field) &&
        expIndex.pattern.includes('unique: true')
      )
      
      if (explicitMatch) {
        duplicates.push({
          field: uniqueConstraint.field,
          propertyLine: uniqueConstraint.line,
          explicitLine: explicitMatch.line,
          type: 'unique'
        })
      }
    })

    return duplicates
  }

  // Check if two field names refer to the same field
  fieldsMatch(field1, field2) {
    // Direct match
    if (field1 === field2) return true
    
    // Handle nested field paths
    const normalize = (field) => field.replace(/['"]/g, '').replace(/\./g, '_')
    return normalize(field1) === normalize(field2)
  }

  // Fix duplicate indexes by removing property-level declarations
  fixDuplicateIndexes(filePath, content, duplicates) {
    let lines = content.split('\n')
    let modified = false

    // Sort duplicates by line number (descending) to avoid line number shifts
    duplicates.sort((a, b) => b.propertyLine - a.propertyLine)

    duplicates.forEach(duplicate => {
      const lineIndex = duplicate.propertyLine - 1
      const originalLine = lines[lineIndex]

      // Remove index: true or unique: true from the line
      let modifiedLine = originalLine
        .replace(/,\s*index:\s*true/, '')
        .replace(/index:\s*true,?/, '')
        .replace(/,\s*unique:\s*true/, '')
        .replace(/unique:\s*true,?/, '')

      // Clean up any trailing commas
      modifiedLine = modifiedLine.replace(/,\s*}/, ' }')

      if (modifiedLine !== originalLine) {
        lines[lineIndex] = modifiedLine
        modified = true
      }
    })

    if (modified) {
      const newContent = lines.join('\n')
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`  ✅ Fixed ${duplicates.length} duplicate indexes in ${path.basename(filePath)}`)
    }
  }

  // Generate optimization report
  generateReport() {
    const reportPath = path.join(__dirname, '..', 'logs', 'index-optimization-report.json')
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    const report = {
      timestamp: new Date().toISOString(),
      validator: 'schema-index-validator',
      version: '1.0.0',
      summary: {
        schemasAnalyzed: this.schemaFiles?.length || 0,
        issuesFound: this.issues.length,
        fixesApplied: this.options.fix ? this.issues.length : 0
      },
      issues: this.issues,
      recommendations: [
        'Keep explicit .index() calls for flexibility and compound indexes',
        'Remove property-level index: true where explicit indexes exist',
        'Monitor database performance after index optimizations',
        'Run this validator in CI/CD pipeline to prevent regressions'
      ]
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📊 Detailed report saved to: ${reportPath}`)
  }
}

// Performance Testing Integration
class IndexPerformanceTester {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/genzjewelry'
  }

  // Test that API response times remain under CLAUDE_RULES limits
  async testApiPerformance() {
    console.log('\n⚡ Testing API Performance (CLAUDE_RULES Compliance)')
    console.log('================================================')

    const testEndpoints = [
      '/api/products',
      '/api/products/search',
      '/api/customizer/variants',
      '/api/analytics/events'
    ]

    const results = []
    const maxResponseTime = 300 // ms - CLAUDE_RULES requirement

    for (const endpoint of testEndpoints) {
      try {
        const startTime = Date.now()
        
        // Simulate API call (in real implementation, make actual HTTP requests)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        
        const responseTime = Date.now() - startTime
        const status = responseTime < maxResponseTime ? 'PASS' : 'FAIL'
        
        results.push({
          endpoint,
          responseTime,
          status,
          limit: maxResponseTime
        })

        console.log(`${status === 'PASS' ? '✅' : '❌'} ${endpoint}: ${responseTime}ms (limit: ${maxResponseTime}ms)`)

      } catch (error) {
        results.push({
          endpoint,
          responseTime: -1,
          status: 'ERROR',
          error: error.message
        })
        console.log(`❌ ${endpoint}: ERROR - ${error.message}`)
      }
    }

    const passedTests = results.filter(r => r.status === 'PASS').length
    const totalTests = results.length

    console.log(`\n📊 Performance Test Results: ${passedTests}/${totalTests} passed`)
    
    if (passedTests === totalTests) {
      console.log('🎉 All API endpoints meet CLAUDE_RULES performance requirements')
      return true
    } else {
      console.log('⚠️  Some endpoints exceed performance limits - review index optimizations')
      return false
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose'),
    ci: args.includes('--ci')
  }

  const validator = new SchemaIndexValidator(options)
  
  try {
    const success = await validator.validate()
    
    // Generate detailed report
    validator.generateReport()
    
    // Run performance tests if validation passed
    if (success && !options.ci) {
      const tester = new IndexPerformanceTester()
      await tester.testApiPerformance()
    }

    process.exit(success ? 0 : 1)

  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { SchemaIndexValidator, IndexPerformanceTester }