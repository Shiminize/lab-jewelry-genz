'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error with requestId
    const requestId = crypto.randomUUID()
    console.error('Global error (critical):', {
      message: error.message,
      digest: error.digest,
      requestId,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-lg mx-auto">
            {/* Critical Error Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Error Content */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Something went seriously wrong
              </h1>
              <p className="text-lg text-gray-600">
                We encountered a critical error that prevented the application from loading properly.
              </p>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <h2 className="text-sm font-semibold mb-2 text-gray-900">Critical Error Details:</h2>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto font-mono">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs mt-2 text-gray-500">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Recovery Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={reset}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact our support team or try again later.
                </p>
              </div>
            </div>

            {/* Accessibility Information */}
            <div 
              role="status" 
              aria-live="assertive"
              className="sr-only"
            >
              A critical error occurred preventing the application from loading. Please try refreshing or contact support if the problem persists.
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}