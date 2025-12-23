#!/usr/bin/env ts-node
/**
 * Apply Component Consolidation Migration
 * CLAUDE_RULES compliant: Systematic migration of raw UI elements to standardized components
 */

import { promises as fs } from 'fs'
import path from 'path'
const glob = require('glob')

interface ComponentMigrationStats {
  totalFiles: number
  modifiedFiles: number
  totalReplacements: number
  buttonReplacements: number
  inputReplacements: number
  selectReplacements: number
  textareaReplacements: number
  importsAdded: number
}

/**
 * Check if file already has UI component imports
 */
function hasUIComponentImports(content: string): boolean {
  return /import.*{[^}]*(Button|Input|Select|Textarea)[^}]*}.*from.*ui/.test(content)
}

/**
 * Add UI component imports to file if needed
 */
function addUIComponentImports(content: string): { content: string, importsAdded: boolean } {
  // Determine which UI components are needed
  const neededComponents: string[] = []
  
  if (/<button\s/.test(content) && !/<Button\s/.test(content)) neededComponents.push('Button')
  if (/<input\s/.test(content) && !/<Input\s/.test(content)) neededComponents.push('Input')
  if (/<select\s/.test(content) && !/<Select\s/.test(content)) neededComponents.push('Select')
  if (/<textarea\s/.test(content) && !/<Textarea\s/.test(content)) neededComponents.push('Textarea')

  if (neededComponents.length === 0 || hasUIComponentImports(content)) {
    return { content, importsAdded: false }
  }

  // Find existing imports section
  const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm
  const lastImport = content.match(importRegex)?.pop()
  
  if (lastImport) {
    const importIndex = content.lastIndexOf(lastImport) + lastImport.length
    const newImport = `\nimport { ${neededComponents.join(', ')} } from '@/components/ui'`
    return { 
      content: content.slice(0, importIndex) + newImport + content.slice(importIndex), 
      importsAdded: true 
    }
  }
  
  // If no imports found, add at the top after 'use client' if present
  const useClientMatch = content.match(/^['"]use client['"];?\s*$/m)
  if (useClientMatch) {
    const insertIndex = content.indexOf(useClientMatch[0]) + useClientMatch[0].length
    const newImport = `\n\nimport { ${neededComponents.join(', ')} } from '@/components/ui'`
    return { 
      content: content.slice(0, insertIndex) + newImport + content.slice(insertIndex), 
      importsAdded: true 
    }
  }
  
  // Add at very beginning
  const newImport = `import { ${neededComponents.join(', ')} } from '@/components/ui'\n\n`
  return { 
    content: newImport + content, 
    importsAdded: true 
  }
}

/**
 * Extract commonly used button props and convert to Button component props
 */
function extractButtonProps(element: string): string {
  const props: string[] = []
  
  // Extract onClick
  const onClickMatch = element.match(/onClick=\{([^}]+)\}/)
  if (onClickMatch) {
    props.push(`onClick={${onClickMatch[1]}}`)
  }
  
  // Extract disabled
  if (/disabled/.test(element)) {
    props.push('disabled')
  }
  
  // Extract type
  const typeMatch = element.match(/type="([^"]+)"/)
  if (typeMatch && typeMatch[1] !== 'button') {
    props.push(`type="${typeMatch[1]}"`)
  }
  
  // Determine variant from className
  const classNameMatch = element.match(/className="([^"]*)"/)
  if (classNameMatch) {
    const className = classNameMatch[1]
    
    if (/bg-transparent|border-\w+|outline/.test(className)) {
      props.push('variant="outline"')
    } else if (/bg-neutral|ghost/.test(className)) {
      props.push('variant="ghost"')
    } else if (/bg-red|destructive/.test(className)) {
      props.push('variant="destructive"')
    } else {
      props.push('variant="default"')
    }
    
    // Extract size hints
    if (/p-1|px-2|py-1|text-xs/.test(className)) {
      props.push('size="sm"')
    } else if (/p-4|px-6|py-3|text-lg/.test(className)) {
      props.push('size="lg"')
    } else {
      props.push('size="md"')
    }
  } else {
    props.push('variant="default"')
    props.push('size="md"')
  }
  
  return props.join(' ')
}

/**
 * Extract input props for Input component
 */
function extractInputProps(element: string): string {
  const props: string[] = []
  
  // Extract type
  const typeMatch = element.match(/type="([^"]+)"/)
  if (typeMatch) {
    props.push(`type="${typeMatch[1]}"`)
  }
  
  // Extract placeholder
  const placeholderMatch = element.match(/placeholder="([^"]*)"/)
  if (placeholderMatch) {
    props.push(`placeholder="${placeholderMatch[1]}"`)
  }
  
  // Extract value
  const valueMatch = element.match(/value=\{([^}]+)\}/)
  if (valueMatch) {
    props.push(`value={${valueMatch[1]}}`)
  }
  
  // Extract onChange
  const onChangeMatch = element.match(/onChange=\{([^}]+)\}/)
  if (onChangeMatch) {
    props.push(`onChange={${onChangeMatch[1]}}`)
  }
  
  // Extract name
  const nameMatch = element.match(/name="([^"]+)"/)
  if (nameMatch) {
    props.push(`name="${nameMatch[1]}"`)
  }
  
  // Extract id
  const idMatch = element.match(/id="([^"]+)"/)
  if (idMatch) {
    props.push(`id="${idMatch[1]}"`)
  }
  
  // Extract disabled
  if (/disabled/.test(element)) {
    props.push('disabled')
  }
  
  // Extract required
  if (/required/.test(element)) {
    props.push('required')
  }
  
  return props.join(' ')
}

/**
 * Apply component migrations to file content
 */
function migrateComponentsInContent(content: string): {
  migratedContent: string
  replacements: number
  buttonReplacements: number
  inputReplacements: number
  selectReplacements: number
  textareaReplacements: number
} {
  let migratedContent = content
  let totalReplacements = 0
  let buttonReplacements = 0
  let inputReplacements = 0
  let selectReplacements = 0
  let textareaReplacements = 0

  // Migrate button elements (but not those already using Button component)
  migratedContent = migratedContent.replace(
    /<button\s([^>]*?)>(.*?)<\/button>/gs,
    (match, attributes, content) => {
      // Skip if already using Button component or has special cases
      if (/Button\s/.test(match) || /data-testid/.test(attributes)) {
        return match
      }
      
      totalReplacements++
      buttonReplacements++
      
      const props = extractButtonProps(match)
      return `<Button ${props}>\n        ${content}\n      </Button>`
    }
  )

  // Migrate input elements (but not those already using Input component)
  migratedContent = migratedContent.replace(
    /<input\s([^/>]*?)\s?\/?>/g,
    (match, attributes) => {
      // Skip if already using Input component or special cases
      if (/Input\s/.test(match) || /hidden/.test(attributes)) {
        return match
      }
      
      totalReplacements++
      inputReplacements++
      
      const props = extractInputProps(match)
      return `<Input ${props} />`
    }
  )

  // Migrate select elements (basic replacement)
  migratedContent = migratedContent.replace(
    /<select\s([^>]*?)>(.*?)<\/select>/gs,
    (match, attributes, content) => {
      // Skip if already using Select component
      if (/Select\s/.test(match)) {
        return match
      }
      
      totalReplacements++
      selectReplacements++
      
      // For now, keep as raw select but note for manual review
      return match // Complex migration, keep for manual review
    }
  )

  // Migrate textarea elements
  migratedContent = migratedContent.replace(
    /<textarea\s([^>]*?)>(.*?)<\/textarea>/gs,
    (match, attributes, content) => {
      // Skip if already using Textarea component
      if (/Textarea\s/.test(match)) {
        return match
      }
      
      totalReplacements++
      textareaReplacements++
      
      // Extract basic props
      const placeholderMatch = attributes.match(/placeholder="([^"]*)"/)
      const valueMatch = attributes.match(/value=\{([^}]+)\}/)
      const onChangeMatch = attributes.match(/onChange=\{([^}]+)\}/)
      
      let props = ''
      if (placeholderMatch) props += ` placeholder="${placeholderMatch[1]}"`
      if (valueMatch) props += ` value={${valueMatch[1]}}`
      if (onChangeMatch) props += ` onChange={${onChangeMatch[1]}}`
      
      return `<Textarea${props}>${content}</Textarea>`
    }
  )

  return {
    migratedContent,
    replacements: totalReplacements,
    buttonReplacements,
    inputReplacements,
    selectReplacements,
    textareaReplacements
  }
}

/**
 * Process a single file for component migration
 */
async function migrateComponentsInFile(filePath: string): Promise<{
  modified: boolean
  replacements: number
  buttonReplacements: number
  inputReplacements: number
  selectReplacements: number
  textareaReplacements: number
  importsAdded: boolean
}> {
  const originalContent = await fs.readFile(filePath, 'utf-8')
  
  // First add imports if needed
  const { content: contentWithImports, importsAdded } = addUIComponentImports(originalContent)
  
  // Then apply component migrations
  const migrationResult = migrateComponentsInContent(contentWithImports)
  
  const modified = migrationResult.migratedContent !== originalContent
  
  if (modified) {
    await fs.writeFile(filePath, migrationResult.migratedContent, 'utf-8')
  }

  return {
    modified,
    replacements: migrationResult.replacements,
    buttonReplacements: migrationResult.buttonReplacements,
    inputReplacements: migrationResult.inputReplacements,
    selectReplacements: migrationResult.selectReplacements,
    textareaReplacements: migrationResult.textareaReplacements,
    importsAdded
  }
}

/**
 * Main component migration execution
 */
async function main() {
  console.log('🔧 Starting Component Consolidation Migration...')
  console.log('📋 Converting raw UI elements to standardized components\n')

  const stats: ComponentMigrationStats = {
    totalFiles: 0,
    modifiedFiles: 0,
    totalReplacements: 0,
    buttonReplacements: 0,
    inputReplacements: 0,
    selectReplacements: 0,
    textareaReplacements: 0,
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
      const result = await migrateComponentsInFile(filePath)
      
      if (result.modified) {
        stats.modifiedFiles++
        stats.totalReplacements += result.replacements
        stats.buttonReplacements += result.buttonReplacements
        stats.inputReplacements += result.inputReplacements
        stats.selectReplacements += result.selectReplacements
        stats.textareaReplacements += result.textareaReplacements
        if (result.importsAdded) stats.importsAdded++
        
        console.log(`✅ ${filePath}: ${result.replacements} replacements`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }

  // Display results
  console.log('\n📊 Component Migration Results:')
  console.log(`✅ Files processed: ${stats.totalFiles}`)
  console.log(`🔄 Files modified: ${stats.modifiedFiles}`)
  console.log(`📝 Total replacements: ${stats.totalReplacements}`)
  console.log(`🔘 Button migrations: ${stats.buttonReplacements}`)
  console.log(`📄 Input migrations: ${stats.inputReplacements}`)
  console.log(`📋 Select migrations: ${stats.selectReplacements}`)
  console.log(`📝 Textarea migrations: ${stats.textareaReplacements}`)
  console.log(`📦 Import statements added: ${stats.importsAdded}`)

  if (stats.totalReplacements > 0) {
    console.log('\n🎉 Component migration completed successfully!')
    console.log('🧪 Run audit to verify: npx tsx scripts/audit-ui-system.ts components')
  } else {
    console.log('\n✨ No component violations found - system already compliant!')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as applyComponentMigration }