#!/usr/bin/env ts-node
/**
 * Apply Spacing & Layout Migration
 * CLAUDE_RULES compliant: Systematic migration to standardized spacing tokens
 */

import { promises as fs } from 'fs'
import path from 'path'
const glob = require('glob')

interface SpacingMigrationStats {
  totalFiles: number
  modifiedFiles: number
  totalReplacements: number
  paddingReplacements: number
  marginReplacements: number
  gapReplacements: number
  spacingReplacements: number
}

/**
 * Spacing token mapping - legacy to standardized tokens
 */
const spacingMigrationMap: Record<string, string> = {
  // Padding migrations
  'p-token-xs': 'p-1',
  'p-token-sm': 'p-2', 
  'p-token-md': 'p-4',
  'p-token-lg': 'p-6',
  'p-token-xl': 'p-8',
  'p-token-2xl': 'p-12',
  'p-token-3xl': 'p-16',
  'p-token-4xl': 'p-24',

  // Margin migrations  
  'm-token-xs': 'm-1',
  'm-token-sm': 'm-2',
  'm-token-md': 'm-4', 
  'm-token-lg': 'm-6',
  'm-token-xl': 'm-8',
  'm-token-2xl': 'm-12',
  'm-token-3xl': 'm-16',

  // Gap migrations
  'gap-token-xs': 'gap-1',
  'gap-token-sm': 'gap-2',
  'gap-token-md': 'gap-4',
  'gap-token-lg': 'gap-6',
  'gap-token-xl': 'gap-8',

  // Space-y/x migrations
  'space-y-token-xs': 'space-y-1',
  'space-y-token-sm': 'space-y-2',
  'space-y-token-md': 'space-y-4',
  'space-y-token-lg': 'space-y-6',
  'space-x-token-xs': 'space-x-1',
  'space-x-token-sm': 'space-x-2',
  'space-x-token-md': 'space-x-4',
  'space-x-token-lg': 'space-x-6'
}

/**
 * Apply spacing migrations to content
 */
function migrateSpacingInContent(content: string): {
  migratedContent: string
  replacements: number
  paddingReplacements: number
  marginReplacements: number
  gapReplacements: number
  spacingReplacements: number
} {
  let migratedContent = content
  let totalReplacements = 0
  let paddingReplacements = 0
  let marginReplacements = 0
  let gapReplacements = 0
  let spacingReplacements = 0

  // Apply spacing migrations
  Object.entries(spacingMigrationMap).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g')
    const matches = migratedContent.match(regex) || []
    const count = matches.length
    
    if (count > 0) {
      migratedContent = migratedContent.replace(regex, newClass)
      totalReplacements += count
      
      // Categorize replacements
      if (oldClass.startsWith('p-token')) paddingReplacements += count
      else if (oldClass.startsWith('m-token')) marginReplacements += count
      else if (oldClass.startsWith('gap-token')) gapReplacements += count
      else if (oldClass.startsWith('space-')) spacingReplacements += count
    }
  })

  return {
    migratedContent,
    replacements: totalReplacements,
    paddingReplacements,
    marginReplacements,
    gapReplacements,
    spacingReplacements
  }
}

/**
 * Process a single file for spacing migration
 */
async function migrateSpacingInFile(filePath: string): Promise<{
  modified: boolean
  replacements: number
  paddingReplacements: number
  marginReplacements: number
  gapReplacements: number
  spacingReplacements: number
}> {
  const originalContent = await fs.readFile(filePath, 'utf-8')
  
  // Apply spacing migrations
  const migrationResult = migrateSpacingInContent(originalContent)
  
  const modified = migrationResult.migratedContent !== originalContent
  
  if (modified) {
    await fs.writeFile(filePath, migrationResult.migratedContent, 'utf-8')
  }

  return {
    modified,
    replacements: migrationResult.replacements,
    paddingReplacements: migrationResult.paddingReplacements,
    marginReplacements: migrationResult.marginReplacements,
    gapReplacements: migrationResult.gapReplacements,
    spacingReplacements: migrationResult.spacingReplacements
  }
}

/**
 * Main spacing migration execution
 */
async function main() {
  console.log('📏 Starting Spacing & Layout Standardization...')
  console.log('🎯 Migrating token-based spacing to Tailwind standards\n')

  const stats: SpacingMigrationStats = {
    totalFiles: 0,
    modifiedFiles: 0,
    totalReplacements: 0,
    paddingReplacements: 0,
    marginReplacements: 0,
    gapReplacements: 0,
    spacingReplacements: 0
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
      const result = await migrateSpacingInFile(filePath)
      
      if (result.modified) {
        stats.modifiedFiles++
        stats.totalReplacements += result.replacements
        stats.paddingReplacements += result.paddingReplacements
        stats.marginReplacements += result.marginReplacements
        stats.gapReplacements += result.gapReplacements
        stats.spacingReplacements += result.spacingReplacements
        
        console.log(`✅ ${filePath}: ${result.replacements} spacing updates`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }

  // Display results
  console.log('\n📊 Spacing Migration Results:')
  console.log(`✅ Files processed: ${stats.totalFiles}`)
  console.log(`🔄 Files modified: ${stats.modifiedFiles}`)
  console.log(`📏 Total spacing updates: ${stats.totalReplacements}`)
  console.log(`📦 Padding migrations: ${stats.paddingReplacements}`)
  console.log(`📦 Margin migrations: ${stats.marginReplacements}`)
  console.log(`🔗 Gap migrations: ${stats.gapReplacements}`)
  console.log(`📐 Space-x/y migrations: ${stats.spacingReplacements}`)

  if (stats.totalReplacements > 0) {
    console.log('\n🎉 Spacing standardization completed successfully!')
    console.log('🧪 Run audit to verify: npx tsx scripts/audit-ui-system.ts spacing')
  } else {
    console.log('\n✨ No spacing violations found - system already standardized!')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as applySpacingMigration }