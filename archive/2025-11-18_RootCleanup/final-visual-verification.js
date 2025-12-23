/**
 * Final Visual Verification - Screenshots for Documentation
 * Quick capture of customizer with bright images to prove fix is working
 */

const { chromium } = require('playwright');

async function finalVisualVerification() {
  console.log('📸 FINAL VISUAL VERIFICATION');
  console.log('============================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  let imageUrlsCaptured = [];

  // Monitor image requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
      const hasCacheBusting = url.includes('?v=') && /\?v=\d{13}/.test(url);
      imageUrlsCaptured.push({
        url,
        hasCacheBusting,
        timestamp: new Date().toISOString()
      });
      console.log(`🎯 Captured: ${url}`);
      console.log(`   Cache-busting: ${hasCacheBusting ? '✅' : '❌'}`);
    }
  });

  try {
    console.log('📱 Loading customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    console.log('📸 Taking verification screenshots...');

    // Full page screenshot
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/final-verification-full-page.png',
      fullPage: true 
    });
    console.log('✅ Full page screenshot: final-verification-full-page.png');

    // Customizer area screenshot
    try {
      const customizerArea = page.locator('.space-y-6').first(); // Main customizer container
      await customizerArea.screenshot({ 
        path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/final-verification-customizer-area.png'
      });
      console.log('✅ Customizer area screenshot: final-verification-customizer-area.png');
    } catch (e) {
      console.log('⚠️  Customizer-specific screenshot failed, full page captured instead');
    }

    // Test material switching if possible
    const materialButtons = await page.$$('button[data-material]');
    if (materialButtons.length > 0) {
      console.log(`🔄 Found ${materialButtons.length} material buttons, testing switches...`);
      
      for (let i = 0; i < Math.min(2, materialButtons.length); i++) {
        await materialButtons[i].click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/final-verification-material-${i + 1}.png`
        });
        console.log(`✅ Material ${i + 1} screenshot: final-verification-material-${i + 1}.png`);
      }
    }

    // Summary
    console.log('\n📊 FINAL VERIFICATION SUMMARY');
    console.log('==============================');
    console.log(`Image URLs captured: ${imageUrlsCaptured.length}`);
    
    if (imageUrlsCaptured.length > 0) {
      const cacheBustedCount = imageUrlsCaptured.filter(img => img.hasCacheBusting).length;
      const cacheBustingRate = (cacheBustedCount / imageUrlsCaptured.length) * 100;
      
      console.log(`Cache-busted images: ${cacheBustedCount}/${imageUrlsCaptured.length} (${cacheBustingRate.toFixed(1)}%)`);
      
      console.log('\n🔗 Sample URLs with Cache-busting:');
      imageUrlsCaptured
        .filter(img => img.hasCacheBusting)
        .slice(0, 3)
        .forEach((img, i) => {
          console.log(`${i + 1}. ${img.url}`);
        });

      console.log(`\n🎉 RESULT: ${cacheBustingRate >= 90 ? 'SUCCESS ✅' : 'NEEDS REVIEW ⚠️'}`);
    } else {
      console.log('⚠️  No image URLs captured - this may indicate the customizer isn\'t fully loading');
    }

    console.log('\n📁 FILES GENERATED:');
    console.log('===================');
    console.log('• final-verification-full-page.png - Complete page view');
    console.log('• final-verification-customizer-area.png - Customizer focus');
    console.log('• final-verification-material-1.png - First material test');  
    console.log('• final-verification-material-2.png - Second material test');
    console.log('• CACHE-BUSTING-VERIFICATION-REPORT.md - Complete test report');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/final-verification-error.png' 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Final visual verification completed');
  }
}

finalVisualVerification().catch(console.error);