#!/usr/bin/env node

/**
 * Diagnostic Script: Dark Rendering Issue
 * Generates test renders with different lighting configurations
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test different lighting configurations
const LIGHTING_CONFIGS = [
  {
    name: 'original',
    ambient: 0.4,
    lights: 2,
    exposure: 1.0
  },
  {
    name: 'enhanced',
    ambient: 0.7,
    lights: 7,
    exposure: 1.5
  },
  {
    name: 'bright',
    ambient: 1.0,
    lights: 7,
    exposure: 2.0
  },
  {
    name: 'ultra-bright',
    ambient: 1.2,
    lights: 7,
    exposure: 3.0
  }
];

const DIAGNOSTIC_TEMPLATE = (config) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Diagnostic Renderer</title>
    <style>
        body { margin: 0; background: #f0f0f0; }
        canvas { display: block; margin: 20px auto; border: 1px solid #ccc; }
        #info { text-align: center; font-family: Arial; padding: 20px; }
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
    <div id="info">
        <h2>Lighting Config: ${config.name}</h2>
        <p>Ambient: ${config.ambient} | Lights: ${config.lights} | Exposure: ${config.exposure}</p>
    </div>
    <canvas id="canvas"></canvas>
    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        
        window.renderDiagnostic = function(modelPath, callback) {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0); // Light gray background
            
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('canvas'),
                antialias: true,
                preserveDrawingBuffer: true
            });
            
            renderer.setSize(512, 512);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = ${config.exposure};
            
            // Lighting setup
            const ambientLight = new THREE.AmbientLight(0xffffff, ${config.ambient});
            scene.add(ambientLight);
            
            if (${config.lights} >= 2) {
                const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
                scene.add(hemisphereLight);
            }
            
            if (${config.lights} >= 3) {
                const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
                keyLight.position.set(5, 10, 5);
                scene.add(keyLight);
            }
            
            if (${config.lights} >= 7) {
                const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
                fillLight.position.set(-5, 5, 5);
                scene.add(fillLight);
                
                const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
                rimLight.position.set(0, 5, -10);
                scene.add(rimLight);
                
                const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
                topLight.position.set(0, 10, 0);
                scene.add(topLight);
                
                const bottomLight = new THREE.DirectionalLight(0xffffff, 0.4);
                bottomLight.position.set(0, -5, 0);
                scene.add(bottomLight);
            }
            
            // Create test sphere
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.9,
                roughness: 0.1
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            
            // Add jewelry ring placeholder
            const torusGeometry = new THREE.TorusGeometry(0.8, 0.2, 16, 100);
            const torusMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                metalness: 0.95,
                roughness: 0.05
            });
            const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            torus.position.y = -1.5;
            scene.add(torus);
            
            // Position camera
            camera.position.set(0, 0, 5);
            camera.lookAt(0, -0.5, 0);
            
            // Render
            renderer.render(scene, camera);
            
            const dataURL = renderer.domElement.toDataURL('image/png', 1.0);
            callback(dataURL);
            
            renderer.dispose();
        };
    </script>
</body>
</html>
`;

async function runDiagnostic() {
    console.log('🔍 Running Lighting Diagnostic...\n');
    
    const outputDir = './diagnostic-renders';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        for (const config of LIGHTING_CONFIGS) {
            console.log(`📸 Testing config: ${config.name}`);
            
            const page = await browser.newPage();
            await page.setViewport({ width: 800, height: 800 });
            await page.setContent(DIAGNOSTIC_TEMPLATE(config));
            
            // Wait for Three.js to load
            await page.waitForFunction(() => typeof THREE !== 'undefined');
            
            // Render diagnostic
            const dataURL = await page.evaluate(async () => {
                return new Promise((resolve) => {
                    window.renderDiagnostic(null, (dataURL) => {
                        resolve(dataURL);
                    });
                });
            });
            
            // Save diagnostic image
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const outputPath = path.join(outputDir, `diagnostic-${config.name}.png`);
            fs.writeFileSync(outputPath, buffer);
            
            console.log(`   ✅ Saved: ${outputPath}`);
            
            await page.close();
        }
        
    } finally {
        await browser.close();
    }
    
    console.log('\n✅ Diagnostic complete! Check ./diagnostic-renders/');
    console.log('\nAnalysis:');
    console.log('- Compare the brightness of each configuration');
    console.log('- If all are dark, the issue is with the rendering pipeline');
    console.log('- If brightness increases with config, we need even more light');
}

runDiagnostic().catch(console.error);