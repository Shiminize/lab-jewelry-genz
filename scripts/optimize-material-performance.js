#!/usr/bin/env node

/**
 * Material Performance Optimization Script
 * Implements pre-computed materialSpecs and creates optimized indexes
 * Targets <300ms API response and <50ms material extraction (CLAUDE_RULES)
 */

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')
const { performance } = require('perf_hooks')

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genzjewelry'

// Material display name mappings
const METAL_DISPLAY_NAMES = {
  'gold': '14K Gold',
  '14k-gold': '14K Gold',
  'gold-14k-yellow': '14K Yellow Gold',
  'gold-14k-white': '14K White Gold',
  'gold-14k-rose': '14K Rose Gold',
  '18k-gold': '18K Gold',
  'gold-18k-yellow': '18K Yellow Gold',
  'gold-18k-white': '18K White Gold',
  'gold-18k-rose': '18K Rose Gold',
  'silver': 'Sterling Silver',
  '925-silver': '925 Sterling Silver',
  'platinum': 'Platinum',
  'platinum-950': '950 Platinum',
  'titanium': 'Titanium',
  'steel': 'Stainless Steel',
  'brass': 'Brass',
  'copper': 'Copper'
}

const STONE_DISPLAY_NAMES = {
  'diamond': 'Natural Diamond',
  'lab-diamond': 'Lab Diamond',
  'lab-grown-diamond': 'Lab Diamond',
  'moissanite': 'Moissanite',
  'silicon-carbide': 'Moissanite',
  'ruby': 'Natural Ruby',
  'lab-ruby': 'Lab Ruby',
  'lab-grown-ruby': 'Lab Ruby',
  'sapphire': 'Natural Sapphire',
  'lab-sapphire': 'Lab Sapphire',
  'lab-grown-sapphire': 'Lab Sapphire',
  'emerald': 'Natural Emerald',
  'lab-emerald': 'Lab Emerald',
  'lab-grown-emerald': 'Lab Emerald',
  'pearl': 'Pearl',
  'topaz': 'Topaz',
  'amethyst': 'Amethyst',
  'opal': 'Opal'
}

// Color mappings for UI
const METAL_COLORS = {
  'gold': '#FFD700',
  '14k-gold': '#FFD700',
  '18k-gold': '#FFD700',
  'silver': '#C0C0C0',
  'platinum': '#E5E4E2',
  'titanium': '#878681',
  'rose-gold': '#B76E79'
}

const STONE_COLORS = {
  'diamond': '#E6E6FA',
  'lab-diamond': '#E6E6FA',
  'moissanite': '#F0F8FF',
  'ruby': '#DC143C',
  'lab-ruby': '#DC143C',
  'sapphire': '#0F52BA',
  'lab-sapphire': '#0F52BA',
  'emerald': '#50C878',
  'lab-emerald': '#50C878'
}

/**
 * Extract material tags for fast filtering
 */
function extractMaterialTags(product) {
  const tags = new Set()
  
  // Add metal tags
  if (product.materials?.length > 0) {
    product.materials.forEach(material => {
      // Add base material
      tags.add(material)
      
      // Add category tags
      if (material.includes('gold')) {
        tags.add('gold')
        if (material.includes('14k')) tags.add('14k-gold')
        if (material.includes('18k')) tags.add('18k-gold')
        if (material.includes('rose')) tags.add('rose-gold')
        if (material.includes('white')) tags.add('white-gold')
        if (material.includes('yellow')) tags.add('yellow-gold')
      }
      if (material.includes('silver')) {
        tags.add('silver')
        tags.add('sterling-silver')
      }
      if (material.includes('platinum')) {
        tags.add('platinum')
        tags.add('luxury-metal')
      }
    })
  }
  
  // Add gemstone tags
  if (product.gemstones?.length > 0) {
    product.gemstones.forEach(gemstone => {
      const type = gemstone.type || gemstone
      tags.add(type)
      
      // Add category tags
      if (type.includes('lab')) {
        tags.add('lab-grown')
        tags.add('sustainable')
      }
      if (type.includes('diamond')) {
        tags.add('diamond')
      }
      if (type.includes('moissanite')) {
        tags.add('moissanite')
        tags.add('diamond-alternative')
      }
      
      // Add carat range tags
      if (gemstone.carat) {
        if (gemstone.carat < 0.5) tags.add('accent-stones')
        else if (gemstone.carat < 1) tags.add('under-1ct')
        else if (gemstone.carat < 2) tags.add('1-2ct')
        else tags.add('over-2ct')
      }
    })
  }
  
  // Add sustainability tags
  if (tags.has('lab-grown') || tags.has('recycled')) {
    tags.add('eco-friendly')
    tags.add('sustainable-luxury')
  }
  
  return Array.from(tags)
}

/**
 * Generate pre-computed material specifications
 */
function generateMaterialSpecs(product) {
  const primaryMetal = product.materials?.[0] || 'silver'
  const primaryStone = product.gemstones?.[0]
  
  return {
    // Primary materials
    primaryMetal,
    primaryStone: primaryStone?.type || primaryStone || null,
    
    // Display names for UI
    metalDisplay: METAL_DISPLAY_NAMES[primaryMetal] || primaryMetal,
    stoneDisplay: primaryStone ? (STONE_DISPLAY_NAMES[primaryStone.type || primaryStone] || primaryStone.type || primaryStone) : null,
    
    // UI colors
    metalColor: METAL_COLORS[primaryMetal] || '#808080',
    stoneColor: primaryStone ? (STONE_COLORS[primaryStone.type || primaryStone] || '#FFFFFF') : null,
    
    // Material tags for filtering
    materialTags: extractMaterialTags(product),
    
    // Quick access flags
    hasGemstones: product.gemstones?.length > 0,
    isLabGrown: product.gemstones?.some(g => (g.type || g).includes('lab')) || false,
    isCustomizable: product.customization?.materials?.length > 1 || false,
    
    // Carat information
    totalCarat: product.gemstones?.reduce((sum, g) => sum + (g.carat || 0), 0) || 0,
    
    // Computed at timestamp for cache invalidation
    computedAt: new Date()
  }
}

/**
 * Create optimized indexes for material filtering
 */
async function createOptimizedIndexes(db) {
  console.log('\n📊 Creating optimized indexes...')
  const collection = db.collection('products')
  const startTime = performance.now()
  
  const indexes = [
    // Priority 1: Material filtering indexes
    {
      name: 'idx_material_price_filter',
      keys: { 'metadata.status': 1, 'materials': 1, 'pricing.basePrice': 1 }
    },
    {
      name: 'idx_gemstone_filter',
      keys: { 'metadata.status': 1, 'gemstones.type': 1, 'gemstones.carat': 1 }
    },
    {
      name: 'idx_materialspecs_tags',
      keys: { 'metadata.status': 1, 'materialSpecs.materialTags': 1 }
    },
    
    // Priority 2: Performance indexes
    {
      name: 'idx_category_material',
      keys: { 'metadata.status': 1, 'category': 1, 'subcategory': 1, 'materials': 1 }
    },
    {
      name: 'idx_materialspecs_primary',
      keys: { 'materialSpecs.primaryMetal': 1, 'materialSpecs.primaryStone': 1 }
    },
    
    // Priority 3: Sorting optimization
    {
      name: 'idx_sort_popularity',
      keys: { 'metadata.status': 1, 'analytics.views': -1, 'createdAt': -1 }
    },
    {
      name: 'idx_sort_price',
      keys: { 'metadata.status': 1, 'pricing.basePrice': 1, 'createdAt': -1 }
    }
  ]
  
  for (const index of indexes) {
    try {
      await collection.createIndex(index.keys, { name: index.name, background: true })
      console.log(`✅ Created index: ${index.name}`)
    } catch (error) {
      if (error.code === 85) {
        console.log(`⚠️  Index ${index.name} already exists`)
      } else {
        console.error(`❌ Failed to create index ${index.name}:`, error.message)
      }
    }
  }
  
  const duration = performance.now() - startTime
  console.log(`\n⏱️  Index creation completed in ${duration.toFixed(2)}ms`)
  
  // Display index statistics
  const indexStats = await collection.indexStats()
  console.log('\n📈 Index Statistics:')
  for (const stat of indexStats) {
    console.log(`  - ${stat.name}: ${stat.accesses?.ops || 0} operations`)
  }
}

/**
 * Migrate products to include pre-computed materialSpecs
 */
async function migrateProducts(db) {
  console.log('\n🔄 Migrating products with materialSpecs...')
  const collection = db.collection('products')
  const startTime = performance.now()
  
  // Count products
  const totalProducts = await collection.countDocuments({})
  console.log(`Found ${totalProducts} products to process`)
  
  // Process in batches for performance
  const batchSize = 100
  let processedCount = 0
  let updatedCount = 0
  const bulkOps = []
  
  const cursor = collection.find({})
  
  for await (const product of cursor) {
    // Generate material specs
    const materialSpecs = generateMaterialSpecs(product)
    
    // Add to bulk operations
    bulkOps.push({
      updateOne: {
        filter: { _id: product._id },
        update: { 
          $set: { 
            materialSpecs,
            'metadata.lastOptimized': new Date()
          }
        }
      }
    })
    
    processedCount++
    
    // Execute bulk operations when batch is full
    if (bulkOps.length >= batchSize) {
      const result = await collection.bulkWrite(bulkOps, { ordered: false })
      updatedCount += result.modifiedCount
      
      console.log(`  Processed ${processedCount}/${totalProducts} products (${((processedCount/totalProducts)*100).toFixed(1)}%)`)
      
      bulkOps.length = 0 // Clear array
    }
  }
  
  // Execute remaining operations
  if (bulkOps.length > 0) {
    const result = await collection.bulkWrite(bulkOps, { ordered: false })
    updatedCount += result.modifiedCount
  }
  
  const duration = performance.now() - startTime
  console.log(`\n✅ Migration completed:`)
  console.log(`  - Processed: ${processedCount} products`)
  console.log(`  - Updated: ${updatedCount} products`)
  console.log(`  - Duration: ${(duration/1000).toFixed(2)} seconds`)
  console.log(`  - Average: ${(duration/processedCount).toFixed(2)}ms per product`)
}

/**
 * Verify performance improvements
 */
async function verifyPerformance(db) {
  console.log('\n🔍 Verifying performance improvements...')
  const collection = db.collection('products')
  
  // Test queries
  const testQueries = [
    {
      name: 'Material filter (gold + diamond)',
      query: { 
        'metadata.status': 'active',
        'materials': '14k-gold',
        'gemstones.type': 'lab-diamond'
      }
    },
    {
      name: 'MaterialSpecs tag filter',
      query: {
        'metadata.status': 'active',
        'materialSpecs.materialTags': { $in: ['14k-gold', 'lab-diamond'] }
      }
    },
    {
      name: 'Price range with material',
      query: {
        'metadata.status': 'active',
        'materials': 'silver',
        'pricing.basePrice': { $gte: 100, $lte: 500 }
      }
    }
  ]
  
  console.log('\n📊 Query Performance:')
  for (const test of testQueries) {
    const startTime = performance.now()
    
    const result = await collection
      .find(test.query)
      .limit(20)
      .explain('executionStats')
    
    const duration = performance.now() - startTime
    const stats = result.executionStats
    
    console.log(`\n  ${test.name}:`)
    console.log(`    - Execution time: ${duration.toFixed(2)}ms`)
    console.log(`    - Documents examined: ${stats.totalDocsExamined}`)
    console.log(`    - Documents returned: ${stats.totalDocsReturned}`)
    console.log(`    - Index used: ${stats.executionStages.indexName || 'NONE'}`)
    console.log(`    - Performance: ${duration < 300 ? '✅ PASS' : '❌ FAIL'} (<300ms requirement)`)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Material Performance Optimization Script')
  console.log('==========================================')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`)
  
  let client
  
  try {
    // Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const db = mongoose.connection.db
    
    // Step 1: Create optimized indexes
    await createOptimizedIndexes(db)
    
    // Step 2: Migrate products with materialSpecs
    await migrateProducts(db)
    
    // Step 3: Verify performance
    await verifyPerformance(db)
    
    console.log('\n✨ Optimization complete!')
    console.log('\n📋 Next Steps:')
    console.log('  1. Update repository to use materialSpecs field')
    console.log('  2. Implement caching layer for catalog queries')
    console.log('  3. Run load tests to verify <300ms response times')
    console.log('  4. Monitor performance metrics in production')
    
  } catch (error) {
    console.error('\n❌ Optimization failed:', error)
    process.exit(1)
  } finally {
    // Cleanup
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      console.log('\n👋 Disconnected from MongoDB')
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { generateMaterialSpecs, extractMaterialTags }