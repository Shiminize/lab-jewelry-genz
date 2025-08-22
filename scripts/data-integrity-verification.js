#!/usr/bin/env node

/**
 * Data Integrity Verification for GenZ Jewelry Platform
 * Material Specs Migration Validation & Quality Assurance
 * 
 * Comprehensive verification of:
 * 1. Data transformation accuracy
 * 2. Material specifications completeness  
 * 3. Performance compliance (CLAUDE_RULES: <300ms)
 * 4. Business logic preservation
 * 5. Edge case handling
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
const fs = require('fs');

// Load environment variables
config();

// Verification results tracking
const verificationResults = {
  timestamp: new Date().toISOString(),
  collections: {
    source: 'products',
    target: 'products_v2'
  },
  tests: {
    dataCompleteness: { passed: 0, failed: 0, details: [] },
    materialSpecsAccuracy: { passed: 0, failed: 0, details: [] },
    performanceCompliance: { passed: 0, failed: 0, details: [] },
    businessLogicPreservation: { passed: 0, failed: 0, details: [] },
    edgeCaseHandling: { passed: 0, failed: 0, details: [] }
  },
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    overallSuccess: false,
    criticalIssues: []
  }
};

/**
 * Product schema (flexible for both collections)
 */
const ProductSchema = new mongoose.Schema({}, { strict: false });

/**
 * Test: Data Completeness Verification
 */
async function verifyDataCompleteness() {
  console.log('🔍 Test Suite 1: Data Completeness Verification');
  
  try {
    const SourceProduct = mongoose.model('SourceProduct', ProductSchema, verificationResults.collections.source);
    const TargetProduct = mongoose.model('TargetProduct', ProductSchema, verificationResults.collections.target);
    
    // Test 1.1: Document count matching
    console.log('   📊 Test 1.1: Document count verification');
    const sourceCount = await SourceProduct.countDocuments();
    const targetCount = await TargetProduct.countDocuments();
    
    const countTest = {
      name: 'Document Count Matching',
      sourceCount,
      targetCount,
      successRate: (targetCount / sourceCount * 100).toFixed(2),
      passed: targetCount >= sourceCount * 0.95 // 95% threshold
    };
    
    if (countTest.passed) {
      verificationResults.tests.dataCompleteness.passed++;
      console.log(`   ✅ ${countTest.name}: ${countTest.successRate}% (${targetCount}/${sourceCount})`);
    } else {
      verificationResults.tests.dataCompleteness.failed++;
      console.log(`   ❌ ${countTest.name}: ${countTest.successRate}% (${targetCount}/${sourceCount})`);
      verificationResults.summary.criticalIssues.push(`Low migration success rate: ${countTest.successRate}%`);
    }
    
    verificationResults.tests.dataCompleteness.details.push(countTest);
    
    // Test 1.2: Core field preservation
    console.log('   📋 Test 1.2: Core field preservation');
    const sampleSize = Math.min(50, sourceCount);
    const sourceProducts = await SourceProduct.find({}).limit(sampleSize).lean();
    
    let coreFieldsPreserved = 0;
    const coreFields = ['_id', 'name', 'description', 'category'];
    
    for (const sourceProduct of sourceProducts) {
      const targetProduct = await TargetProduct.findOne({ _id: sourceProduct._id }).lean();
      
      if (targetProduct) {
        const fieldsMatch = coreFields.every(field => {
          return sourceProduct[field] === targetProduct[field];
        });
        
        if (fieldsMatch) {
          coreFieldsPreserved++;
        }
      }
    }
    
    const coreFieldsTest = {
      name: 'Core Fields Preservation',
      tested: sampleSize,
      preserved: coreFieldsPreserved,
      successRate: (coreFieldsPreserved / sampleSize * 100).toFixed(2),
      passed: coreFieldsPreserved >= sampleSize * 0.98 // 98% threshold
    };
    
    if (coreFieldsTest.passed) {
      verificationResults.tests.dataCompleteness.passed++;
      console.log(`   ✅ ${coreFieldsTest.name}: ${coreFieldsTest.successRate}% (${coreFieldsTest.preserved}/${coreFieldsTest.tested})`);
    } else {
      verificationResults.tests.dataCompleteness.failed++;
      console.log(`   ❌ ${coreFieldsTest.name}: ${coreFieldsTest.successRate}% (${coreFieldsTest.preserved}/${coreFieldsTest.tested})`);
    }
    
    verificationResults.tests.dataCompleteness.details.push(coreFieldsTest);
    
    // Test 1.3: Required ProductListDTO fields
    console.log('   🏗️ Test 1.3: ProductListDTO structure compliance');
    const requiredFields = ['_id', 'name', 'description', 'category', 'subcategory', 'slug', 'primaryImage', 'pricing', 'inventory', 'metadata', 'materialSpecs'];
    
    const structuralSample = await TargetProduct.find({}).limit(20).lean();
    let structurallyValid = 0;
    
    for (const product of structuralSample) {
      const hasAllFields = requiredFields.every(field => field in product);
      if (hasAllFields) {
        structurallyValid++;
      }
    }
    
    const structuralTest = {
      name: 'ProductListDTO Structure Compliance',
      tested: structuralSample.length,
      valid: structurallyValid,
      successRate: (structurallyValid / structuralSample.length * 100).toFixed(2),
      passed: structurallyValid === structuralSample.length
    };
    
    if (structuralTest.passed) {
      verificationResults.tests.dataCompleteness.passed++;
      console.log(`   ✅ ${structuralTest.name}: ${structuralTest.successRate}% (${structuralTest.valid}/${structuralTest.tested})`);
    } else {
      verificationResults.tests.dataCompleteness.failed++;
      console.log(`   ❌ ${structuralTest.name}: ${structuralTest.successRate}% (${structuralTest.valid}/${structuralTest.tested})`);
    }
    
    verificationResults.tests.dataCompleteness.details.push(structuralTest);
    
  } catch (error) {
    console.error('   💥 Data completeness verification failed:', error.message);
    verificationResults.tests.dataCompleteness.failed++;
    verificationResults.summary.criticalIssues.push(`Data completeness test failed: ${error.message}`);
  }
}

/**
 * Test: Material Specifications Accuracy
 */
async function verifyMaterialSpecsAccuracy() {
  console.log('\\n💎 Test Suite 2: Material Specifications Accuracy');
  
  try {
    const SourceProduct = mongoose.model('SourceProduct', ProductSchema, verificationResults.collections.source);
    const TargetProduct = mongoose.model('TargetProduct', ProductSchema, verificationResults.collections.target);
    
    // Test 2.1: Material specs presence
    console.log('   🔍 Test 2.1: Material specs presence verification');
    const targetProducts = await TargetProduct.find({}).limit(100).lean();
    
    let productsWithMaterialSpecs = 0;
    let productsWithValidMetalSpecs = 0;
    let productsWithValidStoneSpecs = 0;
    
    for (const product of targetProducts) {
      if (product.materialSpecs) {
        productsWithMaterialSpecs++;
        
        // Check metal specs
        if (product.materialSpecs.metal?.type) {
          productsWithValidMetalSpecs++;
        }
        
        // Check stone specs (optional)
        if (product.materialSpecs.stone?.type) {
          productsWithValidStoneSpecs++;
        }
      }
    }
    
    const materialSpecsTest = {
      name: 'Material Specs Presence',
      tested: targetProducts.length,
      withSpecs: productsWithMaterialSpecs,
      withMetalSpecs: productsWithValidMetalSpecs,
      withStoneSpecs: productsWithValidStoneSpecs,
      specsSuccessRate: (productsWithMaterialSpecs / targetProducts.length * 100).toFixed(2),
      metalSuccessRate: (productsWithValidMetalSpecs / targetProducts.length * 100).toFixed(2),
      passed: productsWithMaterialSpecs >= targetProducts.length * 0.95
    };
    
    if (materialSpecsTest.passed) {
      verificationResults.tests.materialSpecsAccuracy.passed++;
      console.log(`   ✅ ${materialSpecsTest.name}: ${materialSpecsTest.specsSuccessRate}% have specs, ${materialSpecsTest.metalSuccessRate}% have metal specs`);
    } else {
      verificationResults.tests.materialSpecsAccuracy.failed++;
      console.log(`   ❌ ${materialSpecsTest.name}: ${materialSpecsTest.specsSuccessRate}% have specs (${materialSpecsTest.withSpecs}/${materialSpecsTest.tested})`);
    }
    
    verificationResults.tests.materialSpecsAccuracy.details.push(materialSpecsTest);
    
    // Test 2.2: Carat value accuracy
    console.log('   ⚖️ Test 2.2: Carat value transformation accuracy');
    
    // Sample products with gemstones from both collections
    const sourceSample = await SourceProduct.find({ 'customization.gemstones': { $exists: true, $ne: [] } }).limit(50).lean();
    
    let caratAccuracyTests = 0;
    let caratAccuracyPassed = 0;
    
    for (const sourceProduct of sourceSample) {
      const targetProduct = await TargetProduct.findOne({ _id: sourceProduct._id }).lean();
      
      if (targetProduct && sourceProduct.customization?.gemstones?.length > 0) {
        caratAccuracyTests++;
        
        const sourceGemstone = sourceProduct.customization.gemstones[0];
        const targetCarat = targetProduct.materialSpecs?.stone?.carat;
        
        // Check if carat was preserved or defaulted appropriately
        const sourceCarat = sourceGemstone.carat || 1.0;
        
        if (Math.abs(sourceCarat - targetCarat) < 0.01) { // Allow for small floating point differences
          caratAccuracyPassed++;
        }
      }
    }
    
    const caratTest = {
      name: 'Carat Value Transformation Accuracy',
      tested: caratAccuracyTests,
      accurate: caratAccuracyPassed,
      successRate: caratAccuracyTests > 0 ? (caratAccuracyPassed / caratAccuracyTests * 100).toFixed(2) : '100',
      passed: caratAccuracyTests === 0 || caratAccuracyPassed >= caratAccuracyTests * 0.9
    };
    
    if (caratTest.passed) {
      verificationResults.tests.materialSpecsAccuracy.passed++;
      console.log(`   ✅ ${caratTest.name}: ${caratTest.successRate}% (${caratTest.accurate}/${caratTest.tested})`);
    } else {
      verificationResults.tests.materialSpecsAccuracy.failed++;
      console.log(`   ❌ ${caratTest.name}: ${caratTest.successRate}% (${caratTest.accurate}/${caratTest.tested})`);
    }
    
    verificationResults.tests.materialSpecsAccuracy.details.push(caratTest);
    
    // Test 2.3: Material type standardization
    console.log('   🏷️ Test 2.3: Material type standardization verification');
    
    const materialTypeDistribution = await TargetProduct.aggregate([
      { $group: { 
          _id: '$materialSpecs.metal.type', 
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const validMetalTypes = ['14k-gold', '14k-white-gold', '14k-rose-gold', 'platinum', 'silver', 'titanium'];
    const invalidTypes = materialTypeDistribution.filter(type => !validMetalTypes.includes(type._id));
    
    const standardizationTest = {
      name: 'Material Type Standardization',
      totalTypes: materialTypeDistribution.length,
      validTypes: materialTypeDistribution.length - invalidTypes.length,
      invalidTypes: invalidTypes.map(t => t._id),
      distribution: materialTypeDistribution,
      passed: invalidTypes.length === 0
    };
    
    if (standardizationTest.passed) {
      verificationResults.tests.materialSpecsAccuracy.passed++;
      console.log(`   ✅ ${standardizationTest.name}: All ${standardizationTest.totalTypes} material types are standardized`);
    } else {
      verificationResults.tests.materialSpecsAccuracy.failed++;
      console.log(`   ❌ ${standardizationTest.name}: Found ${invalidTypes.length} non-standard types: ${invalidTypes.map(t => t._id).join(', ')}`);
    }
    
    verificationResults.tests.materialSpecsAccuracy.details.push(standardizationTest);
    
  } catch (error) {
    console.error('   💥 Material specs accuracy verification failed:', error.message);
    verificationResults.tests.materialSpecsAccuracy.failed++;
    verificationResults.summary.criticalIssues.push(`Material specs accuracy test failed: ${error.message}`);
  }
}

/**
 * Test: Performance Compliance (CLAUDE_RULES)
 */
async function verifyPerformanceCompliance() {
  console.log('\\n⚡ Test Suite 3: Performance Compliance (CLAUDE_RULES: <300ms)');
  
  try {
    const TargetProduct = mongoose.model('TargetProduct', ProductSchema, verificationResults.collections.target);
    
    const performanceTests = [
      {
        name: 'Catalog Page Query',
        query: { 'inventory.available': true },
        sort: { 'metadata.featured': -1, 'pricing.basePrice': 1 },
        limit: 24,
        target: 300
      },
      {
        name: 'Material Filter Query',
        query: { 'materialSpecs.metal.type': '14k-gold' },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 200
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
        target: 250
      },
      {
        name: 'Price Range Query',
        query: { 'pricing.basePrice': { $gte: 100, $lte: 1000 } },
        sort: { 'pricing.basePrice': 1 },
        limit: 24,
        target: 150
      },
      {
        name: 'Stone Type Filter',
        query: { 'materialSpecs.stone.type': { $exists: true } },
        sort: { 'materialSpecs.stone.carat': -1 },
        limit: 24,
        target: 200
      }
    ];
    
    let performanceTestsPassed = 0;
    
    for (const test of performanceTests) {
      console.log(`   🔍 Test 3.${performanceTests.indexOf(test) + 1}: ${test.name}`);
      
      // Run query multiple times for accurate measurement
      const measurements = [];
      const iterations = 5;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const results = await TargetProduct
          .find(test.query)
          .sort(test.sort)
          .limit(test.limit)
          .lean();
        
        const queryTime = Date.now() - startTime;
        measurements.push({ queryTime, resultCount: results.length });
      }
      
      // Calculate average performance
      const avgQueryTime = measurements.reduce((sum, m) => sum + m.queryTime, 0) / measurements.length;
      const avgResultCount = Math.round(measurements.reduce((sum, m) => sum + m.resultCount, 0) / measurements.length);
      
      const performanceTest = {
        name: test.name,
        averageTime: Math.round(avgQueryTime),
        target: test.target,
        resultCount: avgResultCount,
        measurements: measurements,
        passed: avgQueryTime <= test.target
      };
      
      if (performanceTest.passed) {
        verificationResults.tests.performanceCompliance.passed++;
        performanceTestsPassed++;
        console.log(`     ✅ ${performanceTest.averageTime}ms (target: ${performanceTest.target}ms, ${performanceTest.resultCount} results)`);
      } else {
        verificationResults.tests.performanceCompliance.failed++;
        console.log(`     ❌ ${performanceTest.averageTime}ms (target: ${performanceTest.target}ms, ${performanceTest.resultCount} results)`);
      }
      
      verificationResults.tests.performanceCompliance.details.push(performanceTest);
    }
    
    // Overall performance compliance
    const overallPerformanceCompliance = performanceTestsPassed / performanceTests.length;
    console.log(`   📊 Overall Performance Compliance: ${(overallPerformanceCompliance * 100).toFixed(1)}% (${performanceTestsPassed}/${performanceTests.length} tests passed)`);
    
    if (overallPerformanceCompliance < 0.8) {
      verificationResults.summary.criticalIssues.push(`Poor performance compliance: ${(overallPerformanceCompliance * 100).toFixed(1)}%`);
    }
    
  } catch (error) {
    console.error('   💥 Performance compliance verification failed:', error.message);
    verificationResults.tests.performanceCompliance.failed++;
    verificationResults.summary.criticalIssues.push(`Performance compliance test failed: ${error.message}`);
  }
}

/**
 * Test: Business Logic Preservation
 */
async function verifyBusinessLogicPreservation() {
  console.log('\\n🏪 Test Suite 4: Business Logic Preservation');
  
  try {
    const SourceProduct = mongoose.model('SourceProduct', ProductSchema, verificationResults.collections.source);
    const TargetProduct = mongoose.model('TargetProduct', ProductSchema, verificationResults.collections.target);
    
    // Test 4.1: Pricing preservation
    console.log('   💰 Test 4.1: Pricing logic preservation');
    
    const pricingSample = await SourceProduct.find({}).limit(50).lean();
    let pricingAccurate = 0;
    
    for (const sourceProduct of pricingSample) {
      const targetProduct = await TargetProduct.findOne({ _id: sourceProduct._id }).lean();
      
      if (targetProduct) {
        const sourcePrice = sourceProduct.pricing?.basePrice || sourceProduct.basePrice || 0;
        const targetPrice = targetProduct.pricing?.basePrice || 0;
        
        if (Math.abs(sourcePrice - targetPrice) < 0.01) {
          pricingAccurate++;
        }
      }
    }
    
    const pricingTest = {
      name: 'Pricing Logic Preservation',
      tested: pricingSample.length,
      accurate: pricingAccurate,
      successRate: (pricingAccurate / pricingSample.length * 100).toFixed(2),
      passed: pricingAccurate >= pricingSample.length * 0.98
    };
    
    if (pricingTest.passed) {
      verificationResults.tests.businessLogicPreservation.passed++;
      console.log(`     ✅ ${pricingTest.successRate}% (${pricingTest.accurate}/${pricingTest.tested})`);
    } else {
      verificationResults.tests.businessLogicPreservation.failed++;
      console.log(`     ❌ ${pricingTest.successRate}% (${pricingTest.accurate}/${pricingTest.tested})`);
    }
    
    verificationResults.tests.businessLogicPreservation.details.push(pricingTest);
    
    // Test 4.2: Inventory availability logic
    console.log('   📦 Test 4.2: Inventory availability logic');
    
    const inventorySample = await TargetProduct.find({}).limit(100).lean();
    let inventoryLogicValid = 0;
    
    for (const product of inventorySample) {
      // Inventory should be available if no explicit false value
      const hasValidInventoryLogic = product.inventory?.available !== undefined && 
                                   typeof product.inventory.available === 'boolean';
      
      if (hasValidInventoryLogic) {
        inventoryLogicValid++;
      }
    }
    
    const inventoryTest = {
      name: 'Inventory Availability Logic',
      tested: inventorySample.length,
      valid: inventoryLogicValid,
      successRate: (inventoryLogicValid / inventorySample.length * 100).toFixed(2),
      passed: inventoryLogicValid >= inventorySample.length * 0.95
    };
    
    if (inventoryTest.passed) {
      verificationResults.tests.businessLogicPreservation.passed++;
      console.log(`     ✅ ${inventoryTest.successRate}% (${inventoryTest.valid}/${inventoryTest.tested})`);
    } else {
      verificationResults.tests.businessLogicPreservation.failed++;
      console.log(`     ❌ ${inventoryTest.successRate}% (${inventoryTest.valid}/${inventoryTest.tested})`);
    }
    
    verificationResults.tests.businessLogicPreservation.details.push(inventoryTest);
    
    // Test 4.3: Category normalization
    console.log('   🏷️ Test 4.3: Category normalization logic');
    
    const categoryDistribution = await TargetProduct.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const validCategories = ['rings', 'necklaces', 'earrings', 'bracelets', 'jewelry'];
    const invalidCategories = categoryDistribution.filter(cat => !validCategories.includes(cat._id));
    
    const categoryTest = {
      name: 'Category Normalization Logic',
      totalCategories: categoryDistribution.length,
      validCategories: categoryDistribution.length - invalidCategories.length,
      invalidCategories: invalidCategories.map(c => c._id),
      passed: invalidCategories.length === 0
    };
    
    if (categoryTest.passed) {
      verificationResults.tests.businessLogicPreservation.passed++;
      console.log(`     ✅ All ${categoryTest.totalCategories} categories are normalized`);
    } else {
      verificationResults.tests.businessLogicPreservation.failed++;
      console.log(`     ❌ Found ${invalidCategories.length} invalid categories: ${invalidCategories.map(c => c._id).join(', ')}`);
    }
    
    verificationResults.tests.businessLogicPreservation.details.push(categoryTest);
    
  } catch (error) {
    console.error('   💥 Business logic preservation verification failed:', error.message);
    verificationResults.tests.businessLogicPreservation.failed++;
    verificationResults.summary.criticalIssues.push(`Business logic preservation test failed: ${error.message}`);
  }
}

/**
 * Test: Edge Case Handling
 */
async function verifyEdgeCaseHandling() {
  console.log('\\n🔍 Test Suite 5: Edge Case Handling');
  
  try {
    const TargetProduct = mongoose.model('TargetProduct', ProductSchema, verificationResults.collections.target);
    
    // Test 5.1: Missing image handling
    console.log('   🖼️ Test 5.1: Missing image fallback handling');
    
    const allProducts = await TargetProduct.find({}).lean();
    let validImageHandling = 0;
    
    for (const product of allProducts) {
      // Every product should have a primaryImage (even if placeholder)
      if (product.primaryImage && typeof product.primaryImage === 'string' && product.primaryImage.length > 0) {
        validImageHandling++;
      }
    }
    
    const imageTest = {
      name: 'Missing Image Fallback Handling',
      tested: allProducts.length,
      valid: validImageHandling,
      successRate: (validImageHandling / allProducts.length * 100).toFixed(2),
      passed: validImageHandling === allProducts.length
    };
    
    if (imageTest.passed) {
      verificationResults.tests.edgeCaseHandling.passed++;
      console.log(`     ✅ ${imageTest.successRate}% (${imageTest.valid}/${imageTest.tested})`);
    } else {
      verificationResults.tests.edgeCaseHandling.failed++;
      console.log(`     ❌ ${imageTest.successRate}% (${imageTest.valid}/${imageTest.tested})`);
    }
    
    verificationResults.tests.edgeCaseHandling.details.push(imageTest);
    
    // Test 5.2: Null/undefined field handling
    console.log('   ⭕ Test 5.2: Null/undefined field handling');
    
    let nullFieldsHandled = 0;
    const criticalFields = ['_id', 'name', 'category', 'pricing', 'materialSpecs'];
    
    for (const product of allProducts) {
      const hasNullCriticalFields = criticalFields.some(field => 
        product[field] === null || product[field] === undefined
      );
      
      if (!hasNullCriticalFields) {
        nullFieldsHandled++;
      }
    }
    
    const nullTest = {
      name: 'Null/Undefined Field Handling',
      tested: allProducts.length,
      valid: nullFieldsHandled,
      successRate: (nullFieldsHandled / allProducts.length * 100).toFixed(2),
      passed: nullFieldsHandled === allProducts.length
    };
    
    if (nullTest.passed) {
      verificationResults.tests.edgeCaseHandling.passed++;
      console.log(`     ✅ ${nullTest.successRate}% (${nullTest.valid}/${nullTest.tested})`);
    } else {
      verificationResults.tests.edgeCaseHandling.failed++;
      console.log(`     ❌ ${nullTest.successRate}% (${nullTest.valid}/${nullTest.tested})`);
    }
    
    verificationResults.tests.edgeCaseHandling.details.push(nullTest);
    
    // Test 5.3: Extreme value handling
    console.log('   📊 Test 5.3: Extreme value handling');
    
    const extremeValueChecks = await TargetProduct.aggregate([
      {
        $project: {
          _id: 1,
          hasNegativePrice: { $lt: ['$pricing.basePrice', 0] },
          hasZeroPrice: { $eq: ['$pricing.basePrice', 0] },
          hasExtremePrice: { $gt: ['$pricing.basePrice', 100000] },
          hasInvalidCarat: { 
            $or: [
              { $lt: ['$materialSpecs.stone.carat', 0] },
              { $gt: ['$materialSpecs.stone.carat', 20] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          negativePrice: { $sum: { $cond: ['$hasNegativePrice', 1, 0] } },
          zeroPrice: { $sum: { $cond: ['$hasZeroPrice', 1, 0] } },
          extremePrice: { $sum: { $cond: ['$hasExtremePrice', 1, 0] } },
          invalidCarat: { $sum: { $cond: ['$hasInvalidCarat', 1, 0] } }
        }
      }
    ]);
    
    const extremeValues = extremeValueChecks[0] || { 
      total: allProducts.length, 
      negativePrice: 0, 
      zeroPrice: 0, 
      extremePrice: 0, 
      invalidCarat: 0 
    };
    
    const extremeTest = {
      name: 'Extreme Value Handling',
      tested: extremeValues.total,
      negativePrice: extremeValues.negativePrice,
      zeroPrice: extremeValues.zeroPrice,
      extremePrice: extremeValues.extremePrice,
      invalidCarat: extremeValues.invalidCarat,
      totalIssues: extremeValues.negativePrice + extremeValues.extremePrice + extremeValues.invalidCarat,
      passed: (extremeValues.negativePrice + extremeValues.extremePrice + extremeValues.invalidCarat) === 0
    };
    
    if (extremeTest.passed) {
      verificationResults.tests.edgeCaseHandling.passed++;
      console.log(`     ✅ No extreme value issues found`);
    } else {
      verificationResults.tests.edgeCaseHandling.failed++;
      console.log(`     ❌ Found ${extremeTest.totalIssues} extreme value issues (negative prices: ${extremeTest.negativePrice}, extreme prices: ${extremeTest.extremePrice}, invalid carats: ${extremeTest.invalidCarat})`);
    }
    
    verificationResults.tests.edgeCaseHandling.details.push(extremeTest);
    
  } catch (error) {
    console.error('   💥 Edge case handling verification failed:', error.message);
    verificationResults.tests.edgeCaseHandling.failed++;
    verificationResults.summary.criticalIssues.push(`Edge case handling test failed: ${error.message}`);
  }
}

/**
 * Generate comprehensive verification report
 */
function generateVerificationReport() {
  console.log('\\n📊 Data Integrity Verification Report');
  console.log('='.repeat(60));
  
  // Calculate totals
  Object.keys(verificationResults.tests).forEach(testSuite => {
    const suite = verificationResults.tests[testSuite];
    verificationResults.summary.totalTests += suite.passed + suite.failed;
    verificationResults.summary.passedTests += suite.passed;
    verificationResults.summary.failedTests += suite.failed;
  });
  
  const successRate = (verificationResults.summary.passedTests / verificationResults.summary.totalTests * 100).toFixed(1);
  verificationResults.summary.overallSuccess = verificationResults.summary.failedTests === 0 && verificationResults.summary.criticalIssues.length === 0;
  
  console.log(`📈 Overall Results:`);
  console.log(`   Total Tests: ${verificationResults.summary.totalTests}`);
  console.log(`   Passed: ${verificationResults.summary.passedTests}`);
  console.log(`   Failed: ${verificationResults.summary.failedTests}`);
  console.log(`   Success Rate: ${successRate}%`);
  
  console.log(`\\n📋 Test Suite Results:`);
  Object.entries(verificationResults.tests).forEach(([suiteName, suite]) => {
    const suiteTotal = suite.passed + suite.failed;
    const suiteSuccess = suiteTotal > 0 ? (suite.passed / suiteTotal * 100).toFixed(1) : '100';
    const status = suite.failed === 0 ? '✅' : '❌';
    console.log(`   ${status} ${suiteName}: ${suiteSuccess}% (${suite.passed}/${suiteTotal})`);
  });
  
  if (verificationResults.summary.criticalIssues.length > 0) {
    console.log(`\\n🚨 Critical Issues:`);
    verificationResults.summary.criticalIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
  
  console.log(`\\n🎯 Migration Quality Assessment:`);
  if (verificationResults.summary.overallSuccess) {
    console.log('✅ EXCELLENT: Migration data integrity verified');
    console.log('✅ All tests passed - production ready');
    console.log('✅ CLAUDE_RULES performance compliance maintained');
  } else if (successRate >= 90) {
    console.log('⚠️ GOOD: Minor issues detected');
    console.log('⚠️ Consider addressing failed tests before production');
  } else if (successRate >= 75) {
    console.log('❌ POOR: Significant issues detected');
    console.log('❌ Migration requires fixes before production');
  } else {
    console.log('💥 CRITICAL: Major data integrity issues');
    console.log('💥 Migration has failed - rollback recommended');
  }
  
  return verificationResults;
}

/**
 * Main verification orchestrator
 */
async function runDataIntegrityVerification() {
  console.log('🔍 GenZ Jewelry Platform - Data Integrity Verification');
  console.log('📅 ' + new Date().toISOString());
  console.log('🎯 Target: Verify ProductListDTO migration quality');
  console.log('⚡ Performance Target: <300ms catalog queries (CLAUDE_RULES)');
  console.log('='.repeat(80));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genz-jewelry');
    console.log('✅ Connected to MongoDB');
    
    // Run all verification test suites
    await verifyDataCompleteness();
    await verifyMaterialSpecsAccuracy();
    await verifyPerformanceCompliance();
    await verifyBusinessLogicPreservation();
    await verifyEdgeCaseHandling();
    
    // Generate comprehensive report
    const report = generateVerificationReport();
    
    // Save detailed results
    fs.writeFileSync('./data-integrity-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\\n📄 Detailed report saved to: data-integrity-verification-report.json');
    
    return report;
    
  } catch (error) {
    console.error('\\n💥 Data integrity verification failed:', error);
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
  runDataIntegrityVerification()
    .then(results => {
      process.exit(results.summary.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runDataIntegrityVerification,
  verificationResults
};