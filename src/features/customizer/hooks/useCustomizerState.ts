'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  calculatePriceQuote,
  fetchCustomizerConfig,
  listMaterialOptions,
  type CustomizerConfig,
  type CustomizerMaterialOption,
  type CustomizerPriceQuote,
} from '@/services/neon/customizerService'
import { useGlbVariant } from './useGlbVariant'
import type { GlbVariant } from '../types'

export interface CustomizerState {
  variants: GlbVariant[]
  variant?: GlbVariant
  materialOptions: CustomizerMaterialOption[]
  priceQuote?: CustomizerPriceQuote
  selectedVariantId?: string
  selectedMaterialId?: string
  isLoading: boolean
  error?: string
  selectVariant: (variantId: string) => void
  selectMaterial: (materialId: string) => void
  retry: () => void
}

export function useCustomizerState(initialVariantId = 'astro-demo'): CustomizerState {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(initialVariantId)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>(undefined)
  const [reloadKey, setReloadKey] = useState(0)
  const [configReloadKey, setConfigReloadKey] = useState(0)
  const [config, setConfig] = useState<CustomizerConfig | null>(null)
  const [materialOptions, setMaterialOptions] = useState<CustomizerMaterialOption[]>([])
  const [configError, setConfigError] = useState<string | undefined>(undefined)
  const [isConfigLoading, setIsConfigLoading] = useState(true)

  const { variant, variants, isLoading: isVariantLoading, error: variantError } = useGlbVariant(
    selectedVariantId ?? initialVariantId,
    reloadKey,
  )

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      setIsConfigLoading(true)
      try {
        const config = await fetchCustomizerConfig({ useCache: configReloadKey === 0 })
        if (cancelled) return
        setConfig(config)
        const options = listMaterialOptions(config)
        setMaterialOptions(options)
        setConfigError(undefined)
        setSelectedMaterialId((current) => {
          if (current && options.some((option) => option.id === current)) {
            return current
          }
          return options[0]?.id ?? current
        })
      } catch (error) {
        if (cancelled) return
        console.error('Failed to load customizer config', error)
        setConfig(null)
        const fallback = listMaterialOptions()
        setMaterialOptions(fallback)
        setConfigError(error instanceof Error ? error.message : 'Failed to load customizer configuration')
        setSelectedMaterialId((current) => {
          if (current && fallback.some((option) => option.id === current)) {
            return current
          }
          return fallback[0]?.id ?? current
        })
      } finally {
        if (!cancelled) {
          setIsConfigLoading(false)
        }
      }
    }

    void loadConfig()

    return () => {
      cancelled = true
    }
  }, [configReloadKey])

  useEffect(() => {
    if (!variant && variants.length > 0) {
      const fallbackId = variants[0]?.id
      if (fallbackId) {
        setSelectedVariantId(fallbackId)
      }
    }
  }, [variant, variants])

  useEffect(() => {
    if (!variant) return

    if (variant.defaultMaterialId) {
      setSelectedMaterialId((current) => {
        if (current && current === variant.defaultMaterialId) {
          return current
        }
        if (materialOptions.some((option) => option.id === variant.defaultMaterialId)) {
          return variant.defaultMaterialId
        }
        return current
      })
    }
  }, [variant, materialOptions])

  const activeVariantId = variant?.id ?? selectedVariantId ?? initialVariantId

  const priceQuote = useMemo(() => {
    if (!selectedMaterialId) {
      return undefined
    }
    return calculatePriceQuote(activeVariantId, selectedMaterialId, config ?? undefined)
  }, [activeVariantId, selectedMaterialId, config])

  const selectVariant = useCallback((variantId: string) => {
    setSelectedVariantId(variantId)
  }, [])

  const selectMaterial = useCallback((materialId: string) => {
    setSelectedMaterialId(materialId)
  }, [])

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
    setConfigReloadKey((value) => value + 1)
  }, [])

  return {
    variants,
    variant,
    materialOptions,
    priceQuote,
    selectedVariantId: activeVariantId,
    selectedMaterialId,
    isLoading: isVariantLoading || isConfigLoading,
    error: variantError ?? configError,
    selectVariant,
    selectMaterial,
    retry,
  }
}
