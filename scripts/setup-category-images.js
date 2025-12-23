
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
        category: 'Bracelets',
        filePath: 'Public/images/category/bracelets/bracelet_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/bracelets/sample'
    },
    {
        category: 'Earrings',
        filePath: 'Public/images/category/earrings/earing_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/earrings/sample'
    },
    {
        category: 'Necklaces',
        filePath: 'Public/images/category/necklaces/necklaces_sample_1600X1600.jpg',
        publicId: 'glowglitch/categories/necklaces/sample'
    }
];

async function main() {
    console.log('[Setup] Starting Category Image Optimization...');

    // 1. Upload Samples
    const urlMap = {}; // Category -> URL

    for (const sample of SAMPLES) {
        const fullPath = path.join(process.cwd(), sample.filePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ File not found: ${sample.filePath}`);
            continue;
        }

        try {
            console.log(`Uploading ${sample.category} sample...`);
            const result = await cloudinary.uploader.upload(fullPath, {
                public_id: sample.publicId,
                overwrite: true,
                folder: 'glowglitch/categories'
            });
            urlMap[sample.category] = result.secure_url;
            console.log(`✅ Uploaded: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${sample.category}:`, error.message);
        }
    }

    // 2. Update Database
    console.log('\n[Setup] Updating Database Links...');

    for (const [category, url] of Object.entries(urlMap)) {
        // Update all products in this category
        const result = await prisma.product.updateMany({
            where: {
                category: {
                    equals: category,
                    mode: 'insensitive' // key for case-insensitive match if needed
                }
            },
            data: {
                heroImage: url,
                gallery: [url] // Reset gallery to just this image for now
            }
        });

        console.log(`Updated ${result.count} products in '${category}' with new image.`);
    }

    // 3. Handle Rings (Fallback if needed, or just leave as is if user didn't provide one)
    // The user didn't provide a Ring sample, so we skip it or maybe warn?
    // We'll just leave it for now to avoid breaking existing ring data if valid.

    console.log('\n[Setup] Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
