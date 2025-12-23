import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
await client.connect();
const col = client.db('glowglitch').collection('products');

const docs = await col.find(
  { price: { $lt: 300 } },
  { projection: { sku:1,title:1,name:1,price:1,currency:1,imageUrl:1,image:1,category:1,readyToShip:1,tags:1,shippingPromise:1,badges:1,featuredInWidget:1,updatedAt:1 } }
).toArray();

console.log('Raw MongoDB docs:');
docs.forEach(doc => {
  console.log(`\nSKU: ${doc.sku}`);
  console.log(`  title field: ${JSON.stringify(doc.title)}`);
  console.log(`  name field: ${JSON.stringify(doc.name)}`);
  console.log(`  Fallback result: ${doc.title || doc.name || 'Untitled Product'}`);
});

await client.close();
