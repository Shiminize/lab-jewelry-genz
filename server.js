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

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
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

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`)

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
})