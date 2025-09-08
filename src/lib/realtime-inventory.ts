/**
 * Real-time Inventory Management System
 * Provides live inventory updates, stock monitoring, and availability tracking
 * Uses WebSocket connections for instant updates across all connected clients
 */

import { EventEmitter } from 'events'

export interface InventoryUpdate {
  productId: string
  sku: string
  quantity: number
  reserved: number
  available: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued'
  lastUpdated: Date
  threshold: {
    lowStock: number
    critical: number
  }
}

export interface InventoryAlert {
  id: string
  type: 'low-stock' | 'out-of-stock' | 'restock' | 'critical'
  productId: string
  productName: string
  currentQuantity: number
  threshold: number
  severity: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  dismissed: boolean
}

export interface StockReservation {
  id: string
  productId: string
  quantity: number
  userId?: string
  sessionId: string
  expiresAt: Date
  type: 'cart' | 'checkout' | 'hold'
}

class RealTimeInventoryManager extends EventEmitter {
  private inventoryData = new Map<string, InventoryUpdate>()
  private alerts = new Map<string, InventoryAlert>()
  private reservations = new Map<string, StockReservation>()
  private subscribers = new Set<string>()
  private updateInterval: NodeJS.Timeout | null = null
  private isConnected = false

  constructor() {
    super()
    this.initializeInventoryTracking()
  }

  // Initialize inventory tracking system
  private initializeInventoryTracking() {
    // Simulate real-time inventory data
    this.loadInitialInventoryData()
    
    // Start periodic updates (in production, this would be WebSocket events)
    this.startInventoryUpdates()
    
    // Clean up expired reservations
    this.startReservationCleanup()
  }

  // Load initial inventory data from database
  private async loadInitialInventoryData() {
    try {
      // Mock initial inventory data - in production, fetch from database
      const initialInventory: InventoryUpdate[] = [
        {
          productId: 'ring-diamond-solitaire-001',
          sku: 'DSR-001-6',
          quantity: 15,
          reserved: 3,
          available: 12,
          status: 'in-stock',
          lastUpdated: new Date(),
          threshold: { lowStock: 5, critical: 2 }
        },
        {
          productId: 'necklace-pendant-001',
          sku: 'NP-001-18',
          quantity: 8,
          reserved: 1,
          available: 7,
          status: 'in-stock',
          lastUpdated: new Date(),
          threshold: { lowStock: 10, critical: 3 }
        },
        {
          productId: 'earrings-studs-001',
          sku: 'ES-001-M',
          quantity: 2,
          reserved: 0,
          available: 2,
          status: 'low-stock',
          lastUpdated: new Date(),
          threshold: { lowStock: 5, critical: 2 }
        },
        {
          productId: 'bracelet-tennis-001',
          sku: 'BT-001-7',
          quantity: 0,
          reserved: 2,
          available: 0,
          status: 'out-of-stock',
          lastUpdated: new Date(),
          threshold: { lowStock: 3, critical: 1 }
        }
      ]

      initialInventory.forEach(item => {
        this.inventoryData.set(item.productId, item)
        this.checkInventoryAlerts(item)
      })

      this.emit('inventory-loaded', Array.from(this.inventoryData.values()))
    } catch (error) {
      console.error('Failed to load initial inventory data:', error)
    }
  }

  // Start periodic inventory updates
  private startInventoryUpdates() {
    // CRITICAL FIX: Use GlobalHealthMonitor instead of separate interval
    try {
      const GlobalHealthMonitor = require('./global-health-monitor').default
      const healthMonitor = GlobalHealthMonitor.getInstance()
      
      // Register inventory updates with global monitor to prevent cascade
      healthMonitor.registerService('realtime-inventory-updates', async () => {
        this.simulateInventoryChanges()
        return { status: 'inventory-updated' }
      }, Math.max(10000, 60000)) // Minimum 60 seconds via global monitor (was 10s for demo)

    } catch (error) {
      console.warn('[RealtimeInventory] Failed to register with GlobalHealthMonitor:', error)
      // Fallback to original method if GlobalHealthMonitor fails
      this.updateInterval = setInterval(() => {
        this.simulateInventoryChanges()
      }, 10000) // Update every 10 seconds for demo
    }
  }

  // Simulate inventory changes for demo
  private simulateInventoryChanges() {
    const products = Array.from(this.inventoryData.keys())
    if (products.length === 0) return

    // Randomly update 1-2 products
    const productsToUpdate = products
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1)

    productsToUpdate.forEach(productId => {
      const current = this.inventoryData.get(productId)
      if (!current) return

      // Simulate realistic inventory changes
      const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
      const newQuantity = Math.max(0, current.quantity + change)
      const newReserved = Math.max(0, Math.min(current.reserved, newQuantity))
      const newAvailable = newQuantity - newReserved

      const updated: InventoryUpdate = {
        ...current,
        quantity: newQuantity,
        reserved: newReserved,
        available: newAvailable,
        status: this.determineStockStatus(newAvailable, current.threshold),
        lastUpdated: new Date()
      }

      this.inventoryData.set(productId, updated)
      this.checkInventoryAlerts(updated)
      this.emit('inventory-updated', updated)
    })
  }

  // Determine stock status based on available quantity
  private determineStockStatus(
    available: number, 
    threshold: { lowStock: number; critical: number }
  ): InventoryUpdate['status'] {
    if (available === 0) return 'out-of-stock'
    if (available <= threshold.critical) return 'low-stock'
    if (available <= threshold.lowStock) return 'low-stock'
    return 'in-stock'
  }

  // Check and create inventory alerts
  private checkInventoryAlerts(inventory: InventoryUpdate) {
    const alertId = `${inventory.productId}-${inventory.status}`
    
    // Remove previous alerts for this product
    const existingAlerts = Array.from(this.alerts.keys())
      .filter(id => id.startsWith(inventory.productId))
    existingAlerts.forEach(id => this.alerts.delete(id))

    let alert: InventoryAlert | null = null

    switch (inventory.status) {
      case 'out-of-stock':
        alert = {
          id: alertId,
          type: 'out-of-stock',
          productId: inventory.productId,
          productName: `Product ${inventory.sku}`,
          currentQuantity: inventory.available,
          threshold: 0,
          severity: 'error',
          message: `${inventory.sku} is out of stock`,
          timestamp: new Date(),
          dismissed: false
        }
        break

      case 'low-stock':
        alert = {
          id: alertId,
          type: 'low-stock',
          productId: inventory.productId,
          productName: `Product ${inventory.sku}`,
          currentQuantity: inventory.available,
          threshold: inventory.threshold.lowStock,
          severity: 'warning',
          message: `${inventory.sku} is running low (${inventory.available} left)`,
          timestamp: new Date(),
          dismissed: false
        }
        break

      case 'in-stock':
        // Check if this was previously out of stock (restock alert)
        if (inventory.available > 0) {
          alert = {
            id: `${inventory.productId}-restock`,
            type: 'restock',
            productId: inventory.productId,
            productName: `Product ${inventory.sku}`,
            currentQuantity: inventory.available,
            threshold: inventory.threshold.lowStock,
            severity: 'success',
            message: `${inventory.sku} is back in stock (${inventory.available} available)`,
            timestamp: new Date(),
            dismissed: false
          }
        }
        break
    }

    if (alert) {
      this.alerts.set(alert.id, alert)
      this.emit('inventory-alert', alert)
    }
  }

  // Reserve stock for cart/checkout
  public async reserveStock(
    productId: string, 
    quantity: number, 
    sessionId: string,
    type: StockReservation['type'] = 'cart',
    userId?: string
  ): Promise<{ success: boolean; reservation?: StockReservation; error?: string }> {
    try {
      const inventory = this.inventoryData.get(productId)
      if (!inventory) {
        return { success: false, error: 'Product not found' }
      }

      if (inventory.available < quantity) {
        return { success: false, error: 'Insufficient stock' }
      }

      const reservationId = `${productId}-${sessionId}-${Date.now()}`
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + (type === 'checkout' ? 10 : 30))

      const reservation: StockReservation = {
        id: reservationId,
        productId,
        quantity,
        userId,
        sessionId,
        expiresAt,
        type
      }

      // Update inventory with reservation
      const updatedInventory: InventoryUpdate = {
        ...inventory,
        reserved: inventory.reserved + quantity,
        available: inventory.available - quantity,
        lastUpdated: new Date()
      }

      this.inventoryData.set(productId, updatedInventory)
      this.reservations.set(reservationId, reservation)

      this.emit('stock-reserved', { reservation, inventory: updatedInventory })
      this.emit('inventory-updated', updatedInventory)

      return { success: true, reservation }
    } catch (error) {
      console.error('Failed to reserve stock:', error)
      return { success: false, error: 'Failed to reserve stock' }
    }
  }

  // Release stock reservation
  public async releaseReservation(reservationId: string): Promise<boolean> {
    try {
      const reservation = this.reservations.get(reservationId)
      if (!reservation) return false

      const inventory = this.inventoryData.get(reservation.productId)
      if (!inventory) return false

      // Update inventory by releasing reservation
      const updatedInventory: InventoryUpdate = {
        ...inventory,
        reserved: Math.max(0, inventory.reserved - reservation.quantity),
        available: inventory.available + reservation.quantity,
        lastUpdated: new Date()
      }

      this.inventoryData.set(reservation.productId, updatedInventory)
      this.reservations.delete(reservationId)

      this.emit('reservation-released', { reservation, inventory: updatedInventory })
      this.emit('inventory-updated', updatedInventory)

      return true
    } catch (error) {
      console.error('Failed to release reservation:', error)
      return false
    }
  }

  // Clean up expired reservations
  private startReservationCleanup() {
    // CRITICAL FIX: Use GlobalHealthMonitor instead of separate interval
    try {
      const GlobalHealthMonitor = require('./global-health-monitor').default
      const healthMonitor = GlobalHealthMonitor.getInstance()
      
      // Register reservation cleanup with global monitor to prevent cascade
      healthMonitor.registerService('realtime-inventory-cleanup', async () => {
        const now = new Date()
        const expiredReservations = Array.from(this.reservations.entries())
          .filter(([_, reservation]) => reservation.expiresAt < now)

        expiredReservations.forEach(([id, _]) => {
          this.releaseReservation(id)
        })
        
        return { status: 'reservations-cleaned', expired: expiredReservations.length }
      }, 60000) // 60 seconds via global monitor

    } catch (error) {
      console.warn('[RealtimeInventory] Failed to register cleanup with GlobalHealthMonitor:', error)
      // Fallback to original method if GlobalHealthMonitor fails
      setInterval(() => {
        const now = new Date()
        const expiredReservations = Array.from(this.reservations.entries())
          .filter(([_, reservation]) => reservation.expiresAt < now)

        expiredReservations.forEach(([id, _]) => {
          this.releaseReservation(id)
        })
      }, 60000) // Check every minute
    }
  }

  // Get current inventory for a product
  public getInventory(productId: string): InventoryUpdate | null {
    return this.inventoryData.get(productId) || null
  }

  // Get all inventory data
  public getAllInventory(): InventoryUpdate[] {
    return Array.from(this.inventoryData.values())
  }

  // Get active alerts
  public getAlerts(): InventoryAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.dismissed)
  }

  // Dismiss an alert
  public dismissAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.dismissed = true
      this.alerts.set(alertId, alert)
      this.emit('alert-dismissed', alert)
      return true
    }
    return false
  }

  // Subscribe to real-time updates
  public subscribe(subscriberId: string): void {
    this.subscribers.add(subscriberId)
    this.emit('subscriber-added', subscriberId)
  }

  // Unsubscribe from updates
  public unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId)
    this.emit('subscriber-removed', subscriberId)
  }

  // Get connection status
  public getConnectionStatus(): { connected: boolean; subscribers: number } {
    return {
      connected: this.isConnected,
      subscribers: this.subscribers.size
    }
  }

  // Cleanup resources
  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.removeAllListeners()
    this.inventoryData.clear()
    this.alerts.clear()
    this.reservations.clear()
    this.subscribers.clear()
  }
}

// Global instance
export const inventoryManager = new RealTimeInventoryManager()

// React hook for inventory management
export function useInventoryManager() {
  return inventoryManager
}