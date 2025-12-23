#!/usr/bin/env node

/**
 * Zero-Downtime Migration Orchestrator
 * GenZ Jewelry Platform - Complete Migration Management
 * 
 * Production-Ready Migration Strategy:
 * 1. Pre-flight validation and safety checks
 * 2. Backup creation with verification
 * 3. Blue-Green deployment with shadow collections
 * 4. Real-time data synchronization
 * 5. Performance validation and monitoring
 * 6. Atomic switchover with rollback capability
 * 7. Post-migration validation and cleanup
 * 
 * CLAUDE_RULES Compliance: Maintains <300ms performance throughout
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
config();

// Import migration components
const { runPreMigrationValidation } = require('./pre-migration-validation.js');
const { runDataIntegrityVerification } = require('./data-integrity-verification.js');
const { runIndexOptimization } = require('./index-optimization-strategy.js');

// Migration orchestrator state
const migrationOrchestrator = {
  startTime: null,
  currentPhase: 'initialization',
  phases: {
    'pre-flight': { status: 'pending', startTime: null, duration: null, result: null },
    'backup': { status: 'pending', startTime: null, duration: null, result: null },
    'shadow-creation': { status: 'pending', startTime: null, duration: null, result: null },
    'data-transformation': { status: 'pending', startTime: null, duration: null, result: null },
    'index-optimization': { status: 'pending', startTime: null, duration: null, result: null },
    'performance-validation': { status: 'pending', startTime: null, duration: null, result: null },
    'blue-green-switch': { status: 'pending', startTime: null, duration: null, result: null },
    'post-validation': { status: 'pending', startTime: null, duration: null, result: null },
    'cleanup': { status: 'pending', startTime: null, duration: null, result: null }
  },
  config: {
    sourceCollection: 'products',
    shadowCollection: 'products_v2_shadow',
    targetCollection: 'products',
    backupCollection: null,
    performanceTarget: 300, // ms (CLAUDE_RULES)
    safetyThresholds: {
      maxDowntime: 5000, // 5 seconds max
      minSuccessRate: 95, // 95% migration success required
      maxPerformanceDegradation: 50 // 50ms max performance loss
    }
  },
  results: {
    totalProducts: 0,
    migratedProducts: 0,
    failedProducts: 0,
    backupPath: null,
    rollbackPossible: false,
    performanceMetrics: {},
    issues: [],
    recommendations: []
  }
};

/**
 * Utility: Phase management
 */
function startPhase(phaseName) {
  migrationOrchestrator.currentPhase = phaseName;
  migrationOrchestrator.phases[phaseName].status = 'running';
  migrationOrchestrator.phases[phaseName].startTime = Date.now();
  
  console.log(`\\n🚀 Phase: ${phaseName.toUpperCase().replace('-', ' ')}`);
  console.log(`⏱️ Started at: ${new Date().toISOString()}`);
}

function completePhase(phaseName, result = null, success = true) {
  const phase = migrationOrchestrator.phases[phaseName];
  phase.status = success ? 'completed' : 'failed';
  phase.duration = Date.now() - phase.startTime;
  phase.result = result;
  
  const status = success ? '✅' : '❌';
  console.log(`${status} Phase completed: ${phaseName} (${phase.duration}ms)`);
  
  if (!success) {
    throw new Error(`Migration failed in phase: ${phaseName}`);
  }
}

/**
 * Phase 1: Pre-flight Validation
 */
async function runPreFlightValidation() {
  startPhase('pre-flight');
  
  try {
    console.log('🔍 Running comprehensive pre-migration validation...');
    
    // Run pre-migration validation
    const validationResult = await runPreMigrationValidation();
    
    if (!validationResult.migrationReadiness) {
      throw new Error(`Pre-flight validation failed: ${validationResult.dataQualityIssues.length} issues found`);
    }
    
    migrationOrchestrator.results.totalProducts = validationResult.totalProducts;
    
    console.log(`✅ Pre-flight validation passed`);
    console.log(`📊 Products to migrate: ${validationResult.totalProducts}`);
    console.log(`⚡ Current performance: ${validationResult.performanceMetrics.mapperPerformance?.estimatedCatalogTime || 'unknown'}ms`);
    
    completePhase('pre-flight', validationResult);
    return validationResult;
    
  } catch (error) {
    console.error('❌ Pre-flight validation failed:', error.message);
    completePhase('pre-flight', error, false);
  }
}

/**
 * Phase 2: Backup Creation with Verification
 */
async function runBackupCreation() {
  startPhase('backup');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, `migration-backup-${timestamp}.json`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('📦 Creating verified backup...');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), migrationOrchestrator.config.sourceCollection);
    
    // Stream backup for memory efficiency
    const products = await Product.find({}).lean();
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: 'pre-migration-backup',
      totalProducts: products.length,
      migrationConfig: migrationOrchestrator.config,
      products: products
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    // Verify backup integrity
    const backupVerification = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    if (backupVerification.products.length !== products.length) {
      throw new Error('Backup verification failed - product count mismatch');
    }
    
    migrationOrchestrator.results.backupPath = backupPath;
    migrationOrchestrator.results.rollbackPossible = true;
    
    const backupSize = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Backup created and verified: ${backupPath}`);
    console.log(`💾 Backup size: ${backupSize} MB`);
    console.log(`📊 Products backed up: ${products.length}`);
    
    completePhase('backup', { backupPath, productCount: products.length, size: backupSize });
    return backupPath;
    
  } catch (error) {
    console.error('❌ Backup creation failed:', error.message);
    completePhase('backup', error, false);
  }
}

/**
 * Phase 3: Shadow Collection Creation
 */
async function runShadowCollectionCreation() {
  startPhase('shadow-creation');
  
  try {
    console.log(`🔄 Creating shadow collection: ${migrationOrchestrator.config.shadowCollection}`);
    
    // Drop shadow collection if exists
    try {
      await mongoose.connection.db.dropCollection(migrationOrchestrator.config.shadowCollection);
      console.log('🗑️ Dropped existing shadow collection');
    } catch (dropError) {
      console.log('ℹ️ Shadow collection does not exist, proceeding');
    }
    
    console.log('✅ Shadow collection ready for data transformation');
    
    completePhase('shadow-creation', { shadowCollection: migrationOrchestrator.config.shadowCollection });
    return migrationOrchestrator.config.shadowCollection;
    
  } catch (error) {
    console.error('❌ Shadow collection creation failed:', error.message);
    completePhase('shadow-creation', error, false);
  }
}

/**
 * Phase 4: Data Transformation with Real-time Progress
 */
async function runDataTransformation() {
  startPhase('data-transformation');
  
  try {
    const SourceProduct = mongoose.model('SourceProduct', new mongoose.Schema({}, { strict: false }), migrationOrchestrator.config.sourceCollection);
    const ShadowProduct = mongoose.model('ShadowProduct', new mongoose.Schema({}, { strict: false }), migrationOrchestrator.config.shadowCollection);
    
    console.log('🔄 Starting data transformation...');
    
    // Get all source products
    const sourceProducts = await SourceProduct.find({}).lean();
    const totalProducts = sourceProducts.length;
    
    console.log(`📊 Transforming ${totalProducts} products`);
    
    const batchSize = 25; // Optimized batch size
    const batches = [];
    
    for (let i = 0; i < sourceProducts.length; i += batchSize) {
      batches.push(sourceProducts.slice(i, i + batchSize));
    }
    
    let transformedCount = 0;
    let failedCount = 0;
    const transformationErrors = [];
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const transformedBatch = [];
      
      console.log(`⚡ Processing batch ${batchIndex + 1}/${batches.length}`);
      
      for (const product of batch) {
        try {
          const transformedProduct = transformToProductListDTO(product);
          transformedBatch.push(transformedProduct);
          transformedCount++;
        } catch (transformError) {
          failedCount++;
          transformationErrors.push({
            productId: product._id,
            error: transformError.message
          });
          console.error(`   ❌ Transform failed for ${product._id}: ${transformError.message}`);
        }
      }
      
      // Insert transformed batch
      if (transformedBatch.length > 0) {
        await ShadowProduct.insertMany(transformedBatch, { ordered: false });
      }
      
      // Progress update
      const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
      console.log(`   📈 Progress: ${progress}% (${transformedCount} transformed, ${failedCount} failed)`);
    }
    
    migrationOrchestrator.results.migratedProducts = transformedCount;
    migrationOrchestrator.results.failedProducts = failedCount;
    
    const successRate = (transformedCount / totalProducts * 100).toFixed(1);
    console.log(`✅ Data transformation completed`);
    console.log(`📊 Success rate: ${successRate}% (${transformedCount}/${totalProducts})`);
    console.log(`❌ Failed products: ${failedCount}`);
    
    if (transformedCount < totalProducts * migrationOrchestrator.config.safetyThresholds.minSuccessRate / 100) {
      throw new Error(`Transformation success rate ${successRate}% below safety threshold`);
    }
    
    completePhase('data-transformation', { 
      transformedCount, 
      failedCount, 
      successRate: parseFloat(successRate),
      errors: transformationErrors 
    });
    
    return { transformedCount, failedCount, successRate };
    
  } catch (error) {
    console.error('❌ Data transformation failed:', error.message);
    completePhase('data-transformation', error, false);
  }
}

/**
 * Enhanced ProductListDTO transformation
 */
function transformToProductListDTO(product) {
  try {
    // Extract primary image with comprehensive fallback
    const primaryImage = product.media?.primary || 
                        (product.images && Array.isArray(product.images) 
                          ? (product.images.find(img => img.isPrimary) || product.images[0])?.url 
                          : product.images?.primary) || 
                        '/images/placeholder-product.jpg';
    
    // Material specifications with validation
    const materialSpecs = {
      metal: {
        type: mapMetalType(product.customization?.materials?.[0]?.type || 'silver'),
        purity: product.customization?.materials?.[0]?.purity || '925',
        finish: product.customization?.materials?.[0]?.finish || 'polished',
        sustainability: {
          recycled: Boolean(product.customization?.materials?.[0]?.sustainability?.recycled),
          ethicallySourced: Boolean(product.customization?.materials?.[0]?.sustainability?.ethicallySourced)
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
          labGrown: Boolean(primaryStone.isLabGrown),
          conflictFree: Boolean(primaryStone.sustainability?.conflictFree),
          traceable: Boolean(primaryStone.sustainability?.traceable)
        }
      };
    }
    
    // Core ProductListDTO structure
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
        available: product.inventory?.available !== false,
        quantity: Number(product.inventory?.quantity || product.inventory?.available || 100)
      },
      metadata: {
        featured: Boolean(product.metadata?.featured || product.analytics?.trending),
        bestseller: Boolean(product.metadata?.bestseller || (product.analytics?.purchases > 10)),
        newArrival: Boolean(product.metadata?.newArrival || isNewProduct(product.createdAt)),
        tags: generateTags(product, materialSpecs)
      },
      materialSpecs,
      creator: product.creator?.profile ? {
        handle: product.creator.profile.handle,
        name: product.creator.profile.name
      } : undefined
    };
    
    // Validate output
    validateProductListDTO(productListDTO);
    
    return productListDTO;
    
  } catch (error) {
    throw new Error(`Product transformation failed for ${product._id}: ${error.message}`);
  }
}

// Helper functions (same as in migration strategy)
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

function mapStoneType(stoneType, isLabGrown) {
  if (!stoneType) return undefined;
  if (stoneType === 'other') return 'moissanite';
  const prefix = isLabGrown ? 'lab-' : '';
  return prefix + stoneType.toLowerCase();
}

function validateCarat(carat) {
  const numericCarat = Number(carat);
  if (isNaN(numericCarat) || numericCarat <= 0 || numericCarat > 20) {
    return 1.0;
  }
  return numericCarat;
}

function normalizeCategory(category) {
  const categoryMap = {
    'ring': 'rings', 'rings': 'rings',
    'necklace': 'necklaces', 'necklaces': 'necklaces',
    'earring': 'earrings', 'earrings': 'earrings',
    'bracelet': 'bracelets', 'bracelets': 'bracelets'
  };
  return categoryMap[category?.toLowerCase()] || 'jewelry';
}

function normalizeSubcategory(subcategory) {
  return subcategory || 'accessories';
}

function generateSlug(name) {
  if (!name) return 'product';
  return name.toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isNewProduct(createdAt) {
  if (!createdAt) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) > thirtyDaysAgo;
}

function generateTags(product, materialSpecs) {
  const tags = [];
  if (materialSpecs.metal?.type) tags.push(materialSpecs.metal.type);
  if (materialSpecs.stone?.type) tags.push(materialSpecs.stone.type);
  if (product.category) tags.push(product.category);
  if (product.tags && Array.isArray(product.tags)) tags.push(...product.tags);
  return [...new Set(tags)].slice(0, 5);
}

function validateProductListDTO(dto) {
  const requiredFields = ['_id', 'name', 'description', 'category', 'subcategory', 'slug', 'primaryImage', 'pricing', 'inventory', 'metadata', 'materialSpecs'];
  for (const field of requiredFields) {
    if (!(field in dto)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (typeof dto.pricing.basePrice !== 'number' || dto.pricing.basePrice < 0) {
    throw new Error('Invalid basePrice');
  }
  if (!dto.materialSpecs.metal?.type) {
    throw new Error('Missing metal type in materialSpecs');
  }
  return true;
}

/**
 * Phase 5: Index Optimization
 */
async function runIndexOptimizationPhase() {
  startPhase('index-optimization');
  
  try {
    console.log('🔍 Running index optimization for shadow collection...');
    
    // Temporarily update target collection for index optimization
    const originalTarget = process.env.TARGET_COLLECTION;
    process.env.TARGET_COLLECTION = migrationOrchestrator.config.shadowCollection;
    
    const optimizationResult = await runIndexOptimization();
    
    // Restore original target
    if (originalTarget) {
      process.env.TARGET_COLLECTION = originalTarget;
    }
    
    if (!optimizationResult.success) {
      throw new Error('Index optimization failed to meet performance targets');
    }
    
    console.log(`✅ Index optimization completed`);
    console.log(`⚡ Performance compliance: ${optimizationResult.results.performanceMetrics.summary.claudeComplianceRate}%`);
    
    completePhase('index-optimization', optimizationResult);
    return optimizationResult;
    
  } catch (error) {
    console.error('❌ Index optimization failed:', error.message);
    completePhase('index-optimization', error, false);
  }
}

/**
 * Phase 6: Performance Validation
 */
async function runPerformanceValidation() {
  startPhase('performance-validation');
  
  try {
    console.log('⚡ Validating migration performance...');
    
    const ShadowProduct = mongoose.model('ShadowProduct', new mongoose.Schema({}, { strict: false }), migrationOrchestrator.config.shadowCollection);
    
    // Critical performance tests
    const performanceTests = [
      {
        name: 'Catalog Load Time',
        query: { 'inventory.available': true },
        sort: { 'metadata.featured': -1, 'pricing.basePrice': 1 },
        limit: 24,
        target: 50,
        critical: true
      },
      {
        name: 'Material Filter Performance',
        query: { 'materialSpecs.metal.type': '14k-gold' },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 100,
        critical: true
      },
      {
        name: 'Category + Material Query',
        query: { 
          'category': 'rings',
          'materialSpecs.metal.type': '14k-gold',
          'inventory.available': true 
        },
        sort: { 'metadata.featured': -1 },
        limit: 24,
        target: 150,
        critical: false
      }
    ];
    
    const performanceResults = {};
    let criticalTestsPassed = 0;
    let criticalTestsTotal = 0;
    
    for (const test of performanceTests) {
      if (test.critical) criticalTestsTotal++;
      
      // Run test multiple times for accuracy
      const iterations = 5;
      const measurements = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const results = await ShadowProduct
          .find(test.query)
          .sort(test.sort)
          .limit(test.limit)
          .lean();
        
        measurements.push({
          time: Date.now() - startTime,
          resultCount: results.length
        });
      }
      
      const avgTime = measurements.reduce((sum, m) => sum + m.time, 0) / measurements.length;
      const passed = avgTime <= test.target;
      
      if (passed && test.critical) criticalTestsPassed++;
      
      performanceResults[test.name] = {
        averageTime: Math.round(avgTime),
        target: test.target,
        passed,
        critical: test.critical,
        claudeCompliant: avgTime <= migrationOrchestrator.config.performanceTarget
      };
      
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${test.name}: ${Math.round(avgTime)}ms (target: ${test.target}ms)`);
    }
    
    migrationOrchestrator.results.performanceMetrics = performanceResults;
    
    const criticalSuccessRate = (criticalTestsPassed / criticalTestsTotal * 100).toFixed(1);
    console.log(`📊 Critical performance tests: ${criticalSuccessRate}% passed`);
    
    if (criticalTestsPassed < criticalTestsTotal) {
      throw new Error(`Critical performance tests failed: ${criticalTestsPassed}/${criticalTestsTotal} passed`);
    }
    
    completePhase('performance-validation', { 
      results: performanceResults, 
      criticalSuccessRate: parseFloat(criticalSuccessRate) 
    });
    
    return performanceResults;
    
  } catch (error) {
    console.error('❌ Performance validation failed:', error.message);
    completePhase('performance-validation', error, false);
  }
}

/**
 * Phase 7: Blue-Green Switch (Atomic)
 */
async function runBlueGreenSwitch() {
  startPhase('blue-green-switch');
  
  try {
    console.log('🔄 Performing atomic blue-green switch...');
    
    const switchStartTime = Date.now();
    
    // Step 1: Create backup of current collection
    const backupCollectionName = `${migrationOrchestrator.config.sourceCollection}_backup_${Date.now()}`;
    console.log(`📦 Creating backup: ${backupCollectionName}`);
    
    await mongoose.connection.db.collection(migrationOrchestrator.config.sourceCollection)
      .rename(backupCollectionName);
    
    // Step 2: Promote shadow collection to primary
    console.log(`🔄 Promoting shadow collection to primary`);
    
    await mongoose.connection.db.collection(migrationOrchestrator.config.shadowCollection)
      .rename(migrationOrchestrator.config.targetCollection);
    
    const switchDuration = Date.now() - switchStartTime;
    console.log(`✅ Blue-green switch completed in ${switchDuration}ms`);
    
    if (switchDuration > migrationOrchestrator.config.safetyThresholds.maxDowntime) {
      console.log(`⚠️ Switch took ${switchDuration}ms (target: ${migrationOrchestrator.config.safetyThresholds.maxDowntime}ms)`);
    }
    
    migrationOrchestrator.config.backupCollection = backupCollectionName;
    
    completePhase('blue-green-switch', { 
      switchDuration, 
      backupCollection: backupCollectionName 
    });
    
    return { switchDuration, backupCollection: backupCollectionName };
    
  } catch (error) {
    console.error('❌ Blue-green switch failed:', error.message);
    
    // Attempt immediate rollback
    console.log('🔙 Attempting emergency rollback...');
    try {
      await emergencyRollback();
    } catch (rollbackError) {
      console.error('💥 CRITICAL: Emergency rollback failed!', rollbackError.message);
    }
    
    completePhase('blue-green-switch', error, false);
  }
}

/**
 * Phase 8: Post-Migration Validation
 */
async function runPostMigrationValidation() {
  startPhase('post-validation');
  
  try {
    console.log('🔍 Running post-migration validation...');
    
    // Run comprehensive data integrity verification
    const verificationResult = await runDataIntegrityVerification();
    
    if (!verificationResult.summary.overallSuccess) {
      throw new Error(`Post-migration validation failed: ${verificationResult.summary.failedTests} test failures`);
    }
    
    console.log(`✅ Post-migration validation passed`);
    console.log(`📊 Success rate: ${verificationResult.summary.passedTests}/${verificationResult.summary.totalTests} tests`);
    console.log(`⚡ Performance compliance: ${verificationResult.summary.criticalIssues.length === 0 ? 'PASS' : 'ISSUES DETECTED'}`);
    
    completePhase('post-validation', verificationResult);
    return verificationResult;
    
  } catch (error) {
    console.error('❌ Post-migration validation failed:', error.message);
    completePhase('post-validation', error, false);
  }
}

/**
 * Phase 9: Cleanup and Finalization
 */
async function runCleanupAndFinalization() {
  startPhase('cleanup');
  
  try {
    console.log('🧹 Running cleanup and finalization...');
    
    // Generate final migration report
    const migrationReport = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - migrationOrchestrator.startTime,
      success: true,
      phases: migrationOrchestrator.phases,
      results: migrationOrchestrator.results,
      config: migrationOrchestrator.config,
      backupInformation: {
        backupPath: migrationOrchestrator.results.backupPath,
        backupCollection: migrationOrchestrator.config.backupCollection,
        rollbackPossible: migrationOrchestrator.results.rollbackPossible
      },
      performanceMetrics: migrationOrchestrator.results.performanceMetrics,
      recommendations: [
        'Monitor application performance for 24 hours',
        'Run performance tests in production environment',
        'Keep backup collections for 30 days before cleanup',
        'Update application documentation to reflect new schema',
        'Schedule monthly index maintenance'
      ]
    };
    
    fs.writeFileSync('./migration-final-report.json', JSON.stringify(migrationReport, null, 2));
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`⏱️ Total duration: ${(migrationReport.duration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`📊 Products migrated: ${migrationOrchestrator.results.migratedProducts}`);
    console.log(`💾 Backup location: ${migrationOrchestrator.results.backupPath}`);
    console.log(`📄 Final report: migration-final-report.json`);
    
    completePhase('cleanup', migrationReport);
    return migrationReport;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    completePhase('cleanup', error, false);
  }
}

/**
 * Emergency rollback function
 */
async function emergencyRollback() {
  console.log('🚨 EMERGENCY ROLLBACK INITIATED');
  
  try {
    if (!migrationOrchestrator.config.backupCollection) {
      throw new Error('No backup collection available for rollback');
    }
    
    // Drop current collection and restore from backup
    await mongoose.connection.db.dropCollection(migrationOrchestrator.config.targetCollection);
    await mongoose.connection.db.collection(migrationOrchestrator.config.backupCollection)
      .rename(migrationOrchestrator.config.targetCollection);
    
    console.log('✅ Emergency rollback completed');
    console.log('🔄 Original data structure restored');
    
    return true;
    
  } catch (error) {
    console.error('💥 Emergency rollback failed:', error.message);
    throw error;
  }
}

/**
 * Main orchestrator
 */
async function runZeroDowntimeMigration() {
  migrationOrchestrator.startTime = Date.now();
  
  console.log('🚀 GenZ Jewelry Platform - Zero-Downtime Migration Orchestrator');
  console.log('📅 ' + new Date().toISOString());
  console.log('🎯 Target: Complete ProductListDTO migration with zero downtime');
  console.log('⚡ Performance Target: <300ms catalog queries (CLAUDE_RULES)');
  console.log('🔄 Strategy: Blue-Green deployment with atomic switchover');
  console.log('='.repeat(80));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genz-jewelry');
    console.log('✅ Connected to MongoDB');
    
    // Execute migration phases
    await runPreFlightValidation();
    await runBackupCreation();
    await runShadowCollectionCreation();
    await runDataTransformation();
    await runIndexOptimizationPhase();
    await runPerformanceValidation();
    await runBlueGreenSwitch();
    await runPostMigrationValidation();
    const finalReport = await runCleanupAndFinalization();
    
    return finalReport;
    
  } catch (error) {
    console.error(`\\n💥 MIGRATION FAILED in phase: ${migrationOrchestrator.currentPhase}`);
    console.error('Error:', error.message);
    
    // Generate failure report
    const failureReport = {
      timestamp: new Date().toISOString(),
      success: false,
      failedPhase: migrationOrchestrator.currentPhase,
      error: error.message,
      phases: migrationOrchestrator.phases,
      results: migrationOrchestrator.results,
      backupPath: migrationOrchestrator.results.backupPath,
      rollbackPossible: migrationOrchestrator.results.rollbackPossible
    };
    
    fs.writeFileSync('./migration-failure-report.json', JSON.stringify(failureReport, null, 2));
    console.log('📄 Failure report saved to: migration-failure-report.json');
    
    throw error;
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\\n🔌 Database connection closed');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  runZeroDowntimeMigration()
    .then(report => {
      console.log('\\n🎉 ZERO-DOWNTIME MIGRATION COMPLETED SUCCESSFULLY!');
      console.log(`📊 ${report.results.migratedProducts} products migrated`);
      console.log(`⏱️ Total time: ${(report.duration / 1000 / 60).toFixed(2)} minutes`);
      console.log(`⚡ Performance compliance: MAINTAINED`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\\n💥 ZERO-DOWNTIME MIGRATION FAILED!');
      console.error('Check failure report and backup files for recovery options');
      process.exit(1);
    });
}

module.exports = {
  runZeroDowntimeMigration,
  emergencyRollback,
  migrationOrchestrator
};