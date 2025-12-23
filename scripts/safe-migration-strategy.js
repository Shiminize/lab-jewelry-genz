#!/usr/bin/env node

/**
 * Safe Migration Strategy for GenZ Jewelry Platform
 * Material Specs Conversion: Legacy Product Schema → ProductListDTO
 * 
 * ZERO-DOWNTIME MIGRATION with comprehensive rollback capabilities
 * CLAUDE_RULES Compliance: <300ms query performance maintained
 * 
 * Migration Phases:
 * 1. Backup & Preparation
 * 2. Shadow Collection Creation
 * 3. Data Transformation & Validation
 * 4. Index Optimization
 * 5. Blue-Green Deployment Switch
 * 6. Cleanup & Monitoring
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
config();

// Migration state tracking
const migrationState = {
  phase: 'none',
  startTime: null,
  backupPath: null,
  shadowCollection: null,
  originalCollection: 'products',
  targetCollection: 'products_v2',
  rollbackAvailable: false,
  statistics: {
    totalProducts: 0,
    migratedProducts: 0,
    failedProducts: 0,
    validationErrors: [],
    performanceMetrics: {}
  }
};

/**
 * Product schemas
 */
const ProductSchema = new mongoose.Schema({}, { strict: false });

/**
 * Utility: Create timestamped backup
 */
async function createBackup() {
  console.log('📦 Phase 1: Creating Database Backup');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupPath = path.join(backupDir, `products-backup-${timestamp}.json`);
  
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const Product = mongoose.model('Product', ProductSchema, migrationState.originalCollection);
    const startTime = Date.now();
    
    // Export all products
    const products = await Product.find({}).lean();
    const backupTime = Date.now() - startTime;
    
    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      version: 'pre-migration-backup',
      totalProducts: products.length,
      products: products
    }, null, 2));
    
    migrationState.backupPath = backupPath;
    migrationState.rollbackAvailable = true;
    
    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`📊 Backed up ${products.length} products in ${backupTime}ms`);
    console.log(`💾 Backup size: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Backup creation failed:', error.message);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

/**
 * Utility: Advanced ProductListDTO mapper with full validation
 */
function transformToProductListDTO(product) {
  try {
    // Extract primary image with fallback chain
    const primaryImage = product.media?.primary || 
                        (product.images && Array.isArray(product.images) 
                          ? (product.images.find(img => img.isPrimary) || product.images[0])?.url 
                          : product.images?.primary) || 
                        '/images/placeholder-product.jpg';
    
    // Material specifications extraction
    const materialSpecs = {
      metal: {
        type: mapMetalType(product.customization?.materials?.[0]?.type || 'silver'),
        purity: product.customization?.materials?.[0]?.purity || (
          product.customization?.materials?.[0]?.type === 'gold' ? '14K' : '925'
        ),
        finish: product.customization?.materials?.[0]?.finish || 'polished',
        sustainability: {
          recycled: product.customization?.materials?.[0]?.sustainability?.recycled || false,
          ethicallySourced: product.customization?.materials?.[0]?.sustainability?.ethicallySourced || false
        }
      }
    };
    
    // Stone specifications (if present)
    if (product.customization?.gemstones?.length > 0) {
      const primaryStone = product.customization.gemstones[0];
      materialSpecs.stone = {
        type: mapStoneType(primaryStone.type, primaryStone.isLabGrown),
        carat: validateCarat(primaryStone.carat),
        cut: primaryStone.cut || 'round',
        clarity: primaryStone.clarity || 'VS',
        color: primaryStone.color || 'colorless',
        certification: primaryStone.certification?.agency || 'none',
        sustainability: {
          labGrown: primaryStone.isLabGrown || false,
          conflictFree: primaryStone.sustainability?.conflictFree || true,
          traceable: primaryStone.sustainability?.traceable || false
        }
      };
    }
    
    // Core DTO structure
    const productListDTO = {
      _id: product._id?.toString() || product.id,
      name: product.name || '',
      description: product.description || '',
      category: normalizeCategory(product.category),
      subcategory: normalizeSubcategory(product.subcategory),
      slug: product.seo?.slug || generateSlug(product.name),
      primaryImage,
      pricing: {
        basePrice: Number(product.pricing?.basePrice || product.basePrice || 0),
        currency: product.pricing?.currency || product.currency || 'USD'
      },
      inventory: {
        available: product.inventory?.available !== false && (product.status === 'active'),
        quantity: Number(product.inventory?.quantity || product.inventory?.available || 100)
      },
      metadata: {
        featured: Boolean(product.metadata?.featured || product.analytics?.trending),
        bestseller: Boolean(product.metadata?.bestseller || product.analytics?.purchases > 10),
        newArrival: Boolean(product.metadata?.newArrival || isNewProduct(product.createdAt)),
        tags: generateTags(product, materialSpecs)
      },
      materialSpecs,
      creator: product.creator?.profile ? {
        handle: product.creator.profile.handle,
        name: product.creator.profile.name
      } : undefined
    };
    
    // Validation
    validateProductListDTO(productListDTO);
    
    return productListDTO;
    
  } catch (error) {
    throw new Error(`Product transformation failed for ${product._id}: ${error.message}`);
  }
}

/**
 * Material type mapper with standardization
 */
function mapMetalType(metalType) {
  if (!metalType) return 'silver';
  
  const metalMap = {
    'gold': '14k-gold',
    'white-gold': '14k-white-gold', 
    'rose-gold': '14k-rose-gold',
    'yellow-gold': '14k-gold',
    'platinum': 'platinum',
    'silver': 'silver',
    'sterling-silver': 'silver',
    'titanium': 'titanium'
  };
  
  return metalMap[metalType.toLowerCase()] || 'silver';
}

/**
 * Stone type mapper with lab-grown prefix
 */
function mapStoneType(stoneType, isLabGrown) {
  if (!stoneType) return undefined;
  
  // Handle 'other' type (usually moissanite)
  if (stoneType === 'other') {
    return isLabGrown ? 'moissanite' : 'moissanite';
  }
  
  const prefix = isLabGrown ? 'lab-' : '';
  return prefix + stoneType.toLowerCase();
}

/**
 * Carat value validation with fallback
 */
function validateCarat(carat) {
  const numericCarat = Number(carat);
  
  // Validate range
  if (isNaN(numericCarat) || numericCarat <= 0 || numericCarat > 20) {
    return 1.0; // Safe default
  }
  
  return numericCarat;
}

/**
 * Category normalization
 */
function normalizeCategory(category) {
  const categoryMap = {
    'ring': 'rings',
    'rings': 'rings',
    'necklace': 'necklaces',
    'necklaces': 'necklaces',
    'earring': 'earrings',
    'earrings': 'earrings',
    'bracelet': 'bracelets',
    'bracelets': 'bracelets'
  };
  
  return categoryMap[category?.toLowerCase()] || 'jewelry';
}

/**
 * Subcategory normalization
 */
function normalizeSubcategory(subcategory) {
  return subcategory || 'accessories';
}

/**
 * URL slug generation
 */
function generateSlug(name) {
  if (!name) return 'product';
  
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Check if product is new (within 30 days)
 */
function isNewProduct(createdAt) {
  if (!createdAt) return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return new Date(createdAt) > thirtyDaysAgo;
}

/**
 * Generate dynamic tags from product and material specs
 */
function generateTags(product, materialSpecs) {
  const tags = [];
  
  // Material-based tags
  if (materialSpecs.metal?.type) {
    tags.push(materialSpecs.metal.type);
  }
  
  if (materialSpecs.stone?.type) {
    tags.push(materialSpecs.stone.type);
    if (materialSpecs.stone.carat >= 1.0) {
      tags.push('premium-stone');
    }
  }
  
  // Category tags
  if (product.category) {
    tags.push(product.category);
  }
  
  // Existing tags
  if (product.tags && Array.isArray(product.tags)) {
    tags.push(...product.tags);
  }
  
  // Remove duplicates and limit to 5 tags
  return [...new Set(tags)].slice(0, 5);
}

/**
 * ProductListDTO validation
 */
function validateProductListDTO(dto) {
  const requiredFields = ['_id', 'name', 'description', 'category', 'subcategory', 'slug', 'primaryImage', 'pricing', 'inventory', 'metadata', 'materialSpecs'];
  
  for (const field of requiredFields) {
    if (!(field in dto)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate pricing
  if (typeof dto.pricing.basePrice !== 'number' || dto.pricing.basePrice < 0) {
    throw new Error('Invalid basePrice');
  }
  
  // Validate material specs
  if (!dto.materialSpecs.metal?.type) {
    throw new Error('Missing metal type in materialSpecs');
  }
  
  return true;
}

/**
 * Create shadow collection and transform data
 */
async function createShadowCollectionAndMigrate() {
  console.log('🔄 Phase 2: Creating Shadow Collection & Data Transformation');
  
  try {
    const sourceProduct = mongoose.model('SourceProduct', ProductSchema, migrationState.originalCollection);
    const targetProduct = mongoose.model('TargetProduct', ProductSchema, migrationState.targetCollection);
    
    // Drop target collection if exists (fresh start)
    try {
      await mongoose.connection.db.dropCollection(migrationState.targetCollection);
      console.log(`🗑️ Dropped existing ${migrationState.targetCollection} collection`);
    } catch (dropError) {
      console.log(`ℹ️ Collection ${migrationState.targetCollection} doesn't exist, proceeding`);
    }
    
    // Get all source products
    const sourceProducts = await sourceProduct.find({}).lean();
    migrationState.statistics.totalProducts = sourceProducts.length;
    
    console.log(`📊 Processing ${sourceProducts.length} products`);
    
    const batchSize = 10;
    const batches = [];
    
    // Process in batches for performance
    for (let i = 0; i < sourceProducts.length; i += batchSize) {
      const batch = sourceProducts.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    console.log(`🔄 Processing ${batches.length} batches of ${batchSize} products each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const transformedBatch = [];
      
      console.log(`⚡ Processing batch ${batchIndex + 1}/${batches.length}`);
      
      for (const product of batch) {
        try {
          const transformedProduct = transformToProductListDTO(product);
          transformedBatch.push(transformedProduct);
          migrationState.statistics.migratedProducts++;
        } catch (error) {
          console.error(`❌ Failed to transform product ${product._id}:`, error.message);
          migrationState.statistics.failedProducts++;
          migrationState.statistics.validationErrors.push({
            productId: product._id,
            error: error.message
          });
        }
      }
      
      // Insert batch to shadow collection
      if (transformedBatch.length > 0) {
        await targetProduct.insertMany(transformedBatch, { ordered: false });
      }
      
      // Progress indicator
      const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
      console.log(`   📈 Progress: ${progress}% (${migrationState.statistics.migratedProducts}/${migrationState.statistics.totalProducts} products)`);
    }
    
    console.log(`✅ Shadow collection created with ${migrationState.statistics.migratedProducts} products`);
    console.log(`⚠️ Failed to migrate ${migrationState.statistics.failedProducts} products`);
    
    return migrationState.statistics.migratedProducts;
    
  } catch (error) {
    console.error('❌ Shadow collection creation failed:', error.message);
    throw error;
  }
}

/**
 * Create optimized indexes for ProductListDTO structure
 */
async function createOptimizedIndexes() {
  console.log('🔍 Phase 3: Creating Optimized Indexes');
  
  try {
    const targetProduct = mongoose.model('TargetProduct', ProductSchema, migrationState.targetCollection);
    const collection = targetProduct.collection;
    
    const indexes = [
      // Core queries (CLAUDE_RULES: <300ms)
      { 'category': 1, 'metadata.featured': -1 },
      { 'pricing.basePrice': 1 },
      { 'inventory.available': 1 },
      { 'slug': 1 },
      
      // Material specs filtering (new indexes)
      { 'materialSpecs.metal.type': 1 },
      { 'materialSpecs.stone.type': 1 },
      { 'materialSpecs.stone.carat': 1 },
      
      // Combined indexes for common queries
      { 'category': 1, 'materialSpecs.metal.type': 1, 'pricing.basePrice': 1 },
      { 'metadata.featured': 1, 'inventory.available': 1 },
      { 'category': 1, 'subcategory': 1, 'inventory.available': 1 },
      
      // Text search
      { 'name': 'text', 'description': 'text', 'metadata.tags': 'text' },
      
      // Performance monitoring
      { 'metadata.bestseller': 1 },
      { '_id': 1 } // Ensure _id index exists
    ];
    
    console.log(`📋 Creating ${indexes.length} performance-optimized indexes`);
    
    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      try {
        const startTime = Date.now();
        await collection.createIndex(index);
        const createTime = Date.now() - startTime;
        console.log(`   ✅ Index ${i + 1}/${indexes.length}: ${JSON.stringify(index)} (${createTime}ms)`);
      } catch (indexError) {
        if (indexError.code === 85) { // Index already exists
          console.log(`   ℹ️ Index ${i + 1}/${indexes.length}: ${JSON.stringify(index)} (already exists)`);
        } else {
          console.error(`   ❌ Index ${i + 1}/${indexes.length}: ${JSON.stringify(index)} failed:`, indexError.message);
        }
      }
    }
    
    // Test index performance
    await testIndexPerformance(targetProduct);
    
    console.log('✅ Index creation completed');
    
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
    throw error;
  }
}

/**
 * Test index performance against CLAUDE_RULES targets
 */
async function testIndexPerformance(Product) {
  console.log('⚡ Testing Index Performance (CLAUDE_RULES: <300ms)');
  
  const performanceTests = [
    {
      name: 'Category + Featured Query',
      query: { category: 'rings', 'metadata.featured': true },
      target: 50
    },
    {
      name: 'Material Filter Query',
      query: { 'materialSpecs.metal.type': '14k-gold' },
      target: 50
    },
    {
      name: 'Price Range Query',
      query: { 'pricing.basePrice': { $gte: 100, $lte: 1000 } },
      target: 50
    },
    {
      name: 'Combined Filter Query',
      query: { 
        'category': 'rings', 
        'materialSpecs.metal.type': '14k-gold',
        'inventory.available': true 
      },
      target: 100
    },
    {
      name: 'Text Search Query',
      query: { $text: { $search: 'engagement ring' } },
      target: 150
    }
  ];
  
  for (const test of performanceTests) {
    const startTime = Date.now();
    const results = await Product.find(test.query).limit(24).lean();
    const queryTime = Date.now() - startTime;
    
    const status = queryTime <= test.target ? '✅' : '⚠️';
    console.log(`   ${status} ${test.name}: ${queryTime}ms (target: ${test.target}ms, ${results.length} results)`);
    
    migrationState.statistics.performanceMetrics[test.name] = {
      queryTime,
      target: test.target,
      resultCount: results.length,
      passed: queryTime <= test.target
    };
  }
}

/**
 * Validate migrated data integrity
 */
async function validateDataIntegrity() {
  console.log('🔍 Phase 4: Data Integrity Validation');
  
  try {
    const sourceProduct = mongoose.model('SourceProduct', ProductSchema, migrationState.originalCollection);
    const targetProduct = mongoose.model('TargetProduct', ProductSchema, migrationState.targetCollection);
    
    // Count validation
    const sourceCount = await sourceProduct.countDocuments();
    const targetCount = await targetProduct.countDocuments();
    
    console.log(`📊 Source products: ${sourceCount}`);
    console.log(`📊 Target products: ${targetCount}`);
    console.log(`📊 Migration success rate: ${(targetCount / sourceCount * 100).toFixed(1)}%`);
    
    // Sample data validation
    console.log('🔍 Validating sample product transformations...');
    
    const sampleSource = await sourceProduct.findOne({}).lean();
    const sampleTarget = await targetProduct.findOne({ _id: sampleSource._id }).lean();
    
    if (!sampleTarget) {
      throw new Error('Sample product not found in target collection');
    }
    
    // Validate required fields
    const requiredFields = ['_id', 'name', 'description', 'category', 'subcategory', 'slug', 'primaryImage', 'pricing', 'inventory', 'metadata', 'materialSpecs'];
    for (const field of requiredFields) {
      if (!(field in sampleTarget)) {
        throw new Error(`Missing required field in target: ${field}`);
      }
    }
    
    // Validate material specs structure
    if (!sampleTarget.materialSpecs?.metal?.type) {
      throw new Error('Invalid materialSpecs structure in target');
    }
    
    console.log('✅ Sample product validation passed');
    console.log(`💎 Sample material specs: ${JSON.stringify(sampleTarget.materialSpecs, null, 2)}`);
    
    // Performance validation on target collection
    const catalogQueryTime = await measureCatalogQueryPerformance(targetProduct);
    console.log(`⚡ Catalog query performance: ${catalogQueryTime}ms (CLAUDE_RULES: <300ms)`);
    
    if (catalogQueryTime > 300) {
      console.log('⚠️ Warning: Catalog query exceeds CLAUDE_RULES performance target');
    }
    
    migrationState.statistics.validationPassed = targetCount >= sourceCount * 0.95; // 95% success threshold
    
    return migrationState.statistics.validationPassed;
    
  } catch (error) {
    console.error('❌ Data integrity validation failed:', error.message);
    throw error;
  }
}

/**
 * Measure catalog query performance
 */
async function measureCatalogQueryPerformance(Product) {
  const startTime = Date.now();
  
  // Simulate typical catalog query
  await Product.find({ 
    'inventory.available': true 
  })
  .sort({ 'metadata.featured': -1, 'pricing.basePrice': 1 })
  .limit(24)
  .lean();
  
  return Date.now() - startTime;
}

/**
 * Blue-Green deployment switch
 */
async function performBlueGreenSwitch() {
  console.log('🔄 Phase 5: Blue-Green Deployment Switch');
  
  try {
    const backupCollectionName = `${migrationState.originalCollection}_backup_${Date.now()}`;
    
    console.log(`📦 Creating backup of original collection as: ${backupCollectionName}`);
    
    // Rename original collection to backup
    await mongoose.connection.db.collection(migrationState.originalCollection)
      .rename(backupCollectionName);
    
    console.log(`🔄 Renaming shadow collection to primary: ${migrationState.targetCollection} → ${migrationState.originalCollection}`);
    
    // Rename shadow collection to primary
    await mongoose.connection.db.collection(migrationState.targetCollection)
      .rename(migrationState.originalCollection);
    
    console.log('✅ Blue-Green switch completed successfully');
    console.log(`📦 Original data preserved in: ${backupCollectionName}`);
    console.log(`🎯 New ProductListDTO collection is now live at: ${migrationState.originalCollection}`);
    
    migrationState.shadowCollection = backupCollectionName;
    
    return true;
    
  } catch (error) {
    console.error('❌ Blue-Green switch failed:', error.message);
    throw error;
  }
}

/**
 * Rollback functionality
 */
async function rollback() {
  console.log('🔙 EMERGENCY ROLLBACK: Restoring Original Data');
  
  try {
    if (!migrationState.rollbackAvailable || !migrationState.shadowCollection) {
      throw new Error('Rollback not available - no backup collection found');
    }
    
    console.log('⚠️ WARNING: This will restore the original data structure');
    console.log(`📦 Restoring from backup: ${migrationState.shadowCollection}`);
    
    // Drop current collection
    await mongoose.connection.db.dropCollection(migrationState.originalCollection);
    
    // Restore from backup
    await mongoose.connection.db.collection(migrationState.shadowCollection)
      .rename(migrationState.originalCollection);
    
    console.log('✅ Rollback completed successfully');
    console.log('🔄 Original product structure restored');
    
    return true;
    
  } catch (error) {
    console.error('❌ CRITICAL: Rollback failed:', error.message);
    throw error;
  }
}

/**
 * Post-migration cleanup and monitoring setup
 */
async function postMigrationCleanup() {
  console.log('🧹 Phase 6: Post-Migration Cleanup & Monitoring Setup');
  
  try {
    // Verify final collection state
    const Product = mongoose.model('Product', ProductSchema, migrationState.originalCollection);
    const finalCount = await Product.countDocuments();
    
    console.log(`📊 Final collection state: ${finalCount} products`);
    
    // Performance verification
    const finalPerformanceTest = await measureCatalogQueryPerformance(Product);
    console.log(`⚡ Final performance test: ${finalPerformanceTest}ms`);
    
    // Create monitoring queries for future performance tracking
    const monitoringQueries = [
      "// Monitor catalog page performance\nProduct.find({ 'inventory.available': true }).sort({ 'metadata.featured': -1 }).limit(24)",
      "// Monitor material filtering performance\nProduct.find({ 'materialSpecs.metal.type': '14k-gold' }).limit(24)",
      "// Monitor search performance\nProduct.find({ $text: { $search: 'ring' } }).limit(24)"
    ];
    
    fs.writeFileSync('./monitoring-queries.js', monitoringQueries.join('\n\n'));
    console.log('📝 Monitoring queries saved to: monitoring-queries.js');
    
    // Generate migration report
    const migrationReport = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - migrationState.startTime,
      success: true,
      statistics: migrationState.statistics,
      backupLocation: migrationState.backupPath,
      rollbackCollection: migrationState.shadowCollection,
      performanceCompliance: finalPerformanceTest <= 300,
      nextSteps: [
        'Monitor application logs for any issues',
        'Run performance tests in production',
        'Clean up backup collections after 30 days',
        'Update API documentation to reflect new schema'
      ]
    };
    
    fs.writeFileSync('./migration-report.json', JSON.stringify(migrationReport, null, 2));
    console.log('📄 Migration report saved to: migration-report.json');
    
    console.log('✅ Migration completed successfully!');
    console.log(`⏱️ Total migration time: ${(migrationReport.duration / 1000 / 60).toFixed(2)} minutes`);
    
    return migrationReport;
    
  } catch (error) {
    console.error('❌ Post-migration cleanup failed:', error.message);
    throw error;
  }
}

/**
 * Main migration orchestrator
 */
async function runSafeMigration() {
  migrationState.startTime = Date.now();
  migrationState.phase = 'starting';
  
  console.log('🚀 GenZ Jewelry Platform - Safe Material Specs Migration');
  console.log('📅 ' + new Date().toISOString());
  console.log('🎯 Target: Legacy Product Schema → ProductListDTO with MaterialSpecs');
  console.log('⚡ Performance Target: <300ms catalog queries (CLAUDE_RULES)');
  console.log('🔄 Strategy: Zero-downtime Blue-Green deployment');
  console.log('='.repeat(80));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genz-jewelry');
    console.log('✅ Connected to MongoDB');
    
    // Phase 1: Backup
    migrationState.phase = 'backup';
    await createBackup();
    
    // Phase 2: Shadow Collection & Data Transformation
    migrationState.phase = 'transformation';
    await createShadowCollectionAndMigrate();
    
    // Phase 3: Index Optimization
    migrationState.phase = 'indexing';
    await createOptimizedIndexes();
    
    // Phase 4: Data Integrity Validation
    migrationState.phase = 'validation';
    const validationPassed = await validateDataIntegrity();
    
    if (!validationPassed) {
      throw new Error('Data integrity validation failed - aborting migration');
    }
    
    // Phase 5: Blue-Green Switch
    migrationState.phase = 'deployment';
    await performBlueGreenSwitch();
    
    // Phase 6: Cleanup & Monitoring
    migrationState.phase = 'cleanup';
    const report = await postMigrationCleanup();
    
    migrationState.phase = 'completed';
    
    return report;
    
  } catch (error) {
    console.error(`\n💥 MIGRATION FAILED in phase: ${migrationState.phase}`);
    console.error('Error:', error.message);
    
    // Attempt rollback if possible
    if (migrationState.rollbackAvailable && migrationState.phase !== 'backup') {
      console.log('\n🔙 Attempting automatic rollback...');
      try {
        await rollback();
        console.log('✅ Rollback successful - original data restored');
      } catch (rollbackError) {
        console.error('💥 CRITICAL: Rollback also failed!');
        console.error('Manual recovery required using backup:', migrationState.backupPath);
      }
    }
    
    throw error;
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  runSafeMigration()
    .then(report => {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log(`📊 Migrated ${report.statistics.migratedProducts} products`);
      console.log(`⚡ Performance compliance: ${report.performanceCompliance ? '✅' : '❌'}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 MIGRATION FAILED!');
      console.error('Check logs and backup files for recovery options');
      process.exit(1);
    });
}

module.exports = {
  runSafeMigration,
  rollback,
  migrationState
};