'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { Typography } from './Typography'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

export interface ProductCardProps {
  slug: string
  name: string
  category: string
  price: number
  tone: 'volt' | 'cyan' | 'magenta' | 'lime'
  surfaceTone?: 'surface' | 'canvas' | 'veil'
  heroImage?: string
  tagline?: string
  customizeHref?: string | null
  detailsHref?: string
  className?: string
  secondaryImage?: string
  shippingLabel?: string
  badges?: Array<{ label: string; tone?: 'coral' | 'sky' | 'mint' | 'ink' }>
  metalOptions?: Array<{ label: string; color: string; href?: string }>
  rating?: {
    value: number
    count: number
  }
  wishlistEnabled?: boolean
  wishlistActive?: boolean
  onWishlistToggle?: () => void
  actions?: ReactNode
}

const fallbackSurfaceByTone: Record<ProductCardProps['tone'], string> = {
  volt: 'bg-accent-primary/10',
  magenta: 'bg-accent-primary/10',
  cyan: 'bg-accent-secondary/15',
  lime: 'bg-accent-secondary/15',
}

const surfaceToneClass: Record<'surface' | 'canvas' | 'veil', string> = {
  surface: 'bg-surface-base',
  canvas: 'bg-surface-canvas',
  veil: 'bg-surface-panel',
}

export function ProductCard({
  slug,
  name,
  category,
  price,
  heroImage,
  tagline,
  tone = 'volt',
  customizeHref = `/customizer?product=${slug}`,
  detailsHref = `/products/${slug}`,
  className,
  secondaryImage,
  shippingLabel,
  badges,
  metalOptions,
  rating,
  wishlistEnabled = false,
  wishlistActive = false,
  onWishlistToggle,
  actions,
  surfaceTone = 'surface',
}: ProductCardProps) {
  const hasImage = typeof heroImage === 'string' && heroImage.length > 0
  const canCustomize = typeof customizeHref === 'string' && customizeHref.length > 0
  const badgeList = badges ?? []
  const metaOptions = metalOptions ?? []
  const formattedPrice = formatPrice(price)
  const shellShadow = surfaceTone === 'canvas' ? 'shadow-canvas' : 'shadow-soft'
  const hoverShadow = surfaceTone === 'canvas' ? 'hover:shadow-soft' : 'hover:shadow-medium'

  return (
    <Card
      variant="day"
      className={cn(
        'group flex h-full flex-col overflow-hidden border border-border-subtle p-0 transition duration-300 hover:-translate-y-0.5',
        shellShadow,
        hoverShadow,
        surfaceToneClass[surfaceTone] ?? surfaceToneClass.surface,
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-panel">
        {hasImage ? (
          <>
            <Image
              src={heroImage!}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(min-width: 1200px) 24rem, (min-width: 768px) 45vw, 90vw"
              priority={false}
            />
            {secondaryImage ? (
              <Image
                src={secondaryImage}
                alt="Alternate view"
                fill
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                sizes="(min-width: 1200px) 24rem, (min-width: 768px) 45vw, 90vw"
                priority={false}
              />
            ) : null}
          </>
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center text-[0.7rem] uppercase tracking-[0.42em] text-text-muted',
              fallbackSurfaceByTone[tone] ?? fallbackSurfaceByTone.volt,
            )}
          >
            Coming Soon
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-6 top-5 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {shippingLabel ? (
              <span className="inline-flex items-center rounded-full bg-surface-base/90 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-text-primary shadow-soft">
                {shippingLabel}
              </span>
            ) : null}

            {badgeList.length ? (
              <div className="flex flex-col gap-2">
                {badgeList.map((badge) => (
                  <span
                    key={badge.label}
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] shadow-soft',
                      badge.tone === 'sky'
                        ? 'bg-accent-secondary/15 text-accent-secondary'
                        : badge.tone === 'mint'
                          ? 'bg-accent-muted/60 text-accent-primary'
                          : badge.tone === 'ink'
                            ? 'bg-text-primary text-surface-base'
                            : 'bg-accent-muted text-accent-primary',
                    )}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {wishlistEnabled ? (
            <button
              type="button"
              onClick={onWishlistToggle}
              aria-pressed={wishlistActive}
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-base/40 bg-surface-base/90 text-text-primary shadow-soft transition hover:border-accent-primary/40 hover:text-accent-primary"
            >
              <span className="sr-only">{wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={wishlistActive ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5c-1.935 0-3.597 1.126-4.312 2.733c-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 8.25 11.25 8.25 11.25s8.25-4.03 8.25-11.25Z"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {(metaOptions.length || rating) ? (
          <div className="pointer-events-auto absolute inset-x-6 bottom-5 hidden flex-col gap-3 rounded-lg border border-border-subtle bg-surface-base/95 p-3 text-xs text-text-muted shadow-soft transition group-hover:flex">
            {rating ? (
              <Rating value={rating.value} count={rating.count} />
            ) : (
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">View product details</span>
            )}

            {metaOptions.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {metaOptions.map((option) => (
                  <a
                    key={option.label}
                    href={option.href ?? detailsHref}
                    className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-panel px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-text-secondary transition hover:border-border-strong hover:text-text-primary"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-surface-base/70 shadow-soft"
                      style={{ backgroundColor: option.color }}
                      aria-hidden
                    />
                    {option.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-text-muted">{category}</span>
          <Typography variant="title" className="text-text-primary">
            {name}
          </Typography>
          <p className="text-sm font-medium text-text-primary">
            {formattedPrice}{' '}
            <span className="text-xs font-normal text-text-muted">Setting price</span>
          </p>
          {tagline ? <p className="line-clamp-2 text-sm text-text-muted">{tagline}</p> : null}
        </div>

        {actions ? (
          <div className="mt-auto pt-2">{actions}</div>
        ) : (
          <div className="mt-auto flex items-center gap-3 pt-2">
            <Button
              variant="link"
              tone="ink"
              href={detailsHref}
              className="tracking-[0.12em] uppercase"
            >
              View details
            </Button>
            {canCustomize ? (
              <Button tone="coral" size="sm" href={customizeHref ?? undefined} className="ml-auto">
                Customize
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  )
}

function Rating({ value, count }: { value: number; count: number }) {
  const clamped = Math.max(0, Math.min(5, value))
  const roundedStars = Math.round(clamped)

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      <div className="flex items-center text-accent-primary">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="text-base leading-none">
            {index < roundedStars ? '★' : '☆'}
          </span>
        ))}
      </div>
      <span className="text-xs text-text-muted">
        {clamped.toFixed(1)} · {count.toLocaleString()}
      </span>
    </div>
  )
}
