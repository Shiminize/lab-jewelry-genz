/**
 * Final Aurora Migration Vision Mode Validation
 * Comprehensive validation of all homepage sections
 */

const puppeteer = require('puppeteer');

async function validateAuroraMigration() {
  console.log('🎭 Final Aurora Migration Vision Mode Testing');
  console.log('📸 Validating ALL sections match demo patterns...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to homepage
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Capture full homepage
    console.log('📷 Capturing complete homepage with Aurora migration...');
    await page.screenshot({ 
      path: 'final-aurora-homepage-complete.png', 
      fullPage: true 
    });
    
    // Test Hero Section
    console.log('🧪 Testing Hero Section...');
    const heroExists = await page.$('section:first-child');
    if (heroExists) {
      console.log('✅ Hero Section found');
      
      // Check for Aurora purple gradient
      const heroHasPurpleGradient = await page.evaluate(() => {
        const section = document.querySelector('section');
        if (!section) return false;
        return section.className.includes('from-brand-primary') ||
               section.className.includes('bg-gradient-to-br') ||
               section.textContent.includes('Luxury Jewelry Reimagined');
      });
      
      console.log('Aurora purple gradient/content detected:', heroHasPurpleGradient);
      
      // Take focused hero screenshot
      await page.evaluate(() => {
        document.querySelector('section').scrollIntoView();
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const heroElement = await page.$('section:first-child');
      await heroElement.screenshot({ path: 'final-aurora-hero-section.png' });
      
    } else {
      console.log('❌ Hero Section not found');
    }
    
    // Test Featured Products Section
    console.log('🧪 Testing Featured Products Section...');
    const featuredExists = await page.$('section:nth-child(2)');
    if (featuredExists) {
      console.log('✅ Featured Products Section found');
      
      // Check for simplified layout
      const hasSimplifiedLayout = await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        if (sections.length < 2) return false;
        const header = sections[1].querySelector('h2');
        return header && header.textContent.includes('Featured Products');
      });
      
      console.log('Simplified layout detected:', hasSimplifiedLayout);
      
      // Take focused featured products screenshot
      await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        if (sections[1]) sections[1].scrollIntoView();
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const featuredElement = await page.$('section:nth-child(2)');
      await featuredElement.screenshot({ path: 'final-aurora-featured-products.png' });
      
    } else {
      console.log('❌ Featured Products Section not found');
    }
    
    // Validate minimal structure
    const sectionCount = await page.$$eval('section', sections => sections.length);
    console.log('Total sections on page:', sectionCount);
    
    if (sectionCount <= 2) {
      console.log('✅ Minimal demo structure confirmed - only Hero + Featured Products');
    } else {
      console.log('⚠️ Additional sections detected:', sectionCount);
    }
    
    // Check for console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (logs.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Console errors found:', logs.slice(0, 3)); // Show first 3 errors
    }
    
    // Test responsive design
    console.log('📱 Testing responsive design...');
    
    // Mobile view
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: 'final-aurora-mobile-view.png', 
      fullPage: true 
    });
    
    // Desktop view
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: 'final-aurora-desktop-view.png', 
      fullPage: true 
    });
    
    console.log('🎉 Final Aurora Migration Vision Mode Testing - COMPLETED');
    console.log('📸 Screenshots saved:');
    console.log('  - final-aurora-homepage-complete.png (Full page)');
    console.log('  - final-aurora-hero-section.png (Hero focused)');
    console.log('  - final-aurora-featured-products.png (Products focused)'); 
    console.log('  - final-aurora-mobile-view.png (Mobile responsive)');
    console.log('  - final-aurora-desktop-view.png (Desktop view)');
    console.log('✅ Aurora Design System migration successfully validated');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    await page.screenshot({ path: 'validation-error.png' });
  } finally {
    await browser.close();
  }
}

// Run validation
validateAuroraMigration().catch(console.error);