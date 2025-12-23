'use client'

import { useEffect, useState } from 'react'
import type { GlbVariant } from '../types'
import { fetchGlbManifest, getGlbVariant } from '@/services/neon/customizerService'

const MANIFEST_URL = '/models/neon/manifest.json'

interface UseGlbVariantState {
  variant?: GlbVariant
  variants: GlbVariant[]
  isLoading: boolean
  error?: string
}

export function useGlbVariant(variantId: string, reloadKey = 0): UseGlbVariantState {
  const [state, setState] = useState<UseGlbVariantState>({
    variant: undefined,
    variants: [],
    isLoading: true,
    error: undefined,
  })

  useEffect(() => {
    let mounted = true

    async function loadVariant() {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }))

      try {
        const manifest = await fetchGlbManifest({
          manifestPath: MANIFEST_URL,
          init: { cache: 'force-cache' },
        })
        const variants = manifest.variants ?? []
        const variant = getGlbVariant(manifest, variantId) ?? variants[0]

        if (mounted) {
          setState((prev) => ({
            ...prev,
            variant,
            variants,
            isLoading: false,
          }))
        }
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            variant: undefined,
            variants: prev.variants,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown GLB manifest error',
          }))
        }
      }
    }

    loadVariant()

    return () => {
      mounted = false
    }
  }, [variantId, reloadKey])

  return state
}
