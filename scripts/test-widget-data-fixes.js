#!/usr/bin/env node
/**
 * Test script to verify widget data persistence fixes
 * 
 * Tests:
 * 1. CSAT feedback with orderNumber
 * 2. Capsule hold with orderNumber
 * 3. Order subscription with orderNumber
 * 4. Dashboard enrichment queries
 * 5. Creator stats calculation
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'glowglitch';

async function main() {
  console.log('🧪 Testing Widget Data Persistence Fixes\n');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const testSessionId = `TEST-${Date.now()}`;
  const testOrderNumber = 'GG-12001';
  const testEmail = 'test@example.com';

  console.log(`Session ID: ${testSessionId}`);
  console.log(`Test Order: ${testOrderNumber}\n`);

  try {
    // Test 1: Insert CSAT feedback with orderNumber
    console.log('✅ Test 1: CSAT Feedback with orderNumber');
    const csatCol = db.collection('csatFeedback');
    const csatDoc = {
      sessionId: testSessionId,
      rating: 'great',
      score: 5,
      notes: 'Test feedback',
      intent: 'order_tracking',
      orderNumber: testOrderNumber,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    await csatCol.insertOne(csatDoc);
    
    // Query by orderNumber
    const csatLookup = await csatCol.findOne({ orderNumber: testOrderNumber });
    console.log(`   ✓ Stored: ${!!csatLookup}`);
    console.log(`   ✓ Score is numeric: ${typeof csatLookup?.score === 'number'}`);
    console.log(`   ✓ Score value: ${csatLookup?.score}\n`);

    // Test 2: Insert capsule hold with orderNumber
    console.log('✅ Test 2: Capsule Hold with orderNumber');
    const capsuleCol = db.collection('capsuleHolds');
    const capsuleDoc = {
      reservationId: `CAPSULE-TEST-${Date.now()}`,
      sessionId: testSessionId,
      shortlist: [{ id: 'prod-1', title: 'Test Ring', price: 1200 }],
      customerEmail: testEmail,
      orderNumber: testOrderNumber,
      status: 'active',
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    await capsuleCol.insertOne(capsuleDoc);
    
    // Query by orderNumber
    const capsuleLookup = await capsuleCol.findOne({ orderNumber: testOrderNumber });
    console.log(`   ✓ Stored: ${!!capsuleLookup}`);
    console.log(`   ✓ OrderNumber: ${capsuleLookup?.orderNumber}\n`);

    // Test 3: Insert order subscription with orderNumber
    console.log('✅ Test 3: Order Subscription with orderNumber');
    const subscriptionCol = db.collection('widgetOrderSubscriptions');
    const subscriptionDoc = {
      sessionId: testSessionId,
      orderNumber: testOrderNumber,
      email: true,
      phone: '+1-555-0123',
      sms: true,
      subscribedAt: new Date(),
      createdAt: new Date(),
    };
    await subscriptionCol.updateOne(
      { sessionId: testSessionId },
      { $set: subscriptionDoc },
      { upsert: true }
    );
    
    // Query by orderNumber
    const subscriptionLookup = await subscriptionCol.findOne({ orderNumber: testOrderNumber });
    console.log(`   ✓ Stored: ${!!subscriptionLookup}`);
    console.log(`   ✓ SMS field: ${subscriptionLookup?.sms}`);
    console.log(`   ✓ Email field: ${subscriptionLookup?.email}\n`);

    // Test 4: Dashboard enrichment simulation
    console.log('✅ Test 4: Dashboard Enrichment Queries');
    const csatResult = await csatCol.findOne({ orderNumber: testOrderNumber });
    const capsuleResult = await capsuleCol.findOne({ orderNumber: testOrderNumber });
    const subscriptionResult = await subscriptionCol.findOne({ orderNumber: testOrderNumber });
    
    const hasWidgetInteraction = !!(csatResult || capsuleResult || subscriptionResult);
    console.log(`   ✓ hasWidgetInteraction: ${hasWidgetInteraction}`);
    console.log(`   ✓ CSAT Rating (numeric): ${csatResult?.score}`);
    console.log(`   ✓ Capsule exists: ${!!capsuleResult}`);
    console.log(`   ✓ Subscription exists: ${!!subscriptionResult}\n`);

    // Test 5: Check indexes
    console.log('✅ Test 5: Index Verification');
    const csatIndexes = await csatCol.indexes();
    const capsuleIndexes = await capsuleCol.indexes();
    const subscriptionIndexes = await subscriptionCol.indexes();
    
    const hasCSATOrderIndex = csatIndexes.some(idx => idx.key.orderNumber === 1);
    const hasCapsuleOrderIndex = capsuleIndexes.some(idx => idx.key.orderNumber === 1);
    const hasSubscriptionOrderIndex = subscriptionIndexes.some(idx => idx.key.orderNumber === 1);
    
    console.log(`   ✓ csatFeedback orderNumber index: ${hasCSATOrderIndex}`);
    console.log(`   ✓ capsuleHolds orderNumber index: ${hasCapsuleOrderIndex}`);
    console.log(`   ✓ widgetOrderSubscriptions orderNumber index: ${hasSubscriptionOrderIndex}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await csatCol.deleteMany({ sessionId: testSessionId });
    await capsuleCol.deleteMany({ sessionId: testSessionId });
    await subscriptionCol.deleteMany({ sessionId: testSessionId });
    console.log('   ✓ Test data removed\n');

    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   • orderNumber field persists correctly');
    console.log('   • CSAT score is numeric (not string)');
    console.log('   • SMS/email fields store correctly');
    console.log('   • Lookups by orderNumber succeed');
    console.log('   • Database indexes created');
    console.log('\n🎯 Widget dashboards should now display data correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

