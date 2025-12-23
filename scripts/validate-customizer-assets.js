#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'models', 'neon', 'manifest.json')
const SIZE_BUDGET_BYTES = 5 * 1024 * 1024 // 5MB hard cap

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Customizer manifest not found at ${MANIFEST_PATH}`)
  process.exit(1)
}

const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf8')
let manifest
try {
  manifest = JSON.parse(manifestRaw)
} catch (error) {
  console.error('Failed to parse customizer manifest JSON:', error.message)
  process.exit(1)
}

const warnings = []
const errors = []
const remoteAllowlist = new Set(['astro-demo'])
const STALE_ASSET_MAX_AGE_DAYS = 90
const STALE_THRESHOLD_MS = STALE_ASSET_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

function isRemote(value) {
  return /^https?:\/\//i.test(value)
}

function ensureLeadingSlash(value) {
  return value.startsWith('/') ? value : `/${value}`
}

function resolvePublicPath(publicPath) {
  return path.join(PUBLIC_DIR, publicPath.replace(/^\//, ''))
}

function recordError(message) {
  errors.push(message)
}

function recordWarning(message) {
  warnings.push(message)
}

function checkAsset(variant, field, { required = true, sizeBudget, allowRemote = false }) {
  const value = variant[field]
  const label = `${variant.id}.${field}`

  if (!value) {
    if (required) {
      recordError(`${label} is missing`)
    }
    return
  }

  if (isRemote(value)) {
    if (allowRemote || remoteAllowlist.has(variant.id)) {
      return
    }
    recordWarning(`${label} points to a remote URL (${value}). Move it into /public to satisfy offline builds.`)
    return
  }

  const normalized = ensureLeadingSlash(value)
  const absolutePath = resolvePublicPath(normalized)

  if (!fs.existsSync(absolutePath)) {
    recordError(`${label} file not found at ${absolutePath}`)
    return
  }

  const stats = fs.statSync(absolutePath)

  if (sizeBudget && stats.size > sizeBudget) {
    recordWarning(`${label} exceeds ${Math.round(sizeBudget / (1024 * 1024))}MB budget (${(stats.size / (1024 * 1024)).toFixed(2)}MB).`)
  }

  if ((field === 'poster' || field === 'environmentImage') && Date.now() - stats.mtimeMs > STALE_THRESHOLD_MS) {
    const ageDays = Math.floor((Date.now() - stats.mtimeMs) / (24 * 60 * 60 * 1000))
    recordWarning(`${label} is ${ageDays} days old. Re-export posters/HDR maps at least every ${STALE_ASSET_MAX_AGE_DAYS} days to keep fidelity.`)
  }
}

if (!Array.isArray(manifest.variants) || manifest.variants.length === 0) {
  recordError('Manifest contains no variants.')
}

for (const variant of manifest.variants ?? []) {
  if (!variant.id) {
    recordError('Variant is missing an id.')
    continue
  }

  checkAsset(variant, 'src', { required: true, sizeBudget: SIZE_BUDGET_BYTES })
  checkAsset(variant, 'poster', { required: true })
  checkAsset(variant, 'marketingImage', { required: true })
  checkAsset(variant, 'environmentImage', { required: true })
}

if (warnings.length > 0) {
  console.warn('\nCustomizer asset validation warnings:')
  for (const warning of warnings) {
    console.warn(`- ${warning}`)
  }
}

if (errors.length > 0) {
  console.error('\nCustomizer asset validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Customizer asset validation passed.')
