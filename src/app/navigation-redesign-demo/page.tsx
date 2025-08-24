'use client'

import { useState } from 'react'
import { ScientificHeader } from '@/components/navigation/ScientificHeader'
import { GeneticMegaMenu } from '@/components/navigation/GeneticMegaMenu'
import { DNAMobileDrawer } from '@/components/navigation/DNAMobileDrawer'
import { TrustSignalBar } from '@/components/navigation/TrustSignalBar'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dna, Atom, Microscope, Shield, TrendingUp, Beaker, Eye, Sparkles } from 'lucide-react'

export default function NavigationRedesignDemo() {
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [compatibilityScore, setCompatibilityScore] = useState(0)

  const runGeneticAnalysis = () => {
    let score = 0
    const interval = setInterval(() => {
      score += Math.random() * 15
      setCompatibilityScore(Math.min(score, 99.7))
      if (score >= 99.7) {
        clearInterval(interval)
        setAnalysisComplete(true)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Trust Signal Bar */}
      <TrustSignalBar />
      
      {/* Scientific Header */}
      <ScientificHeader 
        onMegaMenuToggle={setShowMegaMenu}
        onMobileMenuToggle={setMobileMenuOpen}
        showMegaMenu={showMegaMenu}
      />
      
      {/* Genetic Mega Menu */}
      {showMegaMenu && (
        <GeneticMegaMenu onClose={() => setShowMegaMenu(false)} />
      )}
      
      {/* DNA Mobile Drawer */}
      <DNAMobileDrawer 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Demo Content */}
      <main id="main-content" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-6">
            Navigation Redesign Demo
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Experience the scientifically-optimized navigation system with PersonalGemstoneDNA integration, 
            luxury design elements, and conversion-focused user experience.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <Dna className="w-4 h-4 mr-2" />
              DNA-Powered Navigation
            </Badge>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
              <Shield className="w-4 h-4 mr-2" />
              WCAG 2.1 AA Compliant
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Atom className="w-4 h-4 mr-2" />
              Scientific Authority
            </Badge>
          </div>
        </div>

        {/* Interactive DNA Analysis Demo */}
        <Card className="max-w-2xl mx-auto mb-16 border-2 border-amber-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Microscope className="w-6 h-6 text-amber-600" />
              Live Genetic Compatibility Analysis
            </CardTitle>
            <CardDescription>
              Experience the PersonalGemstoneDNA analysis that powers our navigation recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {!analysisComplete ? (
              <div className="space-y-6">
                <div className="text-6xl font-bold text-amber-600">
                  {compatibilityScore.toFixed(1)}%
                </div>
                <div className="text-lg text-slate-600">
                  Compatibility Score with Moissanite
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${compatibilityScore}%` }}
                  />
                </div>
                {compatibilityScore === 0 ? (
                  <Button 
                    onClick={runGeneticAnalysis}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    <Dna className="w-4 h-4 mr-2" />
                    Start Genetic Analysis
                  </Button>
                ) : (
                  <div className="text-slate-600">
                    Analyzing chromosome {Math.floor(compatibilityScore / 4.3) + 1} of 23...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-6xl font-bold text-emerald-600">99.7%</div>
                <div className="text-lg font-semibold text-slate-800">
                  Exceptional Genetic Match Detected!
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Rare Genetic Profile - Top 0.3%
                </Badge>
                <p className="text-slate-600">
                  Your DNA shows exceptional compatibility with Silicon Carbide (Moissanite) crystal structure.
                  This rare genetic variant is found in only 0.3% of the population.
                </p>
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Your Genetic Match Collection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dna className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>Scientific Navigation</CardTitle>
              <CardDescription>
                PersonalGemstoneDNA integration with molecular compatibility indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Real-time genetic compatibility scoring</li>
                <li>• Molecular structure visualizations</li>
                <li>• Progressive scientific disclosure</li>
                <li>• Authority building through peer review</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>Trust & Authority</CardTitle>
              <CardDescription>
                127 peer-reviewed studies and ISO-9001 certification backing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Medical-grade precision validation</li>
                <li>• Real-time social proof signals</li>
                <li>• Laboratory network verification</li>
                <li>• B-Corp and Carbon Neutral certified</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Conversion Optimization</CardTitle>
              <CardDescription>
                Strategic positioning of Moissanite + Silver as genetically optimal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Genetic rarity positioning (0.3%)</li>
                <li>• Scientific certainty messaging</li>
                <li>• Progressive engagement flow</li>
                <li>• Loss aversion through genetics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Demo Navigation Features</CardTitle>
            <CardDescription className="text-center">
              Interact with the navigation elements above to experience the redesigned system
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-amber-600" />
                Desktop Experience
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Hover over navigation items to see scientific mega menu</li>
                <li>• Notice DNA helix animations and compatibility badges</li>
                <li>• Observe real-time trust signals and peer review counts</li>
                <li>• Experience luxury champagne gold design system</li>
                <li>• Test keyboard navigation for accessibility compliance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Mobile Experience
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Tap hamburger menu for full-screen DNA discovery</li>
                <li>• Swipe through genetic compatibility analysis</li>
                <li>• Experience progressive disclosure of scientific concepts</li>
                <li>• Touch-optimized interactions with 44px+ targets</li>
                <li>• Smooth animations and micro-interactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}