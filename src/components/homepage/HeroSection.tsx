'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'
import { StatsStrip } from '@/components/layout/StatsStrip'
import { cn } from '@/lib/utils'
import { getPrimaryImage } from '@/lib/imageResolver'
import { formatPrice } from '@/lib/format'
import type {
  HomepageFeaturedProduct,
  HomepageHeroCta,
  HomepageHeroStat,
} from '@/content/homepage'

export interface HeroSectionProps {
  kicker?: string
  headline?: string
  body?: string
  primaryCta?: HomepageHeroCta
  secondaryCta?: HomepageHeroCta
  stats?: HomepageHeroStat[]
  background?: {
    image: string
    alt: string
    mobileImage?: string
  }
  collectionItems?: HomepageFeaturedProduct[]
  className?: string
}

export function HeroSection({
  kicker = 'GlowGlitch',
  headline = 'MAKE IT YOURS.',
  body = "Light, bright, and crafted to last. Design pieces you’ll wear every day.",
  primaryCta,
  secondaryCta,
  stats,
  background,
  collectionItems,
  className,
}: HeroSectionProps) {
  const hasStats = Array.isArray(stats) && stats.length >= 3
  const hasCollection = Array.isArray(collectionItems) && collectionItems.length > 0
  const primary = primaryCta ?? {
    label: 'Start Designing',
    href: '/studio',
    variant: 'accent' as const,
  }
  const secondary = secondaryCta ?? ({
    label: 'View Collection',
    href: '/collections',
    variant: 'ghost' as const,
  } as HomepageHeroCta)

  const mapButtonVariant = (
    variant: HomepageHeroCta['variant'] | undefined,
    fallback: 'primary' | 'outline' | 'ghost',
  ): 'primary' | 'outline' | 'ghost' | 'accent' | 'inverse' => {
    switch (variant) {
      case 'ghost':
        return 'ghost'
      case 'outline':
        return 'outline'
      case 'primary':
        return 'primary'
      case 'glass':
        return 'outline'
      case 'accent':
        return 'accent'
      case 'inverse':
        return 'inverse'
      default:
        return fallback
    }
  }

  const primaryVariant = mapButtonVariant(primary.variant, 'primary')
  const secondaryVariant = mapButtonVariant(secondary?.variant, 'ghost')

  return (
    <Section spacing="none" className={cn("relative overflow-hidden py-[clamp(56px,14vw,72px)] sm:py-[var(--section-space-hero)] bg-app", className)} data-testid="homepage-hero">
      <HeroBackground background={background} />
      <SectionContainer size="content" className="relative z-10 flex flex-col gap-[var(--space-fluid-2xl)]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-col gap-[var(--space-fluid-lg)] max-w-[360px] w-full sm:max-w-[720px] mx-auto lg:mx-0">
            {kicker ? <span className="font-accent text-xs tracking-[0.28em] uppercase text-muted">{kicker}</span> : null}
            <div className="flex flex-col gap-[var(--space-fluid-sm)]">
              <h1 className="m-0 font-heading text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] font-semibold text-accent-contrast">
                <span className="text-accent">{headline}</span>
              </h1>
              <p className="m-0 text-[1.06rem] leading-[1.7] text-[color-mix(in_oklab,var(--color-accent-contrast)_85%,transparent)] [text-shadow:0_1px_10px_color-mix(in_oklab,var(--color-ink)_45%,transparent)]">
                {body}
              </p>
            </div>
            <div className="relative flex flex-col gap-3 w-full max-w-[360px] mx-auto sm:flex-row sm:justify-start sm:gap-[var(--space-fluid-sm)] sm:max-w-[420px] lg:mx-0">
              <span className="absolute -inset-x-12 -inset-y-8 rounded-[180px] bg-surface-veil blur-[40px] pointer-events-none -z-10" aria-hidden />
              <Button
                href={primary.href}
                variant={primaryVariant}
                className="inline-flex justify-center w-full sm:w-auto sm:min-w-[10.5rem] bg-surface-base text-ink border-none hover:bg-surface-base/90 shadow-soft"
              >
                {primary.label}
              </Button>
              {secondary?.label ? (
                <Button
                  href={secondary.href}
                  variant={secondaryVariant}
                  className={cn(
                    "inline-flex justify-center w-full sm:w-auto sm:min-w-[10.5rem]",
                    // Manual override for Hero Dark Context on secondary button if it's outline/ghost
                    "text-white border-white/40 hover:bg-white/10 hover:border-white hover:text-white"
                  )}
                >
                  {secondary.label}
                </Button>
              ) : null}
            </div>
            {hasStats ? (
              <StatsStrip
                items={stats!.slice(0, 3).map((stat) => ({ label: stat.label, value: stat.value }))}
                align="center"
                columns={{ base: 1, sm: 3 }}
                className="pt-[var(--space-fluid-md)]"
                data-testid="hero-stats-strip"
              />
            ) : null}
          </div>
        </div>
      </SectionContainer>
      {hasCollection ? (
        <SectionContainer size="gallery" bleed className="mt-[var(--space-fluid-xl)] px-[clamp(16px,4vw,40px)] relative z-10 xl:px-0">
          <HeroCollectionStrip items={collectionItems!.slice(0, 3)} />
        </SectionContainer>
      ) : null}
    </Section>
  )
}

function HeroBackground({
  background,
}: {
  background?: {
    image: string
    alt: string
    mobileImage?: string
  }
}) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {background?.image ? (
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={background.image}
            alt={background.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="absolute inset-0 object-cover hidden md:block"
          />
          <Image
            src={background.mobileImage ?? background.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover block md:hidden"
            aria-hidden
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-app" aria-hidden />
      )}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-ink)_78%,transparent)_0%,color-mix(in_oklab,var(--color-ink)_52%,transparent)_45%,color-mix(in_oklab,var(--color-ink)_24%,transparent)_100%)] sm:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-ink)_65%,transparent)_0%,color-mix(in_oklab,var(--color-ink)_40%,transparent)_45%,color-mix(in_oklab,var(--color-ink)_16%,transparent)_100%)]" />
        <div className="absolute inset-0 bg-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_35%_50%,color-mix(in_oklab,var(--color-ink)_30%,transparent),transparent_65%)]" />
      </div>
    </div>
  )
}

function HeroCollectionStrip({ items }: { items: HomepageFeaturedProduct[] }) {
  return (
    <div className="border-none rounded-none bg-transparent shadow-none p-0 relative z-10" data-testid="hero-featured-strip">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((product) => {
          const { src, reason } = getPrimaryImage(product)
          const hasImage = Boolean(src)

          return (
            <Link
              key={product.slug || product.name}
              href={product.slug ? `/products/${product.slug}` : '/collections'}
              className="group flex flex-col border border-border-subtle rounded-none bg-surface-base overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-soft"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                {hasImage ? (
                  <Image
                    src={src!}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-ink-2 bg-[color-mix(in_oklab,var(--color-accent)_12%,var(--color-surface-contrast))]">
                    Preview coming soon
                    <span className="sr-only">{reason}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-4 bg-surface-base border-t border-border-subtle text-ink">
                <span className="text-[0.7rem] tracking-[0.18em] uppercase text-muted">{product.category}</span>
                <span className="text-base font-semibold text-ink">{product.name}</span>
                <span className="text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
