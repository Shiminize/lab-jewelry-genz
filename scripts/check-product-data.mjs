import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'glowglitch';

const client = new MongoClient(uri);
await client.connect();
const col = client.db(dbName).collection('products');

const docs = await col.find({ price: { $lt: 300 } }).toArray();

console.log('Products under $300:');
docs.forEach(doc => {
  console.log(`\nSKU: ${doc.sku}`);
  console.log(`  title: ${doc.title}`);
  console.log(`  name: ${doc.name}`);
  console.log(`  price: ${doc.price}`);
  console.log(`  imageUrl: ${doc.imageUrl}`);
  console.log(`  image: ${doc.image}`);
});

console.log(`\nTotal: ${docs.length} products`);

await client.close();
