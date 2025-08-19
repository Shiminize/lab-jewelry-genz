/**
 * React Hooks for Real-time Inventory Management
 * Provides reactive inventory updates, alerts, and stock management
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  inventoryManager, 
  InventoryUpdate, 
  InventoryAlert, 
  StockReservation 
} from '@/lib/realtime-inventory'

// Hook for product inventory status
export function useProductInventory(productId: string) {
  const [inventory, setInventory] = useState<InventoryUpdate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial inventory
    const initialInventory = inventoryManager.getInventory(productId)
    setInventory(initialInventory)
    setIsLoading(false)

    // Listen for updates
    const handleInventoryUpdate = (update: InventoryUpdate) => {
      if (update.productId === productId) {
        setInventory(update)
      }
    }

    inventoryManager.on('inventory-updated', handleInventoryUpdate)

    return () => {
      inventoryManager.off('inventory-updated', handleInventoryUpdate)
    }
  }, [productId])

  return {
    inventory,
    isLoading,
    isInStock: inventory?.available ? inventory.available > 0 : false,
    isLowStock: inventory?.status === 'low-stock',
    isOutOfStock: inventory?.status === 'out-of-stock',
    availableQuantity: inventory?.available || 0,
    totalQuantity: inventory?.quantity || 0,
    reservedQuantity: inventory?.reserved || 0
  }
}

// Hook for inventory alerts
export function useInventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial alerts
    const initialAlerts = inventoryManager.getAlerts()
    setAlerts(initialAlerts)
    setIsLoading(false)

    // Listen for new alerts
    const handleNewAlert = (alert: InventoryAlert) => {
      setAlerts(prev => {
        const filtered = prev.filter(a => a.productId !== alert.productId || a.type !== alert.type)
        return [...filtered, alert]
      })
    }

    const handleAlertDismissed = (alert: InventoryAlert) => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id))
    }

    inventoryManager.on('inventory-alert', handleNewAlert)
    inventoryManager.on('alert-dismissed', handleAlertDismissed)

    return () => {
      inventoryManager.off('inventory-alert', handleNewAlert)
      inventoryManager.off('alert-dismissed', handleAlertDismissed)
    }
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    inventoryManager.dismissAlert(alertId)
  }, [])

  const clearAllAlerts = useCallback(() => {
    alerts.forEach(alert => {
      if (!alert.dismissed) {
        inventoryManager.dismissAlert(alert.id)
      }
    })
  }, [alerts])

  return {
    alerts,
    isLoading,
    dismissAlert,
    clearAllAlerts,
    criticalAlerts: alerts.filter(a => a.severity === 'error'),
    warningAlerts: alerts.filter(a => a.severity === 'warning'),
    successAlerts: alerts.filter(a => a.severity === 'success')
  }
}

// Hook for stock reservations
export function useStockReservation() {
  const [reservations, setReservations] = useState<Map<string, StockReservation>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStockReserved = ({ reservation }: { reservation: StockReservation }) => {
      setReservations(prev => new Map(prev.set(reservation.id, reservation)))
    }

    const handleReservationReleased = ({ reservation }: { reservation: StockReservation }) => {
      setReservations(prev => {
        const updated = new Map(prev)
        updated.delete(reservation.id)
        return updated
      })
    }

    inventoryManager.on('stock-reserved', handleStockReserved)
    inventoryManager.on('reservation-released', handleReservationReleased)

    return () => {
      inventoryManager.off('stock-reserved', handleStockReserved)
      inventoryManager.off('reservation-released', handleReservationReleased)
    }
  }, [])

  const reserveStock = useCallback(async (
    productId: string,
    quantity: number,
    sessionId: string,
    type: StockReservation['type'] = 'cart',
    userId?: string
  ) => {
    setIsLoading(true)
    try {
      const result = await inventoryManager.reserveStock(productId, quantity, sessionId, type, userId)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const releaseReservation = useCallback(async (reservationId: string) => {
    setIsLoading(true)
    try {
      const result = await inventoryManager.releaseReservation(reservationId)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    reservations: Array.from(reservations.values()),
    isLoading,
    reserveStock,
    releaseReservation
  }
}

// Hook for global inventory monitoring
export function useInventoryMonitor() {
  const [allInventory, setAllInventory] = useState<InventoryUpdate[]>([])
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, subscribers: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const subscriberId = useRef(`monitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Subscribe to updates
    inventoryManager.subscribe(subscriberId.current)

    // Get initial data
    const initialInventory = inventoryManager.getAllInventory()
    const initialStatus = inventoryManager.getConnectionStatus()
    
    setAllInventory(initialInventory)
    setConnectionStatus(initialStatus)
    setIsLoading(false)

    // Listen for updates
    const handleInventoryLoaded = (inventory: InventoryUpdate[]) => {
      setAllInventory(inventory)
    }

    const handleInventoryUpdate = (update: InventoryUpdate) => {
      setAllInventory(prev => {
        const updated = prev.map(item => 
          item.productId === update.productId ? update : item
        )
        
        // Add if not found
        if (!prev.find(item => item.productId === update.productId)) {
          updated.push(update)
        }
        
        return updated
      })
    }

    const handleSubscriberChange = () => {
      setConnectionStatus(inventoryManager.getConnectionStatus())
    }

    inventoryManager.on('inventory-loaded', handleInventoryLoaded)
    inventoryManager.on('inventory-updated', handleInventoryUpdate)
    inventoryManager.on('subscriber-added', handleSubscriberChange)
    inventoryManager.on('subscriber-removed', handleSubscriberChange)

    return () => {
      inventoryManager.unsubscribe(subscriberId.current)
      inventoryManager.off('inventory-loaded', handleInventoryLoaded)
      inventoryManager.off('inventory-updated', handleInventoryUpdate)
      inventoryManager.off('subscriber-added', handleSubscriberChange)
      inventoryManager.off('subscriber-removed', handleSubscriberChange)
    }
  }, [])

  const getProductInventory = useCallback((productId: string) => {
    return allInventory.find(item => item.productId === productId) || null
  }, [allInventory])

  const getInventoryByStatus = useCallback((status: InventoryUpdate['status']) => {
    return allInventory.filter(item => item.status === status)
  }, [allInventory])

  return {
    allInventory,
    connectionStatus,
    isLoading,
    getProductInventory,
    getInventoryByStatus,
    inStockProducts: allInventory.filter(item => item.status === 'in-stock'),
    lowStockProducts: allInventory.filter(item => item.status === 'low-stock'),
    outOfStockProducts: allInventory.filter(item => item.status === 'out-of-stock'),
    totalProducts: allInventory.length,
    totalAvailable: allInventory.reduce((sum, item) => sum + item.available, 0),
    totalReserved: allInventory.reduce((sum, item) => sum + item.reserved, 0)
  }
}

// Hook for inventory statistics
export function useInventoryStats() {
  const { allInventory, isLoading } = useInventoryMonitor()

  const stats = {
    total: allInventory.length,
    inStock: allInventory.filter(item => item.status === 'in-stock').length,
    lowStock: allInventory.filter(item => item.status === 'low-stock').length,
    outOfStock: allInventory.filter(item => item.status === 'out-of-stock').length,
    totalQuantity: allInventory.reduce((sum, item) => sum + item.quantity, 0),
    totalAvailable: allInventory.reduce((sum, item) => sum + item.available, 0),
    totalReserved: allInventory.reduce((sum, item) => sum + item.reserved, 0),
    averageStock: allInventory.length > 0 
      ? Math.round(allInventory.reduce((sum, item) => sum + item.available, 0) / allInventory.length)
      : 0,
    stockHealthPercentage: allInventory.length > 0
      ? Math.round((allInventory.filter(item => item.status === 'in-stock').length / allInventory.length) * 100)
      : 0
  }

  return {
    stats,
    isLoading,
    isHealthy: stats.stockHealthPercentage >= 80,
    needsAttention: stats.lowStock > 0 || stats.outOfStock > 0
  }
}