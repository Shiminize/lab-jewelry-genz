/**
 * Unified Product Seed Script
 * 
 * Seeds MongoDB with comprehensive product data for:
 * - Widget (featuredInWidget, readyToShip, tags, badges)
 * - Homepage (metadata.displaySlots, accentTone, tagline)
 * - Catalog (media, pricing, seo, materials)
 * 
 * Single source of truth for all product data.
 */

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
  const dbName = process.env.MONGODB_DB || 'glowglitch';
  
  console.log('🚀 Starting unified product seed...');
  console.log(`📦 Database: ${dbName}`);
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('products');

  const now = new Date();
  const TONES = ['volt', 'cyan', 'magenta', 'lime'];
  
  const products = [
    // === HERO COLLECTION ITEMS (displaySlots.collectionOrder 1-3) ===
    
    {
      sku: 'RING-HERO-001',
      name: 'Solaris Halo Ring',
      category: 'ring',
      price: 1299,
      pricing: { basePrice: 1299, currency: 'USD' },
      
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
        gallery: ['/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg']
      },
      images: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
        gallery: ['/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg']
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'rings', 'engagement', 'halo', 'bestseller'],
      badges: ['Bestseller', 'Ready to Ship'],
      shippingPromise: 'Ships in 24h',
      
      metadata: {
        displaySlots: {
          collectionOrder: 1,
          spotlightOrder: 1
        },
        accentTone: 'volt',
        tagline: 'Lab diamond halo with coral glow pavé',
        featured: true,
        readyToShip: true,
        primaryMetal: '14k Yellow Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: true
      },
      
      description: 'A stunning halo ring featuring lab-grown diamonds set in 14k yellow gold. The coral glow pavé adds a modern twist to this classic engagement ring design.',
      seo: { slug: 'solaris-halo-ring' },
      materials: [{ name: '14k Yellow Gold' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'EAR-HERO-001',
      name: 'Constellation Ear Stack',
      category: 'earring',
      price: 899,
      pricing: { basePrice: 899, currency: 'USD' },
      
      imageUrl: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
        gallery: ['/images/category/earrings/81620_Y_1_1600X1600.jpg']
      },
      images: {
        primary: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
        gallery: ['/images/category/earrings/81620_Y_1_1600X1600.jpg']
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'earrings', 'ear stack', 'everyday'],
      badges: ['Ready to Ship', 'New'],
      shippingPromise: 'Ships in 24h',
      
      metadata: {
        displaySlots: {
          collectionOrder: 2,
          spotlightOrder: 2
        },
        accentTone: 'cyan',
        tagline: 'Three-piece ear stack in mixed metals',
        featured: true,
        readyToShip: true,
        primaryMetal: 'Mixed Metals',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'A curated set of three earrings designed to be worn together. Mix and match metals for a personalized look.',
      seo: { slug: 'constellation-ear-stack' },
      materials: [{ name: '14k Gold' }, { name: 'Sterling Silver' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'NECK-HERO-001',
      name: 'Lumina Pendant Necklace',
      category: 'necklace',
      price: 1899,
      pricing: { basePrice: 1899, currency: 'USD' },
      
      imageUrl: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
        gallery: ['/images/category/necklaces/95040_Y_1_1600X1600.jpg']
      },
      images: {
        primary: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
        gallery: ['/images/category/necklaces/95040_Y_1_1600X1600.jpg']
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'necklace', 'pendant', 'lab-grown', 'gift'],
      badges: ['Ready to Ship', 'Eco-Certified'],
      shippingPromise: 'Ships today',
      
      metadata: {
        displaySlots: {
          collectionOrder: 3,
          spotlightOrder: 3
        },
        accentTone: 'magenta',
        tagline: 'Floating pear-cut centerpiece with gradient chain',
        featured: true,
        readyToShip: true,
        primaryMetal: '14k White Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'An elegant pendant featuring a floating pear-cut lab diamond on a coral sky gradient chain.',
      seo: { slug: 'lumina-pendant-necklace' },
      materials: [{ name: '14k White Gold' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    // === SPOTLIGHT ITEMS (displaySlots.spotlightOrder 4-6) ===
    
    {
      sku: 'RING-SPOT-002',
      name: 'Aurora Solitaire Ring',
      category: 'ring',
      price: 2499,
      pricing: { basePrice: 2499, currency: 'USD' },
      
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
        gallery: ['/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg']
      },
      images: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'rings', 'engagement', 'solitaire', 'luxury'],
      badges: ['Ready to Ship', 'Lab Grown'],
      shippingPromise: 'Ships today',
      
      metadata: {
        displaySlots: {
          spotlightOrder: 4
        },
        accentTone: 'lime',
        tagline: 'Classic solitaire in platinum',
        featured: true,
        readyToShip: true,
        primaryMetal: 'Platinum',
        limitedDrop: false,
        status: 'active',
        bestseller: true
      },
      
      description: 'A timeless solitaire engagement ring featuring a brilliant lab diamond in platinum setting.',
      seo: { slug: 'aurora-solitaire-ring' },
      materials: [{ name: 'Platinum' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'GIFT-SPOT-001',
      name: 'Minimalist Band Ring',
      category: 'ring',
      price: 299,
      pricing: { basePrice: 299, currency: 'USD' },
      
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'rings', 'gift', 'under-300', 'minimalist'],
      badges: ['Ready to Ship', 'Gift Favorite'],
      shippingPromise: 'Ships in 24h',
      
      metadata: {
        displaySlots: {
          spotlightOrder: 5
        },
        accentTone: 'volt',
        tagline: 'Simple elegance, everyday luxury',
        featured: true,
        readyToShip: true,
        primaryMetal: 'Sterling Silver',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'A sleek minimalist band perfect for everyday wear or stacking. Made from recycled sterling silver.',
      seo: { slug: 'minimalist-band-ring' },
      materials: [{ name: 'Recycled Sterling Silver' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'BRACE-SPOT-001',
      name: 'Celestial Link Bracelet',
      category: 'bracelet',
      price: 1599,
      pricing: { basePrice: 1599, currency: 'USD' },
      
      imageUrl: '/images/category/bracelets/88000_RND_0700CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/bracelets/88000_RND_0700CT_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/bracelets/88000_RND_0700CT_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: false,
      tags: ['ready-to-ship', 'bracelet', 'link', 'luxury'],
      badges: ['Ready to Ship'],
      shippingPromise: 'Ships in 48h',
      
      metadata: {
        displaySlots: {
          spotlightOrder: 6
        },
        accentTone: 'cyan',
        tagline: 'Diamond-studded links for wrist elegance',
        featured: true,
        readyToShip: true,
        primaryMetal: '14k Yellow Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'An elegant link bracelet featuring lab diamonds set in 14k yellow gold links.',
      seo: { slug: 'celestial-link-bracelet' },
      materials: [{ name: '14k Yellow Gold' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    // === WIDGET-ONLY ITEMS (No displaySlots, featuredInWidget=true) ===
    
    {
      sku: 'RING-WIDGET-003',
      name: 'Lumen Pavé Ring',
      category: 'ring',
      price: 1499,
      pricing: { basePrice: 1499, currency: 'USD' },
      
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: true,
      tags: ['ready-to-ship', 'rings', 'pave', 'stackable'],
      badges: ['New', 'Ready to Ship'],
      shippingPromise: 'Ships in 48h',
      
      metadata: {
        accentTone: 'magenta',
        tagline: 'Delicate pavé for daily sparkle',
        featured: false,
        readyToShip: true,
        primaryMetal: '14k White Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'A delicate pavé ring perfect for stacking or wearing alone. Features lab diamonds in white gold.',
      seo: { slug: 'lumen-pave-ring' },
      materials: [{ name: '14k White Gold' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    // === CATALOG-ONLY ITEMS (No displaySlots, No featuredInWidget) ===
    
    {
      sku: 'RING-CAT-001',
      name: 'Nebula Custom Ring',
      category: 'ring',
      price: 999,
      pricing: { basePrice: 999, currency: 'USD' },
      
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg'
      },
      
      readyToShip: false,
      featuredInWidget: false,
      tags: ['custom', 'rings', 'made-to-order'],
      badges: ['Made to Order'],
      shippingPromise: 'Made to order - 3-4 weeks',
      
      metadata: {
        accentTone: 'lime',
        tagline: 'Custom designed for you',
        featured: false,
        readyToShip: false,
        primaryMetal: '14k Rose Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'A fully customizable ring designed to your specifications. Choose your metal, stone, and setting.',
      seo: { slug: 'nebula-custom-ring' },
      materials: [{ name: '14k Rose Gold' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'EAR-CAT-002',
      name: 'Coral Sky Studs',
      category: 'earring',
      price: 749,
      pricing: { basePrice: 749, currency: 'USD' },
      
      imageUrl: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/earrings/81620_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/earrings/81620_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: false,
      tags: ['ready-to-ship', 'earrings', 'studs', 'everyday'],
      badges: ['Best Seller'],
      shippingPromise: 'Ships in 24h',
      
      metadata: {
        accentTone: 'volt',
        tagline: 'Classic studs with modern flair',
        featured: false,
        readyToShip: true,
        primaryMetal: '14k Yellow Gold',
        limitedDrop: false,
        status: 'active',
        bestseller: true
      },
      
      description: 'Classic diamond studs with a modern coral glow finish. Perfect for everyday elegance.',
      seo: { slug: 'coral-sky-studs' },
      materials: [{ name: '14k Yellow Gold' }, { name: 'Lab Diamond' }],
      gemstones: [{ name: 'Lab-Grown Diamond' }],
      
      createdAt: now,
      updatedAt: now
    },
    
    {
      sku: 'NECK-CAT-002',
      name: 'Infinity Chain Necklace',
      category: 'necklace',
      price: 599,
      pricing: { basePrice: 599, currency: 'USD' },
      
      imageUrl: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
      media: {
        primary: '/images/category/necklaces/95040_Y_1_1600X1600.jpg'
      },
      images: {
        primary: '/images/category/necklaces/95040_Y_1_1600X1600.jpg'
      },
      
      readyToShip: true,
      featuredInWidget: false,
      tags: ['ready-to-ship', 'necklace', 'chain', 'layering'],
      badges: [],
      shippingPromise: 'Ships in 48h',
      
      metadata: {
        accentTone: 'cyan',
        tagline: 'Delicate chain for layering',
        featured: false,
        readyToShip: true,
        primaryMetal: 'Sterling Silver',
        limitedDrop: false,
        status: 'active',
        bestseller: false
      },
      
      description: 'A delicate infinity chain perfect for layering or wearing alone. Made from recycled sterling silver.',
      seo: { slug: 'infinity-chain-necklace' },
      materials: [{ name: 'Recycled Sterling Silver' }],
      
      createdAt: now,
      updatedAt: now
    }
  ];

  console.log(`\n📝 Seeding ${products.length} products...`);
  
  let upsertCount = 0;
  for (const product of products) {
    const { createdAt, ...rest } = product;
    await col.updateOne(
      { sku: product.sku },
      {
        $set: rest,
        $setOnInsert: { createdAt }
      },
      { upsert: true }
    );
    upsertCount++;
    process.stdout.write(`\r✓ Processed ${upsertCount}/${products.length}`);
  }
  console.log('\n');

  // Create indexes
  console.log('📊 Creating indexes...');
  const indexes = [
    [{ sku: 1 }, { unique: true, partialFilterExpression: { sku: { $exists: true, $type: 'string' } } }],
    [{ category: 1, readyToShip: 1 }, {}],
    [{ tags: 1 }, {}],
    [{ featuredInWidget: 1 }, {}],
    [{ 'metadata.displaySlots.collectionOrder': 1 }, {}],
    [{ 'metadata.displaySlots.spotlightOrder': 1 }, {}],
    [{ 'metadata.featured': 1 }, {}],
    [{ readyToShip: 1, featuredInWidget: 1 }, {}],
    [{ 'seo.slug': 1 }, {}],
  ];

  for (const [keys, options] of indexes) {
    try {
      await col.createIndex(keys, options);
      console.log(`  ✓ Created index: ${JSON.stringify(keys)}`);
    } catch (err) {
      if (err?.code === 85 || err?.code === 86 || err?.code === 11000) {
        console.log(`  ⚠ Index ${JSON.stringify(keys)} already exists, skipped`);
      } else {
        throw err;
      }
    }
  }

  // Verify results
  console.log('\n🔍 Verification:');
  const totalCount = await col.countDocuments({});
  const widgetCount = await col.countDocuments({ featuredInWidget: true });
  const collectionCount = await col.countDocuments({ 'metadata.displaySlots.collectionOrder': { $exists: true } });
  const spotlightCount = await col.countDocuments({ 'metadata.displaySlots.spotlightOrder': { $exists: true } });
  
  console.log(`  Total products: ${totalCount}`);
  console.log(`  Widget products (featuredInWidget=true): ${widgetCount}`);
  console.log(`  Homepage collection items (displaySlots.collectionOrder): ${collectionCount}`);
  console.log(`  Homepage spotlight items (displaySlots.spotlightOrder): ${spotlightCount}`);
  
  const expectedWidget = products.filter(p => p.featuredInWidget).length;
  const expectedCollection = products.filter(p => p.metadata?.displaySlots?.collectionOrder).length;
  const expectedSpotlight = products.filter(p => p.metadata?.displaySlots?.spotlightOrder).length;
  
  console.log('\n✅ Verification:');
  console.log(`  Widget: ${widgetCount} / ${expectedWidget} expected ${widgetCount === expectedWidget ? '✓' : '✗'}`);
  console.log(`  Collection: ${collectionCount} / ${expectedCollection} expected ${collectionCount === expectedCollection ? '✓' : '✗'}`);
  console.log(`  Spotlight: ${spotlightCount} / ${expectedSpotlight} expected ${spotlightCount === expectedSpotlight ? '✓' : '✗'}`);

  console.log('\n🎉 Unified seed complete!');
  await client.close();
}

main().catch(error => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});

