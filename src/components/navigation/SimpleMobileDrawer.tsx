'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  X, 
  ChevronDown,
  Heart,
  ShoppingCart,
  User,
  Search,
  Home
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useNavigation, useMobileMenu, useNavigationSearch } from '@/contexts/NavigationProvider'

interface SimpleMobileDrawerProps {
  // No props needed - uses context
}

export function SimpleMobileDrawer({}: SimpleMobileDrawerProps) {
  const { config } = useNavigation()
  const { isOpen, close } = useMobileMenu()
  const { query, setQuery, handleSearch: performSearch } = useNavigationSearch()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [cartCount] = useState(2)
  const [wishlistCount] = useState(5)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  // Hydration-safe mounting check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Use Gen Z-optimized labels from navigation config
  const getDisplayLabel = (item: any, isMobile = true) => {
    return isMobile && item.metadata?.genZLabel ? item.metadata.genZLabel : item.label
  }

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }, [expandedCategory])

  // Handle search submission
  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (query.trim()) {
      performSearch(query.trim())
      close()
    }
  }, [query, performSearch, close])

  // Handle search input key press
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  // Focus management (body scroll handled by NavigationProvider)
  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement
      
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 350)
    } else {
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus()
      }
    }
  }, [isOpen])

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      if (event.key === 'Escape') {
        close()
        return
      }
      
      if (event.key === 'Tab') {
        const drawer = drawerRef.current
        if (!drawer) return
        
        const focusableElements = drawer.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  if (!isMounted) {
    return null
  }

  return (
    <div 
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop - CLAUDE_RULES: backdrop with smooth fade */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer bg-foreground/50 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
      />
      
      {/* Drawer - CLAUDE_RULES compliant smooth slide */}
      <div 
        ref={drawerRef}
        className={`absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header - CLAUDE_RULES: text-background bg-foreground */}
          <div className="flex items-center justify-between px-6 py-4 bg-foreground text-background flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img 
                src="/glitchglow_logo_empty_gold.png" 
                alt="GlowGlitch - Uniquely Yours. Consciously Made" 
                className="h-8 w-auto font-headline"
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={close}
              className="text-background hover:bg-background/10 min-w-11 min-h-11"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar - CLAUDE_RULES: text-foreground bg-background */}
          <div className="px-6 py-5 bg-background flex-shrink-0">
            <form onSubmit={handleSearch} className="relative">
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent hover:text-foreground transition-colors duration-200"
              >
                <Search className="w-4 h-4" />
              </button>
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Find your next obsession..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-4 bg-background border-0 text-foreground placeholder:text-foreground/60 focus:ring-2 focus:ring-accent font-body min-h-11"
              />
            </form>
          </div>

          {/* Navigation Content - CLAUDE_RULES: text-foreground bg-background */}
          <div className="flex-1 bg-background">
            <nav className="py-2 font-body">
              {config.navigation.map((category, index) => (
                <div key={category.id}>
                  {category.children && category.children.length > 0 ? (
                    <div>
                      {/* Category with subcategories */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between text-foreground bg-background hover:bg-muted transition-colors duration-200 min-h-11"
                      >
                        <span className="font-body text-base font-medium tracking-wide">
                          {getDisplayLabel(category).toUpperCase()}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-accent transition-transform duration-200 ${
                          expandedCategory === category.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Subcategories with smooth animation */}
                      <div 
                        id={`${category.id}-submenu`}
                        className={`overflow-hidden transition-all duration-200 ease-out ${
                          expandedCategory === category.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        role="menu"
                      >
                        <div className="bg-background">
                          {category.children?.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={subcategory.href}
                              className="block px-8 py-4 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors duration-200 font-body min-h-11 flex items-center"
                              onClick={close}
                              role="menuitem"
                            >
                              {getDisplayLabel(subcategory)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Simple category link
                    <Link
                      href={category.href}
                      className="block px-6 py-5 text-left text-foreground bg-background hover:bg-muted transition-colors duration-200 min-h-11 flex items-center"
                      onClick={close}
                    >
                      <span className="font-body text-base font-medium tracking-wide">
                        {getDisplayLabel(category).toUpperCase()}
                      </span>
                    </Link>
                  )}
                  
                  {/* Separator line except for last item */}
                  {index < config.navigation.length - 1 && (
                    <div className="border-b border-border/20 mx-6" />
                  )}
                </div>
              ))}
            </nav>

            {/* Featured Section - CLAUDE_RULES: text-foreground bg-background */}
            <div className="px-6 py-5 bg-background text-foreground">
              <h3 className="font-headline text-base font-medium text-foreground mb-3">Create Your Main Character Moment</h3>
              <div className="space-y-3">
                <div className="p-4 bg-background text-foreground rounded-lg border border-border">
                  <h4 className="font-body font-medium mb-1">Make It Yours</h4>
                  <p className="text-sm text-foreground/70 mb-3 font-body">
                    Design jewelry that tells your story - your values, your vibe, your vision. Lab-grown diamonds that shine as bright as your future.
                  </p>
                  <Button variant="primary" size="sm" className="w-full min-h-11" asChild>
                    <Link href="/customizer" onClick={close}>
                      Start Your Story
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - CLAUDE_RULES: text-foreground bg-background */}
          <div className="bg-background text-foreground px-6 py-5 border-t border-border flex-shrink-0">
            {/* Quick Action Buttons - CLAUDE_RULES: Using context config */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {config.quickActions.map((action) => {
                const getIcon = (iconName: string) => {
                  const iconMap: { [key: string]: any } = {
                    '🏠': Home,
                    '💖': Heart,
                    '🛍️': ShoppingCart,
                    '👤': User
                  }
                  return iconMap[iconName] || Home
                }
                
                const Icon = getIcon(action.metadata?.icon || '🏠')
                const badge = action.metadata?.badge === 'dynamic' ? 
                  (action.id === 'wishlist' ? wishlistCount : action.id === 'cart' ? cartCount : 0) : 
                  0

                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-muted/50 transition-colors relative text-foreground min-h-11"
                    onClick={close}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-body">{getDisplayLabel(action)}</span>
                    {badge > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-foreground"
                      >
                        {badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Main CTA - CLAUDE_RULES: Primary variant */}
            <Button 
              variant="primary"
              className="w-full min-h-11 font-body"
              asChild
            >
              <Link href="/catalog" onClick={close}>
                Find Your Vibe
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}