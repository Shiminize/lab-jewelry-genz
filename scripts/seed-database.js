/* Seed demo products with labels and featuredInWidget */
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
  const dbName = process.env.MONGODB_DB || 'glowglitch';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('products');

  const now = new Date();
  const docs = [
    {
      sku: 'RING-READY-001',
      title: 'Solaris Halo Ring',
      price: 1299, currency: 'USD',
      category: 'ring',
      metal: '14k_yellow',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'rings', 'engagement', 'halo', 'bestseller'],
      shippingPromise: 'Ships in 24h',
      badges: ['Bestseller', 'Ready to Ship'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'RING-READY-002',
      title: 'Lumen Pavé Ring',
      price: 1499, currency: 'USD',
      category: 'ring',
      metal: '14k_white',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'rings', 'pave', 'stackable'],
      shippingPromise: 'Ships in 48h',
      badges: ['New', 'Ready to Ship'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'RING-READY-003',
      title: 'Aurora Solitaire Ring',
      price: 2499, currency: 'USD',
      category: 'ring',
      metal: 'platinum',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'rings', 'engagement', 'solitaire', 'luxury'],
      shippingPromise: 'Ships today',
      badges: ['Ready to Ship', 'Lab Grown'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'RING-MADE-TO-ORDER-004',
      title: 'Nebula Custom Ring',
      price: 999, currency: 'USD',
      category: 'ring',
      metal: '14k_rose',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: false,
      tags: ['custom', 'rings', 'made-to-order'],
      shippingPromise: 'Made to order - 3-4 weeks',
      badges: ['Made to Order'],
      featuredInWidget: false,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'EAR-READY-001',
      title: 'Coral Sky Studs',
      price: 899, currency: 'USD',
      category: 'earring',
      metal: '14k_yellow',
      imageUrl: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'earrings', 'studs', 'everyday'],
      shippingPromise: 'Ships in 24h',
      badges: ['Ready to Ship', 'Best Seller'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'NECK-READY-001',
      title: 'Lab Diamond Pendant',
      price: 1899, currency: 'USD',
      category: 'necklace',
      metal: '14k_white',
      imageUrl: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'necklace', 'pendant', 'lab-grown', 'gift'],
      shippingPromise: 'Ships today',
      badges: ['Ready to Ship', 'Eco-Certified'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
    {
      sku: 'GIFT-UNDER-300-001',
      title: 'Minimalist Band Ring',
      price: 299, currency: 'USD',
      category: 'ring',
      metal: 'silver',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'rings', 'gift', 'under-300', 'minimalist'],
      shippingPromise: 'Ships in 24h',
      badges: ['Ready to Ship', 'Gift Favorite'],
      featuredInWidget: true,
      updatedAt: now, createdAt: now,
    },
  ];

  for (const d of docs) {
    const { createdAt, ...rest } = d;
    await col.updateOne(
      { sku: d.sku },
      { $set: rest, $setOnInsert: { createdAt } },
      { upsert: true }
    );
  }

  const indexes = [
    [{ sku: 1 }, { unique: true, partialFilterExpression: { sku: { $exists: true, $type: 'string' } } }],
    [{ category: 1, readyToShip: 1 }, {}],
    [{ tags: 1 }, {}],
    [{ featuredInWidget: 1 }, {}],
    [{ metal: 1 }, {}],
    [{ readyToShip: 1, featuredInWidget: 1 }, {}],
  ];

  for (const [keys, options] of indexes) {
    try {
      await col.createIndex(keys, options);
    } catch (err) {
      if (err?.code === 85 || err?.code === 86 || err?.code === 11000) {
        console.warn(`Index ${JSON.stringify(keys)} skipped: ${err.message}`);
      } else {
        throw err;
      }
    }
  }

  console.log('Seed complete.');
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
