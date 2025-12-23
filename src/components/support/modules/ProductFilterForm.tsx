'use client'

import { useMemo, useState } from 'react'
import type { ProductFilterPayload } from '@/lib/concierge/types'

interface ProductFilterFormProps {
  payload: ProductFilterPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

const categories = [
  { value: 'ring', label: 'Rings' },
  { value: 'earring', label: 'Earrings' },
  { value: 'necklace', label: 'Necklaces' },
  { value: 'bracelet', label: 'Bracelets' },
]

const metals = [
  { value: '14k_yellow', label: '14k Yellow Gold' },
  { value: '14k_white', label: '14k White Gold' },
  { value: '14k_rose', label: '14k Rose Gold' },
  { value: 'platinum', label: 'Platinum' },
]

function normalizeCategory(value: string | undefined): string {
  if (!value) return 'ring'
  const lowered = value.toLowerCase()
  if (categories.some((option) => option.value === lowered)) {
    return lowered
  }
  if (lowered.endsWith('s')) {
    const singular = lowered.slice(0, -1)
    if (categories.some((option) => option.value === singular)) {
      return singular
    }
  }
  return 'ring'
}

export function ProductFilterForm({ payload, onAction, disabled }: ProductFilterFormProps) {
  const [category, setCategory] = useState(() => normalizeCategory(payload.defaults?.category))
  const [priceMin, setPriceMin] = useState(payload.defaults?.priceMin?.toString() ?? '500')
  const [priceMax, setPriceMax] = useState(payload.defaults?.priceMax?.toString() ?? '5000')
  const [metal, setMetal] = useState(payload.defaults?.metal ?? '14k_yellow')
  const [readyToShip, setReadyToShip] = useState(false)

  const isPriceValid = useMemo(() => {
    const min = Number(priceMin)
    const max = Number(priceMax)
    return !Number.isNaN(min) && !Number.isNaN(max) && min >= 0 && max >= min
  }, [priceMin, priceMax])

  return (
    <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">{payload.heading}</p>
        {payload.subheading ? <p className="mt-1 text-sm text-text-secondary">{payload.subheading}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm font-semibold text-text-primary">
          Category
          <select
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={disabled}
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-text-primary">
          <label>
            Min budget
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value)}
              disabled={disabled}
            />
          </label>
          <label>
            Max budget
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
              disabled={disabled}
            />
          </label>
        </div>

        <label className="text-sm font-semibold text-text-primary">
          Metal palette
          <select
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            value={metal}
            onChange={(event) => setMetal(event.target.value)}
            disabled={disabled}
          >
            {metals.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-border-subtle"
            checked={readyToShip}
            onChange={(event) => setReadyToShip(event.target.checked)}
            disabled={disabled}
          />
          Show only ready-to-ship pieces
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          onAction({
            type: 'submit-product-filters',
            data: {
              filters: {
                category,
                priceMin: Number(priceMin),
                priceMax: Number(priceMax),
                metal,
                readyToShip,
              },
            },
          })
        }
        disabled={disabled || !isPriceValid}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-border-subtle bg-neutral-50 px-4 py-2 text-sm font-semibold text-text-primary shadow-soft transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        See tailored pieces
      </button>
    </section>
  )
}
