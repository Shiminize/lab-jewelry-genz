const fs = require('fs');
const path = require('path');

const SEED_FILE = path.resolve(process.cwd(), 'seed_data', 'production_products.json');
const MAP_FILE = path.resolve(process.cwd(), 'catalog_image_map.json');

function main() {
    if (!fs.existsSync(SEED_FILE) || !fs.existsSync(MAP_FILE)) {
        console.error('Missing seed file or map file.');
        return;
    }

    const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    const imageMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

    // imageMap structure: { "earrings": [url1, url2...], "rings": [...] }

    let updatedCount = 0;

    // Helpers to cycle through images
    const counters = {
        earrings: 0,
        rings: 0,
        necklaces: 0,
        misc: 0
    };

    function getNextImage(category) {
        // Map product category to image map key
        let key = 'misc';
        const catLower = category.toLowerCase();

        if (catLower.includes('earring')) key = 'earrings';
        else if (catLower.includes('ring')) key = 'rings';
        else if (catLower.includes('necklace') || catLower.includes('pendant')) key = 'necklaces';

        const images = imageMap[key] || imageMap['misc'] || [];
        if (images.length === 0) return null;

        const index = counters[key] % images.length;
        counters[key]++;
        return images[index];
    }

    if (Array.isArray(seedData.products)) {
        seedData.products.forEach(product => {
            const newImage = getNextImage(product.category || 'misc');
            if (newImage) {
                // Ensure we have an images object
                if (!product.images) product.images = {};
                product.images.primary = newImage;
                updatedCount++;
            }
        });
    }

    fs.writeFileSync(SEED_FILE, JSON.stringify(seedData, null, 4));
    console.log(`Updated ${updatedCount} products in ${SEED_FILE}`);
}

main();
