import { getCatalogProductBySlug, type CatalogProductDetail } from './catalogRepository'

export async function getProductDetail(slug: string): Promise<CatalogProductDetail | null> {
  return getCatalogProductBySlug(slug)
}
