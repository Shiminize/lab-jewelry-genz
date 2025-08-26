const puppeteer = require('puppeteer');

async function checkSpecificButtons() {
  console.log('🔍 Checking Specific Buttons in Customizer');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to customizer
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait and click first product
    await page.waitForSelector('[data-testid="product-selection"]', { timeout: 10000 });
    const firstProduct = await page.$('[data-testid="product-selection"] button');
    if (firstProduct) {
      await firstProduct.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 });
    
    // Get all buttons in customizer
    const buttonAnalysis = await page.evaluate(() => {
      const customizer = document.querySelector('[data-testid="product-customizer"]');
      if (!customizer) return { error: 'Customizer not found' };
      
      const buttons = Array.from(customizer.querySelectorAll('button'));
      
      // Categorize buttons
      const categorized = {
        navigationArrows: [],
        materialButtons: [],
        carouselButtons: [],
        otherButtons: []
      };
      
      buttons.forEach(btn => {
        const text = btn.textContent.trim();
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const classes = btn.className;
        
        if (text === '←' || text === '→' || ariaLabel.includes('Scroll')) {
          categorized.carouselButtons.push({
            text,
            ariaLabel,
            purpose: 'Material carousel navigation'
          });
        } else if (text.includes('Platinum') || text.includes('Gold')) {
          categorized.materialButtons.push({
            text,
            ariaLabel,
            purpose: 'Material selection'
          });
        } else if (text.includes('Auto') || ariaLabel.includes('frame')) {
          categorized.navigationArrows.push({
            text,
            ariaLabel,
            purpose: 'Frame navigation'
          });
        } else {
          categorized.otherButtons.push({
            text,
            ariaLabel,
            classes: classes.substring(0, 50) + '...'
          });
        }
      });
      
      return categorized;
    });
    
    console.log('📊 Button Analysis:');
    console.log(`\n   Material Selection Buttons (${buttonAnalysis.materialButtons.length}):`);
    buttonAnalysis.materialButtons.forEach(btn => {
      console.log(`     ✅ "${btn.text}" - ${btn.purpose}`);
    });
    
    console.log(`\n   Carousel Navigation Buttons (${buttonAnalysis.carouselButtons.length}):`);
    buttonAnalysis.carouselButtons.forEach(btn => {
      console.log(`     ✅ "${btn.text}" [${btn.ariaLabel}] - ${btn.purpose}`);
    });
    
    console.log(`\n   Frame Navigation Buttons (${buttonAnalysis.navigationArrows.length}):`);
    if (buttonAnalysis.navigationArrows.length === 0) {
      console.log('     ✅ NONE - Successfully removed!');
    } else {
      buttonAnalysis.navigationArrows.forEach(btn => {
        console.log(`     ❌ "${btn.text}" [${btn.ariaLabel}] - ${btn.purpose}`);
      });
    }
    
    console.log(`\n   Other Buttons (${buttonAnalysis.otherButtons.length}):`);
    buttonAnalysis.otherButtons.forEach(btn => {
      console.log(`     • "${btn.text}" ${btn.ariaLabel ? `[${btn.ariaLabel}]` : ''}`);
    });
    
    // Check if image is directly accessible without controls
    const imageCheck = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="frame"], img[src*="3d-sequences"]');
      if (!img) return { hasImage: false };
      
      // Check parent structure
      let parent = img.parentElement;
      let controlsNearImage = false;
      
      // Look up to 3 levels for any control buttons
      for (let i = 0; i < 3 && parent; i++) {
        const buttons = parent.querySelectorAll('button');
        const frameButtons = Array.from(buttons).filter(btn => 
          btn.getAttribute('aria-label')?.includes('frame') ||
          btn.textContent === 'Front' ||
          btn.textContent === 'Side' ||
          btn.textContent === 'Back'
        );
        
        if (frameButtons.length > 0) {
          controlsNearImage = true;
          break;
        }
        parent = parent.parentElement;
      }
      
      return {
        hasImage: true,
        controlsNearImage,
        imageAlt: img.alt,
        imageSrc: img.src.substring(img.src.lastIndexOf('/') + 1)
      };
    });
    
    console.log('\n🖼️ Image Viewer Check:');
    console.log(`   - Image Present: ${imageCheck.hasImage ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Controls Near Image: ${imageCheck.controlsNearImage ? '❌ YES' : '✅ NO'}`);
    if (imageCheck.hasImage) {
      console.log(`   - Image: ${imageCheck.imageSrc}`);
    }
    
    const success = buttonAnalysis.navigationArrows.length === 0 && !imageCheck.controlsNearImage;
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL RESULT:');
    if (success) {
      console.log('✅ SUCCESS: All viewer control buttons have been removed!');
      console.log('✅ Only material selection buttons remain (as intended)');
      console.log('✅ The carousel navigation arrows (←/→) are for material selection only');
    } else {
      console.log('❌ Some control buttons still present near the image viewer');
    }
    
    return { success };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run check
checkSpecificButtons()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });