const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is not set.');
        console.log('If you intended to use localDb mode, this is now a hard error.');
        process.exit(1);
    }

    console.log(`Connecting to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}...`);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        console.log('✅ Connected successfully to server');

        const dbName = process.env.MONGODB_DB || process.env.DATABASE_NAME || 'glowglitch';
        const db = client.db(dbName);
        const count = await db.collection('products').countDocuments();

        console.log(`✅ Current DB Product Count: ${count}`);

        const seedPath = path.resolve(process.cwd(), 'seed_data', 'production_products.json');
        if (fs.existsSync(seedPath)) {
            const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
            const seedCount = seedData.products?.length || 0;
            console.log(`ℹ️  Seed File Product Count: ${seedCount}`);

            if (count === 0 && seedCount > 0) {
                console.warn('⚠️  Database is empty but seed file has data. You might need to run npm run db:seed');
            } else if (count !== seedCount) {
                console.warn('⚠️  Database count differs from seed file count.');
            } else {
                console.log('✅ Database count matches seed file.');
            }
        } else {
            console.warn('⚠️  Could not find seed_data/production_products.json');
        }

    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await client.close();
    }
}

main();
