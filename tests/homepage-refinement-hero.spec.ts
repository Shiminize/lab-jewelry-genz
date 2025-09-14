import { test, expect } from '@playwright/test'

test.describe('Hero Section Refinement Validation', () => {
  test('Hero section spacing tokens applied correctly', async ({ page }) => {
    console.log('🧪 Testing Hero Section spacing refinements...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test headline margin-bottom (should be token-xl = 32px)
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible()
    
    const headlineSpacing = await headline.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.marginBottom
    })
    
    console.log(`✅ Headline margin-bottom: ${headlineSpacing}`)
    expect(['32px', '2rem']).toContain(headlineSpacing) // token-xl
    
    // Test sub-headline margin-bottom (should be token-2xl = 48px)  
    const subheadline = page.locator('h1').first().locator('+ p')
    if (await subheadline.count() > 0) {
      const subheadlineSpacing = await subheadline.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.marginBottom
      })
      
      console.log(`✅ Sub-headline margin-bottom: ${subheadlineSpacing}`)
      expect(['48px', '3rem']).toContain(subheadlineSpacing) // token-2xl
    }
    
    // Test button container gap (should be token-lg = 24px)
    const buttonContainer = page.locator('[class*="gap-token-lg"]').first()
    if (await buttonContainer.count() > 0) {
      const buttonGap = await buttonContainer.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.gap || styles.columnGap
      })
      
      console.log(`✅ Button container gap: ${buttonGap}`)
      expect(['24px', '1.5rem']).toContain(buttonGap) // token-lg
    }
    
    console.log('🎉 Hero Section spacing validation completed successfully')
  })
  
  test('No duplicate spacing variants exist', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    // Check that the page loads without console errors about duplicate classes
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    const spacingErrors = logs.filter(log => 
      log.includes('duplicate') || log.includes('conflict')
    )
    
    expect(spacingErrors).toHaveLength(0)
    console.log('✅ No spacing conflicts detected')
  })
  
  test('Hero section renders without breaking layout', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('h1', { timeout: 10000 })
    
    // Take screenshot for visual validation
    await page.screenshot({ 
      path: 'hero-section-refinement.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 800 }
    })
    
    // Verify hero section is visible and properly sized
    const heroSection = page.locator('section').first()
    const heroBox = await heroSection.boundingBox()
    
    expect(heroBox?.height).toBeGreaterThan(400)
    expect(heroBox?.width).toBeGreaterThan(800)
    
    console.log(`✅ Hero section dimensions: ${heroBox?.width}x${heroBox?.height}`)
  })
})