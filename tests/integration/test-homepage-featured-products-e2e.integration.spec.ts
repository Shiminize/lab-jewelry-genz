/**
 * Homepage Featured Products Integration E2E Test
 * Validates complete workflow: Database → API → Homepage → Catalog
 * Following CLAUDE_RULES.md material-only compliance and performance targets
 */

const { test, expect } = require('@playwright/test')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Homepage Featured Products Integration', () => {
  test('should display real featured products from database on homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto(BASE_URL)
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Check that FeaturedProductsSection is present
    const featuredSection = page.locator('[data-testid="featured-products-section"], .featured-products, h2:has-text("Discover Your Perfect Piece")').first()
    await expect(featuredSection).toBeVisible()
    
    // Verify real product names from database are displayed (not mock data)
    const realProductNames = [
      'Eternal Promise Solitaire',
      'Moissanite Tennis Bracelet', 
      'Sustainable Tennis Necklace',
      'Chandelier Celebration Earrings',
      'Conscious Tennis Bracelet'
    ]
    
    // Check that at least 3 real products are displayed
    let foundProducts = 0
    for (const productName of realProductNames) {
      const productElement = page.locator(`text="${productName}"`).first()
      if (await productElement.isVisible()) {
        foundProducts++
        console.log(`✓ Found real product: ${productName}`)
      }
    }
    
    expect(foundProducts).toBeGreaterThanOrEqual(3)
    console.log(`✓ Found ${foundProducts} real products on homepage`)
  })

  test('should have featured products API endpoint with <300ms response time', async ({ page }) => {
    const startTime = Date.now()
    
    // Test the API endpoint directly
    const response = await page.request.get(`${BASE_URL}/api/featured-products?limit=6`)
    const responseTime = Date.now() - startTime
    
    expect(response.status()).toBe(200)
    expect(responseTime).toBeLessThan(300) // CLAUDE_RULES performance requirement
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBeGreaterThan(0)
    expect(data.data.length).toBeLessThanOrEqual(6)
    
    // Verify CLAUDE_RULES envelope format
    expect(data).toHaveProperty('meta')
    expect(data.meta).toHaveProperty('timestamp')
    expect(data.meta).toHaveProperty('responseTime')
    expect(data.meta).toHaveProperty('materialFilteringCompliant', true)
    
    console.log(`✓ API response time: ${responseTime}ms (target: <300ms)`)
    console.log(`✓ Returned ${data.data.length} featured products`)
  })

  test('should have material-only compliance in featured products', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/featured-products`)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    
    // Verify material compliance metadata
    expect(data.meta.materialFilteringCompliant).toBe(true)
    expect(data.meta.materialCompliance).toHaveProperty('exclusions')
    expect(data.meta.materialCompliance.exclusions).toContain('natural-diamonds')
    expect(data.meta.materialCompliance.exclusions).toContain('mined-gems')
    
    // Check each product has compliant materials
    for (const product of data.data) {
      expect(product.materialSpecs).toBeDefined()
      expect(product.materialSpecs.primaryMetal).toBeDefined()
      
      const metalType = product.materialSpecs.primaryMetal.type
      expect(['silver', '14k-gold', '18k-gold', 'platinum']).toContain(metalType)
      
      // If stone is present, verify it's lab-grown
      if (product.materialSpecs.primaryStone) {
        const stoneType = product.materialSpecs.primaryStone.type
        expect(['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']).toContain(stoneType)
      }
      
      console.log(`✓ Product "${product.name}" has compliant materials`)
    }
  })

  test('should support navigation from homepage to catalog', async ({ page }) => {
    // Start on homepage
    await page.goto(BASE_URL)
    
    // Find and click "Explore Collection" button in featured products section
    const exploreButton = page.locator('a[href="/catalog"]:has-text("Explore Collection")')
    await expect(exploreButton).toBeVisible()
    await exploreButton.click()
    
    // Wait for catalog page to load
    await page.waitForURL(`${BASE_URL}/catalog`)
    await page.waitForLoadState('networkidle')
    
    // Verify we're on catalog page and it has products
    expect(page.url()).toContain('/catalog')
    
    // Check that products are displayed on catalog
    const productCards = page.locator('[data-testid="product-card"], .product-card, [class*="product"]')
    await expect(productCards.first()).toBeVisible()
    
    const productCount = await productCards.count()
    expect(productCount).toBeGreaterThan(0)
    
    console.log(`✓ Successfully navigated to catalog with ${productCount} products`)
  })

  test('should have consistent product data between homepage and catalog', async ({ page }) => {
    // Get featured products from API
    const featuredResponse = await page.request.get(`${BASE_URL}/api/featured-products`)
    const featuredData = await featuredResponse.json()
    const featuredProductIds = featuredData.data.map(p => p._id)
    
    // Get all products from catalog API
    const catalogResponse = await page.request.get(`${BASE_URL}/api/products?limit=50`)
    const catalogData = await catalogResponse.json()
    
    // Verify featured products exist in catalog
    let matchedProducts = 0
    for (const featuredId of featuredProductIds) {
      const catalogProduct = catalogData.data.find(p => p._id === featuredId)
      if (catalogProduct) {
        matchedProducts++
        console.log(`✓ Featured product ${featuredId} found in catalog`)
      }
    }
    
    expect(matchedProducts).toBeGreaterThan(0)
    console.log(`✓ ${matchedProducts}/${featuredProductIds.length} featured products found in catalog`)
  })

  test('should load homepage with real data in under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // CLAUDE_RULES <3s page load requirement
    
    // Verify content is actually loaded (not just DOM ready)
    const featuredProducts = page.locator('text="Eternal Promise Solitaire"')
    await expect(featuredProducts.first()).toBeVisible()
    
    console.log(`✓ Homepage loaded with real data in ${loadTime}ms (target: <3000ms)`)
  })
})

// Run the test
if (require.main === module) {
  console.log('🧪 Running Homepage Featured Products Integration E2E Test...')
  console.log('📍 Testing complete database → API → homepage → catalog workflow')
  console.log('🎯 Validating CLAUDE_RULES compliance and performance targets')
}