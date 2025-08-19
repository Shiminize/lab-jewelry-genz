/**
 * Fix Database Index Issues
 * Removes problematic indexes and cleans up null SKU entries
 * Run with: node scripts/fix-database-indexes.js
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch'

async function fixDatabaseIndexes() {
  console.log('🛠️  Starting database index fix...')
  
  let client
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(DATABASE_NAME)
    console.log(`✅ Connected to database: ${DATABASE_NAME}`)

    const productsCollection = db.collection('products')

    // Check current indexes
    console.log('📊 Checking current indexes...')
    const indexes = await productsCollection.indexes()
    console.log('Current indexes:', indexes.map(idx => idx.name))

    // Drop the SKU index if it exists
    try {
      await productsCollection.dropIndex('sku_1')
      console.log('✅ Dropped problematic SKU index')
    } catch (error) {
      console.log('ℹ️  SKU index not found or already dropped')
    }

    // Remove any products with null SKU values
    const deleteResult = await productsCollection.deleteMany({
      $or: [
        { 'inventory.sku': null },
        { 'inventory.sku': { $exists: false } }
      ]
    })
    console.log(`🗑️  Removed ${deleteResult.deletedCount} products with null/missing SKU`)

    // Clear all existing products to ensure clean state
    const clearResult = await productsCollection.deleteMany({})
    console.log(`🗑️  Cleared ${clearResult.deletedCount} products for fresh seeding`)

    // Also clear materials and gemstones
    await db.collection('materials').deleteMany({})
    await db.collection('gemstones').deleteMany({})
    console.log('✅ Cleared materials and gemstones collections')

    console.log('\n🎉 Database cleanup completed successfully!')
    console.log('💡 You can now run the seeding script without index conflicts')

  } catch (error) {
    console.error('❌ Database fix failed:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run the fix function
if (require.main === module) {
  fixDatabaseIndexes()
    .then(() => {
      console.log('✨ Database fix process finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database fix process failed:', error)
      process.exit(1)
    })
}

module.exports = { fixDatabaseIndexes }