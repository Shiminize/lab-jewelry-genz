#!/usr/bin/env node
/**
 * Backfill Price Bands
 * 
 * Computes and sets priceBand field for existing products
 * Idempotent: Skips products that already have a priceBand
 */

import { MongoClient } from 'mongodb';

const PRICE_BANDS = {
  'under-100': { min: 0, max: 100 },
  'under-300': { min: 0, max: 300 },
  'under-500': { min: 0, max: 500 },
  'under-1000': { min: 0, max: 1000 },
  'over-1000': { min: 1000, max: Number.MAX_SAFE_INTEGER }
};

function computePriceBand(price) {
  if (typeof price !== 'number' || price < 0) {
    return 'over-1000';
  }
  if (price < 100) return 'under-100';
  if (price < 300) return 'under-300';
  if (price < 500) return 'under-500';
  if (price < 1000) return 'under-1000';
  return 'over-1000';
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'glowglitch';

  console.log('🔧 Starting price band backfill...');
  console.log(`📦 Database: ${dbName}`);

  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(dbName).collection('products');

  // Find products without priceBand field
  const productsWithoutBand = await col.find({
    priceBand: { $exists: false }
  }).toArray();

  console.log(`\n📊 Found ${productsWithoutBand.length} products without priceBand`);

  if (productsWithoutBand.length === 0) {
    console.log('✅ All products already have priceBand set. Nothing to do.');
    await client.close();
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of productsWithoutBand) {
    try {
      const price = product.price;
      
      if (typeof price !== 'number') {
        console.log(`⚠️  Skipping ${product.sku || product._id}: Invalid price`);
        skipped++;
        continue;
      }

      const band = computePriceBand(price);
      
      await col.updateOne(
        { _id: product._id },
        { 
          $set: { 
            priceBand: band,
            updatedAt: new Date()
          }
        }
      );

      updated++;
      
      if (updated % 10 === 0) {
        console.log(`   ... processed ${updated}/${productsWithoutBand.length}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${product.sku || product._id}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);

  // Verify the results
  const bandCounts = await col.aggregate([
    { $group: { _id: '$priceBand', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log(`\n📊 Price Band Distribution:`);
  bandCounts.forEach(({ _id, count }) => {
    const label = _id || '(none)';
    console.log(`   ${label}: ${count} products`);
  });

  // Create index for priceBand if it doesn't exist
  try {
    await col.createIndex({ priceBand: 1 });
    console.log(`\n✅ Index created: { priceBand: 1 }`);
  } catch (error) {
    if (error.code === 85 || error.code === 86) {
      console.log(`\n✅ Index already exists: { priceBand: 1 }`);
    } else {
      throw error;
    }
  }

  await client.close();
}

main().catch(error => {
  console.error('❌ Backfill failed:', error);
  process.exit(1);
});

