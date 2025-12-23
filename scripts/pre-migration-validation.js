/**
 * Pre-Migration Validation Script
 * Validates current database state before material specs migration
 * CLAUDE_RULES compliance: Data integrity validation before Phase 1 implementation
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch'

async function validateCurrentData() {
  console.log('🔍 Starting pre-migration validation...')
  
  let client
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DATABASE_NAME)
    const productsCollection = db.collection('products')

    // Basic counts
    const totalProducts = await productsCollection.countDocuments()
    console.log(`📊 Total products in database: ${totalProducts}`)

    if (totalProducts === 0) {
      console.log('❌ No products found in database. Run seed-database.js first.')
      return
    }

    // Analyze current data structure
    const sampleProduct = await productsCollection.findOne()
    console.log('\n🧬 Sample product structure:')
    console.log(`- Has customization: ${!!sampleProduct.customization}`)
    console.log(`- Has materials: ${!!sampleProduct.customization?.materials}`)
    console.log(`- Has gemstones: ${!!sampleProduct.customization?.gemstones}`)
    console.log(`- Has materialSpecs: ${!!sampleProduct.materialSpecs}`)

    // Validate gemstone data integrity
    const gemstonesAnalysis = await analyzePrimaryGemstones(productsCollection)
    console.log('\n💎 Gemstone Data Analysis:')
    console.log(`- Products with gemstones: ${gemstonesAnalysis.withGemstones}/${totalProducts}`)
    console.log(`- Products with carat data: ${gemstonesAnalysis.withCarats}/${gemstonesAnalysis.withGemstones}`)
    console.log(`- Carat value distribution:`, gemstonesAnalysis.caratDistribution)
    console.log(`- Stone types found:`, gemstonesAnalysis.stoneTypes)

    // Validate material data
    const materialsAnalysis = await analyzePrimaryMaterials(productsCollection)
    console.log('\n🔧 Materials Data Analysis:')
    console.log(`- Products with materials: ${materialsAnalysis.withMaterials}/${totalProducts}`)
    console.log(`- Material types found:`, materialsAnalysis.materialTypes)

    // Check for potential mapping issues
    const mappingIssues = await identifyMappingIssues(productsCollection)
    console.log('\n⚠️  Potential Mapping Issues:')
    console.log(`- Missing carat values: ${mappingIssues.missingCarats}`)
    console.log(`- Invalid stone types: ${mappingIssues.invalidStones}`)
    console.log(`- Missing material types: ${mappingIssues.missingMaterials}`)

    // Performance baseline
    console.log('\n⚡ Current Query Performance:')
    await measureQueryPerformance(productsCollection)

    // Migration readiness assessment
    const readiness = assessMigrationReadiness(gemstonesAnalysis, materialsAnalysis, mappingIssues, totalProducts)
    console.log('\n✅ Migration Readiness Assessment:')
    console.log(`- Data Completeness: ${readiness.dataCompleteness}%`)
    console.log(`- Ready for migration: ${readiness.isReady ? 'YES' : 'NO'}`)
    
    if (!readiness.isReady) {
      console.log('❌ Issues to resolve before migration:')
      readiness.issues.forEach(issue => console.log(`  - ${issue}`))
    } else {
      console.log('🎉 Database is ready for material specs migration!')
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

async function analyzePrimaryGemstones(collection) {
  const pipeline = [
    { $match: { 'customization.gemstones': { $exists: true, $ne: [] } } },
    { $project: { 
      primaryGemstone: { $arrayElemAt: ['$customization.gemstones', 0] },
      _id: 1
    }},
    { $group: {
      _id: null,
      withGemstones: { $sum: 1 },
      withCarats: { $sum: { $cond: [{ $ifNull: ['$primaryGemstone.carat', false] }, 1, 0] }},
      caratValues: { $push: '$primaryGemstone.carat' },
      stoneTypes: { $addToSet: '$primaryGemstone.type' }
    }}
  ]

  const result = await collection.aggregate(pipeline).toArray()
  if (result.length === 0) return { withGemstones: 0, withCarats: 0, caratDistribution: {}, stoneTypes: [] }

  const data = result[0]
  
  // Analyze carat distribution
  const caratDistribution = {}
  data.caratValues.filter(c => c != null).forEach(carat => {
    caratDistribution[carat] = (caratDistribution[carat] || 0) + 1
  })

  return {
    withGemstones: data.withGemstones,
    withCarats: data.withCarats,
    caratDistribution,
    stoneTypes: data.stoneTypes
  }
}

async function analyzePrimaryMaterials(collection) {
  const pipeline = [
    { $match: { 'customization.materials': { $exists: true, $ne: [] } } },
    { $project: { 
      primaryMaterial: { $arrayElemAt: ['$customization.materials', 0] },
      _id: 1
    }},
    { $group: {
      _id: null,
      withMaterials: { $sum: 1 },
      materialTypes: { $addToSet: '$primaryMaterial.type' }
    }}
  ]

  const result = await collection.aggregate(pipeline).toArray()
  if (result.length === 0) return { withMaterials: 0, materialTypes: [] }

  return result[0]
}

async function identifyMappingIssues(collection) {
  const totalProducts = await collection.countDocuments()
  
  // Check for missing carat values in products with gemstones
  const missingCarats = await collection.countDocuments({
    'customization.gemstones': { $exists: true, $ne: [] },
    'customization.gemstones.0.carat': { $exists: false }
  })

  // Check for invalid stone types
  const validStoneTypes = ['diamond', 'other', 'emerald', 'ruby', 'sapphire']
  const invalidStones = await collection.countDocuments({
    'customization.gemstones.0.type': { $nin: validStoneTypes }
  })

  // Check for missing material types
  const missingMaterials = await collection.countDocuments({
    $or: [
      { 'customization.materials': { $exists: false } },
      { 'customization.materials': { $size: 0 } }
    ]
  })

  return {
    missingCarats,
    invalidStones,
    missingMaterials
  }
}

async function measureQueryPerformance(collection) {
  const queries = [
    { name: 'Find all products', query: {} },
    { name: 'Find by category', query: { category: 'rings' } },
    { name: 'Find with gemstones', query: { 'customization.gemstones': { $exists: true } } },
    { name: 'Find by carat range', query: { 'customization.gemstones.carat': { $gte: 0.5, $lte: 1.0 } } }
  ]

  for (const { name, query } of queries) {
    const start = Date.now()
    const count = await collection.countDocuments(query)
    const duration = Date.now() - start
    console.log(`  - ${name}: ${duration}ms (${count} results)`)
  }
}

function assessMigrationReadiness(gemstones, materials, issues, totalProducts) {
  const problems = []
  
  // Check data completeness
  const gemstonesCompleteness = gemstones.withGemstones > 0 ? (gemstones.withCarats / gemstones.withGemstones) * 100 : 100
  const materialsCompleteness = materials.withMaterials > 0 ? (materials.withMaterials / totalProducts) * 100 : 0
  
  if (gemstonesCompleteness < 95) {
    problems.push(`Gemstone carat data incomplete: ${gemstonesCompleteness.toFixed(1)}%`)
  }
  
  if (materialsCompleteness < 95) {
    problems.push(`Material data incomplete: ${materialsCompleteness.toFixed(1)}%`)
  }
  
  if (issues.missingCarats > totalProducts * 0.05) {
    problems.push(`Too many products missing carat values: ${issues.missingCarats}`)
  }
  
  if (issues.invalidStones > 0) {
    problems.push(`Invalid stone types found: ${issues.invalidStones}`)
  }

  const dataCompleteness = Math.min(gemstonesCompleteness, materialsCompleteness)
  
  return {
    isReady: problems.length === 0,
    dataCompleteness,
    issues: problems
  }
}

// Run validation
if (require.main === module) {
  validateCurrentData()
    .then(() => {
      console.log('\n✅ Pre-migration validation completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    })
}

module.exports = { validateCurrentData }