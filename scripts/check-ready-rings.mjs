import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
await client.connect();
const col = client.db('glowglitch').collection('products');

const docs = await col.find({ readyToShip: true, category: 'ring' }).toArray();

console.log(`Total ready-to-ship rings: ${docs.length}`);
docs.forEach(doc => {
  console.log(`\n${doc.sku}: ${doc.title || doc.name}`);
  console.log(`  Price: $${doc.price}`);
  console.log(`  Featured: ${doc.featuredInWidget}`);
});

await client.close();
