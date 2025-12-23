import { getProductDetail } from '@/services/neon/productService'
import { getCatalogProductBySlug } from '@/services/neon/catalogRepository'

jest.mock('@/services/neon/catalogRepository', () => ({
  getCatalogProductBySlug: jest.fn(async (slug: string) => ({ slug })),
}))

describe('productService', () => {
  it('delegates to catalog repository lookups', async () => {
    const detail = await getProductDetail('neon-halo-necklace')
    expect(detail).toEqual({ slug: 'neon-halo-necklace' })
    expect(getCatalogProductBySlug).toHaveBeenCalledWith('neon-halo-necklace')
  })
})
