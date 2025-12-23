#!/usr/bin/env node

const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const http = require('http')
const { pathToFileURL } = require('url')
const sharp = require('sharp')
const puppeteer = require('puppeteer')

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const projectRoot = options.root

  const manifestPath = path.resolve(projectRoot, options.manifest)
  const manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'))

  const variants = manifest.variants ?? []
  if (variants.length === 0) {
    console.warn('[capture-glb-posters] No variants found in manifest.')
    return
  }

  const targetVariants = options.variant
    ? variants.filter((variant) => variant.id === options.variant)
    : variants

  if (targetVariants.length === 0) {
    throw new Error(`Variant ${options.variant} not found in manifest.`)
  }

  const staticServer = await startStaticServer(path.resolve(projectRoot, 'public'))
  options.assetBaseUrl = staticServer.baseUrl

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-file-access-from-files', '--enable-local-file-accesses', '--disable-web-security'],
    defaultViewport: {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.dpr,
    },
  })

  const modelViewerUrl = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'

  let updated = false

  try {
    for (const variant of targetVariants) {
      const captureOptions = resolveVariantOptions(options, variant.posterCapture)
      const result = await captureVariant({
        browser,
        projectRoot,
        variant,
        modelViewerUrl,
        options: captureOptions,
      })

      if (result) {
        variant.poster = result.publicPosterPath
        updated = true
        console.info(`[capture-glb-posters] Captured poster for ${variant.id} → ${result.publicPosterPath}`)
      }
    }
  } finally {
    await browser.close()
    await staticServer.close()
  }

  if (updated && options.updateManifest) {
    await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    console.info('[capture-glb-posters] Manifest updated.')
  }
}

async function captureVariant({ browser, projectRoot, variant, modelViewerUrl, options }) {
  const publicModelPath = assertString(variant.src, `Variant ${variant.id} is missing a src`) ?? ''
  const modelFile = resolvePublicPath(projectRoot, publicModelPath)

  if (!fs.existsSync(modelFile)) {
    console.warn(`[capture-glb-posters] Skipping ${variant.id}; missing GLB at ${modelFile}`)
    return null
  }

  const environmentFile = variant.environmentImage
    ? resolvePublicPath(projectRoot, variant.environmentImage)
    : null

  const posterInfo = computePosterPaths({ variant, options, projectRoot })
  fs.mkdirSync(path.dirname(posterInfo.absolutePosterPath), { recursive: true })

  const page = await browser.newPage()
  page.on('console', (message) => {
    if (options.verbose || message.type() === 'error' || message.type() === 'warning') {
      if (message.type() === 'error' && message.text().includes("Unexpected token 'export'")) {
        return
      }
      if (message.args().length) {
        Promise.all(
          message.args().map((handle) =>
            handle
              .evaluate((value) => {
                if (value && typeof value === 'object') {
                  return value.stack || value.message || JSON.stringify(value)
                }
                return value
              })
              .catch(() => handle.toString()),
          ),
        ).then((args) => {
          console.log(
            `[model-viewer] ${message.type().toUpperCase()} ${message.text()} ${args
              .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
              .join(' ')}`,
          )
        })
      } else {
        console.log(`[model-viewer] ${message.type().toUpperCase()} ${message.text()}`)
      }
    }
  })
  page.on('pageerror', (error) => {
    if (error.message && error.message.includes("Unexpected token 'export'")) {
      return
    }
    console.error(`[model-viewer] Page error: ${error.message}`)
  })
  page.on('requestfailed', (request) => {
    console.error(`[model-viewer] Request failed: ${request.url()} ${request.failure()?.errorText ?? ''}`)
  })
  await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor: options.dpr })

  const modelUrl = new URL(ensureLeadingSlash(publicModelPath), options.assetBaseUrl).href
  const environmentUrl = environmentFile && fs.existsSync(environmentFile)
    ? new URL(ensureLeadingSlash(variant.environmentImage), options.assetBaseUrl).href
    : ''

  const html = buildHtml({
    modelViewerUrl,
    modelUrl,
    environmentUrl,
    options,
  })

  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.waitForFunction('window.__posterReady === true', { timeout: options.timeout })

  const viewerHandle = await page.$('#poster-viewer')
  if (!viewerHandle) {
    throw new Error(`Failed to locate <model-viewer> element for variant ${variant.id}`)
  }

  const buffer = await viewerHandle.screenshot({
    omitBackground: options.background === 'transparent',
    type: 'png',
  })

  await viewerHandle.dispose()
  await page.close()

  let finalBuffer = buffer
  if (options.format === 'webp') {
    finalBuffer = await sharp(buffer).webp({ quality: options.quality }).toBuffer()
  } else if (options.format === 'png' && options.quality < 100) {
    finalBuffer = await sharp(buffer).png({ quality: options.quality }).toBuffer()
  }

  await fsp.writeFile(posterInfo.absolutePosterPath, finalBuffer)

  return posterInfo
}

function buildHtml({ modelViewerUrl, modelUrl, environmentUrl, options }) {
  const attrs = [
    `src="${modelUrl}"`,
    `camera-orbit="${options.cameraOrbit}"`,
    `camera-target="${options.cameraTarget}"`,
    `exposure="${options.exposure}"`,
    'meshopt-decoder-location="https://unpkg.com/meshoptimizer@0.21.0/meshopt_decoder.module.js?module"',
    'disable-zoom',
    'interaction-prompt-threshold="0"',
    'shadow-intensity="1"',
    'shadow-softness="0.8"',
  ]

  if (options.cameraFov) {
    attrs.push(`field-of-view="${options.cameraFov}"`)
  }

  if (environmentUrl) {
    attrs.push(`environment-image="${environmentUrl}"`)
  }

  if (options.autoRotate) {
    attrs.push('auto-rotate')
  }

  if (options.cameraControls) {
    attrs.push('camera-controls')
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: ${options.background};
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      model-viewer {
        width: 100%;
        height: 100%;
        background: transparent;
      }
    </style>
    <script type="module">
      import { MeshoptDecoder } from 'https://unpkg.com/meshoptimizer@0.21.0/meshopt_decoder.module.js?module'
      self.MeshoptDecoder = MeshoptDecoder
      self.ModelViewerElement = self.ModelViewerElement || {}
      self.ModelViewerElement.meshoptDecoderLocation = 'https://unpkg.com/meshoptimizer@0.21.0/meshopt_decoder.module.js?module'
      self.ModelViewerElement.kTx2TranscoderLocation = 'https://unpkg.com/@google/model-viewer@4.1.0/dist/libs/'
    </script>
    <script type="module" src="${modelViewerUrl}"></script>
  </head>
  <body>
    <model-viewer id="poster-viewer" ${attrs.join(' ')}></model-viewer>
    <script>
      window.addEventListener('error', (event) => {
        console.error('window-error', event.message, event.error?.stack)
      })
      window.addEventListener('unhandledrejection', (event) => {
        console.error('unhandled-rejection', event.reason)
      })
      const viewer = document.getElementById('poster-viewer')
      viewer.addEventListener('load', () => {
        viewer.updateComplete.then(() => {
          viewer.jumpCameraToGoal()
          setTimeout(() => {
            window.__posterReady = true
          }, ${options.settleMS})
        })
      }, { once: true })
    </script>
  </body>
</html>`
}

function computePosterPaths({ variant, options, projectRoot }) {
  const existingPoster = typeof variant.poster === 'string' && variant.poster.trim().length > 0 ? variant.poster.trim() : ''
  let publicPosterPath

  if (existingPoster && !options.outputDir) {
    const normalized = ensureLeadingSlash(existingPoster)
    const ext = path.posix.extname(normalized)
    if (ext && ext.toLowerCase() !== `.${options.format}`) {
      publicPosterPath = `${normalized.slice(0, -ext.length)}.${options.format}`
    } else {
      publicPosterPath = normalized
    }
  } else {
    const baseDir = options.outputDir
      ? ensureLeadingSlash(options.outputDir)
      : ensureLeadingSlash(`/images/products/${variant.id}`)
    const trimmedDir = baseDir === '/' ? '/' : baseDir.replace(/\/$/, '')
    const fileName = `poster.${options.format}`
    publicPosterPath = trimmedDir === '/' ? `/${fileName}` : path.posix.join(trimmedDir, fileName)
  }

  const absolutePosterPath = path.join(projectRoot, 'public', publicPosterPath.replace(/^\//, ''))

  return { publicPosterPath, absolutePosterPath }
}

function ensureLeadingSlash(value) {
  if (!value) return '/'
  const normalized = value.replace(/\\/g, '/').replace(/\/$/, '')
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

function resolvePublicPath(projectRoot, publicPath) {
  const relative = publicPath.replace(/^\//, '')
  return path.resolve(projectRoot, 'public', relative)
}

const VARIANT_OPTION_KEYS = new Set([
  'width',
  'height',
  'dpr',
  'background',
  'cameraOrbit',
  'cameraTarget',
  'cameraFov',
  'exposure',
  'settleMS',
  'timeout',
  'format',
  'quality',
  'autoRotate',
  'cameraControls',
  'outputDir',
])

function resolveVariantOptions(baseOptions, variantOverrides) {
  if (!variantOverrides || typeof variantOverrides !== 'object') {
    return { ...baseOptions }
  }

  const merged = { ...baseOptions }
  for (const [key, value] of Object.entries(variantOverrides)) {
    if (VARIANT_OPTION_KEYS.has(key)) {
      merged[key] = value
    }
  }
  return merged
}

function assertString(value, message) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(message)
  }
  return value
}

function parseArgs(argv) {
  const defaults = {
    manifest: 'public/models/neon/manifest.json',
    width: 1024,
    height: 1024,
    dpr: 1,
    background: 'transparent',
    cameraOrbit: '45deg 75deg 2m',
    cameraTarget: '0m 0m 0m',
    cameraFov: '',
    exposure: 1,
    settleMS: 150,
    timeout: 30000,
    format: 'webp',
    quality: 90,
    autoRotate: false,
    cameraControls: false,
    updateManifest: true,
    root: path.resolve(__dirname, '..'),
    outputDir: '',
    variant: '',
    verbose: false,
  }

  const parsed = Object.assign({}, defaults)

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]

    switch (key) {
      case 'manifest':
      case 'output-dir':
      case 'variant':
      case 'camera-orbit':
      case 'camera-target':
      case 'camera-fov':
      case 'background':
      case 'format':
        parsed[camelize(key)] = next
        i += 1
        break
      case 'width':
      case 'height':
      case 'dpr':
      case 'exposure':
      case 'settle-ms':
      case 'timeout':
      case 'quality':
        parsed[camelize(key)] = Number(next)
        i += 1
        break
      case 'auto-rotate':
      case 'camera-controls':
      case 'no-update-manifest':
        parsed[camelize(key)] = true
        break
      case 'verbose':
        parsed.verbose = true
        break
      default:
        break
    }
  }

  if (parsed.noUpdateManifest) {
    parsed.updateManifest = false
  }

  if (!['png', 'webp'].includes(parsed.format)) {
    throw new Error(`Unsupported format: ${parsed.format}`)
  }

  return parsed
}

function camelize(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

async function startStaticServer(rootDir) {
  await fsp.access(rootDir)

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost')
        const filePath = path.join(rootDir, decodeURIComponent(url.pathname.replace(/^\//, '')))

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404)
          res.end('Not found')
          return
        }

        res.writeHead(200, {
          'Content-Type': getMimeType(path.extname(filePath)),
          'Access-Control-Allow-Origin': '*',
        })

        fs.createReadStream(filePath).pipe(res)
      } catch (error) {
        res.writeHead(500)
        res.end('Server error')
        console.error('[capture-glb-posters] Static server error:', error)
      }
    })

    server.once('error', reject)

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()))
          }),
      })
    })
  })
}

function getMimeType(ext) {
  switch (ext.toLowerCase()) {
    case '.glb':
      return 'model/gltf-binary'
    case '.hdr':
      return 'application/octet-stream'
    case '.gltf':
      return 'model/gltf+json'
    case '.webp':
      return 'image/webp'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.ktx':
    case '.ktx2':
      return 'image/ktx2'
    default:
      return 'application/octet-stream'
  }
}

main().catch((error) => {
  console.error('[capture-glb-posters] Failed:', error)
  process.exitCode = 1
})
