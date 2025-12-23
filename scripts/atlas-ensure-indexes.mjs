import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'glowglitch';
if (!uri) throw new Error('MONGODB_URI missing');
const client = new MongoClient(uri);
await client.connect();
const col = client.db(dbName).collection('products');

  // Ensure indexes, ignoring conflicts if they already exist
  try { await col.createIndex({ sku: 1 }, { unique: true }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  try { await col.createIndex({ category: 1, readyToShip: 1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  try { await col.createIndex({ tags: 1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  try { await col.createIndex({ featuredInWidget: 1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  try { await col.createIndex({ updatedAt: -1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  try { await col.createIndex({ priceBand: 1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  // Price index for sorting and filtering performance
  try { await col.createIndex({ price: 1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  // Compound index for featured products with price sorting
  try { await col.createIndex({ featuredInWidget: -1, price: 1, updatedAt: -1 }); } catch (e) { if (e.code !== 86 && e.code !== 85) throw e; }
  // Text index for full-text search
  try { await col.createIndex({ title: 'text', description: 'text' }); } catch {}
  console.log('Indexes ensured.');
  await client.close();

