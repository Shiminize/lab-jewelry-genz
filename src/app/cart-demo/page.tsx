'use client'

import React, { useState } from 'react'
import { PageContainer, Section } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { H1, BodyText } from '@/components/foundation/Typography'
import { CartSidebar } from '@/components/cart/CartSidebar'

export default function CartDemoPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartState, setCartState] = useState<'empty' | 'with-items'>('with-items')

  // Mock cart items for demonstration
  const mockCartItems = cartState === 'with-items' ? [
    {
      _id: 'eternal-solitaire-ring',
      name: 'Eternal Solitaire Ring',
      basePrice: 2400,
      category: 'rings' as const,
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
      category: 'earrings' as const,
      images: {
        primary: '/images/diamond-drop-earrings.jpg',
        gallery: []
      },
      quantity: 1
    }
  ] : []

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    console.log('Update quantity:', itemId, quantity)
    // In real app, this would update cart state
  }

  const handleRemoveItem = (itemId: string) => {
    console.log('Remove item:', itemId)
    // In real app, this would remove item from cart
  }

  const handleCheckout = () => {
    console.log('Proceed to checkout')
    // In real app, this would navigate to checkout
    alert('Proceeding to checkout...')
  }

  return (
    <div className="min-h-screen">
      <Section>
        <PageContainer>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <H1>Shopping Cart UI Demo</H1>
            <BodyText className="text-muted">
              This demo showcases the shopping cart sidebar interface with different states.
              Click the buttons below to test various cart scenarios.
            </BodyText>

            {/* Demo Controls */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="primary"
                  onClick={() => {
                    setCartState('with-items')
                    setIsCartOpen(true)
                  }}
                >
                  Show Cart with Items
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCartState('empty')
                    setIsCartOpen(true)
                  }}
                >
                  Show Empty Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                >
                  Close Cart
                </Button>
              </div>

              {/* State Indicators */}
              <div className="text-sm text-muted">
                <p>Current State: <strong>{cartState === 'with-items' ? 'Cart with Items' : 'Empty Cart'}</strong></p>
                <p>Cart Open: <strong>{isCartOpen ? 'Yes' : 'No'}</strong></p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <h3 className="font-semibold text-accent">Cart Features</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Slide-out sidebar animation</li>
                  <li>• Responsive mobile & desktop</li>
                  <li>• Quantity controls</li>
                  <li>• Remove items functionality</li>
                  <li>• Real-time price calculation</li>
                  <li>• Tax and shipping calculation</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-accent">UI States</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Empty cart state</li>
                  <li>• Populated cart state</li>
                  <li>• Product customizations display</li>
                  <li>• Trust indicators</li>
                  <li>• Free shipping threshold</li>
                  <li>• Order summary breakdown</li>
                </ul>
              </div>
            </div>

            {/* Mobile Demo Note */}
            <div className="bg-muted/50 rounded-lg p-4">
              <BodyText size="sm" className="text-muted">
                <strong>Mobile Demo:</strong> On mobile devices, the cart appears as a full-screen overlay.
                On desktop, it slides out from the right side. Resize your browser window to test responsive behavior.
              </BodyText>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Cart Sidebar Component */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={mockCartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  )
}