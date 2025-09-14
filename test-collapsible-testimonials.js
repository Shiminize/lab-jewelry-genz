/**
 * Test Collapsible Testimonials Functionality
 * Validates the implementation of collapsible testimonials with Atlas Icons
 */

const { chromium } = require('playwright');

async function testCollapsibleTestimonials() {
  console.log('🧪 Testing Collapsible Testimonials Implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to homepage
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Find the testimonials section
    console.log('🔍 Looking for testimonials section...');
    const testimonialsSection = await page.locator('text=What Our Community Says').first();
    await testimonialsSection.scrollIntoViewIfNeeded();
    
    // Check for collapsible trigger button
    console.log('🔘 Checking for collapsible trigger button...');
    const collapseButton = page.locator('button:has-text("Show More Reviews"), button:has-text("Show Less")');
    const buttonExists = await collapseButton.count() > 0;
    console.log(`${buttonExists ? '✅' : '❌'} Collapsible trigger button found: ${buttonExists}`);
    
    if (buttonExists) {
      // Check initial state (should show "Show More Reviews")
      const showMoreButton = page.locator('button:has-text("Show More Reviews")');
      const isShowMore = await showMoreButton.count() > 0;
      console.log(`${isShowMore ? '✅' : '❌'} Initial state shows "Show More Reviews": ${isShowMore}`);
      
      // Check for Atlas Icons arrow
      const arrowIcon = page.locator('button:has-text("Show More Reviews") svg, button:has-text("Show More Reviews") [data-testid*="icon"]');
      const hasArrow = await arrowIcon.count() > 0;
      console.log(`${hasArrow ? '✅' : '❌'} Arrow icon present: ${hasArrow}`);
      
      // Count initial testimonials
      const initialTestimonials = await page.locator('[data-testid="testimonial-card"], .testimonial-card, [class*="testimonial"]').count();
      console.log(`📊 Initial testimonials visible: ${initialTestimonials}`);
      
      // Test expand functionality
      console.log('🎯 Testing expand functionality...');
      await collapseButton.click();
      await page.waitForTimeout(1000); // Wait for animation
      
      // Check if button text changed to "Show Less"
      const showLessButton = page.locator('button:has-text("Show Less")');
      const isShowLess = await showLessButton.count() > 0;
      console.log(`${isShowLess ? '✅' : '❌'} Button text changed to "Show Less": ${isShowLess}`);
      
      // Count expanded testimonials
      const expandedTestimonials = await page.locator('[data-testid="testimonial-card"], .testimonial-card, [class*="testimonial"]').count();
      console.log(`📊 Expanded testimonials visible: ${expandedTestimonials}`);
      console.log(`${expandedTestimonials > initialTestimonials ? '✅' : '❌'} More testimonials shown when expanded`);
      
      // Test collapse functionality
      console.log('🎯 Testing collapse functionality...');
      if (isShowLess) {
        await showLessButton.click();
        await page.waitForTimeout(1000); // Wait for animation
        
        const backToShowMore = await page.locator('button:has-text("Show More Reviews")').count() > 0;
        console.log(`${backToShowMore ? '✅' : '❌'} Button text changed back to "Show More Reviews": ${backToShowMore}`);
      }
    }
    
    // Check border radius consistency
    console.log('🎨 Checking border radius consistency...');
    await page.addStyleTag({
      content: `
        .border-radius-check { 
          outline: 2px solid red !important; 
          outline-offset: 2px; 
        }
      `
    });
    
    // Check if testimonial cards have rounded-token-lg class
    const cardsWithBorderRadius = await page.locator('[class*="rounded-token-lg"]').count();
    console.log(`📐 Elements with rounded-token-lg: ${cardsWithBorderRadius}`);
    
    // Take a screenshot for visual verification
    console.log('📸 Taking screenshot for visual verification...');
    await page.screenshot({ 
      path: 'collapsible-testimonials-test.png', 
      fullPage: true 
    });
    
    console.log('🎉 Collapsible testimonials test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testCollapsibleTestimonials().catch(console.error);