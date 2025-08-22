'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { NavigationItem, NAVIGATION_CONFIG, QUICK_ACTIONS } from '@/lib/navigation/NavigationConfig'

interface NavigationState {
  activeCategory: string | null
  activeMegaMenu: string | null
  hoveredCategory: string | null
  mobileMenuOpen: boolean
  searchQuery: string
  userPreferences: {
    preferredCategories: string[]
    recentlyViewed: string[]
    lastSearches: string[]
  }
}

interface NavigationActions {
  setActiveCategory: (category: string | null) => void
  setActiveMegaMenu: (menu: string | null) => void
  setHoveredCategory: (category: string | null) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  toggleMobileMenu: () => void
  closeAllMenus: () => void
  handleCategoryHover: (category: string) => void
  handleMouseLeave: () => void
  trackCategoryView: (categoryId: string) => void
  trackSearch: (query: string) => void
  resetNavigation: () => void
}

interface NavigationContextValue {
  state: NavigationState
  actions: NavigationActions
  config: {
    navigation: NavigationItem[]
    quickActions: NavigationItem[]
  }
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

const INITIAL_STATE: NavigationState = {
  activeCategory: null,
  activeMegaMenu: null,
  hoveredCategory: null,
  mobileMenuOpen: false,
  searchQuery: '',
  userPreferences: {
    preferredCategories: [],
    recentlyViewed: [],
    lastSearches: []
  }
}

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>(INITIAL_STATE)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side flag after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user preferences from localStorage only on client-side
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem('navigation-preferences')
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences)
          setState(prev => ({
            ...prev,
            userPreferences: {
              ...prev.userPreferences,
              ...preferences
            }
          }))
        }
      } catch (error) {
        console.warn('Failed to load navigation preferences:', error)
      }
    }
  }, [isClient])

  // Save user preferences to localStorage whenever they change
  const savePreferences = useCallback((preferences: NavigationState['userPreferences']) => {
    if (isClient && typeof window !== 'undefined') {
      try {
        localStorage.setItem('navigation-preferences', JSON.stringify(preferences))
      } catch (error) {
        console.warn('Failed to save navigation preferences:', error)
      }
    }
  }, [isClient])

  // Actions
  const setActiveCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, activeCategory: category }))
  }, [])

  const setActiveMegaMenu = useCallback((menu: string | null) => {
    setState(prev => ({ ...prev, activeMegaMenu: menu }))
  }, [])

  const setHoveredCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, hoveredCategory: category }))
  }, [])

  const setMobileMenuOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, mobileMenuOpen: open }))
    
    // Manage body scroll lock only on client-side
    if (isClient && typeof window !== 'undefined') {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isClient])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setState(prev => {
      const newOpen = !prev.mobileMenuOpen
      
      // Manage body scroll lock only on client-side
      if (isClient && typeof window !== 'undefined') {
        if (newOpen) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'unset'
        }
      }
      
      return { ...prev, mobileMenuOpen: newOpen }
    })
  }, [isClient])

  const closeAllMenus = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeCategory: null,
      activeMegaMenu: null,
      hoveredCategory: null,
      mobileMenuOpen: false
    }))
    
    // Reset body scroll only on client-side
    if (isClient && typeof window !== 'undefined') {
      document.body.style.overflow = 'unset'
    }
  }, [isClient])

  const handleCategoryHover = useCallback((category: string) => {
    setState(prev => ({
      ...prev,
      hoveredCategory: category,
      activeMegaMenu: category
    }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setState(prev => ({
      ...prev,
      hoveredCategory: null,
      activeMegaMenu: null
    }))
  }, [])

  const trackCategoryView = useCallback((categoryId: string) => {
    setState(prev => {
      const updatedPreferences = {
        ...prev.userPreferences,
        recentlyViewed: [
          categoryId,
          ...prev.userPreferences.recentlyViewed.filter(id => id !== categoryId)
        ].slice(0, 10) // Keep only last 10 viewed
      }
      
      savePreferences(updatedPreferences)
      
      return {
        ...prev,
        userPreferences: updatedPreferences
      }
    })
  }, [savePreferences])

  const trackSearch = useCallback((query: string) => {
    if (!query.trim()) return
    
    setState(prev => {
      const updatedPreferences = {
        ...prev.userPreferences,
        lastSearches: [
          query,
          ...prev.userPreferences.lastSearches.filter(search => search !== query)
        ].slice(0, 5) // Keep only last 5 searches
      }
      
      savePreferences(updatedPreferences)
      
      return {
        ...prev,
        userPreferences: updatedPreferences
      }
    })
  }, [savePreferences])

  const resetNavigation = useCallback(() => {
    setState(INITIAL_STATE)
    
    // Reset body scroll only on client-side
    if (isClient && typeof window !== 'undefined') {
      document.body.style.overflow = 'unset'
    }
  }, [isClient])

  // Cleanup body scroll on unmount
  useEffect(() => {
    return () => {
      if (isClient && typeof window !== 'undefined') {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isClient])

  // Close menus on escape key
  useEffect(() => {
    if (!isClient) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllMenus()
      }
    }

    if (state.mobileMenuOpen || state.activeMegaMenu) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [state.mobileMenuOpen, state.activeMegaMenu, closeAllMenus, isClient])

  const actions: NavigationActions = {
    setActiveCategory,
    setActiveMegaMenu,
    setHoveredCategory,
    setMobileMenuOpen,
    setSearchQuery,
    toggleMobileMenu,
    closeAllMenus,
    handleCategoryHover,
    handleMouseLeave,
    trackCategoryView,
    trackSearch,
    resetNavigation
  }

  const contextValue: NavigationContextValue = {
    state,
    actions,
    config: {
      navigation: NAVIGATION_CONFIG,
      quickActions: QUICK_ACTIONS
    }
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}

// Custom hook to use navigation context
export function useNavigation() {
  const context = useContext(NavigationContext)
  
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  
  return context
}

// Convenience hooks for specific navigation aspects
export function useNavigationState() {
  const { state } = useNavigation()
  return state
}

export function useNavigationActions() {
  const { actions } = useNavigation()
  return actions
}

export function useNavigationConfig() {
  const { config } = useNavigation()
  return config
}

// Hook for mobile menu management
export function useMobileMenu() {
  const { state, actions } = useNavigation()
  
  return {
    isOpen: state.mobileMenuOpen,
    open: () => actions.setMobileMenuOpen(true),
    close: () => actions.setMobileMenuOpen(false),
    toggle: actions.toggleMobileMenu
  }
}

// Hook for search functionality
export function useNavigationSearch() {
  const { state, actions } = useNavigation()
  
  const handleSearch = useCallback((query: string) => {
    actions.trackSearch(query)
    actions.setSearchQuery('')
    
    // Navigate to search results (you can customize this)
    if (typeof window !== 'undefined') {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }, [actions])
  
  return {
    query: state.searchQuery,
    setQuery: actions.setSearchQuery,
    handleSearch,
    recentSearches: state.userPreferences.lastSearches
  }
}

// Hook for category interactions
export function useCategoryNavigation() {
  const { state, actions } = useNavigation()
  
  return {
    activeCategory: state.activeCategory,
    activeMegaMenu: state.activeMegaMenu,
    hoveredCategory: state.hoveredCategory,
    handleHover: actions.handleCategoryHover,
    handleLeave: actions.handleMouseLeave,
    trackView: actions.trackCategoryView,
    closeAll: actions.closeAllMenus
  }
}