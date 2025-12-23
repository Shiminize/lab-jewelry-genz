import { getCatalogProducts, getCatalogProductBySlug } from '@/services/neon/catalogRepository'
import { defaultCatalogProductDetails, defaultCatalogProducts } from '@/config/catalogDefaults'

const collectionFactory = {
  current: createCollectionSpies(),
}

function createCollectionSpies() {
  const toArray = jest.fn(async () => [])
  const limit = jest.fn(() => ({ toArray }))
  const find = jest.fn(() => ({ limit }))
  const findOne = jest.fn(async () => null)

  return { find, findOne, _spies: { toArray, limit } }
}

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(async () => ({
    collection: () => collectionFactory.current,
  })),
}))

const sampleDoc = {
  name: 'Neon Halo Necklace',
  category: 'Necklaces',
  pricing: { basePrice: 1280 },
  seo: { slug: 'neon-halo-necklace' },
  media: { primary: '/images/halo.jpg', gallery: ['/images/halo.jpg', '/images/detail.jpg'] },
  description: 'Signature halo pendant with luminescent gradients.',
  materials: [{ name: 'Platinum' }],
  gemstones: [{ name: 'Opal' }],
  metadata: { accentTone: 'cyan', tagline: 'Iridescent glow for every drop.' },
}

describe('catalogRepository', () => {
  beforeEach(() => {
    collectionFactory.current = createCollectionSpies()
  })

  it('maps MongoDB documents to catalog previews', async () => {
    const spies = collectionFactory.current._spies as { toArray: jest.Mock }
    spies.toArray.mockResolvedValueOnce([sampleDoc])

    const previews = await getCatalogProducts(4)

    expect(previews).toHaveLength(1)
    expect(previews[0]).toMatchObject({
      slug: 'neon-halo-necklace',
      price: 1280,
      tone: 'cyan',
      heroImage: '/images/halo.jpg',
    })
  })

  it('falls back to default previews when the collection is empty', async () => {
    const previews = await getCatalogProducts(4)
    expect(previews).toEqual(defaultCatalogProducts)
  })

  it('returns detailed product data for known slugs', async () => {
    const findOneMock = collectionFactory.current.findOne as jest.Mock
    findOneMock.mockResolvedValueOnce(sampleDoc)

    const detail = await getCatalogProductBySlug('neon-halo-necklace')

    expect(detail).toMatchObject({
      slug: 'neon-halo-necklace',
      description: sampleDoc.description,
      mediaGallery: sampleDoc.media.gallery,
      materials: ['Platinum'],
    })
  })

  it('returns fallback data when the product is missing', async () => {
    const slug = defaultCatalogProducts[0]?.slug ?? 'missing'
    const detail = await getCatalogProductBySlug(slug)
    expect(detail).toMatchObject({
      slug,
      description: defaultCatalogProductDetails[slug]?.description,
      mediaGallery: defaultCatalogProductDetails[slug]?.gallery,
    })
  })

  it('falls back to default previews when the query throws', async () => {
    const spies = collectionFactory.current._spies as { toArray: jest.Mock }
    spies.toArray.mockRejectedValueOnce(new Error('database offline'))

    const previews = await getCatalogProducts(4)
    expect(previews).toEqual(defaultCatalogProducts)
  })

  it('returns fallback detail when repository lookup fails', async () => {
    const slug = defaultCatalogProducts[1]?.slug ?? 'missing'
    const findOneMock = collectionFactory.current.findOne as jest.Mock
    findOneMock.mockRejectedValueOnce(new Error('timeout'))

    const detail = await getCatalogProductBySlug(slug)
    const expected = defaultCatalogProductDetails[slug]
    expect(detail).toMatchObject({ description: expected?.description })
  })
})
