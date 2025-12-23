import type { NormalizedFilters } from './normalizer'

type FallbackVariant = {
  filters: NormalizedFilters
  reason: string
}

/**
 * Build a small, ordered list of broader filter sets to retry when product
 * search returns no results. The steps are intentionally minimal to avoid
 * surprising the user.
 */
export function buildProductFallbacks(base: NormalizedFilters): FallbackVariant[] {
  const variants: FallbackVariant[] = []

  // 1) Drop metal constraint
  if (base.metal) {
    const { metal: _omit, ...rest } = base
    variants.push({ filters: rest, reason: 'drop_metal' })
  }

  // 2) Raise price ceiling modestly (max +300, capped at 1200)
  const ceiling = base.priceLt ?? base.priceMax
  if (typeof ceiling === 'number' && Number.isFinite(ceiling) && ceiling < 1200) {
    const nextCap = Math.min(ceiling + 300, 1200)
    variants.push({
      filters: { ...base, priceLt: nextCap, priceMax: nextCap },
      reason: 'raise_price',
    })
  }

  // 3) Remove ready-to-ship constraint if present
  if (base.readyToShip) {
    const { readyToShip: _omit, ...rest } = base
    variants.push({ filters: rest, reason: 'drop_ready_to_ship' })
  }

  // 4) Final fallback: ensure we at least show ready-to-ship picks
  variants.push({
    filters: {
      ...base,
      readyToShip: true,
    },
    reason: 'default_ready_to_ship',
  })

  return variants
}
