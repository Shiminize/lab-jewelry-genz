
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const glob = require('glob'); // We might need to install glob if not present, but let's try native traversal or list specific files from json.

// Load env
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGES_DIR = path.join(process.cwd(), 'public');
const MAP_FILE = path.join(process.cwd(), 'image_map.json');

// Helper to find all images recursively
function getAllImages(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllImages(filePath, fileList);
        } else {
            if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

async function uploadImages() {
    const productsDir = path.join(IMAGES_DIR, 'images', 'products');
    if (!fs.existsSync(productsDir)) {
        console.error('Products directory not found:', productsDir);
        return;
    }

    const allImages = getAllImages(productsDir);
    console.log(`Found ${allImages.length} images to upload...`);

    const imageMap = {};

    for (const imagePath of allImages) {
        // Relative path for the key (e.g., "/images/products/static/...")
        const relativePath = imagePath.replace(process.cwd() + '/public', '');

        // Create a public ID for Cloudinary (cleaner url)
        // e.g. "glowglitch/products/static/chaos-ring/hero"
        const nameWithoutExt = path.basename(imagePath, path.extname(imagePath));
        const parentDir = path.dirname(imagePath).split(path.sep).pop();
        const publicId = `glowglitch/products/${parentDir}/${nameWithoutExt}`;

        try {
            console.log(`Uploading: ${relativePath} -> ${publicId}`);
            const result = await cloudinary.uploader.upload(imagePath, {
                public_id: publicId,
                folder: 'glowglitch/products',
                overwrite: false
            });

            imageMap[relativePath] = result.secure_url;
            console.log(`✅ Success: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Failed: ${relativePath}`, error.message);
        }
    }

    fs.writeFileSync(MAP_FILE, JSON.stringify(imageMap, null, 2));
    console.log(`\nMapping saved to ${MAP_FILE}`);
}

uploadImages();
