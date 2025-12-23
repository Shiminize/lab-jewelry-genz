#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'src')
const ALLOWED_FILES = new Set([
  path.join(ROOT, 'app/styles/tokens.css'),
  path.join(ROOT, 'src/app/globals.css'),
])
const FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'])
const HEX_PATTERN = /#[0-9a-fA-F]{3,6}\b/g
const RGBA_PATTERN = /rgba\s*\(/gi

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walk(fullPath)
      }
      if (entry.isFile() && shouldCheck(fullPath)) {
        return [fullPath]
      }
      return []
    }),
  )
  return files.flat()
}

function shouldCheck(filePath) {
  if (!filePath.startsWith(SRC_DIR)) return false
  const ext = path.extname(filePath)
  return FILE_EXTENSIONS.has(ext) && !ALLOWED_FILES.has(filePath)
}

function findViolations(content, pattern) {
  const violations = []
  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      violations.push({ line: index + 1, snippet: line.trim() })
    }
    pattern.lastIndex = 0
  })
  return violations
}

async function main() {
  const files = await walk(SRC_DIR)
  const issues = []

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const hexMatches = findViolations(content, new RegExp(HEX_PATTERN))
    const rgbaMatches = findViolations(content, new RegExp(RGBA_PATTERN))

    if (hexMatches.length || rgbaMatches.length) {
      issues.push({
        file,
        hex: hexMatches,
        rgba: rgbaMatches,
      })
    }
  }

  if (issues.length > 0) {
    console.error('Design token guard: raw color values detected outside approved files.\n')
    issues.forEach(({ file, hex, rgba }) => {
      if (hex.length) {
        hex.forEach((hit) => {
          console.error(`${path.relative(ROOT, file)}:${hit.line} – Hard-coded hex "${hit.snippet}"`)
        })
      }
      if (rgba.length) {
        rgba.forEach((hit) => {
          console.error(`${path.relative(ROOT, file)}:${hit.line} – Disallowed rgba usage "${hit.snippet}"`)
        })
      }
    })
    console.error('\nMove colors into app/styles/tokens.css or reference existing CSS variables.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Failed to run design token guard:', error)
  process.exit(1)
})
