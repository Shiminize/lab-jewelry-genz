import Link from 'next/link'
import { ProductCard, Typography } from '@/components/ui'
import { HeroSection as HomepageHeroSection } from '@/components/homepage/HeroSection'
import { CollectionTypesSection } from '@/components/homepage/CollectionTypesSection'
import { CustomizerOnboardingSection } from '@/components/homepage/CustomizerOnboardingSection'
import { Section, SectionContainer } from '@/components/layout/Section'
import { GalleryRail } from '@/components/layout/GalleryRail'
import type { HomepageFeaturedProduct } from '@/content/homepage'
import { getPrimaryImage } from '@/lib/imageResolver'
import { getHomepageDisplayData } from '@/services/neon/homepageService'
import { SupportSection } from '@/components/homepage/SupportSection'
import { getHomepageContent } from '@/services/homepageContent'
import { CreatorCTASection } from '@/components/homepage/CreatorCTASection'
import { QuizSection } from '@/components/homepage/QuizSection'

export default async function HomePage() {
  const content = await getHomepageContent()
  const { hero, features, featuredProducts, collectionTypes, customizerOnboarding, creatorCta } = content
  const displayData = await getHomepageDisplayData(content)
  const collectionItems =
    displayData.collectionItems.length > 0 ? displayData.collectionItems : featuredProducts.slice(0, 3)
  const spotlightProducts =
    displayData.spotlightItems.length > 0 ? displayData.spotlightItems : featuredProducts

  return (
    <div className="space-y-24 bg-app pb-24">
      <HomepageHeroSection
        kicker={hero.kicker}
        headline={hero.headlineLine1}
        body={hero.body}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        stats={hero.stats}
        background={hero.background}
        collectionItems={collectionItems}
      />
      <SpotlightSection products={spotlightProducts} />
      <QuizSection />
      <CollectionTypesSection items={collectionTypes} />
      <CustomizerOnboardingSection content={customizerOnboarding} />
      <CreatorCTASection content={creatorCta} />
      <SupportSection />
    </div>
  )
}

function SpotlightSection({ products }: { products: HomepageFeaturedProduct[] }) {
  return (
    <Section spacing="tight">
      <SectionContainer size="gallery" bleed className="space-y-8 px-4 sm:px-6 lg:px-10 xl:px-0">
        <div className="flex flex-col gap-4 text-body md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Typography variant="eyebrow" className="text-body-muted">
              Featured Capsules
            </Typography>
            <Typography as="h2" variant="heading" className="text-text-primary">
              Curator&rsquo;s Choice
            </Typography>
          </div>
          <Link
            href="/collections"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary transition-colors duration-200 hover:text-accent-primary"
          >
            Browse the full collection →
          </Link>
        </div>
        <GalleryRail ariaLabel="Featured capsules carousel">
          {products.map((product) => (
            <div key={product.slug} className="rail-gallery-item">
              <SpotlightProductCard product={product} />
            </div>
          ))}
        </GalleryRail>
      </SectionContainer>
    </Section>
  )
}

function SpotlightProductCard({ product }: { product: HomepageFeaturedProduct }) {
  const { src } = getPrimaryImage(product)
  const galleryImages = (product.gallery ?? []).map((item) => item?.src).filter(Boolean) as string[]
  const secondaryImage = galleryImages.find((image) => image && image !== src) ?? undefined

  return (
    <ProductCard
      slug={product.slug}
      name={product.name}
      category={product.category}
      price={product.price}
      tone={product.tone}
      heroImage={src ?? undefined}
      secondaryImage={secondaryImage}
      tagline={product.tagline}
      detailsHref={`/products/${product.slug}`}
      customizeHref={null}
      surfaceTone="canvas"
    />
  )
}
