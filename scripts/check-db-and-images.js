
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from .env.local and .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Database Connection...');
        const count = await prisma.product.count();
        console.log(`Connection Successful! Found ${count} products.`);

        // Group by category to see if some categories are broken
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: true,
        });

        console.log('\nCategories found:', categories);

        for (const cat of categories) {
            console.log(`\nChecking category: ${cat.category}`);
            const product = await prisma.product.findFirst({
                where: { category: cat.category },
                select: { name: true, heroImage: true }
            });
            console.log(`  Sample: ${product.name}`);
            console.log(`  Image:  ${product.heroImage}`);
        }

    } catch (e) {
        console.error('Connection Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
