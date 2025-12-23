#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const https = require('https')
const { spawnSync } = require('child_process')

const PLATFORM = `${process.platform}-${process.arch}`
const TOOLS_ROOT = path.resolve(__dirname, '..', 'tools')
const CACHE_DIR = path.join(TOOLS_ROOT, 'cache', PLATFORM)
const EXTRACT_DIR = path.join(TOOLS_ROOT, 'tmp', PLATFORM)
const BIN_DIR = path.join(TOOLS_ROOT, 'bin', PLATFORM)

const ARTIFACTS = {
  'darwin-arm64': {
    gltfpack: {
      url: process.env.GLTFPACK_URL || 'https://github.com/zeux/meshoptimizer/releases/download/v0.25/gltfpack-macos.zip',
      archiveName: 'gltfpack.zip',
    },
    toktx: null, // Recommend Homebrew install; no simple archive is published
  },
  'darwin-x64': {
    gltfpack: {
      url: process.env.GLTFPACK_URL || 'https://github.com/zeux/meshoptimizer/releases/download/v0.25/gltfpack-macos-intel.zip',
      archiveName: 'gltfpack.zip',
    },
    toktx: null,
  },
  'linux-x64': {
    gltfpack: {
      url: process.env.GLTFPACK_URL || 'https://github.com/zeux/meshoptimizer/releases/download/v0.25/gltfpack-ubuntu.zip',
      archiveName: 'gltfpack.zip',
    },
    toktx: {
      url: process.env.TOKTX_URL || 'https://github.com/KhronosGroup/KTX-Software/releases/download/v4.4.0/KTX-Software-4.4.0-Linux-x86_64.tar.bz2',
      archiveName: 'toktx.tar.bz2',
    },
  },
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const attempt = (currentUrl, redirectsLeft = 5) => {
      if (redirectsLeft <= 0) {
        reject(new Error(`Too many redirects downloading ${url}`))
        return
      }

      https
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            attempt(res.headers.location, redirectsLeft - 1)
            res.resume()
            return
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download ${url} (status ${res.statusCode})`))
            res.resume()
            return
          }

          const file = fs.createWriteStream(dest)
          res.pipe(file)
          file.on('finish', () => {
            file.close(resolve)
          })
          file.on('error', reject)
        })
        .on('error', reject)
    }

    attempt(url)
  })
}

function extract(archivePath, destination) {
  ensureDir(destination)
  if (archivePath.endsWith('.zip')) {
    const result = spawnSync('unzip', ['-o', archivePath, '-d', destination], { stdio: 'inherit' })
    if (result.status !== 0) {
      throw new Error(`Failed to unzip ${archivePath}`)
    }
  } else if (archivePath.endsWith('.tgz') || archivePath.endsWith('.tar.gz')) {
    const result = spawnSync('tar', ['-xzf', archivePath, '-C', destination], { stdio: 'inherit' })
    if (result.status !== 0) {
      throw new Error(`Failed to extract ${archivePath}`)
    }
  } else if (archivePath.endsWith('.tar.bz2')) {
    const result = spawnSync('tar', ['-xjf', archivePath, '-C', destination], { stdio: 'inherit' })
    if (result.status !== 0) {
      throw new Error(`Failed to extract ${archivePath}`)
    }
  } else {
    throw new Error(`Unsupported archive format: ${archivePath}`)
  }
}

function findBinary(root, filename) {
  const entries = fs.readdirSync(root, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) {
      const found = findBinary(full, filename)
      if (found) return found
    } else if (entry.isFile() && entry.name === filename) {
      return full
    }
  }
  return null
}

async function main() {
  if (!ARTIFACTS[PLATFORM]) {
    console.error(`No preconfigured artifacts for platform ${PLATFORM}. Set GLTFPACK_URL/TOKTX_URL env vars.`)
    process.exit(1)
  }

  ensureDir(CACHE_DIR)
  ensureDir(EXTRACT_DIR)
  ensureDir(BIN_DIR)

  const tasks = ARTIFACTS[PLATFORM]

  for (const [tool, meta] of Object.entries(tasks)) {
    if (!meta) {
      console.warn(`⚠️ No packaged binary configured for ${tool} on ${PLATFORM}. Install manually if needed.`)
      continue
    }
    const cachePath = path.join(CACHE_DIR, meta.archiveName)
    console.log(`\n📦 Downloading ${tool} for ${PLATFORM}`)
    await download(meta.url, cachePath)

    const toolExtractDir = path.join(EXTRACT_DIR, tool)
    if (fs.existsSync(toolExtractDir)) {
      fs.rmSync(toolExtractDir, { recursive: true, force: true })
    }
    extract(cachePath, toolExtractDir)

    const binaryName = tool === 'gltfpack' ? 'gltfpack' : 'toktx'
    const sourceBinary = findBinary(toolExtractDir, binaryName)
    if (!sourceBinary) {
      throw new Error(`Unable to locate ${binaryName} inside ${cachePath}`)
    }

    const destBinary = path.join(BIN_DIR, binaryName)
    fs.copyFileSync(sourceBinary, destBinary)
    fs.chmodSync(destBinary, 0o755)
    console.log(`✅ Installed ${binaryName} → ${destBinary}`)
  }

  console.log(`\nAll tools installed. Update PATH or rely on scripts/glb-pack.js to use ${BIN_DIR}.`)
}

main().catch((error) => {
  console.error(`\nFailed to install GLB tooling: ${error.message || error}`)
  process.exit(1)
})
