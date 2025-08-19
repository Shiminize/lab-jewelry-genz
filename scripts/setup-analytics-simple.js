/**
 * Simple Analytics Database Setup
 * Creates collections and seeds basic data for Phase 2 testing
 */

const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev'

async function setupAnalytics() {
  console.log('🔧 Setting up Analytics Collections...')
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    console.log('✅ Connected to MongoDB')
    
    // Collections to create
    const collections = [
      'analyticsEvents',
      'performanceMetrics', 
      'businessMetrics',
      'userJourneys',
      'conversionFunnel'
    ]
    
    // Create collections if they don't exist
    for (const collName of collections) {
      try {
        await db.createCollection(collName)
        console.log(`✅ Created ${collName}`)
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`ℹ️ ${collName} already exists`)
        } else {
          throw error
        }
      }
    }
    
    // Seed sample data
    console.log('\n🌱 Seeding sample data...')
    
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // Clear existing test data
    await db.collection('analyticsEvents').deleteMany({ sessionId: { $regex: /^test_/ } })
    await db.collection('performanceMetrics').deleteMany({ endpoint: { $regex: /^\/api\/test/ } })
    
    // Sample analytics events
    const events = [
      {
        event: 'page_view',
        sessionId: 'test_session_001',
        timestamp: yesterday,
        properties: { page: '/catalog' },
        metadata: {
          userAgent: 'Test Browser',
          ip: '127.0.0.1',
          page: '/catalog',
          device: 'desktop'
        }
      },
      {
        event: 'product_view',
        sessionId: 'test_session_001', 
        timestamp: yesterday,
        properties: { productId: 'test_product_1', category: 'rings' },
        metadata: {
          userAgent: 'Test Browser',
          ip: '127.0.0.1',
          page: '/products/test_product_1',
          device: 'desktop'
        }
      },
      {
        event: 'search_query',
        sessionId: 'test_session_002',
        timestamp: now,
        properties: { query: 'diamond rings', resultsCount: 15 },
        metadata: {
          userAgent: 'Mobile Browser',
          ip: '127.0.0.1',
          page: '/search',
          device: 'mobile'
        }
      }
    ]
    
    await db.collection('analyticsEvents').insertMany(events)
    console.log(`✅ Inserted ${events.length} analytics events`)
    
    // Sample performance metrics
    const metrics = [
      {
        apiResponseTime: 150,
        databaseQueryTime: 50,
        errorRate: 0,
        endpoint: '/api/products',
        timestamp: yesterday
      },
      {
        apiResponseTime: 200,
        databaseQueryTime: 75,
        errorRate: 0,
        endpoint: '/api/search',
        timestamp: now
      }
    ]
    
    await db.collection('performanceMetrics').insertMany(metrics)
    console.log(`✅ Inserted ${metrics.length} performance metrics`)
    
    // Sample business metrics  
    const business = [
      {
        date: yesterday,
        revenue: 1250.50,
        orders: 5,
        newUsers: 12,
        conversionRate: 0.035,
        averageOrderValue: 250.10
      }
    ]
    
    await db.collection('businessMetrics').insertMany(business)
    console.log(`✅ Inserted ${business.length} business metrics`)
    
    // Verify data
    console.log('\n🔍 Verification:')
    for (const collName of collections) {
      const count = await db.collection(collName).countDocuments()
      console.log(`📊 ${collName}: ${count} documents`)
    }
    
    console.log('\n🎉 Analytics setup completed!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupAnalytics()