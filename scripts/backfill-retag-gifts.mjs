#!/usr/bin/env node
/* Backfill: Remove 'gift' tag from products >= $300, add 'gift' tag to products < $300 */
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
const PRICE_CEILING = 300;

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('✓ Connected to MongoDB');

  const db = client.db(dbName);
  const col = db.collection('products');
  const now = new Date();

  // Step 1: Remove 'gift' tag from products >= $300
  console.log(`\n1. Removing 'gift' tag from products >= $${PRICE_CEILING}...`);
  const removeResult = await col.updateMany(
    {
      price: { $gte: PRICE_CEILING },
      tags: 'gift',
    },
    {
      $pull: { tags: 'gift' },
      $set: { updatedAt: now },
    }
  );
  console.log(`  ✓ Modified ${removeResult.modifiedCount} products (removed 'gift' tag)`);

  // Step 2: Add 'gift' tag to products < $300 that don't have it
  console.log(`\n2. Adding 'gift' tag to products < $${PRICE_CEILING} without it...`);
  const addResult = await col.updateMany(
    {
      price: { $lt: PRICE_CEILING, $gt: 0 },
      tags: { $ne: 'gift' },
    },
    {
      $addToSet: { tags: 'gift' },
      $set: { updatedAt: now },
    }
  );
  console.log(`  ✓ Modified ${addResult.modifiedCount} products (added 'gift' tag)`);

  // Step 3: Verification counts
  console.log(`\n3. Verification counts:`);
  const giftUnder300 = await col.countDocuments({
    price: { $lt: PRICE_CEILING, $gt: 0 },
    tags: 'gift',
  });
  const giftAtOrOver300 = await col.countDocuments({
    price: { $gte: PRICE_CEILING },
    tags: 'gift',
  });
  const noGiftUnder300 = await col.countDocuments({
    price: { $lt: PRICE_CEILING, $gt: 0 },
    tags: { $ne: 'gift' },
  });

  console.log(`  Products < $${PRICE_CEILING} WITH 'gift' tag: ${giftUnder300} ✓`);
  console.log(`  Products >= $${PRICE_CEILING} WITH 'gift' tag: ${giftAtOrOver300} ${giftAtOrOver300 === 0 ? '✓' : '⚠️'}`);
  console.log(`  Products < $${PRICE_CEILING} WITHOUT 'gift' tag: ${noGiftUnder300} ${noGiftUnder300 === 0 ? '✓' : 'ℹ️'}`);

  if (giftAtOrOver300 > 0) {
    console.log(`\n⚠️  WARNING: ${giftAtOrOver300} products >= $${PRICE_CEILING} still have 'gift' tag!`);
    const samples = await col.find({ price: { $gte: PRICE_CEILING }, tags: 'gift' }).limit(5).toArray();
    console.log('  Sample SKUs:', samples.map(s => `${s.sku} ($${s.price})`).join(', '));
  }

  if (noGiftUnder300 > 0) {
    console.log(`\nℹ️  INFO: ${noGiftUnder300} products < $${PRICE_CEILING} don't have 'gift' tag`);
    console.log('  (This may be intentional for non-gift items like made-to-order products)');
  }

  console.log(`\n✓ Backfill complete`);
  await client.close();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

