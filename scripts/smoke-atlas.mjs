// scripts/smoke-atlas.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'glowglitch';

if (!uri) throw new Error('MONGODB_URI missing');

const c = new MongoClient(uri);
await c.connect();
const col = c.db(dbName).collection('products');
const count = await col.estimatedDocumentCount();
console.log(JSON.stringify({ ok: true, count }, null, 2));
await c.close();

