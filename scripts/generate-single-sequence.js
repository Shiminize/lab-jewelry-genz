#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const sharp = require('sharp');

// Import base configuration from main script
const { CONFIG, MATERIALS } = require('./generate-3d-sequences.js');

// Command line argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        model: null,
        material: null,
        jobId: null
    };

    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        switch (flag) {
            case '--model':
                parsed.model = value;
                break;
            case '--material':
                parsed.material = value;
                break;
            case '--job-id':
                parsed.jobId = value;
                break;
        }
    }

    return parsed;
}

// Generate sequence for a single model-material combination
async function generateSingleSequence(modelId, materialName, jobId) {
    console.log(`🎬 Starting generation: ${modelId} - ${materialName}`);
    
    const materialConfig = MATERIALS[materialName];
    if (!materialConfig) {
        throw new Error(`Unknown material: ${materialName}`);
    }

    const modelPath = path.join(CONFIG.INPUT_DIR, `${modelId}.glb`);
    if (!fs.existsSync(modelPath)) {
        throw new Error(`Model file not found: ${modelPath}`);
    }

    const sequenceName = `${modelId}-${materialName}`;
    const outputPath = path.join(CONFIG.OUTPUT_DIR, sequenceName);
    
    // Create output directory
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Start Puppeteer and generate frames
    await renderModelSequence({ name: modelId, path: modelPath }, materialConfig, sequenceName, outputPath, jobId);
    
    console.log(`✅ Completed: ${sequenceName}`);
}

// Modified render function with progress reporting
async function renderModelSequence(model, materialConfig, sequenceName, outputPath, jobId) {
    console.log(`🎭 Starting Puppeteer for ${sequenceName}...`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
    } catch (error) {
        if (error.message.includes('browser') || error.message.includes('Chrome')) {
            console.error('❌ Chrome browser not found. Installing Chrome for Puppeteer...');
            console.log('   Run: npx puppeteer browsers install chrome');
            throw new Error('Chrome browser required. Please run: npx puppeteer browsers install chrome');
        }
        throw error;
    }
    
    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: CONFIG.IMAGE_SIZE.width,
            height: CONFIG.IMAGE_SIZE.height,
            deviceScaleFactor: 1
        });
        
        // Set content with Three.js template
        const { RENDER_TEMPLATE } = require('./generate-3d-sequences.js');
        const templateWithConfig = RENDER_TEMPLATE.replace(
            '${CONFIG.IMAGE_SIZE.width}', 
            CONFIG.IMAGE_SIZE.width
        ).replace(
            '${CONFIG.IMAGE_SIZE.height}', 
            CONFIG.IMAGE_SIZE.height
        );
        await page.setContent(templateWithConfig);
        
        // Wait for Three.js to load
        await page.waitForFunction(() => typeof THREE !== 'undefined');
        
        // Generate each frame
        for (let i = 0; i < CONFIG.IMAGE_COUNT; i++) {
            const angle = (i * 360) / CONFIG.IMAGE_COUNT;
            
            // Check if any format of this frame already exists
            const frameExists = CONFIG.IMAGE_FORMATS.some(format => 
                fs.existsSync(path.join(outputPath, `${i}.${format}`))
            );
            
            if (frameExists) {
                console.log(`  ⏭️  Frame ${i + 1}/${CONFIG.IMAGE_COUNT} (${angle}°) - exists`);
                continue;
            }
            
            console.log(`  📷 Frame ${i + 1}/${CONFIG.IMAGE_COUNT} (${angle}°)`);
            
            try {
                // Read GLB file and convert to data URL
                const glbBuffer = fs.readFileSync(model.path);
                const glbBase64 = glbBuffer.toString('base64');
                const glbDataUrl = `data:model/gltf-binary;base64,${glbBase64}`;
                
                // Render the model at this angle
                const dataURL = await page.evaluate(async (modelDataUrl, materialConfig, angle) => {
                    return new Promise((resolve) => {
                        window.renderModel(modelDataUrl, materialConfig, angle, (dataURL) => {
                            resolve(dataURL);
                        });
                    });
                }, glbDataUrl, materialConfig, angle);
                
                // Convert base64 to buffer
                const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Generate images in multiple formats
                await generateMultiFormatImages(buffer, outputPath, i);
                
            } catch (error) {
                console.error(`❌ Error rendering frame ${i}:`, error.message);
                // Continue with next frame
            }
        }
        
    } finally {
        await browser.close();
        console.log(`✅ Browser closed for ${sequenceName}`);
    }
}

// Generate multiple formats for a single frame
async function generateMultiFormatImages(buffer, outputPath, frameIndex) {
    try {
        const sharpImage = sharp(buffer);
        
        // Generate each format
        for (const format of CONFIG.IMAGE_FORMATS) {
            const imagePath = path.join(outputPath, `${frameIndex}.${format}`);
            
            if (fs.existsSync(imagePath)) {
                continue; // Skip if file already exists
            }
            
            if (format === 'avif') {
                await sharpImage
                    .avif({ quality: CONFIG.QUALITY_SETTINGS.avif })
                    .toFile(imagePath);
            } else if (format === 'webp') {
                await sharpImage
                    .webp({ quality: CONFIG.QUALITY_SETTINGS.webp })
                    .toFile(imagePath);
            } else if (format === 'png') {
                await sharpImage
                    .png({ compressionLevel: CONFIG.QUALITY_SETTINGS.png })
                    .toFile(imagePath);
            }
        }
    } catch (error) {
        console.error(`❌ Error generating formats for frame ${frameIndex}:`, error.message);
        // Create placeholder if generation fails
        await createPlaceholderImage(outputPath, frameIndex);
    }
}

// Create placeholder image if generation fails
async function createPlaceholderImage(outputPath, frameIndex) {
    const width = CONFIG.IMAGE_SIZE.width;
    const height = CONFIG.IMAGE_SIZE.height;
    
    // Create simple placeholder
    const placeholder = sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 240, g: 240, b: 240, alpha: 1 }
        }
    });
    
    for (const format of CONFIG.IMAGE_FORMATS) {
        const imagePath = path.join(outputPath, `${frameIndex}.${format}`);
        
        if (format === 'avif') {
            await placeholder.avif().toFile(imagePath);
        } else if (format === 'webp') {
            await placeholder.webp().toFile(imagePath);
        } else if (format === 'png') {
            await placeholder.png().toFile(imagePath);
        }
    }
}

// Main execution
async function main() {
    const args = parseArgs();
    
    if (!args.model || !args.material) {
        console.error('❌ Usage: node generate-single-sequence.js --model <modelId> --material <materialName> [--job-id <jobId>]');
        process.exit(1);
    }
    
    try {
        await generateSingleSequence(args.model, args.material, args.jobId);
        process.exit(0);
    } catch (error) {
        console.error('❌ Generation failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generateSingleSequence, parseArgs };