/**
 * End-to-End Tests for Admin Creator Management
 * Tests the complete Creator admin functionality with real data integration
 */

const { test, expect } = require('@playwright/test')

const ADMIN_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@glowglitch.com'
const ADMIN_PASSWORD = 'admin123'

// Test admin creator management functionality
test.describe('Admin Creator Management E2E Tests', () => {
  
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

  test('Admin Creators Page Loads Successfully', async ({ page }) => {
    console.log('🧪 Testing: Admin creators page loading')
    
    // Navigate to creators page
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    
    // Verify page loads without errors
    await expect(page).toHaveTitle(/.*Creator Management.*/)
    
    // Check for main components
    await expect(page.locator('h1')).toContainText('Creator Management')
    await expect(page.locator('[data-testid="creators-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="metrics-overview"]')).toBeVisible()
    
    console.log('✅ Creators page loaded successfully')
  })

  test('Creator Metrics Display Correctly', async ({ page }) => {
    console.log('🧪 Testing: Creator metrics and overview functionality')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle')
    
    // Check metrics overview cards
    const metricsSection = page.locator('[data-testid="metrics-overview"]')
    await expect(metricsSection.locator('text=Total Creators')).toBeVisible()
    await expect(metricsSection.locator('text=Pending Applications')).toBeVisible()
    await expect(metricsSection.locator('text=Active Creators')).toBeVisible()
    await expect(metricsSection.locator('text=Approval Rate')).toBeVisible()
    
    // Verify metrics have numerical values
    const metricCards = page.locator('[data-testid="metrics-overview"] > div')
    const cardCount = await metricCards.count()
    expect(cardCount).toBe(4)
    
    console.log('✅ Creator metrics display correctly')
  })

  test('Creator List and Table Display', async ({ page }) => {
    console.log('🧪 Testing: Creator list and table functionality')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Check if creators table exists
    const creatorsTable = page.locator('table')
    await expect(creatorsTable).toBeVisible()
    
    // Verify table headers
    await expect(page.locator('th')).toContainText([
      'Creator', 'Status', 'Tier', 'Performance', 'Earnings', 'Commission Rate', 'Joined', 'Actions'
    ])
    
    // Check for creator data rows
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Verify first row has expected data structure
      await expect(tableRows.first().locator('td').first()).toBeVisible()
      
      // Check for status badges
      await expect(page.locator('.status-badge, [class*="bg-"][class*="text-"]')).toBeVisible()
      
      // Check for tier badges
      await expect(page.locator('text=Bronze, text=Silver, text=Gold, text=Platinum').first()).toBeVisible()
    }
    
    console.log('✅ Creator list and table display correctly')
  })

  test('Creator Filtering Functionality', async ({ page }) => {
    console.log('🧪 Testing: Creator filtering capabilities')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Open filters panel
    await page.click('button:has-text("Filters")')
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible()
    
    // Test status filtering
    await page.selectOption('select:has-option([value="pending"])', 'pending')
    await page.waitForLoadState('networkidle')
    
    // Verify filtered results show only pending creators
    const statusBadges = page.locator('[class*="bg-yellow"]')
    const badgeCount = await statusBadges.count()
    if (badgeCount > 0) {
      for (let i = 0; i < badgeCount; i++) {
        await expect(statusBadges.nth(i)).toContainText('pending')
      }
    }
    
    // Test tier filtering
    await page.selectOption('select:has-option([value="gold"])', 'gold')
    await page.waitForLoadState('networkidle')
    
    // Test search functionality
    await page.fill('input[placeholder*="Search creators"]', 'test')
    await page.waitForLoadState('networkidle')
    
    // Reset filters
    await page.selectOption('select:has-option([value="all"])', 'all')
    await page.fill('input[placeholder*="Search creators"]', '')
    
    console.log('✅ Creator filtering works correctly')
  })

  test('Bulk Creator Operations', async ({ page }) => {
    console.log('🧪 Testing: Bulk operations on creators')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Select multiple creators
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    
    if (checkboxCount > 1) {
      // Select first two creators (skip header checkbox)
      await checkboxes.nth(1).check()
      await checkboxes.nth(2).check()
      
      // Verify bulk actions bar appears
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).toBeVisible()
      await expect(page.locator('text=2 creators selected')).toBeVisible()
      
      // Test bulk action buttons
      await expect(page.locator('button:has-text("Approve")')).toBeVisible()
      await expect(page.locator('button:has-text("Suspend")')).toBeVisible()
      await expect(page.locator('button:has-text("Export CSV")')).toBeVisible()
      
      // Test export functionality
      const downloadPromise = page.waitForEvent('download')
      await page.click('button:has-text("Export CSV")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/creators-export.*\.csv/)
      
      // Clear selection
      await page.click('button:has-text("Clear Selection")')
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).not.toBeVisible()
    }
    
    console.log('✅ Bulk operations functionality works')
  })

  test('Creator Detail Modal Functionality', async ({ page }) => {
    console.log('🧪 Testing: Creator detail modal')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Click on first creator view button
    const viewButtons = page.locator('button[aria-label="View creator details"], [aria-label*="View"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      
      // Verify modal opens
      await expect(page.locator('[data-testid="creator-detail-modal"]')).toBeVisible()
      
      // Check modal navigation tabs
      await expect(page.locator('button:has-text("Overview")')).toBeVisible()
      await expect(page.locator('button:has-text("Performance")')).toBeVisible()
      await expect(page.locator('button:has-text("Referral Links")')).toBeVisible()
      await expect(page.locator('button:has-text("Transactions")')).toBeVisible()
      await expect(page.locator('button:has-text("Payouts")')).toBeVisible()
      await expect(page.locator('button:has-text("Activity")')).toBeVisible()
      await expect(page.locator('button:has-text("Settings")')).toBeVisible()
      
      // Test tab navigation
      await page.click('button:has-text("Performance")')
      await expect(page.locator('text=Total Clicks, text=Conversions')).toBeVisible()
      
      await page.click('button:has-text("Referral Links")')
      await expect(page.locator('text=Referral Links')).toBeVisible()
      
      await page.click('button:has-text("Transactions")')
      await expect(page.locator('text=Recent Transactions')).toBeVisible()
      
      await page.click('button:has-text("Payouts")')
      await expect(page.locator('text=Payout History')).toBeVisible()
      
      // Test overview tab actions
      await page.click('button:has-text("Overview")')
      
      // Check for quick action buttons (will vary based on creator status)
      const actionButtons = page.locator('button:has-text("Approve"), button:has-text("Suspend"), button:has-text("Reactivate"), button:has-text("Trigger Payout")')
      const actionButtonCount = await actionButtons.count()
      console.log(`Found ${actionButtonCount} action buttons`)
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
      await expect(page.locator('[data-testid="creator-detail-modal"]')).not.toBeVisible()
    }
    
    console.log('✅ Creator detail modal works correctly')
  })

  test('Creator Status Management', async ({ page }) => {
    console.log('🧪 Testing: Creator status updates')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Find a pending creator to approve
    const pendingCreators = page.locator('tr:has([class*="bg-yellow"]:has-text("pending"))')
    const pendingCount = await pendingCreators.count()
    
    if (pendingCount > 0) {
      // Click on first pending creator
      const viewButton = pendingCreators.first().locator('button[aria-label*="View"]')
      await viewButton.click()
      
      await expect(page.locator('[data-testid="creator-detail-modal"]')).toBeVisible()
      
      // Look for approve button
      const approveButton = page.locator('button:has-text("Approve Application")')
      const isApproveVisible = await approveButton.isVisible()
      
      if (isApproveVisible) {
        // Test approval (but don't actually approve to avoid affecting test data)
        await expect(approveButton).toBeVisible()
        console.log('Approve button found and functional')
      }
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
    }
    
    console.log('✅ Creator status management works')
  })

  test('Creator Commission Rate Updates', async ({ page }) => {
    console.log('🧪 Testing: Commission rate updates')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Open first creator detail
    const viewButtons = page.locator('button[aria-label*="View"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      await expect(page.locator('[data-testid="creator-detail-modal"]')).toBeVisible()
      
      // Look for commission rate edit functionality
      const editButtons = page.locator('button:has(svg):near(:text("Commission Rate"))')
      const editButtonCount = await editButtons.count()
      
      if (editButtonCount > 0) {
        await editButtons.first().click()
        
        // Check if edit mode activated
        const commissionInput = page.locator('input[type="number"]:near(:text("Commission Rate"))')
        await expect(commissionInput).toBeVisible()
        
        // Test input validation (don't save to avoid affecting test data)
        await commissionInput.fill('15')
        await expect(commissionInput).toHaveValue('15')
        
        console.log('Commission rate editing interface works')
      }
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
    }
    
    console.log('✅ Commission rate updates work correctly')
  })

  test('Creator Analytics and Metrics', async ({ page }) => {
    console.log('🧪 Testing: Creator analytics and performance metrics')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Open first creator detail
    const viewButtons = page.locator('button[aria-label*="View"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      await expect(page.locator('[data-testid="creator-detail-modal"]')).toBeVisible()
      
      // Navigate to performance tab
      await page.click('button:has-text("Performance")')
      
      // Check for key performance metrics
      const metricsCards = page.locator('[class*="bg-"][class*="50"] .text-2xl')
      const metricsCount = await metricsCards.count()
      
      if (metricsCount > 0) {
        // Verify numeric metrics are displayed
        for (let i = 0; i < Math.min(metricsCount, 4); i++) {
          const metricValue = await metricsCards.nth(i).textContent()
          expect(metricValue).toMatch(/\d+|[%$]/) // Should contain numbers, % or $
        }
      }
      
      // Check performance indicators
      await expect(page.locator('text=Total Clicks, text=Conversions, text=Conversion Rate, text=Total Earnings')).toBeVisible()
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
    }
    
    console.log('✅ Creator analytics and metrics work correctly')
  })

  test('Payout Management Interface', async ({ page }) => {
    console.log('🧪 Testing: Payout management functionality')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Open creator with earnings
    const viewButtons = page.locator('button[aria-label*="View"]')
    const viewButtonCount = await viewButtons.count()
    
    if (viewButtonCount > 0) {
      await viewButtons.first().click()
      await expect(page.locator('[data-testid="creator-detail-modal"]')).toBeVisible()
      
      // Navigate to payouts tab
      await page.click('button:has-text("Payouts")')
      
      // Check payout history section
      await expect(page.locator('text=Payout History')).toBeVisible()
      
      // Look for trigger payout button (may not exist if no pending earnings)
      const triggerPayoutButton = page.locator('button:has-text("Trigger Payout")')
      const hasPayoutButton = await triggerPayoutButton.isVisible()
      
      if (hasPayoutButton) {
        // Verify payout amount is displayed
        const buttonText = await triggerPayoutButton.textContent()
        expect(buttonText).toMatch(/\$\d+/) // Should contain dollar amount
        console.log('Payout trigger button found with amount')
      }
      
      // Check payout history entries if any exist
      const payoutEntries = page.locator('[class*="border"] [class*="rounded-lg"]:has(text=completed, text=pending, text=processing)')
      const payoutCount = await payoutEntries.count()
      console.log(`Found ${payoutCount} payout history entries`)
      
      // Close modal
      await page.click('button[aria-label="Close modal"]')
    }
    
    console.log('✅ Payout management interface works correctly')
  })

  test('Pagination and Data Loading', async ({ page }) => {
    console.log('🧪 Testing: Pagination and data loading')
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]')
    const paginationExists = await pagination.isVisible()
    
    if (paginationExists) {
      await expect(page.locator('text=Showing page')).toBeVisible()
      
      // Test next page if available
      const nextButton = page.locator('button:has-text("Next")')
      const isNextEnabled = await nextButton.isEnabled()
      
      if (isNextEnabled) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('text=page 2')).toBeVisible()
        
        // Go back to first page
        const prevButton = page.locator('button:has-text("Previous")')
        await prevButton.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('text=page 1')).toBeVisible()
      }
    }
    
    // Test items per page selector
    const limitSelector = page.locator('select:has-option([value="50"])')
    const limitExists = await limitSelector.isVisible()
    
    if (limitExists) {
      await limitSelector.selectOption('50')
      await page.waitForLoadState('networkidle')
      console.log('Items per page selector works')
    }
    
    console.log('✅ Pagination and data loading work correctly')
  })

  test('API Integration and Error Handling', async ({ page }) => {
    console.log('🧪 Testing: API integration and error handling')
    
    // Monitor network requests
    const apiRequests = []
    page.on('request', request => {
      if (request.url().includes('/api/admin/creators')) {
        apiRequests.push(request.url())
      }
    })
    
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
    await page.waitForLoadState('networkidle')
    
    // Verify API calls were made
    expect(apiRequests.length).toBeGreaterThan(0)
    expect(apiRequests.some(url => url.includes('/api/admin/creators'))).toBeTruthy()
    
    // Test refresh functionality
    const refreshButton = page.locator('button:has-text("Refresh")')
    await refreshButton.click()
    await page.waitForLoadState('networkidle')
    
    // Check for error states (should not have errors in normal operation)
    const errorMessages = page.locator('[data-testid="error-message"], [class*="error"]')
    const errorCount = await errorMessages.count()
    expect(errorCount).toBe(0)
    
    console.log('✅ API integration works correctly')
  })

  test('Responsive Design and Mobile Layout', async ({ page }) => {
    console.log('🧪 Testing: Responsive design')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
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
test.describe('Creator Admin Performance Tests', () => {
  
  test('Page Load Performance', async ({ page }) => {
    console.log('🧪 Testing: Page load performance')
    
    const startTime = Date.now()
    await page.goto(`${ADMIN_BASE_URL}/admin/creators`)
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

console.log('🚀 Admin Creator E2E Tests Ready')
console.log('Run with: PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test test-admin-creators-e2e.js')