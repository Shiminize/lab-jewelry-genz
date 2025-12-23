const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const CATALOG_DIR = path.join(process.cwd(), 'public', 'images', 'catalog');
const MAP_FILE = path.join(process.cwd(), 'catalog_image_map.json');

// Simplified category detection based on filename logic found in product names
function detectCategory(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('ear') || lower.includes('stud') || lower.includes('hoop')) return 'earrings';
    if (lower.includes('neck') || lower.includes('pendant') || lower.includes('chain')) return 'necklaces';
    if (lower.includes('ring') || lower.includes('band')) return 'rings';
    return 'misc';
}

function getAllImages(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllImages(filePath, fileList);
        } else {
            if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

async function main() {
    console.log(`Scanning ${CATALOG_DIR}...`);
    const allImages = getAllImages(CATALOG_DIR);
    console.log(`Found ${allImages.length} images.`);

    const mapping = {};

    for (const imagePath of allImages) {
        const filename = path.basename(imagePath);
        const category = detectCategory(filename);
        const nameWithoutExt = path.basename(filename, path.extname(filename));

        // Structure: glowglitch/categories/[category]/[filename_clean]
        const publicId = `glowglitch/categories/${category}/${nameWithoutExt}`;

        console.log(`Uploading ${filename} -> ${publicId}`);

        try {
            const result = await cloudinary.uploader.upload(imagePath, {
                public_id: publicId,
                folder: `glowglitch/categories/${category}`,
                overwrite: true
            });

            // Store mapping: Category -> Array of URLs
            if (!mapping[category]) mapping[category] = [];
            mapping[category].push(result.secure_url);

            console.log(`✅ Uploaded: ${result.secure_url}`);
        } catch (e) {
            console.error(`❌ Error uploading ${filename}:`, e.message);
        }
    }

    fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Mapping saved to ${MAP_FILE}`);
}

main();
