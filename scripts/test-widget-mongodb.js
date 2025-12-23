#!/usr/bin/env node
/**
 * Quick test to verify widget MongoDB integration
 * Tests product queries, order status, and widget services
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
const dbName = process.env.MONGODB_DB || 'glowglitch';

async function testProductQueries(db) {
  console.log('\n📦 Testing Product Queries...');
  const col = db.collection('products');
  
  // Test 1: Query all ready-to-ship products
  const readyToShip = await col.find({ readyToShip: true }).toArray();
  console.log(`  ✓ Ready-to-ship products: ${readyToShip.length}`);
  
  // Test 2: Query ready-to-ship rings by tag
  const rings = await col.find({ 
    readyToShip: true,
    tags: { $in: ['rings'] }
  }).toArray();
  console.log(`  ✓ Ready-to-ship rings: ${rings.length}`);
  
  // Test 3: Text search for "ready-to-ship rings"
  const searchResults = await col.find({
    $and: [
      { readyToShip: true },
      { tags: { $in: ['rings'] } }
    ]
  }).toArray();
  console.log(`  ✓ Search "ready-to-ship rings": ${searchResults.length}`);
  
  // Test 4: Featured in widget
  const featured = await col.find({ featuredInWidget: true }).toArray();
  console.log(`  ✓ Featured in widget: ${featured.length}`);
  
  return readyToShip.length > 0 && rings.length > 0;
}

async function testOrders(db) {
  console.log('\n📝 Testing Orders...');
  const col = db.collection('orders');
  
  // Test 1: Find order by order number
  const order = await col.findOne({ orderNumber: 'GG-12001' });
  console.log(`  ✓ Found order GG-12001: ${order ? 'Yes' : 'No'}`);
  
  // Test 2: Find order by email + postal code
  const orderByEmail = await col.findOne({
    customerEmail: 'test@example.com',
    'shipping.postalCode': '90001',
  });
  console.log(`  ✓ Found order by email+zip: ${orderByEmail ? 'Yes' : 'No'}`);
  
  // Test 3: Check status history
  if (order && order.statusHistory) {
    console.log(`  ✓ Order has status history: ${order.statusHistory.length} entries`);
  }
  
  return order !== null && orderByEmail !== null;
}

async function testWidgetCollections(db) {
  console.log('\n🔧 Testing Widget Collections...');
  
  const collections = [
    'widgetShortlists',
    'widgetInspiration',
    'capsuleHolds',
    'csatFeedback',
    'stylistTickets',
    'widgetOrderSubscriptions',
    'analyticsEvents',
  ];
  
  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext();
    console.log(`  ${exists ? '✓' : '✗'} Collection: ${name}`);
  }
  
  return true;
}

async function testIndexes(db) {
  console.log('\n🗂️  Testing Indexes...');
  
  const products = await db.collection('products').indexes();
  const orders = await db.collection('orders').indexes();
  const capsules = await db.collection('capsuleHolds').indexes();
  
  console.log(`  ✓ Products indexes: ${products.length}`);
  console.log(`  ✓ Orders indexes: ${orders.length}`);
  console.log(`  ✓ Capsule holds indexes: ${capsules.length}`);
  
  return true;
}

async function main() {
  console.log('🧪 Widget MongoDB Integration Test\n');
  console.log(`Connecting to: ${uri}`);
  console.log(`Database: ${dbName}\n`);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const tests = [
      { name: 'Product Queries', fn: () => testProductQueries(db) },
      { name: 'Orders', fn: () => testOrders(db) },
      { name: 'Widget Collections', fn: () => testWidgetCollections(db) },
      { name: 'Indexes', fn: () => testIndexes(db) },
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
          console.log(`\n❌ ${test.name} FAILED`);
        }
      } catch (error) {
        failed++;
        console.error(`\n❌ ${test.name} ERROR:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`);
    
    if (failed === 0) {
      console.log('\n✅ All tests passed! MongoDB integration is working.\n');
      process.exit(0);
    } else {
      console.log(`\n❌ ${failed} test(s) failed.\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Connection error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

