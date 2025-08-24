#!/usr/bin/env node

/**
 * Trigger 3D Dashboard Generation with Enhanced Material Settings
 * Uses the actual Dashboard system API to regenerate vibrant jewelry images
 */

// Use built-in fetch (Node.js 18+) or fallback to HTTP
const fetchAPI = globalThis.fetch || require('http');

async function triggerGeneration() {
  console.log('🎨 Triggering 3D Dashboard generation with enhanced settings...\n');
  
  try {
    // Prepare generation request matching the API format
    const generationRequest = {
      modelIds: ['ring-luxury-001'], // Our main ring model
      materials: ['platinum', 'white-gold', 'yellow-gold', 'rose-gold'],
      assetStructure: 'optimized',
      outputFormats: ['avif', 'webp', 'png'],
      performance: {
        targetSwitchTime: 100, // CLAUDE_RULES <100ms
        preloadStrategy: 'intelligent',
        compressionLevel: 'medium'
      },
      settings: {
        imageCount: 36,
        imageSize: { width: 512, height: 512 },
        formats: ['avif', 'webp', 'png'],
        quality: {
          avif: 85,
          webp: 90,
          png: 95
        }
      }
    };
    
    console.log('📤 Sending generation request to 3D Dashboard API...');
    console.log('   Models:', generationRequest.modelIds);
    console.log('   Materials:', generationRequest.materials);
    
    // Send POST request to start generation
    const response = await fetchAPI('http://localhost:3000/api/3d-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generationRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Generation started successfully!');
    console.log('   Job ID:', result.jobId || result.id);
    console.log('   Status:', result.status);
    console.log('   Estimated completion:', result.estimatedCompletion || 'Not provided');
    
    if (result.jobId || result.id) {
      console.log('\n🔄 Monitor generation progress:');
      console.log(`   GET /api/3d-generator?action=status&jobId=${result.jobId || result.id}`);
      
      // Start monitoring (optional)
      const jobId = result.jobId || result.id;
      return await monitorGeneration(jobId);
    }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    
    // Fallback: Try using the enhanced script directly
    console.log('\n🔄 Fallback: Using enhanced script directly...');
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/generate-3d-sequences.js', { stdio: 'inherit' });
      console.log('✅ Fallback generation completed!');
    } catch (scriptError) {
      console.error('❌ Fallback generation also failed:', scriptError.message);
    }
  }
}

async function monitorGeneration(jobId) {
  console.log(`\n👀 Monitoring generation progress for job: ${jobId}`);
  
  const maxAttempts = 60; // 10 minutes max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetchAPI(`http://localhost:3000/api/3d-generator?action=status&jobId=${jobId}`);
      if (response.ok) {
        const status = await response.json();
        
        console.log(`   Progress: ${status.progress || 0}% - ${status.status || 'unknown'}`);
        if (status.currentModel) console.log(`   Current: ${status.currentModel} - ${status.currentMaterial || ''}`);
        
        if (status.status === 'completed') {
          console.log('🎉 Generation completed successfully!');
          console.log('\n✅ Check results at: /public/images/products/3d-sequences/');
          return true;
        }
        
        if (status.status === 'error') {
          console.log('❌ Generation failed:', status.error || 'Unknown error');
          return false;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
    } catch (error) {
      console.warn('⚠️  Status check failed, retrying...', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }
  }
  
  console.log('⏰ Monitoring timed out. Check generation manually.');
  return false;
}

// Run the generation
triggerGeneration().catch(console.error);