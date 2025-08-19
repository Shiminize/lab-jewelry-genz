/**
 * Inventory Alerts Component
 * Real-time inventory alerts and notifications system
 */

'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  X, 
  Bell,
  BellOff,
  Package,
  Clock,
  Trash2,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { useInventoryAlerts } from '@/hooks/useRealTimeInventory'
import { InventoryAlert } from '@/lib/realtime-inventory'

interface InventoryAlertsProps {
  variant?: 'dropdown' | 'panel' | 'toast'
  maxAlerts?: number
  autoHide?: boolean
  className?: string
}

export function InventoryAlerts({ 
  variant = 'panel',
  maxAlerts = 10,
  autoHide = false,
  className 
}: InventoryAlertsProps) {
  const { 
    alerts, 
    isLoading, 
    dismissAlert, 
    clearAllAlerts,
    criticalAlerts,
    warningAlerts,
    successAlerts
  } = useInventoryAlerts()

  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'success'>('all')
  const [isExpanded, setIsExpanded] = useState(!autoHide)

  // Filter alerts based on selected filter
  const filteredAlerts = React.useMemo(() => {
    let filtered = alerts
    
    switch (filter) {
      case 'critical':
        filtered = criticalAlerts
        break
      case 'warning':
        filtered = warningAlerts
        break
      case 'success':
        filtered = successAlerts
        break
      default:
        filtered = alerts
    }
    
    return filtered.slice(0, maxAlerts)
  }, [alerts, filter, maxAlerts, criticalAlerts, warningAlerts, successAlerts])

  // Auto-hide after successful operations
  React.useEffect(() => {
    if (autoHide && successAlerts.length > 0) {
      const timer = setTimeout(() => {
        successAlerts.forEach(alert => dismissAlert(alert.id))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoHide, successAlerts, dismissAlert])

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-2', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  // Toast variant - floating notifications
  if (variant === 'toast') {
    return (
      <div className={cn('fixed top-4 right-4 z-50 space-y-2 max-w-sm', className)}>
        {filteredAlerts.map(alert => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            onDismiss={dismissAlert}
            variant="toast"
          />
        ))}
      </div>
    )
  }

  // Dropdown variant - compact menu
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {alerts.length > 0 ? (
            <Bell className="w-4 h-4 text-warning" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          Alerts
          {alerts.length > 0 && (
            <span className="bg-warning text-background text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </Button>

        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <H3>Inventory Alerts</H3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="p-4 text-center">
                  <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <MutedText>No active alerts</MutedText>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredAlerts.map(alert => (
                    <AlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onDismiss={dismissAlert}
                      variant="compact"
                    />
                  ))}
                </div>
              )}
            </div>

            {alerts.length > 0 && (
              <div className="p-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={clearAllAlerts} className="w-full">
                  Clear All Alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Panel variant - full display
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          <H3>Inventory Alerts</H3>
          {alerts.length > 0 && (
            <span className="bg-accent text-background text-sm px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllAlerts}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex border border-border rounded-lg">
            {[
              { key: 'all', label: 'All', count: alerts.length },
              { key: 'critical', label: 'Critical', count: criticalAlerts.length },
              { key: 'warning', label: 'Warning', count: warningAlerts.length },
              { key: 'success', label: 'Success', count: successAlerts.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={cn(
                  'px-3 py-1 text-sm transition-colors',
                  filter === key 
                    ? 'bg-accent text-background' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <BodyText className="text-muted mb-2">No active alerts</BodyText>
            <MutedText>All inventory levels are within normal ranges</MutedText>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onDismiss={dismissAlert}
              variant="detailed"
            />
          ))
        )}
      </div>
    </div>
  )
}

// Individual alert card component
interface AlertCardProps {
  alert: InventoryAlert
  onDismiss: (id: string) => void
  variant?: 'compact' | 'detailed' | 'toast'
}

function AlertCard({ alert, onDismiss, variant = 'detailed' }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'out-of-stock':
        return <XCircle className="w-5 h-5 text-destructive" />
      case 'low-stock':
        return <AlertTriangle className="w-5 h-5 text-warning" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-destructive" />
      case 'restock':
        return <CheckCircle className="w-5 h-5 text-success" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getAlertStyles = () => {
    const base = "border rounded-lg transition-all duration-200"
    
    switch (alert.severity) {
      case 'error':
        return `${base} border-destructive/20 bg-destructive/5`
      case 'warning':
        return `${base} border-warning/20 bg-warning/5`
      case 'success':
        return `${base} border-success/20 bg-success/5`
      default:
        return `${base} border-border bg-background`
    }
  }

  // Toast variant
  if (variant === 'toast') {
    return (
      <div className={cn(getAlertStyles(), 'p-3 shadow-lg animate-in slide-in-from-right')}>
        <div className="flex items-start gap-3">
          {getAlertIcon()}
          <div className="flex-1 min-w-0">
            <BodyText size="sm" className="font-medium mb-1">
              {alert.message}
            </BodyText>
            <MutedText size="xs">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </MutedText>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDismiss(alert.id)}
            className="p-1 h-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn(getAlertStyles(), 'p-3')}>
        <div className="flex items-center gap-3">
          {getAlertIcon()}
          <div className="flex-1 min-w-0">
            <BodyText size="sm" className="truncate">
              {alert.message}
            </BodyText>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDismiss(alert.id)}
            className="p-1 h-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn(getAlertStyles(), 'p-4')}>
      <div className="flex items-start gap-3">
        {getAlertIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <BodyText className="font-medium">
              {alert.productName}
            </BodyText>
            <div className="flex items-center gap-2">
              <MutedText size="sm" className="capitalize">
                {alert.type.replace('-', ' ')}
              </MutedText>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDismiss(alert.id)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <BodyText size="sm" className="mb-3">
            {alert.message}
          </BodyText>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-muted-foreground" />
                <MutedText size="sm">Current: {alert.currentQuantity}</MutedText>
              </div>
              {alert.threshold > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <MutedText size="sm">Threshold: {alert.threshold}</MutedText>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <MutedText size="xs">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </MutedText>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}