const fs = require('fs');
const path = require('path');

const MAP_FILE = path.resolve(process.cwd(), 'catalog_image_map.json');
const CONTENT_FILES = [
    path.resolve(process.cwd(), 'src/content/homepage.ts'),
    path.resolve(process.cwd(), 'src/content/discover.ts')
];

function main() {
    if (!fs.existsSync(MAP_FILE)) {
        console.error('Missing map file.');
        return;
    }

    // 1. Build Lookup Map: Filename -> URL
    const imageMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    const lookup = {};

    Object.values(imageMap).flat().forEach(url => {
        const filename = path.basename(url);
        // Store both exact match and potentially uri-decoded versions if needed, 
        // but for now simple basename match should suffice.
        lookup[filename] = url;
    });

    console.log(`Loaded ${Object.keys(lookup).length} images into lookup map.`);

    // 2. Process Files
    CONTENT_FILES.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modifications = 0;

        // Regex to find paths starting with /images/catalog/
        // Captures the full path
        content = content.replace(/['"](\/images\/catalog\/[^'"]+)['"]/g, (match, localPath) => {
            const filename = path.basename(localPath);

            // Check if we have a cloud URL for this filename
            if (lookup[filename]) {
                modifications++;
                // Check if the original string used single or double quotes to preserve style
                const quote = match[0];
                return `${quote}${lookup[filename]}${quote}`;
            } else {
                console.warn(`No Cloudinary URL found for: ${filename} (path: ${localPath})`);
                return match; // Return unchanged
            }
        });

        if (modifications > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${modifications} paths in ${path.basename(filePath)}`);
        } else {
            console.log(`No changes needed for ${path.basename(filePath)}`);
        }
    });
}

main();
