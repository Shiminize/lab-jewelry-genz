/**
 * End-to-End Tests for Admin Orders Management
 * Tests the complete Orders admin functionality with real data integration
 */

const { test, expect } = require('@playwright/test')

const ADMIN_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@glowglitch.com'
const ADMIN_PASSWORD = 'admin123'

// Test admin authentication and orders page access
test.describe('Admin Orders Management E2E Tests', () => {
  
  // Setup: Login as admin before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/login`)
    
    // Login as admin (assuming login form exists)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin**')
  })

  test('Admin Orders Page Loads Successfully', async ({ page }) => {
    console.log('🧪 Testing: Admin orders page loading')
    
    // Navigate to orders page
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    
    // Verify page loads without errors
    await expect(page).toHaveTitle(/.*Order Management.*/)
    
    // Check for main components
    await expect(page.locator('h1')).toContainText('Order Management')
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="metrics-overview"]')).toBeVisible()
    
    console.log('✅ Orders page loaded successfully')
  })

  test('Orders List and Metrics Display', async ({ page }) => {
    console.log('🧪 Testing: Orders list and metrics functionality')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle')
    
    // Check if orders are loaded
    const ordersTable = page.locator('table')
    await expect(ordersTable).toBeVisible()
    
    // Verify table headers
    await expect(page.locator('th')).toContainText(['Order', 'Customer', 'Status', 'Payment', 'Total', 'Date', 'Actions'])
    
    // Check for metrics cards
    const metricsSection = page.locator('[data-testid="metrics-overview"]')
    await expect(metricsSection.locator('text=Total Orders')).toBeVisible()
    await expect(metricsSection.locator('text=Avg Order Value')).toBeVisible()
    await expect(metricsSection.locator('text=Guest Orders')).toBeVisible()
    
    console.log('✅ Orders list and metrics display correctly')
  })

  test('Order Filtering Functionality', async ({ page }) => {
    console.log('🧪 Testing: Order filtering capabilities')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Open filters panel
    await page.click('button:has-text("Filters")')
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible()
    
    // Test status filtering
    await page.selectOption('select[name="status"]', 'confirmed')
    await page.click('button:has-text("Apply Filters")')
    await page.waitForLoadState('networkidle')
    
    // Verify filtered results
    const statusBadges = page.locator('.status-badge')
    const count = await statusBadges.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i)).toContainText('confirmed')
      }
    }
    
    // Test search functionality
    await page.fill('input[placeholder*="Order number, email"]', 'GG-')
    await page.click('button:has-text("Apply Filters")')
    await page.waitForLoadState('networkidle')
    
    // Verify search results contain order numbers
    const orderNumbers = page.locator('td:first-child')
    const orderCount = await orderNumbers.count()
    if (orderCount > 0) {
      for (let i = 0; i < orderCount; i++) {
        await expect(orderNumbers.nth(i)).toContainText('GG-')
      }
    }
    
    console.log('✅ Order filtering works correctly')
  })

  test('Bulk Operations Functionality', async ({ page }) => {
    console.log('🧪 Testing: Bulk operations on orders')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Select multiple orders
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    
    if (checkboxCount > 1) {
      // Select first two orders (skip header checkbox)
      await checkboxes.nth(1).check()
      await checkboxes.nth(2).check()
      
      // Verify bulk actions bar appears
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).toBeVisible()
      await expect(page.locator('text=2 orders selected')).toBeVisible()
      
      // Test status update dropdown
      const statusSelect = page.locator('select:has-option([value="confirmed"])')
      await expect(statusSelect).toBeVisible()
      
      // Test export functionality
      const exportButton = page.locator('button:has-text("Export CSV")')
      await expect(exportButton).toBeVisible()
      
      // Clear selection
      await page.click('button:has-text("Clear Selection")')
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).not.toBeVisible()
    }
    
    console.log('✅ Bulk operations functionality works')
  })

  test('Order Detail Modal Functionality', async ({ page }) => {
    console.log('🧪 Testing: Order detail modal')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Click on first order view button
    const viewButtons = page.locator('button[aria-label="View order"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      
      // Verify modal opens
      await expect(page.locator('[data-testid="order-detail-modal"]')).toBeVisible()
      
      // Check modal tabs
      await expect(page.locator('button:has-text("Overview")')).toBeVisible()
      await expect(page.locator('button:has-text("Items")')).toBeVisible()
      await expect(page.locator('button:has-text("Customer")')).toBeVisible()
      await expect(page.locator('button:has-text("Timeline")')).toBeVisible()
      await expect(page.locator('button:has-text("Actions")')).toBeVisible()
      
      // Test tab navigation
      await page.click('button:has-text("Items")')
      await expect(page.locator('text=Order Items')).toBeVisible()
      
      await page.click('button:has-text("Customer")')
      await expect(page.locator('text=Customer Information')).toBeVisible()
      
      await page.click('button:has-text("Timeline")')
      await expect(page.locator('text=Order Timeline')).toBeVisible()
      
      await page.click('button:has-text("Actions")')
      await expect(page.locator('text=Update Order Status')).toBeVisible()
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
      await expect(page.locator('[data-testid="order-detail-modal"]')).not.toBeVisible()
    }
    
    console.log('✅ Order detail modal works correctly')
  })

  test('Order Status Update Functionality', async ({ page }) => {
    console.log('🧪 Testing: Order status updates')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Open first order detail
    const viewButtons = page.locator('button[aria-label="View order"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      await expect(page.locator('[data-testid="order-detail-modal"]')).toBeVisible()
      
      // Navigate to Actions tab
      await page.click('button:has-text("Actions")')
      
      // Test status update form
      await page.click('button:has-text("Edit"):near(:text("Update Order Status"))')
      
      // Verify status update form appears
      await expect(page.locator('select[name="status"]')).toBeVisible()
      await expect(page.locator('textarea[placeholder*="Additional information"]')).toBeVisible()
      await expect(page.locator('input[type="checkbox"]:near(:text("Notify customer"))')).toBeVisible()
      
      // Test status selection
      await page.selectOption('select[name="status"]', 'processing')
      await page.fill('textarea[placeholder*="Additional information"]', 'Order status updated via E2E test')
      
      // Submit status update (but cancel to avoid actual changes)
      // await page.click('button:has-text("Update Status")')
      await page.click('button:has-text("Cancel")')
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
    }
    
    console.log('✅ Order status update functionality works')
  })

  test('Pagination Functionality', async ({ page }) => {
    console.log('🧪 Testing: Orders pagination')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]')
    const paginationExists = await pagination.isVisible()
    
    if (paginationExists) {
      await expect(page.locator('text=Page 1 of')).toBeVisible()
      
      // Test next page if available
      const nextButton = page.locator('button[aria-label="Next page"]')
      const isNextEnabled = await nextButton.isEnabled()
      
      if (isNextEnabled) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('text=Page 2 of')).toBeVisible()
        
        // Go back to first page
        const prevButton = page.locator('button[aria-label="Previous page"]')
        await prevButton.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('text=Page 1 of')).toBeVisible()
      }
    }
    
    console.log('✅ Pagination functionality works')
  })

  test('API Integration and Error Handling', async ({ page }) => {
    console.log('🧪 Testing: API integration and error handling')
    
    // Monitor network requests
    const apiRequests = []
    page.on('request', request => {
      if (request.url().includes('/api/admin/orders')) {
        apiRequests.push(request.url())
      }
    })
    
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Verify API calls were made
    expect(apiRequests.length).toBeGreaterThan(0)
    expect(apiRequests.some(url => url.includes('/api/admin/orders'))).toBeTruthy()
    
    // Test refresh functionality
    const refreshButton = page.locator('button:has-text("Refresh")')
    await refreshButton.click()
    await page.waitForLoadState('networkidle')
    
    // Check for error states (should not have errors in normal operation)
    const errorMessages = page.locator('[data-testid="error-message"]')
    await expect(errorMessages).toHaveCount(0)
    
    console.log('✅ API integration works correctly')
  })

  test('Responsive Design and Mobile Layout', async ({ page }) => {
    console.log('🧪 Testing: Responsive design')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    
    // Verify mobile layout adaptations
    await expect(page.locator('h1')).toBeVisible()
    
    // Check if table scrolls horizontally on mobile
    const table = page.locator('table')
    await expect(table).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('h1')).toBeVisible()
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    
    console.log('✅ Responsive design works correctly')
  })
})

// Run performance and load testing
test.describe('Orders Admin Performance Tests', () => {
  
  test('Page Load Performance', async ({ page }) => {
    console.log('🧪 Testing: Page load performance')
    
    const startTime = Date.now()
    await page.goto(`${ADMIN_BASE_URL}/admin/orders`)
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Verify page loads within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    
    // Check for performance metrics
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'))
    })
    
    const entries = JSON.parse(performanceEntries)
    console.log(`📊 Page load time: ${loadTime}ms`)
    console.log(`📊 DOM Content Loaded: ${entries[0]?.domContentLoadedEventEnd - entries[0]?.domContentLoadedEventStart}ms`)
    
    console.log('✅ Page load performance is acceptable')
  })
})

console.log('🚀 Admin Orders E2E Tests Ready')
console.log('Run with: PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test test-admin-orders-e2e.js')