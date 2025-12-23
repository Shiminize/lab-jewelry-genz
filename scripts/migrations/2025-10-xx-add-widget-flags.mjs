import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
const dbName = process.env.MONGODB_DB || 'glowglitch';
const client = new MongoClient(uri);
const now = new Date();

async function run() {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('products');

  await col.updateMany(
    { category: 'ring', readyToShip: true, $or: [{ featuredInWidget: { $exists: false } }, { featuredInWidget: null }] },
    { $set: { featuredInWidget: true, updatedAt: now } }
  );

  await col.updateMany(
    { tags: { $exists: false } },
    { $set: { tags: ['seeded'], updatedAt: now } }
  );

  await col.updateMany(
    { category: 'ring', readyToShip: true },
    { $addToSet: { tags: { $each: ['ready-to-ship', 'ready-to-ship rings'] } }, $set: { updatedAt: now } }
  );

  console.log('Migration complete.');
  await client.close();
}
run().catch(err => { console.error(err); process.exit(1); });
