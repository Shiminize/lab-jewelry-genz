/**
 * Database Seeding Script
 * Populates the database with initial product catalog
 * Run with: node scripts/seed-database.js
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

// Import seed data (converted to CommonJS format)
const { SEED_PRODUCTS, STANDARD_MATERIALS, STANDARD_GEMSTONES } = require('../src/data/seed-products-cjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch'

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  let client
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(DATABASE_NAME)
    console.log(`✅ Connected to database: ${DATABASE_NAME}`)

    // Get collections
    const productsCollection = db.collection('products')
    const materialsCollection = db.collection('materials')
    const gemstonesCollection = db.collection('gemstones')

    // Check if data already exists
    const existingProductsCount = await productsCollection.countDocuments()
    if (existingProductsCount > 0) {
      console.log(`⚠️  Database already contains ${existingProductsCount} products`)
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise((resolve) => {
        readline.question('Do you want to clear existing data and reseed? (y/N): ', resolve)
      })
      readline.close()
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled')
        return
      }
      
      // Clear existing data
      console.log('🗑️  Clearing existing data...')
      await productsCollection.deleteMany({})
      await materialsCollection.deleteMany({})
      await gemstonesCollection.deleteMany({})
    }

    // Seed materials
    console.log('💎 Seeding materials...')
    await materialsCollection.insertMany(STANDARD_MATERIALS)
    console.log(`✅ Inserted ${STANDARD_MATERIALS.length} materials`)

    // Seed gemstones
    console.log('💍 Seeding gemstones...')
    await gemstonesCollection.insertMany(STANDARD_GEMSTONES)
    console.log(`✅ Inserted ${STANDARD_GEMSTONES.length} gemstones`)

    // Seed products with proper timestamps and IDs
    console.log('🛍️  Seeding products...')
    const productsWithMetadata = SEED_PRODUCTS.map((product, index) => ({
      ...product,
      _id: `prod_${Date.now()}_${index.toString().padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    await productsCollection.insertMany(productsWithMetadata)
    console.log(`✅ Inserted ${productsWithMetadata.length} products`)

    // Create indexes for optimal performance
    console.log('📊 Creating database indexes...')
    
    // Text search index
    await productsCollection.createIndex({
      'name': 'text',
      'description': 'text',
      'seo.keywords': 'text',
      'metadata.tags': 'text'
    }, {
      name: 'product_text_search',
      weights: {
        'name': 10,
        'description': 5,
        'seo.keywords': 8,
        'metadata.tags': 3
      }
    })

    // Category and filtering indexes
    await productsCollection.createIndex({ 'category': 1, 'subcategory': 1 })
    await productsCollection.createIndex({ 'pricing.basePrice': 1 })
    await productsCollection.createIndex({ 'metadata.featured': 1, 'metadata.status': 1 })
    await productsCollection.createIndex({ 'metadata.bestseller': 1 })
    await productsCollection.createIndex({ 'inventory.available': 1 })
    await productsCollection.createIndex({ 'seo.slug': 1 }, { unique: true })
    await productsCollection.createIndex({ 'inventory.sku': 1 }, { unique: true })

    console.log('✅ Database indexes created')

    // Display seeding summary
    console.log('\n🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   • ${STANDARD_MATERIALS.length} materials`)
    console.log(`   • ${STANDARD_GEMSTONES.length} gemstones`)
    console.log(`   • ${productsWithMetadata.length} products`)
    console.log(`   • Categories: rings, necklaces, earrings, bracelets`)
    console.log(`   • Price range: $${Math.min(...productsWithMetadata.map(p => p.pricing.basePrice))} - $${Math.max(...productsWithMetadata.map(p => p.pricing.basePrice))}`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding process finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }