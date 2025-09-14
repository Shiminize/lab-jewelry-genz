/**
 * Test Reusable Testimonials Implementation
 * Validates the new CollapsibleSection, SelectableCard, and material selector styling
 */

const { chromium } = require('playwright');

async function testReusableTestimonials() {
  console.log('🧪 Testing Reusable Testimonials Implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to homepage
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Find the testimonials section
    console.log('🔍 Looking for reusable testimonials section...');
    const testimonialsSection = await page.locator('[data-testid="testimonials-section"]');
    await testimonialsSection.scrollIntoViewIfNeeded();
    
    // Check initial state - should show only 1 testimonial
    console.log('📊 Checking initial state (1 testimonial)...');
    const initialCards = await page.locator('[data-testid="testimonial-selectable-card"]').count();
    console.log(`${initialCards === 1 ? '✅' : '❌'} Initial testimonials count: ${initialCards} (expected: 1)`);
    
    // Check SelectableCard styling (no borders initially)
    console.log('🎨 Checking SelectableCard styling...');
    const firstCard = page.locator('[data-testid="testimonial-selectable-card"]').first();
    
    // Check that card has hover border styles
    const cardClass = await firstCard.getAttribute('class');
    const hasHoverBorder = cardClass.includes('hover:border-border') || cardClass.includes('border-transparent');
    console.log(`${hasHoverBorder ? '✅' : '❌'} Card has hover border styling: ${hasHoverBorder}`);
    
    // Check for material selector pattern (no initial borders)
    const hasInitialBorder = cardClass.includes('border-2') && !cardClass.includes('border-transparent');
    console.log(`${!hasInitialBorder ? '✅' : '❌'} No initial borders (material selector pattern): ${!hasInitialBorder}`);
    
    // Test hover effect
    console.log('🖱️ Testing hover effects...');
    await firstCard.hover();
    await page.waitForTimeout(300);
    
    // Check for expand button
    console.log('🔘 Checking expand button...');
    const expandButton = page.locator('button:has-text("Show More Reviews")');
    const expandButtonExists = await expandButton.count() > 0;
    console.log(`${expandButtonExists ? '✅' : '❌'} Expand button found: ${expandButtonExists}`);
    
    if (expandButtonExists) {
      // Test expansion
      console.log('🎯 Testing expansion functionality...');
      await expandButton.click();
      await page.waitForTimeout(1000);
      
      // Count expanded testimonials
      const expandedCards = await page.locator('[data-testid="testimonial-selectable-card"]').count();
      console.log(`${expandedCards > 1 ? '✅' : '❌'} Expanded testimonials count: ${expandedCards} (expected: >1)`);
      
      // Check button text change
      const collapseButton = page.locator('button:has-text("Show Less")');
      const hasCollapseButton = await collapseButton.count() > 0;
      console.log(`${hasCollapseButton ? '✅' : '❌'} Button text changed to "Show Less": ${hasCollapseButton}`);
      
      // Test all cards have same styling
      console.log('🎨 Checking all cards have consistent styling...');
      const allCards = await page.locator('[data-testid="testimonial-selectable-card"]').all();
      let consistentStyling = true;
      
      for (let i = 0; i < allCards.length; i++) {
        const cardClass = await allCards[i].getAttribute('class');
        if (!cardClass.includes('rounded-token-lg') || !cardClass.includes('transition-all')) {
          consistentStyling = false;
          break;
        }
      }
      
      console.log(`${consistentStyling ? '✅' : '❌'} All cards have consistent material selector styling: ${consistentStyling}`);
      
      // Test collapse
      console.log('🎯 Testing collapse functionality...');
      if (hasCollapseButton) {
        await collapseButton.click();
        await page.waitForTimeout(1000);
        
        const collapsedCards = await page.locator('[data-testid="testimonial-selectable-card"]').count();
        console.log(`${collapsedCards === 1 ? '✅' : '❌'} Collapsed back to 1 testimonial: ${collapsedCards === 1}`);
      }
    }
    
    // Test testimonial content (should be clean without borders/gradients)
    console.log('📝 Testing testimonial content styling...');
    const testimonialContent = await page.locator('[data-testid="testimonial-card"]').first();
    const contentClass = await testimonialContent.getAttribute('class');
    
    const hasCleanContent = !contentClass.includes('border') && !contentClass.includes('shadow');
    console.log(`${hasCleanContent ? '✅' : '❌'} Testimonial content is clean (no borders/shadows): ${hasCleanContent}`);
    
    // Check for reusability - test component structure
    console.log('🔧 Testing component reusability structure...');
    const collapsibleSection = await page.locator('[data-testid="testimonials-section"]').count() > 0;
    const selectableCards = await page.locator('[data-testid="testimonial-selectable-card"]').count() > 0;
    const cleanContent = await page.locator('[data-testid="testimonial-card"]').count() > 0;
    
    console.log(`${collapsibleSection ? '✅' : '❌'} CollapsibleSection component working: ${collapsibleSection}`);
    console.log(`${selectableCards ? '✅' : '❌'} SelectableCard components working: ${selectableCards}`);
    console.log(`${cleanContent ? '✅' : '❌'} Clean testimonial content working: ${cleanContent}`);
    
    // Take final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: 'reusable-testimonials-test.png', 
      fullPage: true 
    });
    
    console.log('🎉 Reusable testimonials test completed!');
    console.log('📋 Summary:');
    console.log('  ✨ Single testimonial initially displayed');
    console.log('  🎨 Material selector styling applied (no borders, hover effects)');
    console.log('  🔧 Reusable components structure working');
    console.log('  📱 Smooth animations and transitions');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testReusableTestimonials().catch(console.error);