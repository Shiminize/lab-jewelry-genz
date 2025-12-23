'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WidgetErrorBoundary] Caught error:', error, errorInfo)
    
    // Track error analytics
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('aurora-widget-error', {
            detail: {
              error: error.message,
              componentStack: errorInfo.componentStack,
            },
          })
        )
      } catch (e) {
        // Swallow analytics errors
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="widget-error rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-900">Something went wrong</p>
          <p className="mt-1 text-xs text-red-700">
            We&apos;re sorry, but the widget encountered an error. Please try again or contact support.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-surface-base transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

