/**
 * Create Test Customizable Product for Phase 3 Validation
 * Creates a MongoDB-compatible product with proper ObjectId and customization options
 */

const { connectToDatabase } = require('./src/lib/mongoose.ts')
const { ProductModel } = require('./src/lib/schemas/product.schema.ts')

async function createTestProduct() {
  try {
    console.log('🔗 Connecting to database...')
    await connectToDatabase()
    
    console.log('🧪 Creating test customizable product...')
    
    const testProduct = {
      // Basic Information
      name: "Phase 3 Test Ring",
      description: "Test ring for database integration validation with full customization support",
      shortDescription: "Database test ring with materials",
      type: "ring",
      status: "active",
      
      // Pricing
      basePrice: 1500,
      cost: 800,
      currency: "USD",
      taxable: true,
      
      // Physical Properties
      dimensions: {
        length: 20,
        width: 20,
        height: 8,
        weight: 5.5,
        unit: "mm",
        weightUnit: "g"
      },
      materials: ["gold", "silver", "platinum"],
      gemstones: [{
        type: "diamond",
        carat: 1.0,
        cut: "round",
        clarity: "VS1",
        color: "G",
        certification: "GIA"
      }],
      
      // 3D Assets and Media
      assets3D: [{
        modelUrl: "/models/test-ring.glb",
        textureUrls: ["/textures/gold.jpg", "/textures/silver.jpg"],
        thumbnailUrl: "/images/test-ring-thumb.jpg",
        fileSize: 1024000,
        format: "glb",
        complexity: "medium",
        isOptimized: true
      }],
      images: [{
        url: "/images/test-ring.jpg",
        alt: "Test Ring",
        isPrimary: true,
        order: 0,
        isOptimized: false
      }],
      
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
        }, {
          value: "18k-rose-gold",
          label: "18K Rose Gold",
          description: "Modern romance",
          priceModifier: -50,
          isDefault: false,
          isAvailable: true,
          hexColor: "#E8B4CB",
          materialType: "gold"
        }],
        required: true,
        maxSelections: 1,
        description: "Choose your preferred metal for the ring setting"
      }],
      baseConfiguration: {
        material: "18k-white-gold"
      },
      minPrice: 1400,
      maxPrice: 1700,
      
      // Inventory Management
      inventory: [{
        sku: `TEST-RING-${Date.now()}`,
        variant: { material: "18k-white-gold" },
        quantity: 100,
        reserved: 0,
        price: 1500,
        cost: 800,
        isTracked: true,
        lowStockThreshold: 5,
        reorderPoint: 10,
        reorderQuantity: 50
      }],
      trackInventory: true,
      allowBackorders: false,
      requiresShipping: true,
      
      // SEO and Metadata
      seo: {
        keywords: ["test", "ring", "database", "phase3", "customizable"],
        slug: `phase3-test-ring-${Date.now()}`,
        metaTitle: "Phase 3 Test Ring - Database Integration",
        metaDescription: "Test product for Phase 3 database integration validation"
      },
      
      // Analytics
      analytics: {
        views: 0,
        uniqueViews: 0,
        addToCarts: 0,
        purchases: 0,
        conversionRate: 0,
        averageRating: 0,
        totalReviews: 0,
        wishlistAdds: 0,
        trending: false,
        trendingScore: 0
      },
      
      // Creator Program
      isCreatorExclusive: false,
      creatorOnlyTiers: [],
      creatorBenefits: [],
      
      // Relationships
      relatedProducts: [],
      bundleProducts: [],
      
      // Compliance and Quality
      certifications: [],
      qualityGrade: "premium",
      careInstructions: ["Store in a dry place", "Clean with soft cloth", "Avoid harsh chemicals"],
      
      // Availability
      isLimitedEdition: false,
      
      // User-generated content
      featuredReviews: [],
      userPhotos: []
    }
    
    const product = new ProductModel(testProduct)
    await product.save()
    
    console.log('✅ Test product created successfully!')
    console.log(`   Product ID: ${product._id}`)
    console.log(`   Name: ${product.name}`)
    console.log(`   Customizable: ${product.isCustomizable}`)
    console.log(`   Material Options: ${product.customizationOptions[0].options.length}`)
    
    return product._id.toString()
    
  } catch (error) {
    console.error('❌ Failed to create test product:', error.message)
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach(field => {
        console.error(`   ${field}: ${error.errors[field].message}`)
      })
    }
    throw error
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