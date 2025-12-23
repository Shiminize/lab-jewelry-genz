const fs = require('node:fs')
const path = require('node:path')

function readManifest() {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'models', 'neon', 'manifest.json')
    const raw = fs.readFileSync(manifestPath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to read customizer manifest for memory DB seeding', error)
    return { variants: [] }
  }
}

const manifest = readManifest()

const marketingByVariantId = new Map(
  (manifest?.variants ?? [])
    .filter((variant) => typeof variant.id === 'string')
    .map((variant) => [variant.id, variant.marketingImage ?? variant.poster])
    .filter((entry) => typeof entry[1] === 'string' && entry[1].length > 0),
)

function marketingImageForVariant(variantId, fallback) {
  if (!variantId) return fallback
  const image = marketingByVariantId.get(variantId)
  return typeof image === 'string' && image.length > 0 ? image : fallback
}

module.exports = function seedMemoryDb(memoryStore) {
  const existingProducts = memoryStore.get('products')
  if (!existingProducts || existingProducts.size === 0) {
    const products = existingProducts ?? new Map()
    memoryStore.set('products', products)

    const docs = [
      {
        _id: 'classic-solitaire',
        sku: 'RING-SOL-001',
        name: 'Classic Solitaire',
        category: 'rings',
        description:
          'Timeless elegance with our classic solitaire setting, showcasing a brilliant lab-grown diamond calibrated for Neon Dream lighting.',
        images: {
          primary: marketingImageForVariant('ring-classic-002', '/images/products/static/classic-solitaire/hero.webp'),
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-platinum/0.webp',
            '/images/products/3d-sequences/ring-luxury-001-platinum/6.webp',
            '/images/products/3d-sequences/ring-luxury-001-platinum/12.webp',
          ],
        },
        basePrice: 2500,
        materials: [
          { name: 'Platinum 950' },
          { name: 'Lab-grown diamond (1.5ct)' },
        ],
        gemstones: [{ name: 'Brilliant-cut center stone' }],
        metadata: {
          accentTone: 'volt',
          tagline: 'Timeless solitaire brilliance calibrated for Neon.',
          variantId: 'ring-classic-002',
          sortWeight: 10,
          readyToShip: true,
          primaryMetal: 'Platinum',
        },
      },
      {
        _id: 'halo-diamond-ring',
        sku: 'RING-HALO-001',
        name: 'Halo Diamond Ring',
        category: 'rings',
        description:
          'An ethereal halo of micro pavé stones amplifies the glow of your center gem with HDR-ready sparkle.',
        images: {
          primary: marketingImageForVariant('ring-luxury-001', '/images/products/static/halo-diamond-ring/hero.webp'),
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/0.webp',
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/5.webp',
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/11.webp',
          ],
        },
        basePrice: 3200,
        materials: [
          { name: '14K rose gold' },
          { name: 'Lab-grown diamonds (halo + shank)' },
        ],
        gemstones: [{ name: 'Radiant-cut center stone' }],
        metadata: {
          accentTone: 'cyan',
          tagline: 'Amplified glow with a Neon halo surround.',
          variantId: 'ring-luxury-001',
          sortWeight: 20,
          readyToShip: false,
          primaryMetal: '14K Rose Gold',
        },
      },
      {
        _id: 'three-stone-ring',
        sku: 'RING-TRI-001',
        name: 'Three Stone Ring',
        category: 'rings',
        description: 'Symbolize your past, present, and future with three radiant stones set in a floating bridge.',
        images: {
          primary: marketingImageForVariant('ring-luxury-001', '/images/products/static/three-stone-ring/hero.webp'),
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-white-gold/0.webp',
            '/images/products/3d-sequences/ring-luxury-001-white-gold/4.webp',
            '/images/products/3d-sequences/ring-luxury-001-white-gold/9.webp',
          ],
        },
        basePrice: 4500,
        materials: [
          { name: '18K white gold' },
          { name: 'Lab-grown diamonds (1.2ct total weight)' },
        ],
        gemstones: [
          { name: 'Round brilliant center' },
          { name: 'Tapered baguette accents' },
        ],
        metadata: {
          accentTone: 'magenta',
          tagline: 'Three-stone Neon gradient for milestone moments.',
          variantId: 'ring-luxury-001',
          sortWeight: 30,
          readyToShip: true,
          primaryMetal: '18K White Gold',
        },
      },
      {
        _id: 'diamond-pendant',
        sku: 'NECK-PEN-001',
        name: 'Diamond Pendant',
        category: 'necklaces',
        description: 'A floating pendant that layers iridescent textures with Neon glow for everyday statement.',
        images: {
          primary: marketingImageForVariant('astro-demo', '/images/products/static/diamond-pendant/hero.webp'),
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-yellow-gold/0.webp',
            '/images/products/3d-sequences/ring-luxury-001-yellow-gold/8.webp',
            '/images/products/3d-sequences/ring-luxury-001-yellow-gold/15.webp',
          ],
        },
        basePrice: 1200,
        materials: [
          { name: '14K yellow gold' },
          { name: 'Adjustable halo chain' },
        ],
        gemstones: [{ name: 'Lab-grown pear brilliant (0.9ct)' }],
        metadata: {
          accentTone: 'lime',
          tagline: 'Elegant pendant paired with iridescent gradients for everyday statement.',
          variantId: 'astro-demo',
          sortWeight: 40,
          readyToShip: true,
          primaryMetal: '14K Yellow Gold',
        },
      },
      {
        _id: 'tennis-necklace',
        sku: 'NECK-TEN-001',
        name: 'Tennis Necklace',
        category: 'necklaces',
        description:
          'A fluid line of lab-grown stones engineered for maximum shimmer under Neon Dream lighting presets.',
        images: {
          primary: '/images/products/static/tennis-necklace/hero.webp',
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-platinum/12.webp',
            '/images/products/3d-sequences/ring-luxury-001-platinum/18.webp',
            '/images/products/3d-sequences/ring-luxury-001-platinum/24.webp',
          ],
        },
        basePrice: 8500,
        materials: [{ name: 'Platinum 950' }],
        gemstones: [{ name: 'Lab-grown diamonds (6.5ct total weight)' }],
        metadata: {
          accentTone: 'volt',
          tagline: 'Continuous line of Neon-cut stones with a floating glow finish.',
          sortWeight: 50,
          readyToShip: false,
          limitedDrop: true,
          primaryMetal: 'Platinum',
        },
      },
      {
        _id: 'diamond-studs',
        sku: 'EAR-STUD-001',
        name: 'Diamond Studs',
        category: 'earrings',
        description:
          'Calibrated lab-grown studs that hold their brilliance across studio, daylight, and Neon Dream scenes.',
        images: {
          primary: '/images/products/static/diamond-studs/hero.webp',
          gallery: [
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/18.webp',
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/24.webp',
            '/images/products/3d-sequences/ring-luxury-001-rose-gold/30.webp',
          ],
        },
        basePrice: 800,
        materials: [{ name: 'Recycled 18K gold' }],
        gemstones: [{ name: 'Lab-grown brilliant pair (1.2ct total weight)' }],
        metadata: {
          accentTone: 'cyan',
          tagline: 'Classic stud earrings calibrated for Neon Dream lighting.',
          sortWeight: 60,
          readyToShip: true,
          primaryMetal: '18K Yellow Gold',
        },
      },
    ]

    docs.forEach((doc) => {
      products.set(doc._id, doc)
    })
  }

  if (!memoryStore.has('carts')) {
    memoryStore.set('carts', new Map())
  }
}
