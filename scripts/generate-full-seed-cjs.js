/**
 * Generate Complete 75-Product CommonJS Seed Data
 * Run with: node scripts/generate-full-seed-cjs.js
 */

// Enhanced materials for full catalog
const STANDARD_MATERIALS = [
  {
    id: 'gold-14k-yellow',
    type: 'gold',
    name: '14K Yellow Gold',
    purity: '14K',
    priceMultiplier: 1.0,
    description: 'Classic yellow gold with warm, rich tone',
    sustainability: { recycled: true, ethicallySourced: true, carbonNeutral: true }
  },
  {
    id: 'gold-14k-white',
    type: 'white-gold',
    name: '14K White Gold',
    purity: '14K',
    priceMultiplier: 1.1,
    description: 'Modern white gold with rhodium plating',
    sustainability: { recycled: true, ethicallySourced: true, carbonNeutral: true }
  },
  {
    id: 'gold-14k-rose',
    type: 'rose-gold',
    name: '14K Rose Gold',
    purity: '14K',
    priceMultiplier: 1.05,
    description: 'Romantic rose gold with copper alloy',
    sustainability: { recycled: true, ethicallySourced: true, carbonNeutral: true }
  },
  {
    id: 'platinum-950',
    type: 'platinum',
    name: '950 Platinum',
    purity: '950',
    priceMultiplier: 1.8,
    description: 'Premium platinum with exceptional durability',
    sustainability: { recycled: true, ethicallySourced: true, carbonNeutral: true }
  },
  {
    id: 'silver-sterling',
    type: 'silver',
    name: 'Sterling Silver',
    purity: '925',
    priceMultiplier: 0.15,
    description: 'Classic sterling silver',
    sustainability: { recycled: true, ethicallySourced: true, carbonNeutral: true }
  }
]

// Enhanced gemstones for full catalog
const STANDARD_GEMSTONES = [
  {
    id: 'diamond-lab-100-d-vvs1-round',
    type: 'diamond',
    isLabGrown: true,
    carat: 1.0,
    color: 'D',
    clarity: 'VVS1',
    cut: 'Round',
    certification: { agency: 'GIA', certificateNumber: 'GIA-2024-001' },
    priceMultiplier: 1.0,
    sustainability: { labGrown: true, conflictFree: true, traceable: true }
  },
  {
    id: 'moissanite-100-colorless-vvs1-round',
    type: 'other',
    isLabGrown: true,
    carat: 1.0,
    color: 'Colorless',
    clarity: 'VVS1',
    cut: 'Round',
    certification: { agency: 'GIA' },
    priceMultiplier: 0.6,
    sustainability: { labGrown: true, conflictFree: true, traceable: true }
  },
  {
    id: 'emerald-lab-050-green-vs-emerald',
    type: 'emerald',
    isLabGrown: true,
    carat: 0.5,
    color: 'Vivid Green',
    clarity: 'VS',
    cut: 'Emerald',
    certification: { agency: 'GIA' },
    priceMultiplier: 0.4,
    sustainability: { labGrown: true, conflictFree: true, traceable: true }
  },
  {
    id: 'moissanite-princess-100',
    type: 'other',
    isLabGrown: true,
    carat: 1.0,
    color: 'Colorless',
    clarity: 'VVS1',
    cut: 'Princess',
    certification: { agency: 'IGI' },
    priceMultiplier: 0.75,
    sustainability: { labGrown: true, conflictFree: true, traceable: true }
  },
  {
    id: 'sapphire-lab-075-blue-vs',
    type: 'sapphire',
    isLabGrown: true,
    carat: 0.75,
    color: 'Royal Blue',
    clarity: 'VS',
    cut: 'Round',
    certification: { agency: 'GIA' },
    priceMultiplier: 0.45,
    sustainability: { labGrown: true, conflictFree: true, traceable: true }
  }
]

// Helper function to get randomized gemstones for variety (deterministic based on product ID)
function getRandomGemstones(productId, count = 2) {
  // Create deterministic "random" selection based on product ID for consistency
  const seedValue = productId * 73 // Simple hash for deterministic randomness
  const shuffled = [...STANDARD_GEMSTONES]
  
  // Fisher-Yates shuffle with deterministic seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((seedValue * (i + 1)) % shuffled.length) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

const CATEGORY_IMAGE_MAP = {
  rings: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
  necklaces: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
  bracelets: '/images/category/bracelets/88000_RND_0700CT_Y_1_1600X1600.jpg',
  earrings: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
}

const HOMEPAGE_COLLECTION_SLOTS = {
  1: { collectionOrder: 1, collectionCategory: 'rings' },
  31: { collectionOrder: 2, collectionCategory: 'necklaces' },
  49: { collectionOrder: 3, collectionCategory: 'earrings' },
}

const HOMEPAGE_SPOTLIGHT_SLOTS = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
}

// Product generator function
function createProduct(id, name, category, subcategory, basePrice, description, collections = [], sustainabilityImpact = null, slotOverrides = null) {
  const sku = `GG-${category.toUpperCase()}-${id.toString().padStart(3, '0')}`
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const categoryImage = CATEGORY_IMAGE_MAP[category] ?? CATEGORY_IMAGE_MAP.rings

  const computedSlots = {
    ...(HOMEPAGE_COLLECTION_SLOTS[id] ?? {}),
    ...(HOMEPAGE_SPOTLIGHT_SLOTS[id] ? { spotlightOrder: HOMEPAGE_SPOTLIGHT_SLOTS[id] } : {}),
  }

  const finalDisplaySlots = {
    ...computedSlots,
    ...(slotOverrides ?? {}),
  }
  const hasDisplaySlots = Object.keys(finalDisplaySlots).length > 0

  const product = {
    name,
    description,
    category,
    subcategory,
    pricing: {
      basePrice,
      currency: 'USD',
      priceRange: { min: basePrice, max: Math.round(basePrice * 1.5) }
    },
    inventory: {
      sku,
      quantity: 100,
      reserved: 0,
      available: 100,
      lowStockThreshold: 10,
      isCustomMade: false,
      leadTime: { min: 3, max: 7 }
    },
    media: {
      primary: categoryImage,
      gallery: [categoryImage],
      thumbnail: categoryImage,
      model3D: {
        glb: '/models/ring-basic.glb',
        textures: ['/models/textures/gold.jpg']
      }
    },
    customization: {
      materials: STANDARD_MATERIALS.slice(0, 3),
      gemstones: getRandomGemstones(id, 2),
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
      slug,
      metaTitle: `${name} | GlowGlitch Jewelry`,
      metaDescription: `Shop ${name.toLowerCase()} at GlowGlitch. Lab-grown diamonds and sustainable jewelry.`,
      keywords: ['jewelry', 'lab-grown', 'sustainable', category],
      openGraph: {
        title: name,
        description: `Beautiful ${name.toLowerCase()} from GlowGlitch`,
        image: categoryImage
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
      featured: collections.includes('Featured'),
      bestseller: collections.includes('Bestseller'),
      newArrival: true,
      limitedEdition: false,
      status: 'active',
      collections: collections.length > 0 ? collections : ['Gen Z'],
      tags: ['sustainable', 'lab-grown', 'customizable'],
      difficulty: 'beginner',
      ...(sustainabilityImpact && { sustainabilityImpact }),
      ...(hasDisplaySlots ? { displaySlots: finalDisplaySlots } : {})
    }
  }

  return product
}

// Generate complete 75-product catalog
const SEED_PRODUCTS = [
  // RINGS (30 products total)
  // Original Collection (10 products)
  createProduct(1, 'Eternal Promise Solitaire', 'rings', 'engagement-rings', 1200, 'Classic solitaire engagement ring with lab-grown diamond', ['Bridal', 'Featured'], { carbonOffset: 5, treesPlanted: 3 }),
  createProduct(2, 'Modern Halo Engagement Ring', 'rings', 'engagement-rings', 1800, 'Contemporary halo setting with brilliant center stone', ['Bridal'], { oceanPlasticRemoved: 2, carbonOffset: 8 }),
  createProduct(3, 'Sustainable Three-Stone Ring', 'rings', 'engagement-rings', 2200, 'Three-stone ring representing past, present, future', ['Sustainable'], { carbonOffset: 12, artisansFunded: 2 }),
  createProduct(4, 'Conscious Cushion Cut Ring', 'rings', 'engagement-rings', 1650, 'Vintage-inspired cushion cut engagement ring', ['Vintage'], { carbonOffset: 6, treesPlanted: 4 }),
  createProduct(5, 'Promise of Tomorrow Ring', 'rings', 'fashion-rings', 450, 'Delicate promise ring for meaningful commitment', ['Promise'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(6, 'Infinity Promise Band', 'rings', 'fashion-rings', 380, 'Infinity symbol promise ring', ['Promise'], { carbonOffset: 3, oceanPlasticRemoved: 1 }),
  createProduct(7, 'Daily Dose Stackable Ring', 'rings', 'fashion-rings', 250, 'Perfect for everyday stacking', ['Stackable', 'Bestseller'], { carbonOffset: 1 }),
  createProduct(8, 'Minimalist Band Ring', 'rings', 'fashion-rings', 320, 'Clean lines for modern minimalist', ['Minimalist']),
  createProduct(9, 'Bold Statement Cocktail Ring', 'rings', 'fashion-rings', 680, 'Eye-catching cocktail ring', ['Statement'], { carbonOffset: 4, artisansFunded: 1 }),
  createProduct(10, 'Geometric Power Ring', 'rings', 'fashion-rings', 520, 'Bold geometric design', ['Statement'], { oceanPlasticRemoved: 1.5, carbonOffset: 3 }),

  // Moissanite Collection (15 products)
  createProduct(11, 'Moissanite Solitaire Ring', 'rings', 'engagement-rings', 600, 'Classic moissanite solitaire with brilliant fire', ['Moissanite', 'Essential Collection'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(12, 'Princess Cut Moissanite Ring', 'rings', 'engagement-rings', 720, 'Square princess cut moissanite ring', ['Moissanite', 'Essential Collection'], { carbonOffset: 2.5, treesPlanted: 1 }),
  createProduct(13, 'Oval Moissanite Engagement Ring', 'rings', 'engagement-rings', 850, 'Elongated oval moissanite center stone', ['Moissanite', 'Essential Collection'], { carbonOffset: 3, treesPlanted: 2 }),
  createProduct(14, 'Emerald Cut Moissanite Ring', 'rings', 'engagement-rings', 780, 'Vintage-inspired emerald cut', ['Moissanite', 'Essential Collection'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(15, 'Cushion Cut Moissanite Ring', 'rings', 'engagement-rings', 690, 'Romantic cushion cut moissanite', ['Moissanite', 'Essential Collection'], { carbonOffset: 2.5, treesPlanted: 1 }),
  createProduct(16, 'Moissanite Halo Ring', 'rings', 'engagement-rings', 950, 'Halo setting enhances moissanite brilliance', ['Moissanite', 'Essential Collection'], { carbonOffset: 3, treesPlanted: 2 }),
  createProduct(17, 'Moissanite Three-Stone Ring', 'rings', 'engagement-rings', 1100, 'Three moissanite stones in elegant setting', ['Moissanite', 'Essential Collection'], { carbonOffset: 4, treesPlanted: 2 }),
  createProduct(18, 'Moissanite Wedding Band', 'rings', 'wedding-bands', 420, 'Matching moissanite wedding band', ['Moissanite', 'Essential Collection'], { carbonOffset: 1, treesPlanted: 0.5 }),
  createProduct(19, 'Moissanite Anniversary Band', 'rings', 'wedding-bands', 650, 'Celebrate milestones with moissanite', ['Moissanite', 'Essential Collection'], { carbonOffset: 2.5, treesPlanted: 1 }),
  createProduct(20, 'Moissanite Solitaire Necklace', 'necklaces', 'pendants', 480, 'Delicate moissanite pendant', ['Moissanite', 'Essential Collection', 'Bestseller'], { carbonOffset: 1.5, treesPlanted: 1 }),
  createProduct(21, 'Moissanite Pendant Set', 'necklaces', 'pendants', 580, 'Coordinated moissanite jewelry set', ['Moissanite', 'Essential Collection'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(22, 'Moissanite Chain Necklace', 'necklaces', 'chains', 380, 'Delicate chain with moissanite accents', ['Moissanite', 'Essential Collection'], { carbonOffset: 1, treesPlanted: 0.5 }),
  createProduct(23, 'Moissanite Stud Earrings', 'earrings', 'studs', 450, 'Classic moissanite stud earrings', ['Moissanite', 'Essential Collection', 'Bestseller'], { carbonOffset: 1.5, treesPlanted: 1 }),
  createProduct(24, 'Moissanite Drop Earrings', 'earrings', 'drops', 620, 'Elegant dropping moissanite earrings', ['Moissanite', 'Essential Collection'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(25, 'Moissanite Tennis Bracelet', 'bracelets', 'tennis-bracelets', 1200, 'Continuous moissanite tennis bracelet', ['Moissanite', 'Essential Collection', 'Featured'], { carbonOffset: 4, treesPlanted: 2 }),

  // Men's Jewelry Collection (6 products)
  createProduct(26, "Men's Lab Diamond Wedding Band", 'rings', 'wedding-bands', 1800, 'Sophisticated lab diamond wedding band for men', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 6, treesPlanted: 3 }),
  createProduct(27, "Men's Signet Ring", 'rings', 'fashion-rings', 1200, 'Classic signet ring with modern appeal', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 4, treesPlanted: 2 }),
  createProduct(28, "Men's Moissanite Ring", 'rings', 'fashion-rings', 950, 'Bold moissanite ring for men', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 2.5, treesPlanted: 1 }),
  createProduct(29, "Men's Chain Bracelet", 'bracelets', 'chain-bracelets', 850, 'Masculine chain bracelet', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(30, "Men's Pendant Necklace", 'necklaces', 'pendants', 1100, 'Strong pendant necklace for men', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 3, treesPlanted: 2 }),

  // NECKLACES (18 products total)
  // Original Collection (8 products)
  createProduct(31, 'Signature Diamond Pendant', 'necklaces', 'pendants', 750, 'Elegant diamond pendant necklace', ['Signature', 'Bestseller'], { carbonOffset: 3, treesPlanted: 2 }),
  createProduct(32, 'Heart of Gold Pendant', 'necklaces', 'pendants', 420, 'Romantic heart-shaped pendant', ['Romance']),
  createProduct(33, 'Ocean Wave Pendant', 'necklaces', 'pendants', 650, 'Nature-inspired wave design', ['Ocean Positive'], { oceanPlasticRemoved: 3, carbonOffset: 2 }),
  createProduct(34, 'Layering Chain Set', 'necklaces', 'chains', 380, 'Set of three layering chains', ['Layering'], { carbonOffset: 1.5 }),
  createProduct(35, 'Sustainable Tennis Necklace', 'necklaces', 'chains', 1800, 'Continuous diamond tennis necklace', ['Luxury', 'Featured'], { carbonOffset: 8, artisansFunded: 3 }),
  createProduct(36, 'Power Statement Collar', 'necklaces', 'statement-necklaces', 1200, 'Bold statement collar necklace', ['Statement'], { carbonOffset: 5, treesPlanted: 3 }),
  createProduct(37, 'Cascade Drop Necklace', 'necklaces', 'statement-necklaces', 980, 'Cascading drop design', ['Statement'], { oceanPlasticRemoved: 2, carbonOffset: 4 }),
  createProduct(38, 'Story Layering Necklace', 'necklaces', 'chokers', 520, 'Tell your story with layered design', ['Layering']),

  // Lab Diamond Collection (10 products for necklaces, earrings, bracelets)
  createProduct(39, 'Premium Lab Diamond Necklace', 'necklaces', 'pendants', 2800, 'Premium grade lab diamond pendant', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 10, treesPlanted: 5 }),
  createProduct(40, 'Lab Diamond Chain Necklace', 'necklaces', 'chains', 3200, 'Continuous lab diamond chain', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 12, treesPlanted: 6 }),
  createProduct(41, 'Custom Lab Diamond Pendant', 'necklaces', 'pendants', 2400, 'Customizable lab diamond pendant', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 8, treesPlanted: 4 }),
  createProduct(42, 'Lab Diamond Statement Necklace', 'necklaces', 'statement-necklaces', 3800, 'Show-stopping lab diamond statement piece', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 15, treesPlanted: 8 }),
  createProduct(43, 'Vintage Lab Diamond Necklace', 'necklaces', 'pendants', 2200, 'Vintage-inspired lab diamond design', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 7, treesPlanted: 3 }),
  createProduct(44, 'Modern Lab Diamond Choker', 'necklaces', 'chokers', 1900, 'Contemporary lab diamond choker', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 6, treesPlanted: 3 }),
  createProduct(45, 'Lab Diamond Tennis Necklace', 'necklaces', 'chains', 4200, 'Ultimate lab diamond tennis necklace', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 18, treesPlanted: 10 }),
  createProduct(46, 'Delicate Lab Diamond Pendant', 'necklaces', 'pendants', 1600, 'Subtle lab diamond pendant', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 5, treesPlanted: 2 }),
  createProduct(47, 'Lab Diamond Drop Necklace', 'necklaces', 'statement-necklaces', 2600, 'Graceful lab diamond drops', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 9, treesPlanted: 4 }),
  createProduct(48, 'Art Deco Lab Diamond Necklace', 'necklaces', 'statement-necklaces', 3400, 'Art Deco inspired lab diamond piece', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 14, treesPlanted: 7 }),

  // EARRINGS (15 products total)
  // Original Collection (7 products)
  createProduct(49, 'Classic Diamond Studs', 'earrings', 'studs', 580, 'Timeless diamond stud earrings', ['Classic', 'Bestseller'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(50, 'Geometric Stud Collection', 'earrings', 'studs', 420, 'Modern geometric stud designs', ['Modern']),
  createProduct(51, 'Minimalist Dot Studs', 'earrings', 'studs', 280, 'Simple dot stud earrings', ['Minimalist']),
  createProduct(52, 'Sustainable Huggie Hoops', 'earrings', 'hoops', 380, 'Small huggie hoop earrings', ['Sustainable'], { carbonOffset: 1.5, oceanPlasticRemoved: 0.5 }),
  createProduct(53, 'Statement Hoop Earrings', 'earrings', 'hoops', 520, 'Bold statement hoop earrings', ['Statement'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(54, 'Flowing Drop Earrings', 'earrings', 'drops', 680, 'Graceful flowing drop earrings', ['Movement'], { oceanPlasticRemoved: 1, carbonOffset: 3 }),
  createProduct(55, 'Chandelier Celebration Earrings', 'earrings', 'drops', 950, 'Ornate chandelier-style earrings', ['Celebration', 'Featured'], { artisansFunded: 2, carbonOffset: 4 }),

  // Lab Gemstone Collection (8 products)
  createProduct(56, 'Lab Emerald Stud Earrings', 'earrings', 'studs', 850, 'Vibrant lab emerald studs', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 3, treesPlanted: 2 }),
  createProduct(57, 'Lab Sapphire Drop Earrings', 'earrings', 'drops', 1200, 'Royal blue lab sapphire drops', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 4, treesPlanted: 2 }),
  createProduct(58, 'Lab Ruby Hoop Earrings', 'earrings', 'hoops', 1100, 'Passionate red lab ruby hoops', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 3.5, treesPlanted: 2 }),
  createProduct(59, 'Lab Tanzanite Stud Earrings', 'earrings', 'studs', 950, 'Rare blue-purple lab tanzanite', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 3, treesPlanted: 1 }),
  createProduct(60, 'Multi-Color Lab Gem Earrings', 'earrings', 'drops', 1400, 'Rainbow lab gemstone drops', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 5, treesPlanted: 3 }),
  createProduct(61, 'Lab Aquamarine Earrings', 'earrings', 'studs', 800, 'Ocean-blue lab aquamarine studs', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 2.5, treesPlanted: 1 }),
  createProduct(62, 'Color-Change Lab Gem Earrings', 'earrings', 'drops', 1600, 'Alexandrite-like color-changing gems', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 6, treesPlanted: 3 }),
  createProduct(63, 'Lab Peridot Hoop Earrings', 'earrings', 'hoops', 750, 'Fresh green lab peridot hoops', ['Lab Gemstones', 'Signature Collection'], { carbonOffset: 2, treesPlanted: 1 }),

  // BRACELETS (12 products total)
  // Original Collection (5 products)
  createProduct(64, 'Sustainable Chain Bracelet', 'bracelets', 'chain-bracelets', 320, 'Eco-friendly chain bracelet', ['Sustainable'], { carbonOffset: 1, treesPlanted: 0.5 }),
  createProduct(65, 'Infinity Link Bracelet', 'bracelets', 'chain-bracelets', 480, 'Infinity symbol link bracelet', ['Infinity']),
  createProduct(66, 'Power Cuff Bracelet', 'bracelets', 'bangles', 650, 'Bold power cuff design', ['Power'], { artisansFunded: 1, carbonOffset: 2 }),
  createProduct(67, 'Story Charm Bracelet', 'bracelets', 'charm-bracelets', 580, 'Customizable charm bracelet', ['Story']),
  createProduct(68, 'Conscious Tennis Bracelet', 'bracelets', 'tennis-bracelets', 1850, 'Sustainable luxury tennis bracelet', ['Luxury', 'Featured'], { carbonOffset: 6, treesPlanted: 4, oceanPlasticRemoved: 1 }),

  // Wedding Band Expansion (4 products)
  createProduct(69, 'Classic Gold Wedding Band', 'rings', 'wedding-bands', 420, 'Timeless gold wedding band', ['Wedding', 'Essential Collection', 'Bestseller'], { carbonOffset: 2, treesPlanted: 1 }),
  createProduct(70, 'Platinum Wedding Band', 'rings', 'wedding-bands', 2200, 'Premium platinum wedding band', ['Wedding', 'Premium Collection'], { carbonOffset: 7, treesPlanted: 4 }),
  createProduct(71, 'Vintage-Style Wedding Band', 'rings', 'wedding-bands', 850, 'Vintage-inspired wedding band', ['Wedding', 'Signature Collection'], { carbonOffset: 3, treesPlanted: 2 }),
  createProduct(72, 'Stackable Wedding Band Set', 'rings', 'wedding-bands', 1100, 'Set of stackable wedding bands', ['Wedding', 'Signature Collection'], { carbonOffset: 4, treesPlanted: 2 }),

  // Additional Lab Diamond and Bracelet Products (3 products)
  createProduct(73, 'Lab Diamond Tennis Bracelet', 'bracelets', 'tennis-bracelets', 3200, 'Premium lab diamond tennis bracelet', ['Lab Diamonds', 'Premium Collection'], { carbonOffset: 12, treesPlanted: 6 }),
  createProduct(74, 'Lab Diamond Link Bracelet', 'bracelets', 'chain-bracelets', 2400, 'Lab diamond accented link bracelet', ['Lab Diamonds', 'Signature Collection'], { carbonOffset: 8, treesPlanted: 4 }),
  createProduct(75, "Men's Cufflinks", 'jewelry', 'accessories', 2500, 'Premium lab diamond cufflinks for men', ["Men's Jewelry", 'Signature Collection'], { carbonOffset: 1.5, treesPlanted: 1 })
]

console.log(`Generated ${SEED_PRODUCTS.length} products for complete 75-product catalog`)

module.exports = {
  SEED_PRODUCTS,
  STANDARD_MATERIALS,
  STANDARD_GEMSTONES
}
