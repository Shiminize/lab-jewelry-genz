#!/usr/bin/env node

/**
 * Custom Next.js Server with Socket.IO Integration
 * Enables real-time WebSocket communication for generation progress
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Global error handlers for crash prevention
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection at:', promise, 'reason:', reason)
  // Log the error but don't crash in development
  if (!dev) {
    console.error('💥 Shutting down due to unhandled promise rejection')
    process.exit(1)
  }
})

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error)
  console.error('💥 Shutting down due to uncaught exception')
  process.exit(1)
})

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// WebSocket connection tracking for cleanup
const activeConnections = new Set()

app.prepare().then(() => {
  // Ensure job persistence directory exists
  const fs = require('fs')
  const path = require('path')
  const jobDir = process.env.JOB_PERSIST_DIR || '/tmp/3d-generation/job-persistence'
  try {
    fs.mkdirSync(jobDir, { recursive: true })
    console.log(`📁 Job persistence directory ready: ${jobDir}`)
  } catch (e) {
    console.warn('⚠️ Failed to ensure job persistence directory', e)
  }

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"]
    }
  })

  // Initialize Redis (optional)
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL not set. Proceeding without Redis; falling back to in-memory operations.')
  }

  // WebSocket connection handling with tracking
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`)
    activeConnections.add(socket.id)

    // Handle joining job progress rooms
    socket.on('join-job', (jobId) => {
      socket.join(`job-${jobId}`)
      console.log(`📱 Client ${socket.id} joined job room: ${jobId}`)
    })

    // Handle leaving job progress rooms  
    socket.on('leave-job', (jobId) => {
      socket.leave(`job-${jobId}`)
      console.log(`📤 Client ${socket.id} left job room: ${jobId}`)
    })

    // Handle joining creator analytics rooms
    socket.on('join-creator-analytics', (creatorId) => {
      socket.join(`creator-${creatorId}`)
      console.log(`📊 Client ${socket.id} joined creator analytics: ${creatorId}`)
    })

    // Handle joining admin analytics room
    socket.on('join-admin-analytics', () => {
      socket.join('admin-analytics')
      console.log(`👨‍💼 Client ${socket.id} joined admin analytics room`)
    })

    // Handle joining conversion tracking room
    socket.on('join-conversion-tracking', () => {
      socket.join('conversion-tracking')
      console.log(`💰 Client ${socket.id} joined conversion tracking room`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id} (${reason})`)
      activeConnections.delete(socket.id)
    })
  })

  // Make Socket.IO instance available globally for the API routes
  global.io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`)
      console.log(`🔌 WebSocket server ready for real-time updates`)
    })

  // Graceful shutdown handlers
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`)
    
    // Stop accepting new connections
    httpServer.close(() => {
      console.log('📡 HTTP server closed')
      
      // Close all WebSocket connections
      console.log(`🔌 Closing ${activeConnections.size} active WebSocket connections...`)
      io.close(() => {
        console.log('🔌 WebSocket server closed')
        
        // Exit the process
        console.log('✅ Graceful shutdown complete')
        process.exit(0)
      })
    })

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)
  }

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
})