'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button, Typography } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useCustomizerState } from '../hooks/useCustomizerState'
import { GlbViewer } from './GlbViewer'

interface PipelineStep {
  title: string
  detail: string
}

interface RoadmapItem {
  title: string
  description: string
  reference: string
}

export interface CustomizerExperienceProps {
  initialVariantId?: string
  pipelineSteps?: PipelineStep[]
  roadmapItems?: RoadmapItem[]
}

export function CustomizerExperience({
  initialVariantId = 'astro-demo',
  pipelineSteps = [],
  roadmapItems = [],
}: CustomizerExperienceProps) {
  const {
    variant,
    variants,
    materialOptions,
    priceQuote,
    selectedVariantId,
    selectedMaterialId,
    isLoading,
    error,
    selectVariant,
    selectMaterial,
    retry,
  } = useCustomizerState(initialVariantId)

  const variantOptions = variants.map((entry) => ({ id: entry.id, label: entry.name }))
  const sizeOptions = useMemo(() => ['5', '6', '7', '8', '9'], [])

  const [selectedSize, setSelectedSize] = useState<string>(() => variant?.defaultSize ?? sizeOptions[1])

  useEffect(() => {
    if (variant?.defaultSize) {
      setSelectedSize(variant.defaultSize)
    }
  }, [variant?.defaultSize])

  const toneToAccentTone: Record<'volt' | 'cyan' | 'magenta' | 'lime', 'coral' | 'sky'> = {
    volt: 'coral',
    cyan: 'sky',
    magenta: 'coral',
    lime: 'sky',
  }

  const accentTone = toneToAccentTone[variant?.tone ?? 'volt']
  const accentChipClass =
    accentTone === 'coral'
      ? 'border-brand-coral/40 bg-brand-coral/10 text-brand-ink'
      : 'border-brand-sky/40 bg-brand-sky/10 text-brand-ink'

  const highlights = variant?.highlights ?? []

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <div className="space-y-6">
        <div className="surface-panel space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <Typography variant="caption" className="uppercase tracking-[0.3em] text-body-muted">
                Variant preview
              </Typography>
              <Typography variant="title" data-testid="variant-name">
                {variant?.name ?? 'Loading variant'}
              </Typography>
              {variant?.tagline ? <p className="type-body">{variant.tagline}</p> : null}
            </div>
            <span className={cn('surface-chip px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]', accentChipClass)}>
              GLB • Coral Sky
            </span>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="flex aspect-square w-full items-center justify-center rounded-none border border-brand-ink/10 bg-surface-base/70">
                <span className="type-body">Loading preview…</span>
              </div>
            ) : error ? (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-none border border-red-500/30 bg-red-500/5 p-6 text-center">
                <Typography variant="body" className="text-red-200">
                  {error}
                </Typography>
                <Button tone="coral" variant="outline" size="sm" className="justify-center" onClick={retry}>
                  Retry preview
                </Button>
              </div>
            ) : variant ? (
              <GlbViewer
                key={variant.id}
                src={variant.src}
                poster={variant.poster}
                environmentImage={variant.environmentImage}
                autoRotate={variant.autoRotate}
                cameraControls={variant.cameraControls}
                exposure={variant.exposure}
                alt={`${variant.name} preview`}
                className="aspect-square w-full"
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-none border border-yellow-400/30 bg-yellow-400/5 p-6 text-center">
                <Typography variant="body" className="text-ink">
                  No preview available. Add a style to get started.
                </Typography>
              </div>
            )}
          </div>

          {highlights.length ? (
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="surface-chip">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="surface-panel space-y-4">
          <div className="space-y-2">
            <Typography variant="caption" className="uppercase tracking-[0.3em] text-body-muted">
              Variant selector
            </Typography>
            <Typography variant="title">Choose your style</Typography>
            <p className="type-body text-body-muted">Swap between demos without leaving the preview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {variantOptions.length > 0 ? (
              variantOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectVariant(option.id)}
                  className={cn(
                    'rounded-none border px-4 py-3 text-left type-body transition md:min-w-[13rem]',
                    option.id === variant?.id
                      ? 'border-brand-coral/50 bg-brand-coral/10 text-brand-ink shadow-soft'
                      : 'border-brand-ink/10 bg-surface-base/70 text-body hover:border-brand-ink/30 hover:text-ink',
                  )}
                  data-testid={`variant-option-${option.id}`}
                >
                  <span className="block font-semibold">{option.label}</span>
                  {option.id === variant?.id ? (
                    <span className="mt-1 block text-xs text-brand-ink">Active</span>
                  ) : (
                    <span className="mt-1 block text-xs text-body-muted">Tap to preview style</span>
                  )}
                </button>
              ))
            ) : (
              <span className="type-body text-body-muted">Add a style to enable switching.</span>
            )}
          </div>
        </div>

        <div className="surface-panel space-y-5">
          <div className="space-y-2">
            <Typography variant="caption" className="uppercase tracking-[0.3em] text-body-muted">
              Fit option
            </Typography>
            <Typography variant="title">Choose your fit</Typography>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'rounded-xl border px-3 py-2 type-body font-medium transition',
                  selectedSize === size
                    ? 'border-brand-coral/50 bg-brand-coral/10 text-brand-ink shadow-soft'
                    : 'border-brand-ink/10 bg-surface-base/70 text-body hover:border-brand-ink/30 hover:text-ink',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-panel space-y-5">
          <div className="space-y-2">
            <Typography variant="caption" className="uppercase tracking-[0.3em] text-body-muted">
              Metal finish
            </Typography>
            <Typography variant="title">Select a finish</Typography>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {materialOptions.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => selectMaterial(material.id)}
                className={cn(
                  'h-full rounded-none border px-4 py-3 text-left type-body transition',
                  material.id === selectedMaterialId
                    ? 'border-brand-sky/50 bg-brand-sky/10 text-brand-ink shadow-soft'
                    : 'border-brand-ink/10 bg-surface-base/70 text-body hover:border-brand-ink/30 hover:text-ink',
                )}
                data-testid={`material-option-${material.id}`}
              >
                <span className="block font-semibold text-base text-ink">{material.label}</span>
                <span className="mt-2 block text-xs text-body">{material.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-body-muted">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand-sky" aria-hidden />
                  {material.priceAdjustment >= 0 ? '+' : '-'}${Math.abs(material.priceAdjustment)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-panel space-y-4">
          <Typography variant="title">Selection summary</Typography>
          <div className="space-y-3 type-body">
            <div className="flex items-center justify-between">
              <span>Variant</span>
              <span>{variant?.name ?? 'Select a style'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Metal</span>
              <span>{materialOptions.find((option) => option.id === selectedMaterialId)?.label ?? 'Choose a finish'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fit</span>
              <span>{selectedSize}</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex items-center justify-between text-ink">
              <span className="font-semibold uppercase tracking-[0.3em]">Estimated total</span>
              <span className="text-lg font-semibold" data-testid="price-total">
                {(priceQuote?.total ?? 0).toLocaleString()} {priceQuote?.currency ?? 'USD'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button tone={accentTone} className="justify-center">
              Save & continue
            </Button>
            <Button tone={accentTone} variant="outline" className="justify-center">
              Add to shortlist
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
