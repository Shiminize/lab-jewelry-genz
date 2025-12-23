
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function cleanup() {
    console.log('Cleaning up old "glowglitch/products" folder...');
    try {
        // Delete resources by prefix is the most efficient way to clear a folder
        // Note: 'delete_resources_by_prefix' deletes assets.
        // To delete the folder itself, it must be empty.

        await cloudinary.api.delete_resources_by_prefix('glowglitch/products');
        console.log('✅ Deleted assets in glowglitch/products');

        // Optional: Delete empty folder (might fail if not empty or if api not available)
        // await cloudinary.api.delete_folder('glowglitch/products');
    } catch (e) {
        console.error('Cleanup warning:', e.message);
    }
}

cleanup();
