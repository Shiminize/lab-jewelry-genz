'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Dna, 
  Atom, 
  Microscope, 
  TrendingUp, 
  Search, 
  ShoppingCart, 
  Heart, 
  Menu,
  Sparkles,
  Beaker,
  Shield
} from 'lucide-react'

interface ScientificHeaderProps {
  onMegaMenuToggle: (show: boolean) => void
  onMobileMenuToggle: (open: boolean) => void
  showMegaMenu: boolean
}

export function ScientificHeader({ onMegaMenuToggle, onMobileMenuToggle, showMegaMenu }: ScientificHeaderProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [geneticScore, setGeneticScore] = useState(99.7)
  const [activeAnalyses, setActiveAnalyses] = useState(847)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnalyses(prev => prev + Math.floor(Math.random() * 3))
      setGeneticScore(prev => Math.min(prev + Math.random() * 0.1, 99.9))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const navigationItems = [
    {
      id: 'dna-discovery',
      name: 'DNA Discovery',
      icon: Dna,
      href: '/customizer',
      badge: `${geneticScore.toFixed(1)}% Match`,
      description: 'Unlock your genetic gemstone compatibility',
      scientific: 'Genetic Sequencing Analysis'
    },
    {
      id: 'lab-results',
      name: 'Lab Results',
      icon: Beaker,
      href: '/products',
      badge: '127 Studies',
      description: 'Peer-reviewed molecular compatibility',
      scientific: 'Molecular Diagnostics'
    },
    {
      id: 'synthesis',
      name: 'Custom Synthesis',
      icon: Atom,
      href: '/customizer',
      badge: 'Lab Grade',
      description: 'Precision-engineered for your DNA',
      scientific: 'Atomic Engineering'
    },
    {
      id: 'evolution',
      name: 'Evolution Tracker',
      icon: TrendingUp,
      href: '/profile',
      badge: 'Predictive',
      description: 'Your style DNA evolution pathway',
      scientific: 'Hereditary Mapping'
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-lg">
      {/* Scientific Status Bar */}
      <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-6 text-xs text-amber-800">
            <div className="flex items-center gap-1">
              <Microscope className="w-3 h-3" />
              <span className="font-medium">{activeAnalyses} Active Genetic Analyses</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span className="font-medium">ISO-9001 Medical Grade Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">99.7% Average Compatibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => onMobileMenuToggle(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo with Scientific Branding */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Dna className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                GlowGlitch
              </h1>
              <p className="text-xs text-slate-500 font-medium">Scientific Jewelry Lab</p>
            </div>
          </div>

          {/* Skip Link for Accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
          >
            Skip to main content
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    setHoveredItem(item.id)
                    onMegaMenuToggle(true)
                  }}
                  onMouseLeave={() => {
                    setHoveredItem(null)
                    onMegaMenuToggle(false)
                  }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                      hoveredItem === item.id 
                        ? "bg-amber-50 text-amber-700 scale-105" 
                        : "text-slate-700 hover:text-amber-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-2 text-xs",
                        hoveredItem === item.id 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  </Button>
                  
                  {/* Scientific Description Tooltip */}
                  {hoveredItem === item.id && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-white rounded-lg shadow-xl border border-amber-200 z-50">
                      <div className="text-sm font-semibold text-amber-700 mb-1">
                        {item.scientific}
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.description}
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                        <Shield className="w-3 h-3" />
                        <span>Peer Reviewed & Validated</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Genetic Profile Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">
                Genetic Profile Active
              </span>
            </div>

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2" 
            >
              <Heart className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2" 
            >
              <ShoppingCart className="h-4 w-4" />
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-amber-500"
              >
                2
              </Badge>
            </Button>

            {/* Genetic Match CTA */}
            <Button 
              className="hidden md:flex bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Claim Your Match
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}