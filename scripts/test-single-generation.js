#!/usr/bin/env node

/**
 * Test single sequence generation with enhanced lighting
 */

const { generateSequences, CONFIG, MATERIALS } = require('./generate-3d-sequences.js');
const fs = require('fs');
const path = require('path');

async function testSingleGeneration() {
    console.log('🧪 Testing single sequence generation...\n');
    
    // Temporarily rename other GLB files to test just one
    const modelsDir = './public/models';
    const allFiles = fs.readdirSync(modelsDir);
    const glbFiles = allFiles.filter(f => f.endsWith('.glb'));
    
    // Keep only ring-luxury-001.glb
    const testModel = 'ring-luxury-001.glb';
    const renamedFiles = [];
    
    glbFiles.forEach(file => {
        if (file !== testModel) {
            const oldPath = path.join(modelsDir, file);
            const newPath = path.join(modelsDir, file + '.backup');
            fs.renameSync(oldPath, newPath);
            renamedFiles.push({ old: oldPath, new: newPath });
        }
    });
    
    // Temporarily reduce materials to just one
    const originalMaterials = { ...MATERIALS };
    for (const key in MATERIALS) {
        if (key !== 'rose-gold') {
            delete MATERIALS[key];
        }
    }
    
    try {
        // Run generation
        await generateSequences();
        
        // Check result
        const resultPath = './public/images/products/3d-sequences/ring-luxury-001-rose-gold/0.webp';
        if (fs.existsSync(resultPath)) {
            console.log('✅ Test image generated successfully!');
            console.log(`Check: ${resultPath}`);
        } else {
            console.log('❌ Test image not found');
        }
        
    } catch (error) {
        console.error('❌ Generation error:', error);
    } finally {
        // Restore files
        renamedFiles.forEach(({ old, new: newPath }) => {
            fs.renameSync(newPath, old);
        });
        
        // Restore materials
        Object.assign(MATERIALS, originalMaterials);
    }
}

testSingleGeneration().catch(console.error);