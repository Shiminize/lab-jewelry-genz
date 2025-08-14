#!/usr/bin/env node

/**
 * Quick Generation Script for Testing
 * Generates image sequences from existing GLB models
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    modelPath: './public/models/Ringmodel.glb',
    outputBase: './public/images/products/3d-sequences',
    materials: ['platinum', 'yellow-gold', 'rose-gold', 'white-gold'],
    imageCount: 36
};

async function createTestSequences() {
    console.log('🎬 Creating test sequences for CSS 3D viewer...\n');
    
    // Ensure base output directory exists
    if (!fs.existsSync(CONFIG.outputBase)) {
        fs.mkdirSync(CONFIG.outputBase, { recursive: true });
    }
    
    // Generate directory structure for each material
    for (const material of CONFIG.materials) {
        const sequenceName = `ringmodel-${material}`;
        const sequencePath = path.join(CONFIG.outputBase, sequenceName);
        
        console.log(`📁 Creating directory: ${sequenceName}`);
        
        // Create sequence directory
        if (!fs.existsSync(sequencePath)) {
            fs.mkdirSync(sequencePath, { recursive: true });
        }
        
        // Create placeholder files for each frame
        for (let i = 0; i < CONFIG.imageCount; i++) {
            const angle = (i * 360) / CONFIG.imageCount;
            const filename = `${i}.webp`;
            const filePath = path.join(sequencePath, filename);
            
            // Skip if file already exists
            if (fs.existsSync(filePath)) {
                continue;
            }
            
            // Create placeholder JSON file for now
            const placeholder = {
                sequence: sequenceName,
                material: material,
                frame: i,
                angle: angle,
                note: 'Use 3d-renderer.html to generate actual images',
                instructions: [
                    '1. Open scripts/3d-renderer.html in browser',
                    '2. Upload public/models/Ringmodel.glb',
                    `3. Select material: ${material}`,
                    '4. Click "Generate 36 Images"',
                    '5. Download and place images in this directory'
                ]
            };
            
            // Write placeholder
            fs.writeFileSync(
                filePath.replace('.webp', '.json'), 
                JSON.stringify(placeholder, null, 2)
            );
        }
        
        console.log(`  ✅ Created ${CONFIG.imageCount} placeholder files`);
    }
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`1. Open: scripts/3d-renderer.html`);
    console.log(`2. Upload: public/models/Ringmodel.glb`);
    console.log(`3. Generate images for each material:`);
    CONFIG.materials.forEach(material => {
        console.log(`   - ${material} → ${CONFIG.outputBase}/ringmodel-${material}/`);
    });
    console.log(`4. Test at: http://localhost:3001\n`);
    
    // Update product variants to include the new sequences
    await updateProductVariants();
}

async function updateProductVariants() {
    const variantsPath = './src/data/product-variants.ts';
    
    console.log('📝 Updating product variants...');
    
    // Read current variants file
    let content = fs.readFileSync(variantsPath, 'utf8');
    
    // Add new variants for the ringmodel
    const newVariants = CONFIG.materials.map(material => {
        const materialName = material.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return `  {
    id: 'ringmodel-${material}',
    name: 'Ring Model - ${materialName}',
    assetPath: '/images/products/3d-sequences/ringmodel-${material}',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '${material === 'yellow-gold' ? '18k-yellow-gold' : material === 'rose-gold' ? '18k-rose-gold' : material === 'white-gold' ? '18k-white-gold' : material}') || MATERIALS[0],
    description: 'Custom ring model in ${materialName.toLowerCase()}'
  }`;
    }).join(',\n');
    
    // Find the RING_VARIANTS array and add new variants
    if (content.includes('RING_VARIANTS: ProductVariant[] = [')) {
        // Add after existing variants
        const insertPoint = content.lastIndexOf(']', content.indexOf('// Helper function'));
        if (insertPoint > 0) {
            const before = content.substring(0, insertPoint);
            const after = content.substring(insertPoint);
            
            // Add comma if there are existing variants
            const needsComma = before.trim().endsWith('}');
            const separator = needsComma ? ',\n' : '\n';
            
            content = before + separator + newVariants + '\n' + after;
            
            fs.writeFileSync(variantsPath, content);
            console.log('  ✅ Updated product variants with ringmodel sequences');
        }
    }
}

// Run the script
if (require.main === module) {
    createTestSequences().catch(console.error);
}

module.exports = { createTestSequences, CONFIG };