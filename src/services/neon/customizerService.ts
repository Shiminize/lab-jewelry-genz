import { z } from 'zod'
import type { GlbManifest, GlbVariant } from '@/features/customizer/types'
import { defaultCustomizerConfig } from '@/config/customizerDefaults'

const glbVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  src: z
    .string()
    .min(1)
    .refine((value) => value.startsWith('/') || value.startsWith('http'), {
      message: 'src must be an absolute URL or a public path',
    }),
  poster: z
    .string()
    .optional()
    .refine((value) => !value || value.startsWith('/') || value.startsWith('http'), {
      message: 'poster must be an absolute URL or a public path',
    }),
  environmentImage: z
    .string()
    .optional()
    .refine((value) => !value || value.startsWith('/') || value.startsWith('http'), {
      message: 'environmentImage must be an absolute URL or a public path',
    }),
  exposure: z.number().optional(),
  autoRotate: z.boolean().optional(),
  cameraControls: z.boolean().optional(),
  ar: z.boolean().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  tone: z.enum(['volt', 'cyan', 'magenta', 'lime']).optional(),
  defaultMaterialId: z.string().optional(),
  defaultSize: z.string().optional(),
})

const glbManifestSchema = z.object({
  variants: z.array(glbVariantSchema).default([]),
})

const materialOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  priceAdjustment: z.number(),
})

const customizerConfigSchema = z.object({
  materials: z.array(materialOptionSchema),
  basePrices: z.record(z.string(), z.number()),
})

export type CustomizerMaterialOption = z.infer<typeof materialOptionSchema>

export interface CustomizerPriceQuote {
  variantId: string
  materialId: string
  basePrice: number
  materialAdjustment: number
  total: number
  currency: 'USD'
}

export type CustomizerConfig = z.infer<typeof customizerConfigSchema>

let cachedCustomizerConfig: CustomizerConfig | null = null
const CUSTOMIZER_CONFIG_ENDPOINT = '/api/neon/customizer/config'

export type FetchGlbManifestOptions = {
  manifestPath?: string
  init?: RequestInit
  fetchImpl?: typeof fetch
}

export async function fetchGlbManifest({
  manifestPath = '/models/neon/manifest.json',
  init,
  fetchImpl = fetch,
}: FetchGlbManifestOptions = {}): Promise<GlbManifest> {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })

  if (init?.headers) {
    const incoming = new Headers(init.headers as HeadersInit)
    incoming.forEach((value, key) => headers.set(key, value))
  }

  const response = await fetchImpl(manifestPath, {
    cache: init?.cache ?? 'force-cache',
    ...init,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to load GLB manifest (${response.status})`)
  }

  const data = await response.json()
  const parsed = glbManifestSchema.parse(data)
  return parsed
}

export function getGlbVariant(manifest: GlbManifest, variantId: string): GlbVariant | undefined {
  return manifest.variants.find((variant) => variant.id === variantId)
}

export type FetchCustomizerConfigOptions = {
  endpoint?: string
  init?: RequestInit
  fetchImpl?: typeof fetch
  useCache?: boolean
}

export async function fetchCustomizerConfig({
  endpoint = CUSTOMIZER_CONFIG_ENDPOINT,
  init,
  fetchImpl = fetch,
  useCache = true,
}: FetchCustomizerConfigOptions = {}): Promise<CustomizerConfig> {
  if (useCache && cachedCustomizerConfig) {
    return cachedCustomizerConfig
  }

  try {
    const response = await fetchImpl(endpoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: init?.cache ?? 'no-store',
      ...init,
    })

    if (!response.ok) {
      throw new Error(`Failed to load customizer config (${response.status})`)
    }

    const payload = await response.json()
    const parsed = customizerConfigSchema.parse(payload?.data ?? payload)

    if (useCache) {
      cachedCustomizerConfig = parsed
    }

    return parsed
  } catch (error) {
    console.warn('Falling back to default customizer config', error)
    cachedCustomizerConfig = defaultCustomizerConfig
    return defaultCustomizerConfig
  }
}

export function listMaterialOptions(config?: CustomizerConfig): CustomizerMaterialOption[] {
  const source = config ?? cachedCustomizerConfig ?? defaultCustomizerConfig
  return source.materials
}

export function calculatePriceQuote(
  variantId: string,
  materialId: string,
  config?: CustomizerConfig,
): CustomizerPriceQuote {
  const source = config ?? cachedCustomizerConfig ?? defaultCustomizerConfig

  const basePrices = source.basePrices as Record<string, number>
  const basePrice = basePrices[variantId] ?? 0
  const material = source.materials.find((option) => option.id === materialId)
  const materialAdjustment = material?.priceAdjustment ?? 0

  return {
    variantId,
    materialId,
    basePrice,
    materialAdjustment,
    total: basePrice + materialAdjustment,
    currency: 'USD',
  }
}

export const manifestSchemas = {
  glbVariantSchema,
  glbManifestSchema,
}

export const customizerSchemas = {
  customizerConfigSchema,
  materialOptionSchema,
}
