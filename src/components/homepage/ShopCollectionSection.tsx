'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { HomepageFeaturedProduct } from '@/content/homepage'
import { getPrimaryImage } from '@/lib/imageResolver'
import { formatPrice } from '@/lib/format'
import { Section, SectionContainer } from '@/components/layout/Section'
import { CardDeck } from '@/components/layout/CardDeck'

interface ShopCollectionSectionProps {
  products: HomepageFeaturedProduct[]
  className?: string
  title?: string
}

const gradientPlaceholder = 'bg-gradient-neutral-soft'

export function ShopCollectionSection({
  products,
  className,
  title = 'Featured',
}: ShopCollectionSectionProps) {
  if (!products.length) return null

  return (
    <Section spacing="compact" variant="surface" className={className}>
      <SectionContainer size="content" className="space-y-2 text-center md:text-left">
        <div className="type-eyebrow">{title}</div>
      </SectionContainer>
      <SectionContainer size="gallery" bleed className="px-4 sm:px-6 lg:px-10 xl:px-0">
        <CardDeck className="items-stretch" gapClassName="gap-[var(--space-gallery-gap)]" columns={{ base: 1, sm: 2, lg: 3 }}>
          {products.slice(0, 3).map((product) => {
            const { src, reason } = getPrimaryImage(product)
            const hasSlug = typeof product.slug === 'string' && product.slug.trim().length > 0
            const content = (
              <>
                <div className={`relative aspect-[3/2] overflow-hidden rounded-none ${src ? '' : gradientPlaceholder}`}>
                  {src ? (
                    <Image
                      src={src}
                      alt={product.name || 'Featured product'}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 32vw, 100vw"
                    />
                  ) : null}
                  {!src ? (
                    <span className="sr-only">Placeholder image for featured product ({reason})</span>
                  ) : null}
                </div>
                <div className="pt-3 type-title">{product.name}</div>
                <div className="type-body font-semibold text-ink">{formatPrice(product.price)}</div>
              </>
            )

            if (hasSlug) {
              return (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="block overflow-hidden rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={product.name}
                className="block overflow-hidden rounded-none opacity-80"
                aria-disabled="true"
              >
                {content}
              </div>
            )
          })}
        </CardDeck>
      </SectionContainer>
    </Section>
  )
}
