/**
 * Analytics Database Setup Script
 * Creates MongoDB collections and indexes for Phase 2 analytics
 * Run with: node scripts/setup-analytics-db.js
 */

const { MongoClient } = require('mongodb')

// Connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev'

async function setupAnalyticsDatabase() {
  console.log('🔧 Setting up Analytics Database...')
  console.log(`📍 Connecting to: ${MONGODB_URI}`)
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    console.log('✅ Connected to MongoDB')
    
    // 1. Create Analytics Events Collection
    console.log('\n📊 Creating analyticsEvents collection...')
    try {
      await db.createCollection('analyticsEvents')
      console.log('✅ analyticsEvents collection created')
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️ analyticsEvents collection already exists')
      } else {
        throw error
      }
    }
    
    // Create indexes for analyticsEvents (create them individually to handle conflicts)
    const analyticsIndexes = [
      { key: { timestamp: 1 }, name: 'timestamp_1' },
      { key: { event: 1 }, name: 'event_1' },
      { key: { sessionId: 1 }, name: 'sessionId_1' },
      { key: { userId: 1 }, name: 'userId_1', sparse: true },
      { key: { 'metadata.device': 1 }, name: 'device_1' },
      { key: { 'metadata.page': 1 }, name: 'page_1' }
    ]
    
    for (const index of analyticsIndexes) {
      try {
        await db.collection('analyticsEvents').createIndex(index.key, { name: index.name, sparse: index.sparse })
      } catch (error) {
        if (error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
          console.log(`ℹ️ Index ${index.name} already exists with different options`)
        } else {
          throw error
        }
      }
    }
    
    // Create TTL index separately
    try {
      await db.collection('analyticsEvents').createIndex(
        { timestamp: 1 }, 
        { name: 'events_ttl', expireAfterSeconds: 7776000 }
      )
    } catch (error) {
      if (error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
        console.log('ℹ️ TTL index already exists')
      } else {
        throw error
      }
    }
    console.log('✅ analyticsEvents indexes created')
    
    // 2. Create Performance Metrics Collection
    console.log('\n⚡ Creating performanceMetrics collection...')
    try {
      await db.createCollection('performanceMetrics')
      console.log('✅ performanceMetrics collection created')
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️ performanceMetrics collection already exists')
      } else {
        throw error
      }
    }
    
    // Create indexes for performanceMetrics
    const performanceIndexes = [
      { key: { timestamp: 1 }, name: 'perf_timestamp_1' },
      { key: { endpoint: 1 }, name: 'endpoint_1' },
      { key: { apiResponseTime: 1 }, name: 'apiResponseTime_1' },
      { key: { errorRate: 1 }, name: 'errorRate_1' }
    ]
    
    for (const index of performanceIndexes) {
      try {
        await db.collection('performanceMetrics').createIndex(index.key, { name: index.name })
      } catch (error) {
        if (error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
          console.log(`ℹ️ Index ${index.name} already exists`)
        } else {
          throw error
        }
      }
    }
    
    // TTL index for performance metrics
    try {
      await db.collection('performanceMetrics').createIndex(
        { timestamp: 1 }, 
        { name: 'perf_ttl', expireAfterSeconds: 2592000 }
      )
    } catch (error) {
      if (error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
        console.log('ℹ️ Performance TTL index already exists')
      } else {
        throw error
      }
    }
    console.log('✅ performanceMetrics indexes created')
    
    // 3. Create Business Metrics Collection
    console.log('\n💰 Creating businessMetrics collection...')
    try {
      await db.createCollection('businessMetrics')
      console.log('✅ businessMetrics collection created')
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️ businessMetrics collection already exists')
      } else {
        throw error
      }
    }
    
    // Create indexes for businessMetrics
    await db.collection('businessMetrics').createIndexes([
      { key: { date: 1 }, name: 'date_1', unique: true },
      { key: { revenue: 1 }, name: 'revenue_1' },
      { key: { orders: 1 }, name: 'orders_1' },
      { key: { conversionRate: 1 }, name: 'conversionRate_1' }
    ])
    console.log('✅ businessMetrics indexes created')
    
    // 4. Create User Journeys Collection
    console.log('\n🗺️ Creating userJourneys collection...')
    try {
      await db.createCollection('userJourneys')
      console.log('✅ userJourneys collection created')
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️ userJourneys collection already exists')
      } else {
        throw error
      }
    }
    
    // Create indexes for userJourneys
    await db.collection('userJourneys').createIndexes([
      { key: { sessionId: 1 }, name: 'sessionId_1', unique: true },
      { key: { userId: 1 }, name: 'userId_1', sparse: true },
      { key: { startTime: 1 }, name: 'startTime_1' },
      { key: { channel: 1 }, name: 'channel_1' },
      { key: { converted: 1 }, name: 'converted_1' },
      // TTL index - expire journeys after 180 days
      { key: { startTime: 1 }, name: 'ttl_180days', expireAfterSeconds: 15552000 }
    ])
    console.log('✅ userJourneys indexes created')
    
    // 5. Create Conversion Funnel Collection
    console.log('\n🎯 Creating conversionFunnel collection...')
    try {
      await db.createCollection('conversionFunnel')
      console.log('✅ conversionFunnel collection created')
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️ conversionFunnel collection already exists')
      } else {
        throw error
      }
    }
    
    // Create indexes for conversionFunnel
    await db.collection('conversionFunnel').createIndexes([
      { key: { sessionId: 1 }, name: 'sessionId_1' },
      { key: { step: 1 }, name: 'step_1' },
      { key: { timestamp: 1 }, name: 'timestamp_1' },
      { key: { channel: 1 }, name: 'channel_1' },
      // TTL index - expire funnel data after 90 days
      { key: { timestamp: 1 }, name: 'ttl_90days', expireAfterSeconds: 7776000 }
    ])
    console.log('✅ conversionFunnel indexes created')
    
    // 6. Seed some initial data for testing
    console.log('\n🌱 Seeding initial analytics data...')
    
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Sample analytics events
    const sampleEvents = [
      {
        event: 'page_view',
        sessionId: 'session_001',
        timestamp: yesterday,
        properties: { page: '/collections' },
        metadata: {
          userAgent: 'Test Browser',
          ip: '127.0.0.1',
          page: '/collections',
          device: 'desktop'
        }
      },
      {
        event: 'product_view',
        sessionId: 'session_001',
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
        sessionId: 'session_002',
        timestamp: lastWeek,
        properties: { query: 'diamond rings', resultsCount: 15 },
        metadata: {
          userAgent: 'Mobile Browser',
          ip: '127.0.0.1',
          page: '/search',
          device: 'mobile'
        }
      }
    ]
    
    await db.collection('analyticsEvents').insertMany(sampleEvents)
    console.log('✅ Sample analytics events inserted')
    
    // Sample performance metrics
    const sampleMetrics = [
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
        errorRate: 0.02,
        endpoint: '/api/search',
        timestamp: lastWeek
      }
    ]
    
    await db.collection('performanceMetrics').insertMany(sampleMetrics)
    console.log('✅ Sample performance metrics inserted')
    
    // Sample business metrics
    const sampleBusiness = [
      {
        date: yesterday,
        revenue: 1250.50,
        orders: 5,
        newUsers: 12,
        conversionRate: 0.035,
        averageOrderValue: 250.10
      },
      {
        date: lastWeek,
        revenue: 890.25,
        orders: 3,
        newUsers: 8,
        conversionRate: 0.028,
        averageOrderValue: 296.75
      }
    ]
    
    await db.collection('businessMetrics').insertMany(sampleBusiness)
    console.log('✅ Sample business metrics inserted')
    
    // Verify collections exist
    console.log('\n🔍 Verifying collections...')
    const collections = await db.listCollections().toArray()
    const analyticsCollections = [
      'analyticsEvents',
      'performanceMetrics', 
      'businessMetrics',
      'userJourneys',
      'conversionFunnel'
    ]
    
    let allCreated = true
    for (const collName of analyticsCollections) {
      const exists = collections.some(c => c.name === collName)
      if (exists) {
        const count = await db.collection(collName).countDocuments()
        console.log(`✅ ${collName}: ${count} documents`)
      } else {
        console.log(`❌ ${collName}: NOT FOUND`)
        allCreated = false
      }
    }
    
    if (allCreated) {
      console.log('\n🎉 Analytics database setup completed successfully!')
      console.log('🚀 Ready for Phase 2 E2E testing')
    } else {
      console.log('\n❌ Some collections were not created properly')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run setup if called directly
if (require.main === module) {
  setupAnalyticsDatabase()
}

module.exports = { setupAnalyticsDatabase }
