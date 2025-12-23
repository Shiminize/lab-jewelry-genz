// scripts/test-provider.mjs
// Direct MongoDB test of the provider logic

import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'glowglitch';

if (!uri) throw new Error('MONGODB_URI missing');

const client = new MongoClient(uri);
await client.connect();
const col = client.db(dbName).collection('products');

// Simulate the provider's listProducts logic
const and = [];
and.push({ category: 'ring' });
and.push({ readyToShip: true });
and.push({ featuredInWidget: true }); // Curated gate

const query = { $and: and };
const cur = col.find(query, {
  projection: { sku:1, title:1, price:1, currency:1, imageUrl:1, category:1, readyToShip:1, tags:1, shippingPromise:1, badges:1, featuredInWidget:1 },
  sort: { updatedAt: -1, _id: -1 },
  limit: 3,
});

const docs = await cur.toArray();

// Map to Product format
const items = docs.map(doc => ({
  sku: doc.sku ?? doc._id?.toString(),
  title: doc.title,
  price: doc.price,
}));

console.log(JSON.stringify({ ok: true, sample: items }, null, 2));

await client.close();

