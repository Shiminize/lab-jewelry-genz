'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Menu, X, Sparkles, Microscope, Beaker, Atom, TrendingUp, 
  Heart, User, Dna, BarChart3, Zap, Activity, Shield, 
  TestTube, Layers, Radar, Database, Award, Target, 
  Globe, Brain, FlaskConical, Waves, Orbit, Eye, 
  Gauge, Binary, Cpu, GitBranch, Fingerprint, Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  EnhancedSmartNavBase, 
  usePsychProfile, 
  SmartSearch, 
  SmartCartIcon, 
  PersonalizedBanner 
} from './EnhancedSmartNavBase'
import { cn } from '@/lib/utils'
import { enhancedNavigationData } from '@/data/enhanced-navigation'
import { EnhancedMegaMenu } from './EnhancedMegaMenu'

// SVG Icon Component
const SVGIcon = ({ 
  svgString, 
  className = "w-4 h-4" 
}: { 
  svgString: string
  className?: string 
}) => (
  <div 
    className={className}
    dangerouslySetInnerHTML={{ __html: svgString }}
  />
)

export function PersonalGemstoneDNA() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [compatibilityScore, setCompatibilityScore] = useState(99.7)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Simulate real-time genetic analysis
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  // Start analysis on component mount
  useEffect(() => {
    setIsAnalyzing(true)
  }, [])

  return (
    <EnhancedSmartNavBase variant="dna">
      {/* Personalized Dna Banner */}
      <PersonalizedBanner variant="dna" />

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo with Dna Helix */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Dna className="w-5 h-5 text-background animate-pulse" />
            </div>
            <span className="font-headline font-bold text-xl text-foreground bg-background">
              GlowGlitch
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Dna Lab
            </span>
          </Link>

          {/* Enhanced Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {enhancedNavigationData.map((navItem) => (
              <EnhancedNavigationItem
                key={navItem.id}
                item={navItem}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
              />
            ))}
          </nav>

          {/* Smart Search */}
          <div className="hidden lg:block max-w-xs">
            <SmartSearch 
              variant="dna" 
              placeholder="Search by genetic traits..."
            />
          </div>

          {/* Action Buttons */}
          <ActionButtons 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            setIsQuizModalOpen={setIsQuizModalOpen}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Dna Quiz Modal */}
      <DnaQuizModal 
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
      />
    </EnhancedSmartNavBase>
  )
}

// Enhanced Navigation Item Component
interface EnhancedNavigationItemProps {
  item: typeof enhancedNavigationData[0]
  hoveredItem: string | null
  setHoveredItem: (item: string | null) => void
}

const EnhancedNavigationItem = ({ 
  item, 
  hoveredItem, 
  setHoveredItem 
}: EnhancedNavigationItemProps) => {
  const isHovered = hoveredItem === item.id
  const isGenomeScan = item.id === 'full-genome-scan'
  const isMoissanite = item.id === 'moissanite'
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <Link href={item.href} className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-background/50">
        <SVGIcon 
          svgString={item.icon} 
          className={cn(
            "w-4 h-4 transition-colors",
            isGenomeScan && "text-blue-600 animate-pulse",
            isMoissanite && "text-green-600",
            !isGenomeScan && !isMoissanite && "text-aurora-nav-muted group-hover:text-blue-600"
          )} 
        />
        <span className={cn(
          "text-foreground bg-background font-medium transition-colors text-sm",
          isGenomeScan && "text-blue-700 group-hover:text-blue-800",
          isMoissanite && "text-green-700 group-hover:text-green-800",
          !isGenomeScan && !isMoissanite && "group-hover:text-blue-600"
        )}>
          {item.label}
        </span>
        {item.badge && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            isGenomeScan && "bg-blue-100 text-blue-700",
            isMoissanite && "bg-green-100 text-green-700", 
            !isGenomeScan && !isMoissanite && "bg-muted text-foreground"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
      
      <EnhancedMegaMenu
        item={item}
        isVisible={isHovered}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      />
    </div>
  )
}






// Action Buttons Component
const ActionButtons = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  setIsQuizModalOpen 
}: {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  setIsQuizModalOpen: (open: boolean) => void
}) => {
  const [wishlistCount] = useState(0)
  
  return (
    <div className="flex items-center space-x-3">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Genetic Compatibility Score */}
      <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
        <SVGIcon 
          svgString={enhancedNavigationData[0].icon} 
          className="w-4 h-4 text-green-600 animate-pulse" 
        />
        <span className="text-sm font-bold text-green-600">99.7%</span>
        <span className="text-xs text-aurora-nav-muted">match</span>
      </div>

      {/* Wishlist */}
      <Button variant="ghost" size="icon" asChild>
        <Link href="/wishlist">
          <div className="relative">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
        </Link>
      </Button>

      {/* Smart Cart */}
      <SmartCartIcon />

      {/* Genome Analysis CTA */}
      <Button 
        variant="primary" 
        size="sm" 
        className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        onClick={() => setIsQuizModalOpen(true)}
      >
        <SVGIcon 
          svgString={enhancedNavigationData[0].icon} 
          className="w-4 h-4 mr-2 text-white" 
        />
        Full Genome Scan
      </Button>
    </div>
  )
}

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { userProfile, recommendedProducts } = usePsychProfile()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  if (!isOpen) return null

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const renderAccordionContent = (navItem: typeof enhancedNavigationData[0]) => {
    const isExpanded = expandedSections.has(navItem.id)
    
    if (!isExpanded) return null

    // Mock content for each section - in real app this would come from navItem.subItems or similar
    const getContent = (id: string) => {
      switch (id) {
        case 'full-genome-scan':
          return (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Analysis in Progress</span>
              </div>
              <div className="space-y-2 text-sm text-blue-600">
                <div>• Chromosome mapping: 23/23 complete</div>
                <div>• Molecular sync: 99.7% compatibility</div>
                <div>• Genetic markers: Rare precision type detected</div>
              </div>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                View Detailed Analysis
              </Button>
            </div>
          )
        case 'moissanite':
          return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-background p-2 rounded border">
                  <div className="font-medium text-green-700">Round Cut</div>
                  <div className="text-xs text-aurora-nav-muted">Most popular</div>
                </div>
                <div className="bg-background p-2 rounded border">
                  <div className="font-medium text-green-700">Oval Cut</div>
                  <div className="text-xs text-aurora-nav-muted">Elongated</div>
                </div>
                <div className="bg-background p-2 rounded border">
                  <div className="font-medium text-green-700">Princess Cut</div>
                  <div className="text-xs text-aurora-nav-muted">Square</div>
                </div>
                <div className="bg-background p-2 rounded border">
                  <div className="font-medium text-green-700">Emerald Cut</div>
                  <div className="text-xs text-aurora-nav-muted">Vintage</div>
                </div>
              </div>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                Explore All Cuts
              </Button>
            </div>
          )
        case 'lab-diamonds':
          return (
            <div className="p-4 bg-muted border border-border rounded-lg space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-background rounded border">
                  <span className="text-sm font-medium">Premium Grade (D-F, VVS)</span>
                  <span className="text-xs text-aurora-nav-muted">Flawless</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-background rounded border">
                  <span className="text-sm font-medium">Excellent Grade (G-H, VS)</span>
                  <span className="text-xs text-aurora-nav-muted">Near perfect</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-background rounded border">
                  <span className="text-sm font-medium">Good Grade (I-J, SI)</span>
                  <span className="text-xs text-aurora-nav-muted">Great value</span>
                </div>
              </div>
              <Button size="sm" className="w-full bg-foreground hover:bg-foreground">
                View All Grades
              </Button>
            </div>
          )
        case 'lab-gems':
          return (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Amethyst</span>
                  </div>
                  <span className="text-xs text-aurora-nav-muted">Calming</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Sapphire</span>
                  </div>
                  <span className="text-xs text-aurora-nav-muted">Wisdom</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Ruby</span>
                  </div>
                  <span className="text-xs text-aurora-nav-muted">Passion</span>
                </div>
              </div>
              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                Explore All Gems
              </Button>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="mt-2 overflow-hidden transition-all duration-300 ease-in-out">
        {getContent(navItem.id)}
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Bottom Slide-up Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-background z-50 lg:hidden transform transition-transform duration-300 ease-out translate-y-0 max-h-[80vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="w-full bg-muted py-2 flex justify-center">
          <div className="w-10 h-1 bg-muted-foreground rounded-full"></div>
        </div>

        {/* Advanced Genetic Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 p-4 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <SVGIcon 
                  svgString={enhancedNavigationData[0].icon} 
                  className="w-6 h-6 text-background" 
                />
              </div>
              <div>
                <h3 className="text-foreground bg-background font-semibold text-sm">
                  Genetic Profile: {userProfile.gemstonePersonality?.dnaType || 'Advanced Precision Type'}
                </h3>
                <p className="text-sm text-green-600 bg-background font-bold">
                  Moissanite Compatibility: 99.7%
                </p>
                <p className="text-xs text-aurora-nav-muted bg-background">
                  Rare genetic markers detected • Top 0.3% population
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menu Content - Accordion Layout */}
        <div className="p-4 space-y-4">
          {/* Optimized Genetic Match - Top Priority */}
          <div className="bg-background rounded-xl border border-green-200 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-foreground bg-background font-semibold flex items-center space-x-2">
                <SVGIcon 
                svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' 
                className="w-4 h-4 text-green-600" 
              />
                <span>Genetically Optimized</span>
              </h4>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                99.7%
              </span>
            </div>
            <p className="text-sm text-aurora-nav-muted bg-background mb-2">
              {recommendedProducts[0]?.name || 'Precision Moissanite + Silver Matrix'}
            </p>
            <p className="text-xs text-green-600 bg-background mb-3 font-medium">
              Scientifically matched to your rare genetic markers
            </p>
            <Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-green-600 to-blue-600">
              <SVGIcon 
                svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/></svg>' 
                className="w-4 h-4 mr-2" 
              />
              View Lab Analysis
            </Button>
          </div>

          {/* Navigation Items - Accordion Pattern */}
          <div className="space-y-3">
            <h4 className="text-foreground font-semibold text-sm border-b border-border pb-2">
              Explore Your Genetic Matches
            </h4>
            {enhancedNavigationData.map((navItem) => {
              const isGenomeScan = navItem.id === 'full-genome-scan'
              const isMoissanite = navItem.id === 'moissanite'
              const isExpanded = expandedSections.has(navItem.id)
              
              return (
                <div key={navItem.id} className="bg-background rounded-lg border shadow-sm overflow-hidden">
                  {/* Accordion Header - Clickable */}
                  <button
                    onClick={() => toggleSection(navItem.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors",
                      isGenomeScan && "bg-gradient-to-r from-blue-50 to-green-50 border-blue-200",
                      isMoissanite && "bg-gradient-to-r from-green-50 to-blue-50 border-green-200",
                      !isGenomeScan && !isMoissanite && "border-border"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isGenomeScan && "bg-blue-100",
                        isMoissanite && "bg-green-100",
                        !isGenomeScan && !isMoissanite && "bg-muted"
                      )}>
                        <SVGIcon 
                          svgString={navItem.icon} 
                          className={cn(
                            "w-5 h-5",
                            isGenomeScan && "text-blue-600 animate-pulse",
                            isMoissanite && "text-green-600",
                            !isGenomeScan && !isMoissanite && "text-aurora-nav-muted"
                          )} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground bg-background font-medium text-sm">{navItem.label}</div>
                        {navItem.badge && (
                          <div className={cn(
                            "text-xs font-bold mt-1",
                            isGenomeScan && "text-blue-600",
                            isMoissanite && "text-green-600",
                            !isGenomeScan && !isMoissanite && "text-aurora-nav-muted"
                          )}>
                            {navItem.badge}
                          </div>
                        )}
                        {isGenomeScan && (
                          <div className="text-xs text-blue-500 bg-background mt-1">
                            Real-time genetic compatibility analysis
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "transition-transform duration-200",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}>
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {/* Accordion Content */}
                  {renderAccordionContent(navItem)}
                </div>
              )
            })}
          </div>

          {/* Bottom Padding for Safe Area */}
          <div className="h-4"></div>
        </div>
      </div>
    </>
  )
}

// Advanced Genome Analysis Modal
const DnaQuizModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [analysisStage, setAnalysisStage] = useState(0)
  const stages = [
    'Initializing quantum sequencer...',
    'Analyzing rare genetic markers...',
    'Cross-referencing molecular patterns...',
    'Calculating Moissanite compatibility...',
    'Generating personalized profile...'
  ]

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setAnalysisStage(prev => {
          if (prev >= stages.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground bg-background font-bold text-xl flex items-center space-x-2">
            <SVGIcon 
              svgString={enhancedNavigationData[0].icon} 
              className="w-6 h-6 text-blue-600" 
            />
            <span>Advanced Genome Analysis</span>
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Scientific Progress Display */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Analysis Progress</span>
              <span className="text-sm font-bold text-green-600">
                {Math.round((analysisStage / (stages.length - 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-3 overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 relative"
                style={{ width: `${(analysisStage / (stages.length - 1)) * 100}%` }}
              >
                <div className="absolute inset-0 bg-background opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-aurora-nav-muted bg-background font-medium">
              {stages[analysisStage]}
            </p>
          </div>

          {/* Scientific Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <SVGIcon 
                svgString={enhancedNavigationData[0].icon} 
                className="w-6 h-6 text-blue-600 mx-auto mb-2 animate-spin" 
              />
              <div className="text-xs font-medium text-blue-700">23 Chromosomes</div>
              <div className="text-xs text-blue-600">Sequenced</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <SVGIcon 
                svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/></svg>' 
                className="w-6 h-6 text-green-600 mx-auto mb-2 animate-bounce" 
              />
              <div className="text-xs font-medium text-green-700">Molecular Sync</div>
              <div className="text-xs text-green-600">99.7% Match</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
              <SVGIcon 
                svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6h20M2 12h20M2 18h20"/></svg>' 
                className="w-6 h-6 text-purple-600 mx-auto mb-2" 
              />
              <div className="text-xs font-medium text-purple-700">Spectroscopy</div>
              <div className="text-xs text-purple-600">Complete</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
              <SVGIcon 
                svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' 
                className="w-6 h-6 text-orange-600 mx-auto mb-2" 
              />
              <div className="text-xs font-medium text-orange-700">Validation</div>
              <div className="text-xs text-orange-600">Certified</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-aurora-nav-muted bg-background text-sm">
            Our advanced quantum genetic sequencer analyzes your unique molecular patterns to identify the perfect gemstone compatibility. 
            This scientific process ensures 99.7% accuracy in matching you with Moissanite.
          </p>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 font-medium">
              Preliminary Results: Your genetic markers indicate rare affinity for Silicon Carbide crystal structures and Silver matrices.
            </p>
          </div>
        </div>

        <Button variant="primary" className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700" onClick={onClose}>
          <SVGIcon 
            svgString='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' 
            className="w-4 h-4 mr-2" 
          />
          View Complete Analysis
        </Button>
      </div>
    </div>
  )
}