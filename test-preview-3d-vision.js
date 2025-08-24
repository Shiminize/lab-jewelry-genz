const puppeteer = require('puppeteer');

async function examine3DPreviewSection() {
  console.log('🔍 Examining 3D Preview Section with Controls');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to a specific product customizer page
    console.log('📍 Navigating to 3D customizer for ring-001...');
    await page.goto('http://localhost:3000/customizer/ring-001', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for 3D viewer to load
    console.log('⏳ Waiting for 3D viewer to load...');
    await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {
      console.log('⚠️  Canvas not found, checking for viewer container...');
    });
    
    // Additional wait for full render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take full page screenshot first
    await page.screenshot({ 
      path: 'full-3d-customizer-page.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: full-3d-customizer-page.png');
    
    // Analyze the page structure
    console.log('\n📋 ANALYZING 3D CUSTOMIZER PAGE STRUCTURE');
    console.log('-'.repeat(50));
    
    const pageAnalysis = await page.evaluate(() => {
      // Find main container
      const mainContainer = document.querySelector('main') || document.body;
      
      // Look for grid layout (typically left controls | right preview)
      const gridContainers = document.querySelectorAll('[class*="grid"]');
      
      // Find preview section (usually right side)
      let previewSection = null;
      let controlsSection = null;
      
      // Common patterns for preview section
      const previewSelectors = [
        '.lg\\:col-span-3',
        '.lg\\:col-span-2',
        '[class*="preview"]',
        '[class*="viewer"]',
        '.relative.h-full'
      ];
      
      for (const selector of previewSelectors) {
        const element = document.querySelector(selector);
        if (element && (element.querySelector('canvas') || element.querySelector('[class*="viewer"]'))) {
          previewSection = element;
          break;
        }
      }
      
      // If no preview section found, look for the right column in grid
      if (!previewSection) {
        gridContainers.forEach(grid => {
          const children = Array.from(grid.children);
          if (children.length >= 2) {
            // Assume right column is preview
            previewSection = children[children.length - 1];
          }
        });
      }
      
      const result = {
        hasCanvas: !!document.querySelector('canvas'),
        gridLayouts: gridContainers.length,
        previewSectionFound: !!previewSection
      };
      
      if (previewSection) {
        // Analyze what's in the preview section
        const previewContent = {
          // Look for control panels
          buttons: Array.from(previewSection.querySelectorAll('button')).map(btn => ({
            text: btn.textContent.trim(),
            ariaLabel: btn.getAttribute('aria-label'),
            classes: btn.className
          })),
          
          // Look for form controls
          selects: Array.from(previewSection.querySelectorAll('select')).map(sel => ({
            id: sel.id,
            name: sel.name,
            options: Array.from(sel.options).map(opt => opt.text)
          })),
          
          // Look for headers
          headers: Array.from(previewSection.querySelectorAll('h1, h2, h3, h4')).map(h => ({
            tag: h.tagName,
            text: h.textContent.trim()
          })),
          
          // Look for any control containers
          controlContainers: Array.from(previewSection.querySelectorAll('.space-y-4, .space-y-6, [class*="control"]')).map(container => {
            const rect = container.getBoundingClientRect();
            return {
              classes: container.className,
              hasButtons: container.querySelectorAll('button').length > 0,
              hasInputs: container.querySelectorAll('input, select').length > 0,
              position: `${rect.top}px from top`,
              childrenCount: container.children.length
            };
          }),
          
          // Check for specific text
          hasMetalType: previewSection.textContent.includes('Metal Type'),
          hasSize: previewSection.textContent.includes('Size'),
          hasStone: previewSection.textContent.includes('Stone')
        };
        
        result.previewContent = previewContent;
        
        // Get HTML structure of preview section (first 500 chars)
        result.previewHTML = previewSection.innerHTML.substring(0, 500) + '...';
      }
      
      return result;
    });
    
    console.log('📊 Page Structure Analysis:');
    console.log(`   - Has Canvas: ${pageAnalysis.hasCanvas}`);
    console.log(`   - Grid Layouts Found: ${pageAnalysis.gridLayouts}`);
    console.log(`   - Preview Section Found: ${pageAnalysis.previewSectionFound}`);
    
    if (pageAnalysis.previewContent) {
      console.log('\n🔍 PREVIEW SECTION CONTENT:');
      console.log(`   - Buttons: ${pageAnalysis.previewContent.buttons.length}`);
      if (pageAnalysis.previewContent.buttons.length > 0) {
        pageAnalysis.previewContent.buttons.forEach(btn => {
          console.log(`     • "${btn.text}" (${btn.ariaLabel || 'no aria-label'})`);
        });
      }
      
      console.log(`   - Select Dropdowns: ${pageAnalysis.previewContent.selects.length}`);
      if (pageAnalysis.previewContent.selects.length > 0) {
        pageAnalysis.previewContent.selects.forEach(sel => {
          console.log(`     • ${sel.name || sel.id}: ${sel.options.join(', ')}`);
        });
      }
      
      console.log(`   - Headers: ${pageAnalysis.previewContent.headers.length}`);
      if (pageAnalysis.previewContent.headers.length > 0) {
        pageAnalysis.previewContent.headers.forEach(h => {
          console.log(`     • ${h.tag}: "${h.text}"`);
        });
      }
      
      console.log(`   - Control Containers: ${pageAnalysis.previewContent.controlContainers.length}`);
      if (pageAnalysis.previewContent.controlContainers.length > 0) {
        pageAnalysis.previewContent.controlContainers.forEach((container, idx) => {
          console.log(`     • Container ${idx + 1}:`);
          console.log(`       - Has Buttons: ${container.hasButtons}`);
          console.log(`       - Has Inputs: ${container.hasInputs}`);
          console.log(`       - Position: ${container.position}`);
          console.log(`       - Children: ${container.childrenCount}`);
        });
      }
      
      console.log('\n   🔍 Text Content Checks:');
      console.log(`     - Contains "Metal Type": ${pageAnalysis.previewContent.hasMetalType}`);
      console.log(`     - Contains "Size": ${pageAnalysis.previewContent.hasSize}`);
      console.log(`     - Contains "Stone": ${pageAnalysis.previewContent.hasStone}`);
    }
    
    // Try to capture just the preview section
    const previewBounds = await page.evaluate(() => {
      // Find the preview section
      const preview = document.querySelector('.lg\\:col-span-3') || 
                     document.querySelector('.lg\\:col-span-2') ||
                     document.querySelector('[class*="preview"]');
      
      if (preview) {
        const rect = preview.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      return null;
    });
    
    if (previewBounds && previewBounds.width > 0) {
      await page.screenshot({ 
        path: 'preview-section-only.png',
        clip: previewBounds
      });
      console.log('\n📸 Preview section screenshot saved: preview-section-only.png');
    }
    
    return pageAnalysis;
    
  } catch (error) {
    console.error('❌ Vision test failed:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the examination
examine3DPreviewSection()
  .then(result => {
    console.log('\n✅ 3D Preview examination complete');
    if (result.previewContent && 
        (result.previewContent.buttons.length > 0 || 
         result.previewContent.selects.length > 0 ||
         result.previewContent.hasMetalType)) {
      console.log('\n⚠️  CONTROLS STILL FOUND IN PREVIEW SECTION!');
      console.log('These need to be removed according to user requirements.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });