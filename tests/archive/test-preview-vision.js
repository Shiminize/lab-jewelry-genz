const puppeteer = require('puppeteer');

async function examinePreviewSection() {
  console.log('🔍 Examining Preview Section with Vision Mode');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to customizer page
    console.log('📍 Navigating to customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for preview section to load
    await page.waitForSelector('.space-y-4', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot for visual inspection
    await page.screenshot({ 
      path: 'preview-section-current.png',
      fullPage: false,
      clip: {
        x: 600,
        y: 0,
        width: 600,
        height: 800
      }
    });
    console.log('📸 Screenshot saved: preview-section-current.png');
    
    // Analyze preview section structure
    console.log('\n📋 ANALYZING PREVIEW SECTION STRUCTURE');
    console.log('-'.repeat(50));
    
    const previewAnalysis = await page.evaluate(() => {
      // Find the preview section (right side)
      const previewSection = document.querySelector('.lg\\:col-span-3');
      if (!previewSection) return { error: 'Preview section not found' };
      
      // Look for control panels under the preview
      const controlPanels = [];
      
      // Find all space-y-4 divs (potential control containers)
      const spaceY4Divs = previewSection.querySelectorAll('.space-y-4');
      
      spaceY4Divs.forEach((div, index) => {
        // Check for any control-like elements
        const buttons = div.querySelectorAll('button');
        const selects = div.querySelectorAll('select');
        const inputs = div.querySelectorAll('input');
        const h3Headers = div.querySelectorAll('h3');
        
        if (buttons.length > 0 || selects.length > 0 || inputs.length > 0) {
          const panel = {
            index: index,
            buttons: Array.from(buttons).map(btn => ({
              text: btn.textContent.trim(),
              classes: btn.className
            })),
            selects: Array.from(selects).map(sel => ({
              id: sel.id,
              classes: sel.className
            })),
            inputs: Array.from(inputs).map(inp => ({
              type: inp.type,
              placeholder: inp.placeholder,
              classes: inp.className
            })),
            headers: Array.from(h3Headers).map(h3 => h3.textContent.trim()),
            html: div.innerHTML.substring(0, 200) + '...'
          };
          controlPanels.push(panel);
        }
      });
      
      // Check for any remaining text elements
      const textElements = previewSection.querySelectorAll('p, span, div');
      const textContent = [];
      
      textElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 5 && 
            !text.includes('360° View Controls') && 
            !text.includes('Rotate to see every angle')) {
          // Check if it's a control-related text
          if (text.includes('Metal') || text.includes('Size') || 
              text.includes('Stone') || text.includes('Engraving')) {
            textContent.push({
              tag: el.tagName,
              text: text,
              classes: el.className
            });
          }
        }
      });
      
      return {
        controlPanels: controlPanels,
        textElements: textContent,
        totalButtons: previewSection.querySelectorAll('button').length,
        totalSelects: previewSection.querySelectorAll('select').length,
        totalInputs: previewSection.querySelectorAll('input').length
      };
    });
    
    console.log('📊 Preview Section Analysis:');
    console.log(`   - Control Panels Found: ${previewAnalysis.controlPanels.length}`);
    console.log(`   - Total Buttons: ${previewAnalysis.totalButtons}`);
    console.log(`   - Total Selects: ${previewAnalysis.totalSelects}`);
    console.log(`   - Total Inputs: ${previewAnalysis.totalInputs}`);
    
    if (previewAnalysis.controlPanels.length > 0) {
      console.log('\n⚠️  CONTROL PANELS DETECTED UNDER PREVIEW:');
      previewAnalysis.controlPanels.forEach((panel, idx) => {
        console.log(`\n   Panel ${idx + 1}:`);
        if (panel.headers.length > 0) {
          console.log(`   - Headers: ${panel.headers.join(', ')}`);
        }
        if (panel.buttons.length > 0) {
          console.log(`   - Buttons: ${panel.buttons.map(b => b.text).join(', ')}`);
        }
        if (panel.selects.length > 0) {
          console.log(`   - Select dropdowns: ${panel.selects.length}`);
        }
        if (panel.inputs.length > 0) {
          console.log(`   - Input fields: ${panel.inputs.length}`);
        }
      });
    }
    
    // Check for Material Controls specifically
    console.log('\n🔍 CHECKING FOR MATERIAL CONTROLS:');
    const materialControls = await page.evaluate(() => {
      const content = document.body.textContent || '';
      const metalTypeCount = (content.match(/Metal Type/gi) || []).length;
      const materialButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Gold') || 
        btn.textContent.includes('Silver') || 
        btn.textContent.includes('Platinum')
      );
      
      return {
        metalTypeTextCount: metalTypeCount,
        materialButtonCount: materialButtons.length,
        materialButtonTexts: materialButtons.map(btn => btn.textContent.trim())
      };
    });
    
    console.log(`   - "Metal Type" text occurrences: ${materialControls.metalTypeTextCount}`);
    console.log(`   - Material selection buttons: ${materialControls.materialButtonCount}`);
    if (materialControls.materialButtonTexts.length > 0) {
      console.log(`   - Button texts: ${materialControls.materialButtonTexts.join(', ')}`);
    }
    
    // Take focused screenshot of any control panels
    if (previewAnalysis.controlPanels.length > 0) {
      await page.screenshot({ 
        path: 'control-panels-found.png',
        fullPage: true
      });
      console.log('\n📸 Full page screenshot saved: control-panels-found.png');
    }
    
    return previewAnalysis;
    
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
examinePreviewSection()
  .then(result => {
    console.log('\n✅ Preview section examination complete');
    if (result.controlPanels && result.controlPanels.length > 0) {
      console.log('⚠️  Control panels still present under preview!');
      process.exit(1);
    } else {
      console.log('✅ Preview section appears clean');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });