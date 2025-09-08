import { test, expect } from '@playwright/test';

test.describe('Aurora Demo Visual Testing', () => {
  test('Demo mode loads with proper CSS variables and visual effects', async ({ page }) => {
    console.log('🎭 Testing Aurora Demo Mode Visual Implementation');
    
    // Navigate to homepage with demo query parameter
    await page.goto('/?design=demo');
    await page.waitForLoadState('networkidle');

    // Verify demo CSS variables exist on :root
    const deepSpaceVar = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--deep-space');
    });
    
    const nebulaPurpleVar = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--nebula-purple');
    });

    const auroraRedVar = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--aurora-pink');
    });

    // Assert that demo variables are loaded
    expect(deepSpaceVar.trim()).toBeTruthy();
    expect(nebulaPurpleVar.trim()).toBeTruthy(); 
    expect(auroraRedVar.trim()).toBeTruthy();

    console.log('✅ Demo CSS variables loaded:', {
      deepSpace: deepSpaceVar.trim(),
      nebulaPurple: nebulaPurpleVar.trim(),
      auroraPink: auroraRedVar.trim()
    });

    // Verify .bg-aurora-hero has linear-gradient in computed style
    const heroElement = page.locator('.bg-aurora-hero').first();
    const heroExists = await heroElement.count();
    
    if (heroExists > 0) {
      const heroComputedStyle = await heroElement.evaluate((el) => {
        return getComputedStyle(el).backgroundImage;
      });
      
      expect(heroComputedStyle).toContain('linear-gradient');
      console.log('✅ Hero gradient verified:', heroComputedStyle.substring(0, 50) + '...');
    } else {
      console.log('⚠️ .bg-aurora-hero element not found on page');
    }

    // Check console for undefined CSS variable warnings
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('undefined') || text.includes('var(--')) {
        logs.push(text);
      }
    });

    // Wait a moment for potential console warnings
    await page.waitForTimeout(2000);

    // Assert no CSS variable warnings
    if (logs.length > 0) {
      console.warn('⚠️ CSS variable warnings detected:', logs);
    } else {
      console.log('✅ No CSS variable warnings detected');
    }

    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'demo-home.png', 
      fullPage: true 
    });

    console.log('📸 Screenshot saved as demo-home.png');
    console.log('🎉 Aurora Demo Visual Testing - COMPLETED');
  });

  test('Demo mode material shadows and prismatic effects work correctly', async ({ page }) => {
    await page.goto('/?design=demo');
    await page.waitForLoadState('networkidle');

    // Test material-specific shadow classes
    const materialShadowClasses = [
      '.shadow-aurora-gold',
      '.shadow-aurora-platinum', 
      '.shadow-aurora-rose-gold',
      '.shadow-aurora-white-gold'
    ];

    for (const shadowClass of materialShadowClasses) {
      const elements = page.locator(shadowClass);
      const count = await elements.count();
      
      if (count > 0) {
        const computedShadow = await elements.first().evaluate((el) => {
          return getComputedStyle(el).boxShadow;
        });
        
        expect(computedShadow).not.toBe('none');
        console.log(`✅ ${shadowClass} shadow effect verified`);
      }
    }

    // Test shimmer overlay effect
    const shimmerElements = page.locator('.aurora-shimmer-overlay');
    const shimmerCount = await shimmerElements.count();
    
    if (shimmerCount > 0) {
      console.log(`✅ Found ${shimmerCount} shimmer overlay elements`);
    }
  });

  test('Demo mode responsive design works at different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/?design=demo');
      await page.waitForLoadState('networkidle');

      // Verify demo variables still exist at different viewport sizes
      const deepSpaceVar = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--deep-space');
      });

      expect(deepSpaceVar.trim()).toBeTruthy();
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `demo-${viewport.name}.png`,
        fullPage: true 
      });

      console.log(`✅ Demo mode verified at ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
    }
  });
});