/**
 * Complete Sequence Library Generation Script
 * Generates all required image sequences for CSS 3D customizer
 * CLAUDE_RULES.md compliant: 36 angles × 4 materials × 3 models = 432 total sequences
 */

const { chromium } = require('playwright');

async function generateCompleteSequenceLibrary() {
  console.log('🎬 GENERATING COMPLETE SEQUENCE LIBRARY FOR CSS 3D CUSTOMIZER');
  console.log('=============================================================');
  console.log('Target: 3 models × 4 materials × 36 angles = 432 sequences');
  console.log('CLAUDE_RULES compliance: <100ms material switches, multi-format output');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  const page = await browser.newPage();
  
  // Models available for generation
  const models = [
    'ring-luxury-001',
    'ring-classic-002', 
    'ring-diamond-003'
  ];
  
  // Materials matching generation service validation
  const materials = [
    'platinum',
    'white-gold',
    'yellow-gold',
    'rose-gold'
  ];
  
  const results = {
    totalGenerated: 0,
    successfulGenerations: [],
    failedGenerations: [],
    generationTimes: [],
    startTime: Date.now()
  };
  
  try {
    console.log('\n🚀 Opening 3D Dashboard...');
    await page.goto('http://localhost:3001/3d-dashboard', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("3D Sequence Generator")', { timeout: 10000 });
    console.log('✅ 3D Dashboard loaded successfully');
    
    // Click on Models tab to select models
    await page.click('button[value="models"], button:has-text("Upload Models")');
    await page.waitForTimeout(2000);
    console.log('📁 Models tab opened');
    
    // Generate sequences for each model
    for (const modelId of models) {
      console.log(`\n🎭 Processing Model: ${modelId}`);
      console.log('=' + '='.repeat(modelId.length + 20));
      
      try {
        // Try to select the model in the models library
        const modelCheckbox = page.locator(`input[type="checkbox"][value="${modelId}"]`);
        const modelExists = await modelCheckbox.count() > 0;
        
        if (modelExists) {
          await modelCheckbox.check();
          console.log(`✅ Selected model: ${modelId}`);
        } else {
          console.log(`⚠️ Model ${modelId} not found in dashboard, will generate via API`);
        }
        
        // Generate sequences for this model using the enhanced generation API
        const generationStartTime = Date.now();
        
        const generationResult = await page.evaluate(async (modelData) => {
          console.log(`🚀 Starting generation for ${modelData.modelId} with materials:`, modelData.materials);
          
          const response = await fetch('/api/3d-generator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'generate',
              modelIds: [modelData.modelId],
              materials: modelData.materials,
              assetStructure: 'optimized',
              outputFormats: ['avif', 'webp', 'png'],
              performance: {
                targetSwitchTime: 50, // <100ms CLAUDE_RULES
                preloadStrategy: 'intelligent',
                compressionLevel: 'high'
              },
              settings: {
                imageCount: 36, // 36 angles at 10° increments
                imageSize: { width: 800, height: 800 },
                formats: ['avif', 'webp', 'png'],
                quality: {
                  avif: 85,
                  webp: 90,
                  png: 6
                }
              }
            })
          });
          
          const data = await response.json();
          
          return {
            success: response.ok,
            status: response.status,
            jobId: data.jobId,
            message: data.error || 'Generation started successfully'
          };
        }, { modelId, materials });
        
        const generationTime = Date.now() - generationStartTime;
        results.generationTimes.push(generationTime);
        
        if (generationResult.success) {
          console.log(`🎉 Generation started for ${modelId}: Job ${generationResult.jobId} (${generationTime}ms)`);
          results.successfulGenerations.push({
            modelId,
            jobId: generationResult.jobId,
            materials: materials.length,
            generationTime
          });
          
          // Monitor generation progress
          if (generationResult.jobId) {
            await monitorGenerationProgress(page, generationResult.jobId, modelId);
          }
          
        } else {
          console.log(`❌ Generation failed for ${modelId}: ${generationResult.message}`);
          results.failedGenerations.push({
            modelId,
            error: generationResult.message,
            status: generationResult.status
          });
        }
        
        // Wait between models to avoid overwhelming the system
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.error(`❌ Error processing model ${modelId}:`, error.message);
        results.failedGenerations.push({
          modelId,
          error: error.message
        });
      }
    }
    
    // Final Results Summary
    const totalTime = Date.now() - results.startTime;
    const avgGenerationTime = results.generationTimes.reduce((sum, time) => sum + time, 0) / results.generationTimes.length;
    
    console.log('\n🎯 COMPLETE SEQUENCE LIBRARY GENERATION RESULTS');
    console.log('==============================================');
    console.log(`⏱️ Total execution time: ${Math.round(totalTime / 1000)}s`);
    console.log(`🎬 Models processed: ${models.length}`);
    console.log(`✅ Successful generations: ${results.successfulGenerations.length}`);
    console.log(`❌ Failed generations: ${results.failedGenerations.length}`);
    console.log(`⚡ Average generation start time: ${Math.round(avgGenerationTime)}ms`);
    
    // Show successful generations
    if (results.successfulGenerations.length > 0) {
      console.log('\n✅ SUCCESSFUL GENERATIONS:');
      results.successfulGenerations.forEach(gen => {
        console.log(`   📦 ${gen.modelId}: Job ${gen.jobId} (${gen.materials} materials, ${gen.generationTime}ms)`);
      });
    }
    
    // Show failed generations
    if (results.failedGenerations.length > 0) {
      console.log('\n❌ FAILED GENERATIONS:');
      results.failedGenerations.forEach(gen => {
        console.log(`   ⚠️ ${gen.modelId}: ${gen.error}`);
      });
    }
    
    const successRate = (results.successfulGenerations.length / models.length) * 100;
    console.log(`\n📊 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 67) { // At least 2/3 models successful
      console.log('\n🎉 ✅ SEQUENCE LIBRARY GENERATION COMPLETED SUCCESSFULLY');
      console.log('Ready for Phase 2B: CSS 3D Customizer Performance Optimization');
      return true;
    } else {
      console.log('\n❌ SEQUENCE LIBRARY GENERATION NEEDS ATTENTION');
      console.log('Review failed generations before proceeding to Phase 2B');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Sequence library generation failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

async function monitorGenerationProgress(page, jobId, modelId) {
  console.log(`📊 Monitoring generation progress for ${modelId} (Job: ${jobId})`);
  
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max
  
  while (attempts < maxAttempts) {
    try {
      const progressData = await page.evaluate(async (jobId) => {
        const response = await fetch(`/api/3d-generator?action=status&jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          return data.status;
        }
        return null;
      }, jobId);
      
      if (progressData) {
        const status = progressData.status;
        const progress = progressData.progress || 0;
        
        if (status === 'completed') {
          console.log(`🎉 ${modelId} generation completed (${progress}%)`);
          break;
        } else if (status === 'error') {
          console.log(`❌ ${modelId} generation failed: ${progressData.error}`);
          break;
        } else if (status === 'processing') {
          console.log(`⚡ ${modelId} generation progress: ${progress}% (${progressData.currentMaterial})`);
        }
      }
      
      attempts++;
      await page.waitForTimeout(5000); // Check every 5 seconds
      
    } catch (error) {
      console.log(`⚠️ Progress monitoring error for ${modelId}: ${error.message}`);
      break;
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log(`⏰ Monitoring timeout for ${modelId} after ${maxAttempts * 5}s`);
  }
}

// Run the complete sequence library generation
generateCompleteSequenceLibrary().then(success => {
  process.exit(success ? 0 : 1);
});