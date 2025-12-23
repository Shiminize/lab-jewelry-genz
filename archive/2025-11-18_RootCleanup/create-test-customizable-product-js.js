/**
 * Create Test Customizable Product for Phase 4 Validation
 * JavaScript version for direct Node execution
 */

const mongoose = require('mongoose')

// Connect to MongoDB
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables')
  }
  
  if (mongoose.connection.readyState >= 1) return
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genZJewelry', {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000
  })
}

// Define product schema directly
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  shortDescription: String,
  type: String,
  status: { type: String, default: 'active' },
  basePrice: { type: Number, required: true },
  cost: Number,
  currency: { type: String, default: 'USD' },
  taxable: { type: Boolean, default: true },
  isCustomizable: { type: Boolean, default: false },
  customizationOptions: [{
    name: String,
    type: String,
    options: [{
      value: String,
      label: String,
      description: String,
      priceModifier: { type: Number, default: 0 },
      isDefault: { type: Boolean, default: false },
      isAvailable: { type: Boolean, default: true },
      hexColor: String,
      materialType: String
    }],
    required: { type: Boolean, default: false },
    maxSelections: { type: Number, default: 1 },
    description: String
  }],
  inventory: [{
    sku: String,
    variant: mongoose.Schema.Types.Mixed,
    quantity: { type: Number, default: 0 },
    price: Number,
    isTracked: { type: Boolean, default: true }
  }],
  seo: {
    slug: { type: String, unique: true },
    keywords: [String],
    metaTitle: String,
    metaDescription: String
  },
  analytics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

async function createTestProduct() {
  try {
    console.log('🔗 Connecting to database...')
    await connectToDatabase()
    
    console.log('🧪 Creating test customizable product...')
    
    const timestamp = Date.now()
    const testProduct = {
      name: "Phase 4 Test Ring",
      description: "Test ring for Phase 4 migration validation with full customization support",
      shortDescription: "Phase 4 test ring with materials",
      type: "ring", 
      status: "active",
      
      // Pricing
      basePrice: 1500,
      cost: 800,
      currency: "USD",
      taxable: true,
      
      // Customization - THIS IS THE IMPORTANT PART
      isCustomizable: true,
      customizationOptions: [{
        name: "Material",
        type: "material",
        options: [{
          value: "18k-white-gold",
          label: "18K White Gold",
          description: "Classic elegance",
          priceModifier: 0,
          isDefault: true,
          isAvailable: true,
          hexColor: "#F5F5DC",
          materialType: "gold"
        }, {
          value: "18k-yellow-gold",
          label: "18K Yellow Gold",
          description: "Timeless warmth",
          priceModifier: -100,
          isDefault: false,
          isAvailable: true,
          hexColor: "#FFD700", 
          materialType: "gold"
        }, {
          value: "platinum",
          label: "Platinum",
          description: "Premium white metal",
          priceModifier: 200,
          isDefault: false,
          isAvailable: true,
          hexColor: "#E5E4E2",
          materialType: "platinum"
        }],
        required: true,
        maxSelections: 1,
        description: "Choose your preferred metal for the ring setting"
      }],
      
      // Inventory
      inventory: [{
        sku: `PHASE4-TEST-${timestamp}`,
        variant: { material: "18k-white-gold" },
        quantity: 100,
        price: 1500,
        isTracked: true
      }],
      
      // SEO
      seo: {
        slug: `phase4-test-ring-${timestamp}`,
        keywords: ["test", "ring", "phase4", "customizable"],
        metaTitle: "Phase 4 Test Ring - Migration Validation",
        metaDescription: "Test product for Phase 4 migration validation"
      },
      
      // Analytics
      analytics: {
        views: 0,
        uniqueViews: 0,
        addToCarts: 0,
        purchases: 0
      }
    }
    
    const product = new Product(testProduct)
    await product.save()
    
    console.log('✅ Test product created successfully!')
    console.log(`   Product ID: ${product._id}`)
    console.log(`   Name: ${product.name}`)
    console.log(`   Customizable: ${product.isCustomizable}`)
    console.log(`   Material Options: ${product.customizationOptions[0].options.length}`)
    
    return product._id.toString()
    
  } catch (error) {
    console.error('❌ Failed to create test product:', error.message)
    throw error
  } finally {
    await mongoose.connection.close()
  }
}

if (require.main === module) {
  createTestProduct()
    .then(productId => {
      console.log(`\n🎯 Use this Product ID for testing: ${productId}`)
      process.exit(0)
    })
    .catch(error => {
      console.error('Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = createTestProduct