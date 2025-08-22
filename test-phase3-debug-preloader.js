/**
 * Debug Material Preloader Integration
 * Tests if preloaded images are being used correctly
 */

const { chromium } = require('playwright');

async function debugPreloaderIntegration() {
  console.log('🧪 Debug: Material Preloader Integration');
  console.log('========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const consoleLogs = [];
  
  // Capture ALL console logs
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    // Show relevant logs immediately
    if (text.includes('preload') || 
        text.includes('Material changed') ||
        text.includes('Using preloaded') ||
        text.includes('Checking preloaded') ||
        text.includes('preloader:') ||
        text.includes('CLAUDE_RULES')) {
      console.log(`📊 ${text}`);
    }
  });
  
  try {
    console.log('\n📍 Loading customizer...');
    
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait for customizer to load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    console.log('✅ Customizer loaded');
    
    // Wait for preloading to complete
    console.log('\n⏳ Waiting for preloading to complete...');
    await page.waitForTimeout(3000);
    
    // Test material switch
    console.log('\n🔄 Testing material switch to platinum...');
    const platinumButton = page.locator('[data-material="platinum"]');
    
    if (await platinumButton.count() > 0) {
      await platinumButton.click();
      
      // Wait for switch to complete
      await page.waitForTimeout(1000);
      
      console.log('\n📊 Console logs during switch:');
      const switchLogs = consoleLogs.filter(log => 
        log.includes('Checking preloaded') || 
        log.includes('Using preloaded') ||
        log.includes('Material preloader:') ||
        log.includes('Material changed in')
      );
      
      if (switchLogs.length > 0) {
        switchLogs.forEach((log, i) => {
          console.log(`   [${i+1}] ${log}`);
        });
      } else {
        console.log('   ❌ No relevant preloader logs found during switch');
      }
      
      // Test another switch
      console.log('\n🔄 Testing material switch to white gold...');
      const whiteGoldButton = page.locator('[data-material="18k-white-gold"]');
      
      if (await whiteGoldButton.count() > 0) {
        const beforeSwitchLogs = consoleLogs.length;
        await whiteGoldButton.click();
        await page.waitForTimeout(1000);
        
        const newLogs = consoleLogs.slice(beforeSwitchLogs);
        console.log('\n📊 New logs from second switch:');
        if (newLogs.length > 0) {
          newLogs.forEach((log, i) => {
            if (log.includes('preload') || log.includes('Material') || log.includes('CLAUDE_RULES')) {
              console.log(`   [${i+1}] ${log}`);
            }
          });
        } else {
          console.log('   ❌ No new logs detected');
        }
      }
    }
    
    // Debug: Check preloader cache state
    console.log('\n🔍 Checking preloader cache state...');
    const cacheStats = await page.evaluate(() => {
      // Try to access the material preloader
      if (typeof window !== 'undefined' && window.materialPreloader) {
        return window.materialPreloader.getCacheStats();
      }
      return null;
    });
    
    if (cacheStats) {
      console.log('📊 Cache stats:', cacheStats);
    } else {
      console.log('❌ Could not access material preloader cache');
    }
    
    // Show all preloading related logs
    console.log('\n📋 All preloading related logs:');
    const preloadLogs = consoleLogs.filter(log => 
      log.includes('preload') || 
      log.includes('priority material') ||
      log.includes('All materials preloaded')
    );
    
    preloadLogs.forEach((log, i) => {
      console.log(`   [${i+1}] ${log}`);
    });
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run debug test
debugPreloaderIntegration();