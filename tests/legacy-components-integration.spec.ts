import { test, expect } from '@playwright/test'

test.describe('Legacy Components Integration', () => {
  test('Care page loads with proper navigation', async ({ page }) => {
    await page.goto('/care')
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Jewelry Care Center')
    
    // Check tab navigation
    await expect(page.locator('text=Care Guides')).toBeVisible()
    await expect(page.locator('text=Material Care')).toBeVisible()
    await expect(page.locator('text=Professional Services')).toBeVisible()
    await expect(page.locator('text=Maintenance Reminders')).toBeVisible()
    
    // Click on Material Care tab
    await page.click('text=Material Care')
    await expect(page.locator('h2:has-text("Material-Specific Care")')).toBeVisible()
  })

  test('Referral page displays properly', async ({ page }) => {
    await page.goto('/referral')
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Share the Brilliance')
    
    // Check referral code display
    await expect(page.locator('text=GLITCH50')).toBeVisible()
    
    // Check benefits section
    await expect(page.locator('text=You Earn $50')).toBeVisible()
    await expect(page.locator('text=Friend Gets $25')).toBeVisible()
    await expect(page.locator('text=No Limits')).toBeVisible()
  })

  test('Sizing page ring finder works', async ({ page }) => {
    await page.goto('/sizing')
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Perfect Fit Center')
    
    // Default tab should be rings
    await expect(page.locator('h2:has-text("Ring Size Finder")')).toBeVisible()
    
    // Test measurement input
    const input = page.locator('input[placeholder="Enter measurement"]')
    await input.fill('52')
    
    // Should show converted sizes
    await expect(page.locator('text=Your Ring Size:')).toBeVisible()
    
    // Test other tabs
    await page.click('text=Necklace Guide')
    await expect(page.locator('h2:has-text("Necklace Length Guide")')).toBeVisible()
    await expect(page.locator('text=Choker')).toBeVisible()
    await expect(page.locator('text=Princess')).toBeVisible()
  })

  test('Quality page warranty tools work', async ({ page }) => {
    await page.goto('/quality')
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Quality & Service Center')
    
    // Check warranty tab (should be active by default)
    await expect(page.locator('h3:has-text("Register Your Warranty")')).toBeVisible()
    
    // Test form fields
    await page.fill('input[placeholder="LL-123456"]', 'LL-123456')
    await page.fill('input[placeholder="John Doe"]', 'John Doe')
    
    // Check other tabs
    await page.click('text=Support Center')
    await expect(page.locator('text=Expert Support Center')).toBeVisible()
    await expect(page.locator('text=Phone Support')).toBeVisible()
  })

  test('Header navigation includes new menu items', async ({ page }) => {
    await page.goto('/')
    
    // Check new navigation items are present
    await expect(page.locator('text=CARE')).toBeVisible()
    await expect(page.locator('text=SIZING')).toBeVisible()
    await expect(page.locator('text=REFERRAL')).toBeVisible()
    await expect(page.locator('text=QUALITY')).toBeVisible()
    
    // Test navigation links
    await page.hover('text=CARE')
    await page.click('text=CARE')
    await expect(page).toHaveURL('/care')
    
    await page.goto('/')
    await page.hover('text=SIZING')
    await page.click('text=SIZING')
    await expect(page).toHaveURL('/sizing')
  })

  test('All pages use CLAUDE_RULES compliant colors', async ({ page }) => {
    const pages = ['/care', '/referral', '/sizing', '/quality']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      
      // Check for approved color classes
      const approvedColors = [
        'text-foreground',
        'text-accent',
        'text-background',
        'bg-background',
        'bg-white',
        'bg-muted',
        'bg-cta',
        'border-border'
      ]
      
      // Should not have deprecated color classes
      const deprecatedColors = [
        'text-purple-600',
        'text-blue-600',
        'bg-blue-50',
        'border-gray-100',
        'text-green-900'
      ]
      
      for (const deprecatedColor of deprecatedColors) {
        const elements = await page.locator(`[class*="${deprecatedColor}"]`).count()
        expect(elements).toBe(0)
      }
    }
  })

  test('Mobile responsiveness works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    
    await page.goto('/care')
    
    // Tab navigation should be scrollable
    const tabContainer = page.locator('.overflow-x-auto')
    await expect(tabContainer).toBeVisible()
    
    // Hero section should stack properly
    const heroSection = page.locator('h1')
    await expect(heroSection).toBeVisible()
  })
})