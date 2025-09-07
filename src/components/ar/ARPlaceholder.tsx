'use client'

import React, { useState } from 'react'
import { Smartphone, Sparkles, Bell, CheckCircle, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H3, H4, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface ARPlaceholderProps {
  variant?: 'banner' | 'card' | 'modal' | 'inline'
  productName?: string
  onWaitlistSignup?: (email: string) => void
  className?: string
}

export function ARPlaceholder({ 
  variant = 'card',
  productName,
  onWaitlistSignup,
  className 
}: ARPlaceholderProps) {
  const [email, setEmail] = useState('')
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    try {
      await onWaitlistSignup?.(email)
      setIsSignedUp(true)
      setEmail('')
    } catch (error) {
      console.error('Waitlist signup failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-r from-accent/20 via-cta/20 to-accent/20 p-6 md:p-8',
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-cta/5" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between space-y-token-md md:space-y-0">
          <div className="flex items-center space-x-token-md">
            <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <Camera size={24} className="text-accent" />
            </div>
            <div>
              <H3 className="mb-1">✨ AR Try-On Coming Soon!</H3>
              <BodyText className="text-muted">
                Be the first to virtually try on jewelry using your phone camera
              </BodyText>
            </div>
          </div>
          <Button variant="accent" size="lg">
            Join Waitlist
          </Button>
        </div>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className={cn('max-w-md mx-auto text-center space-y-6', className)}>
        <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <div className="relative">
            <Smartphone size={32} className="text-accent" />
            <Sparkles size={16} className="absolute -top-1 -right-1 text-cta" />
          </div>
        </div>

        <div>
          <H3 className="mb-2">AR Try-On Coming Soon!</H3>
          <BodyText className="text-muted">
            {productName 
              ? `Soon you'll be able to see how "${productName}" looks on you using augmented reality.`
              : 'Soon you\'ll be able to try on our jewelry virtually using your phone camera.'
            }
          </BodyText>
        </div>

        <div className="bg-muted/20 rounded-token-lg p-4 space-y-3">
          <H4 level="h4" className="flex items-center justify-center">
            <Bell size={16} className="mr-2" />
            Get Notified First
          </H4>
          
          {!isSignedUp ? (
            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="md" 
                className="w-full"
                isLoading={isLoading}
              >
                Join AR Waitlist
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center space-x-token-sm text-cta">
              <CheckCircle size={16} />
              <BodyText size="sm" weight="medium">
                You're on the list! We'll notify you when AR try-on is ready.
              </BodyText>
            </div>
          )}
        </div>

        <MutedText size="sm">
          Expected launch: Q1 2026
        </MutedText>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        'border border-dashed border-accent/30 rounded-token-lg p-4 bg-accent/5 text-center',
        className
      )}>
        <div className="flex items-center justify-center space-x-token-sm mb-2">
          <Camera size={16} className="text-accent" />
          <BodyText size="sm" weight="medium" className="text-accent">
            AR Try-On Coming Soon
          </BodyText>
        </div>
        <MutedText size="sm">
          Virtual try-on with your phone camera - Q1 2026
        </MutedText>
      </div>
    )
  }

  // Default card variant
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-background to-accent/5 p-6',
      className
    )}>
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
          <Sparkles size={16} className="text-accent" />
        </div>
      </div>

      <div className="space-y-token-md">
        <div>
          <H4 className="mb-2">🎯 AR Try-On</H4>
          <BodyText size="sm" className="text-muted">
            Coming Q1 2026 - Try on jewelry virtually using your phone camera
          </BodyText>
        </div>

        <div className="space-y-token-sm">
          <div className="flex items-center space-x-token-sm">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <MutedText size="sm">Real-time ring sizing</MutedText>
          </div>
          <div className="flex items-center space-x-token-sm">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <MutedText size="sm">Earring placement preview</MutedText>
          </div>
          <div className="flex items-center space-x-token-sm">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <MutedText size="sm">Share AR photos instantly</MutedText>
          </div>
        </div>

        {!isSignedUp ? (
          <form onSubmit={handleWaitlistSubmit} className="flex space-x-token-sm">
            <Input
              type="email"
              placeholder="Email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm"
              required
            />
            <Button 
              type="submit" 
              variant="accent" 
              size="sm"
              isLoading={isLoading}
            >
              Notify Me
            </Button>
          </form>
        ) : (
          <div className="flex items-center space-x-token-sm text-cta">
            <CheckCircle size={14} />
            <BodyText size="sm" weight="medium">
              You're on the waitlist!
            </BodyText>
          </div>
        )}
      </div>
    </div>
  )
}

// Convenience components for specific use cases
export function ARTryOnBanner({ className, ...props }: Omit<ARPlaceholderProps, 'variant'>) {
  return <ARPlaceholder variant="banner" className={className} {...props} />
}

export function ARTryOnCard({ className, ...props }: Omit<ARPlaceholderProps, 'variant'>) {
  return <ARPlaceholder variant="card" className={className} {...props} />
}

export function ARTryOnModal({ className, ...props }: Omit<ARPlaceholderProps, 'variant'>) {
  return <ARPlaceholder variant="modal" className={className} {...props} />
}

export function ARTryOnInline({ className, ...props }: Omit<ARPlaceholderProps, 'variant'>) {
  return <ARPlaceholder variant="inline" className={className} {...props} />
}