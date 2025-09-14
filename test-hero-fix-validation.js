/**
 * Quick Hero Animation Fix Validation
 * Test to verify the animation variants error is resolved
 */

const puppeteer = require('puppeteer');

async function validateHeroFix() {
  console.log('🎯 Hero Animation Fix Validation');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    const page = await browser.newPage();
    
    // Track console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log('📡 Loading homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const validation = await page.evaluate(() => {
      // Check if we're still on an error page
      const hasErrorBoundary = document.body.textContent.includes('Something went wrong');
      const hasHeroContent = document.body.textContent.includes('Your Story, Our Sparkle');
      const hasHeroSection = document.querySelector('section') !== null;
      
      return {
        hasErrorBoundary,
        hasHeroContent,
        hasHeroSection,
        pageTitle: document.title
      };
    });
    
    console.log('📊 Validation Results:');
    console.log(`   Error Boundary: ${validation.hasErrorBoundary ? '❌ Still showing' : '✅ Resolved'}`);
    console.log(`   Hero Content: ${validation.hasHeroContent ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Hero Section: ${validation.hasHeroSection ? '✅ Rendered' : '❌ Missing'}`);
    console.log(`   Console Errors: ${errors.length === 0 ? '✅ None' : `❌ ${errors.length} found`}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Console Errors:');
      errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    }
    
    const success = !validation.hasErrorBoundary && 
                   validation.hasHeroContent && 
                   validation.hasHeroSection &&
                   errors.length === 0;
    
    if (success) {
      console.log('\n🎉 Hero animation fix: SUCCESS');
      console.log('   ✅ Error boundary resolved');
      console.log('   ✅ Hero section rendering correctly');
      console.log('   ✅ No console errors');
    } else {
      console.log('\n⚠️  Hero animation fix: ISSUES REMAIN');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
if (require.main === module) {
  validateHeroFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation execution failed:', error);
      process.exit(1);
    });
}

module.exports = validateHeroFix;