'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobileNavigation } from '@/hooks/useMobileNavigation'
import { 
  BarChart3, 
  Package, 
  Mail, 
  Users, 
  ShoppingCart,
  Settings,
  Home,
  Menu,
  X,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Admin navigation items following PRD business requirements
const adminNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Business metrics overview'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Performance insights'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/admin/inventory',
    icon: Package,
    description: 'Stock & supplier management'
  },
  {
    id: 'email-marketing',
    label: 'Email Marketing',
    href: '/admin/email-marketing',
    icon: Mail,
    description: 'Campaign & automation'
  },
  {
    id: 'creators',
    label: 'Creator Program',
    href: '/admin/creators',
    icon: Users,
    description: 'Influencer partnerships'
  },
  {
    id: 'orders',
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Order management'
  },
  {
    id: 'performance',
    label: 'Performance',
    href: '/admin/performance',
    icon: TrendingUp,
    description: 'System metrics'
  },
  {
    id: 'automation',
    label: 'Automation',
    href: '/admin/automation',
    icon: Zap,
    description: 'Workflow automation'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
] as const

export default function AdminSidebar() {
  const pathname = usePathname()
  const { 
    isMenuOpen: isMobileMenuOpen, 
    isMobile, 
    toggleMenu, 
    closeMenu, 
    openMenu,
    swipeProgress
  } = useMobileNavigation({
    onSwipeRight: () => openMenu(),
    onSwipeLeft: () => closeMenu(),
    swipeThreshold: 100,
    velocityThreshold: 0.3
  })

  // Check if current path is active
  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  // Mobile menu toggle - now handled by hook

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMenu}
          className="text-foreground bg-background shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay with fade animation */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300"
          style={{ opacity: isMobileMenuOpen ? 0.5 : 0 }}
          onClick={closeMenu}
        />
      )}

      {/* Swipe indicator */}
      {isMobile && swipeProgress > 0 && !isMobileMenuOpen && (
        <div 
          className="fixed left-0 top-0 h-full w-1 bg-accent z-30 transition-all duration-150"
          style={{ opacity: swipeProgress }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out",
          "text-foreground bg-background border-r border-border shadow-lg md:shadow-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand Header */}
          <div className="p-6 border-b border-border">
            <H3 className="text-foreground">GlowGlitch Admin</H3>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background">
              Luxury jewelry platform
            </BodyText>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-token-sm overflow-y-auto" role="navigation" aria-label="Admin navigation">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-token-lg transition-all duration-200",
                    "hover:bg-muted focus:bg-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                    "touch-manipulation min-h-[48px]", // Touch-optimized minimum height
                    isActive 
                      ? "text-background bg-cta font-medium transform scale-105" 
                      : "text-foreground bg-background hover:text-foreground hover:scale-102"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-background" : "text-accent"
                    )} 
                  />
                  <div className="flex-1 min-w-0">
                    <BodyText 
                      size="sm" 
                      className={cn(
                        "font-medium truncate",
                        isActive ? "text-background" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </BodyText>
                    <BodyText 
                      size="xs" 
                      className={cn(
                        "truncate",
                        isActive ? "text-background/80" : "text-aurora-nav-muted"
                      )}
                    >
                      {item.description}
                    </BodyText>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <BodyText size="xs" className="text-aurora-nav-muted bg-background text-center">
              Admin Panel v2.0
            </BodyText>
          </div>
        </div>
      </aside>
    </>
  )
}