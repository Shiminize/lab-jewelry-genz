const { test, expect } = require('@playwright/test');

test.describe('Phase 4: 3D Performance and WebGL Context Testing', () => {
  test('3D Customizer Performance Validation', async ({ page }) => {
    console.log('🎯 Phase 4: Testing 3D Customizer Performance and WebGL...');
    
    const performanceMetrics = [];
    const webglInfo = {};
    const consoleMessages = [];
    
    // Enhanced console monitoring for 3D/WebGL messages
    page.on('console', msg => {
      const timestamp = new Date().toISOString().substr(11, 12);
      const text = msg.text();
      
      consoleMessages.push({
        timestamp,
        type: msg.type(),
        text
      });
      
      // Log 3D/WebGL related messages
      if (text.includes('WebGL') || text.includes('3D') || text.includes('CLAUDE_RULES') || 
          text.includes('material') || text.includes('frame') || text.includes('Performance')) {
        console.log(`[${timestamp}] ${msg.type().toUpperCase()}: ${text}`);
      }
    });
    
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // WebGL Context Detection
    console.log('🔍 Checking WebGL context availability...');
    const webglStatus = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { available: false, reason: 'WebGL not supported' };
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      
      return {
        available: true,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
      };
    });
    
    console.log('🎮 WebGL Status:', webglStatus.available ? '✅ Available' : '❌ Not Available');
    if (webglStatus.available) {
      console.log(`  Version: ${webglStatus.version}`);
      console.log(`  Renderer: ${webglStatus.renderer}`);
      console.log(`  Max Texture: ${webglStatus.maxTextureSize}px`);
    }
    
    // Wait for page stabilization and look for customizer
    await page.waitForTimeout(5000);
    
    console.log('🔍 Looking for 3D Customizer components...');
    
    // Look for customizer section
    const customizerFound = await page.evaluate(() => {
      const indicators = [
        'Experience 3D',
        'Interactive 360°',
        'CLAUDE_RULES',
        'ProductCustomizer',
        'Material'
      ];
      
      let found = false;
      let method = '';
      
      for (const text of indicators) {
        if (document.body.innerText.includes(text)) {
          found = true;
          method = text;
          break;
        }
      }
      
      // Check for canvas elements (potential WebGL usage)
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length > 0 && !found) {
        found = true;
        method = `Canvas elements (${canvases.length})`;
      }
      
      return { found, method, canvasCount: document.querySelectorAll('canvas').length };
    });
    
    if (customizerFound.found) {
      console.log(`✅ 3D Customizer found via: ${customizerFound.method}`);
      console.log(`🎨 Canvas elements detected: ${customizerFound.canvasCount}`);
      
      // Scroll to customizer area
      await page.evaluate(() => {
        const scrollDistance = window.innerHeight * 1.5;
        window.scrollBy(0, scrollDistance);
      });
      
      await page.waitForTimeout(3000);
      
      // Test material switching performance
      console.log('⚡ Testing material switching performance...');
      
      const materialSwitcher = page.locator('[data-testid="material-switcher"]');
      const switcherVisible = await materialSwitcher.isVisible().catch(() => false);
      
      if (switcherVisible) {
        console.log('✅ Material switcher found and visible');
        
        const materialButtons = materialSwitcher.locator('button');
        const buttonCount = await materialButtons.count();
        console.log(`🔘 Available materials: ${buttonCount}`);
        
        if (buttonCount >= 2) {
          // Test multiple material switches for performance analysis
          console.log('🔄 Testing material switch performance...');
          
          const switchTests = Math.min(buttonCount, 4); // Test up to 4 materials
          const switchTimes = [];
          
          for (let i = 0; i < switchTests; i++) {
            const startTime = performance.now();
            
            await materialButtons.nth(i).click();
            await page.waitForTimeout(100); // Small delay to see the effect
            
            const endTime = performance.now();
            const switchTime = endTime - startTime;
            switchTimes.push(switchTime);
            
            console.log(`  Material ${i + 1}: ${switchTime.toFixed(2)}ms`);
          }
          
          const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
          const maxSwitchTime = Math.max(...switchTimes);
          const minSwitchTime = Math.min(...switchTimes);
          
          console.log(`📊 Material Switching Performance:`);
          console.log(`  Average: ${avgSwitchTime.toFixed(2)}ms`);
          console.log(`  Min: ${minSwitchTime.toFixed(2)}ms`);
          console.log(`  Max: ${maxSwitchTime.toFixed(2)}ms`);
          console.log(`  CLAUDE_RULES (<100ms): ${maxSwitchTime < 100 ? '✅ PASS' : '❌ FAIL'}`);
          
          performanceMetrics.push({
            metric: 'material_switching',
            average: avgSwitchTime,
            max: maxSwitchTime,
            min: minSwitchTime,
            claudeRulesCompliant: maxSwitchTime < 100
          });
        }
        
        // Test zoom/rotation performance if available
        console.log('🔍 Testing zoom and rotation performance...');
        
        // Look for zoom controls
        const zoomControls = page.locator('[data-testid*="zoom"], button:has-text("+")', button:has-text("-")');
        const zoomAvailable = await zoomControls.count() > 0;
        
        if (zoomAvailable) {
          console.log('🔍 Zoom controls found, testing zoom performance...');
          
          const zoomStartTime = performance.now();
          await zoomControls.first().click();
          await page.waitForTimeout(50);
          const zoomTime = performance.now() - zoomStartTime;
          
          console.log(`  Zoom response: ${zoomTime.toFixed(2)}ms`);
          
          performanceMetrics.push({
            metric: 'zoom_interaction',
            time: zoomTime,
            claudeRulesCompliant: zoomTime < 100
          });
        }
        
        // Test auto-rotation if available
        const autoRotateButton = page.locator('button:has-text("Auto"), [data-testid*="auto-rotate"]');
        const autoRotateAvailable = await autoRotateButton.count() > 0;
        
        if (autoRotateAvailable) {
          console.log('🔄 Auto-rotation found, testing performance...');
          
          const rotateStartTime = performance.now();
          await autoRotateButton.first().click();
          await page.waitForTimeout(500); // Let rotation start
          const rotateTime = performance.now() - rotateStartTime;
          
          console.log(`  Auto-rotation start: ${rotateTime.toFixed(2)}ms`);
        }
        
        // Take performance screenshots
        await page.screenshot({ 
          path: 'customizer-3d-performance-test.png',
          fullPage: false 
        });
        
        await materialSwitcher.screenshot({ 
          path: 'material-switcher-performance.png' 
        });
        
      } else {
        console.log('❌ Material switcher not visible - checking for alternative 3D elements');
        
        // Look for any canvas or 3D elements
        const canvasElements = await page.evaluate(() => {
          const canvases = document.querySelectorAll('canvas');
          const webglCanvases = [];
          
          canvases.forEach((canvas, index) => {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
              webglCanvases.push({
                index,
                width: canvas.width,
                height: canvas.height,
                visible: canvas.offsetParent !== null
              });
            }
          });
          
          return {
            totalCanvases: canvases.length,
            webglCanvases
          };
        });
        
        console.log(`🎨 Canvas analysis: ${canvasElements.totalCanvases} total, ${canvasElements.webglCanvases.length} WebGL`);
      }
      
    } else {
      console.log('❌ 3D Customizer components not found');
      
      // Still test basic WebGL capabilities
      console.log('🧪 Testing basic WebGL performance...');
      
      const basicWebGLTest = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        
        if (!gl) return { success: false, error: 'No WebGL' };
        
        const startTime = performance.now();
        
        // Basic WebGL operations
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        
        const vertices = new Float32Array([
          -0.5, -0.5,
           0.5, -0.5,
           0.0,  0.5
        ]);
        
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const endTime = performance.now();
        
        return {
          success: true,
          operationTime: endTime - startTime
        };
      });
      
      if (basicWebGLTest.success) {
        console.log(`✅ Basic WebGL operations: ${basicWebGLTest.operationTime.toFixed(2)}ms`);
      }
    }
    
    // Analyze console messages for 3D performance indicators
    console.log('📊 Analyzing 3D performance logs...');
    
    const claudeRulesLogs = consoleMessages.filter(msg => 
      msg.text.includes('CLAUDE_RULES') || 
      msg.text.includes('Performance') ||
      msg.text.includes('frames loaded') ||
      msg.text.includes('Preload Complete')
    );
    
    const errorLogs = consoleMessages.filter(msg => msg.type === 'error');
    
    console.log(`📈 Performance Logs Found: ${claudeRulesLogs.length}`);
    
    if (claudeRulesLogs.length > 0) {
      console.log('🎯 CLAUDE_RULES Performance Evidence:');
      claudeRulesLogs.slice(0, 5).forEach(log => {
        console.log(`  ${log.text}`);
      });
    }
    
    if (errorLogs.length > 0) {
      console.log('🚨 3D/WebGL Errors:');
      errorLogs.slice(0, 3).forEach(error => {
        console.log(`  ${error.text}`);
      });
    }
    
    // Final Phase 4 Summary
    console.log('\n📋 Phase 4: 3D Performance Test Summary');
    console.log(`✅ WebGL Available: ${webglStatus.available ? 'Yes' : 'No'}`);
    console.log(`✅ 3D Components Found: ${customizerFound.found ? 'Yes' : 'No'}`);
    console.log(`✅ Performance Logs: ${claudeRulesLogs.length} CLAUDE_RULES indicators`);
    console.log(`✅ Console Errors: ${errorLogs.length}`);
    
    if (performanceMetrics.length > 0) {
      console.log('🎯 Performance Metrics Captured:');
      performanceMetrics.forEach(metric => {
        console.log(`  ${metric.metric}: ${JSON.stringify(metric)}`);
      });
    }
    
    // Test assertions
    expect(webglStatus.available).toBeTruthy(); // WebGL should be available
    expect(errorLogs.length).toBeLessThan(3); // Minimal errors
    
    if (performanceMetrics.length > 0) {
      const allCompliant = performanceMetrics.every(m => m.claudeRulesCompliant !== false);
      expect(allCompliant).toBeTruthy();
    }
  });
});