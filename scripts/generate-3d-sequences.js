#!/usr/bin/env node

/**
 * Generate 360° Image Sequences from GLB Models
 * Automatically creates 36 images at 10° increments for CSS 3D viewer
 * 
 * Usage: node scripts/generate-3d-sequences.js
 * Requires: @gltf-transform/core, @gltf-transform/extensions, puppeteer
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  INPUT_DIR: './public/models',           // Where GLB files are stored
  OUTPUT_DIR: './public/images/products/3d-sequences', // Where sequences go
  IMAGE_COUNT: 36,                       // 36 images = 10° increments
  IMAGE_SIZE: { width: 600, height: 600 }, // Square images
  IMAGE_FORMAT: 'webp',                  // Modern format
  QUALITY: 85,                           // WebP quality
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
    <script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.158.0/examples/js/loaders/GLTFLoader.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
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
            const loader = new THREE.GLTFLoader();
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
                
                // Get image data
                const dataURL = renderer.domElement.toDataURL('image/png');
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
            for (let i = 0; i < CONFIG.IMAGE_COUNT; i++) {
                const angle = (i * 360) / CONFIG.IMAGE_COUNT;
                const filename = `${i}.${CONFIG.IMAGE_FORMAT}`;
                const imagePath = path.join(outputPath, filename);
                
                // Skip if image already exists
                if (fs.existsSync(imagePath)) {
                    continue;
                }
                
                console.log(`  📷 Frame ${i + 1}/${CONFIG.IMAGE_COUNT} (${angle}°)`);
                
                // TODO: Implement actual rendering using Puppeteer + Three.js
                // For now, create placeholder
                await createPlaceholderImage(imagePath, sequenceName, angle, i);
            }
        }
    }
    
    console.log('✅ 3D sequence generation complete!');
}

async function createPlaceholderImage(imagePath, sequenceName, angle, frame) {
    // Create a simple placeholder for now
    // In production, this would use Puppeteer to render the actual 3D model
    const canvas = `
<svg width="${CONFIG.IMAGE_SIZE.width}" height="${CONFIG.IMAGE_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <circle cx="${CONFIG.IMAGE_SIZE.width/2}" cy="${CONFIG.IMAGE_SIZE.height/2}" r="150" 
            fill="#c0c0c0" stroke="#a0a0a0" stroke-width="2"/>
    <text x="${CONFIG.IMAGE_SIZE.width/2}" y="${CONFIG.IMAGE_SIZE.height/2 - 10}" 
          text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
        ${sequenceName}
    </text>
    <text x="${CONFIG.IMAGE_SIZE.width/2}" y="${CONFIG.IMAGE_SIZE.height/2 + 10}" 
          text-anchor="middle" font-family="Arial" font-size="12" fill="#888">
        Frame ${frame} • ${angle}°
    </text>
</svg>
    `;
    
    // For now, just write a simple JSON file indicating the placeholder
    const placeholder = {
        sequence: sequenceName,
        frame: frame,
        angle: angle,
        generated: new Date().toISOString(),
        note: 'Placeholder - replace with actual 3D rendering'
    };
    
    fs.writeFileSync(imagePath.replace('.webp', '.json'), JSON.stringify(placeholder, null, 2));
}

// Run the script
if (require.main === module) {
    generateSequences().catch(console.error);
}

module.exports = { generateSequences, CONFIG, MATERIALS };