/**
 * Error Notification System
 * CLAUDE_RULES.md compliant toast notifications for API errors and async failures
 * Provides luxury brand experience with emotional appeal
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertCircle, Wifi, Shield, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'

export interface ErrorNotification {
  id: string
  type: 'network' | 'api' | 'auth' | 'data' | 'generic'
  title: string
  message: string
  action?: {
    label: string
    handler: () => void
  }
  duration?: number // Auto-dismiss after ms (0 = manual only)
  priority?: 'low' | 'medium' | 'high'
}

interface ErrorNotificationProps {
  notification: ErrorNotification
  onDismiss: (id: string) => void
  className?: string
}

// CLAUDE_RULES.md compliant error type styling and icons
const ERROR_STYLES = {
  network: {
    icon: Wifi,
    bgColor: 'bg-background', // Combination #1: text-foreground bg-background
    textColor: 'text-foreground',
    borderColor: 'border-border',
    accentColor: 'text-accent'
  },
  api: {
    icon: Database,
    bgColor: 'bg-background',
    textColor: 'text-foreground', 
    borderColor: 'border-border',
    accentColor: 'text-accent'
  },
  auth: {
    icon: Shield,
    bgColor: 'bg-background',
    textColor: 'text-foreground',
    borderColor: 'border-border', 
    accentColor: 'text-accent'
  },
  data: {
    icon: AlertCircle,
    bgColor: 'bg-background',
    textColor: 'text-foreground',
    borderColor: 'border-border',
    accentColor: 'text-accent'
  },
  generic: {
    icon: Zap,
    bgColor: 'bg-background',
    textColor: 'text-foreground',
    borderColor: 'border-border',
    accentColor: 'text-accent'
  }
}

// Gen Z emotional messaging (CLAUDE_RULES.md Line 189)
const EMOTIONAL_MESSAGES = {
  network: '🌐 Reconnecting your world...',
  api: '⚡ Syncing your data...',
  auth: '🔐 Securing your experience...',
  data: '💾 Refreshing your content...',
  generic: '✨ Making things perfect...'
}

export function ErrorNotificationComponent({ 
  notification, 
  onDismiss, 
  className 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const style = ERROR_STYLES[notification.type]
  const Icon = style.icon
  const emotionalMessage = EMOTIONAL_MESSAGES[notification.type]

  // Animation control
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Auto-dismiss functionality
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300) // Match exit animation duration
  }

  const handleAction = () => {
    if (notification.action) {
      notification.action.handler()
      handleDismiss()
    }
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-full max-w-sm mx-auto transform transition-all duration-300 ease-out',
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={cn(
        'rounded-lg border shadow-lg p-4',
        style.bgColor,
        style.borderColor,
        'backdrop-blur-sm'
      )}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-6 h-6 mt-0.5',
            style.accentColor
          )}>
            <Icon className="w-full h-full" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <BodyText className={cn('font-medium', style.textColor)}>
              {notification.title}
            </BodyText>
            
            <MutedText className="text-aurora-nav-muted mt-1">
              {notification.message}
            </MutedText>
            
            {/* Emotional appeal */}
            <MutedText className={cn('mt-2 font-medium', style.accentColor)} size="sm">
              {emotionalMessage}
            </MutedText>

            {/* Action button */}
            {notification.action && (
              <div className="mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAction}
                  className="text-sm"
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
              'hover:bg-muted transition-colors',
              style.textColor
            )}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Notification Container for managing multiple notifications
interface ErrorNotificationContainerProps {
  notifications: ErrorNotification[]
  onDismiss: (id: string) => void
  maxNotifications?: number
  className?: string
}

export function ErrorNotificationContainer({
  notifications,
  onDismiss,
  maxNotifications = 3,
  className
}: ErrorNotificationContainerProps) {
  // Sort by priority and limit displayed notifications
  const sortedNotifications = notifications
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return (priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'])
    })
    .slice(0, maxNotifications)

  return (
    <div 
      className={cn('fixed top-4 right-4 z-50 space-y-2', className)}
      aria-live="polite"
      aria-label="Error notifications"
    >
      {sortedNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index 
          }}
        >
          <ErrorNotificationComponent
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  )
}

// Helper functions for creating notifications
export function createNetworkErrorNotification(
  message = 'Connection lost. Please check your internet.',
  retryHandler?: () => void
): ErrorNotification {
  return {
    id: `network_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'network',
    title: 'Connection Issue',
    message,
    action: retryHandler ? {
      label: 'Retry',
      handler: retryHandler
    } : undefined,
    duration: 8000,
    priority: 'high'
  }
}

export function createAPIErrorNotification(
  endpoint: string,
  status?: number,
  retryHandler?: () => void
): ErrorNotification {
  const statusText = status ? ` (${status})` : ''
  return {
    id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'api',
    title: 'Service Unavailable',
    message: `Unable to reach ${endpoint}${statusText}. We're working on it.`,
    action: retryHandler ? {
      label: 'Try Again',
      handler: retryHandler
    } : undefined,
    duration: 6000,
    priority: 'medium'
  }
}

export function createAuthErrorNotification(
  redirectToLogin?: () => void
): ErrorNotification {
  return {
    id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'auth',
    title: 'Authentication Required',
    message: 'Please sign in to continue your jewelry journey.',
    action: redirectToLogin ? {
      label: 'Sign In',
      handler: redirectToLogin
    } : undefined,
    duration: 0, // Manual dismiss only
    priority: 'high'
  }
}

export function createDataErrorNotification(
  dataType: string,
  refreshHandler?: () => void
): ErrorNotification {
  return {
    id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'data',
    title: 'Data Sync Issue',
    message: `Unable to load ${dataType}. Let's refresh and try again.`,
    action: refreshHandler ? {
      label: 'Refresh',
      handler: refreshHandler
    } : undefined,
    duration: 5000,
    priority: 'medium'
  }
}

export function createGenericErrorNotification(
  title: string,
  message: string,
  actionLabel?: string,
  actionHandler?: () => void
): ErrorNotification {
  return {
    id: `generic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'generic',
    title,
    message,
    action: actionHandler ? {
      label: actionLabel || 'Retry',
      handler: actionHandler
    } : undefined,
    duration: 4000,
    priority: 'low'
  }
}