const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('3D Customizer Vision Analysis', () => {
  test('Check 3D customizer image loading and material switching', async ({ page }) => {
    // Enable console logging to catch any errors
    page.on('console', msg => {
      console.log(`[Browser Console]: ${msg.type()}: ${msg.text()}`);
    });

    // Capture network failures
    page.on('requestfailed', request => {
      console.log(`[Network Failed]: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Try localhost:3001 first, then fallback to 3000
    let baseUrl = 'http://localhost:3001';
    try {
      await page.goto(`${baseUrl}/customizer`, { waitUntil: 'networkidle', timeout: 10000 });
      console.log('Successfully connected to localhost:3001');
    } catch (error) {
      console.log('Failed to connect to localhost:3001, trying localhost:3000...');
      baseUrl = 'http://localhost:3000';
      await page.goto(`${baseUrl}/customizer`, { waitUntil: 'networkidle', timeout: 15000 });
      console.log('Successfully connected to localhost:3000');
    }

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ 
      path: 'customizer-initial-state.png', 
      fullPage: true 
    });
    console.log('✓ Initial screenshot taken: customizer-initial-state.png');

    // Look for 3D jewelry display area
    const jewelryContainer = page.locator('[data-testid="3d-jewelry-display"], .jewelry-display, .customizer-preview, .three-canvas');
    
    if (await jewelryContainer.count() > 0) {
      console.log('✓ Found jewelry display container');
      
      // Take a focused screenshot of the jewelry area
      await jewelryContainer.first().screenshot({ path: 'jewelry-display-area.png' });
      console.log('✓ Jewelry display area screenshot taken');
    } else {
      console.log('⚠ Could not find specific jewelry display container, looking for images...');
    }

    // Check for any images in the customizer area
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images on the page`);

    // Analyze each image
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      
      if (src) {
        console.log(`Image ${i + 1}: ${src} (visible: ${isVisible}, alt: ${alt || 'none'})`);
        
        // Check if this looks like a 3D sequence image
        if (src.includes('3d-sequences') || src.includes('ring-luxury')) {
          console.log(`  → This appears to be a 3D sequence image!`);
          
          // Take screenshot of this specific image
          try {
            await img.screenshot({ path: `3d-image-${i + 1}.png` });
            console.log(`  → Screenshot saved: 3d-image-${i + 1}.png`);
          } catch (e) {
            console.log(`  → Could not screenshot image: ${e.message}`);
          }
        }
      }
    }

    // Look for material controls/buttons
    const materialButtons = page.locator('[data-material], .material-option, .material-control, button:has-text("platinum"), button:has-text("gold")');
    const materialCount = await materialButtons.count();
    console.log(`Found ${materialCount} potential material controls`);

    if (materialCount > 0) {
      // Take screenshot of material controls
      await page.screenshot({ path: 'material-controls-area.png' });
      console.log('✓ Material controls screenshot taken');

      // Test each material switch
      const materials = ['platinum', 'white-gold', 'yellow-gold', 'rose-gold'];
      
      for (const material of materials) {
        console.log(`\n--- Testing ${material} material ---`);
        
        // Try different selectors for material switching
        const selectors = [
          `[data-material="${material}"]`,
          `button:has-text("${material}")`,
          `.material-${material}`,
          `[aria-label*="${material}"]`,
          `button:has-text("${material.replace('-', ' ')}")`
        ];

        let switched = false;
        for (const selector of selectors) {
          const materialButton = page.locator(selector);
          if (await materialButton.count() > 0 && await materialButton.first().isVisible()) {
            try {
              console.log(`  Clicking material button with selector: ${selector}`);
              await materialButton.first().click();
              await page.waitForTimeout(2000); // Wait for material change
              
              // Take screenshot after material change
              await page.screenshot({ 
                path: `customizer-${material}-state.png`,
                fullPage: false,
                clip: { x: 0, y: 0, width: 1200, height: 800 }
              });
              console.log(`  ✓ Screenshot taken: customizer-${material}-state.png`);
              
              // Check if any images changed
              const newImages = page.locator('img[src*="3d-sequences"], img[src*="ring-luxury"]');
              const newImageCount = await newImages.count();
              
              if (newImageCount > 0) {
                const firstImage = newImages.first();
                const newSrc = await firstImage.getAttribute('src');
                console.log(`  → New image source: ${newSrc}`);
                
                // Take close-up of the jewelry image
                try {
                  await firstImage.screenshot({ path: `jewelry-${material}-closeup.png` });
                  console.log(`  ✓ Close-up screenshot: jewelry-${material}-closeup.png`);
                } catch (e) {
                  console.log(`  ⚠ Could not take close-up: ${e.message}`);
                }
              }
              
              switched = true;
              break;
            } catch (error) {
              console.log(`  ⚠ Failed to click ${selector}: ${error.message}`);
            }
          }
        }
        
        if (!switched) {
          console.log(`  ⚠ Could not find or click ${material} material button`);
        }
      }
    } else {
      console.log('⚠ No material control buttons found');
    }

    // Check network requests for image loading
    console.log('\n--- Checking for 3D sequence files ---');
    
    // Monitor network requests
    const imageRequests = [];
    page.on('request', request => {
      if (request.url().includes('3d-sequences') || request.url().includes('ring-luxury')) {
        imageRequests.push(request.url());
      }
    });

    // Trigger a page refresh to see what images are actually requested
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\nImage requests detected:');
    imageRequests.forEach((url, index) => {
      console.log(`  ${index + 1}: ${url}`);
    });

    // Check if the 3D sequence directories exist in public folder
    const publicPath = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/public';
    const sequencePaths = [
      'images/products/3d-sequences/ring-luxury-001-platinum',
      'images/products/3d-sequences/ring-luxury-001-white-gold', 
      'images/products/3d-sequences/ring-luxury-001-yellow-gold',
      'images/products/3d-sequences/ring-luxury-001-rose-gold'
    ];

    console.log('\n--- Checking file system for 3D sequences ---');
    for (const seqPath of sequencePaths) {
      const fullPath = path.join(publicPath, seqPath);
      try {
        const files = fs.readdirSync(fullPath);
        console.log(`✓ ${seqPath}: ${files.length} files found`);
        if (files.length > 0) {
          console.log(`  → Sample files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
        }
      } catch (error) {
        console.log(`✗ ${seqPath}: Directory not found or not accessible`);
      }
    }

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'customizer-final-analysis.png', 
      fullPage: true 
    });
    console.log('\n✓ Final comprehensive screenshot taken: customizer-final-analysis.png');

    // Get page title and URL for verification
    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`\nPage Analysis Complete:`);
    console.log(`  Title: ${pageTitle}`);
    console.log(`  URL: ${currentUrl}`);
    console.log(`  Screenshots saved in project root`);
  });
});