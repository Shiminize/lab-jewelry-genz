# E2E Testing Suite for URL Parameter Filtering

This directory contains comprehensive end-to-end tests for the shareable URL functionality in the GenZ Jewelry catalog page. The tests ensure full compliance with CLAUDE_RULES.md requirements and provide robust coverage of all URL parameter scenarios.

## Test Files

### `url-parameter-filtering.spec.ts`
Comprehensive E2E tests for shareable URL functionality covering:

- **URL Parameter Parsing & Deep Linking**
- **MaterialTagChip URL Updates** 
- **Shareable URL Generation**
- **Browser Navigation (Back/Forward)**
- **URL Parameter Validation & Security**
- **Performance Requirements (CLAUDE_RULES)**
- **Mobile Viewport Testing**
- **Accessibility & Screen Reader Support**
- **Cross-Browser Compatibility**

### `material-tag-filtering.spec.ts`
Focused tests for MaterialTagChip click functionality and filtering workflow.

### Helper Files

#### `../utils/url-testing-helpers.ts`
Shared utilities providing:
- Performance monitoring utilities
- Test data generators for realistic scenarios
- Security validation helpers
- Mobile interaction testing
- Accessibility testing utilities

## Test Coverage

### 1. URL Parameter Parsing and Deep Linking

Tests that verify the catalog page correctly interprets URL parameters when users access shareable URLs directly.

**Scenarios Tested:**
- Single metal filters: `/catalog?metals=14k-gold`
- Single stone filters: `/catalog?stones=lab-diamond`
- Multiple filters: `/catalog?metals=14k-gold,platinum&stones=lab-diamond`
- Complex combinations: Metal + Stone + Price + Carat ranges
- Search queries in URLs: `/catalog?q=engagement+ring&metals=platinum`
- Sort parameters: `/catalog?metals=14k-gold&sortBy=price`
- Pagination: `/catalog?metals=silver&page=2`

**Validation:**
- Filter state correctly applied from URL parameters
- MaterialTagChip components show correct selected states
- Product results match filter criteria
- Search input populated with query parameter
- Sort dropdown shows correct selection

### 2. MaterialTagChip URL Updates

Tests that clicking material tags immediately updates the URL without full page refreshes.

**Scenarios Tested:**
- Single tag click updates URL immediately
- Multiple tag clicks accumulate in URL parameters
- Tag toggle behavior (click again to remove filter)
- Debounced URL updates prevent excessive history entries
- URL updates preserve existing parameters

**Performance Requirements:**
- URL updates complete within 300ms (CLAUDE_RULES compliance)
- Debouncing prevents excessive browser history entries
- No memory leaks during rapid filter changes

### 3. Shareable URL Testing

Tests realistic user scenarios where URLs are shared between users or devices.

**User Scenarios:**
- **Budget Shopper**: `/catalog?metals=silver&stones=moissanite&maxPrice=500`
- **Premium Buyer**: `/catalog?metals=platinum&stones=lab-diamond&caratMin=2`
- **Gift Seeker**: `/catalog?metals=14k-gold&category=rings&stones=lab-diamond`
- **Engagement Shopper**: Complex multi-parameter URLs

**Validation:**
- URLs work identically across browser tabs/windows
- Filter state perfectly preserved when sharing URLs
- Page refresh maintains exact filter state
- Search inputs and UI state restored correctly

### 4. Browser Navigation Testing

Tests that browser back/forward buttons work correctly with URL parameter filtering.

**Scenarios Tested:**
- Back navigation restores previous filter state
- Forward navigation works after going back
- Complex navigation sequences preserve state correctly
- URL history managed appropriately (no excessive entries)

**State Preservation:**
- Filter selections maintained across navigation
- Search queries preserved
- Sort order and pagination state retained
- Performance: Navigation responses under 3s (CLAUDE_RULES)

### 5. URL Parameter Validation and Security

Tests that invalid or malicious URL parameters are handled safely.

**Security Tests:**
- XSS prevention: `?q=<script>alert("xss")</script>`
- SQL injection protection: `?q='; DROP TABLE products; --`
- Parameter sanitization: Invalid metal/stone values filtered out
- Malformed URL handling: Graceful degradation

**Validation Tests:**
- Invalid metal parameters filtered out
- Invalid stone parameters ignored
- Invalid price ranges handled gracefully
- Malformed numeric values default appropriately

### 6. Performance Testing (CLAUDE_RULES Compliance)

Comprehensive performance validation ensuring all interactions meet strict requirements.

**Performance Targets:**
- Page loads: < 3 seconds
- Filter changes: < 300ms
- API responses: < 300ms
- URL updates: Immediate (< 50ms)

**Test Coverage:**
- Initial page load with URL parameters
- MaterialTagChip click response times
- API request/response monitoring
- Memory usage during rapid filter changes
- Debouncing effectiveness measurement

### 7. Mobile Viewport Testing

Tests URL parameter functionality across mobile devices and touch interactions.

**Mobile-Specific Tests:**
- Touch interaction with MaterialTagChip components
- Mobile viewport responsiveness (375px width)
- URL parameter handling on mobile browsers
- Touch navigation and swipe gestures
- Mobile keyboard input for search

**Validation:**
- All functionality works identically on mobile
- Touch targets meet accessibility requirements
- Mobile-specific UI elements function correctly

### 8. Accessibility Testing

Ensures URL parameter functionality is fully accessible to all users.

**Accessibility Tests:**
- Focus management during filter changes
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader announcements for filter changes
- ARIA attributes correctly implemented
- High contrast mode compatibility

**Standards Compliance:**
- WCAG 2.1 AA compliance
- Section 508 accessibility standards
- Proper semantic HTML structure
- Accessible form controls and interactions

### 9. Cross-Browser Compatibility

Tests URL functionality across all major browsers.

**Browser Coverage:**
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile browsers (Chrome Mobile, Safari Mobile)

**Feature Parity:**
- URL parameter parsing identical across browsers
- Navigation behavior consistent
- Performance targets met on all platforms
- No browser-specific bugs or regressions

## Running the Tests

### Quick Start
```bash
# Run all URL parameter tests
npm run test:url

# Run with visible browser (headed mode)
npm run test:url:headed

# Run mobile viewport tests
npm run test:url:mobile

# Run in debug mode
npm run test:url:debug
```

### Advanced Usage
```bash
# Specific browser
node scripts/test-url-parameters.js --browser=firefox

# Multiple options
node scripts/test-url-parameters.js --browser=webkit --headed --reporter=line

# Debug mode with breakpoints
node scripts/test-url-parameters.js --debug
```

### CI/CD Integration
```bash
# Headless mode for CI environments
npx playwright test tests/e2e/url-parameter-filtering.spec.ts

# Generate HTML report
npx playwright test tests/e2e/url-parameter-filtering.spec.ts --reporter=html

# JSON output for automated processing
npx playwright test tests/e2e/url-parameter-filtering.spec.ts --reporter=json
```

## Test Data and Scenarios

### Realistic User Journeys

The tests use realistic filter combinations based on actual user behavior:

```typescript
// Budget-conscious shopper
const budgetFilter = {
  metals: ['silver'],
  stones: ['moissanite'],
  priceRange: { max: 500 }
}

// Premium luxury buyer
const premiumFilter = {
  metals: ['platinum'],
  stones: ['lab-diamond'],
  caratRange: { min: 2 },
  priceRange: { min: 2000 }
}

// Engagement ring shopper
const engagementFilter = {
  metals: ['14k-gold', 'platinum'],
  categories: ['rings'],
  subcategories: ['engagement-rings'],
  stones: ['lab-diamond'],
  caratRange: { min: 1, max: 3 },
  priceRange: { min: 1000, max: 5000 }
}
```

### Edge Cases

Tests include comprehensive edge case coverage:

- Empty filter states
- Single filter selections
- Maximum complexity filter combinations
- Invalid parameter combinations
- Boundary value testing (price/carat ranges)

## Performance Monitoring

The test suite includes comprehensive performance monitoring:

```typescript
// Real-time performance tracking
const performanceMonitor = new PerformanceMonitor()

// Record measurements
performanceMonitor.record('pageLoad', loadTime)
performanceMonitor.record('filterResponse', responseTime)

// Validate against CLAUDE_RULES thresholds
const meetsRequirements = performanceMonitor.meetsThresholds('pageLoad', 3000)
```

## Continuous Integration

### Test Pipeline Integration

The URL parameter tests integrate seamlessly with existing CI/CD pipelines:

1. **Pre-commit hooks**: Run critical URL parameter tests
2. **PR validation**: Full test suite execution
3. **Deployment gates**: Performance threshold validation
4. **Production monitoring**: Ongoing performance tracking

### Failure Handling

Comprehensive error handling and reporting:

- Detailed failure reports with screenshots
- Performance regression detection
- Automatic retry for flaky network conditions
- Integration with monitoring and alerting systems

## Contributing

When adding new URL parameter functionality:

1. **Add corresponding tests** to `url-parameter-filtering.spec.ts`
2. **Update test scenarios** in `url-testing-helpers.ts`
3. **Verify performance compliance** with CLAUDE_RULES.md
4. **Test across all supported browsers**
5. **Validate accessibility compliance**

### Test Writing Guidelines

- Use TypeScript strict mode (no `any` types)
- Include performance assertions for all interactions
- Test both happy path and error scenarios
- Provide meaningful test descriptions and comments
- Use the helper utilities for consistency

## Troubleshooting

### Common Issues

**Tests failing locally but passing in CI:**
- Ensure development server is running (`npm run dev`)
- Check for port conflicts (default: localhost:3000)
- Verify database connection and seeded data

**Performance test failures:**
- Check system load during test execution
- Verify network conditions are stable
- Consider E2E testing buffers vs actual performance targets

**Browser-specific failures:**
- Update browser versions in `playwright.config.ts`
- Check for browser-specific feature support
- Validate CSS and JavaScript compatibility

### Debug Mode

Use debug mode for step-by-step test execution:

```bash
npm run test:url:debug
```

This opens the Playwright inspector allowing you to:
- Step through test execution
- Inspect page state at each step
- Modify selectors and retry actions
- Capture screenshots and videos

## Reporting

### HTML Reports

Generate comprehensive HTML reports:

```bash
npx playwright test tests/e2e/url-parameter-filtering.spec.ts --reporter=html
npx playwright show-report
```

### Performance Reports

Access detailed performance metrics:

```typescript
const report = performanceMonitor.generateReport()
console.log('Performance Summary:', report)
```

The test suite provides production-ready validation of shareable URL functionality with comprehensive coverage of user scenarios, performance requirements, and accessibility standards.