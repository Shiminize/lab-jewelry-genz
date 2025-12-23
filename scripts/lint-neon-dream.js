#!/usr/bin/env node

/**
 * Neon Dream lint guardrail
 * Blocks regressions that reintroduce Aurora-era tokens or design hooks.
 */

const fs = require('node:fs')
const path = require('node:path')

const PROJECT_ROOT = process.cwd()
const SRC_DIR = path.join(PROJECT_ROOT, 'src')

const PATTERNS = [
  {
    key: 'aurora-token',
    regex: /--aurora-[a-z0-9-]+/i,
    message: 'Legacy Aurora design token detected. Extend Neon tokens instead.',
  },
  {
    key: 'aurora-class',
    regex: /aurora-[a-z0-9-]+/i,
    message: 'Legacy Aurora class detected. Replace with Neon primitives.',
  },
  {
    key: 'aurora-config',
    regex: /NEXT_PUBLIC_DEV_AURORA_TOGGLE/,
    message: 'Aurora feature flag referenced. Remove old toggles.',
  },
]

const includeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css'])
const ignoreDirs = new Set(['node_modules', '.next', 'test-results', 'playwright-report'])

let violationCount = 0

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) {
        continue
      }
      scanDirectory(fullPath)
      continue
    }

    const ext = path.extname(entry.name)
    if (!includeExtensions.has(ext)) {
      continue
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    PATTERNS.forEach((pattern) => {
      if (pattern.regex.test(content)) {
        violationCount += 1
        console.error(`❌ [${pattern.key}] ${pattern.message}\n   ↳ ${path.relative(PROJECT_ROOT, fullPath)}`)
      }
    })
  }
}

if (!fs.existsSync(SRC_DIR)) {
  console.error('src directory missing; cannot run Neon lint.')
  process.exit(1)
}

scanDirectory(SRC_DIR)

if (violationCount > 0) {
  console.error(`\nFound ${violationCount} Neon lint violation(s).`)
  process.exit(1)
}

console.log('✅ Neon lint passed. No Aurora-era references detected.')

