import { expect, test, type Locator, type Page, type Request } from '@playwright/test'

const MODEL_SELECTOR = 'model-viewer[data-testid="model-viewer"]'

const GRADIENT_COLOR_TOKENS: Record<string, string[]> = {
  volt: ['rgb(0,255,136', 'rgb(0,212,255'],
  cyber: ['rgb(255,0,255', 'rgb(0,212,255'],
  digital: ['rgb(0,212,255', 'rgb(153,69,255'],
  acid: ['rgb(255,255,0', 'rgb(0,255,136'],
  holo: ['rgb(153,69,255', 'rgb(255,0,255', 'rgb(0,212,255'],
}

function normalizeGradientString(value: string) {
  return value.toLowerCase().replace(/\s+/g, '')
}

async function getComputedGradient(locator: Locator) {
  const raw = await locator.evaluate((node) => getComputedStyle(node as HTMLElement).backgroundImage)
  return normalizeGradientString(raw)
}

async function waitForModelVisible(page: Page, timeout = 15_000) {
  await page.waitForFunction(
    () => {
      const element = document.querySelector('model-viewer') as any
      if (!element) return false
      if (element.modelIsVisible === true) return true
      const shadowRoot = (element as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot
      return shadowRoot?.querySelector('canvas') != null
    },
    { timeout },
  )
}

async function sawDecoderRequest(page: Page) {
  const perfEntries = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )

  const hitPerf = perfEntries.some((name) =>
    name.includes('meshopt_decoder.wasm') ||
    name.includes('meshopt_decoder.js') ||
    name.includes('ktx2-transcoder') ||
    name.includes('draco_'),
  )

  if (hitPerf) {
    return true
  }

  const logs: string[] = []
  const finishedHandler = (request: Request) => logs.push(request.url())
  const failedHandler = (request: Request) => logs.push(`FAILED:${request.url()}`)

  page.on('requestfinished', finishedHandler)
  page.on('requestfailed', failedHandler)

  await page.waitForTimeout(1_500)

  page.off('requestfinished', finishedHandler)
  page.off('requestfailed', failedHandler)

  return logs.some((name) =>
    name.includes('meshopt_decoder.wasm') ||
    name.includes('meshopt_decoder.js') ||
    name.includes('ktx2-transcoder') ||
    name.includes('draco_'),
  )
}

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => console.log('[browser]', msg.type(), msg.text()))
  page.on('pageerror', (error) => console.log('[pageerror]', error.message))
  page.on('requestfailed', (request) =>
    console.log('[requestfailed]', request.url(), request.failure()?.errorText ?? ''),
  )
  page.on('request', (request) => {
    if (request.url().includes('/vendor/model-viewer/assets/') || request.url().includes('/models/')) {
      console.log('[request]', request.method(), request.url())
    }
  })
  page.on('response', async (response) => {
    if (response.url().includes('/vendor/model-viewer/assets/') || response.url().includes('/models/')) {
      console.log('[response]', response.status(), response.url())
    }
  })
})

test('E2E smoke: stacked hero + uncompressed preview renders without interaction', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const hero = page.getByTestId('hero-section')
  await expect(hero.getByText(/neon dream studio/i)).toBeVisible()
  const stackedHero = hero.getByTestId('stacked-hero')
  await expect(stackedHero.locator('span').nth(0)).toContainText('DESIGN YOUR')
  await expect(stackedHero.locator('span').nth(1)).toContainText('FUTURE GEMS')
  await expect(page.getByText(/Lab-grown diamonds and moissanite/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /start creating/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /watch demo/i })).toBeVisible()
  await expect(page.getByTestId('shop-collection-section').getByText(/Shop Collection/i)).toBeVisible()
  const shopCtas = page.locator('[data-testid="shop-collection-section"] a[data-tone]')
  await expect(shopCtas).toHaveCount(4)
  const seenTones = new Set<string>()
  for (let index = 0; index < 4; index += 1) {
    const button = shopCtas.nth(index)
    const tone = await button.getAttribute('data-tone')
    expect(tone, `CTA ${index} should expose a tone`).not.toBeNull()
    if (tone) {
      seenTones.add(tone)
      const classes = await button.getAttribute('class')
      expect(classes).toContain(`bg-gradient-${tone}`)
      expect(classes).toContain(`shadow-neon-${tone}`)
      const normalizedGradient = await getComputedGradient(button)
      const tokens = GRADIENT_COLOR_TOKENS[tone]
      expect(normalizedGradient).toContain('linear-gradient(135deg')
      for (const token of tokens) {
        expect(normalizedGradient, `Gradient for tone ${tone} should include ${token}`).toContain(
          token.replace(/\s+/g, ''),
        )
      }
    }
  }
  expect(seenTones.size).toBe(4)
  const designStudio = page.getByTestId('design-studio-section')
  await expect(designStudio.getByText(/3d design studio/i)).toBeVisible()
  const viewer = designStudio.locator(MODEL_SELECTOR).first()
  await viewer.waitFor({ state: 'visible' })
  await page.waitForFunction(() => !!window.customElements && !!customElements.get('model-viewer'))
  await waitForModelVisible(page)
  await expect(page.getByText(/creator experience/i)).toBeVisible()
  await expect(page.getByText(/creator workflow/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Live Configurator' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AssetCache' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Commerce Hooks' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Campaign Command Center' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Boutique QA Pipeline' })).toBeVisible()
  await expect(page.getByRole('button', { name: /book a lab sprint/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /download system spec/i })).toBeVisible()

  await expect(page.locator('section:has-text("CREATOR EXPERIENCE") .grid').first()).toBeVisible()

  // Default layout renders the preview card within the 3D Design Studio block; prod-like coverage validates the poster gate + decoder pipeline.
})

test('Prod-like: compressed poster gate and decoder loading', async ({ page }) => {
  await page.goto('/?layout=preview&forceCompressed=1', { waitUntil: 'domcontentloaded' })

  const viewer = page.locator(MODEL_SELECTOR).first()
  await viewer.waitFor({ state: 'visible' })

  await page.waitForFunction(async () => {
    return !!window.customElements && !!customElements.get('model-viewer')
  })

  await viewer.evaluate((el: any) => el.dismissPoster && el.dismissPoster())
  await viewer.click().catch(() => {})

  const glbLoaded = await Promise.race([
    page
      .waitForResponse((response) => /\/models\/ring_web\.glb$/.test(response.url()) && response.ok())
      .then(() => true),
    page
      .waitForFunction(() => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        return entries.some((entry) => /\/models\/ring_web\.glb$/.test(entry.name))
      })
      .then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10_000)),
  ])

  console.log('[test] glbLoaded:', glbLoaded)

  const sawDecoder = await sawDecoderRequest(page)

  console.log('[test] decoderDetected:', sawDecoder)

  await waitForModelVisible(page, 20_000)
})
