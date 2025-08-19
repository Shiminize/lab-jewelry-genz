/**
 * Generate CommonJS version of seed data from TypeScript
 * Run with: node scripts/generate-seed-cjs.js
 */

// Create a simplified version for testing database seeding
const STANDARD_MATERIALS = [
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
    description: 'Premium platinum with exceptional durability',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  },
  {
    id: 'silver-sterling',
    type: 'silver',
    name: 'Sterling Silver',
    purity: '925',
    priceMultiplier: 0.15,
    description: 'Classic sterling silver',
    sustainability: {
      recycled: true,
      ethicallySourced: true,
      carbonNeutral: true
    }
  }
]

const STANDARD_GEMSTONES = [
  {
    id: 'diamond-lab-100-d-vvs1-round',
    type: 'diamond',
    isLabGrown: true,
    carat: 1.0,
    color: 'D',
    clarity: 'VVS1',
    cut: 'Round',
    certification: {
      agency: 'GIA',
      certificateNumber: 'GIA-2024-001'
    },
    priceMultiplier: 1.0,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  },
  {
    id: 'moissanite-100-colorless-vvs1-round',
    type: 'other',
    isLabGrown: true,
    carat: 1.0,
    color: 'Colorless',
    clarity: 'VVS1',
    cut: 'Round',
    certification: {
      agency: 'GIA'
    },
    priceMultiplier: 0.6,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  },
  {
    id: 'emerald-lab-050-green-vs-emerald',
    type: 'emerald',
    isLabGrown: true,
    carat: 0.5,
    color: 'Vivid Green',
    clarity: 'VS',
    cut: 'Emerald',
    certification: {
      agency: 'GIA'
    },
    priceMultiplier: 0.4,
    sustainability: {
      labGrown: true,
      conflictFree: true,
      traceable: true
    }
  }
]

// Simple product generator for testing
function createTestProduct(id, name, category, subcategory, basePrice) {
  const sku = `GG-${category.toUpperCase()}-${id.padStart(3, '0')}`
  
  return {
    name,
    description: `Beautiful ${name.toLowerCase()} crafted with lab-grown materials.`,
    category,
    subcategory,
    pricing: {
      basePrice,
      currency: 'USD',
      priceRange: {
        min: basePrice,
        max: basePrice * 1.5
      }
    },
    inventory: {
      sku,
      quantity: 100,
      reserved: 0,
      available: 100,
      lowStockThreshold: 10,
      isCustomMade: false,
      leadTime: {
        min: 3,
        max: 7
      }
    },
    media: {
      primary: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      gallery: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop&crop=center',
      model3D: {
        glb: '/models/ring-basic.glb',
        textures: ['/models/textures/gold.jpg']
      }
    },
    customization: {
      materials: STANDARD_MATERIALS.slice(0, 3),
      gemstones: STANDARD_GEMSTONES.slice(0, 1),
      sizes: [{
        id: 'size-6',
        category,
        value: '6',
        measurement: { unit: 'mm', value: 16.5 },
        availability: true,
        priceAdjustment: 0
      }],
      engraving: {
        available: true,
        maxCharacters: 20,
        fonts: ['Script', 'Block'],
        positions: ['inside'],
        pricePerCharacter: 5
      }
    },
    seo: {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      metaTitle: `${name} | GlowGlitch Jewelry`,
      metaDescription: `Shop ${name.toLowerCase()} at GlowGlitch. Lab-grown diamonds and sustainable jewelry.`,
      keywords: ['jewelry', 'lab-grown', 'sustainable'],
      openGraph: {
        title: name,
        description: `Beautiful ${name.toLowerCase()} from GlowGlitch`,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center'
      }
    },
    certifications: {
      hallmarks: ['14K'],
      gemCertificates: ['GIA-2024-001'],
      sustainabilityCerts: ['Carbon Neutral'],
      qualityAssurance: {
        warrantyPeriod: 2,
        returnPolicy: 30,
        careInstructions: ['Clean with soft cloth', 'Store separately']
      }
    },
    metadata: {
      featured: false,
      bestseller: false,
      newArrival: true,
      limitedEdition: false,
      status: 'active',
      collections: ['Gen Z'],
      tags: ['sustainable', 'lab-grown', 'customizable'],
      difficulty: 'beginner'
    }
  }
}

// Generate test products - smaller set for testing
const SEED_PRODUCTS = [
  createTestProduct('001', 'Classic Solitaire Ring', 'rings', 'engagement-rings', 1200),
  createTestProduct('002', 'Modern Halo Ring', 'rings', 'engagement-rings', 1500),
  createTestProduct('003', 'Diamond Stud Earrings', 'earrings', 'studs', 800),
  createTestProduct('004', 'Tennis Bracelet', 'bracelets', 'tennis-bracelets', 2200),
  createTestProduct('005', 'Pendant Necklace', 'necklaces', 'pendants', 900)
]

module.exports = {
  SEED_PRODUCTS,
  STANDARD_MATERIALS,
  STANDARD_GEMSTONES
}

console.log(`Generated ${SEED_PRODUCTS.length} test products for database seeding validation`)