/**
 * ViewerErrorBoundary - Error boundary for 3D viewer components
 * Provides graceful error handling following CLAUDE_RULES design system standards
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ViewerErrorBoundaryProps {
  children: ReactNode
  className?: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ViewerErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ViewerErrorBoundary caught an error:', error, errorInfo)
    
    // Update state with error info
    this.setState({ error, errorInfo })
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI following design system standards
      return (
        <div className={cn(
          'relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-xl border border-destructive bg-destructive/5 flex items-center justify-center',
          this.props.className
        )}>
          <div className="text-center space-y-4 p-6 max-w-md">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-destructive text-xl" role="img" aria-label="Error">⚠</span>
            </div>
            <div>
              <MutedText className="font-medium mb-2 text-foreground">
                3D Viewer Error
              </MutedText>
              <MutedText size="sm" className="text-gray-600 mb-4">
                Something went wrong with the 3D viewer. Please try again.
              </MutedText>
              <button
                onClick={this.handleRetry}
                className={cn(
                  'inline-flex items-center justify-center px-4 py-2 text-sm font-medium',
                  'bg-cta text-background rounded-lg hover:bg-cta-hover',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  'transition-colors duration-200'
                )}
                aria-label="Retry loading 3D viewer"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mt-4">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  Developer Info
                </summary>
                <pre className="text-xs text-gray-600 mt-2 p-2 bg-background rounded border overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>\n\nComponent Stack:{this.state.errorInfo.componentStack}</>
                  )}
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

// Functional component wrapper for easier usage
export function WithViewerErrorBoundary({ 
  children, 
  className, 
  onError 
}: { 
  children: ReactNode
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}) {
  return (
    <ViewerErrorBoundary className={className} onError={onError}>
      {children}
    </ViewerErrorBoundary>
  )
}