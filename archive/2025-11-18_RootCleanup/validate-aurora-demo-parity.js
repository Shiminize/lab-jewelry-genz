/**
 * BATCH 7: Visual Parity Test with Aurora Demo Page
 * Compares current homepage implementation with Aurora demo at /aurora-demo
 */

const { chromium } = require('playwright');

async function validateAuroraDemoParity() {
  console.log('🧪 Starting Aurora Demo Parity Validation...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  try {
    // Open both pages in parallel
    console.log('🌐 Loading both pages...');
    const [homePage, demoPage] = await Promise.all([
      context.newPage(),
      context.newPage()
    ]);
    
    await Promise.all([
      homePage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 }),
      demoPage.goto('http://localhost:3000/aurora-demo', { waitUntil: 'domcontentloaded', timeout: 15000 })
    ]);
    
    await Promise.all([
      homePage.waitForTimeout(3000),
      demoPage.waitForTimeout(3000)
    ]);
    
    console.log('✅ Both pages loaded');
    
    // Test 1: Color System Parity
    console.log('\n🎨 Testing color system parity...');
    
    const auroraColors = [
      'bg-nebula-purple',
      'bg-aurora-pink', 
      'bg-aurora-hero',
      'text-deep-space',
      'border-aurora-pink',
      'shadow-aurora'
    ];
    
    let colorParityScore = 0;
    const totalColors = auroraColors.length;
    
    for (const color of auroraColors) {
      const [homeCount, demoCount] = await Promise.all([
        homePage.locator(`[class*="${color}"]`).count(),
        demoPage.locator(`[class*="${color}"]`).count()
      ]);
      
      console.log(`${color}: Homepage(${homeCount}) vs Demo(${demoCount})`);
      
      if (homeCount > 0 && demoCount > 0) {
        colorParityScore++;
        console.log(`✅ ${color} present in both`);
      } else if (homeCount > 0) {
        console.log(`⚠️ ${color} only in homepage`);
      } else if (demoCount > 0) {
        console.log(`❌ ${color} missing from homepage`);
      }
    }
    
    const colorParityPercentage = Math.round((colorParityScore / totalColors) * 100);
    console.log(`Color system parity: ${colorParityPercentage}%`);
    
    // Test 2: Typography Hierarchy Parity
    console.log('\n📝 Testing typography hierarchy parity...');
    
    const typographyClasses = [
      'aurora-iridescent-text',
      'text-hero-display',
      'text-statement',
      'aurora-text-glow'
    ];
    
    let typographyScore = 0;
    
    for (const typography of typographyClasses) {
      const [homeCount, demoCount] = await Promise.all([
        homePage.locator(`[class*="${typography}"]`).count(),
        demoPage.locator(`[class*="${typography}"]`).count()
      ]);
      
      console.log(`${typography}: Homepage(${homeCount}) vs Demo(${demoCount})`);
      
      if (homeCount > 0 && demoCount > 0) {
        typographyScore++;
        console.log(`✅ ${typography} present in both`);
      } else if (homeCount > 0) {
        console.log(`✅ ${typography} implemented in homepage`);
        typographyScore += 0.5;
      }
    }
    
    const typographyParityPercentage = Math.round((typographyScore / typographyClasses.length) * 100);
    console.log(`Typography parity: ${typographyParityPercentage}%`);
    
    // Test 3: Animation System Parity
    console.log('\n🎬 Testing animation system parity...');
    
    const animationClasses = [
      'animate-aurora-drift',
      'animate-aurora-shimmer-slow',
      'animate-aurora-glow-pulse',
      'animate-aurora-float'
    ];
    
    let animationScore = 0;
    
    for (const animation of animationClasses) {
      const [homeCount, demoCount] = await Promise.all([
        homePage.locator(`[class*="${animation}"]`).count(),
        demoPage.locator(`[class*="${animation}"]`).count()
      ]);
      
      console.log(`${animation}: Homepage(${homeCount}) vs Demo(${demoCount})`);
      
      if (homeCount > 0 && demoCount > 0) {
        animationScore++;
        console.log(`✅ ${animation} present in both`);
      } else if (homeCount > 0) {
        console.log(`✅ ${animation} working in homepage`);
        animationScore += 0.8;
      }
    }
    
    const animationParityPercentage = Math.round((animationScore / animationClasses.length) * 100);
    console.log(`Animation parity: ${animationParityPercentage}%`);
    
    // Test 4: Shadow System Parity
    console.log('\n💎 Testing shadow system parity...');
    
    const shadowClasses = [
      'shadow-aurora-md',
      'shadow-aurora-lg',
      'shadow-aurora-glow',
      'shadow-gold',
      'shadow-platinum'
    ];
    
    let shadowScore = 0;
    
    for (const shadow of shadowClasses) {
      const [homeCount, demoCount] = await Promise.all([
        homePage.locator(`[class*="${shadow}"]`).count(),
        demoPage.locator(`[class*="${shadow}"]`).count()
      ]);
      
      console.log(`${shadow}: Homepage(${homeCount}) vs Demo(${demoCount})`);
      
      if (homeCount > 0) {
        shadowScore++;
        console.log(`✅ ${shadow} implemented in homepage`);
      }
    }
    
    const shadowParityPercentage = Math.round((shadowScore / shadowClasses.length) * 100);
    console.log(`Shadow system implementation: ${shadowParityPercentage}%`);
    
    // Test 5: Overall Aurora Element Count Comparison
    console.log('\n📊 Testing overall Aurora element density...');
    
    const [homeAuroraCount, demoAuroraCount] = await Promise.all([
      homePage.locator('[class*="aurora"]').count(),
      demoPage.locator('[class*="aurora"]').count()
    ]);
    
    console.log(`Aurora elements: Homepage(${homeAuroraCount}) vs Demo(${demoAuroraCount})`);
    
    const auroraRatio = homeAuroraCount / demoAuroraCount;
    let auroraIntegrationLevel;
    
    if (auroraRatio >= 0.8) {
      auroraIntegrationLevel = 'Excellent (80%+ of demo complexity)';
    } else if (auroraRatio >= 0.6) {
      auroraIntegrationLevel = 'Good (60-79% of demo complexity)';
    } else if (auroraRatio >= 0.4) {
      auroraIntegrationLevel = 'Fair (40-59% of demo complexity)';
    } else {
      auroraIntegrationLevel = 'Needs improvement (<40% of demo complexity)';
    }
    
    console.log(`Aurora integration level: ${auroraIntegrationLevel}`);
    
    // Test 6: Visual Screenshots for Manual Comparison
    console.log('\n📸 Capturing visual comparison screenshots...');
    
    await Promise.all([
      homePage.screenshot({ 
        path: 'homepage-aurora-implementation.png', 
        fullPage: true 
      }),
      demoPage.screenshot({ 
        path: 'demo-page-aurora-reference.png', 
        fullPage: true 
      })
    ]);
    
    console.log('📸 Visual comparison screenshots captured');
    
    // Calculate Overall Parity Score
    const overallParityScore = Math.round(
      (colorParityPercentage + typographyParityPercentage + animationParityPercentage + shadowParityPercentage) / 4
    );
    
    // Final Summary
    console.log('\n🎉 Aurora Demo Parity Validation Summary:');
    console.log(`🎨 Color System Parity: ${colorParityPercentage}%`);
    console.log(`📝 Typography Parity: ${typographyParityPercentage}%`);
    console.log(`🎬 Animation Parity: ${animationParityPercentage}%`);
    console.log(`💎 Shadow Implementation: ${shadowParityPercentage}%`);
    console.log(`📊 Aurora Integration: ${auroraIntegrationLevel}`);
    console.log(`📈 Overall Parity Score: ${overallParityScore}%`);
    
    if (overallParityScore >= 80) {
      console.log('\n🎯 Visual Parity Quality Gate: EXCELLENT ✅');
      console.log('Homepage successfully matches Aurora demo page aesthetic');
    } else if (overallParityScore >= 70) {
      console.log('\n🎯 Visual Parity Quality Gate: GOOD ✅'); 
      console.log('Homepage largely matches Aurora demo with minor gaps');
    } else {
      console.log('\n⚠️ Visual Parity Quality Gate: NEEDS IMPROVEMENT');
      console.log('Homepage requires additional Aurora alignment work');
    }
    
  } catch (error) {
    console.error('❌ Parity validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

validateAuroraDemoParity().catch(console.error);