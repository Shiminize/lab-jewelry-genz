/**
 * Universal Error Boundary System
 * CLAUDE_RULES.md compliant error handling with luxury brand experience
 * Provides graceful error recovery with emotional appeal for Gen Z users
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  className?: string
  fallback?: ReactNode
  variant?: 'page' | 'section' | 'component' | 'viewer'
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: () => void
}

// Error type classification for better UX
type ErrorType = 'network' | 'render' | 'data' | 'permission' | 'unknown'

function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase()
  const stack = error.stack?.toLowerCase() || ''
  
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'network'
  }
  if (message.includes('render') || stack.includes('react') || message.includes('hydrat')) {
    return 'render'
  }
  if (message.includes('data') || message.includes('parse') || message.includes('json')) {
    return 'data'
  }
  if (message.includes('unauthorized') || message.includes('permission') || message.includes('auth')) {
    return 'permission'
  }
  return 'unknown'
}

// Error messages with Gen Z emotional appeal (CLAUDE_RULES.md Line 189)
const ERROR_MESSAGES = {
  network: {
    title: 'Connection Hiccup',
    message: 'Your story is still loading. Let\'s try reconnecting.',
    emotion: '🌟 Your perfect piece is waiting'
  },
  render: {
    title: 'Something Glitched',
    message: 'We\'re polishing this experience. Give us another moment.',
    emotion: '✨ Creating magic takes time'
  },
  data: {
    title: 'Data Sync Issue',
    message: 'Your jewelry data is syncing. Let\'s refresh and try again.',
    emotion: '💎 Every detail matters to us'
  },
  permission: {
    title: 'Access Needed',
    message: 'We need permission to show you these beautiful pieces.',
    emotion: '🔐 Your privacy is precious to us'
  },
  unknown: {
    title: 'Unexpected Pause',
    message: 'Something unique happened. Let\'s start fresh.',
    emotion: '🎨 Every challenge sparks innovation'
  }
}

// Variant-specific layouts
const VARIANT_STYLES = {
  page: {
    container: 'min-h-screen flex items-center justify-center bg-background',
    content: 'text-center space-y-6 p-8 max-w-2xl mx-auto',
    icon: 'w-20 h-20',
    title: 'text-2xl lg:text-3xl'
  },
  section: {
    container: 'w-full py-16 flex items-center justify-center bg-muted',
    content: 'text-center space-y-4 p-6 max-w-lg mx-auto',
    icon: 'w-16 h-16',
    title: 'text-xl lg:text-2xl'
  },
  component: {
    container: 'w-full h-48 flex items-center justify-center bg-muted rounded-lg border border-border',
    content: 'text-center space-y-3 p-4 max-w-sm mx-auto',
    icon: 'w-12 h-12',
    title: 'text-lg'
  },
  viewer: {
    container: 'relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-xl border bg-muted flex items-center justify-center',
    content: 'text-center space-y-4 p-6 max-w-md mx-auto',
    icon: 'w-14 h-14',
    title: 'text-lg'
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Enhanced error logging with context
    console.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      variant: this.props.variant,
      retryCount: this.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    })
    
    this.setState({ errorInfo, errorId })
    this.props.onError?.(error, errorInfo, errorId)
  }

  handleRetry = () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn(`Max retries (${this.maxRetries}) reached for error: ${this.state.error?.message}`)
      return
    }

    this.retryCount++
    
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    })
    
    // Call optional retry handler
    this.props.onRetry?.()
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const variant = this.props.variant || 'component'
      const styles = VARIANT_STYLES[variant]
      const errorType = this.state.error ? classifyError(this.state.error) : 'unknown'
      const errorMsg = ERROR_MESSAGES[errorType]
      const canRetry = this.retryCount < this.maxRetries

      return (
        <div className={cn(styles.container, this.props.className)}>
          <div className={styles.content}>
            {/* CLAUDE_RULES.md compliant luxury error icon */}
            <div className={cn(styles.icon, 'mx-auto')}>
              <svg viewBox="0 0 128 128" className="w-full h-full text-accent" fill="currentColor">
                {/* Luxury jewelry-inspired error icon */}
                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                <circle cx="64" cy="64" r="40" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.6"/>
                <circle cx="64" cy="64" r="20" fill="currentColor" opacity="0.8"/>
                {/* Sparkle details */}
                <path d="M64 30 L68 38 L76 34 L72 42 L80 46 L72 50 L76 58 L68 54 L64 62 L60 54 L52 58 L56 50 L48 46 L56 42 L52 34 L60 38 Z" 
                      fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            
            <div className="space-y-3">
              {/* CLAUDE_RULES.md combination #4: text-foreground bg-muted */}
              <H3 className={cn('text-foreground font-headline font-medium', styles.title)}>
                {errorMsg.title}
              </H3>
              
              {/* CLAUDE_RULES.md combination #2: text-aurora-nav-muted bg-background */}
              <BodyText className="text-aurora-nav-muted">
                {errorMsg.message}
              </BodyText>
              
              {/* CLAUDE_RULES.md combination #6: text-accent bg-background (muted background) */}
              <MutedText className="text-accent font-medium">
                {errorMsg.emotion}
              </MutedText>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={this.handleRetry}
                  aria-label={`Retry loading (attempt ${this.retryCount + 1} of ${this.maxRetries})`}
                >
                  Try Again
                </Button>
              )}
              
              {variant === 'page' && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={this.handleReload}
                  aria-label="Reload page"
                >
                  Refresh Page
                </Button>
              )}
              
              {!canRetry && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={this.handleReload}
                  aria-label="Reload page to recover"
                >
                  Reload to Continue
                </Button>
              )}
            </div>

            {/* Error ID for support */}
            {this.state.errorId && (
              <MutedText size="sm" className="text-aurora-nav-muted">
                Error ID: {this.state.errorId}
              </MutedText>
            )}

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mt-4">
                <summary className="cursor-pointer text-xs text-aurora-nav-muted hover:text-foreground transition-colors">
                  Developer Debug Info
                </summary>
                <pre className="text-xs text-aurora-nav-muted mt-2 p-3 bg-background rounded border border-border overflow-auto max-h-32 font-mono">
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}<strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                  {'\n\n'}<strong>Retry Count:</strong> {this.retryCount}/{this.maxRetries}
                  {'\n'}<strong>Error Type:</strong> {errorType}
                  {'\n'}<strong>Timestamp:</strong> {new Date().toISOString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional component wrappers for different use cases
export function WithPageErrorBoundary({ 
  children, 
  className, 
  onError,
  onRetry
}: { 
  children: ReactNode
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: () => void
}) {
  return (
    <ErrorBoundary 
      variant="page" 
      className={className} 
      onError={onError}
      onRetry={onRetry}
    >
      {children}
    </ErrorBoundary>
  )
}

export function WithSectionErrorBoundary({ 
  children, 
  className, 
  onError,
  onRetry
}: { 
  children: ReactNode
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: () => void
}) {
  return (
    <ErrorBoundary 
      variant="section" 
      className={className} 
      onError={onError}
      onRetry={onRetry}
    >
      {children}
    </ErrorBoundary>
  )
}

export function WithComponentErrorBoundary({ 
  children, 
  className, 
  onError,
  onRetry
}: { 
  children: ReactNode
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: () => void
}) {
  return (
    <ErrorBoundary 
      variant="component" 
      className={className} 
      onError={onError}
      onRetry={onRetry}
    >
      {children}
    </ErrorBoundary>
  )
}

export function WithViewerErrorBoundary({ 
  children, 
  className, 
  onError,
  onRetry
}: { 
  children: ReactNode
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: () => void
}) {
  return (
    <ErrorBoundary 
      variant="viewer" 
      className={className} 
      onError={onError}
      onRetry={onRetry}
    >
      {children}
    </ErrorBoundary>
  )
}