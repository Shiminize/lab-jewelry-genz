# CLAUDE_RULES.md Compliance Testing Guide

This comprehensive testing suite validates your 3D customizer implementation against all CLAUDE_RULES.md requirements. The test suite covers 6 major compliance areas with end-to-end automation using Playwright and Jest.

## 🎯 Test Suite Overview

### High Priority Areas (Critical for Production)

1. **API Compliance** - Response envelopes, Zod validation, rate limiting, security headers, <300ms response times
2. **3D Customizer Acceptance** - Metal changes <2s, price calculations, mobile performance, WebGL fallbacks, save/share
3. **Accessibility (WCAG 2.1 AA)** - ARIA labels, keyboard navigation, focus management, 4.5:1 contrast ratios  
4. **Performance Requirements** - Mobile-first <3s loads, 60FPS desktop/30FPS mobile, <5s 3D load on 3G

### Medium Priority Areas (Code Quality & Maintainability)

5. **Design System Compliance** - No hardcoded colors, proper tokens, typography constraints, spacing validation
6. **Component Architecture** - TypeScript strict mode, error-first coding, proper file structure, memoization

## 📁 Test File Structure

```
tests/
├── compliance-test-suite.spec.ts          # Master test orchestrator
├── api-compliance.spec.ts                 # API endpoint compliance
├── 3d-customizer-acceptance.spec.ts       # 3D customizer functionality  
├── accessibility-compliance.spec.ts       # WCAG 2.1 AA compliance
├── performance-compliance.spec.ts         # Performance requirements
├── design-system-compliance.spec.ts       # Design system validation
└── component-architecture-compliance.spec.ts  # TypeScript & architecture

scripts/
└── run-compliance-tests.sh               # Automated test runner

jest.config.js                            # Jest configuration for unit tests
jest.setup.js                             # Test environment setup
jest.polyfills.js                         # Modern API polyfills
playwright.config.ts                      # Playwright E2E configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install test dependencies
npm install --save-dev axe-playwright @testing-library/jest-dom @testing-library/react @testing-library/user-event undici

# Or use the automated installer
./scripts/run-compliance-tests.sh --install-deps
```

### 2. Run Complete Test Suite

```bash
# Run all compliance tests with automated setup
./scripts/run-compliance-tests.sh

# Run with specific browser
./scripts/run-compliance-tests.sh --browser=firefox

# Run in headed mode for debugging  
./scripts/run-compliance-tests.sh --headed

# Run with parallel workers
./scripts/run-compliance-tests.sh --workers=4
```

### 3. Run Individual Test Suites

```bash
# API compliance only
npx playwright test tests/api-compliance.spec.ts

# 3D customizer acceptance criteria
npx playwright test tests/3d-customizer-acceptance.spec.ts

# Accessibility validation
npx playwright test tests/accessibility-compliance.spec.ts

# Performance benchmarks
npx playwright test tests/performance-compliance.spec.ts

# Design system compliance
npx playwright test tests/design-system-compliance.spec.ts

# Component architecture validation
npx playwright test tests/component-architecture-compliance.spec.ts
```

## 📊 Test Categories Explained

### API Compliance Tests
- ✅ Response envelope format (success/error with meta)
- ✅ Zod schema validation on all inputs
- ✅ Rate limiting with X-RateLimit-* headers
- ✅ Security headers (HSTS, CSP, XSS protection)
- ✅ Sub-300ms response time targets
- ✅ No raw MongoDB documents in responses
- ✅ Proper error handling and status codes

### 3D Customizer Acceptance Tests  
- ✅ Metal changes reflect visually within 2 seconds
- ✅ Price recalculates on stone/size changes
- ✅ 3D viewer runs smoothly on mobile devices
- ✅ WebGL fallback to 2D with UX parity
- ✅ Design save/share with URL functionality
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)
- ✅ Touch controls and mobile gestures

### Accessibility Compliance Tests
- ✅ WCAG 2.1 AA automated audit with axe-playwright
- ✅ Interactive elements have ARIA labels
- ✅ Keyboard navigation for all functionality  
- ✅ Focus management and visible focus indicators
- ✅ 4.5:1 color contrast ratios
- ✅ Screen reader compatibility
- ✅ Semantic HTML structure

### Performance Compliance Tests
- ✅ Mobile-first page loads under 3 seconds
- ✅ WebGL 60 FPS desktop, 30 FPS mobile targets
- ✅ 3D model loads under 5 seconds on 3G
- ✅ Core Web Vitals (LCP, FID, CLS) compliance
- ✅ Image optimization and lazy loading
- ✅ Resource caching and CDN performance

### Design System Compliance Tests
- ✅ No hardcoded colors (gray-*, white, black, hex)
- ✅ Only approved design tokens used
- ✅ Typography uses font-headline/font-body only
- ✅ Proper spacing tokens (p-1..p-9, gap-*, space-y-*)
- ✅ CVA component variant patterns
- ✅ Responsive breakpoint consistency

### Component Architecture Tests
- ✅ TypeScript strict mode enabled
- ✅ No 'any' types in component code
- ✅ Error-first coding with recovery paths
- ✅ Proper file placement in src/components structure
- ✅ React.memo and useCallback optimizations
- ✅ Import organization and dependency management

## 🛠️ Test Configuration

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel**: Configurable workers for speed
- **Timeouts**: Generous timeouts for 3D loading
- **Retries**: Automatic retry on CI for flaky tests

### Jest Configuration  
- **Environment**: jsdom with modern API polyfills
- **Coverage**: 70% threshold for functions/lines/branches
- **Mocks**: WebGL, IntersectionObserver, ResizeObserver
- **TypeScript**: Full TypeScript support with strict mode

## 📈 Success Criteria

### Passing Thresholds
- **API Compliance**: 100% (Critical for security/functionality)
- **3D Customizer**: 90% (Allow some browser quirks)
- **Accessibility**: 95% (WCAG AA compliance required)  
- **Performance**: 85% (Network variability tolerance)
- **Design System**: 90% (Some flexibility for edge cases)
- **Architecture**: 80% (Balance strict rules with practicality)

### Overall Compliance
- **Production Ready**: 90%+ overall pass rate
- **Development Ready**: 75%+ overall pass rate  
- **Needs Work**: <75% overall pass rate

## 🐛 Debugging Failed Tests

### Common Issues & Solutions

**3D Customizer Not Loading**
```bash
# Check WebGL support
npx playwright test --grep="WebGL context is working"

# Debug with headed browser
npx playwright test tests/3d-customizer-acceptance.spec.ts --headed
```

**API Timeout Issues**
```bash
# Test with higher timeout
npx playwright test tests/api-compliance.spec.ts --timeout=30000

# Check server health
curl http://localhost:3000/api/health
```

**Design System Violations**
```bash
# Run design system tests with detailed output
npx playwright test tests/design-system-compliance.spec.ts --reporter=list
```

**Performance Issues**  
```bash
# Run performance tests on specific browser
npx playwright test tests/performance-compliance.spec.ts --browser=chromium

# Generate performance report
npx playwright test tests/performance-compliance.spec.ts --reporter=html
```

## 📋 Continuous Integration

### GitHub Actions Example
```yaml
name: CLAUDE_RULES.md Compliance
on: [push, pull_request]
jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: ./scripts/run-compliance-tests.sh
      - uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: playwright-report/
```

## 🎭 Advanced Usage

### Custom Test Runs
```bash
# Test specific compliance area
npx playwright test --grep="API Compliance"

# Test mobile only
npx playwright test --project="Mobile Chrome"

# Test with custom config
npx playwright test --config=playwright.compliance.config.ts
```

### Environment Variables
```bash
export PARALLEL_WORKERS=4
export BROWSER=firefox  
export HEADED=true
export TIMEOUT=30000
./scripts/run-compliance-tests.sh
```

### Performance Profiling
```bash
# Generate detailed performance traces
npx playwright test tests/performance-compliance.spec.ts --trace=on

# View traces
npx playwright show-trace test-results/.../trace.zip
```

## 📚 Resources

- [CLAUDE_RULES.md](./CLAUDE_RULES.md) - Complete compliance requirements
- [Playwright Documentation](https://playwright.dev/) - E2E testing framework
- [Jest Documentation](https://jestjs.io/) - Unit testing framework  
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) - Accessibility testing
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

## 🤝 Contributing

When adding new compliance requirements:

1. Update the appropriate test file
2. Add test cases with clear descriptions
3. Update this README with new requirements
4. Ensure tests are deterministic and fast
5. Add appropriate success/failure thresholds

## 📞 Support

For test failures or questions:
1. Check the HTML report: `playwright-report/index.html`  
2. Review test artifacts in `test-results/`
3. Run individual test suites for focused debugging
4. Use `--headed` mode to see tests run in browser
5. Check the detailed console output for specific failures

---

**🎯 Goal**: Ensure your 3D customizer implementation fully complies with CLAUDE_RULES.md for production deployment at scale.