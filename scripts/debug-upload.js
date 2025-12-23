const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagePath = 'public/images/catalog/Sora/home/home_collection_Sustainable_3x2_stone.webp';

async function testUpload() {
    const filename = path.basename(imagePath);
    const nameWithoutExt = path.basename(filename, path.extname(filename));

    // Test 1: Explicit public_id with path, NO folder
    const publicId1 = `glowglitch/categories/misc/${nameWithoutExt}`;
    console.log(`\n--- Test 1: public_id='${publicId1}', no folder ---`);
    try {
        const res1 = await cloudinary.uploader.upload(imagePath, {
            public_id: publicId1,
            overwrite: true
        });
        console.log('Result Public ID:', res1.public_id);
        console.log('Result URL:', res1.secure_url);
    } catch (e) { console.error(e.message); }

    // Test 2: Folder + Filename (User's pattern in script was public_id WITH path AND folder)
    console.log(`\n--- Test 2: public_id='${publicId1}', folder='glowglitch/categories/misc' ---`);
    try {
        const res2 = await cloudinary.uploader.upload(imagePath, {
            public_id: publicId1,
            folder: 'glowglitch/categories/misc', // Duplicate path?
            overwrite: true
        });
        console.log('Result Public ID:', res2.public_id);
        console.log('Result URL:', res2.secure_url);
    } catch (e) { console.error(e.message); }
}

testUpload();
