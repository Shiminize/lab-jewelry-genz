/**
 * Global Error Management Context
 * Provides centralized error handling with CLAUDE_RULES.md compliant notifications
 * Integrates with error boundaries and async error handling
 */

'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { 
  ErrorNotification,
  ErrorNotificationContainer,
  createNetworkErrorNotification,
  createAPIErrorNotification,
  createAuthErrorNotification,
  createDataErrorNotification,
  createGenericErrorNotification
} from '@/components/errors/ErrorNotification'

interface ErrorState {
  notifications: ErrorNotification[]
  isGlobalErrorOccurred: boolean
  lastErrorTime: number
}

type ErrorAction = 
  | { type: 'ADD_NOTIFICATION'; payload: ErrorNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_GLOBAL_ERROR'; payload: boolean }

interface ErrorContextType {
  // State
  notifications: ErrorNotification[]
  isGlobalErrorOccurred: boolean
  
  // Actions
  addNotification: (notification: ErrorNotification) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  
  // Convenience methods for common error types
  showNetworkError: (message?: string, retryHandler?: () => void) => void
  showAPIError: (endpoint: string, status?: number, retryHandler?: () => void) => void
  showAuthError: (redirectToLogin?: () => void) => void
  showDataError: (dataType: string, refreshHandler?: () => void) => void
  showGenericError: (title: string, message: string, actionLabel?: string, actionHandler?: () => void) => void
  
  // Error boundary integration
  handleBoundaryError: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      // Prevent duplicate notifications (same type and message within 2 seconds)
      const now = Date.now()
      const isDuplicate = state.notifications.some(notification => 
        notification.type === action.payload.type &&
        notification.message === action.payload.message &&
        (now - state.lastErrorTime) < 2000
      )
      
      if (isDuplicate) {
        return state
      }
      
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        lastErrorTime: now
      }
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
      
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      }
      
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        isGlobalErrorOccurred: action.payload
      }
      
    default:
      return state
  }
}

const initialState: ErrorState = {
  notifications: [],
  isGlobalErrorOccurred: false,
  lastErrorTime: 0
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, initialState)

  // Basic notification management
  const addNotification = useCallback((notification: ErrorNotification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
  }, [])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Convenience methods for common error scenarios
  const showNetworkError = useCallback((message?: string, retryHandler?: () => void) => {
    const notification = createNetworkErrorNotification(message, retryHandler)
    addNotification(notification)
  }, [addNotification])

  const showAPIError = useCallback((endpoint: string, status?: number, retryHandler?: () => void) => {
    const notification = createAPIErrorNotification(endpoint, status, retryHandler)
    addNotification(notification)
  }, [addNotification])

  const showAuthError = useCallback((redirectToLogin?: () => void) => {
    const notification = createAuthErrorNotification(redirectToLogin)
    addNotification(notification)
  }, [addNotification])

  const showDataError = useCallback((dataType: string, refreshHandler?: () => void) => {
    const notification = createDataErrorNotification(dataType, refreshHandler)
    addNotification(notification)
  }, [addNotification])

  const showGenericError = useCallback((
    title: string, 
    message: string, 
    actionLabel?: string, 
    actionHandler?: () => void
  ) => {
    const notification = createGenericErrorNotification(title, message, actionLabel, actionHandler)
    addNotification(notification)
  }, [addNotification])

  // Error boundary integration
  const handleBoundaryError = useCallback((
    error: Error, 
    errorInfo: React.ErrorInfo, 
    errorId: string
  ) => {
    console.error('Global error boundary triggered:', {
      error: error.message,
      errorId,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // Set global error flag for potential UI adjustments
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: true })

    // Show user-friendly notification
    const notification = createGenericErrorNotification(
      'Something Unexpected Happened',
      'We\'re working to fix this. Try refreshing the page.',
      'Refresh Page',
      () => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }
    )
    
    addNotification(notification)

    // Reset global error flag after a delay
    setTimeout(() => {
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: false })
    }, 5000)
  }, [addNotification])

  const contextValue: ErrorContextType = {
    // State
    notifications: state.notifications,
    isGlobalErrorOccurred: state.isGlobalErrorOccurred,
    
    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Convenience methods
    showNetworkError,
    showAPIError,
    showAuthError,
    showDataError,
    showGenericError,
    
    // Error boundary integration
    handleBoundaryError
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      <ErrorNotificationContainer
        notifications={state.notifications}
        onDismiss={removeNotification}
        maxNotifications={3}
      />
    </ErrorContext.Provider>
  )
}

// Custom hook for using error context
export function useError(): ErrorContextType {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Custom hook for API error handling
export function useAPIErrorHandler() {
  const { showAPIError, showNetworkError } = useError()
  
  return useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    retryHandler?: () => void
  ): Promise<T | null> => {
    try {
      return await apiCall()
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      
      if (error instanceof Error) {
        // Network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          showNetworkError(
            `Cannot connect to ${endpoint}. Please check your connection.`,
            retryHandler
          )
          return null
        }
        
        // HTTP errors
        if (error.message.includes('404')) {
          showAPIError(endpoint, 404, retryHandler)
          return null
        }
        
        if (error.message.includes('500')) {
          showAPIError(endpoint, 500, retryHandler)
          return null
        }
        
        // Generic API error
        showAPIError(endpoint, undefined, retryHandler)
      } else {
        showAPIError(endpoint, undefined, retryHandler)
      }
      
      return null
    }
  }, [showAPIError, showNetworkError])
}

// Hook for handling async operations with error boundaries
export function useAsyncError() {
  const { showGenericError } = useError()
  
  return useCallback(<T>(
    asyncOperation: () => Promise<T>,
    errorTitle: string,
    errorMessage: string,
    retryHandler?: () => void
  ) => {
    return asyncOperation().catch((error) => {
      console.error('Async operation failed:', error)
      showGenericError(
        errorTitle,
        errorMessage,
        retryHandler ? 'Try Again' : undefined,
        retryHandler
      )
      return null
    })
  }, [showGenericError])
}