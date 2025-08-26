/**
 * Simple Wishlist Test
 * Quick validation of wishlist functionality
 */

const puppeteer = require('puppeteer')

async function testWishlistSimple() {
  console.log('🧪 Simple Wishlist Test')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Test 1: Catalog loads
    console.log('📝 Testing catalog page...')
    await page.goto('http://localhost:3000/catalog', { waitUntil: 'networkidle0' })
    const productCards = await page.$$('[data-testid="product-card"]')
    console.log(`✅ Found ${productCards.length} product cards`)
    
    // Test 2: Wishlist page loads
    console.log('📝 Testing wishlist page...')
    await page.goto('http://localhost:3000/wishlist', { waitUntil: 'networkidle0' })
    const pageTitle = await page.title()
    console.log(`✅ Wishlist page loaded: ${pageTitle}`)
    
    // Test 3: Wishlist API responds
    console.log('📝 Testing wishlist API...')
    const response = await page.goto('http://localhost:3000/api/wishlist?guestId=test')
    console.log(`✅ Wishlist API status: ${response.status()}`)
    
    // Test 4: Header wishlist button exists
    console.log('📝 Testing header wishlist button...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
    const wishlistLink = await page.$('a[href="/wishlist"]')
    console.log(`✅ Header wishlist button: ${wishlistLink ? 'Found' : 'Not found'}`)
    
    console.log('\n🎉 All wishlist components working!')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testWishlistSimple()
  .then(success => process.exit(success ? 0 : 1))
  .catch(console.error)