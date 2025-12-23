
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: {
            name: true,
            category: true,
            heroImage: true
        },
        orderBy: { category: 'asc' }
    });

    console.log('--- Current Product Image Links ---');
    products.forEach(p => {
        console.log(`[${p.category}] ${p.name}: ${p.heroImage}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
