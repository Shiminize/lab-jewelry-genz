/**
 * Check Customizable Products in Database
 * Debug script to see what products exist in the CustomizableProduct collection
 */

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genZJewelry'

async function checkCustomizableProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('\n📋 Available Collections:')
    collections.forEach(col => console.log(`   - ${col.name}`))

    // Check if CustomizableProduct collection exists
    const customizableCol = collections.find(col => 
      col.name.toLowerCase().includes('customizable') || 
      col.name === 'CustomizableProduct' ||
      col.name === 'customizableproducts'
    )
    
    if (!customizableCol) {
      console.log('\n❌ No CustomizableProduct collection found')
      return
    }
    
    console.log(`\n🔍 Found CustomizableProduct collection: ${customizableCol.name}`)
    
    // Get the collection directly
    const collection = mongoose.connection.db.collection(customizableCol.name)
    const count = await collection.countDocuments()
    console.log(`   Document count: ${count}`)
    
    if (count > 0) {
      const products = await collection.find({}).limit(5).toArray()
      console.log('\n📦 Sample Products:')
      products.forEach(product => {
        console.log(`   - ID: ${product._id}`)
        console.log(`   - baseModel: ${product.baseModel || 'N/A'}`)
        console.log(`   - seo.slug: ${product.seo?.slug || 'N/A'}`)
        console.log(`   - category: ${product.category || 'N/A'}`)
        console.log(`   - status: ${product.status || 'N/A'}`)
        console.log('   ---')
      })
      
      // Check for our test product specifically
      const testProduct = await collection.findOne({
        $or: [
          { 'seo.slug': 'test-scalable-ring-001' },
          { baseModel: 'test-scalable-ring-001' },
          { _id: 'test-scalable-ring-001' }
        ]
      })
      
      if (testProduct) {
        console.log('\n🎯 Found test product:')
        console.log(`   - _id: ${testProduct._id}`)
        console.log(`   - baseModel: ${testProduct.baseModel}`)
        console.log(`   - seo.slug: ${testProduct.seo?.slug}`)
        console.log(`   - category: ${testProduct.category}`)
        console.log(`   - status: ${testProduct.status}`)
      } else {
        console.log('\n❌ Test product not found with any identifier')
      }
    }

  } catch (error) {
    console.error('❌ Failed to check products:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkCustomizableProducts()