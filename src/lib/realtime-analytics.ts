/**
 * Real-time Analytics Utilities
 * Handles WebSocket emissions for live conversion tracking and analytics
 */

interface ConversionEvent {
  id: string
  creatorId: string
  creatorCode: string
  orderAmount: number
  commissionAmount: number
  commissionRate: number
  timestamp: string
  productName?: string
  linkId: string
}

interface ClickEvent {
  id: string
  creatorId: string
  linkId: string
  timestamp: string
  location?: {
    country: string
    state?: string
    city?: string
  }
  deviceType: string
  referrer?: string
}

interface KPIUpdate {
  totalConversions: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  activeCreators: number
  topCreator: {
    id: string
    name: string
    revenue: number
  }
}

/**
 * Emit conversion event to real-time analytics
 */
export function emitConversionEvent(conversion: ConversionEvent) {
  if (typeof global !== 'undefined' && global.io) {
    // Emit to admin analytics room
    global.io.to('admin-analytics').emit('conversion', {
      type: 'conversion',
      data: conversion,
      timestamp: new Date().toISOString()
    })

    // Emit to specific creator analytics room
    global.io.to(`creator-${conversion.creatorId}`).emit('creator-conversion', {
      type: 'creator-conversion',
      data: conversion,
      timestamp: new Date().toISOString()
    })

    // Emit to conversion tracking room
    global.io.to('conversion-tracking').emit('new-conversion', {
      type: 'new-conversion',
      data: conversion,
      timestamp: new Date().toISOString()
    })

    console.log(`🎯 Real-time conversion event emitted: ${conversion.id}`)
  }
}

/**
 * Emit click event to real-time analytics
 */
export function emitClickEvent(click: ClickEvent) {
  if (typeof global !== 'undefined' && global.io) {
    // Emit to admin analytics room
    global.io.to('admin-analytics').emit('click', {
      type: 'click',
      data: click,
      timestamp: new Date().toISOString()
    })

    // Emit to specific creator analytics room
    global.io.to(`creator-${click.creatorId}`).emit('creator-click', {
      type: 'creator-click',
      data: click,
      timestamp: new Date().toISOString()
    })

    console.log(`👆 Real-time click event emitted: ${click.id}`)
  }
}

/**
 * Emit KPI updates to admin dashboard
 */
export function emitKPIUpdate(kpis: KPIUpdate) {
  if (typeof global !== 'undefined' && global.io) {
    global.io.to('admin-analytics').emit('kpi-update', {
      type: 'kpi-update',
      data: kpis,
      timestamp: new Date().toISOString()
    })

    console.log(`📊 KPI update emitted: ${kpis.totalConversions} conversions`)
  }
}

/**
 * Emit creator tier promotion
 */
export function emitTierPromotion(creatorId: string, newTier: string, oldTier: string) {
  if (typeof global !== 'undefined' && global.io) {
    global.io.to('admin-analytics').emit('tier-promotion', {
      type: 'tier-promotion',
      data: {
        creatorId,
        newTier,
        oldTier,
        timestamp: new Date().toISOString()
      }
    })

    global.io.to(`creator-${creatorId}`).emit('tier-promotion', {
      type: 'tier-promotion',
      data: {
        newTier,
        oldTier,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`🎉 Tier promotion emitted: Creator ${creatorId} promoted to ${newTier}`)
  }
}

/**
 * Emit commission payout notification
 */
export function emitPayoutNotification(creatorId: string, amount: number, payoutId: string) {
  if (typeof global !== 'undefined' && global.io) {
    global.io.to(`creator-${creatorId}`).emit('payout-notification', {
      type: 'payout-notification',
      data: {
        amount,
        payoutId,
        timestamp: new Date().toISOString()
      }
    })

    global.io.to('admin-analytics').emit('payout-processed', {
      type: 'payout-processed',
      data: {
        creatorId,
        amount,
        payoutId,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`💰 Payout notification emitted: $${amount} to creator ${creatorId}`)
  }
}

/**
 * Get real-time analytics summary for initial dashboard load
 */
export async function getRealTimeAnalyticsSummary() {
  try {
    // This would typically fetch from Redis cache for performance
    // For now, return basic structure
    return {
      liveConversions: 0,
      activeSessions: 0,
      recentEvents: [],
      topPerformers: [],
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to get real-time analytics summary:', error)
    return null
  }
}

/**
 * Type exports for components
 */
export type {
  ConversionEvent,
  ClickEvent,
  KPIUpdate
}