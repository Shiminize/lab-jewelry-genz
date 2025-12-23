
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = new PrismaClient();

// URL for the Necklaces sample (reusing for Pendants as they are similar and no specific sample was provided)
const NECKLACE_SAMPLE_URL = 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766401169/glowglitch/categories/necklaces/sample.jpg';

async function main() {
    console.log('[Setup] Optimizing Pendants Pendants...');

    const result = await prisma.product.updateMany({
        where: {
            category: {
                equals: 'Pendants',
                mode: 'insensitive'
            }
        },
        data: {
            heroImage: NECKLACE_SAMPLE_URL,
            gallery: [NECKLACE_SAMPLE_URL]
        }
    });

    console.log(`✅ Updated ${result.count} Pendants to use the Necklaces sample image.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
