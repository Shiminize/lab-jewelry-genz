export type ProductDetail = {
  slug: string
  sku: string
  handle: 'bracelets' | 'necklaces' | 'rings' | 'earrings' | 'objects'
  title: string
  brand: string
  price: number
  currency: 'JPY' | 'USD'
  inStock: boolean
  heroImage: string
  gallery: string[]
  description: string
  story: string
  materials: string[]
  dimensions: string[]
  highlights: string[]
  care: string[]
}

export const PRODUCT_DETAILS: ProductDetail[] = [
  {
    slug: 'celestial-halo-ring',
    sku: 'A-001',
    handle: 'rings',
    title: 'Celestial Halo Ring',
    brand: 'Glow Atelier',
    price: 129000,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/products/static/halo-diamond-ring/hero.webp',
    gallery: [
      '/images/products/static/halo-diamond-ring/hero.webp',
      '/images/products/static/three-stone-ring/hero.webp',
      '/images/products/static/classic-solitaire/hero.webp',
    ],
    description:
      'An architectural halo of bezel-set diamonds frames the central stone, suspended on a knife-edge band for maximum light return.',
    story:
      'Inspired by the nocturnal skyline over Omotesandō, the Celestial Halo Ring balances structural minimalism with luminous pavé work. Each facet is hand-polished in Tokyo and set to mirror the orbital pattern of satellite halos.',
    materials: ['18k recycled yellow gold', 'Lab-grown VS1 diamonds', 'Precision-cut moonstone accents'],
    dimensions: ['Halo diameter: 8.5 mm', 'Band width: 1.8 mm', 'Profile height: 4.2 mm'],
    highlights: [
      'Custom sizing available from JP3 to JP18 within two weeks.',
      'Hallmarked and certified by the Japan Jewelry Association.',
      'Pair with the Parallel Line band for a sculptural stack.',
    ],
    care: [
      'Clean monthly with a soft brush and pH-neutral solution.',
      'Store flat in the provided suede envelope to prevent abrasions.',
      'Schedule ultrasonic detailing annually through the concierge.',
    ],
  },
  {
    slug: 'vector-pearl-necklace',
    sku: 'B-002',
    handle: 'necklaces',
    title: 'Vector Pearl Necklace',
    brand: 'Shihara Lab',
    price: 152000,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/products/static/tennis-necklace/hero.webp',
    gallery: [
      '/images/products/static/tennis-necklace/hero.webp',
      '/images/products/static/diamond-pendant/hero.webp',
      '/images/products/static/diamond-studs/hero.webp',
    ],
    description:
      'Graduated Akoya pearls are tension-set along an angular gold vector, balancing softness with a bold geometric profile.',
    story:
      'The Vector series reinterprets the classic strand with asymmetrical pacing inspired by kinetic sculpture. Each pearl is graded for luster and hue, then hand-knotted in our Shibuya studio for enduring symmetry.',
    materials: ['Akoya pearls 6–8 mm', '18k recycled white gold', 'Invisible tension armature'],
    dimensions: ['Neck length: 420 mm', 'Vector drop: 48 mm', 'Total weight: 18.4 g'],
    highlights: [
      'Magnetic clasp engineered for discreet closure.',
      'Available in alternate finishes upon concierge request.',
      'Hallmarked with Shihara Lab insignia and serial number.',
    ],
    care: [
      'Wipe pearls with a dry silk cloth after wearing to preserve sheen.',
      'Avoid direct perfume contact; apply fragrance before dressing.',
      'Annual restringing included within the first three years.',
    ],
  },
  {
    slug: 'linear-cuff',
    sku: 'C-001',
    handle: 'bracelets',
    title: 'Linear Cuff',
    brand: 'Coral Atelier',
    price: 78000,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/products/static/diamond-pendant/hero.webp',
    gallery: [
      '/images/products/static/diamond-pendant/hero.webp',
      '/images/products/static/astronaut.webp',
      '/images/placeholder-product.jpg',
    ],
    description:
      'A slender cuff forged from mirror-polished silver, intersected by a carved negative space that maps latitude lines.',
    story:
      'Coral Atelier references maritime cartography for the Linear series. Each cuff is milled from a single billet, then cold-forged to achieve its seamless curvature before the negative channel is etched by hand.',
    materials: ['925 recycled sterling silver', 'Protective rhodium finish'],
    dimensions: ['Inner diameter: 60 mm', 'Opening: 25 mm', 'Thickness: 3.2 mm'],
    highlights: [
      'Gently adjustable within a 10 mm tolerance.',
      'Stacks cleanly with the Mirrored Bangle and Facet Chain.',
      'Made exclusively in small seasonal batches.',
    ],
    care: [
      'Remove before swimming or exposure to chlorine.',
      'Polish with a treated cloth to maintain the mirror finish.',
      'Store in a sealed pouch to minimize oxidation.',
    ],
  },
  {
    slug: 'geometric-brooch',
    sku: 'E-001',
    handle: 'objects',
    title: 'Geometric Brooch',
    brand: 'Coral Atelier',
    price: 56000,
    currency: 'JPY',
    inStock: false,
    heroImage: '/images/placeholder-product.jpg',
    gallery: [
      '/images/placeholder-product.jpg',
      '/images/products/static/diamond-studs/hero.webp',
      '/images/products/static/three-stone-ring/hero.webp',
    ],
    description:
      'An abstract brooch cast from brushed brass, with inset lacquer panels that shift from burgundy to smoky quartz.',
    story:
      'Originally exhibited in the “Resonant Forms” installation, the Geometric Brooch explores modular geometry. Each plane is hand-lacquered in layers of burgundy enamel to echo the GlowGlitch palette.',
    materials: ['Brushed brass base', 'Multi-layer urushi lacquer', '316L surgical steel pin backing'],
    dimensions: ['Face width: 42 mm', 'Face height: 38 mm', 'Weight: 16 g'],
    highlights: [
      'Signed and numbered on the reverse plate.',
      'Includes magnetic converter for garment-safe styling.',
      'Limited to 80 editions per season.',
    ],
    care: [
      'Avoid prolonged exposure to moisture to protect the lacquer.',
      'Buff with a soft microfiber cloth—no chemical cleaners.',
      'Keep pin retracted when storing to preserve tension.',
    ],
  },
  {
    slug: 'coral-orbit',
    sku: 'R-005',
    handle: 'rings',
    title: 'Coral Orbit Ring',
    brand: 'Glow Atelier',
    price: 140,
    currency: 'USD',
    inStock: true,
    heroImage: '/images/products/ring-luxury-001/poster.webp',
    gallery: [
      '/images/products/ring-luxury-001/poster.webp',
      '/images/products/static/three-stone-ring/hero.webp',
      '/images/products/static/classic-solitaire/hero.webp',
    ],
    description:
      'A gradient of lab-grown sapphires shifts from deep magenta to soft coral, set in a fluid band that wraps your finger in continuous color.',
    story:
      'Captures the precise moment light shifts into dusk. Engineered with a seamless sapphire gradient, this ring is a study in color theory—fluid, constant, and alive.',
    materials: ['18k recycled rose gold', 'Lab-grown gradient sapphires', 'Comfort-fit interior'],
    dimensions: ['Band width: 3.5 mm', 'Profile height: 2.2 mm', 'Total gem weight: 1.2 ct'],
    highlights: [
      'Gradient stones are tension-set for durability.',
      'Designed to stack with the Skyline Band.',
      'Available in full and half sizes.',
    ],
    care: [
      'Clean with warm soapy water and a soft brush.',
      'Avoid harsh chemicals and ultrasonic cleaners.',
      'Store in a cool, dry place away from direct sunlight.',
    ],
  },
  {
    slug: 'skyline-pendant',
    sku: 'N-003',
    handle: 'necklaces',
    title: 'Skyline Pendant',
    brand: 'Shihara Lab',
    price: 860,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/products/static/diamond-pendant/hero.webp',
    gallery: [
      '/images/products/static/diamond-pendant/hero.webp',
      '/images/products/static/tennis-necklace/hero.webp',
    ],
    description:
      'A minimal vertical bar of cyan-glowing crystal, suspended from a delicate chain. A modern totem for the digital age.',
    story:
      'Inspired by the monolithic architecture of Tokyo’s skyline at night, this pendant distills structure into light. The crystal element captures ambient light and emits a soft, ethereal glow.',
    materials: ['Recycled platinum chain', 'Luminescent crystal composite', 'Invisible bail'],
    dimensions: ['Pendant length: 24 mm', 'Chain length: 450 mm', 'Crystal width: 4 mm'],
    highlights: [
      'Adjustable chain length (400mm / 425mm / 450mm).',
      'Hypoallergenic materials suitable for sensitive skin.',
      'Includes a polishing cloth for the crystal.',
    ],
    care: [
      'Wipe crystal with specialized cloth provided.',
      'Store hanging to prevent chain kinks.',
      'Remove before sleeping or showering.',
    ],
  },
  {
    slug: 'mint-line-hoops',
    sku: 'E-004',
    handle: 'earrings',
    title: 'Mint Line Hoops',
    brand: 'Coral Atelier',
    price: 64000,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/products/static/diamond-studs/hero.webp', // Placeholder fallback
    gallery: [
      '/images/products/static/diamond-studs/hero.webp',
    ],
    description:
      'Razor-thin hoops finished in a refreshing mint enamel. Lightweight enough for all-day wear, bold enough to make a statement.',
    story:
      'The Mint Line series explores the intersection of classic forms and pop color. These hoops are laser-cut from surgical steel for precision and finished with a durable, hand-applied enamel.',
    materials: ['316L Surgical Steel', 'Mint enamel finish', 'Titanium posts'],
    dimensions: ['Diameter: 45 mm', 'Thickness: 1 mm', 'Weight: 3 g per pair'],
    highlights: [
      'Secure click-top closure.',
      'Resistant to tarnishing and scratching.',
      'Vibrant color that does not fade.',
    ],
    care: [
      'Wipe with a damp cloth to clean.',
      'Avoid contact with hairspray and perfume.',
      'Store separately to prevent scratching other jewelry.',
    ],
  },
  {
    slug: 'daybreak-cuff',
    sku: 'B-005',
    handle: 'bracelets',
    title: 'Daybreak Cuff',
    brand: 'Glow Atelier',
    price: 125000,
    currency: 'JPY',
    inStock: true,
    heroImage: '/images/placeholder-product.jpg',
    gallery: ['/images/placeholder-product.jpg'],
    description:
      'A structured open cuff that catches the first light of day. Volt accents energize the classic gold form.',
    story:
      'Daybreak represents new beginnings. The volt accents are applied using a proprietary ceramic coating technique that bonds color to the metal at a molecular level.',
    materials: ['18k recycled yellow gold', 'Volt ceramic accents'],
    dimensions: ['Width: 12 mm', 'Opening: 28 mm', 'Wrist size: Fits up to 17 cm'],
    highlights: [
      'Flexible enough to adjust for a perfect fit.',
      'Ceramic accents are scratch-resistant.',
      'Stamped with Glow Atelier hallmark.',
    ],
    care: [
      'Buff with gold polishing cloth.',
      'Avoid bending repeatedly to prevent metal fatigue.',
      'Store in the provided hard case.',
    ],
  },
]
