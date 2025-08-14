'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import type { ProductBase, CustomizationOptions } from '@/types/customizer'

interface ActionButtonsProps {
  product: ProductBase
  customization: CustomizationOptions
  totalPrice: number
  onAddToCart?: () => Promise<void>
  onSaveDesign?: () => Promise<void>
  onShare?: () => void
  className?: string
}

export function ActionButtons({
  product,
  customization,
  totalPrice,
  onAddToCart,
  onSaveDesign,
  onShare,
  className
}: ActionButtonsProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [addToCartSuccess, setAddToCartSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Check if design is complete
  const isDesignComplete = customization.material && customization.stoneQuality && customization.size

  const handleAddToCart = async () => {
    if (!onAddToCart || !isDesignComplete) return

    try {
      setIsAddingToCart(true)
      await onAddToCart()
      setAddToCartSuccess(true)
      
      // Reset success state after 3 seconds
      setTimeout(() => setAddToCartSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      // Handle error (toast notification, etc.)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleSaveDesign = async () => {
    if (!onSaveDesign) return

    try {
      setIsSaving(true)
      await onSaveDesign()
      setSaveSuccess(true)
      
      // Reset success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save design:', error)
      // Handle error (toast notification, etc.)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      setShowShareModal(true)
    }
  }

  const ShareModal = () => (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <H3 className="text-foreground">Share Creation</H3>
            <button
              onClick={() => setShowShareModal(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close share modal"
            >
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <BodyText className="font-medium text-foreground mb-1">
                {product.name}
              </BodyText>
              <MutedText size="sm">
                Custom design • ${totalPrice.toLocaleString()}
              </MutedText>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                onClick={() => {
                  // Copy link functionality
                  navigator.clipboard?.writeText(window.location.href)
                  setShowShareModal(false)
                }}
              >
                <svg className="w-6 h-6 text-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <MutedText size="sm">Copy Link</MutedText>
              </button>

              <button 
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                onClick={() => {
                  // Email sharing functionality
                  const subject = encodeURIComponent(`Check out my custom ${product.name}`)
                  const body = encodeURIComponent(`I designed this beautiful piece: ${window.location.href}`)
                  window.open(`mailto:?subject=${subject}&body=${body}`)
                  setShowShareModal(false)
                }}
              >
                <svg className="w-6 h-6 text-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <MutedText size="sm">Email</MutedText>
              </button>

              <button 
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                onClick={() => {
                  // WhatsApp sharing
                  const text = encodeURIComponent(`Check out my custom ${product.name}: ${window.location.href}`)
                  window.open(`https://wa.me/?text=${text}`)
                  setShowShareModal(false)
                }}
              >
                <svg className="w-6 h-6 text-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <MutedText size="sm">WhatsApp</MutedText>
              </button>

              <button 
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                onClick={() => {
                  // Pinterest sharing
                  const url = encodeURIComponent(window.location.href)
                  const description = encodeURIComponent(`My custom ${product.name} design`)
                  window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${description}`)
                  setShowShareModal(false)
                }}
              >
                <svg className="w-6 h-6 text-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <MutedText size="sm">Pinterest</MutedText>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      {/* Design completeness indicator */}
      {!isDesignComplete && (
        <div className="mb-4 p-3 bg-cta/10 border border-cta/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <BodyText className="text-sm font-medium text-foreground">
                Complete your design
              </BodyText>
              <MutedText size="sm">
                Select {[
                  !customization.material && 'material',
                  !customization.stoneQuality && 'stone quality',
                  !customization.size && 'size'
                ].filter(Boolean).join(', ')} to add to cart
              </MutedText>
            </div>
          </div>
        </div>
      )}

      {/* Success notifications */}
      {addToCartSuccess && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <BodyText className="text-sm font-medium text-foreground">
              Beautiful choice! Added to cart
            </BodyText>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <BodyText className="text-sm font-medium text-foreground">
              Design saved successfully
            </BodyText>
          </div>
        </div>
      )}

      {/* Primary action button */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!isDesignComplete}
          isLoading={isAddingToCart}
          variant="primary"
          size="lg"
          className="w-full text-lg py-4 min-h-14"
        >
          {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
        </Button>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleSaveDesign}
            isLoading={isSaving}
            variant="secondary"
            size="md"
            className="flex-1"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          >
            {isSaving ? 'Saving...' : 'Save Design'}
          </Button>

          <Button
            onClick={handleShare}
            variant="ghost"
            size="md"
            className="flex-1"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            }
          >
            Share Creation
          </Button>
        </div>

        {/* AR view button (mobile only) */}
        <Button
          variant="outline"
          size="md"
          className="w-full md:hidden"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        >
          View in AR
        </Button>
      </div>

      {/* Help text */}
      <div className="mt-6 text-center">
        <MutedText size="sm" className="mb-2">
          Need help with your design?
        </MutedText>
        <Button
          variant="ghost"
          size="sm"
          className="text-cta hover:text-cta-hover"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        >
          Get Expert Help
        </Button>
      </div>

      {/* Share modal */}
      {showShareModal && <ShareModal />}
    </div>
  )
}