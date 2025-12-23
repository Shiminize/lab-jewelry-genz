const fs = require('fs');
const path = require('path');

const CLOUD_NAME = 'dgyf0osrx'; // Extracted from logs
const CATALOG_DIR = path.join(process.cwd(), 'public', 'images', 'catalog');
const MAP_FILE = path.join(process.cwd(), 'catalog_image_map.json');

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

function main() {
    console.log(`Scanning ${CATALOG_DIR}...`);
    const allImages = getAllImages(CATALOG_DIR);
    console.log(`Found ${allImages.length} images.`);

    const mapping = {};

    for (const imagePath of allImages) {
        const filename = path.basename(imagePath);
        const category = detectCategory(filename);
        const nameWithoutExt = path.basename(filename, path.extname(filename));
        const ext = path.extname(filename);

        // Construct simulated Cloudinary URL
        // https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/[category]/[nameWithoutExt][ext]
        // Note: Adding v1 as a dummy version.
        const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/glowglitch/categories/${category}/${nameWithoutExt}${ext}`;

        if (!mapping[category]) mapping[category] = [];
        mapping[category].push(url);
    }

    fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Mapping saved to ${MAP_FILE}`);
}

main();
