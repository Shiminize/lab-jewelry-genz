#!/usr/bin/env node

// Load env vars before anything else
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

/**
 * Custom Next.js Server with Socket.IO Integration
 * Enables real-time WebSocket communication for generation progress
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '127.0.0.1'
const port = parseInt(process.env.PORT || '3000', 10)

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
      if (dev) {
        console.log(`[server] ${req.method} ${req.url}`)
      }
      // Let Next.js handle URL parsing
      await handle(req, res)
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
    .listen(port, hostname, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`)
      console.log(`🔌 WebSocket server ready for real-time updates`)
    })

  // Graceful shutdown handlers
  let shuttingDown = false

  const gracefulShutdown = async (signal) => {
    if (shuttingDown) {
      console.log(`⏳ Graceful shutdown already in progress (signal: ${signal})`)
      return
    }

    shuttingDown = true
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`)

    const forceExitTimer = setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)

    const closeHttpServer = () =>
      new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })

    const closeIoServer = () =>
      new Promise((resolve) => {
        io.close(() => resolve())
      })

    const httpClosePromise = closeHttpServer()

    if (activeConnections.size > 0) {
      console.log(`🔌 Disconnecting ${activeConnections.size} active WebSocket connection(s)...`)
    }

    for (const socket of io.sockets.sockets.values()) {
      try {
        socket.disconnect(true)
        activeConnections.delete(socket.id)
      } catch (error) {
        console.warn(`⚠️ Failed to disconnect socket ${socket?.id ?? 'unknown'}:`, error)
      }
    }

    const ioClosePromise = closeIoServer()

    let shutdownFailed = false

    try {
      await httpClosePromise
      console.log('📡 HTTP server closed')
    } catch (error) {
      shutdownFailed = true
      console.error('❌ Error while closing HTTP server', error)
    }

    try {
      await ioClosePromise
      console.log('🔌 WebSocket server closed')
    } catch (error) {
      shutdownFailed = true
      console.error('❌ Error while closing WebSocket server', error)
    }

    clearTimeout(forceExitTimer)
    console.log('✅ Graceful shutdown complete')
    process.exit(shutdownFailed ? 1 : 0)
  }

  // Handle shutdown signals
  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM')
  })
  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT')
  })
})
