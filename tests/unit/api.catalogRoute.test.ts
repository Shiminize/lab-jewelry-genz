import { GET } from '@/app/api/neon/catalog/route'

jest.mock('@/services/neon', () => ({
  getCatalogProducts: jest.fn(async () => [
    { slug: 'neon-halo-necklace', name: 'Neon Halo Necklace' },
  ]),
}))

describe('GET /api/neon/catalog', () => {
  it('returns catalog data payload', async () => {
    const response = await GET()
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload).toEqual({
      success: true,
      data: [{ slug: 'neon-halo-necklace', name: 'Neon Halo Necklace' }],
    })
  })
})
