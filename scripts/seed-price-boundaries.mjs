#!/usr/bin/env node
/* Seed exact price boundary SKUs at $299.99, $300.00, $300.01 */
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

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('✓ Connected to MongoDB');

  const db = client.db(dbName);
  const col = db.collection('products');
  const now = new Date();

  const boundaries = [
    {
      sku: 'BOUND-299_99',
      title: 'Boundary Test Ring - $299.99',
      price: 299.99,
      currency: 'USD',
      category: 'ring',
      metal: '14k_yellow',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['gift', 'ready-to-ship', 'ring', 'boundary-test', 'under-300'],
      shippingPromise: 'Ships in 24h',
      badges: ['Test Product'],
      featuredInWidget: false, // Not featured to avoid showing in main widget flow
      updatedAt: now,
      createdAt: now,
    },
    {
      sku: 'BOUND-300_00',
      title: 'Boundary Test Ring - $300.00',
      price: 300.00,
      currency: 'USD',
      category: 'ring',
      metal: '14k_yellow',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'ring', 'boundary-test'], // No 'gift' tag - at $300
      shippingPromise: 'Ships in 24h',
      badges: ['Test Product'],
      featuredInWidget: false,
      updatedAt: now,
      createdAt: now,
    },
    {
      sku: 'BOUND-300_01',
      title: 'Boundary Test Ring - $300.01',
      price: 300.01,
      currency: 'USD',
      category: 'ring',
      metal: '14k_yellow',
      imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      readyToShip: true,
      tags: ['ready-to-ship', 'ring', 'boundary-test'], // No 'gift' tag - over $300
      shippingPromise: 'Ships in 24h',
      badges: ['Test Product'],
      featuredInWidget: false,
      updatedAt: now,
      createdAt: now,
    },
  ];

  console.log(`Upserting ${boundaries.length} boundary test SKUs...`);

  for (const d of boundaries) {
    const { createdAt, ...rest } = d;
    await col.updateOne(
      { sku: d.sku },
      { $set: rest, $setOnInsert: { createdAt } },
      { upsert: true }
    );
    console.log(`  ✓ ${d.sku} @ $${d.price} - gift tag: ${d.tags.includes('gift')}`);
  }

  console.log(`✓ Boundary SKUs created`);
  console.log(`  BOUND-299_99: $299.99 (should have 'gift' tag)`);
  console.log(`  BOUND-300_00: $300.00 (NO 'gift' tag)`);
  console.log(`  BOUND-300_01: $300.01 (NO 'gift' tag)`);

  await client.close();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

