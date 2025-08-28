'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavigationProps {
  className?: string
  onNavigate?: (path: string) => void
}

interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  badge?: number
}

// Mobile-first navigation items based on competitor analysis
const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: '🏠'
  },
  {
    id: 'shop',
    label: 'Shop',
    path: '/catalog',
    icon: '💎'
  },
  {
    id: 'customize',
    label: 'Design',
    path: '/customizer',
    icon: '🎨'
  },
  {
    id: 'account',
    label: 'Account',
    path: '/account',
    icon: '👤'
  },
  {
    id: 'cart',
    label: 'Cart',
    path: '/cart',
    icon: '🛍️',
    badge: 2 // Dynamic cart count would come from context
  }
]

export function BottomNavigation({ className, onNavigate }: BottomNavigationProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Smart hide/show based on scroll direction (mobile UX best practice)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY

      // Hide on scroll down, show on scroll up
      if (scrollDifference > 8 && currentScrollY > 100) {
        setIsVisible(false)
      } else if (scrollDifference < -8 || currentScrollY < 50) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const handleNavClick = (item: NavItem) => {
    onNavigate?.(item.path)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          role="navigation"
          aria-label="Bottom Navigation"
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 md:hidden', // Only show on mobile
            'bg-white/95 backdrop-blur-xl border-t border-border',
            'safe-area-inset-bottom', // Handle iOS safe area
            className
          )}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {/* Navigation Items Container */}
          <div className="flex items-center justify-around px-2 py-2">
            {BOTTOM_NAV_ITEMS.map((item, index) => {
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
                >
                  <motion.div
                    className={cn(
                      'relative flex flex-col items-center justify-center',
                      'touch-target min-h-12 min-w-12 rounded-xl transition-all duration-200',
                      active 
                        ? 'bg-nebula-purple/10' 
                        : 'hover:bg-starlight-gray/50'
                    )}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: active ? 1.05 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Icon with badge */}
                    <div className="relative mb-1">
                      <motion.span 
                        className={cn(
                          'text-xl transition-all duration-200',
                          active ? 'grayscale-0' : 'grayscale'
                        )}
                        animate={{
                          rotateY: active ? 0 : 0,
                          scale: active ? 1.1 : 1
                        }}
                      >
                        {item.icon}
                      </motion.span>
                      
                      {/* Badge for notifications/cart count */}
                      {item.badge && item.badge > 0 && (
                        <motion.div
                          className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-accent-secondary text-white text-xs font-medium rounded-full px-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          key={item.badge}
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={cn(
                      'text-xs font-medium transition-colors duration-200 truncate max-w-16',
                      active 
                        ? 'text-nebula-purple' 
                        : 'text-gray-600'
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          className="absolute -top-1 w-1 h-1 bg-nebula-purple rounded-full"
                          layoutId="activeIndicator"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Haptic feedback indicator (visual representation) */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-t-full" />
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

// Custom hook for bottom navigation state
export function useBottomNavigation() {
  const [isVisible, setIsVisible] = useState(true)

  const hideBottomNav = () => setIsVisible(false)
  const showBottomNav = () => setIsVisible(true)
  const toggleBottomNav = () => setIsVisible(prev => !prev)

  return {
    isVisible,
    hideBottomNav,
    showBottomNav,
    toggleBottomNav
  }
}