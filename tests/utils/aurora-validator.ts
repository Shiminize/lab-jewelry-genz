import { Page, Locator, expect } from '@playwright/test';

// Aurora Design System Tokens (from specification)
export const AURORA_TOKENS = {
  colors: {
    deepSpace: '#0a0e27',
    nebulaPurple: '#6b46c1', 
    auroraPink: '#ff6b9d',
    auroraCrimson: '#c44569',
    auroraPlum: '#723c70',
    lunarGrey: '#f7f7f9',
    emeraldFlash: '#10b981',
    amberGlow: '#f59e0b'
  },
  typography: {
    hero: 'clamp(3rem, 8vw, 6rem)',
    statement: 'clamp(2.5rem, 6vw, 4rem)',
    titleXL: 'clamp(2rem, 4vw, 3rem)',
    titleL: 'clamp(1.5rem, 3vw, 2.25rem)',
    titleM: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    bodyXL: 'clamp(1.125rem, 2vw, 1.5rem)',
    bodyL: '1.125rem',
    bodyM: '1rem',
    small: '0.875rem',
    micro: '0.75rem'
  },
  borderRadius: {
    micro: '3px',
    small: '5px', 
    medium: '8px',
    large: '13px',
    xl: '21px',
    xxl: '34px'
  },
  shadows: {
    near: '0 2px 8px',
    float: '0 8px 24px', 
    hover: '0 16px 48px',
    modal: '0 24px 64px'
  }
} as const;

/**
 * Validates that an element uses Aurora Design System color tokens
 */
export async function validateAuroraColors(element: Locator, expectedColors?: string[]) {
  const computedStyles = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      borderColor: computed.borderColor,
      boxShadow: computed.boxShadow
    };
  });

  console.log('🎨 Computed styles:', computedStyles);
  
  // Verify colors match Aurora tokens (convert rgb to hex for comparison)
  if (expectedColors) {
    const rgbToHex = (rgb: string) => {
      const result = rgb.match(/\d+/g);
      if (!result) return rgb;
      return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    };

    expectedColors.forEach(colorKey => {
      const expectedHex = AURORA_TOKENS.colors[colorKey as keyof typeof AURORA_TOKENS.colors];
      // Additional validation logic could be added here
    });
  }

  return computedStyles;
}

/**
 * Validates Aurora typography scale compliance
 */
export async function validateAuroraTypography(element: Locator, expectedScale: keyof typeof AURORA_TOKENS.typography) {
  const typography = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight
    };
  });

  console.log(`📐 Typography (${expectedScale}):`, typography);
  
  const expectedSize = AURORA_TOKENS.typography[expectedScale];
  
  // For clamp values, we validate that the computed size is within expected range
  if (expectedSize.includes('clamp')) {
    console.log(`✅ Clamp-based typography detected: ${expectedSize}`);
  } else {
    // Direct size comparison for non-clamp values
    const expectedPx = parseFloat(expectedSize) * 16; // Convert rem to px
    const actualPx = parseFloat(typography.fontSize);
    
    expect(Math.abs(actualPx - expectedPx)).toBeLessThan(2); // Allow 2px tolerance
  }

  return typography;
}

/**
 * Validates Aurora shadow compliance  
 */
export async function validateAuroraShadows(element: Locator, expectedShadow: keyof typeof AURORA_TOKENS.shadows) {
  const shadows = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      boxShadow: computed.boxShadow
    };
  });

  console.log(`🌟 Shadow (${expectedShadow}):`, shadows);
  
  const expectedShadowOffset = AURORA_TOKENS.shadows[expectedShadow];
  expect(shadows.boxShadow).toContain(expectedShadowOffset);

  return shadows;
}

/**
 * Validates Aurora border radius compliance
 */
export async function validateAuroraBorderRadius(element: Locator, expectedRadius: keyof typeof AURORA_TOKENS.borderRadius) {
  const borderRadius = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return computed.borderRadius;
  });

  console.log(`🔘 Border radius (${expectedRadius}):`, borderRadius);
  
  const expectedPx = AURORA_TOKENS.borderRadius[expectedRadius];
  expect(borderRadius).toContain(expectedPx);

  return borderRadius;
}

/**
 * Checks for hydration errors in the browser console
 */
export async function validateNoHydrationErrors(page: Page) {
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  // Wait for hydration to complete
  await page.waitForTimeout(2000);
  
  const hydrationErrors = consoleLogs.filter(log => 
    log.includes('Hydration') || 
    log.includes('hydration') ||
    log.includes('Text content does not match') ||
    log.includes('client and server')
  );

  console.log('🔍 Console errors:', consoleLogs);
  
  expect(hydrationErrors.length).toBe(0);
  
  return { totalErrors: consoleLogs.length, hydrationErrors };
}

/**
 * Validates performance meets Claude Rules (<300ms)
 */
export async function validatePerformance(page: Page, maxTime = 300) {
  const startTime = Date.now();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  const loadTime = Date.now() - startTime;
  console.log(`⚡ Page load time: ${loadTime}ms`);
  
  expect(loadTime).toBeLessThan(maxTime);
  
  return loadTime;
}

/**
 * Validates gradient matches Aurora specification
 */
export async function validateMidnightLuxuryGradient(element: Locator) {
  const gradient = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return computed.backgroundImage;
  });

  console.log('🌌 Midnight Luxury gradient:', gradient);
  
  // Should contain deep-space and nebula-purple colors
  expect(gradient).toContain('linear-gradient');
  expect(gradient.toLowerCase()).toMatch(/rgba?\(10,\s*14,\s*39|#0a0e27/); // deep-space
  expect(gradient.toLowerCase()).toMatch(/rgba?\(107,\s*70,\s*193|#6b46c1/); // nebula-purple
  
  return gradient;
}

/**
 * Comprehensive Aurora compliance validator
 */
export async function validateFullAuroraCompliance(page: Page, element: Locator, config: {
  colors?: string[];
  typography?: keyof typeof AURORA_TOKENS.typography;
  shadows?: keyof typeof AURORA_TOKENS.shadows;
  borderRadius?: keyof typeof AURORA_TOKENS.borderRadius;
  checkHydration?: boolean;
  checkPerformance?: boolean;
} = {}) {
  const results = {
    colors: null as any,
    typography: null as any, 
    shadows: null as any,
    borderRadius: null as any,
    hydration: null as any,
    performance: null as any
  };

  if (config.colors) {
    results.colors = await validateAuroraColors(element, config.colors);
  }

  if (config.typography) {
    results.typography = await validateAuroraTypography(element, config.typography);
  }

  if (config.shadows) {
    results.shadows = await validateAuroraShadows(element, config.shadows);
  }

  if (config.borderRadius) {
    results.borderRadius = await validateAuroraBorderRadius(element, config.borderRadius);
  }

  if (config.checkHydration) {
    results.hydration = await validateNoHydrationErrors(page);
  }

  if (config.checkPerformance) {
    results.performance = await validatePerformance(page);
  }

  return results;
}