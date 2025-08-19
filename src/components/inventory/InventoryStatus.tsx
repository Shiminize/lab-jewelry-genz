/**
 * Inventory Status Component
 * Real-time inventory display with stock levels and availability indicators
 */

'use client'

import React from 'react'
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Clock,
  Users,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { useProductInventory } from '@/hooks/useRealTimeInventory'

interface InventoryStatusProps {
  productId: string
  showDetails?: boolean
  showReservations?: boolean
  variant?: 'compact' | 'detailed' | 'badge'
  className?: string
}

export function InventoryStatus({ 
  productId, 
  showDetails = false, 
  showReservations = false,
  variant = 'compact',
  className 
}: InventoryStatusProps) {
  const {
    inventory,
    isLoading,
    isInStock,
    isLowStock,
    isOutOfStock,
    availableQuantity,
    totalQuantity,
    reservedQuantity
  } = useProductInventory(productId)

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-muted rounded-full" />
          <MutedText size="sm">Loading...</MutedText>
        </div>
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <XCircle className="w-4 h-4 text-muted-foreground" />
        <MutedText size="sm">No inventory data</MutedText>
      </div>
    )
  }

  // Badge variant - minimal display
  if (variant === 'badge') {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        isOutOfStock && 'bg-destructive/10 text-destructive',
        isLowStock && 'bg-warning/10 text-warning',
        isInStock && 'bg-success/10 text-success',
        className
      )}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          isOutOfStock && 'bg-destructive',
          isLowStock && 'bg-warning',
          isInStock && 'bg-success'
        )} />
        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
      </div>
    )
  }

  // Compact variant - single line with icon
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {isOutOfStock && (
          <>
            <XCircle className="w-4 h-4 text-destructive" />
            <BodyText size="sm" className="text-destructive">Out of Stock</BodyText>
          </>
        )}
        
        {isLowStock && (
          <>
            <AlertTriangle className="w-4 h-4 text-warning" />
            <BodyText size="sm" className="text-warning">
              Low Stock ({availableQuantity} left)
            </BodyText>
          </>
        )}
        
        {isInStock && !isLowStock && (
          <>
            <CheckCircle className="w-4 h-4 text-success" />
            <BodyText size="sm" className="text-success">In Stock</BodyText>
            {showDetails && (
              <MutedText size="sm">({availableQuantity} available)</MutedText>
            )}
          </>
        )}
      </div>
    )
  }

  // Detailed variant - comprehensive information
  return (
    <div className={cn('space-y-3 p-4 border border-border rounded-lg', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOutOfStock && (
            <>
              <XCircle className="w-5 h-5 text-destructive" />
              <BodyText className="font-medium text-destructive">Out of Stock</BodyText>
            </>
          )}
          
          {isLowStock && (
            <>
              <AlertTriangle className="w-5 h-5 text-warning" />
              <BodyText className="font-medium text-warning">Low Stock Alert</BodyText>
            </>
          )}
          
          {isInStock && !isLowStock && (
            <>
              <CheckCircle className="w-5 h-5 text-success" />
              <BodyText className="font-medium text-success">In Stock</BodyText>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-muted-foreground" />
          <MutedText size="sm">SKU: {inventory.sku}</MutedText>
        </div>
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <BodyText className="font-medium">{totalQuantity}</BodyText>
          <MutedText size="sm">Total</MutedText>
        </div>
        
        <div className="text-center">
          <BodyText className={cn(
            'font-medium',
            availableQuantity === 0 && 'text-destructive',
            availableQuantity <= inventory.threshold.critical && availableQuantity > 0 && 'text-warning',
            availableQuantity > inventory.threshold.lowStock && 'text-success'
          )}>
            {availableQuantity}
          </BodyText>
          <MutedText size="sm">Available</MutedText>
        </div>
        
        {showReservations && (
          <div className="text-center">
            <BodyText className="font-medium">{reservedQuantity}</BodyText>
            <MutedText size="sm">Reserved</MutedText>
          </div>
        )}
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {inventory.status === 'in-stock' ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <BodyText className="font-medium capitalize">
              {inventory.status.replace('-', ' ')}
            </BodyText>
          </div>
          <MutedText size="sm">Status</MutedText>
        </div>
      </div>

      {/* Threshold Information */}
      {showDetails && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <MutedText size="sm">Low Stock Alert: {inventory.threshold.lowStock}</MutedText>
            </div>
            
            <div className="flex items-center gap-2">
              <XCircle className="w-3 h-3 text-destructive" />
              <MutedText size="sm">Critical Level: {inventory.threshold.critical}</MutedText>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <MutedText size="xs">
          Updated {new Date(inventory.lastUpdated).toLocaleTimeString()}
        </MutedText>
      </div>
    </div>
  )
}

// Stock indicator for product cards
export function StockIndicator({ 
  productId, 
  className 
}: { 
  productId: string
  className?: string 
}) {
  const { isInStock, isLowStock, isOutOfStock, availableQuantity } = useProductInventory(productId)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        isOutOfStock && 'bg-destructive',
        isLowStock && 'bg-warning',
        isInStock && !isLowStock && 'bg-success'
      )} />
      <MutedText size="xs">
        {isOutOfStock ? 'Out of Stock' : 
         isLowStock ? `${availableQuantity} left` : 
         'In Stock'}
      </MutedText>
    </div>
  )
}

// Real-time stock counter
export function LiveStockCounter({ 
  productId, 
  className 
}: { 
  productId: string
  className?: string 
}) {
  const { availableQuantity, isLoading, inventory } = useProductInventory(productId)

  if (isLoading || !inventory) {
    return (
      <div className={cn('animate-pulse flex items-center gap-1', className)}>
        <div className="w-4 h-4 bg-muted rounded" />
        <div className="w-8 h-3 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Package className="w-4 h-4 text-muted-foreground" />
      <BodyText size="sm" className={cn(
        'font-medium',
        availableQuantity === 0 && 'text-destructive',
        availableQuantity <= inventory.threshold.critical && availableQuantity > 0 && 'text-warning'
      )}>
        {availableQuantity}
      </BodyText>
      <MutedText size="sm">in stock</MutedText>
    </div>
  )
}