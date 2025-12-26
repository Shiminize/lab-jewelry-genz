export const catalog = [
  {
    id: 'aurora-ring-solaris',
    title: 'Solaris Aura Ring',
    price: 3850,
    description: 'Lab diamond halo with coral glow pavé.',
    tags: ['halo', 'lab diamond', 'ready to ship'],
    shippingPromise: 'Ships this week',
    image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/earrings/sample.jpg',
    category: 'ring',
    readyToShip: true,
    metal: '14k_yellow',
    slug: 'solaris-aura-ring',
  },
  {
    id: 'aurora-ear-constellation',
    title: 'Constellation Ear Stack',
    price: 1480,
    description: 'Three-piece ear stack in mixed metals for instant layering.',
    tags: ['ear stack', 'mixed metal'],
    shippingPromise: 'Arrives in 5 days',
    image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/earrings/sample.jpg',
    category: 'earring',
    readyToShip: true,
    metal: '14k_white',
    slug: 'constellation-ear-stack',
  },
  {
    id: 'aurora-necklace-lumina',
    title: 'Lumina Pendant Necklace',
    price: 2420,
    description: 'Floating pear-cut centerpiece with coral sky gradient chain.',
    tags: ['minimal', 'statement'],
    shippingPromise: 'Ships next week',
    image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/necklaces/sample.jpg',
    category: 'necklace',
    readyToShip: true,
    metal: 'silver',
    slug: 'lumina-pendant-necklace',
  },
  {
    id: 'aurora-rose-band',
    title: 'Rose Glow Band',
    price: 420,
    description: 'Minimal rose gold band with subtle knife edge.',
    tags: ['gift', 'ready to ship', 'rose gold'],
    shippingPromise: 'Ships tomorrow',
    image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/rings/sample.jpg',
    category: 'ring',
    readyToShip: true,
    metal: '14k_rose',
    slug: 'rose-glow-band',
  },
  {
    id: 'aurora-rose-lariat',
    title: 'Blush Lariat Necklace',
    price: 325,
    description: 'Delicate lariat in rose gold with micro diamond accent.',
    tags: ['gift', 'ready to ship', 'rose gold'],
    shippingPromise: 'Ships this week',
    image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/necklaces/sample.jpg',
    category: 'necklace',
    readyToShip: true,
    metal: '14k_rose',
    slug: 'blush-lariat-necklace',
  },
]

export default function fallbackProducts(filters: Record<string, unknown>) {
  // Support both priceMax (new) and budgetMax (legacy) for backwards compatibility
  const priceMax = typeof filters?.priceMax === 'number' ? (filters.priceMax as number)
    : typeof filters?.budgetMax === 'number' ? (filters.budgetMax as number)
      : undefined

  const normalized = {
    priceMax,
    readyToShip: typeof filters?.readyToShip === 'boolean' ? (filters.readyToShip as boolean) : undefined,
    category: typeof filters?.category === 'string' ? (filters.category as string) : undefined,
    metal: typeof filters?.metal === 'string' ? (filters.metal as string) : undefined,
  }

  return catalog.filter((item) => {
    if (typeof normalized.priceMax === 'number' && item.price > normalized.priceMax) {
      return false
    }
    if (normalized.readyToShip && !item.readyToShip) {
      return false
    }
    if (normalized.category && item.category && normalized.category !== item.category) {
      return false
    }
    if (normalized.metal && item.metal && normalized.metal !== item.metal) {
      return false
    }
    return true
  })
}
