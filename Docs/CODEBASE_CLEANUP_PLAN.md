# Codebase Cleanup Plan - CLAUDE_RULES Compliance Audit
*Generated: December 2024*
*Status: PENDING EXECUTION*

## Executive Summary
Comprehensive cleanup plan to remove unused code, enforce CLAUDE_RULES.md compliance, and maintain codebase health through phased implementation with Playwright e2e testing verification.

## Audit Results Overview
- **25+ unused demo/test files** identified for deletion
- **100+ console.log statements** to be removed
- **10+ files exceeding size limits** (>450 lines) requiring refactoring
- **4 backup files** to be deleted
- **Multiple unused API routes** to be removed

## Phase 1: Critical Cleanup - Unused Files & Demos
**Timeline: Day 1**
**Risk Level: Low**
**CLAUDE_RULES Compliance: File organization and dead code removal**

### Files to Delete:
```
/test-*.js (25 files)
/validate-*.js (8 files)
/check-*.js (3 files)
/debug-*.js (2 files)
/src/app/navigation-demo/
/src/app/test-performance/
/src/app/demo-mode/
/src/app/icon-test/
/tests/*.spec.ts (old test files)
*.png (orphaned screenshots in root)
```

### Playwright E2E Test - Phase 1
```javascript
// tests/phase1-cleanup-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Post-Cleanup Health Check', () => {
  test('Homepage loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GenZ Jewelry/);
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  });

  test('Catalog page functional', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCount(75);
  });

  test('3D Customizer loads', async ({ page }) => {
    await page.goto('/customizer');
    await expect(page.locator('[data-testid="image-sequence-viewer"]')).toBeVisible();
  });

  test('No console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    expect(errors).toHaveLength(0);
  });
});
```

### Verification Commands:
```bash
# Run after cleanup
npm run build
npm run lint
npx playwright test tests/phase1-cleanup-validation.spec.ts
```

## Phase 2: Console.log Removal & Debug Code
**Timeline: Day 2**
**Risk Level: Low**
**CLAUDE_RULES Compliance: Production-ready code standards**

### Target Files (100+ console.log statements):
- src/components/navigation/LuxuryHeader.tsx (15 instances)
- src/components/products/ProductCustomizer.tsx (12 instances)
- src/hooks/useDesignVersion.ts (8 instances)
- src/app/api routes (25+ instances)
- src/services/*.ts (20+ instances)

### Automated Cleanup Script:
```javascript
// scripts/remove-console-logs.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove console.log but preserve console.error/warn for production
  content = content.replace(/^\s*console\.log\(.*?\);?\s*$/gm, '');
  fs.writeFileSync(file, content);
});
```

### Playwright E2E Test - Phase 2
```javascript
// tests/phase2-console-cleanup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 2: Console Cleanup Validation', () => {
  test('No development console.logs in production build', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') logs.push(msg.text());
    });
    
    await page.goto('/');
    await page.goto('/catalog');
    await page.goto('/customizer');
    
    // Should have no console.logs in production
    expect(logs.filter(log => !log.includes('Warning'))).toHaveLength(0);
  });

  test('Core functionality intact', async ({ page }) => {
    // Test cart functionality
    await page.goto('/catalog');
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Test material switcher
    await page.goto('/customizer');
    await page.locator('button:has-text("Platinum")').click();
    await expect(page.locator('[data-testid="material-display"]')).toContainText('Platinum');
  });
});
```

## Phase 3: File Size Compliance & Refactoring
**Timeline: Day 3-4**
**Risk Level: Medium**
**CLAUDE_RULES Compliance: Max 450 lines per file (complex components)**

### Files Requiring Refactoring:
1. **src/components/navigation/LuxuryHeader.tsx** (650+ lines)
   - Split into: LuxuryHeader.tsx, MegaMenu.tsx, MobileDrawer.tsx
   
2. **src/components/admin/OrderManagementDashboard.tsx** (850+ lines)
   - Split into: OrderManagementDashboard.tsx, OrderTable.tsx, OrderFilters.tsx, OrderMetrics.tsx

3. **src/services/categoryService.ts** (500+ lines)
   - Split into: categoryService.ts, categoryHelpers.ts, categoryConstants.ts

### Refactoring Template:
```typescript
// Example: LuxuryHeader refactor
// src/components/navigation/LuxuryHeader.tsx (main - 250 lines)
// src/components/navigation/MegaMenu.tsx (extracted - 200 lines)
// src/components/navigation/MobileDrawer.tsx (extracted - 200 lines)
```

### Playwright E2E Test - Phase 3
```javascript
// tests/phase3-refactor-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 3: Component Refactoring Validation', () => {
  test('Navigation components work after split', async ({ page }) => {
    await page.goto('/');
    
    // Desktop mega menu
    await page.hover('nav >> text=Collections');
    await expect(page.locator('[data-testid="mega-menu"]')).toBeVisible();
    
    // Mobile drawer
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('[data-testid="mobile-menu-trigger"]').click();
    await expect(page.locator('[data-testid="mobile-drawer"]')).toBeVisible();
  });

  test('Admin dashboard functional after split', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page.locator('[data-testid="order-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-filters"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-metrics"]')).toBeVisible();
  });
});
```

## Phase 4: Architecture Compliance & Service Layer
**Timeline: Day 5**
**Risk Level: Medium**
**CLAUDE_RULES Compliance: Service → Hook → Component architecture**

### Violations to Fix:
- Components making direct API calls (should use hooks)
- Hooks containing business logic (should use services)
- Services using React hooks (prohibited)

### Architecture Fixes:
```typescript
// BAD: Component with direct API call
const ProductCard = () => {
  useEffect(() => {
    fetch('/api/products')... // VIOLATION
  }, []);
};

// GOOD: Component → Hook → Service
const ProductCard = () => {
  const { products } = useProducts(); // Compliant
};
```

### Playwright E2E Test - Phase 4
```javascript
// tests/phase4-architecture-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 4: Architecture Compliance', () => {
  test('API calls through proper service layer', async ({ page }) => {
    await page.goto('/catalog');
    
    // Monitor network requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Verify API calls are properly structured
    expect(apiCalls.length).toBeGreaterThan(0);
    apiCalls.forEach(call => {
      expect(call).toMatch(/\/api\/(products|cart|auth)/);
    });
  });
});
```

## Phase 5: Final Cleanup & Optimization
**Timeline: Day 6**
**Risk Level: Low**
**CLAUDE_RULES Compliance: Performance and maintainability**

### Tasks:
1. Remove unused imports
2. Delete commented-out code
3. Remove backup files (.backup, .old)
4. Optimize bundle size
5. Update dependencies

### Playwright E2E Test - Phase 5
```javascript
// tests/phase5-final-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 5: Final Health Check', () => {
  test('Performance metrics', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation')[0]);
    });
    
    const perf = JSON.parse(metrics);
    expect(perf.loadEventEnd - perf.fetchStart).toBeLessThan(3000); // Page load < 3s
  });

  test('Bundle size optimized', async ({ page }) => {
    const coverage = await page.coverage.startJSCoverage();
    await page.goto('/');
    const entries = await page.coverage.stopJSCoverage();
    
    const totalBytes = entries.reduce((acc, entry) => acc + entry.text.length, 0);
    const usedBytes = entries.reduce((acc, entry) => {
      return acc + entry.ranges.reduce((acc2, range) => acc2 + range.end - range.start, 0);
    }, 0);
    
    const unusedPercentage = ((totalBytes - usedBytes) / totalBytes) * 100;
    expect(unusedPercentage).toBeLessThan(40); // Less than 40% unused code
  });

  test('Full E2E user journey', async ({ page }) => {
    // Browse catalog
    await page.goto('/catalog');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    // Add to cart
    await page.locator('[data-testid="add-to-cart"]').first().click();
    
    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    
    // Proceed to checkout
    await page.locator('button:has-text("Checkout")').click();
    await expect(page).toHaveURL(/\/checkout/);
  });
});
```

## Rollback Procedures

### Git Backup Strategy:
```bash
# Before each phase
git checkout -b cleanup-phase-X-backup
git add .
git commit -m "Backup before Phase X cleanup"

# If rollback needed
git checkout main
git reset --hard cleanup-phase-X-backup
```

### Emergency Recovery:
1. Keep full backup of current state
2. Document all deleted files
3. Test incrementally
4. Monitor error logs
5. Have database backups ready

## Success Criteria

### Phase Completion Checklist:
- [ ] All Playwright tests passing
- [ ] No console errors in production
- [ ] Build succeeds without warnings
- [ ] Lighthouse score maintained/improved
- [ ] CLAUDE_RULES compliance verified
- [ ] User journeys functional

### Performance Targets:
- Page load time: <3 seconds
- API response: <300ms
- Bundle size: <500KB initial
- Test coverage: >80%

## Monitoring & Validation

### Continuous Monitoring:
```javascript
// scripts/health-check.js
const tests = [
  'npx playwright test',
  'npm run build',
  'npm run lint',
  'npm run type-check'
];

tests.forEach(async (test) => {
  console.log(`Running: ${test}`);
  const result = await exec(test);
  if (result.code !== 0) {
    console.error(`Failed: ${test}`);
    process.exit(1);
  }
});
```

## Implementation Timeline

| Phase | Duration | Risk | Priority |
|-------|----------|------|----------|
| Phase 1: Unused Files | 1 day | Low | High |
| Phase 2: Console Cleanup | 1 day | Low | Medium |
| Phase 3: File Refactoring | 2 days | Medium | High |
| Phase 4: Architecture | 1 day | Medium | High |
| Phase 5: Final Optimization | 1 day | Low | Medium |

**Total Duration: 6 days**

## Post-Cleanup Maintenance

### Automated Checks:
1. Pre-commit hooks for file size
2. ESLint rules for console.log
3. Architecture linting
4. Bundle size monitoring
5. Regular dependency updates

### Documentation Updates:
- Update IMPLEMENTATION_STATUS.md
- Update component documentation
- Create architecture diagram
- Update README with new structure

## Approval & Sign-off

- [ ] Technical Lead Review
- [ ] QA Validation
- [ ] Performance Benchmarks Met
- [ ] CLAUDE_RULES Compliance Verified
- [ ] Production Deployment Ready

---

*This plan ensures systematic cleanup while maintaining codebase health through comprehensive testing at each phase.*