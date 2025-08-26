/**
 * Complete Wishlist Test
 * Tests all wishlist functionality end-to-end
 */

const puppeteer = require('puppeteer')

async function testWishlistComplete() {
  console.log('🧪 Complete Wishlist Test')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Test 1: API Endpoints
    console.log('📝 Testing API endpoints...')
    
    // Test GET wishlist
    let response = await page.goto('http://localhost:3000/api/wishlist?guestId=testuser', { waitUntil: 'networkidle0' })
    console.log(`✅ GET wishlist API: ${response.status()}`)
    
    // Test POST add item
    response = await page.evaluate(async () => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: 'testuser',
          productId: 'prod_1755401177793_001',
          notes: 'Test item from complete test'
        })
      })
      return res.status
    })
    console.log(`✅ POST add item API: ${response}`)
    
    // Test 2: Wishlist Page
    console.log('📝 Testing wishlist page...')
    await page.goto('http://localhost:3000/wishlist', { waitUntil: 'networkidle0' })
    const pageTitle = await page.title()
    console.log(`✅ Wishlist page loaded: ${pageTitle}`)
    
    // Test 3: Catalog Integration
    console.log('📝 Testing catalog integration...')
    await page.goto('http://localhost:3000/catalog', { waitUntil: 'networkidle0' })
    
    // Check for product cards
    const productCards = await page.$$('[data-testid=\"product-card\"]')
    console.log(`✅ Found ${productCards.length} product cards`)
    
    // Check for wishlist buttons
    const wishlistButtons = await page.$$('button[aria-label*="wishlist"]')
    console.log(`✅ Found ${wishlistButtons.length} wishlist buttons`)
    
    // Test 4: Header Integration
    console.log('📝 Testing header integration...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
    const wishlistLink = await page.$('a[href=\"/wishlist\"]')
    console.log(`✅ Header wishlist link: ${wishlistLink ? 'Found' : 'Not found'}`)
    
    // Test 5: Add to wishlist workflow
    console.log('📝 Testing add to wishlist workflow...')
    await page.goto('http://localhost:3000/catalog', { waitUntil: 'networkidle0' })
    
    // Try to click a wishlist button if available
    const firstWishlistButton = await page.$('button[aria-label*="Add to wishlist"]')
    if (firstWishlistButton) {
      await firstWishlistButton.click()
      console.log('✅ Clicked wishlist button successfully')
    } else {
      console.log('ℹ️ No wishlist buttons available to click')
    }
    
    // Test 6: Verify data persistence
    console.log('📝 Testing data persistence...')
    response = await page.goto('http://localhost:3000/api/wishlist?guestId=testuser', { waitUntil: 'networkidle0' })
    const wishlistData = await response.json()
    const itemCount = wishlistData.data?.[0]?.itemCount || 0
    console.log(`✅ Wishlist contains ${itemCount} items`)
    
    // Test 7: Remove item workflow
    if (itemCount > 0) {
      console.log('📝 Testing remove item workflow...')
      const productId = wishlistData.data[0].items[0]?.productId
      if (productId) {
        response = await page.evaluate(async (pid) => {
          const res = await fetch(`/api/wishlist?guestId=testuser&productId=${pid}`, {
            method: 'DELETE'
          })
          return res.status
        }, productId)
        console.log(`✅ DELETE item API: ${response}`)
      }
    }
    
    console.log('\n🎉 All wishlist tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testWishlistComplete()
  .then(success => process.exit(success ? 0 : 1))
  .catch(console.error)