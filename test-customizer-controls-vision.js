const puppeteer = require('puppeteer');

async function examineCustomizerControls() {
  console.log('🔍 Examining Customizer Controls Under Preview');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to the customizer page first
    console.log('📍 Navigating to customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for product selection to load
    await page.waitForSelector('[data-testid="product-selection"]', { timeout: 10000 });
    
    // Click on first product to activate the 3D viewer
    console.log('👆 Selecting first product...');
    const firstProduct = await page.$('[data-testid="product-selection"] button');
    if (firstProduct) {
      await firstProduct.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Wait for the customizer to load
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'customizer-full-page.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: customizer-full-page.png');
    
    // Analyze the structure
    console.log('\n📋 ANALYZING CUSTOMIZER STRUCTURE');
    console.log('-'.repeat(50));
    
    const customizerAnalysis = await page.evaluate(() => {
      // Find the product customizer component
      const customizer = document.querySelector('[data-testid="product-customizer"]');
      if (!customizer) return { error: 'Customizer not found' };
      
      // Look for the space-y-4 containers which typically hold controls
      const spaceY4Containers = customizer.querySelectorAll('.space-y-4');
      const spaceY6Containers = customizer.querySelectorAll('.space-y-6');
      
      const controlSections = [];
      
      // Analyze each container
      [...spaceY4Containers, ...spaceY6Containers].forEach((container, idx) => {
        const buttons = container.querySelectorAll('button');
        const selects = container.querySelectorAll('select');
        const headers = container.querySelectorAll('h1, h2, h3, h4');
        
        // Check if this is a control section
        if (buttons.length > 0 || selects.length > 0) {
          // Get position relative to viewport
          const rect = container.getBoundingClientRect();
          
          controlSections.push({
            index: idx,
            className: container.className,
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            controls: {
              buttons: Array.from(buttons).map(btn => ({
                text: btn.textContent.trim(),
                ariaLabel: btn.getAttribute('aria-label'),
                hasIcon: btn.querySelector('svg') !== null
              })),
              selects: Array.from(selects).map(sel => ({
                id: sel.id,
                name: sel.name
              })),
              headers: Array.from(headers).map(h => h.textContent.trim())
            },
            parentClasses: container.parentElement?.className || '',
            htmlSnippet: container.outerHTML.substring(0, 200) + '...'
          });
        }
      });
      
      // Look specifically for ViewerControls
      const viewerControls = customizer.querySelector('[class*="viewer-controls"], [class*="ViewerControls"]');
      
      // Check for any text about controls
      const textContent = customizer.textContent || '';
      const hasControlsText = textContent.includes('360° View Controls') || 
                             textContent.includes('Rotate to see every angle') ||
                             textContent.includes('Touch & Keyboard');
      
      return {
        controlSections: controlSections,
        hasViewerControls: !!viewerControls,
        hasControlsText: hasControlsText,
        totalButtons: customizer.querySelectorAll('button').length,
        structure: {
          hasImageViewer: !!customizer.querySelector('img[alt*="frame"], img[src*="frame"]'),
          hasMaterialControls: !!customizer.querySelector('[class*="material"], [class*="Material"]')
        }
      };
    });
    
    console.log('📊 Customizer Analysis:');
    console.log(`   - Control Sections Found: ${customizerAnalysis.controlSections.length}`);
    console.log(`   - Has Viewer Controls: ${customizerAnalysis.hasViewerControls}`);
    console.log(`   - Has Controls Text: ${customizerAnalysis.hasControlsText}`);
    console.log(`   - Total Buttons: ${customizerAnalysis.totalButtons}`);
    
    if (customizerAnalysis.controlSections.length > 0) {
      console.log('\n🎮 CONTROL SECTIONS DETECTED:');
      customizerAnalysis.controlSections.forEach((section, idx) => {
        console.log(`\n   Section ${idx + 1}:`);
        console.log(`   - Position: ${section.position.top}px from top, ${section.position.left}px from left`);
        console.log(`   - Size: ${section.position.width}x${section.position.height}px`);
        console.log(`   - Buttons: ${section.controls.buttons.length}`);
        
        if (section.controls.buttons.length > 0) {
          console.log('   - Button details:');
          section.controls.buttons.forEach(btn => {
            console.log(`     • "${btn.text}" ${btn.hasIcon ? '(has icon)' : ''} ${btn.ariaLabel ? `[${btn.ariaLabel}]` : ''}`);
          });
        }
      });
    }
    
    // Focus on the preview area
    const previewArea = await page.evaluate(() => {
      // Find the image viewer area
      const imgViewer = document.querySelector('img[alt*="frame"], img[src*="3d-sequences"]');
      if (imgViewer) {
        const container = imgViewer.closest('.space-y-4, .space-y-6');
        if (container) {
          const rect = container.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        }
      }
      return null;
    });
    
    if (previewArea) {
      await page.screenshot({ 
        path: 'preview-area-with-controls.png',
        clip: previewArea
      });
      console.log('\n📸 Preview area screenshot saved: preview-area-with-controls.png');
    }
    
    return customizerAnalysis;
    
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
examineCustomizerControls()
  .then(result => {
    console.log('\n✅ Customizer examination complete');
    
    if (result.controlSections && result.controlSections.length > 1) {
      console.log('\n⚠️  MULTIPLE CONTROL SECTIONS FOUND!');
      console.log('The user wants to remove control panels under the preview.');
      console.log('Currently detected control sections that may need removal.');
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });