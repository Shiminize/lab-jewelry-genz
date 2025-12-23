/**
 * Title/Image Normalization Migration
 * 
 * Purpose: Normalize product data to use canonical fields
 * - Set title = name when title is missing
 * - Set imageUrl = image when imageUrl is missing
 * 
 * Safety: Additive only (never removes data)
 * Idempotency: Safe to run multiple times
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';

// Load .env.local manually
try {
  const envLocal = readFileSync('.env.local', 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  });
} catch {}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'glowglitch';

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not set.');
  process.exit(1);
}

async function main() {
  console.log('🔧 Title/Image Normalization Migration');
  console.log(`📦 Database: ${dbName}`);
  console.log('');

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(dbName);
    const col = db.collection('products');
    
    // Phase 1: Count documents needing normalization
    console.log('');
    console.log('📊 Phase 1: Analyzing data...');
    
    const missingTitle = await col.countDocuments({
      title: { $exists: false },
      name: { $exists: true, $ne: null, $ne: '' }
    });
    
    const missingImageUrl = await col.countDocuments({
      imageUrl: { $exists: false },
      image: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`   Products missing title (but have name): ${missingTitle}`);
    console.log(`   Products missing imageUrl (but have image): ${missingImageUrl}`);
    
    if (missingTitle === 0 && missingImageUrl === 0) {
      console.log('');
      console.log('✨ All products already normalized! No changes needed.');
      console.log('');
      console.log('📋 Summary:');
      console.log('   Modified: 0');
      console.log('   Skipped: 0');
      return;
    }
    
    // Phase 2: Normalize title field
    console.log('');
    console.log('📝 Phase 2: Normalizing title field...');
    
    let titleModified = 0;
    if (missingTitle > 0) {
      const titleResult = await col.updateMany(
        {
          title: { $exists: false },
          name: { $exists: true, $ne: null, $ne: '' }
        },
        [
          {
            $set: {
              title: '$name',
              updatedAt: new Date()
            }
          }
        ]
      );
      
      titleModified = titleResult.modifiedCount;
      console.log(`   ✅ Set title = name for ${titleModified} products`);
    } else {
      console.log('   ⏭️  No title normalization needed');
    }
    
    // Phase 3: Normalize imageUrl field
    console.log('');
    console.log('🖼️  Phase 3: Normalizing imageUrl field...');
    
    let imageModified = 0;
    if (missingImageUrl > 0) {
      const imageResult = await col.updateMany(
        {
          imageUrl: { $exists: false },
          image: { $exists: true, $ne: null, $ne: '' }
        },
        [
          {
            $set: {
              imageUrl: '$image',
              updatedAt: new Date()
            }
          }
        ]
      );
      
      imageModified = imageResult.modifiedCount;
      console.log(`   ✅ Set imageUrl = image for ${imageModified} products`);
    } else {
      console.log('   ⏭️  No imageUrl normalization needed');
    }
    
    // Phase 4: Verification
    console.log('');
    console.log('🔍 Phase 4: Verification...');
    
    const stillMissingTitle = await col.countDocuments({
      title: { $exists: false },
      name: { $exists: true, $ne: null, $ne: '' }
    });
    
    const stillMissingImageUrl = await col.countDocuments({
      imageUrl: { $exists: false },
      image: { $exists: true, $ne: null, $ne: '' }
    });
    
    if (stillMissingTitle === 0 && stillMissingImageUrl === 0) {
      console.log('   ✅ All products normalized successfully!');
    } else {
      console.warn(`   ⚠️  Still missing: ${stillMissingTitle} titles, ${stillMissingImageUrl} imageUrls`);
    }
    
    // Phase 5: Sample check
    console.log('');
    console.log('🔬 Phase 5: Sample check...');
    
    const sample = await col.findOne({ title: { $exists: true }, name: { $exists: true } });
    if (sample) {
      console.log('   Sample product:');
      console.log(`     SKU: ${sample.sku}`);
      console.log(`     title: ${sample.title}`);
      console.log(`     name: ${sample.name || '(not set)'}`);
      console.log(`     imageUrl: ${sample.imageUrl ? 'SET' : 'MISSING'}`);
      console.log(`     image: ${sample.image ? 'SET' : 'MISSING'}`);
    }
    
    // Summary
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Title fields normalized: ${titleModified}`);
    console.log(`   ImageUrl fields normalized: ${imageModified}`);
    console.log(`   Total modified: ${titleModified + imageModified}`);
    console.log('');
    console.log('✅ Migration complete!');
    console.log('');
    console.log('📌 Next Steps:');
    console.log('   1. Keep runtime fallbacks for 1-2 releases');
    console.log('   2. Monitor for any issues');
    console.log('   3. Remove fallbacks after data is stable');
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('');
    console.log('🔌 Disconnected from MongoDB');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

