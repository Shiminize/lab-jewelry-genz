#!/usr/bin/env ts-node
/**
 * Apply Typography System Migration
 * CLAUDE_RULES compliant: Systematic migration of raw heading/text tags to Typography components
 */

import { promises as fs } from 'fs'
import path from 'path'
const glob = require('glob')
// Import functions inline to avoid path issues
function hasTypographyImports(fileContent: string): boolean {
  const typographyImportPattern = /import\s+{[^}]*\b(H1|H2|H3|H4|BodyText|MutedText)\b[^}]*}\s+from\s+['"]/
  return typographyImportPattern.test(fileContent)
}

function needsTypographyMigration(fileContent: string): string[] {
  const issues: string[] = []
  
  if (/<h[1-6]\s+className=/.test(fileContent)) {
    issues.push('Has raw heading tags with className that should use Typography components')
  }
  
  if (/<p\s+className="[^"]*text-/.test(fileContent)) {
    issues.push('Has paragraph tags with text classes that should use BodyText component')
  }
  
  if (/<span\s+className="[^"]*text-/.test(fileContent)) {
    issues.push('Has span tags with text classes that should use appropriate Typography component')
  }
  
  return issues
}

interface TypographyMigrationStats {
  totalFiles: number
  modifiedFiles: number
  totalReplacements: number
  headingReplacements: number
  paragraphReplacements: number
  spanReplacements: number
  importsAdded: number
}

/**
 * Add Typography imports to file if needed
 */
function addTypographyImports(content: string): string {
  if (hasTypographyImports(content)) {
    return content // Already has imports
  }

  // Check if file needs Typography components
  const issues = needsTypographyMigration(content)
  if (issues.length === 0) {
    return content // No typography issues
  }

  // Determine which Typography components are needed
  const neededComponents: string[] = []
  
  if (/<h1\s+className=/.test(content)) neededComponents.push('H1')
  if (/<h2\s+className=/.test(content)) neededComponents.push('H2') 
  if (/<h3\s+className=/.test(content)) neededComponents.push('H3')
  if (/<h4\s+className=/.test(content)) neededComponents.push('H4')
  if (/<p\s+className="[^"]*text-/.test(content)) neededComponents.push('BodyText')
  if (/<span\s+className="[^"]*text-/.test(content)) neededComponents.push('MutedText')

  if (neededComponents.length === 0) {
    return content
  }

  // Find existing imports section
  const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm
  const lastImport = content.match(importRegex)?.pop()
  
  if (lastImport) {
    const importIndex = content.lastIndexOf(lastImport) + lastImport.length
    const newImport = `\nimport { ${neededComponents.join(', ')} } from '@/components/foundation/Typography'`
    return content.slice(0, importIndex) + newImport + content.slice(importIndex)
  }
  
  // If no imports found, add at the top after 'use client' if present
  const useClientMatch = content.match(/^['"]use client['"];?\s*$/m)
  if (useClientMatch) {
    const insertIndex = content.indexOf(useClientMatch[0]) + useClientMatch[0].length
    const newImport = `\n\nimport { ${neededComponents.join(', ')} } from '@/components/foundation/Typography'`
    return content.slice(0, insertIndex) + newImport + content.slice(insertIndex)
  }
  
  // Add at very beginning
  const newImport = `import { ${neededComponents.join(', ')} } from '@/components/foundation/Typography'\n\n`
  return newImport + content
}

/**
 * Apply typography migrations to file content
 */
function migrateTypographyInContent(content: string): {
  migratedContent: string
  replacements: number
  headingReplacements: number
  paragraphReplacements: number
  spanReplacements: number
} {
  let migratedContent = content
  let totalReplacements = 0
  let headingReplacements = 0
  let paragraphReplacements = 0
  let spanReplacements = 0

  // Migrate H1 tags with className
  migratedContent = migratedContent.replace(
    /<h1\s+className="([^"]*)"[^>]*>(.*?)<\/h1>/gs,
    (match, classes, content) => {
      if (/text-\w+/.test(classes)) {
        totalReplacements++
        headingReplacements++
        return `<H1>${content}</H1>`
      }
      return match
    }
  )

  // Migrate H2 tags with className
  migratedContent = migratedContent.replace(
    /<h2\s+className="([^"]*)"[^>]*>(.*?)<\/h2>/gs,
    (match, classes, content) => {
      if (/text-\w+/.test(classes)) {
        totalReplacements++
        headingReplacements++
        return `<H2>${content}</H2>`
      }
      return match
    }
  )

  // Migrate H3 tags with className
  migratedContent = migratedContent.replace(
    /<h3\s+className="([^"]*)"[^>]*>(.*?)<\/h3>/gs,
    (match, classes, content) => {
      if (/text-\w+/.test(classes)) {
        totalReplacements++
        headingReplacements++
        return `<H3>${content}</H3>`
      }
      return match
    }
  )

  // Migrate H4 tags with className
  migratedContent = migratedContent.replace(
    /<h4\s+className="([^"]*)"[^>]*>(.*?)<\/h4>/gs,
    (match, classes, content) => {
      if (/text-\w+/.test(classes)) {
        totalReplacements++
        headingReplacements++
        return `<H4>${content}</H4>`
      }
      return match
    }
  )

  // Migrate paragraph tags with text styling
  migratedContent = migratedContent.replace(
    /<p\s+className="([^"]*)"[^>]*>(.*?)<\/p>/gs,
    (match, classes, content) => {
      if (/text-\w+/.test(classes)) {
        totalReplacements++
        paragraphReplacements++
        return `<BodyText>${content}</BodyText>`
      }
      return match
    }
  )

  // Migrate span tags with muted text styling
  migratedContent = migratedContent.replace(
    /<span\s+className="([^"]*text-muted[^"]*)"[^>]*>(.*?)<\/span>/gs,
    (match, classes, content) => {
      totalReplacements++
      spanReplacements++
      return `<MutedText>${content}</MutedText>`
    }
  )

  return {
    migratedContent,
    replacements: totalReplacements,
    headingReplacements,
    paragraphReplacements,
    spanReplacements
  }
}

/**
 * Process a single file for typography migration
 */
async function migrateTypographyInFile(filePath: string): Promise<{
  modified: boolean
  replacements: number
  headingReplacements: number
  paragraphReplacements: number
  spanReplacements: number
  importsAdded: boolean
}> {
  const originalContent = await fs.readFile(filePath, 'utf-8')
  
  // First add imports if needed
  const contentWithImports = addTypographyImports(originalContent)
  const importsAdded = contentWithImports !== originalContent
  
  // Then apply typography migrations
  const migrationResult = migrateTypographyInContent(contentWithImports)
  
  const modified = migrationResult.migratedContent !== originalContent
  
  if (modified) {
    await fs.writeFile(filePath, migrationResult.migratedContent, 'utf-8')
  }

  return {
    modified,
    replacements: migrationResult.replacements,
    headingReplacements: migrationResult.headingReplacements,
    paragraphReplacements: migrationResult.paragraphReplacements,
    spanReplacements: migrationResult.spanReplacements,
    importsAdded
  }
}

/**
 * Main typography migration execution
 */
async function main() {
  console.log('🔤 Starting Typography System Migration...')
  console.log('📋 Converting raw HTML tags to Typography components\n')

  const stats: TypographyMigrationStats = {
    totalFiles: 0,
    modifiedFiles: 0,
    totalReplacements: 0,
    headingReplacements: 0,
    paragraphReplacements: 0,
    spanReplacements: 0,
    importsAdded: 0
  }

  // File patterns to migrate
  const patterns = [
    'src/app/**/*.tsx',
    'src/components/**/*.tsx'
  ]

  const allFiles: string[] = []
  for (const pattern of patterns) {
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, (err: any, matches: string[]) => {
        if (err) reject(err)
        else resolve(matches)
      })
    })
    allFiles.push(...files)
  }

  stats.totalFiles = allFiles.length
  console.log(`📁 Found ${allFiles.length} files to process`)

  // Process each file
  for (const filePath of allFiles) {
    try {
      const result = await migrateTypographyInFile(filePath)
      
      if (result.modified) {
        stats.modifiedFiles++
        stats.totalReplacements += result.replacements
        stats.headingReplacements += result.headingReplacements
        stats.paragraphReplacements += result.paragraphReplacements
        stats.spanReplacements += result.spanReplacements
        if (result.importsAdded) stats.importsAdded++
        
        console.log(`✅ ${filePath}: ${result.replacements} replacements`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }

  // Display results
  console.log('\n📊 Typography Migration Results:')
  console.log(`✅ Files processed: ${stats.totalFiles}`)
  console.log(`🔄 Files modified: ${stats.modifiedFiles}`)
  console.log(`📝 Total replacements: ${stats.totalReplacements}`)
  console.log(`📰 Heading migrations: ${stats.headingReplacements}`)
  console.log(`📄 Paragraph migrations: ${stats.paragraphReplacements}`)
  console.log(`🏷️ Span migrations: ${stats.spanReplacements}`)
  console.log(`📦 Import statements added: ${stats.importsAdded}`)

  if (stats.totalReplacements > 0) {
    console.log('\n🎉 Typography migration completed successfully!')
    console.log('🧪 Run audit to verify: npx tsx scripts/audit-ui-system.ts typography')
  } else {
    console.log('\n✨ No typography violations found - system already compliant!')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as applyTypographyMigration }