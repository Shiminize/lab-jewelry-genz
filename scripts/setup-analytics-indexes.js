/**
 * Setup Analytics Database Indexes
 * Creates all necessary indexes for analytics collections
 */

const { MongoClient } = require('mongodb')

const DATABASE_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev'

async function setupAnalyticsIndexes() {
  console.log('🔧 Setting up Analytics Database Indexes...')
  console.log(`📍 Database: ${DATABASE_URL}`)
  
  const client = new MongoClient(DATABASE_URL)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db()
    
    // Analytics Events Indexes
    console.log('\n📊 Setting up Analytics Events indexes...')
    const analyticsEvents = db.collection('analyticsEvents')
    
    await analyticsEvents.createIndex({ timestamp: -1, event: 1 })
    console.log('✅ Created index: timestamp + event')
    
    await analyticsEvents.createIndex({ sessionId: 1, timestamp: 1 })
    console.log('✅ Created index: sessionId + timestamp')
    
    await analyticsEvents.createIndex({ userId: 1, timestamp: -1 })
    console.log('✅ Created index: userId + timestamp')
    
    // TTL index for data retention (90 days)
    await analyticsEvents.createIndex({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: timestamp (90 days retention)')
    
    // Performance Metrics Indexes
    console.log('\n⚡ Setting up Performance Metrics indexes...')
    const performanceMetrics = db.collection('performanceMetrics')
    
    await performanceMetrics.createIndex({ timestamp: -1, endpoint: 1 })
    console.log('✅ Created index: timestamp + endpoint')
    
    await performanceMetrics.createIndex({ endpoint: 1, timestamp: -1 })
    console.log('✅ Created index: endpoint + timestamp')
    
    // TTL index for performance data (90 days)
    await performanceMetrics.createIndex({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: timestamp (90 days retention)')
    
    // Business Metrics Indexes
    console.log('\n💰 Setting up Business Metrics indexes...')
    const businessMetrics = db.collection('businessMetrics')
    
    await businessMetrics.createIndex({ date: -1 })
    console.log('✅ Created index: date')
    
    // TTL index for business metrics (2 years)
    await businessMetrics.createIndex({ date: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: date (2 years retention)')
    
    // Database Query Metrics Indexes
    console.log('\n🗄️ Setting up Database Query Metrics indexes...')
    const databaseQueryMetrics = db.collection('databaseQueryMetrics')
    
    await databaseQueryMetrics.createIndex({ timestamp: -1, collection: 1 })
    console.log('✅ Created index: timestamp + collection')
    
    await databaseQueryMetrics.createIndex({ collection: 1, duration: -1 })
    console.log('✅ Created index: collection + duration')
    
    // TTL index for query metrics (30 days)
    await databaseQueryMetrics.createIndex({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: timestamp (30 days retention)')
    
    // User Journey Indexes
    console.log('\n👤 Setting up User Journey indexes...')
    const userJourneys = db.collection('userJourneys')
    
    await userJourneys.createIndex({ startTime: -1, sessionId: 1 })
    console.log('✅ Created index: startTime + sessionId')
    
    await userJourneys.createIndex({ userId: 1, startTime: -1 })
    console.log('✅ Created index: userId + startTime')
    
    await userJourneys.createIndex({ creatorReferral: 1, startTime: -1 })
    console.log('✅ Created index: creatorReferral + startTime')
    
    // TTL index for user journeys (90 days)
    await userJourneys.createIndex({ startTime: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: startTime (90 days retention)')
    
    // Conversion Funnel Indexes
    console.log('\n🎯 Setting up Conversion Funnel indexes...')
    const conversionFunnel = db.collection('conversionFunnel')
    
    await conversionFunnel.createIndex({ timestamp: -1, step: 1 })
    console.log('✅ Created index: timestamp + step')
    
    await conversionFunnel.createIndex({ sessionId: 1, timestamp: 1 })
    console.log('✅ Created index: sessionId + timestamp')
    
    // TTL index for conversion funnel (90 days)
    await conversionFunnel.createIndex({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
    console.log('✅ Created TTL index: timestamp (90 days retention)')
    
    // Verify all indexes
    console.log('\n🔍 Verifying indexes...')
    const collections = [
      'analyticsEvents',
      'performanceMetrics', 
      'businessMetrics',
      'databaseQueryMetrics',
      'userJourneys',
      'conversionFunnel'
    ]
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      const indexes = await collection.indexes()
      console.log(`📋 ${collectionName}: ${indexes.length} indexes configured`)
      
      // Check for TTL indexes
      const ttlIndexes = indexes.filter(idx => idx.expireAfterSeconds !== undefined)
      console.log(`   ⏰ TTL indexes: ${ttlIndexes.length}`)
    }
    
    console.log('\n🎉 Analytics database indexes setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('📫 Database connection closed')
  }
}

if (require.main === module) {
  setupAnalyticsIndexes()
}

module.exports = { setupAnalyticsIndexes }