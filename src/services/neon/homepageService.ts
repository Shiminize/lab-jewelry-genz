import { homepageContent, type HomepageContent, type HomepageFeaturedProduct } from '@/content/homepage'
import { getHomepageDisplayEntries, type HomepageDisplayEntries, type CatalogProductDetail } from './catalogRepository'

export interface HomepageDisplayData {
  collectionItems: HomepageFeaturedProduct[]
  spotlightItems: HomepageFeaturedProduct[]
}

function mapEntryToFeaturedProduct(entry: CatalogProductDetail): HomepageFeaturedProduct {
  const galleryRaw = entry.mediaGallery || []

  return {
    slug: entry.slug,
    name: entry.name,
    category: entry.category,
    price: entry.price,
    tone: entry.tone,
    ...(entry.heroImage ? { heroImage: entry.heroImage } : {}),
    ...(entry.tagline ? { tagline: entry.tagline } : {}),
    ...(galleryRaw.length ? { gallery: galleryRaw.map((src) => ({ src })) } : {}),
  }
}

function buildFallback(content: HomepageContent): HomepageDisplayData {
  return {
    collectionItems: content.featuredProducts.slice(0, 3),
    spotlightItems: content.featuredProducts.slice(0, 6),
  }
}

export async function getHomepageDisplayData(fallbackContent: HomepageContent = homepageContent): Promise<HomepageDisplayData> {
  const entries = await getHomepageDisplayEntries()
  if (!entries) {
    return buildFallback(fallbackContent)
  }

  const collectionItems = entries.collection.map(mapEntryToFeaturedProduct)
  const spotlightItems = entries.spotlight.map(mapEntryToFeaturedProduct)

  return {
    collectionItems: collectionItems.length ? collectionItems : fallbackContent.featuredProducts.slice(0, 3),
    spotlightItems: spotlightItems.length ? spotlightItems : fallbackContent.featuredProducts.slice(0, 6),
  }
}
