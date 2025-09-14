#!/usr/bin/env ts-node
/**
 * Apply Color System Migration
 * CLAUDE_RULES compliant: Systematic migration of gray-* and aurora-nav-* classes
 */

import { promises as fs } from 'fs'
import path from 'path'
const glob = require('glob')
import { migrateClassName, colorMigrationMap } from '../src/utils/uiSystemMigration'

interface MigrationStats {
  totalFiles: number
  modifiedFiles: number
  totalReplacements: number
  grayColorReplacements: number
  auroraLegacyReplacements: number
}

/**
 * Apply migration to a single file
 */
async function migrateFile(filePath: string): Promise<{
  modified: boolean
  replacements: number
  grayReplacements: number
  auroraReplacements: number
}> {
  const originalContent = await fs.readFile(filePath, 'utf-8')
  let modifiedContent = originalContent
  let totalReplacements = 0
  let grayReplacements = 0
  let auroraReplacements = 0

  // Apply className migrations
  const classNameRegex = /className="([^"]*)"/g
  modifiedContent = modifiedContent.replace(classNameRegex, (match, className) => {
    const migratedClassName = migrateClassName(className, colorMigrationMap)
    
    if (migratedClassName !== className) {
      totalReplacements++
      
      // Count specific replacement types
      if (/gray-\d+/.test(className)) {
        grayReplacements++
      }
      if (/aurora-nav-/.test(className)) {
        auroraReplacements++
      }
      
      return `className="${migratedClassName}"`
    }
    return match
  })

  // Also apply migrations to template literal classNames
  const templateRegex = /className=\{`([^`]*)`\}/g
  modifiedContent = modifiedContent.replace(templateRegex, (match, className) => {
    const migratedClassName = migrateClassName(className, colorMigrationMap)
    
    if (migratedClassName !== className) {
      totalReplacements++
      
      if (/gray-\d+/.test(className)) {
        grayReplacements++
      }
      if (/aurora-nav-/.test(className)) {
        auroraReplacements++
      }
      
      return `className={\`${migratedClassName}\`}`
    }
    return match
  })

  // Apply migrations to any other color references (including in strings, return statements, etc.)
  const colorRegex = /(text-gray-|bg-gray-|border-gray-|text-aurora-nav-|bg-aurora-nav-|border-aurora-nav-)(\w+)/g
  modifiedContent = modifiedContent.replace(colorRegex, (match) => {
    const migratedColor = migrateClassName(match, colorMigrationMap)
    
    if (migratedColor !== match) {
      totalReplacements++
      
      if (/gray-\d+/.test(match)) {
        grayReplacements++
      }
      if (/aurora-nav-/.test(match)) {
        auroraReplacements++
      }
      
      return migratedColor
    }
    return match
  })

  // Handle aurora-nav class references in any context
  Object.entries(colorMigrationMap).forEach(([oldClass, newClass]) => {
    if (oldClass.includes('aurora-nav-')) {
      const globalRegex = new RegExp(`\\b${oldClass}\\b`, 'g')
      const beforeReplace = modifiedContent
      modifiedContent = modifiedContent.replace(globalRegex, newClass)
      
      if (modifiedContent !== beforeReplace) {
        // Count occurrences
        const matches = (beforeReplace.match(globalRegex) || []).length
        const newMatches = (modifiedContent.match(globalRegex) || []).length
        const replacements = matches - newMatches
        totalReplacements += replacements
        auroraReplacements += replacements
      }
    }
  })

  const modified = modifiedContent !== originalContent

  if (modified) {
    await fs.writeFile(filePath, modifiedContent, 'utf-8')
  }

  return {
    modified,
    replacements: totalReplacements,
    grayReplacements,
    auroraReplacements
  }
}

/**
 * Main migration execution
 */
async function main() {
  console.log('🔧 Starting Color System Migration...')
  console.log('📋 Applying gray-* → neutral-* and aurora-nav-* → neutral-* migrations\n')

  const stats: MigrationStats = {
    totalFiles: 0,
    modifiedFiles: 0,
    totalReplacements: 0,
    grayColorReplacements: 0,
    auroraLegacyReplacements: 0
  }

  // File patterns to migrate
  const patterns = [
    'src/app/**/*.tsx',
    'src/components/**/*.tsx',
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
    'src/hooks/**/*.ts'
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

  // Process each file (excluding migration utilities themselves)
  for (const filePath of allFiles) {
    // Skip migration utility files
    if (filePath.includes('uiSystemMigration.ts') || 
        filePath.includes('audit-ui-system.ts') ||
        filePath.includes('apply-color-migration.ts')) {
      continue
    }
    
    try {
      const result = await migrateFile(filePath)
      
      if (result.modified) {
        stats.modifiedFiles++
        stats.totalReplacements += result.replacements
        stats.grayColorReplacements += result.grayReplacements
        stats.auroraLegacyReplacements += result.auroraReplacements
        
        console.log(`✅ ${filePath}: ${result.replacements} replacements`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }

  // Display results
  console.log('\n📊 Migration Results:')
  console.log(`✅ Files processed: ${stats.totalFiles}`)
  console.log(`🔄 Files modified: ${stats.modifiedFiles}`)
  console.log(`📝 Total replacements: ${stats.totalReplacements}`)
  console.log(`🎨 Gray color fixes: ${stats.grayColorReplacements}`)
  console.log(`🌅 Aurora legacy fixes: ${stats.auroraLegacyReplacements}`)

  if (stats.totalReplacements > 0) {
    console.log('\n🎉 Color migration completed successfully!')
    console.log('🧪 Run audit to verify: npx tsx scripts/audit-ui-system.ts colors')
  } else {
    console.log('\n✨ No color violations found - system already compliant!')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as applyColorMigration }