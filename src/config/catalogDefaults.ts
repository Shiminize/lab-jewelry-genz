import manifest from '@/../public/models/neon/manifest.json'

export type CatalogTone = 'volt' | 'cyan' | 'magenta' | 'lime'

export interface CatalogPreviewProduct {
  slug: string
  name: string
  category: string
  price: number
  tone: CatalogTone
  heroImage?: string
  tagline?: string
  variantId?: string
  sortWeight?: number
  limitedDrop?: boolean
  readyToShip?: boolean
  metal?: string
  bestseller?: boolean
}

export interface CatalogFallbackDetail extends CatalogPreviewProduct {
  description?: string
  materials?: string[]
  gemstones?: string[]
  gallery?: string[]
  inspiration?: string
  highlights?: string[]
}

const FALLBACK_MARKETING = {
  classicSolitaire: '/images/products/static/classic-solitaire/hero.webp',
  haloDiamondRing: '/images/products/static/halo-diamond-ring/hero.webp',
  threeStoneRing: '/images/products/static/three-stone-ring/hero.webp',
  diamondPendant: '/images/products/static/diamond-pendant/hero.webp',
  tennisNecklace: '/images/products/static/tennis-necklace/hero.webp',
  diamondStuds: '/images/products/static/diamond-studs/hero.webp',
} as const

const marketingByVariantId: Record<string, string> = Object.fromEntries(
  (manifest.variants ?? [])
    .filter((variant) => typeof variant.id === 'string')
    .map((variant) => [variant.id, variant.marketingImage ?? variant.poster ?? ''])
    .filter((entry) => typeof entry[1] === 'string' && entry[1] !== ''),
)

function marketingImageFor(variantId: string | undefined, fallback: string) {
  if (!variantId) return fallback
  const image = marketingByVariantId[variantId]
  return image && image.length > 0 ? image : fallback
}

export const defaultCatalogProducts: CatalogPreviewProduct[] = [
  {
    slug: 'classic-solitaire',
    name: 'Classic Solitaire',
    category: 'Rings',
    price: 2500,
    tone: 'volt',
    variantId: 'ring-classic-002',
    heroImage: marketingImageFor('ring-classic-002', FALLBACK_MARKETING.classicSolitaire),
    tagline: 'Timeless elegance with our classic solitaire setting and radiant lab-grown diamond.',
    sortWeight: 10,
    readyToShip: true,
    metal: 'Platinum',
  },
  {
    slug: 'halo-diamond-ring',
    name: 'Halo Diamond Ring',
    category: 'Rings',
    price: 3200,
    tone: 'cyan',
    variantId: 'ring-luxury-001',
    heroImage: marketingImageFor('ring-luxury-001', FALLBACK_MARKETING.haloDiamondRing),
    tagline: 'Halo setting that amplifies the brilliance of your center stone.',
    sortWeight: 20,
    readyToShip: false,
    metal: 'Rose Gold',
  },
  {
    slug: 'three-stone-ring',
    name: 'Three Stone Ring',
    category: 'Rings',
    price: 4500,
    tone: 'magenta',
    variantId: 'ring-luxury-001',
    heroImage: marketingImageFor('ring-luxury-001', FALLBACK_MARKETING.threeStoneRing),
    tagline: 'Symbolize your past, present, and future with sculpted Neon brilliance.',
    sortWeight: 30,
    readyToShip: true,
    metal: 'White Gold',
  },
  {
    slug: 'diamond-pendant',
    name: 'Diamond Pendant',
    category: 'Necklaces',
    price: 1200,
    tone: 'lime',
    variantId: 'astro-demo',
    heroImage: marketingImageFor('astro-demo', FALLBACK_MARKETING.diamondPendant),
    tagline: 'Elegant pendant paired with iridescent gradients for everyday statement.',
    sortWeight: 40,
    readyToShip: true,
    metal: 'Yellow Gold',
  },
  {
    slug: 'tennis-necklace',
    name: 'Tennis Necklace',
    category: 'Necklaces',
    price: 8500,
    tone: 'volt',
    heroImage: FALLBACK_MARKETING.tennisNecklace,
    tagline: 'Continuous line of Neon-cut stones with a floating glow finish.',
    sortWeight: 50,
    limitedDrop: true,
    readyToShip: false,
    metal: 'Platinum',
  },
  {
    slug: 'diamond-studs',
    name: 'Diamond Studs',
    category: 'Earrings',
    price: 800,
    tone: 'cyan',
    heroImage: FALLBACK_MARKETING.diamondStuds,
    tagline: 'Classic stud earrings calibrated for Neon Dream lighting.',
    sortWeight: 60,
    readyToShip: true,
    metal: 'Yellow Gold',
  },
]

export const defaultCatalogProductDetails: Record<string, CatalogFallbackDetail> = {
  'classic-solitaire': {
    ...defaultCatalogProducts[0],
    description:
      'Timeless elegance with our classic solitaire setting, showcasing a brilliant lab-grown diamond calibrated for Neon Dream lighting.',
    materials: ['Platinum 950', 'Lab-grown diamond (1.5ct)'],
    gemstones: ['Brilliant-cut center stone'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-platinum/0.webp',
      '/images/products/3d-sequences/ring-luxury-001-platinum/6.webp',
      '/images/products/3d-sequences/ring-luxury-001-platinum/12.webp',
    ],
    inspiration:
      'Designed to capture the clean geometry of the Neon Dream hero interface, this solitaire mirrors the prismatic gradients that define the brand.',
    highlights: ['Knife-edge shank with mirror polish', 'Lab-grown center stone graded DEF | VVS2', 'Invisible prong seat for seamless angles'],
  },
  'halo-diamond-ring': {
    ...defaultCatalogProducts[1],
    description: 'An ethereal halo of micro pavé stones amplifies the glow of your center gem with HDR-ready sparkle.',
    materials: ['14K rose gold', 'Lab-grown halo diamonds'],
    gemstones: ['Radiant-cut center stone'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/0.webp',
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/5.webp',
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/11.webp',
    ],
    inspiration:
      'Built for high-shine campaign shoots, the floating halo throws light in every direction, ideal for the Neon lighting stack.',
    highlights: ['Micro pavé halo with 72 stones', 'Tapered bridge to maximize sparkle on camera', 'Comfort-fit interior for creators on set all day'],
  },
  'three-stone-ring': {
    ...defaultCatalogProducts[2],
    description: 'Symbolize your past, present, and future with three radiant stones set in a floating bridge.',
    materials: ['18K white gold', 'Lab-grown diamonds (1.2ct total weight)'],
    gemstones: ['Round brilliant center', 'Tapered baguette accents'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-white-gold/0.webp',
      '/images/products/3d-sequences/ring-luxury-001-white-gold/4.webp',
      '/images/products/3d-sequences/ring-luxury-001-white-gold/9.webp',
    ],
    inspiration:
      'A bridge of baguettes inspired by Neon’s tri-tone gradients—perfect for milestone storytelling.',
    highlights: ['Floating gallery to maximize light return', 'Three-stone narrative for campaigns or gifting', 'Customizable side-stone proportions'],
  },
  'diamond-pendant': {
    ...defaultCatalogProducts[3],
    description: 'A floating pendant that layers iridescent textures with Neon glow for everyday statement.',
    materials: ['14K yellow gold', 'Adjustable halo chain'],
    gemstones: ['Lab-grown pear brilliant (0.9ct)'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-yellow-gold/0.webp',
      '/images/products/3d-sequences/ring-luxury-001-yellow-gold/8.webp',
      '/images/products/3d-sequences/ring-luxury-001-yellow-gold/15.webp',
    ],
    inspiration: 'A nod to the GlowGlitch UI orb, this pendant layers gradient reflections for lifestyle shoots.',
    highlights: ['Adjustable clasp with three drop lengths', 'Lab-grown pear brilliant halo', 'Polished backplate for engraved creator messages'],
  },
  'tennis-necklace': {
    ...defaultCatalogProducts[4],
    description: 'A fluid line of lab-grown stones engineered for maximum shimmer under Neon Dream lighting presets.',
    materials: ['Platinum 950'],
    gemstones: ['Lab-grown diamonds (6.5ct total weight)'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-platinum/12.webp',
      '/images/products/3d-sequences/ring-luxury-001-platinum/18.webp',
      '/images/products/3d-sequences/ring-luxury-001-platinum/24.webp',
    ],
    inspiration:
      'Designed for campaign motion, every link is calibrated for 120fps slow-mo shimmer.',
    highlights: ['Precision bezel-set stones', 'Secure double-lock clasp', 'Available in 16, 18, and 20 inch lengths'],
  },
  'diamond-studs': {
    ...defaultCatalogProducts[5],
    description: 'Calibrated lab-grown studs that hold their brilliance across studio, daylight, and Neon Dream scenes.',
    materials: ['Recycled 18K gold'],
    gemstones: ['Lab-grown brilliant pair (1.2ct total weight)'],
    gallery: [
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/18.webp',
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/24.webp',
      '/images/products/3d-sequences/ring-luxury-001-rose-gold/30.webp',
    ],
    inspiration: 'A staple for creator shoots, engineered to capture catchlights while staying featherlight.',
    highlights: ['Low-profile basket for everyday comfort', 'Matching screw backs included', 'Available in platinum, yellow, and rose gold'],
  },
}
