'use client'

import { useState } from 'react'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { LuxuryMegaMenu } from '@/components/navigation/LuxuryMegaMenu'
import { MobileLuxuryDrawer } from '@/components/navigation/MobileLuxuryDrawer'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Sparkles, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Award,
  Package2,
  Zap,
  Gem,
  Monitor,
  Smartphone
} from 'lucide-react'

export default function LuxuryNavigationDemo() {
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Container */}
      <div className="relative">
        {/* Luxury Header */}
        <LuxuryHeader
          onMegaMenuOpen={setActiveMegaMenu}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />
        
        {/* Luxury Mega Menu */}
        <LuxuryMegaMenu 
          activeCategory={activeMegaMenu}
          onClose={() => setActiveMegaMenu(null)}
        />
      </div>
      
      {/* Mobile Luxury Drawer */}
      <MobileLuxuryDrawer 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Demo Content */}
      <main id="main-content" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-headline text-foreground mb-6">
            Luxury Navigation Redesign
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience our enhanced navigation system that maintains your current hierarchy while delivering 
            a premium user experience with luxury design elements and conversion optimization.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="outline" className="text-accent border">
              <Sparkles className="w-4 h-4 mr-2" />
              Maintains Current Hierarchy
            </Badge>
            <Badge variant="outline" className="text-foreground border">
              <Award className="w-4 h-4 mr-2" />
              Luxury Design System
            </Badge>
            <Badge variant="outline" className="text-foreground border">
              <Gem className="w-4 h-4 mr-2" />
              Enhanced UX
            </Badge>
          </div>
        </div>

        {/* Current Navigation Hierarchy Display */}
        <Card className="max-w-4xl mx-auto mb-16 border-2 border shadow-xl">
          <CardHeader className="text-center bg-accent">
            <CardTitle className="text-2xl text-foreground font-headline">Current Navigation Maintained</CardTitle>
            <CardDescription>
              Your existing category structure is preserved with enhanced visual presentation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-sm">💍</span>
                  </div>
                  Rings
                </h3>
                <div className="pl-8 space-y-2 text-sm text-gray-600">
                  <div>• Engagement</div>
                  <div>• Wedding</div>
                  <div>• Fashion</div>
                  <div>• Men's</div>
                </div>

                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-sm">📿</span>
                  </div>
                  Necklaces
                </h3>
                <div className="pl-8 space-y-2 text-sm text-gray-600">
                  <div>• Pendants</div>
                  <div>• Chains</div>
                  <div>• Chokers</div>
                  <div>• Statement</div>
                </div>

                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-sm">🌿</span>
                  </div>
                  Sustainability
                </h3>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-sm">✨</span>
                  </div>
                  Earrings
                </h3>
                <div className="pl-8 space-y-2 text-sm text-gray-600">
                  <div>• Studs</div>
                  <div>• Hoops</div>
                  <div>• Drop</div>
                  <div>• Climbers</div>
                </div>

                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-sm">⭐</span>
                  </div>
                  Bracelets
                </h3>
                <div className="pl-8 space-y-2 text-sm text-gray-600">
                  <div>• Tennis</div>
                  <div>• Chain</div>
                  <div>• Cuff</div>
                  <div>• Charm</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle className="text-foreground font-headline">Desktop Experience</CardTitle>
              <CardDescription>
                Enhanced mega menus with product previews and luxury styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Rich mega menus with product imagery</li>
                <li>• Hover effects and micro-interactions</li>
                <li>• Featured products and quick shop</li>
                <li>• Trust signals and social proof</li>
                <li>• Luxury champagne gold design system</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border">
            <CardHeader>
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle className="text-foreground font-headline">Mobile Experience</CardTitle>
              <CardDescription>
                Touch-optimized drawer with smooth animations and quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Full-screen luxury mobile drawer</li>
                <li>• Expandable category sections</li>
                <li>• Quick action bottom navigation</li>
                <li>• Special offers and promotions</li>
                <li>• Touch-optimized interactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border">
            <CardHeader>
              <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-background" />
              </div>
              <CardTitle className="text-foreground font-headline">Conversion Features</CardTitle>
              <CardDescription>
                Strategic elements designed to enhance user engagement and sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Featured product recommendations</li>
                <li>• Limited time offers and urgency</li>
                <li>• Custom design CTAs</li>
                <li>• Trust badges and certifications</li>
                <li>• Social proof and reviews</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo Instructions */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Test the Navigation</CardTitle>
            <CardDescription className="text-center">
              Try out the enhanced navigation features across different devices
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-accent" />
                Desktop Testing
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Hover over "Rings", "Necklaces", "Earrings", or "Bracelets"</li>
                <li>• Explore rich mega menu with product previews</li>
                <li>• Notice luxury styling and smooth animations</li>
                <li>• Test quick shop and wishlist features</li>
                <li>• Try custom design and special offer CTAs</li>
                <li>• Check trust signals and certification badges</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                Mobile Testing
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Tap the hamburger menu icon (☰)</li>
                <li>• Experience full-screen luxury drawer</li>
                <li>• Expand category sections to see subcategories</li>
                <li>• Scroll through special offers and promotions</li>
                <li>• Test quick action buttons at bottom</li>
                <li>• Notice trust signals and why choose us section</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Key Improvements Summary */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-serif text-gray-900 mb-8">Key Improvements</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Luxury Design</h3>
              <p className="text-sm text-gray-600">Premium visual styling with champagne gold accents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Product Discovery</h3>
              <p className="text-sm text-gray-600">Enhanced product previews and quick shop features</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trust Building</h3>
              <p className="text-sm text-gray-600">Reviews, certifications, and authority signals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">User Experience</h3>
              <p className="text-sm text-gray-600">Smooth interactions and intuitive navigation flows</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}