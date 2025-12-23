
// MongoDB Performance Indexes for Customization API
// Run this script in MongoDB shell or via Node.js driver

use genzjewelry;

// Create compound indexes for optimal query performance
db.products.createIndex({
  "customizationOptions.jewelryType": 1,
  "customizationOptions.materials": 1,
  "isCustomizable": 1,
  "status": 1
}, { 
  name: "customization_core",
  background: true 
});

db.products.createIndex({
  "customizationOptions.materials.metal": 1,
  "customizationOptions.materials.stone": 1,
  "customizationOptions.materials.carat": 1,
  "status": 1
}, { 
  name: "material_filtering",
  background: true 
});

db.products.createIndex({
  "analytics.popularCombinations": 1,
  "customizationOptions.jewelryType": 1,
  "createdAt": -1
}, { 
  name: "popular_configs",
  background: true 
});

db.products.createIndex({
  "customizerAssets.sequenceId": 1,
  "customizerAssets.materialId": 1,
  "customizerAssets.quality": 1
}, { 
  name: "sequence_lookup",
  background: true 
});

db.products.createIndex({
  "performance.lastResponseTime": 1,
  "performance.averageResponseTime": 1,
  "updatedAt": -1
}, { 
  name: "performance_monitoring",
  background: true 
});

// Verify index creation
db.products.getIndexes();

// Performance statistics
db.products.stats();
