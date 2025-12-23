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
  BACKGROUND: 'white'                    // White background for better visibility
};

const MATERIALS = {
  // PHASE 2: Jewelry-Optimized Material Values for Vibrant Colors
  'platinum': { 
    metallic: 0.85, 
    roughness: 0.25, // Increased for proper light scattering
    color: [0.95, 0.95, 0.98] // Brighter, more silver-white
  },
  'white-gold': { 
    metallic: 0.88, 
    roughness: 0.20, // Better for jewelry sparkle
    color: [0.98, 0.97, 0.95] // Clean bright white
  },
  'yellow-gold': { 
    metallic: 0.9, 
    roughness: 0.15, // Allows more brilliance
    color: [1.0, 0.9, 0.2] // Vibrant, warm golden
  },
  'rose-gold': { 
    metallic: 0.88, 
    roughness: 0.18, // Balanced for warm reflections
    color: [1.0, 0.7, 0.6] // Warm pinkish-gold
  }
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
            renderer.setClearColor(0xffffff, 1); // White background
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 2.2; // Increase exposure significantly for vibrant jewelry
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Enhanced jewelry studio lighting setup
            // 1. Increased ambient light for better base illumination
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);
            
            // 2. Hemisphere light for natural sky/ground lighting
            const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.5);
            scene.add(hemisphereLight);
            
            // 3. Three-point lighting system for jewelry
            // Key light - main illumination (ENHANCED for jewelry)
            const keyLight = new THREE.DirectionalLight(0xffffff, 2.0); // Increased intensity
            keyLight.position.set(5, 10, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 2048;
            keyLight.shadow.mapSize.height = 2048;
            scene.add(keyLight);
            
            // Fill light - soften shadows (ENHANCED)
            const fillLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
            fillLight.position.set(-5, 5, 5);
            scene.add(fillLight);
            
            // Rim light - highlight edges (ENHANCED)
            const rimLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased intensity
            rimLight.position.set(0, 5, -10);
            scene.add(rimLight);
            
            // 4. Additional lights for metallic surfaces
            const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
            topLight.position.set(0, 10, 0);
            scene.add(topLight);
            
            const bottomLight = new THREE.DirectionalLight(0xffffff, 0.3);
            bottomLight.position.set(0, -5, 0);
            scene.add(bottomLight);
            
            // Load model
            const loader = new GLTFLoader();
            loader.load(modelPath, function(gltf) {
                const model = gltf.scene;
                
                // Apply enhanced material configuration for jewelry
                model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        // FORCE MATERIAL REPLACEMENT to fix dark rendering
                        // Create new material to ensure proper lighting
                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(...materialConfig.color),
                            metalness: materialConfig.metallic,
                            roughness: materialConfig.roughness,
                            envMapIntensity: 2.0,
                            // Force emissive to add self-illumination
                            emissive: new THREE.Color(...materialConfig.color),
                            emissiveIntensity: 0.15, // Increased for more vibrant self-light
                            // Add color saturation boost
                            transparent: false,
                            opacity: 1.0
                        });
                        
                        // Copy any textures from original material
                        if (child.material.map) newMaterial.map = child.material.map;
                        if (child.material.normalMap) newMaterial.normalMap = child.material.normalMap;
                        if (child.material.roughnessMap) newMaterial.roughnessMap = child.material.roughnessMap;
                        if (child.material.metalnessMap) newMaterial.metalnessMap = child.material.metalnessMap;
                        
                        // Replace the material
                        child.material.dispose(); // Clean up old material
                        child.material = newMaterial;
                        
                        // Enable shadows
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // For gems/diamonds - make them brilliant
                        if (child.name && (child.name.includes('gem') || child.name.includes('diamond'))) {
                            child.material.metalness = 0;
                            child.material.roughness = 0;
                            child.material.transparent = true;
                            child.material.opacity = 0.9;
                            child.material.emissiveIntensity = 0.2;
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