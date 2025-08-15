const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Quick fix for doji diamond ring WebP files
const baseDir = './Public/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence';

async function convertPngToWebp() {
  console.log('🔧 Quick WebP conversion for doji diamond ring...');
  
  for (let i = 0; i <= 35; i++) {
    const pngFile = path.join(baseDir, `${i}.png`);
    const webpFile = path.join(baseDir, `${i}.webp`);
    
    if (fs.existsSync(pngFile) && !fs.existsSync(webpFile)) {
      try {
        await sharp(pngFile)
          .webp({ quality: 85 })
          .toFile(webpFile);
        console.log(`✓ Converted ${i}.png → ${i}.webp`);
      } catch (error) {
        console.error(`✗ Failed to convert ${i}.png:`, error.message);
      }
    }
  }
  
  console.log('✅ WebP conversion complete!');
}

convertPngToWebp().catch(console.error);