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

function detectCategory(filename) {
    const lower = filename.toLowerCase();
    // 'studio' contains 'stud', so check it first to avoid miscategorizing as earrings
    if (lower.includes('studio')) return 'misc';

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

async function uploadImage(imagePath) {
    const filename = path.basename(imagePath);
    const category = detectCategory(filename);
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const publicId = `glowglitch/categories/${category}/${nameWithoutExt}`;

    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            public_id: publicId,
            overwrite: true,
            use_filename: true,
            unique_filename: false
        });
        console.log(`✅ Uploaded: ${publicId}`);
        return result.secure_url;
    } catch (e) {
        console.error(`❌ Error uploading ${filename}:`, e.message);
        return null;
    }
}

async function main() {
    console.log(`Scanning ${CATALOG_DIR}...`);
    const allImages = getAllImages(CATALOG_DIR);
    console.log(`Found ${allImages.length} images.`);

    const CONCURRENCY = 10;
    const mapping = {};

    for (let i = 0; i < allImages.length; i += CONCURRENCY) {
        const chunk = allImages.slice(i, i + CONCURRENCY);
        const results = await Promise.all(chunk.map(async img => {
            const url = await uploadImage(img);
            if (url) {
                const filename = path.basename(img);
                const category = detectCategory(filename);
                return { category, url };
            }
            return null;
        }));

        results.forEach(res => {
            if (res) {
                if (!mapping[res.category]) mapping[res.category] = [];
                mapping[res.category].push(res.url);
            }
        });

        console.log(`Processed ${Math.min(i + CONCURRENCY, allImages.length)} / ${allImages.length}`);
    }

    const mapFile = path.join(process.cwd(), 'catalog_image_map.json');
    fs.writeFileSync(mapFile, JSON.stringify(mapping, null, 2));
    console.log(`Mapping saved to ${mapFile}`);
    console.log('All uploads complete.');
}

main();
