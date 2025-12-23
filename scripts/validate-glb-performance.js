#!/usr/bin/env node
/**
 * Neon Dream GLB Performance Validator
 * ------------------------------------
 * Inspect the manifest-driven GLB variants and ensure they meet
 * the size constraints required for fast streaming in the customizer.
 *
 * Usage:
 *   node scripts/validate-glb-performance.js \
 *     --manifest public/models/neon/manifest.json \
 *     --max-mb 5 --warn-mb 4
 */

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const options = {
    manifest: 'public/models/neon/manifest.json',
    maxMb: 5,
    warnMb: 4,
  }

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const value = argv[i + 1]

    if (key === '--manifest' && value) {
      options.manifest = value
      i += 1
    } else if (key === '--max-mb' && value) {
      options.maxMb = Number(value)
      i += 1
    } else if (key === '--warn-mb' && value) {
      options.warnMb = Number(value)
      i += 1
    } else if (key.startsWith('--')) {
      throw new Error(`Unknown option: ${key}`)
    }
  }

  if (Number.isNaN(options.maxMb) || options.maxMb <= 0) {
    throw new Error(`Invalid value for --max-mb: ${options.maxMb}`)
  }

  if (Number.isNaN(options.warnMb) || options.warnMb <= 0) {
    throw new Error(`Invalid value for --warn-mb: ${options.warnMb}`)
  }

  if (options.warnMb >= options.maxMb) {
    options.warnMb = Math.max(0, options.maxMb - 0.5)
  }

  return options
}

function loadManifest(manifestPath) {
  const fullPath = path.resolve(process.cwd(), manifestPath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Manifest not found at ${manifestPath}`)
  }

  const payload = fs.readFileSync(fullPath, 'utf8')
  const parsed = JSON.parse(payload)

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.variants)) {
    throw new Error('Manifest must contain a "variants" array')
  }

  return { manifest: parsed, manifestPath: fullPath }
}

function resolvePublicPath(srcPath) {
  const relative = srcPath.replace(/^\//, '')
  return path.resolve(process.cwd(), 'public', relative)
}

function formatMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100
}

function validateVariants(manifest, thresholds) {
  const results = []
  let failureCount = 0
  let warningCount = 0

  for (const variant of manifest.variants) {
    const record = {
      id: variant.id,
      src: variant.src,
      status: 'ok',
      sizeMb: null,
      notes: [],
    }

    if (!variant.src) {
      record.status = 'fail'
      record.notes.push('missing src')
      failureCount += 1
      results.push(record)
      continue
    }

    const isRemote = /^https?:\/\//i.test(variant.src)

    if (isRemote) {
      record.notes.push('remote asset – size validation skipped')
      results.push(record)
      continue
    }

    const absolutePath = resolvePublicPath(variant.src)

    if (!fs.existsSync(absolutePath)) {
      record.status = 'fail'
      record.notes.push('file missing in public directory')
      failureCount += 1
      results.push(record)
      continue
    }

    const { size } = fs.statSync(absolutePath)
    const sizeMb = formatMb(size)
    record.sizeMb = sizeMb

    if (sizeMb > thresholds.maxMb) {
      record.status = 'fail'
      record.notes.push(`exceeds ${thresholds.maxMb}MB budget`)
      failureCount += 1
    } else if (sizeMb > thresholds.warnMb) {
      record.status = 'warn'
      record.notes.push(`above ${thresholds.warnMb}MB warning threshold`)
      warningCount += 1
    }

    if (!variant.poster) {
      record.notes.push('missing poster')
    }

    if (!variant.environmentImage) {
      record.notes.push('missing environmentImage')
    }

    results.push(record)
  }

  return { results, failureCount, warningCount }
}

function printReport(header, results) {
  console.log(`\n${header}`)
  console.log('-'.repeat(header.length))
  for (const entry of results) {
    const sizeDisplay = entry.sizeMb != null ? `${entry.sizeMb.toFixed(2)}MB` : 'n/a'
    const notes = entry.notes.length ? entry.notes.join('; ') : '—'
    const statusIcon = entry.status === 'fail' ? '❌' : entry.status === 'warn' ? '⚠️' : '✅'
    console.log(`${statusIcon} ${entry.id.padEnd(24)} ${sizeDisplay.padStart(8)}  ${notes}`)
  }
  console.log('')
}

function main() {
  try {
    const options = parseArgs(process.argv)
    const { manifest } = loadManifest(options.manifest)

    if (manifest.variants.length === 0) {
      console.warn('Manifest has no variants to validate.')
      return
    }

    const { results, failureCount, warningCount } = validateVariants(manifest, {
      maxMb: options.maxMb,
      warnMb: options.warnMb,
    })

    printReport('GLB Variant Performance', results)

    if (failureCount > 0) {
      console.error(`❌ ${failureCount} variant(s) exceed the ${options.maxMb}MB budget or are missing assets.`)
      process.exit(1)
    }

    if (warningCount > 0) {
      console.warn(`⚠️ ${warningCount} variant(s) exceed ${options.warnMb}MB. Consider re-running gltfpack for tighter compression.`)
    } else {
      console.log('✅ All local GLB assets are within the defined performance budget.')
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()
