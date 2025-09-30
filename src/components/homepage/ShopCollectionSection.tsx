import Image from 'next/image'
import Link from 'next/link'

import { Button, Typography, buttonVariants } from '@/components/ui'
import { getCategoryTone } from '@/styles/category-tokens'
import { cn } from '@/lib/utils'
import {
  SHOP_COLLECTION_GLOW_SEQUENCE,
  SHOP_COLLECTION_OUTER_GLOW,
  SHOP_COLLECTION_PANEL_GRADIENT,
  SHOP_COLLECTION_PRICE_TONE,
} from './shopCollectionTokens'
import type { ShopCollectionProductCard, ShopCollectionSectionData } from './types'

type ShopCollectionSectionProps = ShopCollectionSectionData & {
  products: ShopCollectionProductCard[]
}

export function ShopCollectionSection({ heading, description, filters, products, ctaLabel }: ShopCollectionSectionProps) {
  return (
    <section data-testid="shop-collection-section" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.12),_transparent_60%)]" aria-hidden />
      <div className="container space-y-12">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Typography variant="hero" align="center">
            {heading}
          </Typography>
          <Typography variant="body-lg" tone="muted" align="center">
            {description}
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={filter.isPrimary ? 'glass' : 'ghost'}
              glow={filter.isPrimary ? 'volt' : 'none'}
              className={cn(
                'rounded-pill px-5',
                filter.isPrimary
                  ? 'text-void-950'
                  : 'border border-white/10 bg-white/5 text-void-200 hover:text-volt-glow',
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => {
            const { tone, gradientClass, shadowClass, priceClass, buttonClass } = getCategoryTone(product.category)
            const fallbackGlow = SHOP_COLLECTION_GLOW_SEQUENCE[index % SHOP_COLLECTION_GLOW_SEQUENCE.length]
            const resolvedTone = (tone ?? product.glow ?? fallbackGlow) as typeof fallbackGlow
            const glow = resolvedTone

            return (
              <div
                key={product.id}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-void-900/80 transition-transform duration-300 hover:-translate-y-1',
                  SHOP_COLLECTION_OUTER_GLOW[glow],
                )}
              >
                <div className="relative flex flex-1 flex-col overflow-hidden rounded-[32px]">
                  <div
                    className={cn(
                      'relative flex items-center justify-center px-10 pt-12 pb-10 transition-transform duration-500 group-hover:-translate-y-1',
                      SHOP_COLLECTION_PANEL_GRADIENT[glow],
                    )}
                    aria-hidden
                  >
                    <div className="absolute inset-6 rounded-[26px] border border-white/10 opacity-40" />
                    <div className="absolute inset-[12%] rounded-full bg-white/12 opacity-50 blur-3xl" />
                    <div className="relative aspect-square w-full overflow-hidden rounded-[22px] border border-white/12 bg-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
                      <Image
                        src={product.imageSrc}
                        alt={product.imageAlt}
                        fill
                        sizes="(min-width: 1280px) 240px, (min-width: 768px) 45vw, 80vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="mt-auto bg-void-950/90 px-6 pb-6 pt-5">
                    <Typography variant="title" className="text-void-50">
                      {product.name}
                    </Typography>
                    {product.meta && (
                      <Typography variant="body" tone="muted" className="mt-2 text-sm text-void-300">
                        {product.meta}
                      </Typography>
                    )}
                    <div className="mt-6 flex items-center justify-between">
                      <span className={cn('text-title font-semibold', priceClass ?? SHOP_COLLECTION_PRICE_TONE[glow])}>
                        {product.price}
                      </span>
                      <Link
                        href={product.href}
                        className={cn(
                          buttonVariants({ variant: 'primary', size: 'sm', glow: resolvedTone }),
                          'rounded-pill px-4 text-sm font-semibold transition-transform duration-300 hover:-translate-y-[1px]',
                          buttonClass,
                          shadowClass,
                        )}
                        data-category={product.category ?? ''}
                        data-tone={resolvedTone}
                        aria-label={`View ${product.name}`}
                      >
                        {ctaLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ShopCollectionSection
