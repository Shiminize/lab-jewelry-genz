#!/usr/bin/env node

/**
 * Index Optimization Strategy for GenZ Jewelry Platform
 * ProductListDTO Performance Optimization - CLAUDE_RULES Compliance
 * 
 * Target Performance: <300ms catalog queries
 * Strategy: Data-driven index creation with performance monitoring
 * 
 * Index Categories:
 * 1. Core Application Queries (catalog, search, filtering)
 * 2. Material Specifications (metal type, stone type, carat)
 * 3. Business Logic (pricing, inventory, featured products)
 * 4. Performance Monitoring (query pattern analysis)
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
const fs = require('fs');

// Load environment variables
config();

// Index optimization tracking
const indexOptimization = {
  timestamp: new Date().toISOString(),
  targetCollection: 'products',
  performanceTarget: 300, // ms (CLAUDE_RULES)
  strategy: {
    phase1: 'Analyze current query patterns',
    phase2: 'Create core performance indexes',
    phase3: 'Optimize material filtering indexes',
    phase4: 'Validate performance compliance',
    phase5: 'Setup monitoring and maintenance'
  },
  results: {
    currentIndexes: [],
    createdIndexes: [],
    performanceMetrics: {},
    recommendations: []
  }
};

/**
 * Product schema
 */
const ProductSchema = new mongoose.Schema({}, { strict: false });

/**
 * Analyze current index performance
 */
async function analyzeCurrentIndexes() {
  console.log('🔍 Phase 1: Current Index Analysis');
  
  try {
    const Product = mongoose.model('Product', ProductSchema, indexOptimization.targetCollection);
    const collection = Product.collection;
    
    // Get current indexes
    const currentIndexes = await collection.listIndexes().toArray();
    indexOptimization.results.currentIndexes = currentIndexes;
    
    console.log('📋 Current Indexes:');
    currentIndexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Analyze index usage stats (if available)
    try {
      const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();
      console.log('\\n📊 Index Usage Statistics:');
      indexStats.forEach(stat => {
        const usage = stat.accesses?.ops || 0;
        console.log(`   ${stat.name}: ${usage} operations`);
      });
    } catch (statsError) {
      console.log('ℹ️ Index usage statistics not available (requires MongoDB 3.2+)');
    }
    
    // Test current query performance
    console.log('\\n⚡ Current Performance Baseline:');
    const baselineTests = [
      {
        name: 'Basic Catalog Query',
        query: { 'inventory.available': true },
        sort: { 'metadata.featured': -1 },
        limit: 24
      },
      {
        name: 'Category Filter',
        query: { 'category': 'rings' },
        sort: { 'pricing.basePrice': 1 },
        limit: 24
      },
      {
        name: 'Price Range Query',
        query: { 'pricing.basePrice': { $gte: 100, $lte: 1000 } },
        sort: { 'pricing.basePrice': 1 },
        limit: 24
      }
    ];
    
    const baselineResults = {};
    for (const test of baselineTests) {
      const startTime = Date.now();
      const results = await Product.find(test.query).sort(test.sort).limit(test.limit).lean();
      const queryTime = Date.now() - startTime;
      
      baselineResults[test.name] = {
        time: queryTime,
        results: results.length
      };
      
      const status = queryTime <= indexOptimization.performanceTarget ? '✅' : '⚠️';
      console.log(`   ${status} ${test.name}: ${queryTime}ms (${results.length} results)`);
    }
    
    indexOptimization.results.performanceMetrics.baseline = baselineResults;
    
    return currentIndexes;
    
  } catch (error) {
    console.error('❌ Current index analysis failed:', error.message);
    throw error;
  }
}

/**
 * Core performance indexes for ProductListDTO
 */
async function createCorePerformanceIndexes() {
  console.log('\\n🚀 Phase 2: Creating Core Performance Indexes');
  
  try {
    const Product = mongoose.model('Product', ProductSchema, indexOptimization.targetCollection);
    const collection = Product.collection;
    
    const coreIndexes = [
      // 1. Catalog page primary query (most critical)
      {
        name: 'catalog_primary',
        index: { 'inventory.available': 1, 'metadata.featured': -1, 'pricing.basePrice': 1 },
        description: 'Primary catalog query optimization - available products with featured priority'
      },
      
      // 2. Category filtering (high usage)
      {
        name: 'category_filtering',
        index: { 'category': 1, 'inventory.available': 1, 'pricing.basePrice': 1 },
        description: 'Category-based filtering with availability check'
      },
      
      // 3. Text search optimization
      {
        name: 'text_search',
        index: { 'name': 'text', 'description': 'text', 'metadata.tags': 'text' },
        description: 'Full-text search across name, description, and tags'
      },
      
      // 4. Product detail lookup
      {
        name: 'product_lookup',
        index: { 'slug': 1 },
        description: 'Single product lookup by slug (unique)'
      },
      
      // 5. Admin queries
      {
        name: 'admin_management',
        index: { 'metadata.featured': 1, 'metadata.bestseller': 1, 'inventory.available': 1 },
        description: 'Admin dashboard and product management'
      }
    ];
    
    console.log(`📋 Creating ${coreIndexes.length} core performance indexes...`);
    
    for (const indexDef of coreIndexes) {
      try {
        const startTime = Date.now();
        await collection.createIndex(indexDef.index, { 
          name: indexDef.name,
          background: true // Non-blocking creation
        });
        const createTime = Date.now() - startTime;
        
        console.log(`   ✅ ${indexDef.name}: ${createTime}ms`);
        console.log(`      ${indexDef.description}`);
        
        indexOptimization.results.createdIndexes.push({
          name: indexDef.name,
          index: indexDef.index,
          creationTime: createTime,
          description: indexDef.description
        });
        
      } catch (indexError) {
        if (indexError.code === 85) { // Index already exists
          console.log(`   ℹ️ ${indexDef.name}: already exists`);
        } else {
          console.error(`   ❌ ${indexDef.name}: ${indexError.message}`);
        }
      }
    }
    
    return coreIndexes;
    
  } catch (error) {
    console.error('❌ Core performance index creation failed:', error.message);
    throw error;
  }
}

/**
 * Material specification filtering indexes
 */
async function createMaterialFilteringIndexes() {
  console.log('\\n💎 Phase 3: Creating Material Filtering Indexes');
  
  try {
    const Product = mongoose.model('Product', ProductSchema, indexOptimization.targetCollection);
    const collection = Product.collection;
    
    const materialIndexes = [
      // 1. Metal type filtering (primary material filter)
      {
        name: 'material_metal_filtering',
        index: { 'materialSpecs.metal.type': 1, 'inventory.available': 1, 'pricing.basePrice': 1 },
        description: 'Metal type filtering with availability and price sorting'
      },
      
      // 2. Stone type filtering
      {
        name: 'material_stone_filtering', 
        index: { 'materialSpecs.stone.type': 1, 'materialSpecs.stone.carat': -1 },
        description: 'Stone type filtering with carat sorting (largest first)'
      },
      
      // 3. Combined material filtering
      {
        name: 'material_combined_filtering',
        index: { 
          'materialSpecs.metal.type': 1, 
          'materialSpecs.stone.type': 1, 
          'category': 1,
          'pricing.basePrice': 1 
        },
        description: 'Combined metal/stone/category filtering with price sorting'
      },
      
      // 4. Carat range filtering
      {
        name: 'carat_range_filtering',
        index: { 'materialSpecs.stone.carat': 1, 'materialSpecs.stone.type': 1 },
        description: 'Carat range filtering with stone type'
      },
      
      // 5. Premium materials (high-end filtering)
      {
        name: 'premium_materials',
        index: { 
          'materialSpecs.metal.type': 1, 
          'materialSpecs.stone.carat': -1, 
          'pricing.basePrice': -1 
        },
        description: 'Premium material filtering (platinum, large stones, high prices)'
      },
      
      // 6. Sustainability filtering (new trend)
      {
        name: 'sustainability_filtering',
        index: { 
          'materialSpecs.metal.sustainability.recycled': 1,
          'materialSpecs.stone.sustainability.labGrown': 1,
          'category': 1
        },
        description: 'Sustainability-focused filtering (recycled metals, lab-grown stones)'
      }
    ];
    
    console.log(`📋 Creating ${materialIndexes.length} material filtering indexes...`);
    
    for (const indexDef of materialIndexes) {
      try {
        const startTime = Date.now();
        await collection.createIndex(indexDef.index, { 
          name: indexDef.name,
          background: true
        });
        const createTime = Date.now() - startTime;
        
        console.log(`   ✅ ${indexDef.name}: ${createTime}ms`);
        console.log(`      ${indexDef.description}`);
        
        indexOptimization.results.createdIndexes.push({
          name: indexDef.name,
          index: indexDef.index,
          creationTime: createTime,
          description: indexDef.description
        });
        
      } catch (indexError) {
        if (indexError.code === 85) {
          console.log(`   ℹ️ ${indexDef.name}: already exists`);
        } else {
          console.error(`   ❌ ${indexDef.name}: ${indexError.message}`);
        }
      }
    }
    
    return materialIndexes;
    
  } catch (error) {
    console.error('❌ Material filtering index creation failed:', error.message);
    throw error;
  }
}

/**
 * Validate post-optimization performance
 */
async function validatePerformanceCompliance() {
  console.log('\\n⚡ Phase 4: Performance Compliance Validation');
  
  try {
    const Product = mongoose.model('Product', ProductSchema, indexOptimization.targetCollection);
    
    const comprehensiveTests = [
      // Core application queries
      {
        category: 'Core Application',
        name: 'Catalog Page Load',
        query: { 'inventory.available': true },
        sort: { 'metadata.featured': -1, 'pricing.basePrice': 1 },
        limit: 24,
        target: 50,
        critical: true
      },
      {
        category: 'Core Application',
        name: 'Category Browse',
        query: { 'category': 'rings', 'inventory.available': true },
        sort: { 'metadata.featured': -1 },
        limit: 24,
        target: 75,
        critical: true
      },
      {
        category: 'Core Application',
        name: 'Product Search',
        query: { $text: { $search: 'engagement ring' } },
        sort: { score: { $meta: 'textScore' } },
        limit: 24,
        target: 150,
        critical: true
      },
      
      // Material filtering queries
      {
        category: 'Material Filtering',
        name: 'Metal Type Filter',
        query: { 'materialSpecs.metal.type': '14k-gold' },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 100,
        critical: false
      },
      {
        category: 'Material Filtering',
        name: 'Stone Type Filter',
        query: { 'materialSpecs.stone.type': 'lab-diamond' },
        sort: { 'materialSpecs.stone.carat': -1 },
        limit: 24,
        target: 100,
        critical: false
      },
      {
        category: 'Material Filtering',
        name: 'Combined Filter',
        query: { 
          'category': 'rings',
          'materialSpecs.metal.type': '14k-gold',
          'materialSpecs.stone.type': 'lab-diamond',
          'inventory.available': true
        },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 200,
        critical: false
      },
      
      // Advanced queries
      {
        category: 'Advanced',
        name: 'Price Range + Material',
        query: { 
          'pricing.basePrice': { $gte: 500, $lte: 2000 },
          'materialSpecs.metal.type': '14k-gold'
        },
        sort: { 'materialSpecs.stone.carat': -1 },
        limit: 24,
        target: 150,
        critical: false
      },
      {
        category: 'Advanced',
        name: 'Carat Range Filter',
        query: { 
          'materialSpecs.stone.carat': { $gte: 1.0, $lte: 2.0 }
        },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 100,
        critical: false
      },
      
      // Admin/management queries
      {
        category: 'Admin',
        name: 'Featured Products',
        query: { 'metadata.featured': true },
        sort: { 'metadata.bestseller': -1 },
        limit: 50,
        target: 75,
        critical: false
      }
    ];
    
    console.log(`🧪 Running ${comprehensiveTests.length} performance tests...`);
    
    const performanceResults = {};
    let criticalTestsPassed = 0;
    let criticalTestsTotal = 0;
    let allTestsPassed = 0;
    
    for (const test of comprehensiveTests) {
      if (test.critical) criticalTestsTotal++;
      
      // Run test multiple times for accurate measurement
      const iterations = 3;
      const measurements = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const results = await Product
          .find(test.query)
          .sort(test.sort)
          .limit(test.limit)
          .lean();
        
        measurements.push({
          time: Date.now() - startTime,
          resultCount: results.length
        });
      }
      
      // Calculate average performance
      const avgTime = measurements.reduce((sum, m) => sum + m.time, 0) / measurements.length;
      const avgResults = Math.round(measurements.reduce((sum, m) => sum + m.resultCount, 0) / measurements.length);
      
      const testResult = {
        category: test.category,
        name: test.name,
        averageTime: Math.round(avgTime),
        target: test.target,
        resultCount: avgResults,
        passed: avgTime <= test.target,
        critical: test.critical,
        claudeRulesCompliant: avgTime <= indexOptimization.performanceTarget
      };
      
      performanceResults[test.name] = testResult;
      
      if (testResult.passed) {
        allTestsPassed++;
        if (test.critical) criticalTestsPassed++;
      }
      
      const status = testResult.passed ? '✅' : '❌';
      const claudeStatus = testResult.claudeRulesCompliant ? '⚡' : '⚠️';
      
      console.log(`   ${status}${claudeStatus} [${test.category}] ${test.name}:`);
      console.log(`       ${testResult.averageTime}ms (target: ${test.target}ms, results: ${testResult.resultCount})`);
    }
    
    // Performance summary
    const overallSuccessRate = (allTestsPassed / comprehensiveTests.length * 100).toFixed(1);
    const criticalSuccessRate = criticalTestsTotal > 0 ? (criticalTestsPassed / criticalTestsTotal * 100).toFixed(1) : '100';
    
    console.log(`\\n📊 Performance Summary:`);
    console.log(`   Overall Tests: ${overallSuccessRate}% (${allTestsPassed}/${comprehensiveTests.length})`);
    console.log(`   Critical Tests: ${criticalSuccessRate}% (${criticalTestsPassed}/${criticalTestsTotal})`);
    
    const claudeCompliantTests = Object.values(performanceResults).filter(r => r.claudeRulesCompliant).length;
    const claudeComplianceRate = (claudeCompliantTests / comprehensiveTests.length * 100).toFixed(1);
    console.log(`   CLAUDE_RULES Compliance: ${claudeComplianceRate}% (${claudeCompliantTests}/${comprehensiveTests.length})`);
    
    indexOptimization.results.performanceMetrics.postOptimization = performanceResults;
    indexOptimization.results.performanceMetrics.summary = {
      overallSuccessRate: parseFloat(overallSuccessRate),
      criticalSuccessRate: parseFloat(criticalSuccessRate),
      claudeComplianceRate: parseFloat(claudeComplianceRate),
      allTestsPassed,
      criticalTestsPassed,
      totalTests: comprehensiveTests.length
    };
    
    return performanceResults;
    
  } catch (error) {
    console.error('❌ Performance validation failed:', error.message);
    throw error;
  }
}

/**
 * Setup performance monitoring and maintenance
 */
async function setupMonitoringAndMaintenance() {
  console.log('\\n📊 Phase 5: Performance Monitoring & Maintenance Setup');
  
  try {
    // Create monitoring queries file
    const monitoringQueries = {
      title: 'GenZ Jewelry - Database Performance Monitoring Queries',
      generated: new Date().toISOString(),
      claudeRulesTarget: '300ms',
      queries: {
        catalog: {
          description: 'Primary catalog page performance',
          query: "db.products.find({'inventory.available': true}).sort({'metadata.featured': -1, 'pricing.basePrice': 1}).limit(24)",
          targetTime: '50ms',
          frequency: 'Every page load'
        },
        materialFiltering: {
          description: 'Material-based filtering performance',
          query: "db.products.find({'materialSpecs.metal.type': '14k-gold'}).sort({'pricing.basePrice': 1}).limit(24)",
          targetTime: '100ms',
          frequency: 'Filter usage'
        },
        textSearch: {
          description: 'Full-text search performance',
          query: "db.products.find({$text: {$search: 'engagement ring'}}).sort({score: {$meta: 'textScore'}}).limit(24)",
          targetTime: '150ms',
          frequency: 'Search usage'
        },
        adminDashboard: {
          description: 'Admin dashboard queries',
          query: "db.products.find({'metadata.featured': true}).sort({'metadata.bestseller': -1}).limit(50)",
          targetTime: '75ms',
          frequency: 'Admin access'
        }
      },
      maintenanceTasks: {
        indexMaintenance: {
          frequency: 'Monthly',
          task: 'Check index usage statistics and remove unused indexes',
          command: 'db.products.aggregate([{$indexStats: {}}])'
        },
        performanceReview: {
          frequency: 'Weekly',
          task: 'Review slow query logs and optimize if needed',
          threshold: '300ms (CLAUDE_RULES)'
        },
        indexFragmentation: {
          frequency: 'Quarterly',
          task: 'Rebuild indexes if fragmentation detected',
          command: 'db.products.reIndex()'
        }
      }
    };
    
    fs.writeFileSync('./performance-monitoring-guide.json', JSON.stringify(monitoringQueries, null, 2));
    console.log('📄 Performance monitoring guide saved to: performance-monitoring-guide.json');
    
    // Create index maintenance script
    const maintenanceScript = `#!/usr/bin/env node

/**
 * Database Index Maintenance Script
 * Auto-generated by Index Optimization Strategy
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
config();

async function runIndexMaintenance() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔧 Running database index maintenance...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Check index usage
    const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();
    console.log('📊 Index Usage Statistics:');
    indexStats.forEach(stat => {
      const usage = stat.accesses?.ops || 0;
      const efficiency = usage > 100 ? '✅' : usage > 10 ? '⚠️' : '❌';
      console.log(\`   \${efficiency} \${stat.name}: \${usage} operations\`);
    });
    
    // Performance test
    console.log('\\n⚡ Performance Test:');
    const startTime = Date.now();
    await collection.find({ 'inventory.available': true })
      .sort({ 'metadata.featured': -1 })
      .limit(24)
      .toArray();
    const queryTime = Date.now() - startTime;
    
    const status = queryTime <= 300 ? '✅' : '⚠️';
    console.log(\`   \${status} Catalog query: \${queryTime}ms (CLAUDE_RULES: <300ms)\`);
    
    await mongoose.disconnect();
    console.log('✅ Index maintenance completed');
    
  } catch (error) {
    console.error('❌ Index maintenance failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runIndexMaintenance();
}

module.exports = { runIndexMaintenance };
`;
    
    fs.writeFileSync('./scripts/index-maintenance.js', maintenanceScript);
    fs.chmodSync('./scripts/index-maintenance.js', '755');
    console.log('🔧 Index maintenance script saved to: scripts/index-maintenance.js');
    
    // Create performance recommendations
    const recommendations = [
      {
        priority: 'High',
        category: 'Query Optimization',
        recommendation: 'Monitor catalog page queries - they should consistently be <50ms',
        implementation: 'Use the performance monitoring queries daily'
      },
      {
        priority: 'High',
        category: 'Index Management',
        recommendation: 'Review index usage monthly and remove unused indexes',
        implementation: 'Run the index maintenance script monthly'
      },
      {
        priority: 'Medium',
        category: 'Material Filtering',
        recommendation: 'Monitor material filtering performance as usage scales',
        implementation: 'Track material filter usage patterns'
      },
      {
        priority: 'Medium',
        category: 'Text Search',
        recommendation: 'Consider search result relevance tuning if search volume increases',
        implementation: 'Analyze search query patterns and optimize text indexes'
      },
      {
        priority: 'Low',
        category: 'Future Optimization',
        recommendation: 'Consider read replicas for high-traffic periods',
        implementation: 'Monitor read/write ratios and scale accordingly'
      }
    ];
    
    indexOptimization.results.recommendations = recommendations;
    
    console.log('\\n📋 Performance Recommendations:');
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority}] ${rec.category}: ${rec.recommendation}`);
    });
    
    return { monitoringQueries, maintenanceScript, recommendations };
    
  } catch (error) {
    console.error('❌ Monitoring setup failed:', error.message);
    throw error;
  }
}

/**
 * Generate comprehensive index optimization report
 */
function generateIndexOptimizationReport() {
  console.log('\\n📊 Index Optimization Complete');
  console.log('='.repeat(60));
  
  const summary = indexOptimization.results.performanceMetrics.summary;
  
  console.log('📈 Optimization Results:');
  console.log(`   Indexes Created: ${indexOptimization.results.createdIndexes.length}`);
  console.log(`   Performance Tests: ${summary.overallSuccessRate}% passed`);
  console.log(`   Critical Tests: ${summary.criticalSuccessRate}% passed`);
  console.log(`   CLAUDE_RULES Compliance: ${summary.claudeComplianceRate}%`);
  
  const isOptimizationSuccessful = summary.criticalSuccessRate >= 90 && summary.claudeComplianceRate >= 80;
  
  console.log(`\\n🎯 Optimization Status: ${isOptimizationSuccessful ? '✅ SUCCESS' : '❌ NEEDS IMPROVEMENT'}`);
  
  if (isOptimizationSuccessful) {
    console.log('✅ Database is optimized for production');
    console.log('✅ CLAUDE_RULES performance targets achieved');
    console.log('✅ Material filtering indexes operational');
  } else {
    console.log('⚠️ Some performance targets not met');
    console.log('⚠️ Review failed tests and consider additional optimization');
  }
  
  // Save comprehensive report
  const report = {
    ...indexOptimization,
    success: isOptimizationSuccessful,
    completedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('./index-optimization-report.json', JSON.stringify(report, null, 2));
  console.log('\\n📄 Detailed report saved to: index-optimization-report.json');
  
  return report;
}

/**
 * Main index optimization orchestrator
 */
async function runIndexOptimization() {
  console.log('🚀 GenZ Jewelry Platform - Index Optimization Strategy');
  console.log('📅 ' + new Date().toISOString());
  console.log('🎯 Target: ProductListDTO performance optimization');
  console.log('⚡ Performance Target: <300ms catalog queries (CLAUDE_RULES)');
  console.log('='.repeat(80));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genz-jewelry');
    console.log('✅ Connected to MongoDB');
    
    // Run optimization phases
    await analyzeCurrentIndexes();
    await createCorePerformanceIndexes();
    await createMaterialFilteringIndexes();
    await validatePerformanceCompliance();
    await setupMonitoringAndMaintenance();
    
    // Generate final report
    const report = generateIndexOptimizationReport();
    
    return report;
    
  } catch (error) {
    console.error('\\n💥 Index optimization failed:', error);
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
  runIndexOptimization()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runIndexOptimization,
  indexOptimization
};