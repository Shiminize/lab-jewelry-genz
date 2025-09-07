'use client'

import React from 'react'
import { H3, BodyText } from '@/components/foundation/Typography'

interface OrderItem {
  productName: string
  productImage: string
  productSKU: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: {
    material?: string
    gemstone?: string
    size?: string
    engraving?: {
      text: string
      position: string
    }
  }
  creator?: {
    commissionRate: number
    commissionAmount: number
  }
}

interface OrderDetailsItemsProps {
  items: OrderItem[]
  className?: string
}

const ItemCard = ({ item, index }: { item: OrderItem; index: number }) => (
  <div key={index} className="bg-background rounded-token-lg border p-4">
    <div className="flex items-start gap-4">
      <img
        src={item.productImage}
        alt={item.productName}
        className="w-16 h-16 object-cover rounded-token-lg"
      />
      <div className="flex-1">
        <H3 className="text-foreground">{item.productName}</H3>
        <BodyText className="text-muted-foreground">SKU: {item.productSKU}</BodyText>
        <BodyText className="text-muted-foreground">
          Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
        </BodyText>
        
        {/* Customizations */}
        {item.customizations && (
          <div className="mt-2 p-2 bg-muted rounded">
            <BodyText size="sm" className="font-medium text-foreground">Customizations:</BodyText>
            {item.customizations.material && (
              <BodyText size="sm" className="text-muted-foreground">Material: {item.customizations.material}</BodyText>
            )}
            {item.customizations.gemstone && (
              <BodyText size="sm" className="text-muted-foreground">Gemstone: {item.customizations.gemstone}</BodyText>
            )}
            {item.customizations.size && (
              <BodyText size="sm" className="text-muted-foreground">Size: {item.customizations.size}</BodyText>
            )}
            {item.customizations.engraving && (
              <BodyText size="sm" className="text-muted-foreground">
                Engraving: "{item.customizations.engraving.text}"
              </BodyText>
            )}
          </div>
        )}
        
        {/* Creator Commission */}
        {item.creator && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <BodyText size="sm" className="font-medium text-blue-700">Creator Commission:</BodyText>
            <BodyText size="sm" className="text-blue-600">
              {item.creator.commissionRate}% - ${item.creator.commissionAmount.toFixed(2)}
            </BodyText>
          </div>
        )}
      </div>
      <div className="text-right">
        <BodyText className="font-semibold text-foreground">
          ${item.totalPrice.toFixed(2)}
        </BodyText>
      </div>
    </div>
  </div>
)

export function OrderDetailsItems({ items, className }: OrderDetailsItemsProps) {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <H3 className="text-foreground">Order Items ({items.length})</H3>
      {items.map((item, index) => (
        <ItemCard key={index} item={item} index={index} />
      ))}
    </div>
  )
}