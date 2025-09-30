import { ClosingCtaSection } from '@/components/homepage/ClosingCtaSection'
import { CreatorWorkflowSection } from '@/components/homepage/CreatorWorkflowSection'
import { DesignStudioSection } from '@/components/homepage/DesignStudioSection'
import { ExperienceModulesSection } from '@/components/homepage/ExperienceModulesSection'
import { SupportSection } from '@/components/homepage/SupportSection'
import { HeroSection } from '@/components/homepage/HeroSection'
import { ShopCollectionSection } from '@/components/homepage/ShopCollectionSection'
import { HOMEPAGE } from '@/content/homepage'
import type { ShopCollectionProductCard } from '@/components/homepage/types'
import { SHOP_COLLECTION_GLOW_SEQUENCE } from '@/components/homepage/shopCollectionTokens'
import { getCategoryTone, normalizeCategoryInput } from '@/styles/category-tokens'
import { listProducts } from '@/services/products-service'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

const glowOrder = SHOP_COLLECTION_GLOW_SEQUENCE

const shopCollectionFallback: ShopCollectionProductCard[] = [
  {
    id: 'fallback-neon-dream-ring',
    name: 'Neon Dream Ring',
    href: '/products/prism-flux-ring',
    price: '$1,299',
    imageSrc: '/images/placeholder-product.jpg',
    imageAlt: 'Neon Dream Ring placeholder',
    glow: 'volt',
    meta: 'Lab Diamond • 14k Gold',
    category: 'rings',
  },
  {
    id: 'fallback-cyber-chain',
    name: 'Cyber Chain',
    href: '/products/cyber-chain',
    price: '$499',
    imageSrc: '/images/placeholder-product.jpg',
    imageAlt: 'Cyber Chain placeholder',
    glow: 'cyber',
    meta: 'Moissanite • Silver',
    category: 'necklaces',
  },
  {
    id: 'fallback-digital-drops',
    name: 'Digital Drops',
    href: '/products/digital-drops',
    price: '$2,499',
    imageSrc: '/images/placeholder-product.jpg',
    imageAlt: 'Digital Drops placeholder',
    glow: 'digital',
    meta: 'Lab Diamond • Platinum',
    category: 'earrings',
  },
  {
    id: 'fallback-acid-wave-band',
    name: 'Acid Wave Band',
    href: '/products/acid-wave-band',
    price: '$899',
    imageSrc: '/images/placeholder-product.jpg',
    imageAlt: 'Acid Wave Band placeholder',
    glow: 'acid',
    meta: 'Moissanite • 14k Gold',
    category: 'bracelets',
  },
]

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { forceCompressed?: string; layout?: string }
}) {
  const products = await loadFeaturedProducts()

  const isE2E = process.env.NEXT_PUBLIC_E2E === '1'
  const forceCompressed =
    (searchParams?.forceCompressed ?? '') === '1' || (searchParams?.forceCompressed ?? '') === 'true'
  const layoutVariant =
    searchParams?.layout === 'preview'
      ? 'withPreview'
      : HOMEPAGE.hero.layout ?? 'withPreview'

  const viewerSource = HOMEPAGE.designStudio.viewer

  const initialSrc = forceCompressed
    ? viewerSource.modelSrc
    : isE2E && viewerSource.uncompressedSrc
    ? viewerSource.uncompressedSrc
    : viewerSource.modelSrc

  const initialReveal: 'auto' | 'interaction' = forceCompressed ? 'interaction' : isE2E ? 'auto' : 'interaction'
  const initialLoading: 'auto' | 'eager' = isE2E ? 'eager' : 'auto'

  const viewerConfig = {
    ...viewerSource,
    initialSrc,
    initialReveal,
    initialLoading,
    isE2E,
  }

  const heroProps =
    layoutVariant === 'withPreview'
      ? { ...HOMEPAGE.hero, layout: layoutVariant, preview: viewerConfig }
      : { ...HOMEPAGE.hero, layout: layoutVariant }

  return (
    <>
      <HeroSection {...heroProps} />
      <ShopCollectionSection {...HOMEPAGE.shopCollection} products={products} />
      <DesignStudioSection
        {...HOMEPAGE.designStudio}
        viewer={viewerConfig}
      />
      <ExperienceModulesSection {...HOMEPAGE.experience} />
      <CreatorWorkflowSection {...HOMEPAGE.workflow} />
      <SupportSection {...HOMEPAGE.support} />
      <ClosingCtaSection {...HOMEPAGE.closing} />
    </>
  )
}

async function loadFeaturedProducts(): Promise<ShopCollectionProductCard[]> {
  try {
    const { items } = await listProducts({ limit: 4, page: 1, sortField: 'createdAt', sortDirection: 'desc' })
    if (items.length === 0) {
      return shopCollectionFallback
    }

    return items.map((product, index) => {
      const glowFallback = glowOrder[index % glowOrder.length]
      const { tone } = getCategoryTone(product.category)
      const normalizedCategory = normalizeCategoryInput(product.category)?.toLowerCase()
      const displayCategory = product.category ?? 'Neon Dream capsule'
      const meta = product.tags?.length
        ? product.tags.slice(0, 2).join(' • ')
        : displayCategory

      return {
        id: product.id,
        name: product.name,
        href: `/products/${product.slug}`,
        price: product.basePrice ? currencyFormatter.format(product.basePrice) : 'Custom quote',
        imageSrc: product.images[0] ?? '/images/placeholder-product.jpg',
        imageAlt: product.images[0] ? `${product.name} preview` : `${product.name} placeholder`,
        glow: (tone ?? glowFallback) as (typeof glowOrder)[number],
        meta,
        category: normalizedCategory,
      }
    })
  } catch (error) {
    console.error('Failed to load featured products for homepage hero.', error)
    return shopCollectionFallback
  }
}
