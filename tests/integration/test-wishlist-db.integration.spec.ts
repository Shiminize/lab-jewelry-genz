/**
 * Test Wishlist Database Connection
 * Direct MongoDB testing to debug connection issues
 */

const mongoose = require('mongoose')

async function testWishlistDB() {
  console.log('🧪 Testing Wishlist Database Connection')
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/genZJewelry'
    console.log('📝 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
    
    // Check if wishlists collection exists
    const collections = await mongoose.connection.db.listCollections().toArray()
    const wishlistCollection = collections.find(c => c.name === 'wishlists')
    console.log(`📝 Wishlists collection exists: ${wishlistCollection ? 'Yes' : 'No'}`)
    
    // Create a simple schema for testing
    const testWishlistSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      name: { type: String, default: 'My Wishlist' },
      items: { type: Array, default: [] },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    })
    
    const TestWishlist = mongoose.models.TestWishlist || mongoose.model('TestWishlist', testWishlistSchema)
    
    // Test creating a wishlist
    console.log('📝 Testing wishlist creation...')
    const testWishlist = new TestWishlist({
      userId: 'guest_test123',
      name: 'Test Wishlist'
    })
    
    await testWishlist.save()
    console.log('✅ Test wishlist created successfully')
    
    // Test finding the wishlist
    console.log('📝 Testing wishlist query...')
    const foundWishlist = await TestWishlist.findOne({ userId: 'guest_test123' })
    console.log(`✅ Found wishlist: ${foundWishlist ? foundWishlist.name : 'None'}`)
    
    // Clean up
    await TestWishlist.deleteOne({ userId: 'guest_test123' })
    console.log('✅ Cleaned up test data')
    
    console.log('\n🎉 Wishlist database test successful!')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  } finally {
    await mongoose.connection.close()
  }
}

testWishlistDB()
  .then(success => process.exit(success ? 0 : 1))
  .catch(console.error)