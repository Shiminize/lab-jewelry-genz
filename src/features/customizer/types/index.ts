import type { CatalogTone } from '@/config/catalogDefaults'

export interface GlbVariant {
  id: string
  name: string
  src: string
  poster?: string
  environmentImage?: string
  exposure?: number
  autoRotate?: boolean
  cameraControls?: boolean
  tagline?: string
  description?: string
  highlights?: string[]
  tone?: CatalogTone
  defaultMaterialId?: string
  defaultSize?: string
}

export interface GlbManifest {
  variants: GlbVariant[]
}
