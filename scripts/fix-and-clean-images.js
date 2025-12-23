
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

const SAMPLES = [
    {
        category: 'Earrings',
        filePath: 'Public/images/category/earrings/earing_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/earrings/sample'
    },
    {
        category: 'Necklaces',
        filePath: 'Public/images/category/necklaces/necklaces_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/necklaces/sample'
    },
    {
        category: 'Rings',
        filePath: 'Public/images/category/rings/ring_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/rings/sample'
    }
];

async function main() {
    console.log('[Fix] Starting Clean Image Upload...');

    const urlMap = {};

    for (const sample of SAMPLES) {
        const fullPath = path.join(process.cwd(), sample.filePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ File not found: ${fullPath}`);
            continue;
        }

        try {
            console.log(`Uploading ${sample.category} to ${sample.publicId}...`);
            // NOTE: Removed 'folder' option to prevent duplication. public_id contains the full path.
            const result = await cloudinary.uploader.upload(fullPath, {
                public_id: sample.publicId,
                overwrite: true
            });
            urlMap[sample.category] = result.secure_url;
            console.log(`✅ Fixed URL: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Failed ${sample.category}:`, error.message);
        }
    }

    // Update DB
    console.log('\n[Fix] Updating Database...');

    // Rings
    if (urlMap['Rings']) {
        await prisma.product.updateMany({
            where: { category: { equals: 'Rings', mode: 'insensitive' } },
            data: { heroImage: urlMap['Rings'], gallery: [urlMap['Rings']] }
        });
        console.log('Updated Rings.');
    }

    // Earrings
    if (urlMap['Earrings']) {
        await prisma.product.updateMany({
            where: { category: { equals: 'Earrings', mode: 'insensitive' } },
            data: { heroImage: urlMap['Earrings'], gallery: [urlMap['Earrings']] }
        });
        console.log('Updated Earrings.');
    }

    // Necklaces AND Pendants (using Necklace image)
    if (urlMap['Necklaces']) {
        await prisma.product.updateMany({
            where: { category: { in: ['Necklaces', 'Pendants'], mode: 'insensitive' } },
            data: { heroImage: urlMap['Necklaces'], gallery: [urlMap['Necklaces']] }
        });
        console.log('Updated Necklaces & Pendants.');
    }

    console.log('[Fix] Complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
