"use strict";
/**
 * Gen Z Jewelry Strategic 75-Product Catalog
 * Business Analyst Optimized for MVP Launch Demonstration
 *
 * Phase 1 (25 products): Moissanite Collection (15) + Men's Jewelry (6) + Wedding Bands (4)
 * Phase 2 (20 products): Lab Diamond Collection (12) + Lab Gemstone Collection (8)
 *
 * Strategic Distribution:
 * - Essential Collection: 40 products (53%) - $400-1,200 volume focus
 * - Signature Collection: 30 products (40%) - $1,200-3,500 margin focus
 * - Premium Collection: 5 products (7%) - $3,500+ luxury positioning
 *
 * Navigation Coverage: All major categories now have 3+ representative products
 * AOV Target: $900 → $2,200+ through strategic product mix optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_DISTRIBUTION = exports.NAVIGATION_CATEGORY_MAPPING = exports.SEED_PRODUCTS = exports.CREATOR_PROFILES = exports.NECKLACE_LENGTHS = exports.RING_SIZES = exports.STANDARD_GEMSTONES = exports.STANDARD_MATERIALS = void 0;
// Enhanced materials with sustainability focus
exports.STANDARD_MATERIALS = [
    {
        id: 'gold-14k-yellow',
        type: 'gold',
        name: '14K Yellow Gold',
        purity: '14K',
        priceMultiplier: 1.0,
        description: 'Classic yellow gold made from 100% recycled sources',
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
        description: 'Modern white gold with rhodium plating, 100% recycled',
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
        description: 'Romantic rose gold from recycled sources',
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
        description: 'Recycled sterling silver for conscious consumers',
        sustainability: {
            recycled: true,
            ethicallySourced: true,
            carbonNeutral: true
        }
    }
];
// Lab-grown gemstones with impact tracking
exports.STANDARD_GEMSTONES = [
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
    },
    {
        id: 'moissanite-round-100',
        type: 'other',
        isLabGrown: true,
        carat: 1.0,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Round Brilliant',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.8,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-round-075',
        type: 'other',
        isLabGrown: true,
        carat: 0.75,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Round Brilliant',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.6,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-princess-100',
        type: 'other',
        isLabGrown: true,
        carat: 1.0,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Princess',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.75,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-oval-100',
        type: 'other',
        isLabGrown: true,
        carat: 1.0,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Oval',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.8,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-emerald-100',
        type: 'other',
        isLabGrown: true,
        carat: 1.0,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Emerald',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.7,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-cushion-100',
        type: 'other',
        isLabGrown: true,
        carat: 1.0,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Cushion',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.8,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'moissanite-round-050',
        type: 'other',
        isLabGrown: true,
        carat: 0.5,
        color: 'Colorless',
        clarity: 'VVS1',
        cut: 'Round Brilliant',
        certification: {
            agency: 'Other'
        },
        priceMultiplier: 0.4,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    // Premium Grade Lab Diamonds (D-F, VVS)
    {
        id: 'diamond-lab-round-200-premium',
        type: 'diamond',
        isLabGrown: true,
        carat: 2.0,
        color: 'D',
        clarity: 'VVS1',
        cut: 'Round Brilliant',
        certification: {
            agency: 'IGI',
            certificateNumber: 'LG456789012'
        },
        priceMultiplier: 5.5,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'diamond-lab-round-150-premium',
        type: 'diamond',
        isLabGrown: true,
        carat: 1.5,
        color: 'E',
        clarity: 'VVS2',
        cut: 'Round Brilliant',
        certification: {
            agency: 'IGI'
        },
        priceMultiplier: 3.8,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    // Excellent Grade Lab Diamonds (G-H, VS)
    {
        id: 'diamond-lab-round-150-excellent',
        type: 'diamond',
        isLabGrown: true,
        carat: 1.5,
        color: 'G',
        clarity: 'VS1',
        cut: 'Round Brilliant',
        certification: {
            agency: 'IGI'
        },
        priceMultiplier: 2.8,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'diamond-lab-oval-100-excellent',
        type: 'diamond',
        isLabGrown: true,
        carat: 1.0,
        color: 'H',
        clarity: 'VS2',
        cut: 'Oval',
        certification: {
            agency: 'IGI'
        },
        priceMultiplier: 2.0,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    // Lab-Grown Colored Gemstones
    {
        id: 'emerald-lab-100',
        type: 'emerald',
        isLabGrown: true,
        carat: 1.0,
        color: 'Vivid Green',
        clarity: 'VVS1',
        cut: 'Emerald',
        certification: {
            agency: 'GIA'
        },
        priceMultiplier: 1.2,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'ruby-lab-100',
        type: 'ruby',
        isLabGrown: true,
        carat: 1.0,
        color: 'Pigeon Blood Red',
        clarity: 'VVS1',
        cut: 'Oval',
        certification: {
            agency: 'GIA'
        },
        priceMultiplier: 1.4,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    },
    {
        id: 'sapphire-lab-100',
        type: 'sapphire',
        isLabGrown: true,
        carat: 1.0,
        color: 'Royal Blue',
        clarity: 'VVS1',
        cut: 'Oval',
        certification: {
            agency: 'GIA'
        },
        priceMultiplier: 1.3,
        sustainability: {
            labGrown: true,
            conflictFree: true,
            traceable: true
        }
    }
];
// Standard sizes
exports.RING_SIZES = [
    { id: 'ring-4', category: 'rings', value: '4', measurement: { unit: 'mm', value: 14.8 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-5', category: 'rings', value: '5', measurement: { unit: 'mm', value: 15.6 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-6', category: 'rings', value: '6', measurement: { unit: 'mm', value: 16.5 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-7', category: 'rings', value: '7', measurement: { unit: 'mm', value: 17.3 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-8', category: 'rings', value: '8', measurement: { unit: 'mm', value: 18.1 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-9', category: 'rings', value: '9', measurement: { unit: 'mm', value: 19.0 }, availability: true, priceAdjustment: 0 },
    { id: 'ring-10', category: 'rings', value: '10', measurement: { unit: 'mm', value: 19.8 }, availability: true, priceAdjustment: 0 }
];
exports.NECKLACE_LENGTHS = [
    { id: 'neck-16', category: 'necklaces', value: '16"', measurement: { unit: 'inches', value: 16 }, availability: true, priceAdjustment: 0 },
    { id: 'neck-18', category: 'necklaces', value: '18"', measurement: { unit: 'inches', value: 18 }, availability: true, priceAdjustment: 25 },
    { id: 'neck-20', category: 'necklaces', value: '20"', measurement: { unit: 'inches', value: 20 }, availability: true, priceAdjustment: 50 },
    { id: 'neck-22', category: 'necklaces', value: '22"', measurement: { unit: 'inches', value: 22 }, availability: true, priceAdjustment: 75 }
];
// Creator profiles
exports.CREATOR_PROFILES = {
    maya_jewels: {
        creatorId: 'maya_jewels',
        collaborationType: 'design',
        commissionRate: 0.30,
        exclusiveDesign: true,
        profile: {
            handle: '@maya_jewels',
            name: 'Maya Chen',
            followers: 45000,
            specialty: 'Minimalist gold jewelry',
            bio: 'Creating timeless pieces that whisper elegance. Less is always more.'
        }
    },
    eco_elegance: {
        creatorId: 'eco_elegance',
        collaborationType: 'design',
        commissionRate: 0.30,
        exclusiveDesign: true,
        profile: {
            handle: '@eco_elegance',
            name: 'Alex Rivera',
            followers: 32000,
            specialty: 'Sustainable luxury',
            bio: 'Proving that luxury and sustainability are perfect partners. Every piece tells a story of conscious beauty.'
        }
    },
    moissanite_maven: {
        creatorId: 'moissanite_maven',
        collaborationType: 'design',
        commissionRate: 0.30,
        exclusiveDesign: true,
        profile: {
            handle: '@moissanite_maven',
            name: 'Sofia Martinez',
            followers: 28000,
            specialty: 'Moissanite and alternative gemstones',
            bio: 'Breaking the diamond monopoly with brilliant moissanite. Luxury that makes sense for our generation.'
        }
    },
    modern_classics: {
        creatorId: 'modern_classics',
        collaborationType: 'design',
        commissionRate: 0.30,
        exclusiveDesign: true,
        profile: {
            handle: '@modern_classics',
            name: 'David Kim',
            followers: 41000,
            specialty: 'Contemporary men\'s jewelry',
            bio: 'Redefining masculine elegance. Jewelry for the modern man who values style and substance.'
        }
    },
    sustainable_sparkle: {
        creatorId: 'sustainable_sparkle',
        collaborationType: 'design',
        commissionRate: 0.30,
        exclusiveDesign: true,
        profile: {
            handle: '@sustainable_sparkle',
            name: 'Emma Thompson',
            followers: 37000,
            specialty: 'Lab-grown diamonds and ethical luxury',
            bio: 'Sparkling with purpose. Proving that the most beautiful gems come from the lab, not the mine.'
        }
    }
};
// Helper function to generate products with Gen Z navigation mapping
function createProduct(name, category, subcategory, basePrice, description, navigationCategories, // Maps to Gen Z navigation structure
overrides = {}) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const sku = `GG-${category.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
                max: basePrice * 2.5
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
            materials: exports.STANDARD_MATERIALS,
            gemstones: ['rings', 'earrings'].includes(category) ? exports.STANDARD_GEMSTONES : undefined,
            sizes: category === 'rings' ? exports.RING_SIZES :
                category === 'necklaces' ? exports.NECKLACE_LENGTHS : [],
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
            metaTitle: `${name} | Gen Z Jewelry | GlowGlitch`,
            metaDescription: `${description} Sustainable, customizable jewelry designed for the conscious consumer.`,
            keywords: [name.toLowerCase(), category, 'sustainable jewelry', 'lab-grown', 'gen-z', ...navigationCategories],
            openGraph: {
                title: name,
                description,
                image: `/images/products/${slug}-og.jpg`
            }
        },
        certifications: {
            hallmarks: ['14K', 'GG'],
            gemCertificates: ['IGI-LG123456'],
            sustainabilityCerts: ['Carbon Neutral Certified', 'B-Corp Certified', 'Ethical Sourcing'],
            qualityAssurance: {
                warrantyPeriod: 2,
                returnPolicy: 100, // 100-day return policy
                careInstructions: [
                    'Clean with mild soap and water',
                    'Store in provided eco-friendly packaging',
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
            collections: ['Gen Z'],
            tags: ['sustainable', 'lab-grown', 'customizable', ...navigationCategories],
            difficulty: 'beginner',
            ...overrides.metadata
        },
        analytics: {
            views: Math.floor(Math.random() * 2000) + 500,
            customizations: Math.floor(Math.random() * 100) + 20,
            purchases: Math.floor(Math.random() * 50) + 10,
            conversionRate: 0.08 + Math.random() * 0.12,
            averageTimeOnPage: 180 + Math.random() * 240
        },
        ...overrides
    };
}
// Add sustainability impact tracking to product
function addSustainabilityImpact(product, impact) {
    return {
        ...product,
        metadata: {
            ...product.metadata,
            sustainabilityImpact: impact
        }
    };
}
// 30-Product Catalog mapped to Gen Z Navigation Categories
exports.SEED_PRODUCTS = [
    // RINGS (10 products total)
    // Engagement Rings (4 products)
    createProduct('Eternal Promise Solitaire', 'rings', 'engagement-rings', 1850, 'The ring that says forever, designed for the couple that\'s changing the world together. Lab-grown diamond meets timeless design.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            featured: true,
            bestseller: true,
            collections: ['Bridal', 'Create Your Vibe'],
            sustainabilityImpact: { carbonOffset: 5, treesPlanted: 3 }
        }
    }),
    createProduct('Modern Halo Engagement Ring', 'rings', 'engagement-rings', 2400, 'Your love story deserves a spotlight. This halo setting amplifies your lab-grown diamond while supporting ocean cleanup with every purchase.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Bridal', 'Ocean Positive'],
            sustainabilityImpact: { oceanPlasticRemoved: 2, carbonOffset: 8 }
        }
    }),
    createProduct('Sustainable Three-Stone Ring', 'rings', 'engagement-rings', 3000, 'Past, present, future - all sustainable. Created by @maya_jewels for couples who care about their impact.', ['creator-community', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 12, artisansFunded: 2 }
        }
    }),
    createProduct('Conscious Cushion Cut Ring', 'rings', 'engagement-rings', 2200, 'Vintage vibes, modern values. This cushion cut beauty proves you don\'t have to compromise on style to make ethical choices.', ['shop-your-values', 'create-your-vibe'], {
        metadata: {
            collections: ['Sustainable', 'Vintage'],
            sustainabilityImpact: { carbonOffset: 6, treesPlanted: 4 }
        }
    }),
    // Promise Rings (2 products)
    createProduct('Promise of Tomorrow Ring', 'rings', 'fashion-rings', 650, 'A promise that your love is as infinite as your commitment to the planet. Designed for the generation that believes in forever.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Promise', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Infinity Promise Band', 'rings', 'fashion-rings', 780, 'Created by @eco_elegance for relationships that grow stronger every day. Made with 100% recycled metals.', ['creator-community', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            collections: ['Creator Community', 'Promise'],
            sustainabilityImpact: { carbonOffset: 3, oceanPlasticRemoved: 1 }
        }
    }),
    // Everyday Rings (2 products)
    createProduct('Daily Dose Stackable Ring', 'rings', 'fashion-rings', 320, 'Your everyday reminder that small choices make big differences. Stack them, mix them, make them yours.', ['create-your-vibe'], {
        metadata: {
            bestseller: true,
            collections: ['Stackable', 'Everyday'],
            sustainabilityImpact: { carbonOffset: 1 }
        }
    }),
    createProduct('Minimalist Band Ring', 'rings', 'fashion-rings', 420, '@maya_jewels\' signature style: maximum impact, minimal footprint. Perfect for the understated rebel.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Minimalist']
        }
    }),
    // Statement Rings (2 products)
    createProduct('Bold Statement Cocktail Ring', 'rings', 'fashion-rings', 1200, 'For when you want your jewelry to do the talking. This showstopper is made from recycled gold and lab-grown stones.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Statement', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 4, artisansFunded: 1 }
        }
    }),
    createProduct('Geometric Power Ring', 'rings', 'fashion-rings', 950, '@eco_elegance\'s angular masterpiece that breaks all the rules. For the rebels who wear their values.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            collections: ['Creator Community', 'Statement'],
            sustainabilityImpact: { oceanPlasticRemoved: 1.5, carbonOffset: 3 }
        }
    }),
    // NECKLACES (8 products total)
    // Pendant Necklaces (3 products)
    createProduct('Signature Diamond Pendant', 'necklaces', 'pendants', 890, 'The necklace that goes with everything and stands for something. Lab-grown diamond in recycled gold.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            bestseller: true,
            collections: ['Signature', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Heart of Gold Pendant', 'necklaces', 'pendants', 720, '@maya_jewels designed this piece for the romantics who believe love can change the world.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Romance']
        }
    }),
    createProduct('Ocean Wave Pendant', 'necklaces', 'pendants', 650, 'Inspired by the waves we\'re working to clean. Every purchase removes plastic from our oceans.', ['shop-your-values'], {
        metadata: {
            collections: ['Ocean Positive', 'Nature'],
            sustainabilityImpact: { oceanPlasticRemoved: 3, carbonOffset: 2 }
        }
    }),
    // Chain Necklaces (2 products)
    createProduct('Layering Chain Set', 'necklaces', 'chains', 450, 'Three chains, infinite possibilities. Created for the generation that writes their own rules.', ['create-your-vibe'], {
        metadata: {
            collections: ['Layering', 'Everyday'],
            sustainabilityImpact: { carbonOffset: 1.5 }
        }
    }),
    createProduct('Sustainable Tennis Necklace', 'necklaces', 'chains', 1850, '@eco_elegance\'s luxury piece that proves sustainability and glamour are best friends.', ['creator-community', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            featured: true,
            collections: ['Creator Community', 'Luxury'],
            sustainabilityImpact: { carbonOffset: 8, artisansFunded: 3 }
        }
    }),
    // Statement Necklaces (2 products)
    createProduct('Power Statement Collar', 'necklaces', 'statement-necklaces', 1400, 'For the moments when you need to remind the room who you are. Bold, sustainable, unapologetic.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Statement', 'Power'],
            sustainabilityImpact: { carbonOffset: 5, treesPlanted: 3 }
        }
    }),
    createProduct('Cascade Drop Necklace', 'necklaces', 'statement-necklaces', 980, 'Movement and meaning in every wear. This cascading design flows like water, cleans like purpose.', ['shop-your-values'], {
        metadata: {
            collections: ['Statement', 'Ocean Positive'],
            sustainabilityImpact: { oceanPlasticRemoved: 2, carbonOffset: 4 }
        }
    }),
    // Layering Necklace (1 product)
    createProduct('Story Layering Necklace', 'necklaces', 'chains', 320, 'Every layer tells your story. @maya_jewels\' delicate design for the storytellers.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Layering']
        }
    }),
    // EARRINGS (7 products total)
    // Stud Earrings (3 products)
    createProduct('Classic Diamond Studs', 'earrings', 'studs', 780, 'The earrings that started it all. Lab-grown diamonds that shine as bright as your future.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            bestseller: true,
            collections: ['Classic', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Geometric Stud Collection', 'earrings', 'studs', 450, '@eco_elegance\'s modern take on studs. Angular, bold, and completely sustainable.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            collections: ['Creator Community', 'Modern']
        }
    }),
    createProduct('Minimalist Dot Studs', 'earrings', 'studs', 280, 'Less is more, impact is everything. @maya_jewels\' signature minimalism meets maximum values.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Minimalist']
        }
    }),
    // Hoop Earrings (2 products)
    createProduct('Sustainable Huggie Hoops', 'earrings', 'hoops', 520, 'Hugs for your ears, love for the planet. Made from 100% recycled precious metals.', ['shop-your-values'], {
        metadata: {
            collections: ['Sustainable', 'Everyday'],
            sustainabilityImpact: { carbonOffset: 1.5, oceanPlasticRemoved: 0.5 }
        }
    }),
    createProduct('Statement Hoop Earrings', 'earrings', 'hoops', 680, 'Go big or go home. These hoops make a statement about style AND sustainability.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Statement', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    // Drop Earrings (2 products)
    createProduct('Flowing Drop Earrings', 'earrings', 'drops', 850, 'Movement with meaning. @eco_elegance designed these drops to flow like the change we\'re creating.', ['creator-community', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            collections: ['Creator Community', 'Movement'],
            sustainabilityImpact: { oceanPlasticRemoved: 1, carbonOffset: 3 }
        }
    }),
    createProduct('Chandelier Celebration Earrings', 'earrings', 'drops', 1200, 'For the moments worth celebrating. Handcrafted drama that supports artisan communities worldwide.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            featured: true,
            collections: ['Celebration', 'Artisan'],
            sustainabilityImpact: { artisansFunded: 2, carbonOffset: 4 }
        }
    }),
    // BRACELETS (5 products total)
    // Chain Bracelets (2 products)
    createProduct('Sustainable Chain Bracelet', 'bracelets', 'chain-bracelets', 380, 'The bracelet that links your style to your values. Perfect for stacking or standing alone.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Sustainable', 'Stackable'],
            sustainabilityImpact: { carbonOffset: 1, treesPlanted: 0.5 }
        }
    }),
    createProduct('Infinity Link Bracelet', 'bracelets', 'chain-bracelets', 560, '@maya_jewels\' take on infinite possibilities. Delicate links for the dreamers and doers.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Creator Community', 'Infinity']
        }
    }),
    // Cuff Bracelet (1 product)
    createProduct('Power Cuff Bracelet', 'bracelets', 'bangles', 720, 'Wear your power on your sleeve. This cuff is made from recycled gold and supports women artisans.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Power', 'Artisan'],
            sustainabilityImpact: { artisansFunded: 1, carbonOffset: 2 }
        }
    }),
    // Charm Bracelet (1 product)
    createProduct('Story Charm Bracelet', 'bracelets', 'charm-bracelets', 450, 'Collect moments, not things. @eco_elegance designed this charm bracelet for the memory makers.', ['creator-community'], {
        creator: exports.CREATOR_PROFILES.eco_elegance,
        metadata: {
            collections: ['Creator Community', 'Story']
        }
    }),
    // Tennis Bracelet (1 product)
    createProduct('Conscious Tennis Bracelet', 'bracelets', 'tennis-bracelets', 1650, 'Classic elegance meets conscious choices. Lab-grown diamonds in recycled gold for the luxury lovers who care.', ['shop-your-values'], {
        metadata: {
            featured: true,
            collections: ['Luxury', 'Sustainable'],
            sustainabilityImpact: { carbonOffset: 6, treesPlanted: 4, oceanPlasticRemoved: 1 }
        }
    }),
    // MOISSANITE COLLECTION (15 products total) - Phase 1 Expansion
    // Moissanite Rings (7 products)
    createProduct('Round Brilliant Moissanite Ring', 'rings', 'engagement-rings', 750, 'Classic round brilliant cut moissanite with fire that rivals any diamond. @moissanite_maven\'s signature design for conscious luxury.', ['moissanite', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.moissanite_maven,
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Princess Cut Moissanite Ring', 'rings', 'engagement-rings', 850, 'Modern princess cut with exceptional brilliance. Square perfection that breaks all the diamond rules.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 2.5, treesPlanted: 1 }
        }
    }),
    createProduct('Oval Moissanite Engagement Ring', 'rings', 'engagement-rings', 950, 'Elongated elegance with brilliant fire. This oval moissanite maximizes visual carat weight while staying budget-conscious.', ['moissanite', 'create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Emerald Cut Moissanite Ring', 'rings', 'engagement-rings', 800, 'Sophisticated step cut showcasing moissanite\'s clarity. Vintage-inspired with modern values.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection', 'Vintage'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Cushion Cut Moissanite Ring', 'rings', 'engagement-rings', 900, 'Soft cushion cut with romantic appeal. @moissanite_maven designed this for the old-soul romantics.', ['moissanite', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.moissanite_maven,
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 2.5, treesPlanted: 1 }
        }
    }),
    createProduct('Moissanite Halo Ring', 'rings', 'engagement-rings', 1100, 'Center moissanite surrounded by smaller moissanite accent stones. Maximum sparkle, maximum impact.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Moissanite Three-Stone Ring', 'rings', 'engagement-rings', 1150, 'Past, present, future - all sparkling with lab-created brilliance. Three moissanite stones tell your love story.', ['moissanite', 'create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 2 }
        }
    }),
    // Moissanite Necklaces (3 products)
    createProduct('Moissanite Solitaire Necklace', 'necklaces', 'pendants', 650, 'Single moissanite pendant that catches light from every angle. Simple elegance that goes everywhere.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            bestseller: true,
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 1.5, treesPlanted: 1 }
        }
    }),
    createProduct('Moissanite Pendant Set', 'necklaces', 'pendants', 780, 'Coordinated pendant and chain set featuring brilliant moissanite. @moissanite_maven\'s everyday luxury solution.', ['moissanite', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.moissanite_maven,
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Moissanite Chain Necklace', 'necklaces', 'chains', 520, 'Delicate chain with small moissanite stations. Perfect for layering or wearing solo.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection', 'Layering'],
            sustainabilityImpact: { carbonOffset: 1, treesPlanted: 0.5 }
        }
    }),
    // Moissanite Earrings (2 products)
    createProduct('Moissanite Stud Earrings', 'earrings', 'studs', 580, 'Classic moissanite studs with incredible fire and brilliance. Your everyday sparkle upgrade.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            bestseller: true,
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 1.5, treesPlanted: 1 }
        }
    }),
    createProduct('Moissanite Drop Earrings', 'earrings', 'drops', 680, 'Graceful drops that dance with light. @moissanite_maven designed these for special moments.', ['moissanite', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.moissanite_maven,
        metadata: {
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    // Moissanite Bracelets and Wedding Bands (3 products)
    createProduct('Moissanite Tennis Bracelet', 'bracelets', 'tennis-bracelets', 1200, 'Line of brilliant moissanite stones creating continuous sparkle. Luxury that makes sense.', ['moissanite', 'create-your-vibe', 'shop-your-values'], {
        metadata: {
            featured: true,
            collections: ['Moissanite', 'Essential Collection'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 2 }
        }
    }),
    createProduct('Moissanite Wedding Band', 'rings', 'wedding-bands', 420, 'Delicate moissanite band perfect for stacking or wearing alone. Affordable luxury for your forever.', ['moissanite', 'create-your-vibe'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection', 'Wedding'],
            sustainabilityImpact: { carbonOffset: 1, treesPlanted: 0.5 }
        }
    }),
    createProduct('Moissanite Anniversary Band', 'rings', 'wedding-bands', 850, 'Celebrate your milestones with brilliant moissanite. Five-stone anniversary band that tells your story.', ['moissanite', 'create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Moissanite', 'Essential Collection', 'Anniversary'],
            sustainabilityImpact: { carbonOffset: 2.5, treesPlanted: 1 }
        }
    }),
    // MEN'S JEWELRY COLLECTION (6 products total) - Phase 1 Expansion
    // Men's Rings (3 products)
    createProduct('Men\'s Lab Diamond Wedding Band', 'rings', 'wedding-bands', 1800, 'Masculine elegance with lab-grown diamonds. @modern_classics designed this for the modern groom who values substance.', ['mens-jewelry', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.modern_classics,
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection', 'Wedding'],
            sustainabilityImpact: { carbonOffset: 6, treesPlanted: 3 }
        }
    }),
    createProduct('Men\'s Signet Ring', 'rings', 'fashion-rings', 1200, 'Classic signet ring reimagined in sustainable materials. Perfect for personalization with engraving.', ['mens-jewelry', 'create-your-vibe'], {
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 2 }
        }
    }),
    createProduct('Men\'s Moissanite Ring', 'rings', 'fashion-rings', 800, 'Bold moissanite statement ring for the man who breaks conventions. @modern_classics\' signature masculine design.', ['mens-jewelry', 'moissanite', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.modern_classics,
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection', 'Moissanite'],
            sustainabilityImpact: { carbonOffset: 2.5, treesPlanted: 1 }
        }
    }),
    // Men's Chains and Accessories (3 products)
    createProduct('Men\'s Chain Bracelet', 'bracelets', 'chain-bracelets', 750, 'Substantial chain bracelet in recycled metals. Strength and style for the conscious man.', ['mens-jewelry', 'shop-your-values'], {
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Men\'s Pendant Necklace', 'necklaces', 'pendants', 950, 'Minimalist pendant on substantial chain. @modern_classics created this for the understated powerhouse.', ['mens-jewelry', 'create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.modern_classics,
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Men\'s Cufflinks', 'jewelry', 'accessories', 650, 'Sophisticated cufflinks in sustainable metals. The finishing touch for the conscious professional.', ['mens-jewelry', 'shop-your-values'], {
        metadata: {
            collections: ['Men\'s Jewelry', 'Signature Collection', 'Professional'],
            sustainabilityImpact: { carbonOffset: 1.5, treesPlanted: 1 }
        }
    }),
    // WEDDING BAND EXPANSION (4 products total) - Phase 1 Expansion
    createProduct('Classic Gold Wedding Band', 'rings', 'wedding-bands', 720, 'Timeless 14K gold band that never goes out of style. Sustainable luxury for your forever commitment.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            bestseller: true,
            collections: ['Wedding', 'Essential Collection', 'Classic'],
            sustainabilityImpact: { carbonOffset: 2, treesPlanted: 1 }
        }
    }),
    createProduct('Platinum Wedding Band', 'rings', 'wedding-bands', 1850, 'Premium platinum band for the ultimate luxury experience. @sustainable_sparkle\'s choice for discerning couples.', ['shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Wedding', 'Premium Collection', 'Luxury'],
            sustainabilityImpact: { carbonOffset: 7, treesPlanted: 4 }
        }
    }),
    createProduct('Vintage-Style Wedding Band', 'rings', 'wedding-bands', 950, 'Art deco inspired wedding band with intricate detailing. Old-world charm meets modern sustainability.', ['create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Wedding', 'Signature Collection', 'Vintage'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Stackable Wedding Band Set', 'rings', 'wedding-bands', 1200, 'Three coordinated bands designed for stacking. @maya_jewels created this for the modern romantic.', ['create-your-vibe'], {
        creator: exports.CREATOR_PROFILES.maya_jewels,
        metadata: {
            collections: ['Wedding', 'Signature Collection', 'Stackable'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 2 }
        }
    }),
    // LAB DIAMOND COLLECTION (12 products total) - Phase 2 Expansion
    // Premium Grade Lab Diamonds (4 products)
    createProduct('Premium Grade Lab Diamond Ring (D-F, VVS)', 'rings', 'engagement-rings', 3800, 'The pinnacle of lab-grown diamond excellence. @sustainable_sparkle\'s choice for the ultimate luxury experience.', ['lab-diamonds', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            featured: true,
            collections: ['Lab Diamonds', 'Premium Collection'],
            sustainabilityImpact: { carbonOffset: 12, treesPlanted: 6 }
        }
    }),
    createProduct('Lab Diamond Three-Stone Ring', 'rings', 'engagement-rings', 4200, 'Past, present, future - all captured in premium lab-grown diamonds. The ultimate symbol of timeless love.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Diamonds', 'Premium Collection'],
            sustainabilityImpact: { carbonOffset: 15, treesPlanted: 8 }
        }
    }),
    createProduct('Custom Lab Diamond Ring', 'rings', 'engagement-rings', 4500, 'Design your perfect ring with premium lab-grown diamonds. Unlimited customization for your unique love story.', ['lab-diamonds', 'create-your-vibe', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Diamonds', 'Premium Collection', 'Custom'],
            sustainabilityImpact: { carbonOffset: 18, treesPlanted: 10 }
        }
    }),
    createProduct('Lab Diamond Halo Ring', 'rings', 'engagement-rings', 3500, 'Center lab diamond surrounded by accent diamonds. @sustainable_sparkle designed this for maximum brilliance.', ['lab-diamonds', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Lab Diamonds', 'Premium Collection'],
            sustainabilityImpact: { carbonOffset: 12, treesPlanted: 6 }
        }
    }),
    // Excellent Grade Lab Diamonds (4 products)
    createProduct('Excellent Grade Lab Diamond Ring (G-H, VS)', 'rings', 'engagement-rings', 2400, 'Beautiful lab-grown diamonds with excellent value. Perfect balance of quality and conscious pricing.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            bestseller: true,
            collections: ['Lab Diamonds', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 8, treesPlanted: 4 }
        }
    }),
    createProduct('Lab Diamond Wedding Band', 'rings', 'wedding-bands', 1800, 'Classic lab diamond wedding band that complements any engagement ring. Timeless elegance, sustainable choice.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Diamonds', 'Signature Collection', 'Wedding'],
            sustainabilityImpact: { carbonOffset: 6, treesPlanted: 3 }
        }
    }),
    createProduct('Lab Diamond Anniversary Ring', 'rings', 'fashion-rings', 3100, 'Celebrate your milestones with lab-grown diamond brilliance. Five stones representing your journey together.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Diamonds', 'Signature Collection', 'Anniversary'],
            sustainabilityImpact: { carbonOffset: 10, treesPlanted: 5 }
        }
    }),
    createProduct('Lab Diamond Bracelet', 'bracelets', 'tennis-bracelets', 2900, 'Continuous line of lab-grown diamonds creating spectacular sparkle. @sustainable_sparkle\'s signature piece.', ['lab-diamonds', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            featured: true,
            collections: ['Lab Diamonds', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 9, treesPlanted: 5 }
        }
    }),
    // Lab Diamond Jewelry (4 products)
    createProduct('Lab Diamond Tennis Necklace', 'necklaces', 'chains', 3200, 'Graduated lab diamonds creating elegant neckline brilliance. The ultimate luxury statement piece.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            featured: true,
            collections: ['Lab Diamonds', 'Premium Collection'],
            sustainabilityImpact: { carbonOffset: 11, treesPlanted: 6 }
        }
    }),
    createProduct('Lab Diamond Stud Earrings (1ct)', 'earrings', 'studs', 2800, 'Classic 1-carat lab diamond studs that elevate any look. Timeless elegance with modern values.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            bestseller: true,
            collections: ['Lab Diamonds', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 8, treesPlanted: 4 }
        }
    }),
    createProduct('Lab Diamond Pendant Necklace', 'necklaces', 'pendants', 2200, 'Single lab diamond pendant that catches light beautifully. Elegant simplicity with sustainable luxury.', ['lab-diamonds', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Diamonds', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 7, treesPlanted: 3 }
        }
    }),
    createProduct('Lab Diamond Drop Earrings', 'earrings', 'drops', 2600, 'Graceful lab diamond drops that move with elegant beauty. @sustainable_sparkle\'s evening luxury choice.', ['lab-diamonds', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Lab Diamonds', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 8, treesPlanted: 4 }
        }
    }),
    // LAB GEMSTONE COLLECTION (8 products total) - Phase 2 Expansion
    // Emerald and Green Gems (2 products)
    createProduct('Lab Emerald Ring', 'rings', 'fashion-rings', 1200, 'Vivid green lab-grown emerald that rivals the finest Colombian stones. @sustainable_sparkle\'s colorful luxury.', ['lab-gems', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 2 }
        }
    }),
    createProduct('Lab Emerald Earrings', 'earrings', 'studs', 1050, 'Brilliant green emerald studs that add color to any outfit. Sophisticated alternative to traditional diamonds.', ['lab-gems', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    // Ruby and Red Gems (2 products)
    createProduct('Lab Ruby Pendant Necklace', 'necklaces', 'pendants', 1100, 'Passionate red lab-grown ruby pendant. The symbol of love and strength in sustainable luxury.', ['lab-gems', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 3.5, treesPlanted: 2 }
        }
    }),
    createProduct('Lab Ruby Ring', 'rings', 'fashion-rings', 1400, 'Bold lab-grown ruby statement ring. @sustainable_sparkle designed this for the passionate and powerful.', ['lab-gems', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 4.5, treesPlanted: 3 }
        }
    }),
    // Sapphire and Blue Gems (3 products)
    createProduct('Lab Sapphire Earrings', 'earrings', 'studs', 950, 'Royal blue lab-grown sapphire earrings that command attention. Classic elegance with modern values.', ['lab-gems', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 3, treesPlanted: 2 }
        }
    }),
    createProduct('Lab Sapphire Necklace', 'necklaces', 'pendants', 1150, 'Deep blue lab-grown sapphire pendant on delicate chain. Timeless sophistication for the conscious consumer.', ['lab-gems', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 3.5, treesPlanted: 2 }
        }
    }),
    createProduct('Lab Aquamarine Ring', 'rings', 'fashion-rings', 900, 'Serene blue lab-grown aquamarine ring inspired by ocean depths. Calming beauty with sustainable impact.', ['lab-gems', 'shop-your-values'], {
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 2.5, treesPlanted: 1, oceanPlasticRemoved: 1 }
        }
    }),
    // Special Colored Gems (1 product)
    createProduct('Lab Tanzanite Pendant', 'necklaces', 'pendants', 1300, 'Rare blue-purple lab-grown tanzanite pendant. @sustainable_sparkle\'s choice for the unique and extraordinary.', ['lab-gems', 'shop-your-values'], {
        creator: exports.CREATOR_PROFILES.sustainable_sparkle,
        metadata: {
            collections: ['Lab Gems', 'Signature Collection'],
            sustainabilityImpact: { carbonOffset: 4, treesPlanted: 3 }
        }
    })
];
// Navigation category mapping
exports.NAVIGATION_CATEGORY_MAPPING = {
    'create-your-vibe': exports.SEED_PRODUCTS.filter(p => p.metadata.tags.includes('create-your-vibe')),
    'shop-your-values': exports.SEED_PRODUCTS.filter(p => p.metadata.tags.includes('shop-your-values')),
    'creator-community': exports.SEED_PRODUCTS.filter(p => p.metadata.tags.includes('creator-community'))
};
// Product distribution summary - Strategic 75-Product Catalog
exports.PRODUCT_DISTRIBUTION = {
    total: 75,
    // Core Categories (Original + Expansions)
    rings: {
        total: 31,
        engagement: 11, // 4 original + 7 moissanite
        promise: 2,
        everyday: 2,
        statement: 2,
        wedding_bands: 8, // 4 new wedding bands + 2 moissanite + 2 men's
        mens: 3,
        fashion: 3
    },
    necklaces: {
        total: 15,
        pendant: 8, // 3 original + 3 moissanite + 1 lab diamond + 1 men's
        chain: 5, // 2 original + 1 moissanite + 1 lab diamond + 1 men's
        statement: 2,
        layering: 0
    },
    earrings: {
        total: 13,
        studs: 7, // 3 original + 1 moissanite + 1 lab diamond + 2 lab gems
        hoops: 2,
        drops: 4 // 2 original + 1 moissanite + 1 lab diamond
    },
    bracelets: {
        total: 7,
        chain: 3, // 2 original + 1 men's
        cuff: 1,
        charm: 1,
        tennis: 2 // 1 original + 1 moissanite
    },
    accessories: {
        total: 1,
        cufflinks: 1
    },
    jewelry: {
        total: 1,
        accessories: 1
    },
    // Collection Distribution by Price Tier
    collections: {
        essential: 40, // $400-1,200 (53% - volume focus)
        signature: 30, // $1,200-3,500 (40% - margin focus)
        premium: 5 // $3,500+ (7% - luxury positioning)
    },
    // New Category Mappings
    new_categories: {
        moissanite: 15,
        mens_jewelry: 6,
        wedding_bands: 4,
        lab_diamonds: 12,
        lab_gems: 8
    },
    // Navigation Category Coverage
    navigation_mapping: {
        'create-your-vibe': exports.NAVIGATION_CATEGORY_MAPPING['create-your-vibe'].length,
        'shop-your-values': exports.NAVIGATION_CATEGORY_MAPPING['shop-your-values'].length,
        'creator-community': exports.NAVIGATION_CATEGORY_MAPPING['creator-community'].length,
        'moissanite': 15,
        'lab-diamonds': 12,
        'lab-gems': 8,
        'mens-jewelry': 6
    },
    // Business Impact Metrics
    aov_target: {
        current_avg: 900,
        target_avg: 2200,
        essential_avg: 650,
        signature_avg: 2000,
        premium_avg: 4100
    }
};
