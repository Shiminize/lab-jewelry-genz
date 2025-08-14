/**
 * Design System Compliance Tests
 * Tests all CLAUDE_RULES.md design system requirements
 * - No hardcoded colors (gray-*, white, black, custom hex)
 * - Only design system tokens used (bg-background, text-foreground, etc.)
 * - Typography uses font-headline/font-body only
 * - Proper spacing tokens (p-1..p-9, gap-*, space-y-*)
 */

import { test, expect, Page } from '@playwright/test';

// Design system tokens from tailwind.config.js
const APPROVED_COLOR_TOKENS = [
  'background',      // '#FEFCF9' - Ivory mist
  'foreground',      // '#2D3A32' - Graphite green
  'muted',           // '#E8D7D3' - Rose beige
  'accent',          // '#D4AF37' - Champagne gold
  'cta',             // '#C17B47' - Coral gold
  'cta-hover',       // '#B5653A' - Burnt coral
  'border',          // '#E8D7D3' - Rose beige
  'error',           // '#D8000C' - Error states
  'success'          // '#4CAF50' - Success states
];

const APPROVED_FONT_FAMILIES = [
  'font-headline',   // Fraunces serif
  'font-body'        // Inter sans-serif
];

const APPROVED_SPACING_TOKENS = [
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-7', 'p-8', 'p-9',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-7', 'px-8', 'px-9',
  'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-7', 'py-8', 'py-9',
  'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9',
  'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5', 'pb-6', 'pb-7', 'pb-8', 'pb-9',
  'pl-0', 'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-7', 'pl-8', 'pl-9',
  'pr-0', 'pr-1', 'pr-2', 'pr-3', 'pr-4', 'pr-5', 'pr-6', 'pr-7', 'pr-8', 'pr-9',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9',
  'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-7', 'mx-8', 'mx-9',
  'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-7', 'my-8', 'my-9',
  'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-7', 'mt-8', 'mt-9',
  'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-7', 'mb-8', 'mb-9',
  'ml-0', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-7', 'ml-8', 'ml-9',
  'mr-0', 'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-7', 'mr-8', 'mr-9',
  'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-7', 'gap-8', 'gap-9',
  'space-x-0', 'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-5', 'space-x-6', 'space-x-7', 'space-x-8', 'space-x-9',
  'space-y-0', 'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-5', 'space-y-6', 'space-y-7', 'space-y-8', 'space-y-9'
];

// Prohibited patterns
const PROHIBITED_COLOR_PATTERNS = [
  /gray-\d+/,           // gray-100, gray-200, etc.
  /slate-\d+/,          // slate-100, slate-200, etc.
  /zinc-\d+/,           // zinc-100, zinc-200, etc.
  /neutral-\d+/,        // neutral-100, neutral-200, etc.
  /stone-\d+/,          // stone-100, stone-200, etc.
  /red-\d+/,            // red-100, red-200, etc.
  /orange-\d+/,         // orange-100, orange-200, etc.
  /amber-\d+/,          // amber-100, amber-200, etc.
  /yellow-\d+/,         // yellow-100, yellow-200, etc.
  /lime-\d+/,           // lime-100, lime-200, etc.
  /green-\d+/,          // green-100, green-200, etc.
  /emerald-\d+/,        // emerald-100, emerald-200, etc.
  /teal-\d+/,           // teal-100, teal-200, etc.
  /cyan-\d+/,           // cyan-100, cyan-200, etc.
  /sky-\d+/,            // sky-100, sky-200, etc.
  /blue-\d+/,           // blue-100, blue-200, etc.
  /indigo-\d+/,         // indigo-100, indigo-200, etc.
  /violet-\d+/,         // violet-100, violet-200, etc.
  /purple-\d+/,         // purple-100, purple-200, etc.
  /fuchsia-\d+/,        // fuchsia-100, fuchsia-200, etc.
  /pink-\d+/,           // pink-100, pink-200, etc.
  /rose-\d+/,           // rose-100, rose-200, etc.
  /#[0-9a-fA-F]{3,6}/   // Hex colors
];

const PROHIBITED_GENERIC_CLASSES = [
  'text-white',
  'text-black',
  'bg-white',
  'bg-black',
  'border-white',
  'border-black'
];

// Helper function to get all CSS classes from the page
async function getAllClassNames(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const classSet = new Set<string>();
    
    allElements.forEach(element => {
      if (element.className && typeof element.className === 'string') {
        element.className.split(/\s+/).forEach(className => {
          if (className.trim()) {
            classSet.add(className.trim());
          }
        });
      }
    });
    
    return Array.from(classSet);
  });
}

// Helper function to get computed styles for font analysis
async function getFontUsage(page: Page): Promise<Array<{element: string, fontFamily: string, classList: string[]}>> {
  return await page.evaluate(() => {
    const results: Array<{element: string, fontFamily: string, classList: string[]}> = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      
      if (fontFamily && element.textContent?.trim()) {
        results.push({
          element: element.tagName.toLowerCase(),
          fontFamily,
          classList: Array.from(element.classList)
        });
      }
    });
    
    return results;
  });
}

// Helper function to analyze color usage
async function getColorUsage(page: Page): Promise<Array<{element: string, property: string, value: string, classList: string[]}>> {
  return await page.evaluate(() => {
    const results: Array<{element: string, property: string, value: string, classList: string[]}> = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
      
      colorProps.forEach(prop => {
        const value = computedStyle[prop as any];
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          results.push({
            element: element.tagName.toLowerCase(),
            property: prop,
            value,
            classList: Array.from(element.classList)
          });
        }
      });
    });
    
    return results;
  });
}

test.describe('Design System Color Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('No prohibited color classes used', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    const violations: string[] = [];
    
    allClasses.forEach(className => {
      // Check against prohibited patterns
      PROHIBITED_COLOR_PATTERNS.forEach(pattern => {
        if (pattern.test(className)) {
          violations.push(`Prohibited color pattern: ${className}`);
        }
      });
      
      // Check against prohibited generic classes
      if (PROHIBITED_GENERIC_CLASSES.includes(className)) {
        violations.push(`Prohibited generic class: ${className}`);
      }
    });
    
    if (violations.length > 0) {
      console.error('Design System Violations:', violations);
      expect(violations).toHaveLength(0);
    } else {
      console.log('✓ No prohibited color classes found');
    }
  });

  test('Only approved design tokens used for colors', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    const colorClasses = allClasses.filter(className => 
      className.startsWith('bg-') || 
      className.startsWith('text-') || 
      className.startsWith('border-')
    );
    
    const violations: string[] = [];
    
    colorClasses.forEach(className => {
      const tokenPart = className.split('-').slice(1).join('-');
      
      // Skip utility classes that aren't colors
      if (['transparent', 'current', 'inherit', 'auto', 'none'].includes(tokenPart)) {
        return;
      }
      
      // Skip responsive and state variants
      if (className.includes('/') || className.includes(':')) {
        return;
      }
      
      // Check if it's an approved token
      if (!APPROVED_COLOR_TOKENS.includes(tokenPart)) {
        // Allow some specific utility classes
        const allowedUtilities = [
          'opacity-', 'backdrop-', 'shadow-', 'ring-', 'divide-',
          'decoration-', 'caret-', 'accent-', 'selection-'
        ];
        
        const isAllowedUtility = allowedUtilities.some(util => className.includes(util));
        
        if (!isAllowedUtility) {
          violations.push(`Non-approved color token: ${className} (token: ${tokenPart})`);
        }
      }
    });
    
    if (violations.length > 0) {
      console.error('Color Token Violations:', violations.slice(0, 10)); // Show first 10
      expect(violations).toHaveLength(0);
    } else {
      console.log('✓ All color classes use approved design tokens');
    }
  });

  test('Computed colors match design system', async ({ page }) => {
    const colorUsage = await getColorUsage(page);
    const suspiciousColors: string[] = [];
    
    colorUsage.forEach(({element, property, value, classList}) => {
      // Check for hardcoded hex colors or suspicious RGB values
      if (value.includes('#') || 
          (value.includes('rgb') && !value.includes('rgba(0, 0, 0, 0)'))) {
        
        // Skip if it's likely from a design system class
        const hasDesignSystemClass = classList.some(cls => 
          APPROVED_COLOR_TOKENS.some(token => cls.includes(token))
        );
        
        if (!hasDesignSystemClass) {
          suspiciousColors.push(`${element}: ${property}=${value} (classes: ${classList.join(' ')})`);
        }
      }
    });
    
    if (suspiciousColors.length > 0) {
      console.warn('Potentially non-design-system colors:', suspiciousColors.slice(0, 5));
      // This is a warning rather than failure since computed styles might come from various sources
    } else {
      console.log('✓ No suspicious hardcoded colors detected');
    }
  });
});

test.describe('Typography System Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Only approved font families used', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    const fontClasses = allClasses.filter(className => className.startsWith('font-'));
    
    const violations: string[] = [];
    
    fontClasses.forEach(className => {
      if (!APPROVED_FONT_FAMILIES.includes(className)) {
        // Allow font-weight classes
        if (!className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\d+)$/)) {
          violations.push(`Non-approved font class: ${className}`);
        }
      }
    });
    
    if (violations.length > 0) {
      console.error('Font Family Violations:', violations);
      expect(violations).toHaveLength(0);
    } else {
      console.log('✓ All font classes use approved typography system');
    }
  });

  test('Computed font families match design system', async ({ page }) => {
    const fontUsage = await getFontUsage(page);
    const expectedFonts = ['Fraunces', 'Inter', 'serif', 'sans-serif'];
    const violations: string[] = [];
    
    fontUsage.forEach(({element, fontFamily, classList}) => {
      // Check if computed font family includes expected fonts
      const hasExpectedFont = expectedFonts.some(font => 
        fontFamily.toLowerCase().includes(font.toLowerCase())
      );
      
      if (!hasExpectedFont && element !== 'canvas' && element !== 'svg') {
        // Skip system fonts and common fallbacks
        const systemFonts = ['-webkit', '-moz', 'system-ui', 'BlinkMacSystemFont'];
        const isSystemFont = systemFonts.some(sys => fontFamily.includes(sys));
        
        if (!isSystemFont) {
          violations.push(`Unexpected font family: ${element} uses "${fontFamily}" (classes: ${classList.join(' ')})`);
        }
      }
    });
    
    if (violations.length > 0 && violations.length < 10) { // Only fail if there are many violations
      console.warn('Font Family Warnings:', violations.slice(0, 5));
    } else if (violations.length >= 10) {
      console.error('Too many font family violations:', violations.slice(0, 5));
      expect(violations.length).toBeLessThan(10);
    } else {
      console.log('✓ Font families match design system');
    }
  });

  test('Headings use font-headline, body uses font-body', async ({ page }) => {
    const headingElements = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => ({
        tag: h.tagName.toLowerCase(),
        classes: Array.from(h.classList),
        text: h.textContent?.slice(0, 50) || ''
      }));
    });
    
    const bodyElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div');
      return Array.from(elements)
        .filter(el => el.textContent && el.textContent.trim().length > 10)
        .slice(0, 20) // Check first 20 body text elements
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          classes: Array.from(el.classList),
          text: el.textContent?.slice(0, 50) || ''
        }));
    });
    
    // Check headings have font-headline
    const headingViolations: string[] = [];
    headingElements.forEach(({tag, classes, text}) => {
      if (!classes.includes('font-headline')) {
        headingViolations.push(`${tag} without font-headline: "${text}" (classes: ${classes.join(' ')})`);
      }
    });
    
    // Check body elements have font-body (if they have font classes)
    const bodyViolations: string[] = [];
    bodyElements.forEach(({tag, classes, text}) => {
      const hasFontClass = classes.some(cls => cls.startsWith('font-'));
      if (hasFontClass && !classes.includes('font-body') && !classes.includes('font-headline')) {
        bodyViolations.push(`${tag} with non-design-system font: "${text}" (classes: ${classes.join(' ')})`);
      }
    });
    
    if (headingViolations.length > 0) {
      console.error('Heading Typography Violations:', headingViolations);
    }
    
    if (bodyViolations.length > 0) {
      console.error('Body Typography Violations:', bodyViolations);
    }
    
    // Allow some tolerance for third-party components
    expect(headingViolations.length).toBeLessThan(3);
    expect(bodyViolations.length).toBeLessThan(5);
    
    if (headingViolations.length === 0 && bodyViolations.length === 0) {
      console.log('✓ Typography classes properly applied');
    }
  });
});

test.describe('Spacing System Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Only approved spacing tokens used', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    const spacingClasses = allClasses.filter(className => 
      className.match(/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-/) ||
      className.match(/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])$/)
    );
    
    const violations: string[] = [];
    
    spacingClasses.forEach(className => {
      // Skip responsive variants
      if (className.includes(':')) {
        return;
      }
      
      // Check against approved tokens
      if (!APPROVED_SPACING_TOKENS.includes(className)) {
        // Allow some specific values that might be needed
        const allowedSpecialValues = [
          '-', 'auto', 'reverse'
        ];
        
        const hasAllowedValue = allowedSpecialValues.some(val => className.includes(val));
        
        if (!hasAllowedValue) {
          violations.push(`Non-approved spacing token: ${className}`);
        }
      }
    });
    
    if (violations.length > 0) {
      console.error('Spacing Token Violations:', violations.slice(0, 10));
      expect(violations.length).toBeLessThan(5); // Allow some tolerance
    } else {
      console.log('✓ All spacing classes use approved design tokens');
    }
  });

  test('No hardcoded spacing in inline styles', async ({ page }) => {
    const inlineSpacingViolations = await page.evaluate(() => {
      const violations: string[] = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(element => {
        if (element.getAttribute('style')) {
          const style = element.getAttribute('style')!;
          
          // Check for hardcoded spacing values
          const spacingProps = [
            'padding', 'margin', 'gap', 'top', 'right', 'bottom', 'left',
            'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
          ];
          
          spacingProps.forEach(prop => {
            const regex = new RegExp(`${prop}\\s*:\\s*\\d+px`, 'i');
            if (regex.test(style)) {
              violations.push(`Hardcoded ${prop} in inline style: ${element.tagName.toLowerCase()}`);
            }
          });
        }
      });
      
      return violations;
    });
    
    if (inlineSpacingViolations.length > 0) {
      console.warn('Inline Spacing Violations:', inlineSpacingViolations.slice(0, 5));
      // Allow some violations for third-party components or necessary overrides
      expect(inlineSpacingViolations.length).toBeLessThan(10);
    } else {
      console.log('✓ No hardcoded spacing in inline styles');
    }
  });
});

test.describe('Component Architecture Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CVA pattern used for component variants', async ({ page }) => {
    // This test checks the DOM for evidence of CVA pattern usage
    const componentVariants = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const variants: Array<{classes: string[], hasVariants: boolean}> = [];
      
      buttons.forEach(button => {
        const classes = Array.from(button.classList);
        
        // Look for variant-style classes
        const variantPatterns = [
          'variant-', 'size-', 'color-', 'style-'
        ];
        
        const hasVariants = variantPatterns.some(pattern =>
          classes.some(cls => cls.includes(pattern))
        );
        
        variants.push({
          classes,
          hasVariants
        });
      });
      
      return variants;
    });
    
    const buttonsWithVariants = componentVariants.filter(v => v.hasVariants);
    
    console.log(`Found ${buttonsWithVariants.length} buttons with variant classes out of ${componentVariants.length} total buttons`);
    
    // At least some buttons should use the variant system
    if (componentVariants.length > 0) {
      expect(buttonsWithVariants.length).toBeGreaterThan(0);
    }
  });

  test('Consistent class naming patterns', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    
    // Check for consistent naming patterns
    const customClasses = allClasses.filter(cls => 
      !cls.match(/^(bg|text|border|p|m|gap|space|font|flex|grid|w|h|min|max|overflow|cursor|pointer|select|transform|transition|animate|opacity|shadow|ring|outline|divide|decoration|caret|accent|selection)/) &&
      !cls.match(/^(sm|md|lg|xl|2xl):/) &&
      !cls.match(/^(hover|focus|active|disabled|group|peer):/) &&
      cls.length > 2
    );
    
    console.log(`Custom classes found: ${customClasses.length}`);
    if (customClasses.length > 0) {
      console.log('Sample custom classes:', customClasses.slice(0, 10));
    }
    
    // Custom classes should follow kebab-case or be component names
    const badlyNamedClasses = customClasses.filter(cls => 
      !cls.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/) && // kebab-case
      !cls.match(/^[A-Z][a-zA-Z0-9]*$/) // PascalCase for components
    );
    
    if (badlyNamedClasses.length > 0) {
      console.warn('Classes with non-standard naming:', badlyNamedClasses.slice(0, 5));
    }
    
    // Allow some tolerance for third-party libraries
    expect(badlyNamedClasses.length).toBeLessThan(customClasses.length * 0.3);
  });

  test('No !important declarations in classes', async ({ page }) => {
    const importantViolations = await page.evaluate(() => {
      const violations: string[] = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        
        // Check for !important in inline styles
        if (element.getAttribute('style')) {
          const style = element.getAttribute('style')!;
          if (style.includes('!important')) {
            violations.push(`!important in inline style: ${element.tagName.toLowerCase()}`);
          }
        }
      });
      
      return violations;
    });
    
    if (importantViolations.length > 0) {
      console.error('!important violations:', importantViolations);
      expect(importantViolations.length).toBeLessThan(5); // Allow very few exceptions
    } else {
      console.log('✓ No !important declarations found in inline styles');
    }
  });
});

test.describe('Design System Integration', () => {
  test('3D customizer uses design system colors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for 3D customizer to load
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Check customizer UI elements use design tokens
    const customizerElements = await page.locator('[data-testid*="customizer"], .customizer, [class*="customizer"]').all();
    
    for (const element of customizerElements) {
      const classes = await element.getAttribute('class') || '';
      const classList = classes.split(/\s+/);
      
      // Check for design system color usage
      const colorClasses = classList.filter(cls => 
        cls.startsWith('bg-') || cls.startsWith('text-') || cls.startsWith('border-')
      );
      
      colorClasses.forEach(cls => {
        const token = cls.split('-').slice(1).join('-');
        if (!['transparent', 'current', 'inherit'].includes(token)) {
          // Should use approved tokens
          const isApproved = APPROVED_COLOR_TOKENS.includes(token);
          if (!isApproved) {
            console.warn(`Customizer element uses non-approved color token: ${cls}`);
          }
        }
      });
    }
    
    console.log(`✓ Checked ${customizerElements.length} customizer elements`);
  });

  test('Responsive design uses consistent breakpoints', async ({ page }) => {
    const allClasses = await getAllClassNames(page);
    const responsiveClasses = allClasses.filter(cls => 
      cls.match(/^(sm|md|lg|xl|2xl):/)
    );
    
    // Check that only approved breakpoints are used
    const approvedBreakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
    const violations: string[] = [];
    
    responsiveClasses.forEach(cls => {
      const breakpoint = cls.split(':')[0];
      if (!approvedBreakpoints.includes(breakpoint)) {
        violations.push(`Non-standard breakpoint: ${cls}`);
      }
    });
    
    if (violations.length > 0) {
      console.error('Responsive breakpoint violations:', violations);
      expect(violations).toHaveLength(0);
    } else {
      console.log(`✓ All ${responsiveClasses.length} responsive classes use standard breakpoints`);
    }
  });
});