#!/usr/bin/env node
/**
 * MongoDB Administration Toolkit
 * Comprehensive database monitoring, backup, and maintenance scripts
 * For GenZ Jewelry Platform Database Operations
 * 
 * Usage:
 *   node mongodb-admin-toolkit.js <command> [options]
 * 
 * Commands:
 *   monitor       - Run performance monitoring checks
 *   backup        - Create database backup with retention policy
 *   validate      - Validate index health and identify duplicates
 *   optimize      - Optimize database performance (indexes, stats)
 *   health        - Comprehensive health check report
 */

const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const config = {
  // Connection settings
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/genzjewelry',
  dbName: process.env.DB_NAME || 'genzjewelry',
  
  // Performance thresholds (CLAUDE_RULES compliance)
  performance: {
    maxResponseTime: 300,      // ms - API response time limit
    maxQueryTime: 100,         // ms - Database query time limit
    maxIndexSize: 100,         // MB - Alert if index size exceeds
    minIndexHitRatio: 95,      // % - Minimum index usage efficiency
    maxConnectionUtilization: 85, // % - Connection pool alert threshold
  },
  
  // Backup settings
  backup: {
    directory: '/backups/mongodb',
    retention: 30,             // days
    compression: true,
    parallel: true,
    collections: [             // Critical collections for backup
      'products', 'users', 'orders', 'creators',
      'analyticsEvents', 'auditLogs', 'cartItems'
    ]
  },
  
  // Alert settings
  alerts: {
    email: process.env.ADMIN_EMAIL || 'admin@genzjewelry.com',
    slack: process.env.SLACK_WEBHOOK,
    critical: {
      queryTimeout: 5000,      // ms - Critical alert threshold
      connectionFailure: true,  // Alert on connection failures
      replicationLag: 2000,    // ms - Replication lag alert
    }
  }
}

class MongoDBAdmin {
  constructor() {
    this.client = null
    this.db = null
    this.connected = false
  }

  // Connect to MongoDB
  async connect() {
    try {
      this.client = new MongoClient(config.mongoUri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      
      await this.client.connect()
      this.db = this.client.db(config.dbName)
      this.connected = true
      
      console.log('✅ Connected to MongoDB:', config.dbName)
      return true
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message)
      this.sendAlert('critical', 'Database Connection Failure', error.message)
      return false
    }
  }

  // Disconnect from MongoDB
  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.connected = false
      console.log('📴 Disconnected from MongoDB')
    }
  }

  // Performance Monitoring
  async performanceMonitoring() {
    console.log('\n🔍 Starting Performance Monitoring...')
    
    try {
      const results = {
        timestamp: new Date(),
        connectionPool: await this.checkConnectionPool(),
        queryPerformance: await this.checkQueryPerformance(),
        indexHealth: await this.checkIndexHealth(),
        replicationStatus: await this.checkReplicationStatus(),
        slowQueries: await this.getSlowQueries(),
        summary: {}
      }

      // Performance summary
      results.summary = {
        status: 'healthy',
        issues: [],
        recommendations: []
      }

      // Evaluate connection pool health
      if (results.connectionPool.utilizationPercent > config.performance.maxConnectionUtilization) {
        results.summary.issues.push(`High connection pool utilization: ${results.connectionPool.utilizationPercent}%`)
        results.summary.status = 'warning'
      }

      // Evaluate slow queries
      if (results.slowQueries.length > 0) {
        results.summary.issues.push(`${results.slowQueries.length} slow queries detected`)
        results.summary.recommendations.push('Review slow query patterns and optimize indexes')
      }

      // Log results
      this.logPerformanceResults(results)
      
      // Send alerts if critical issues found
      if (results.summary.status === 'critical') {
        this.sendAlert('critical', 'Database Performance Issues', results.summary.issues.join(', '))
      }

      return results

    } catch (error) {
      console.error('❌ Performance monitoring failed:', error.message)
      this.sendAlert('critical', 'Performance Monitoring Failure', error.message)
      throw error
    }
  }

  // Check Connection Pool Status
  async checkConnectionPool() {
    const admin = this.db.admin()
    const serverStatus = await admin.serverStatus()
    const connections = serverStatus.connections

    const poolUtilization = (connections.current / (connections.current + connections.available)) * 100

    const result = {
      current: connections.current,
      available: connections.available,
      totalCreated: connections.totalCreated,
      utilizationPercent: Math.round(poolUtilization * 100) / 100,
      status: poolUtilization > config.performance.maxConnectionUtilization ? 'warning' : 'healthy'
    }

    console.log('📊 Connection Pool:', result)
    return result
  }

  // Check Query Performance
  async checkQueryPerformance() {
    const collections = ['products', 'users', 'orders', 'analyticsEvents']
    const results = []

    for (const collectionName of collections) {
      try {
        const collection = this.db.collection(collectionName)
        
        // Test query performance
        const startTime = Date.now()
        await collection.findOne({})
        const duration = Date.now() - startTime

        results.push({
          collection: collectionName,
          queryTime: duration,
          status: duration > config.performance.maxQueryTime ? 'slow' : 'fast'
        })
      } catch (error) {
        results.push({
          collection: collectionName,
          queryTime: -1,
          status: 'error',
          error: error.message
        })
      }
    }

    console.log('⚡ Query Performance:', results)
    return results
  }

  // Check Index Health and Identify Duplicates
  async checkIndexHealth() {
    const collections = await this.db.listCollections().toArray()
    const indexHealth = []

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      const collection = this.db.collection(collectionName)

      try {
        // Get index stats
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray()
        
        const collectionHealth = {
          collection: collectionName,
          indexes: [],
          duplicates: [],
          unused: [],
          totalSize: 0
        }

        for (const indexStat of indexStats) {
          const indexInfo = {
            name: indexStat.name,
            usage: indexStat.accesses.ops,
            size: indexStat.spec ? JSON.stringify(indexStat.spec).length : 0
          }

          collectionHealth.indexes.push(indexInfo)
          collectionHealth.totalSize += indexInfo.size

          // Identify unused indexes (less than 100 operations)
          if (indexInfo.usage < 100 && indexInfo.name !== '_id_') {
            collectionHealth.unused.push(indexInfo.name)
          }
        }

        // Check for potential duplicate indexes (simplified detection)
        const indexNames = collectionHealth.indexes.map(idx => idx.name)
        const potentialDuplicates = indexNames.filter((name, index) => {
          return indexNames.findIndex(n => n.includes(name.split('_')[0]) && n !== name) !== -1
        })
        collectionHealth.duplicates = potentialDuplicates

        indexHealth.push(collectionHealth)
      } catch (error) {
        console.warn(`Warning: Could not analyze indexes for ${collectionName}:`, error.message)
      }
    }

    console.log('🗂️  Index Health Summary:')
    indexHealth.forEach(ch => {
      console.log(`  ${ch.collection}: ${ch.indexes.length} indexes, ${ch.unused.length} unused, ${ch.duplicates.length} potential duplicates`)
    })

    return indexHealth
  }

  // Check Replication Status (if replica set)
  async checkReplicationStatus() {
    try {
      const admin = this.db.admin()
      const replStatus = await admin.replSetGetStatus()
      
      const replicationHealth = {
        isReplicaSet: true,
        primary: null,
        secondaries: [],
        lag: 0,
        status: 'healthy'
      }

      for (const member of replStatus.members) {
        if (member.stateStr === 'PRIMARY') {
          replicationHealth.primary = member.name
        } else if (member.stateStr === 'SECONDARY') {
          const lag = member.optimeDate ? (new Date() - member.optimeDate) : 0
          replicationHealth.secondaries.push({
            name: member.name,
            lag: lag,
            health: member.health
          })
          
          if (lag > replicationHealth.lag) {
            replicationHealth.lag = lag
          }
        }
      }

      if (replicationHealth.lag > config.alerts.critical.replicationLag) {
        replicationHealth.status = 'critical'
      }

      console.log('🔄 Replication Status:', replicationHealth)
      return replicationHealth

    } catch (error) {
      // Not a replica set or error accessing replication status
      return {
        isReplicaSet: false,
        status: 'standalone',
        message: 'Database running in standalone mode'
      }
    }
  }

  // Get Slow Queries
  async getSlowQueries() {
    try {
      const admin = this.db.admin()
      const currentOp = await admin.currentOp(true)
      
      const slowQueries = currentOp.inprog.filter(op => 
        op.secs_running && op.secs_running > 5 && 
        op.command && op.command.find
      ).map(op => ({
        duration: op.secs_running,
        collection: op.ns,
        command: op.command,
        client: op.client
      }))

      if (slowQueries.length > 0) {
        console.log('🐌 Slow Queries Detected:', slowQueries.length)
        slowQueries.forEach(q => {
          console.log(`  ${q.collection}: ${q.duration}s`)
        })
      }

      return slowQueries
    } catch (error) {
      console.warn('Warning: Could not retrieve slow queries:', error.message)
      return []
    }
  }

  // Database Backup with Retention Policy
  async createBackup() {
    console.log('\n💾 Starting Database Backup...')
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(config.backup.directory, `backup_${timestamp}`)
      
      // Ensure backup directory exists
      if (!fs.existsSync(config.backup.directory)) {
        fs.mkdirSync(config.backup.directory, { recursive: true })
      }

      // Create backup using mongodump
      const mongodumpCmd = [
        'mongodump',
        `--uri="${config.mongoUri}"`,
        `--out="${backupPath}"`,
        config.backup.compression ? '--gzip' : '',
        config.backup.parallel ? '--numParallelCollections=4' : ''
      ].filter(Boolean).join(' ')

      console.log('🔄 Executing backup command...')
      const startTime = Date.now()
      
      execSync(mongodumpCmd, { stdio: 'inherit' })
      
      const duration = Date.now() - startTime
      const backupSize = this.getDirectorySize(backupPath)

      // Log backup success
      const backupResult = {
        timestamp: new Date(),
        path: backupPath,
        duration: duration,
        size: backupSize,
        status: 'success'
      }

      console.log(`✅ Backup completed successfully in ${duration}ms`)
      console.log(`📁 Backup size: ${(backupSize / 1024 / 1024).toFixed(2)} MB`)
      
      // Apply retention policy
      await this.applyRetentionPolicy()
      
      // Log backup metadata
      this.logBackupResult(backupResult)
      
      return backupResult

    } catch (error) {
      console.error('❌ Backup failed:', error.message)
      this.sendAlert('critical', 'Database Backup Failure', error.message)
      throw error
    }
  }

  // Apply Backup Retention Policy
  async applyRetentionPolicy() {
    try {
      const backupFiles = fs.readdirSync(config.backup.directory)
        .filter(file => file.startsWith('backup_'))
        .map(file => ({
          name: file,
          path: path.join(config.backup.directory, file),
          created: fs.statSync(path.join(config.backup.directory, file)).ctime
        }))
        .sort((a, b) => b.created - a.created)

      const retentionDate = new Date()
      retentionDate.setDate(retentionDate.getDate() - config.backup.retention)

      let deleted = 0
      for (const backup of backupFiles) {
        if (backup.created < retentionDate) {
          fs.rmSync(backup.path, { recursive: true, force: true })
          deleted++
          console.log(`🗑️  Deleted old backup: ${backup.name}`)
        }
      }

      if (deleted > 0) {
        console.log(`📋 Retention policy applied: ${deleted} old backups deleted`)
      }
    } catch (error) {
      console.warn('Warning: Retention policy failed:', error.message)
    }
  }

  // Comprehensive Health Check
  async healthCheck() {
    console.log('\n🏥 Starting Comprehensive Health Check...')
    
    const healthReport = {
      timestamp: new Date(),
      database: {
        connected: this.connected,
        name: config.dbName,
        status: 'unknown'
      },
      performance: null,
      storage: null,
      collections: {},
      recommendations: [],
      overallStatus: 'healthy'
    }

    try {
      // Basic connectivity test
      await this.db.admin().ping()
      healthReport.database.status = 'connected'

      // Get database stats
      const dbStats = await this.db.stats()
      healthReport.storage = {
        dataSize: dbStats.dataSize,
        indexSize: dbStats.indexSize,
        storageSize: dbStats.storageSize,
        collections: dbStats.collections,
        indexes: dbStats.indexes,
        avgObjSize: dbStats.avgObjSize
      }

      // Check each critical collection
      for (const collectionName of config.backup.collections) {
        try {
          const collection = this.db.collection(collectionName)
          const count = await collection.countDocuments()
          const sampleDoc = await collection.findOne({})
          
          healthReport.collections[collectionName] = {
            documentCount: count,
            hasData: count > 0,
            sampleAvailable: !!sampleDoc,
            status: 'healthy'
          }
        } catch (error) {
          healthReport.collections[collectionName] = {
            status: 'error',
            error: error.message
          }
          healthReport.overallStatus = 'warning'
        }
      }

      // Performance check
      healthReport.performance = await this.performanceMonitoring()

      // Generate recommendations
      if (healthReport.storage.indexSize > healthReport.storage.dataSize * 0.5) {
        healthReport.recommendations.push('Consider reviewing index usage - index size is over 50% of data size')
      }

      if (healthReport.storage.avgObjSize > 10000) {
        healthReport.recommendations.push('Average document size is large - consider data archiving or compression')
      }

      // Overall status determination
      const errorCollections = Object.values(healthReport.collections).filter(c => c.status === 'error').length
      if (errorCollections > 0) {
        healthReport.overallStatus = 'warning'
      }

      if (!healthReport.database.connected) {
        healthReport.overallStatus = 'critical'
      }

      console.log('\n📋 Health Check Summary:')
      console.log(`Overall Status: ${healthReport.overallStatus.toUpperCase()}`)
      console.log(`Storage: ${(healthReport.storage.storageSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`Collections: ${Object.keys(healthReport.collections).length}`)
      console.log(`Recommendations: ${healthReport.recommendations.length}`)

      return healthReport

    } catch (error) {
      healthReport.overallStatus = 'critical'
      healthReport.error = error.message
      console.error('❌ Health check failed:', error.message)
      return healthReport
    }
  }

  // Utility: Get directory size
  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0
    
    let totalSize = 0
    const files = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      if (file.isDirectory()) {
        totalSize += this.getDirectorySize(filePath)
      } else {
        totalSize += fs.statSync(filePath).size
      }
    }
    
    return totalSize
  }

  // Logging and Alerting
  logPerformanceResults(results) {
    const logPath = path.join(__dirname, '..', 'logs', 'mongodb-performance.json')
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    // Append to performance log
    const logEntry = JSON.stringify(results) + '\n'
    fs.appendFileSync(logPath, logEntry)
  }

  logBackupResult(result) {
    const logPath = path.join(__dirname, '..', 'logs', 'mongodb-backups.json')
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    // Append to backup log
    const logEntry = JSON.stringify(result) + '\n'
    fs.appendFileSync(logPath, logEntry)
  }

  sendAlert(level, title, message) {
    console.log(`🚨 ${level.toUpperCase()} ALERT: ${title}`)
    console.log(`   ${message}`)
    
    // In production, implement actual alerting (email, Slack, etc.)
    if (config.alerts.slack) {
      // Send to Slack webhook
      // Implementation would go here
    }
    
    if (config.alerts.email) {
      // Send email alert
      // Implementation would go here
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2]
  const admin = new MongoDBAdmin()

  if (!await admin.connect()) {
    process.exit(1)
  }

  try {
    switch (command) {
      case 'monitor':
        await admin.performanceMonitoring()
        break
        
      case 'backup':
        await admin.createBackup()
        break
        
      case 'health':
        const health = await admin.healthCheck()
        console.log('\n📊 Detailed Health Report:')
        console.log(JSON.stringify(health, null, 2))
        break
        
      case 'validate':
        const indexHealth = await admin.checkIndexHealth()
        console.log('\n🔍 Index Validation Results:')
        console.log(JSON.stringify(indexHealth, null, 2))
        break
        
      default:
        console.log('📚 MongoDB Administration Toolkit')
        console.log('')
        console.log('Available commands:')
        console.log('  monitor   - Performance monitoring')
        console.log('  backup    - Create database backup')
        console.log('  health    - Comprehensive health check')
        console.log('  validate  - Validate index health')
        console.log('')
        console.log('Example: node mongodb-admin-toolkit.js monitor')
        break
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message)
    process.exit(1)
  } finally {
    await admin.disconnect()
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = MongoDBAdmin