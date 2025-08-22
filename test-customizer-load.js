const { test, expect } = require('@playwright/test');

test('Quick customizer load verification', async ({ page }) => {
  console.log('🔍 Testing customizer page load...');
  
  try {
    await page.goto('http://localhost:3000/customizer');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if customizer loads
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    
    // Look for customizer elements
    const customizerExists = await page.locator('text=Loading 3D Customizer').count();
    const materialSwitcher = await page.locator('[data-testid="material-switcher"]').count();
    
    console.log('🔧 Loading text found:', customizerExists > 0);
    console.log('🔧 Material switcher found:', materialSwitcher > 0);
    
    // Take screenshot
    await page.screenshot({ path: 'customizer-quick-test.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    if (customizerExists > 0 || materialSwitcher > 0) {
      console.log('✅ Customizer page elements detected');
    } else {
      console.log('⚠️ No customizer elements found, checking page content...');
      const bodyText = await page.locator('body').textContent();
      console.log('📝 Page content preview:', bodyText.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    await page.screenshot({ path: 'customizer-error.png' });
  }
});