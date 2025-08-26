const puppeteer = require('puppeteer');

async function examineCustomizerCurrentState() {
  console.log('🔍 Examining Current Customizer Page State');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to customizer page
    console.log('📍 Navigating to /customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for product customizer to load
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'customizer-page-current.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: customizer-page-current.png');
    
    // Analyze the structure
    console.log('\n📋 ANALYZING CUSTOMIZER PAGE STRUCTURE');
    console.log('-'.repeat(50));
    
    const pageAnalysis = await page.evaluate(() => {
      // Find main sections
      const productCustomizer = document.querySelector('[data-testid="product-customizer"]');
      const productSelection = document.querySelector('[data-testid="product-selection"]');
      
      // Analyze controls in ProductCustomizer
      let controlsAnalysis = { found: false, types: [] };
      if (productCustomizer) {
        // Check for various control elements
        const materialControls = productCustomizer.querySelectorAll('button[class*="material"], [class*="Metal"]');
        const frameControls = productCustomizer.querySelectorAll('[class*="frame"], [class*="Frame"]');
        const navigationButtons = Array.from(productCustomizer.querySelectorAll('button')).filter(btn => {
          const text = btn.textContent.trim();
          return text === '←' || text === '→' || text.includes('Auto');
        });
        
        // Check for frame indicator
        const frameIndicator = Array.from(productCustomizer.querySelectorAll('*')).find(el => 
          el.textContent.match(/\d+\s*\/\s*\d+/)
        );
        
        controlsAnalysis = {
          found: true,
          materialButtons: materialControls.length,
          navigationButtons: navigationButtons.length,
          hasFrameIndicator: !!frameIndicator,
          frameIndicatorText: frameIndicator?.textContent.trim() || null,
          totalButtons: productCustomizer.querySelectorAll('button').length
        };
      }
      
      // Check layout structure
      const layoutInfo = {
        hasGrid: !!document.querySelector('.grid.lg\\:grid-cols-2'),
        hasTwoColumns: !!document.querySelector('.lg\\:grid-cols-2'),
        leftSection: !!document.querySelector('.space-y-6'),
        rightSection: !!document.querySelector('.space-y-6:last-child')
      };
      
      // Check for hints/instructions
      const touchHints = document.querySelector('.lg\\:hidden.bg-muted\\/20');
      const hintsText = touchHints?.textContent || '';
      
      return {
        hasProductCustomizer: !!productCustomizer,
        hasProductSelection: !!productSelection,
        controlsAnalysis,
        layoutInfo,
        touchHintsPresent: !!touchHints,
        touchHintsText: hintsText,
        pageTitle: document.querySelector('h1')?.textContent || ''
      };
    });
    
    console.log('📊 Page Structure:');
    console.log(`   - Title: "${pageAnalysis.pageTitle}"`);
    console.log(`   - Product Customizer: ${pageAnalysis.hasProductCustomizer ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Product Selection: ${pageAnalysis.hasProductSelection ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Layout: ${pageAnalysis.layoutInfo.hasTwoColumns ? '2-column grid' : 'Single column'}`);
    
    if (pageAnalysis.controlsAnalysis.found) {
      console.log('\n🎮 Controls in ProductCustomizer:');
      console.log(`   - Material Buttons: ${pageAnalysis.controlsAnalysis.materialButtons}`);
      console.log(`   - Navigation Buttons: ${pageAnalysis.controlsAnalysis.navigationButtons}`);
      console.log(`   - Frame Indicator: ${pageAnalysis.controlsAnalysis.hasFrameIndicator ? `✅ "${pageAnalysis.controlsAnalysis.frameIndicatorText}"` : '❌ None'}`);
      console.log(`   - Total Buttons: ${pageAnalysis.controlsAnalysis.totalButtons}`);
    }
    
    console.log(`\n📱 Touch Hints: ${pageAnalysis.touchHintsPresent ? '✅ Present (mobile)' : '❌ None'}`);
    
    // Take focused screenshot of ProductCustomizer area
    const customizerBounds = await page.evaluate(() => {
      const customizer = document.querySelector('[data-testid="product-customizer"]');
      if (customizer) {
        const rect = customizer.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      return null;
    });
    
    if (customizerBounds) {
      await page.screenshot({ 
        path: 'product-customizer-focused.png',
        clip: customizerBounds
      });
      console.log('\n📸 ProductCustomizer screenshot saved: product-customizer-focused.png');
    }
    
    return pageAnalysis;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run examination
examineCustomizerCurrentState()
  .then(result => {
    console.log('\n✅ Examination complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });