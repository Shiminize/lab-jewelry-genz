/**
 * Create Test Customizable Product - Phase 2 E2E Testing Support
 * Creates a database-stored customizable product for bridge service testing
 */

import mongoose from 'mongoose'
import { CustomizableProduct } from '../src/lib/schemas/customizable-product.schema.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genZJewelry'

async function createTestCustomizableProduct() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Create a test customizable product
    const testProduct = {
      name: 'Test Scalable Ring',
      description: 'A test ring for Phase 2 E2E testing of the scalable customization system',
      shortDescription: 'Test ring for bridge service validation',
      category: 'B',
      jewelryType: 'rings',
      baseModel: 'test-scalable-ring-001',
      
      // 3D Model configuration
      baseModel3D: {
        modelId: 'test-scalable-ring-001-3d',
        glbUrl: '/models/test-ring.glb',
        textureSlots: {
          material: ['band', 'prongs'],
          gemstone: ['center_stone']
        },
        boundingBox: {
          width: 20,
          height: 8,
          depth: 20
        }
      },
      
      // Asset paths for 3D sequences
      assetPaths: {
        sequencePath: '/customizable/rings/test-scalable-ring-001/',
        materialVariants: [
          {
            materialId: 'lab-grown-diamond',
            sequencePath: '/customizable/rings/test-scalable-ring-001/lab-grown-diamond/',
            frameCount: 36,
            previewFrames: [0, 9, 18, 27],
            renderingProperties: {
              metalness: 0.0,
              roughness: 0.0,
              reflectivity: 0.95,
              color: '#ffffff'
            }
          },
          {
            materialId: 'moissanite',
            sequencePath: '/customizable/rings/test-scalable-ring-001/moissanite/',
            frameCount: 36,
            previewFrames: [0, 9, 18, 27],
            renderingProperties: {
              metalness: 0.0,
              roughness: 0.1,
              reflectivity: 0.92,
              color: '#f8f8ff'
            }
          }
        ]
      },
      
      // CLAUDE_RULES compliant material constraints
      allowedMaterials: {
        labGrownDiamonds: true,
        moissanite: true,
        labGems: true,
        traditionalGems: false // FORBIDDEN per CLAUDE_RULES
      },
      
      // Performance optimized rendering config
      renderingConfig: {
        lowQualityPath: '/customizable/rings/test-scalable-ring-001/low/',
        mediumQualityPath: '/customizable/rings/test-scalable-ring-001/medium/',
        highQualityPath: '/customizable/rings/test-scalable-ring-001/high/',
        preloadFrames: 4,
        cacheStrategy: 'standard',
        compressionLevel: 7
      },
      
      // Customization options
      customizationOptions: {
        materials: ['lab-grown-diamond', 'moissanite', 'lab-ruby', 'lab-emerald'],
        gemstones: ['lab-grown-diamond', 'moissanite'],
        sizes: ['size-5', 'size-6', 'size-7', 'size-8', 'size-9'],
        engravingEnabled: true,
        specialFeatures: ['comfort-fit', 'hypoallergenic']
      },
      
      // Pricing rules
      pricingRules: {
        basePrice: 500,
        materialModifiers: new Map([
          ['lab-grown-diamond', 200],
          ['moissanite', 100],
          ['lab-ruby', 150],
          ['lab-emerald', 175]
        ]),
        gemstoneModifiers: new Map([
          ['lab-grown-diamond', 300],
          ['moissanite', 150]
        ]),
        sizeModifiers: new Map([
          ['size-5', 0],
          ['size-6', 0],
          ['size-7', 0],
          ['size-8', 0],
          ['size-9', 25]
        ]),
        engravingCost: 50
      },
      
      // SEO configuration
      seo: {
        slug: 'test-scalable-ring-001',
        metaTitle: 'Test Scalable Ring - Customizable Jewelry',
        metaDescription: 'Test customizable ring for Phase 2 E2E validation',
        keywords: ['test', 'customizable', 'ring', 'lab-grown', 'scalable']
      },
      
      // Status
      status: 'active',
      featured: false,
      sortOrder: 999,
      
      // Analytics (empty for test)
      analytics: {
        views: 0,
        customizations: 0,
        conversions: 0,
        averageCustomizationTime: 0
      }
    }

    // Check if product already exists
    const existing = await CustomizableProduct.findOne({ 'seo.slug': 'test-scalable-ring-001' })
    
    if (existing) {
      console.log('🔄 Test product already exists, updating...')
      await CustomizableProduct.findByIdAndUpdate(existing._id, testProduct)
      console.log('✅ Test product updated:', existing._id)
    } else {
      console.log('🆕 Creating new test product...')
      const created = await CustomizableProduct.create(testProduct)
      console.log('✅ Test product created:', created._id)
    }
    
    console.log('\n📋 Test Product Details:')
    console.log('   ID: test-scalable-ring-001')
    console.log('   Category: B (Customizable)')
    console.log('   Materials: lab-grown-diamond, moissanite, lab-ruby, lab-emerald')
    console.log('   Assets API: POST /api/products/customizable/test-scalable-ring-001/assets')
    console.log('\n🎯 Ready for Phase 2 E2E testing!')

  } catch (error) {
    console.error('❌ Failed to create test product:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createTestCustomizableProduct()