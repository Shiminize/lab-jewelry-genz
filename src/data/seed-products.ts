/**
 * Seed Data for Initial Product Catalog
 * 50 lab-grown diamond jewelry products as specified in PRD
 * Organized by category with full customization options
 */

import { Product, Material, Gemstone, SizeOption } from '@/types/product'

// Standard materials across all products
export const STANDARD_MATERIALS: Material[] = [
  {
    id: 'gold-14k-yellow',
    type: 'gold',
    name: '14K Yellow Gold',
    purity: '14K',
    priceMultiplier: 1.0,
    description: 'Classic yellow gold with warm, rich tone',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  },
  {
    id: 'gold-14k-white',
    type: 'white-gold',
    name: '14K White Gold',
    purity: '14K',
    priceMultiplier: 1.1,
    description: 'Modern white gold with rhodium plating',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  },
  {
    id: 'gold-14k-rose',
    type: 'rose-gold',
    name: '14K Rose Gold',
    purity: '14K',
    priceMultiplier: 1.05,
    description: 'Romantic rose gold with copper alloy',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  },
  {
    id: 'platinum-950',
    type: 'platinum',
    name: '950 Platinum',
    purity: '950',
    priceMultiplier: 1.8,
    description: 'Precious platinum for ultimate luxury',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  },
  {
    id: 'silver-925',
    type: 'silver',
    name: '925 Sterling Silver',
    purity: '925',
    priceMultiplier: 0.3,
    description: 'Classic sterling silver for everyday elegance',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  }
]

// Standard lab-grown diamonds
export const STANDARD_GEMSTONES: Gemstone[] = [
  {
    id: 'diamond-lab-round-050',
    type: 'diamond',
    isLabGrown: true,
    carat: 0.5,
    color: 'F',
    clarity: 'VVS1',
    cut: 'Round Brilliant',
    certification: {
      agency: 'IGI',
      certificateNumber: 'LG123456789'
    },
    priceMultiplier: 1.0,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  },
  {
    id: 'diamond-lab-round-100',
    type: 'diamond',
    isLabGrown: true,
    carat: 1.0,
    color: 'G',
    clarity: 'VS1',
    cut: 'Round Brilliant',
    certification: {
      agency: 'IGI'
    },
    priceMultiplier: 2.2,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  },
  {
    id: 'diamond-lab-princess-075',
    type: 'diamond',
    isLabGrown: true,
    carat: 0.75,
    color: 'F',
    clarity: 'VVS2',
    cut: 'Princess',
    certification: {
      agency: 'IGI'
    },
    priceMultiplier: 1.6,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  }
]

// Ring sizes
export const RING_SIZES: SizeOption[] = [
  { id: 'ring-4', category: 'rings', value: '4', measurement: { unit: 'mm', value: 14.8 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-5', category: 'rings', value: '5', measurement: { unit: 'mm', value: 15.6 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-6', category: 'rings', value: '6', measurement: { unit: 'mm', value: 16.5 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-7', category: 'rings', value: '7', measurement: { unit: 'mm', value: 17.3 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-8', category: 'rings', value: '8', measurement: { unit: 'mm', value: 18.1 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-9', category: 'rings', value: '9', measurement: { unit: 'mm', value: 19.0 }, availability: true, priceAdjustment: 0 },
  { id: 'ring-10', category: 'rings', value: '10', measurement: { unit: 'mm', value: 19.8 }, availability: true, priceAdjustment: 0 }
]

// Necklace lengths
export const NECKLACE_LENGTHS: SizeOption[] = [
  { id: 'neck-16', category: 'necklaces', value: '16"', measurement: { unit: 'inches', value: 16 }, availability: true, priceAdjustment: 0 },
  { id: 'neck-18', category: 'necklaces', value: '18"', measurement: { unit: 'inches', value: 18 }, availability: true, priceAdjustment: 25 },
  { id: 'neck-20', category: 'necklaces', value: '20"', measurement: { unit: 'inches', value: 20 }, availability: true, priceAdjustment: 50 },
  { id: 'neck-22', category: 'necklaces', value: '22"', measurement: { unit: 'inches', value: 22 }, availability: true, priceAdjustment: 75 }
]

// Helper function to generate consistent product data
function createProduct(
  name: string,
  category: Product['category'],
  subcategory: Product['subcategory'],
  basePrice: number,
  description: string,
  overrides: Partial<Product> = {}
): Omit<Product, '_id' | 'createdAt' | 'updatedAt'> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const sku = `GG-${category.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  return {
    name,
    description,
    category,
    subcategory,
    pricing: {
      basePrice,
      currency: 'USD',
      priceRange: {
        min: basePrice,
        max: basePrice * 2.5 // With premium customizations
      }
    },
    inventory: {
      sku,
      quantity: 100,
      reserved: 0,
      available: 100,
      lowStockThreshold: 10,
      isCustomMade: true,
      leadTime: { min: 7, max: 14 }
    },
    media: {
      primary: `/images/products/${slug}-primary.jpg`,
      gallery: [
        `/images/products/${slug}-gallery-1.jpg`,
        `/images/products/${slug}-gallery-2.jpg`,
        `/images/products/${slug}-gallery-3.jpg`
      ],
      thumbnail: `/images/products/${slug}-thumbnail.jpg`,
      model3D: {
        glb: `/models/${slug}.glb`,
        textures: [`/textures/${slug}-diffuse.jpg`, `/textures/${slug}-normal.jpg`]
      }
    },
    customization: {
      materials: STANDARD_MATERIALS,
      gemstones: category === 'rings' ? STANDARD_GEMSTONES : undefined,
      sizes: category === 'rings' ? RING_SIZES : 
             category === 'necklaces' ? NECKLACE_LENGTHS : [],
      engraving: {
        available: true,
        maxCharacters: 20,
        fonts: ['Script', 'Block', 'Serif'],
        positions: category === 'rings' ? ['inside'] : ['back'],
        pricePerCharacter: 5
      }
    },
    seo: {
      slug,
      metaTitle: `${name} | Lab-Grown Diamond Jewelry | GlowGlitch`,
      metaDescription: `${description} Customizable lab-grown diamond jewelry with ethical sourcing and sustainable practices.`,
      keywords: [name.toLowerCase(), category, 'lab-grown diamond', 'sustainable jewelry', 'custom jewelry'],
      openGraph: {
        title: name,
        description,
        image: `/images/products/${slug}-og.jpg`
      }
    },
    certifications: {
      hallmarks: ['14K', 'GG'],
      gemCertificates: ['IGI-LG123456'],
      sustainabilityCerts: ['Carbon Neutral Certified', 'Ethical Sourcing'],
      qualityAssurance: {
        warrantyPeriod: 2,
        returnPolicy: 30,
        careInstructions: [
          'Clean with mild soap and water',
          'Store in jewelry box when not wearing',
          'Avoid harsh chemicals and extreme temperatures'
        ]
      }
    },
    metadata: {
      featured: false,
      bestseller: false,
      newArrival: true,
      limitedEdition: false,
      status: 'active',
      collections: ['Signature'],
      tags: ['lab-grown', 'sustainable', 'customizable'],
      difficulty: 'beginner'
    },
    analytics: {
      views: Math.floor(Math.random() * 1000) + 100,
      customizations: Math.floor(Math.random() * 50) + 10,
      purchases: Math.floor(Math.random() * 20) + 5,
      conversionRate: 0.05 + Math.random() * 0.10,
      averageTimeOnPage: 120 + Math.random() * 180
    },
    ...overrides
  }
}

// Seed products by category
export const SEED_PRODUCTS: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // ENGAGEMENT RINGS (10 products)
  createProduct(
    'Eternal Solitaire Ring',
    'rings',
    'engagement-rings',
    2400,
    'Timeless solitaire engagement ring featuring a brilliant lab-grown diamond in your choice of precious metal.',
    { metadata: { featured: true, bestseller: true, collections: ['Bridal', 'Signature'] } }
  ),
  
  createProduct(
    'Classic Six-Prong Engagement Ring',
    'rings',
    'engagement-rings',
    2800,
    'Traditional six-prong setting that maximizes light reflection and showcases your diamond beautifully.'
  ),

  createProduct(
    'Vintage Art Deco Ring',
    'rings',
    'engagement-rings',
    3200,
    'Inspired by 1920s glamour, this intricate ring features geometric details and milgrain accents.',
    { metadata: { collections: ['Vintage', 'Luxury'] } }
  ),

  createProduct(
    'Modern Halo Engagement Ring',
    'rings',
    'engagement-rings',
    3600,
    'Contemporary halo design that amplifies your center stone with a circle of brilliant diamonds.',
    { metadata: { featured: true } }
  ),

  createProduct(
    'Three-Stone Anniversary Ring',
    'rings',
    'engagement-rings',
    4200,
    'Symbolic three-stone design representing past, present, and future of your love story.'
  ),

  createProduct(
    'Princess Cut Solitaire',
    'rings',
    'engagement-rings',
    2600,
    'Clean lines and modern elegance with a stunning princess-cut lab-grown diamond centerpiece.'
  ),

  createProduct(
    'Emerald Cut Elegance Ring',
    'rings',
    'engagement-rings',
    3800,
    'Sophisticated emerald-cut diamond in a sleek setting that emphasizes clarity and brilliance.'
  ),

  createProduct(
    'Oval Diamond Halo Ring',
    'rings',
    'engagement-rings',
    3400,
    'Elongated oval diamond surrounded by a delicate halo for maximum sparkle and finger coverage.'
  ),

  createProduct(
    'Cushion Cut Vintage Ring',
    'rings',
    'engagement-rings',
    3000,
    'Romantic cushion-cut diamond in a vintage-inspired setting with intricate metalwork.'
  ),

  createProduct(
    'Radiant Cut Modern Ring',
    'rings',
    'engagement-rings',
    3500,
    'Bold radiant-cut diamond in a contemporary setting that maximizes fire and brilliance.'
  ),

  // WEDDING BANDS (8 products)
  createProduct(
    'Classic Wedding Band',
    'rings',
    'wedding-bands',
    800,
    'Timeless plain band in your choice of metal, perfect for everyday wear.',
    { metadata: { bestseller: true } }
  ),

  createProduct(
    'Diamond Eternity Band',
    'rings',
    'wedding-bands',
    1800,
    'Continuous circle of lab-grown diamonds representing eternal love.'
  ),

  createProduct(
    'Milgrain Wedding Band',
    'rings',
    'wedding-bands',
    950,
    'Vintage-inspired band with delicate milgrain detailing around the edges.'
  ),

  createProduct(
    'Twisted Rope Wedding Band',
    'rings',
    'wedding-bands',
    1200,
    'Textured rope design that catches light beautifully and adds visual interest.'
  ),

  createProduct(
    'Half Eternity Diamond Band',
    'rings',
    'wedding-bands',
    1400,
    'Diamonds halfway around the band for comfort and stunning sparkle.'
  ),

  createProduct(
    'Brushed Finish Wedding Band',
    'rings',
    'wedding-bands',
    900,
    'Modern matte finish that complements both traditional and contemporary engagement rings.'
  ),

  createProduct(
    'Channel Set Diamond Band',
    'rings',
    'wedding-bands',
    1600,
    'Sleek channel setting protects diamonds while creating a smooth, continuous line.'
  ),

  createProduct(
    'Vintage Filigree Band',
    'rings',
    'wedding-bands',
    1100,
    'Intricate filigree work inspired by antique jewelry designs.'
  ),

  // FASHION RINGS (7 products)
  createProduct(
    'Stackable Diamond Ring',
    'rings',
    'fashion-rings',
    600,
    'Delicate stackable ring perfect for creating personalized ring combinations.',
    { metadata: { collections: ['Everyday', 'Stackable'] } }
  ),

  createProduct(
    'Cocktail Statement Ring',
    'rings',
    'fashion-rings',
    2200,
    'Bold cocktail ring with a large center stone for making a glamorous statement.'
  ),

  createProduct(
    'Bypass Diamond Ring',
    'rings',
    'fashion-rings',
    1800,
    'Modern bypass design with diamonds that appear to wrap around your finger.'
  ),

  createProduct(
    'Art Nouveau Inspired Ring',
    'rings',
    'fashion-rings',
    1600,
    'Flowing organic lines inspired by the Art Nouveau movement.'
  ),

  createProduct(
    'Geometric Modern Ring',
    'rings',
    'fashion-rings',
    1400,
    'Contemporary geometric design for the modern woman.'
  ),

  createProduct(
    'Flower Motif Ring',
    'rings',
    'fashion-rings',
    1200,
    'Delicate floral design with diamond accents.'
  ),

  createProduct(
    'Infinity Symbol Ring',
    'rings',
    'fashion-rings',
    1000,
    'Symbolic infinity design representing endless possibilities.'
  ),

  // NECKLACES (10 products)
  createProduct(
    'Diamond Solitaire Pendant',
    'necklaces',
    'pendants',
    1200,
    'Classic solitaire pendant showcasing a single brilliant lab-grown diamond.',
    { metadata: { bestseller: true } }
  ),

  createProduct(
    'Halo Diamond Pendant',
    'necklaces',
    'pendants',
    1800,
    'Center diamond surrounded by smaller diamonds for maximum sparkle.'
  ),

  createProduct(
    'Heart Shaped Diamond Pendant',
    'necklaces',
    'pendants',
    1600,
    'Romantic heart-shaped pendant perfect for expressing love.'
  ),

  createProduct(
    'Three-Stone Diamond Pendant',
    'necklaces',
    'pendants',
    2200,
    'Three graduated diamonds representing your journey together.'
  ),

  createProduct(
    'Diamond Tennis Necklace',
    'necklaces',
    'chains',
    4800,
    'Continuous line of brilliant diamonds for ultimate elegance.',
    { metadata: { featured: true, collections: ['Luxury'] } }
  ),

  createProduct(
    'Delicate Chain Necklace',
    'necklaces',
    'chains',
    400,
    'Simple chain perfect for layering or wearing alone.',
    { metadata: { collections: ['Everyday'] } }
  ),

  createProduct(
    'Station Diamond Necklace',
    'necklaces',
    'chains',
    2800,
    'Spaced diamonds along a delicate chain for subtle sparkle.'
  ),

  createProduct(
    'Layered Chain Set',
    'necklaces',
    'chains',
    800,
    'Three coordinating chains designed to be worn together.'
  ),

  createProduct(
    'Diamond Choker',
    'necklaces',
    'chokers',
    2400,
    'Modern choker style with evenly spaced diamonds.'
  ),

  createProduct(
    'Y-Drop Diamond Necklace',
    'necklaces',
    'statement-necklaces',
    3200,
    'Elegant Y-shaped design with diamonds cascading down the center.'
  ),

  // EARRINGS (10 products)
  createProduct(
    'Diamond Stud Earrings',
    'earrings',
    'studs',
    1400,
    'Classic diamond studs in secure screw-back settings.',
    { metadata: { bestseller: true, featured: true } }
  ),

  createProduct(
    'Halo Diamond Studs',
    'earrings',
    'studs',
    2200,
    'Center diamonds enhanced with sparkling halos.'
  ),

  createProduct(
    'Diamond Huggie Hoops',
    'earrings',
    'hoops',
    1600,
    'Small hoops that hug the earlobe with diamond accents.'
  ),

  createProduct(
    'Classic Gold Hoops',
    'earrings',
    'hoops',
    600,
    'Timeless hoop earrings in polished gold.'
  ),

  createProduct(
    'Diamond Drop Earrings',
    'earrings',
    'drops',
    2800,
    'Elegant drops with movement and sparkle.'
  ),

  createProduct(
    'Pearl and Diamond Drops',
    'earrings',
    'drops',
    1800,
    'Classic combination of pearls and diamonds.'
  ),

  createProduct(
    'Ear Climber Earrings',
    'earrings',
    'climbers',
    1200,
    'Modern climbers that follow the curve of your ear.'
  ),

  createProduct(
    'Chandelier Diamond Earrings',
    'earrings',
    'drops',
    3600,
    'Dramatic chandelier style for special occasions.'
  ),

  createProduct(
    'Threader Earrings',
    'earrings',
    'drops',
    800,
    'Delicate threader style for a minimalist look.'
  ),

  createProduct(
    'Geometric Stud Earrings',
    'earrings',
    'studs',
    1000,
    'Modern geometric shapes with diamond accents.'
  ),

  // BRACELETS (5 products)
  createProduct(
    'Diamond Tennis Bracelet',
    'bracelets',
    'tennis-bracelets',
    3800,
    'Classic tennis bracelet with lab-grown diamonds.',
    { metadata: { featured: true, collections: ['Luxury'] } }
  ),

  createProduct(
    'Diamond Bangle',
    'bracelets',
    'bangles',
    2200,
    'Sleek bangle with diamond accents.'
  ),

  createProduct(
    'Chain Link Bracelet',
    'bracelets',
    'chain-bracelets',
    800,
    'Classic chain bracelet perfect for charms.'
  ),

  createProduct(
    'Infinity Diamond Bracelet',
    'bracelets',
    'chain-bracelets',
    1600,
    'Delicate bracelet with infinity symbol design.'
  ),

  createProduct(
    'Bezel Set Diamond Bracelet',
    'bracelets',
    'chain-bracelets',
    2400,
    'Modern bezel settings showcase each diamond beautifully.'
  )
]