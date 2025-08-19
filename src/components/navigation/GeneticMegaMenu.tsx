'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Dna, 
  Atom, 
  Microscope, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  Eye, 
  Heart,
  Star,
  ChevronRight,
  Beaker,
  Zap,
  Target,
  Award
} from 'lucide-react'

interface GeneticMegaMenuProps {
  onClose: () => void
}

export function GeneticMegaMenu({ onClose }: GeneticMegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState('dna-discovery')
  const [compatibilityScore, setCompatibilityScore] = useState(99.7)
  const [activeStudies, setActiveStudies] = useState(127)

  useEffect(() => {
    const interval = setInterval(() => {
      setCompatibilityScore(prev => Math.min(prev + Math.random() * 0.1, 99.9))
      setActiveStudies(prev => prev + Math.floor(Math.random() * 2))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const categories = {
    'dna-discovery': {
      name: 'DNA Discovery',
      icon: Dna,
      description: 'Genetic Sequencing Analysis',
      compatibility: 99.7,
      color: 'amber',
      products: [
        {
          id: 1,
          name: 'Moissanite Solitaire Ring',
          compatibility: 99.7,
          image: '/api/placeholder/200/200',
          price: '$2,890',
          match: 'Perfect Genetic Match',
          features: ['Silicon Carbide Crystal', 'Your DNA Signature', '2.1ct Equivalent']
        },
        {
          id: 2,
          name: 'Sterling Silver Band',
          compatibility: 98.9,
          image: '/api/placeholder/200/200',
          price: '$790',
          match: 'Exceptional Match',
          features: ['Molecular Compatibility', 'Anti-Tarnish Formula', 'Lifetime Warranty']
        },
        {
          id: 3,
          name: 'Genetic Match Set',
          compatibility: 99.4,
          image: '/api/placeholder/200/200',
          price: '$3,290',
          match: 'Rare Genetic Pair',
          features: ['Coupled Resonance', 'Synchronized Frequency', 'Limited Edition']
        }
      ]
    },
    'lab-results': {
      name: 'Lab Results',
      icon: Beaker,
      description: 'Molecular Diagnostics Center',
      compatibility: 98.9,
      color: 'emerald',
      products: [
        {
          id: 4,
          name: 'Lab-Certified Diamond',
          compatibility: 97.2,
          image: '/api/placeholder/200/200',
          price: '$4,890',
          match: 'Laboratory Verified',
          features: ['IGI Certified', 'Carbon Neutral', 'Ethical Origin']
        },
        {
          id: 5,
          name: 'Molecular Analysis Report',
          compatibility: 100,
          image: '/api/placeholder/200/200',
          price: 'Free',
          match: 'Complete Analysis',
          features: ['23 Gene Markers', 'Peer Reviewed', 'Lifetime Updates']
        }
      ]
    },
    'synthesis': {
      name: 'Custom Synthesis',
      icon: Atom,
      description: 'Precision Atomic Engineering',
      compatibility: 99.1,
      color: 'blue',
      products: [
        {
          id: 6,
          name: 'Custom Moissanite Creation',
          compatibility: 99.8,
          image: '/api/placeholder/200/200',
          price: '$3,990',
          match: 'Genetically Optimized',
          features: ['Atomic Precision', 'Your Exact Specifications', '30-Day Creation']
        }
      ]
    },
    'evolution': {
      name: 'Evolution Tracker',
      icon: TrendingUp,
      description: 'Hereditary Style Mapping',
      compatibility: 96.8,
      color: 'purple',
      products: [
        {
          id: 7,
          name: 'Future Style Prediction',
          compatibility: 95.5,
          image: '/api/placeholder/200/200',
          price: 'Premium',
          match: 'Predictive Analysis',
          features: ['10-Year Forecast', 'Style Evolution', 'Trend Adaptation']
        }
      ]
    }
  }

  const currentCategory = categories[activeCategory as keyof typeof categories]

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-amber-200 z-40"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Navigation */}
          <div className="col-span-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Microscope className="w-4 h-4 text-amber-600" />
                Scientific Categories
              </h3>
              {Object.entries(categories).map(([key, category]) => {
                const Icon = category.icon
                const isActive = activeCategory === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-200 border",
                      isActive 
                        ? "bg-amber-50 border-amber-200 text-amber-900" 
                        : "hover:bg-slate-50 border-transparent text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", isActive ? "text-amber-600" : "text-slate-400")} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-slate-500">{category.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-emerald-600">
                          {category.compatibility.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Scientific Authority Panel */}
            <Card className="mt-6 border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <Shield className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div>
                    <div className="text-lg font-bold text-emerald-700">{activeStudies}</div>
                    <div className="text-xs text-emerald-600">Peer-Reviewed Studies</div>
                  </div>
                  <div className="text-xs text-emerald-700">
                    ISO-9001 Medical Grade Certification
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    <Award className="w-3 h-3 mr-1" />
                    B-Corp Certified
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = currentCategory.icon
                  return <Icon className="w-6 h-6 text-amber-600" />
                })()}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{currentCategory.name}</h2>
                  <p className="text-sm text-slate-600">{currentCategory.description}</p>
                </div>
                <Badge className={cn(
                  "ml-auto",
                  currentCategory.color === 'amber' && "bg-amber-100 text-amber-800",
                  currentCategory.color === 'emerald' && "bg-emerald-100 text-emerald-800",
                  currentCategory.color === 'blue' && "bg-blue-100 text-blue-800",
                  currentCategory.color === 'purple' && "bg-purple-100 text-purple-800"
                )}>
                  <Target className="w-3 h-3 mr-1" />
                  {currentCategory.compatibility.toFixed(1)}% Compatible
                </Badge>
              </div>

              {/* Compatibility Meter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Genetic Compatibility</span>
                  <span className="text-sm font-bold text-emerald-600">{currentCategory.compatibility.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={currentCategory.compatibility} 
                  className="h-2 bg-slate-200"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Average: 67.3%</span>
                  <span>Your Score: Exceptional</span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentCategory.products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-amber-200">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-amber-400" />
                      </div>
                      <Badge 
                        className="absolute top-2 right-2 bg-emerald-500 text-white"
                      >
                        {product.compatibility.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                          <Dna className="w-3 h-3 mr-1" />
                          {product.match}
                        </Badge>
                      </div>

                      <div className="text-lg font-bold text-slate-900">{product.price}</div>
                      
                      <ul className="text-xs text-slate-600 space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-amber-400 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600">
                          <Eye className="w-3 h-3 mr-1" />
                          View Match
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-300">
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            {/* Genetic Profile Summary */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 mb-6">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-700">{compatibilityScore.toFixed(1)}%</div>
                    <div className="text-sm text-amber-600">Overall Genetic Match</div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    <Star className="w-3 h-3 mr-1" />
                    Rare Genetic Profile
                  </Badge>
                  <p className="text-xs text-amber-700">
                    You're in the top 0.3% of the population with exceptional Moissanite compatibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
              
              <Button className="w-full justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Claim Your Genetic Match
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button variant="outline" className="w-full justify-between border-amber-200 text-amber-700 hover:bg-amber-50">
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4" />
                  Full Lab Report
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button variant="outline" className="w-full justify-between border-slate-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Evolution Forecast
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Social Proof */}
            <Card className="mt-6 border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Genetic Matches</h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Sarah K. claimed her 99.4% match 2 min ago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Marcus L. started genetic analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>127 people viewing genetic results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}