export type ProductLike = {
  slug?: string | null
  heroImage?: string | null
  gallery?: Array<{ src?: string | null }> | null
}

export function getPrimaryImage(p: ProductLike): { src: string | null; reason: 'hero' | 'gallery' | 'placeholder' } {
  if (p?.heroImage) {
    return { src: p.heroImage, reason: 'hero' }
  }

  const gallerySrc = p?.gallery?.find((g) => !!g?.src)?.src ?? null
  if (gallerySrc) {
    return { src: gallerySrc, reason: 'gallery' }
  }

  return { src: null, reason: 'placeholder' }
}
