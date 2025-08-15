#!/usr/bin/env node

/**
 * Generate 360° Image Sequences from GLB Models
 * Automatically creates 36 images at 10° increments for CSS 3D viewer
 * 
 * Usage: node scripts/generate-3d-sequences.js
 * Requires: puppeteer@^24.9.0, sharp
 * 
 * Updated for Puppeteer 24.x compatibility (resolves deprecation warnings)
 * Chrome browser: npx puppeteer browsers install chrome
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  INPUT_DIR: './public/models',           // Where GLB files are stored
  OUTPUT_DIR: './public/images/products/3d-sequences', // Where sequences go
  IMAGE_COUNT: 36,                       // 36 images = 10° increments
  IMAGE_SIZE: { width: 1024, height: 1024 }, // High resolution for quality
  IMAGE_FORMATS: ['avif', 'webp', 'png'], // Multi-format support
  QUALITY_SETTINGS: {
    avif: 80,     // AVIF optimal quality
    webp: 85,     // WebP quality
    png: 9        // PNG compression level
  },
  LIGHTING: 'studio',                    // Professional lighting
  BACKGROUND: 'transparent'              // Transparent background
};

const MATERIALS = {
  'platinum': { metallic: 1.0, roughness: 0.1, color: [0.9, 0.9, 0.9] },
  'white-gold': { metallic: 1.0, roughness: 0.15, color: [0.95, 0.95, 0.95] },
  'yellow-gold': { metallic: 1.0, roughness: 0.1, color: [1.0, 0.86, 0.57] },
  'rose-gold': { metallic: 1.0, roughness: 0.12, color: [0.91, 0.71, 0.67] }
};

// HTML template for Three.js rendering
const RENDER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>3D Model Renderer</title>
    <style>
        body { margin: 0; overflow: hidden; background: transparent; }
        canvas { display: block; }
    </style>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.158.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.158.0/examples/jsm/"
            }
        }
    </script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        
        // Make THREE and GLTFLoader available globally
        window.THREE = THREE;
        window.GLTFLoader = GLTFLoader;
        
        // Define render function after modules are loaded
        window.renderModel = function(modelPath, materialConfig, angle, callback) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('canvas'),
                alpha: true,
                antialias: true,
                preserveDrawingBuffer: true
            });
            
            renderer.setSize(${CONFIG.IMAGE_SIZE.width}, ${CONFIG.IMAGE_SIZE.height});
            renderer.setClearColor(0x000000, 0);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            
            // Studio lighting setup
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            
            const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight1.position.set(5, 5, 5);
            scene.add(directionalLight1);
            
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
            directionalLight2.position.set(-5, 5, -5);
            scene.add(directionalLight2);
            
            // Load model
            const loader = new GLTFLoader();
            loader.load(modelPath, function(gltf) {
                const model = gltf.scene;
                
                // Apply material configuration
                model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.material.isMeshStandardMaterial) {
                            child.material.metalness = materialConfig.metallic;
                            child.material.roughness = materialConfig.roughness;
                            child.material.color.setRGB(...materialConfig.color);
                        }
                    }
                });
                
                // Center and scale model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                model.position.sub(center);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                model.scale.multiplyScalar(scale);
                
                scene.add(model);
                
                // Position camera
                camera.position.set(0, 0, 3);
                camera.lookAt(0, 0, 0);
                
                // Rotate model to specified angle
                model.rotation.y = (angle * Math.PI) / 180;
                
                // Render
                renderer.render(scene, camera);
                
                // Get image data as high quality PNG for processing
                const dataURL = renderer.domElement.toDataURL('image/png', 1.0);
                callback(dataURL);
                
                // Cleanup
                scene.remove(model);
                renderer.dispose();
            });
        };
    </script>
</body>
</html>
`;

async function generateSequences() {
    console.log('🎬 Starting 3D sequence generation...');
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    
    // Find all GLB files
    const modelFiles = fs.readdirSync(CONFIG.INPUT_DIR)
        .filter(file => file.endsWith('.glb'))
        .map(file => ({
            name: file.replace('.glb', ''),
            path: path.join(CONFIG.INPUT_DIR, file)
        }));
    
    console.log(`Found ${modelFiles.length} GLB models`);
    
    // For each model and material combination
    for (const model of modelFiles) {
        for (const [materialName, materialConfig] of Object.entries(MATERIALS)) {
            const sequenceName = `${model.name}-${materialName}`;
            const outputPath = path.join(CONFIG.OUTPUT_DIR, sequenceName);
            
            console.log(`📸 Generating sequence: ${sequenceName}`);
            
            // Create sequence directory
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }
            
            // Generate 36 images (0° to 350° in 10° increments)
            await renderModelSequence(model, materialConfig, sequenceName, outputPath);
        }
    }
    
    console.log('✅ 3D sequence generation complete!');
}

async function renderModelSequence(model, materialConfig, sequenceName, outputPath) {
    console.log(`🎭 Starting Puppeteer for ${sequenceName}...`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,  // Updated for Puppeteer 24.x - uses new headless mode by default
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
        await page.setContent(RENDER_TEMPLATE);
        
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
        console.log(`✅ Completed ${sequenceName}`);
    }
}

async function generateMultiFormatImages(pngBuffer, outputPath, frameIndex) {
    const sharp_pipeline = sharp(pngBuffer);
    
    // Generate each format
    for (const format of CONFIG.IMAGE_FORMATS) {
        const filename = `${frameIndex}.${format}`;
        const imagePath = path.join(outputPath, filename);
        
        try {
            let pipeline = sharp_pipeline.clone();
            
            switch (format) {
                case 'avif':
                    await pipeline
                        .avif({ 
                            quality: CONFIG.QUALITY_SETTINGS.avif,
                            effort: 6  // Higher effort for better compression
                        })
                        .toFile(imagePath);
                    break;
                    
                case 'webp':
                    await pipeline
                        .webp({ 
                            quality: CONFIG.QUALITY_SETTINGS.webp,
                            effort: 6
                        })
                        .toFile(imagePath);
                    break;
                    
                case 'png':
                    await pipeline
                        .png({ 
                            compressionLevel: CONFIG.QUALITY_SETTINGS.png,
                            adaptiveFiltering: true
                        })
                        .toFile(imagePath);
                    break;
            }
            
            console.log(`    ✓ ${format.toUpperCase()}`);
            
        } catch (error) {
            console.error(`    ❌ Failed to generate ${format}:`, error.message);
        }
    }
}

// Legacy function - keeping for compatibility
async function createPlaceholderImage(imagePath, sequenceName, angle, frame) {
    const placeholder = {
        sequence: sequenceName,
        frame: frame,
        angle: angle,
        generated: new Date().toISOString(),
        note: 'Placeholder - replace with actual 3D rendering'
    };
    
    fs.writeFileSync(imagePath.replace(/\.(webp|avif|png)$/, '.json'), JSON.stringify(placeholder, null, 2));
}

// Run the script
if (require.main === module) {
    generateSequences().catch(console.error);
}

module.exports = { generateSequences, CONFIG, MATERIALS, RENDER_TEMPLATE };