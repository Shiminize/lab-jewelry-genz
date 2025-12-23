
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const SAMPLE = {
    category: 'Rings',
    filePath: 'Public/images/category/rings/ring_sample_1600X1600.jpg',
    publicId: 'glowglitch/categories/rings/sample'
};

async function main() {
    console.log('[Setup] Starting Rings Image Optimization...');

    const fullPath = path.join(process.cwd(), SAMPLE.filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ File not found: ${SAMPLE.filePath}`);
        return;
    }

    let secureUrl = '';
    try {
        console.log(`Uploading Rings sample...`);
        const result = await cloudinary.uploader.upload(fullPath, {
            public_id: SAMPLE.publicId,
            overwrite: true,
            folder: 'glowglitch/categories'
        });
        secureUrl = result.secure_url;
        console.log(`✅ Uploaded: ${secureUrl}`);
    } catch (error) {
        console.error(`❌ Failed to upload Rings sample:`, error.message);
        return;
    }

    // Update Database
    console.log('\n[Setup] Updating Database Links for Rings...');

    const result = await prisma.product.updateMany({
        where: {
            category: {
                equals: 'Rings',
                mode: 'insensitive'
            }
        },
        data: {
            heroImage: secureUrl,
            gallery: [secureUrl]
        }
    });

    console.log(`Updated ${result.count} products in 'Rings' with new image.`);
    console.log('[Setup] Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
