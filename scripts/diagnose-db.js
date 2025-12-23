
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback

const prisma = new PrismaClient();

async function main() {
    console.log('[Diagnosis] Connecting to database...');
    try {
        const products = await prisma.product.findMany({
            select: {
                name: true,
                sku: true,
                category: true,
                heroImage: true
            },
            take: 5
        });

        console.log(`[Diagnosis] Connection successful! Found ${products.length} sample products.`);

        if (products.length === 0) {
            console.warn('[Diagnosis] Warning: Product table is empty.');
        } else {
            console.log('\n--- Sample Product Data ---');
            products.forEach(p => {
                console.log(`\nName: ${p.name}`);
                console.log(`SKU: ${p.sku}`);
                console.log(`Category: ${p.category}`);
                console.log(`Image URL: ${p.heroImage}`);
            });
        }

    } catch (error) {
        console.error('[Diagnosis] FATAL: Database connection failed.');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
