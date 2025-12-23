/* Create widget session collections with indexes */
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
  const dbName = process.env.MONGODB_DB || 'glowglitch';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);

    // Create collections if they don't exist
    // Note: capsuleHolds and widgetInspiration removed (recommendation-only scope)
    const collections = [
      'widgetShortlists',
      'csatFeedback',
      'stylistTickets',
      'widgetOrderSubscriptions',
      'analyticsEvents',
    ];

    for (const collName of collections) {
      const exists = await db.listCollections({ name: collName }).hasNext();
      if (!exists) {
        await db.createCollection(collName);
        console.log(`✓ Created collection: ${collName}`);
      } else {
        console.log(`  Collection exists: ${collName}`);
      }
    }

    // Create indexes
    console.log('\nCreating indexes...');

    // widgetShortlists indexes
    await db.collection('widgetShortlists').createIndex({ sessionId: 1 }, { unique: true });
    await db.collection('widgetShortlists').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('widgetShortlists').createIndex({ createdAt: -1 });
    console.log('✓ widgetShortlists indexes');

    // csatFeedback indexes
    await db.collection('csatFeedback').createIndex({ sessionId: 1 });
    await db.collection('csatFeedback').createIndex({ score: 1 });
    await db.collection('csatFeedback').createIndex({ timestamp: -1 });
    await db.collection('csatFeedback').createIndex({ intent: 1 });
    console.log('✓ csatFeedback indexes');

    // stylistTickets indexes
    await db.collection('stylistTickets').createIndex({ ticketId: 1 }, { unique: true });
    await db.collection('stylistTickets').createIndex({ sessionId: 1 });
    await db.collection('stylistTickets').createIndex({ status: 1 });
    await db.collection('stylistTickets').createIndex({ customerEmail: 1 });
    await db.collection('stylistTickets').createIndex({ createdAt: -1 });
    console.log('✓ stylistTickets indexes');

    // widgetOrderSubscriptions indexes
    await db.collection('widgetOrderSubscriptions').createIndex({ sessionId: 1 }, { unique: true });
    await db.collection('widgetOrderSubscriptions').createIndex({ orderId: 1 });
    await db.collection('widgetOrderSubscriptions').createIndex({ email: 1 });
    await db.collection('widgetOrderSubscriptions').createIndex({ subscribedAt: -1 });
    console.log('✓ widgetOrderSubscriptions indexes');

    // analyticsEvents indexes
    await db.collection('analyticsEvents').createIndex({ sessionId: 1 });
    await db.collection('analyticsEvents').createIndex({ event: 1 });
    await db.collection('analyticsEvents').createIndex({ timestamp: -1 });
    await db.collection('analyticsEvents').createIndex({ intent: 1 });
    console.log('✓ analyticsEvents indexes');

    console.log('\n✅ All widget collections and indexes created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

