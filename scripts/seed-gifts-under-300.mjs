#!/usr/bin/env node
/* Seed 24 gift items under $300 across categories */
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

// Load env vars
try {
  const envContent = readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  // .env not found, continue
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
const dbName = process.env.MONGODB_DB || 'glowglitch';

const prices = [59, 79, 99, 129, 149, 179, 199, 219, 249, 269, 289, 299];
const categories = ['ring', 'earring', 'necklace', 'bracelet'];
const images = {
  ring: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
  earring: '/images/category/earrings/81620_Y_1_1600X1600.jpg',
  necklace: '/images/category/necklaces/95040_Y_1_1600X1600.jpg',
  bracelet: '/images/category/bracelets/16023_RND_0075CT_Y_1_1600X1600.jpg',
};

const titles = {
  ring: ['Minimalist Band', 'Stackable Ring', 'Dainty Solitaire', 'Simple Band', 'Classic Ring', 'Thin Band'],
  earring: ['Stud Earrings', 'Drop Earrings', 'Hoop Earrings', 'Dangle Earrings', 'Mini Hoops', 'Simple Studs'],
  necklace: ['Chain Necklace', 'Pendant Necklace', 'Bar Necklace', 'Layering Chain', 'Delicate Pendant', 'Simple Chain'],
  bracelet: ['Chain Bracelet', 'Bangle Bracelet', 'Tennis Bracelet', 'Cuff Bracelet', 'Thin Bracelet', 'Link Bracelet'],
};

const metals = ['14k_yellow', '14k_white', '14k_rose', 'silver', 'platinum'];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('✓ Connected to MongoDB');

  const db = client.db(dbName);
  const col = db.collection('products');
  const now = new Date();

  const docs = [];
  let idx = 0;

  // Create 24 SKUs (12 prices × 2 per price)
  for (const price of prices) {
    for (let i = 0; i < 2; i++) {
      const category = categories[idx % categories.length];
      const titleOptions = titles[category];
      const title = titleOptions[idx % titleOptions.length];
      const metal = metals[idx % metals.length];

      docs.push({
        sku: `GIFT-UNDER-300-${String(idx + 1).padStart(3, '0')}`,
        title: `${title} - $${price}`,
        price,
        currency: 'USD',
        category,
        metal,
        imageUrl: images[category],
        readyToShip: true,
        tags: ['gift', 'ready-to-ship', category, 'under-300'],
        shippingPromise: 'Ships in 24-48h',
        badges: ['Gift Favorite', 'Ready to Ship'],
        featuredInWidget: true,
        updatedAt: now,
        createdAt: now,
      });

      idx++;
    }
  }

  console.log(`Upserting ${docs.length} gift items under $300...`);

  for (const d of docs) {
    const { createdAt, ...rest } = d;
    await col.updateOne(
      { sku: d.sku },
      { $set: rest, $setOnInsert: { createdAt } },
      { upsert: true }
    );
  }

  console.log(`✓ Upserted ${docs.length} gift items`);
  console.log(`  Price range: $${Math.min(...prices)} - $${Math.max(...prices)}`);
  console.log(`  Categories: ${categories.join(', ')}`);
  console.log(`  All tagged: gift, ready-to-ship, featuredInWidget=true`);

  await client.close();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

