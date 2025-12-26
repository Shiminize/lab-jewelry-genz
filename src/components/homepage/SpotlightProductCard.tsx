'use client'

import { ProductCardWithCart } from '@/components/products/ProductCardWithCart'
import type { HomepageFeaturedProduct } from '@/content/homepage'
import { getPrimaryImage } from '@/lib/imageResolver'

export function SpotlightProductCard({ product }: { product: HomepageFeaturedProduct }) {
    const { src } = getPrimaryImage(product)
    const galleryImages = (product.gallery ?? []).map((item) => item?.src).filter(Boolean) as string[]
    const secondaryImage = galleryImages.find((image) => image && image !== src) ?? undefined

    return (
        <ProductCardWithCart
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
