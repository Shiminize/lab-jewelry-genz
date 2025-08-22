/**
 * Material Specs Migration Script
 * Migrates legacy Product format to ProductListDTO with materialSpecs
 * CLAUDE_RULES compliance: Phase 1 Data Layer Foundation implementation
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch'

// Material type mappings following CLAUDE_RULES material-only focus
const METAL_TYPE_MAPPING = {
  'gold': '14k-gold',
  'gold-14k-yellow': '14k-gold',
  'gold-14k-white': '14k-gold', 
  'gold-14k-rose': '14k-gold',
  'white-gold': '14k-gold',
  'rose-gold': '14k-gold',
  'silver': 'silver',
  'platinum': 'platinum'
}

const STONE_TYPE_MAPPING = {
  'diamond': 'lab-diamond',
  'other': 'moissanite', // Based on seed data analysis, "other" type is moissanite
  'emerald': 'lab-emerald',
  'ruby': 'lab-ruby',
  'sapphire': 'lab-sapphire'
}

async function migrateToMaterialSpecs() {
  console.log('🚀 Starting material specs migration...')
  
  let client
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DATABASE_NAME)
    const productsCollection = db.collection('products')

    // Get all products for migration
    const products = await productsCollection.find({}).toArray()
    console.log(`📦 Found ${products.length} products to migrate`)

    let successCount = 0
    let errorCount = 0
    const errors = []

    // Process each product
    for (const product of products) {
      try {
        const materialSpecs = generateMaterialSpecs(product)
        
        if (materialSpecs) {
          // Update product with materialSpecs
          await productsCollection.updateOne(
            { _id: product._id },
            { 
              $set: { 
                materialSpecs,
                // Add migration metadata
                migrationInfo: {
                  migratedAt: new Date(),
                  version: '1.0.0',
                  source: 'customization.materials + customization.gemstones'
                }
              }
            }
          )
          successCount++
          
          // Log successful conversion
          const primaryStone = materialSpecs.primaryStone
          const stoneInfo = primaryStone ? `${primaryStone.carat}CT ${primaryStone.type}` : 'no stone'
          console.log(`✅ ${product.name}: ${materialSpecs.primaryMetal.type} + ${stoneInfo}`)
        } else {
          console.log(`⚠️  Skipped ${product.name}: No valid material data`)
        }
        
      } catch (error) {
        errorCount++
        const errorInfo = {
          productId: product._id,
          productName: product.name,
          error: error.message
        }
        errors.push(errorInfo)
        console.error(`❌ Failed to migrate ${product.name}:`, error.message)
      }
    }

    // Report results
    console.log('\n📊 Migration Results:')
    console.log(`✅ Successful migrations: ${successCount}`)
    console.log(`❌ Failed migrations: ${errorCount}`)
    console.log(`📈 Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`)

    if (errors.length > 0) {
      console.log('\n❌ Migration Errors:')
      errors.forEach(error => {
        console.log(`  - ${error.productName} (${error.productId}): ${error.error}`)
      })
    }

    // Validate migration results
    await validateMigrationResults(productsCollection)

    // Create indexes for material specs
    await createMaterialSpecsIndexes(productsCollection)

    console.log('\n🎉 Material specs migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }
}

/**
 * Generate materialSpecs from legacy product data
 * CLAUDE_RULES compliance: Material-only focus (Stone Type, Carat Weight, Metal & Purity)
 */
function generateMaterialSpecs(product) {
  try {
    // Extract primary metal (required)
    const primaryMetal = extractPrimaryMetal(product)
    if (!primaryMetal) {
      throw new Error('No primary metal found')
    }

    // Extract primary stone (optional)
    const primaryStone = extractPrimaryStone(product)

    return {
      primaryMetal,
      primaryStone
    }
  } catch (error) {
    console.error(`Error generating materialSpecs for ${product.name}:`, error.message)
    return null
  }
}

/**
 * Extract primary metal with proper type mapping
 */
function extractPrimaryMetal(product) {
  // Check customization.materials (seed data format)
  if (product.customization?.materials?.length > 0) {
    const material = product.customization.materials[0]
    const metalType = METAL_TYPE_MAPPING[material.type] || METAL_TYPE_MAPPING[material.id] || material.type
    
    return {
      type: metalType,
      purity: extractMetalPurity(material),
      displayName: formatMetalDisplayName(metalType)
    }
  }

  // Fallback to default
  return {
    type: 'silver',
    purity: '925',
    displayName: '925 Sterling Silver'
  }
}

/**
 * Extract primary stone with carat data (CRITICAL FIX)
 */
function extractPrimaryStone(product) {
  // Check customization.gemstones (seed data format)
  if (product.customization?.gemstones?.length > 0) {
    const gemstone = product.customization.gemstones[0]
    
    // CRITICAL FIX: Proper carat extraction without fallback
    if (!gemstone.carat || gemstone.carat <= 0) {
      console.warn(`Invalid carat data for ${product.name}: ${gemstone.carat}`)
      return null
    }

    // Map stone type with isLabGrown consideration
    const stoneType = mapStoneType(gemstone.type, gemstone.isLabGrown)
    if (!stoneType) {
      console.warn(`Unknown stone type for ${product.name}: ${gemstone.type}`)
      return null
    }

    return {
      type: stoneType,
      carat: gemstone.carat,
      displayName: formatStoneDisplayName(stoneType)
    }
  }

  return null // No stone found
}

/**
 * Map stone type with lab-grown consideration
 */
function mapStoneType(type, isLabGrown) {
  // Handle lab-grown stones from seed data
  if (isLabGrown === true) {
    if (type === 'diamond') return 'lab-diamond'
    if (type === 'emerald') return 'lab-emerald'
    if (type === 'ruby') return 'lab-ruby'
    if (type === 'sapphire') return 'lab-sapphire'
    if (type === 'other') return 'moissanite' // Common in our seed data
  }

  // Direct mapping
  return STONE_TYPE_MAPPING[type] || null
}

/**
 * Extract metal purity from material data
 */
function extractMetalPurity(material) {
  if (material.purity) return material.purity
  if (material.type?.includes('14k')) return '14K'
  if (material.type?.includes('18k')) return '18K'
  if (material.type?.includes('silver')) return '925'
  if (material.type?.includes('platinum')) return '950'
  return '14K' // Default for gold
}

/**
 * Format metal display name
 */
function formatMetalDisplayName(metalType) {
  const displayNames = {
    'silver': '925 Sterling Silver',
    '14k-gold': '14K Gold',
    '18k-gold': '18K Gold',
    'platinum': 'Platinum'
  }
  return displayNames[metalType] || metalType
}

/**
 * Format stone display name
 */
function formatStoneDisplayName(stoneType) {
  const displayNames = {
    'lab-diamond': 'Lab-Grown Diamond',
    'moissanite': 'Moissanite',
    'lab-emerald': 'Lab-Grown Emerald',
    'lab-ruby': 'Lab-Grown Ruby',
    'lab-sapphire': 'Lab-Grown Sapphire'
  }
  return displayNames[stoneType] || stoneType
}

/**
 * Validate migration results
 */
async function validateMigrationResults(collection) {
  console.log('\n🔍 Validating migration results...')
  
  const totalProducts = await collection.countDocuments()
  const withMaterialSpecs = await collection.countDocuments({ 'materialSpecs': { $exists: true } })
  const withPrimaryMetal = await collection.countDocuments({ 'materialSpecs.primaryMetal': { $exists: true } })
  const withPrimaryStone = await collection.countDocuments({ 'materialSpecs.primaryStone': { $exists: true } })

  console.log(`📊 Validation Results:`)
  console.log(`  - Total products: ${totalProducts}`)
  console.log(`  - With materialSpecs: ${withMaterialSpecs} (${((withMaterialSpecs/totalProducts)*100).toFixed(1)}%)`)
  console.log(`  - With primaryMetal: ${withPrimaryMetal} (${((withPrimaryMetal/totalProducts)*100).toFixed(1)}%)`)
  console.log(`  - With primaryStone: ${withPrimaryStone} (${((withPrimaryStone/totalProducts)*100).toFixed(1)}%)`)

  // Test carat distribution after migration
  const caratDistribution = await collection.aggregate([
    { $match: { 'materialSpecs.primaryStone.carat': { $exists: true } } },
    { $group: { 
      _id: '$materialSpecs.primaryStone.carat',
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()

  console.log(`💎 Carat distribution after migration:`)
  caratDistribution.forEach(item => {
    console.log(`  - ${item._id}CT: ${item.count} products`)
  })

  if (withMaterialSpecs < totalProducts * 0.95) {
    throw new Error(`Migration incomplete: Only ${withMaterialSpecs}/${totalProducts} products have materialSpecs`)
  }

  console.log('✅ Migration validation passed!')
}

/**
 * Create indexes for material specs queries (CLAUDE_RULES <300ms performance)
 */
async function createMaterialSpecsIndexes(collection) {
  console.log('\n📊 Creating performance indexes...')
  
  const indexes = [
    // Material filtering indexes
    { 'materialSpecs.primaryMetal.type': 1 },
    { 'materialSpecs.primaryStone.type': 1 },
    { 'materialSpecs.primaryStone.carat': 1 },
    
    // Compound indexes for filtered searches
    { 'category': 1, 'materialSpecs.primaryMetal.type': 1 },
    { 'materialSpecs.primaryStone.type': 1, 'materialSpecs.primaryStone.carat': 1 },
    
    // Catalog performance index
    { 'category': 1, 'metadata.featured': 1, 'materialSpecs.primaryStone.carat': 1 }
  ]

  for (const index of indexes) {
    try {
      await collection.createIndex(index)
      console.log(`✅ Created index:`, Object.keys(index).join(', '))
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Index already exists:`, Object.keys(index).join(', '))
      } else {
        console.error(`❌ Failed to create index:`, error.message)
      }
    }
  }

  console.log('📊 Index creation completed!')
}

// Run migration
if (require.main === module) {
  migrateToMaterialSpecs()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Migration failed:', error.message)
      process.exit(1)
    })
}

module.exports = { migrateToMaterialSpecs }