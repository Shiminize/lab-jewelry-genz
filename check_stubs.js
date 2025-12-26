
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stubIds = [
    'aurora-ring-solaris',
    'aurora-ear-constellation',
    'aurora-necklace-lumina',
    'aurora-rose-band',
    'aurora-rose-lariat'
];

async function checkProducts() {
    console.log('Checking for stub products in DB...');
    const products = await prisma.product.findMany({
        where: {
            sku: { in: stubIds }
        }
    });

    console.log(`Found ${products.length} out of ${stubIds.length} stub products in DB.`);
    products.forEach(p => console.log(`- Found: ${p.name} (SKU: ${p.sku}, Slug: ${p.slug})`));

    const foundSkus = products.map(p => p.sku);
    const missing = stubIds.filter(id => !foundSkus.includes(id));
    if (missing.length > 0) {
        console.log('Missing stub products in DB:');
        missing.forEach(id => console.log(`- ${id}`));
    }
}

checkProducts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
