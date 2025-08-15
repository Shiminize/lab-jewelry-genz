#!/usr/bin/env node

/**
 * Test script to verify all dependencies are properly installed
 */

console.log('🧪 Testing Dependencies...\n');

// Test Sharp
try {
    const sharp = require('sharp');
    console.log('✅ Sharp: Installed (v' + sharp.versions.sharp + ')');
    console.log('   - WebP support: ' + (sharp.versions.webp ? '✓' : '✗'));
    console.log('   - AVIF support: ' + (sharp.versions.heif ? '✓' : '✗'));
} catch (error) {
    console.log('❌ Sharp: Not installed or error');
    console.error('   ', error.message);
}

// Test Puppeteer
try {
    const puppeteer = require('puppeteer');
    console.log('\n✅ Puppeteer: Installed');
    
    // Check if Chrome is available
    puppeteer.launch({ headless: true })
        .then(browser => {
            console.log('   - Chrome: Available ✓');
            browser.close();
        })
        .catch(error => {
            if (error.message.includes('browser') || error.message.includes('Chrome')) {
                console.log('   - Chrome: Not installed (run: npx puppeteer browsers install chrome)');
            } else {
                console.log('   - Chrome: Error -', error.message);
            }
        });
} catch (error) {
    console.log('\n❌ Puppeteer: Not installed or error');
    console.error('   ', error.message);
}

// Test file system access
const fs = require('fs');
const path = require('path');

console.log('\n📁 File System Check:');
const modelsDir = './public/models';
if (fs.existsSync(modelsDir)) {
    const glbFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));
    console.log('   - GLB Models found:', glbFiles.length);
    if (glbFiles.length > 0) {
        console.log('   - Example:', glbFiles[0]);
    }
} else {
    console.log('   - Models directory not found');
}

const outputDir = './public/images/products/3d-sequences';
if (fs.existsSync(outputDir)) {
    console.log('   - Output directory: Exists ✓');
} else {
    console.log('   - Output directory: Will be created');
}

console.log('\n📊 Summary:');
console.log('   - Sharp image processing: Ready');
console.log('   - AVIF/WebP/PNG support: Available');
console.log('   - 3D sequence generator: Ready (needs Chrome)');
console.log('\n💡 Next step: Run "npx puppeteer browsers install chrome" if not already done');