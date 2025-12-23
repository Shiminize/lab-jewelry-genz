#!/usr/bin/env node
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PLATFORM = `${process.platform}-${process.arch}`
const TOOLS_BIN = path.resolve(__dirname, '..', 'tools', 'bin', PLATFORM)
let warnedFallback = false

function parseArgs() {
  const args = process.argv.slice(2)
  const options = { capturePosters: true }

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i]
    if (!key.startsWith('--')) {
      throw new Error(`Unexpected argument format: ${key}`)
    }

    switch (key) {
      case '--input':
        options.input = args[++i]
        break
      case '--output':
        options.output = args[++i]
        break
      case '--manifest':
        options.manifest = args[++i]
        break
      case '--no-posters':
        options.capturePosters = false
        break
      case '--capture-posters':
        options.capturePosters = true
        break
      default:
        throw new Error(`Unknown argument ${key}`)
    }
  }

  if (!options.input || !options.output) {
    throw new Error(
      'Usage: node scripts/glb-pack.js --input <dir> --output <dir> [--manifest <file>] [--no-posters]',
    )
  }

  options.manifest = options.manifest || path.join(options.output, 'manifest.json')
  return options
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function collectGlbFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectGlbFiles(fullPath))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) {
      files.push(fullPath)
    }
  }
  return files
}

function resolveGltfpackBinary() {
  const nativeBinary = path.join(TOOLS_BIN, 'gltfpack')
  if (fs.existsSync(nativeBinary)) {
    return { binary: nativeBinary, native: true }
  }
  return { binary: 'npx', native: false }
}

function runGltfpack(inputPath, outputPath) {
  const { binary, native } = resolveGltfpackBinary()
  const args = ['-i', inputPath, '-o', outputPath, '-cc', '-kn', '-km']

  const env = { ...process.env }

  if (native) {
    const toktxPath = path.join(TOOLS_BIN, 'toktx')
    if (!fs.existsSync(toktxPath)) {
      console.warn('⚠️ toktx binary not found in tools/bin. Texture compression will likely fail.')
    } else {
      env.PATH = `${TOOLS_BIN}${path.delimiter}${env.PATH || ''}`
    }
    args.push('-tc')
  }

  const spawnArgs = native ? args : ['gltfpack', ...args.filter((arg) => arg !== '-tc')]

  if (!native && !warnedFallback) {
    console.warn('⚠️ Using npx gltfpack fallback (no native binary detected). Install via `npm run setup:3d-tools` for full compression support.')
    warnedFallback = true
  }

  const result = spawnSync(binary, spawnArgs, {
    stdio: 'inherit',
    env,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`gltfpack exited with code ${result.status}`)
  }
}

function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { variants: [] }
  }
  const raw = fs.readFileSync(manifestPath, 'utf8')
  return JSON.parse(raw)
}

function saveManifest(manifestPath, manifest) {
  ensureDir(path.dirname(manifestPath))
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

function runPosterCapture(manifestPath) {
  const captureScript = path.resolve(__dirname, 'capture-glb-posters.js')
  if (!fs.existsSync(captureScript)) {
    console.warn('⚠️ Poster capture script not found; skipping poster generation.')
    return
  }

  const result = spawnSync(process.execPath, [captureScript, '--manifest', manifestPath], {
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error('Poster capture failed. Rerun with --no-posters to skip if needed.')
  }
}

function main() {
  const { input, output, manifest, capturePosters } = parseArgs()

  if (!fs.existsSync(input)) {
    console.error(`Input directory "${input}" does not exist.`)
    process.exit(1)
  }

  ensureDir(output)

  const sourceFiles = collectGlbFiles(input)
  if (sourceFiles.length === 0) {
    console.warn(`No .glb files found in ${input}.`)
    saveManifest(manifest, { variants: [] })
    return
  }

  const manifestData = loadManifest(manifest)
  const variantMap = new Map(manifestData.variants.map((variant) => [variant.id, variant]))

  for (const filePath of sourceFiles) {
    const parsed = path.parse(filePath)
    const baseName = parsed.name.replace(/\.raw$/i, '')
    const slug = slugify(baseName)
    const outputPath = path.join(output, `${slug}.glb`)

    console.log(`
Packing ${filePath} → ${outputPath}`)
    runGltfpack(filePath, outputPath)

    const publicPath = '/' + path.relative('public', outputPath).replace(/\\/g, '/')

    const previous = variantMap.get(slug) || {}
    variantMap.set(slug, {
      ...previous,
      id: slug,
      name: titleCase(slug),
      src: publicPath,
      autoRotate: previous.autoRotate ?? true,
      cameraControls: previous.cameraControls ?? true,
      exposure: previous.exposure ?? 1,
    })
  }

  const variants = Array.from(variantMap.values()).sort((a, b) => a.id.localeCompare(b.id))
  saveManifest(manifest, { variants })

  console.log(`
Packed ${sourceFiles.length} model(s). Manifest saved to ${manifest}.`)

  if (capturePosters) {
    console.log('\nCapturing GLB posters…')
    runPosterCapture(manifest)
  } else {
    console.log('Poster capture skipped (flagged with --no-posters).')
  }

  console.log('Reminder: verify HDR environment maps and media assets remain current.')
}

try {
  main()
} catch (error) {
  console.error('\nGLB packing failed:', error.message || error)
  console.error('Ensure gltfpack is installed. Run `npm run setup:3d-tools` or install the binaries manually.')
  process.exit(1)
}
