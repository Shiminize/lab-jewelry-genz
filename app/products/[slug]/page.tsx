import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailView } from '@/components/product/ProductDetailView'
import { getProductBySlug, getAllProductSlugs } from '@/lib/products'

export const dynamic = 'force-dynamic'

type PageParams = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product not found — GlowGlitch',
      description: 'The requested product is unavailable. Explore our current collections instead.',
    }
  }

  return {
    title: `${product.title} — GlowGlitch`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: PageParams) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}