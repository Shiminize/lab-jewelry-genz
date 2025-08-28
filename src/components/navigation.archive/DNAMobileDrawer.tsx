'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'
import { 
  X, 
  Dna, 
  Atom, 
  Microscope, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  Eye, 
  ChevronRight,
  Beaker,
  Zap,
  Target,
  Award,
  ChevronDown,
  Search,
  Heart,
  ShoppingCart,
  User,
  Home
} from 'lucide-react'

interface DNAMobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function DNAMobileDrawer({ isOpen, onClose }: DNAMobileDrawerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [compatibilityScore, setCompatibilityScore] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const steps = [
    {
      id: 'welcome',
      title: 'Genetic Discovery',
      subtitle: 'Unlock your jewelry DNA',
      description: 'Your unique genetic signature holds the key to finding your perfect gemstone match.',
      icon: Dna,
      color: 'amber'
    },
    {
      id: 'analysis',
      title: 'Lab Analysis',
      subtitle: 'Scanning 23 chromosomes',
      description: 'Our medical-grade technology analyzes your genetic markers for gemstone compatibility.',
      icon: Microscope,
      color: 'blue'
    },
    {
      id: 'results',
      title: 'Your Results',
      subtitle: '99.7% compatibility found',
      description: 'Exceptional genetic match detected with Moissanite crystal structure.',
      icon: Target,
      color: 'emerald'
    },
    {
      id: 'recommendations',
      title: 'Perfect Matches',
      subtitle: 'Genetically optimized for you',
      description: 'Discover jewelry specifically designed for your unique DNA profile.',
      icon: Sparkles,
      color: 'purple'
    }
  ]

  const navigationSections = [
    {
      id: 'dna-discovery',
      name: 'DNA Discovery',
      icon: Dna,
      badge: '99.7% Match',
      description: 'Genetic sequencing & compatibility analysis',
      items: ['Start Analysis', 'View Previous Results', 'Genetic Profile']
    },
    {
      id: 'lab-results',
      name: 'Lab Results',
      icon: Beaker,
      badge: '127 Studies',
      description: 'Peer-reviewed molecular diagnostics',
      items: ['View Lab Report', 'Scientific Validation', 'Methodology']
    },
    {
      id: 'synthesis',
      name: 'Custom Synthesis',
      icon: Atom,
      badge: 'Lab Grade',
      description: 'Precision-engineered jewelry creation',
      items: ['Design Custom Piece', 'Atomic Engineering', 'Quality Control']
    },
    {
      id: 'evolution',
      name: 'Evolution Tracker',
      icon: TrendingUp,
      badge: 'Predictive',
      description: 'Style DNA evolution pathway',
      items: ['Future Predictions', 'Style Evolution', 'Trend Analysis']
    }
  ]

  const quickActions = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', badge: '3' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: '2' },
    { icon: User, label: 'Profile', href: '/profile' }
  ]

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setCurrentStep(1)
    
    // Simulate analysis progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      setCompatibilityScore(Math.min(progress, 99.7))
      
      if (progress >= 25 && currentStep === 1) setCurrentStep(2)
      if (progress >= 70 && currentStep === 2) setCurrentStep(3)
      if (progress >= 99.7) {
        clearInterval(interval)
        setIsAnalyzing(false)
        setCompatibilityScore(99.7)
      }
    }, 200)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-full bg-background shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Dna className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-amber-700">Scientific Lab</h1>
                <p className="text-xs text-amber-600">Genetic Analysis Center</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scientific Status */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">ISO-9001 Certified</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">
                Active Analysis
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* DNA Analysis Journey */}
            {(currentStep === 0 || isAnalyzing) && (
              <div className="p-6">
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {(() => {
                        const Icon = steps[currentStep].icon
                        return <Icon className="w-8 h-8 text-white" />
                      })()}
                    </div>
                    
                    <h2 className="text-xl font-bold text-amber-700 mb-2">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-amber-600 font-medium mb-3">
                      {steps[currentStep].subtitle}
                    </p>
                    <p className="text-sm text-amber-700 mb-6">
                      {steps[currentStep].description}
                    </p>

                    {isAnalyzing && (
                      <div className="space-y-4">
                        <div className="text-3xl font-bold text-emerald-600">
                          {compatibilityScore.toFixed(1)}%
                        </div>
                        <Progress value={compatibilityScore} className="h-3" />
                        <p className="text-sm text-aurora-nav-muted">
                          Analyzing chromosome {Math.floor(compatibilityScore / 4.3) + 1} of 23...
                        </p>
                      </div>
                    )}

                    {!isAnalyzing && currentStep === 0 && (
                      <Button 
                        onClick={startAnalysis}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      >
                        <Dna className="w-4 h-4 mr-2" />
                        Start Your Genetic Analysis
                      </Button>
                    )}

                    {!isAnalyzing && currentStep === 3 && (
                      <div className="space-y-3">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Rare Genetic Profile - Top 0.3%
                        </Badge>
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Your Perfect Matches
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Sections */}
            {!isAnalyzing && currentStep >= 3 && (
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-aurora-nav-text mb-4">Scientific Categories</h3>
                
                {navigationSections.map((section) => {
                  const Icon = section.icon
                  const isExpanded = expandedSection === section.id
                  
                  return (
                    <Card key={section.id} className="border-aurora-nav-border">
                      <CardContent className="p-0">
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-aurora-nav-hover"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-aurora-nav-surface rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-aurora-nav-muted" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-aurora-nav-text">{section.name}</div>
                              <div className="text-xs text-aurora-nav-muted">{section.description}</div>
                            </div>
                            <Badge variant="secondary" className="mr-2">
                              {section.badge}
                            </Badge>
                          </div>
                          <ChevronDown className={cn(
                            "w-4 h-4 text-aurora-nav-muted transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2">
                            {section.items.map((item, index) => (
                              <button
                                key={index}
                                className="w-full text-left p-3 text-sm text-aurora-nav-muted hover:text-aurora-nav-text hover:bg-aurora-nav-hover rounded-lg flex items-center justify-between"
                              >
                                {item}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Scientific Authority */}
            <div className="p-4 mt-6">
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-lg font-bold text-emerald-700">127</div>
                  <div className="text-sm text-emerald-600 mb-2">Peer-Reviewed Studies</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                      <Award className="w-2 h-2 mr-1" />
                      ISO-9001
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                      <Shield className="w-2 h-2 mr-1" />
                      B-Corp
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-aurora-nav-border bg-aurora-nav-surface p-4">
            <div className="grid grid-cols-5 gap-1">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-background transition-colors relative"
                  >
                    <Icon className="w-5 h-5 text-aurora-nav-muted mb-1" />
                    <span className="text-xs text-aurora-nav-muted">{action.label}</span>
                    {action.badge && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-amber-500"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Genetic Match CTA */}
          {!isAnalyzing && currentStep >= 3 && (
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
              <Button 
                className="w-full bg-background text-emerald-600 hover:bg-aurora-nav-hover"
                onClick={onClose}
              >
                <Zap className="w-4 h-4 mr-2" />
                Claim Your 99.7% Genetic Match
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}