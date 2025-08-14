/**
 * Comprehensive Compliance Test Suite
 * Master test runner for all CLAUDE_RULES.md compliance requirements
 * Orchestrates all individual compliance test suites
 */

import { test, expect } from '@playwright/test';

// Test suite configuration
const COMPLIANCE_AREAS = {
  API_COMPLIANCE: {
    name: 'API Compliance',
    file: './api-compliance.spec.ts',
    priority: 'HIGH',
    description: 'Response envelopes, Zod validation, rate limiting, security headers, <300ms response times'
  },
  CUSTOMIZER_ACCEPTANCE: {
    name: '3D Customizer Acceptance',
    file: './3d-customizer-acceptance.spec.ts',
    priority: 'HIGH',
    description: 'Metal changes <2s, price calculations, mobile performance, WebGL fallbacks, save/share'
  },
  DESIGN_SYSTEM: {
    name: 'Design System Compliance',
    file: './design-system-compliance.spec.ts',
    priority: 'MEDIUM',
    description: 'No hardcoded colors, proper tokens, typography constraints, spacing validation'
  },
  ACCESSIBILITY: {
    name: 'Accessibility (WCAG 2.1 AA)',
    file: './accessibility-compliance.spec.ts',
    priority: 'HIGH',
    description: 'ARIA labels, keyboard navigation, focus management, 4.5:1 contrast ratios'
  },
  PERFORMANCE: {
    name: 'Performance Requirements',
    file: './performance-compliance.spec.ts',
    priority: 'HIGH',
    description: 'Mobile-first <3s loads, 60FPS desktop/30FPS mobile, <5s 3D load on 3G'
  },
  ARCHITECTURE: {
    name: 'Component Architecture',
    file: './component-architecture-compliance.spec.ts',
    priority: 'MEDIUM',
    description: 'TypeScript strict mode, error-first coding, proper file structure, memoization'
  }
};

// Compliance report structure
interface ComplianceReport {
  area: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  score: number; // 0-100
  criticalIssues: number;
  warnings: number;
  details: string[];
}

test.describe('CLAUDE_RULES.md Compliance Test Suite', () => {
  test.beforeAll(async ({}) => {
    console.log('🚀 Starting comprehensive CLAUDE_RULES.md compliance validation');
    console.log('='.repeat(80));
    
    Object.entries(COMPLIANCE_AREAS).forEach(([key, area]) => {
      console.log(`📋 ${area.name} (${area.priority}): ${area.description}`);
    });
    
    console.log('='.repeat(80));
  });

  test('Compliance Test Suite Overview', async ({ page }) => {
    // This test provides an overview and validates the test environment
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify core application functionality is working
    const title = await page.title();
    expect(title).toContain('GlowGlitch');
    
    // Check for 3D customizer presence (core feature)
    try {
      await page.waitForSelector('canvas', { timeout: 15000 });
      console.log('✅ 3D Customizer is present and loading');
    } catch {
      console.warn('⚠️  3D Customizer not detected - some tests may fail');
    }
    
    // Validate test environment
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const viewport = page.viewportSize();
    
    console.log('📊 Test Environment:', {
      userAgent: userAgent.slice(0, 100),
      viewport,
      url: page.url()
    });
    
    expect(page.url()).toContain('http');
    expect(viewport?.width).toBeGreaterThan(0);
  });

  test('API Endpoints Health Check', async ({ page }) => {
    // Quick health check of critical API endpoints before running full compliance
    const criticalEndpoints = [
      '/api/health',
      '/api/products',
      '/api/products/eternal-solitaire-ring',
      '/api/products/eternal-solitaire-ring/customize'
    ];
    
    const healthResults = [];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await page.request.get(endpoint);
        healthResults.push({
          endpoint,
          status: response.status(),
          ok: response.ok()
        });
        
        if (!response.ok()) {
          console.warn(`⚠️  ${endpoint} returned ${response.status()}`);
        }
      } catch (error) {
        healthResults.push({
          endpoint,
          status: 0,
          ok: false,
          error: error.toString()
        });
        console.error(`❌ ${endpoint} failed:`, error);
      }
    }
    
    console.log('🏥 API Health Check Results:', healthResults);
    
    // At least 75% of critical endpoints should be healthy
    const healthyEndpoints = healthResults.filter(r => r.ok).length;
    const healthRatio = healthyEndpoints / criticalEndpoints.length;
    
    expect(healthRatio).toBeGreaterThan(0.75);
    console.log(`✅ ${healthyEndpoints}/${criticalEndpoints.length} critical endpoints are healthy`);
  });

  test('3D Customizer Core Functionality Check', async ({ page }) => {
    // Validate 3D customizer is functional before running detailed tests
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    let customizerStatus = 'NOT_FOUND';
    let webglSupported = false;
    let interactionsPossible = false;
    
    try {
      // Check for canvas
      await page.waitForSelector('canvas', { timeout: 10000 });
      customizerStatus = 'CANVAS_FOUND';
      
      // Check WebGL support
      webglSupported = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      });
      
      if (webglSupported) {
        customizerStatus = 'WEBGL_SUPPORTED';
      }
      
      // Check for customization controls
      const materialControls = page.locator('text=Material, text=Gold, text=Silver, [data-testid*="material"]');
      if (await materialControls.first().isVisible()) {
        interactionsPossible = true;
        customizerStatus = 'FULLY_FUNCTIONAL';
      }
      
    } catch (error) {
      console.warn('3D Customizer check failed:', error);
    }
    
    console.log('🎨 3D Customizer Status:', {
      status: customizerStatus,
      webglSupported,
      interactionsPossible
    });
    
    // At minimum, WebGL should be supported for 3D tests to be meaningful
    expect(webglSupported).toBe(true);
    
    if (customizerStatus === 'FULLY_FUNCTIONAL') {
      console.log('✅ 3D Customizer is fully functional - all tests can run');
    } else if (customizerStatus === 'WEBGL_SUPPORTED') {
      console.log('⚠️  3D Customizer partially functional - some tests may fail');
    }
  });

  test('Design System Validation Check', async ({ page }) => {
    // Quick validation of design system implementation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const designSystemCheck = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const stats = {
        totalElements: elements.length,
        elementsWithClasses: 0,
        designSystemClasses: 0,
        prohibitedClasses: 0
      };
      
      const designTokens = [
        'bg-background', 'text-foreground', 'bg-cta', 'text-muted', 
        'font-headline', 'font-body', 'p-', 'm-', 'gap-'
      ];
      
      const prohibitedPatterns = [
        'text-white', 'bg-black', 'text-gray-', 'bg-gray-'
      ];
      
      elements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          stats.elementsWithClasses++;
          const classes = el.className.split(/\s+/);
          
          classes.forEach(cls => {
            // Check for design system tokens
            if (designTokens.some(token => cls.includes(token))) {
              stats.designSystemClasses++;
            }
            
            // Check for prohibited classes
            if (prohibitedPatterns.some(pattern => cls.includes(pattern))) {
              stats.prohibitedClasses++;
            }
          });
        }
      });
      
      return stats;
    });
    
    console.log('🎨 Design System Check:', designSystemCheck);
    
    // Should have some design system classes in use
    expect(designSystemCheck.designSystemClasses).toBeGreaterThan(0);
    
    // Should have minimal prohibited classes
    expect(designSystemCheck.prohibitedClasses).toBeLessThan(designSystemCheck.elementsWithClasses * 0.05);
    
    console.log('✅ Design system appears to be implemented');
  });

  test('Performance Baseline Check', async ({ page }) => {
    // Quick performance baseline before detailed testing
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const basicLoadTime = Date.now() - startTime;
    
    // Measure some basic metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
        resources: performance.getEntriesByType('resource').length
      };
    });
    
    console.log('⚡ Performance Baseline:', {
      basicLoadTime: `${basicLoadTime}ms`,
      domContentLoaded: `${performanceMetrics.domContentLoaded.toFixed(0)}ms`,
      loadComplete: `${performanceMetrics.loadComplete.toFixed(0)}ms`,
      firstPaint: `${performanceMetrics.firstPaint.toFixed(0)}ms`,
      resources: performanceMetrics.resources
    });
    
    // Basic performance expectations
    expect(basicLoadTime).toBeLessThan(5000); // 5s max basic load
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3s DOM ready
    
    if (basicLoadTime < 3000) {
      console.log('✅ Performance baseline is good');
    } else {
      console.log('⚠️  Performance baseline is slow - detailed tests may fail');
    }
  });

  test.afterAll(async ({}) => {
    console.log('='.repeat(80));
    console.log('📊 COMPLIANCE TEST SUITE SUMMARY');
    console.log('='.repeat(80));
    
    // Generate summary report
    const summary = {
      testSuitesConfigured: Object.keys(COMPLIANCE_AREAS).length,
      highPriorityAreas: Object.values(COMPLIANCE_AREAS).filter(a => a.priority === 'HIGH').length,
      mediumPriorityAreas: Object.values(COMPLIANCE_AREAS).filter(a => a.priority === 'MEDIUM').length,
      coverageAreas: Object.values(COMPLIANCE_AREAS).map(a => a.name)
    };
    
    console.log('📋 Test Suite Configuration:', summary);
    console.log('');
    console.log('🎯 High Priority Areas:', 
      Object.values(COMPLIANCE_AREAS)
        .filter(a => a.priority === 'HIGH')
        .map(a => a.name)
        .join(', ')
    );
    console.log('');
    console.log('📚 All Coverage Areas:');
    Object.values(COMPLIANCE_AREAS).forEach(area => {
      console.log(`   • ${area.name}: ${area.description}`);
    });
    console.log('');
    console.log('🚀 Run individual test suites:');
    console.log('   npx playwright test tests/api-compliance.spec.ts');
    console.log('   npx playwright test tests/3d-customizer-acceptance.spec.ts');
    console.log('   npx playwright test tests/design-system-compliance.spec.ts');
    console.log('   npx playwright test tests/accessibility-compliance.spec.ts');
    console.log('   npx playwright test tests/performance-compliance.spec.ts');
    console.log('   npx playwright test tests/component-architecture-compliance.spec.ts');
    console.log('');
    console.log('🎭 Run all compliance tests:');
    console.log('   npx playwright test tests/ --grep="compliance"');
    console.log('='.repeat(80));
  });
});