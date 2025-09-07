'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { H3, BodyText, MutedText, CTAText } from '@/components/foundation/Typography'
import type { ProductBase } from '@/types/customizer'

interface CartItem extends ProductBase {
  quantity: number
  selectedSize?: string
  customizations?: {
    metalType: string
    stoneType: string
  }
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
}

// Mock cart data for demonstration
const mockCartItems: CartItem[] = [
  {
    _id: 'eternal-solitaire-ring',
    name: 'Eternal Solitaire Ring',
    basePrice: 2400,
    category: 'rings',
    images: {
      primary: '/images/eternal-solitaire-ring.jpg',
      gallery: []
    },
    quantity: 1,
    selectedSize: '6',
    customizations: {
      metalType: '14K Yellow Gold',
      stoneType: 'Lab-Grown Diamond'
    }
  },
  {
    _id: 'diamond-drop-earrings',
    name: 'Diamond Drop Earrings',
    basePrice: 1200,
    originalPrice: 1500,
    category: 'earrings',
    images: {
      primary: '/images/diamond-drop-earrings.jpg',
      gallery: []
    },
    quantity: 1
  }
]

export function CartSidebar({ 
  isOpen = true, // Default to true for demo
  onClose = () => {}, 
  items = mockCartItems,
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onCheckout = () => {}
}: Partial<CartSidebarProps>) {
  const subtotal = items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax for demo
  const shipping = subtotal > 2000 ? 0 : 50 // Free shipping over $2000
  const total = subtotal + tax + shipping

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <H3>Shopping Cart ({items.length})</H3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-border-muted rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-token-xl">
              <div className="text-6xl text-muted mb-token-md">🛒</div>
              <BodyText className="text-muted mb-token-md">Your cart is empty</BodyText>
              <Button variant="primary" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-token-xl space-y-token-xl">
              {items.map((item) => (
                <div key={item._id} className="flex gap-token-md">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-border-muted rounded-token-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.media?.primary || item.images?.primary || '/images/placeholder-product.jpg'} 
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <BodyText weight="medium" className="truncate">{item.name}</BodyText>
                    
                    {/* Customizations */}
                    {item.customizations && (
                      <div className="space-y-1 mt-1">
                        <MutedText size="sm">Metal: {item.customizations.metalType}</MutedText>
                        <MutedText size="sm">Stone: {item.customizations.stoneType}</MutedText>
                      </div>
                    )}
                    
                    {item.selectedSize && (
                      <MutedText size="sm">Size: {item.selectedSize}</MutedText>
                    )}

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <CTAText size="sm">${item.basePrice.toLocaleString()}</CTAText>
                        {item.originalPrice && (
                          <MutedText size="sm" className="line-through">
                            ${item.originalPrice.toLocaleString()}
                          </MutedText>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-border-muted text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-border-muted text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item._id)}
                      className="text-sm text-error hover:text-error mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t bg-border-muted p-6 space-y-token-md">
            {/* Order Summary */}
            <div className="space-y-token-sm">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={onCheckout}
            >
              Proceed to Checkout
            </Button>

            {/* Continue Shopping */}
            <Button 
              variant="ghost" 
              size="md" 
              className="w-full"
              onClick={onClose}
            >
              Continue Shopping
            </Button>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted pt-4 border-t">
              <div>🔒 Secure Checkout</div>
              <div>↩ 30-Day Returns</div>
              <div>🚚 Free Shipping $500+</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar