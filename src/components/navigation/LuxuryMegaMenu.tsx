'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
  TrendingUp,
  Gem,
  Timer,
  Package2
} from 'lucide-react'

interface LuxuryMegaMenuProps {
  activeCategory: string | null
  onClose: () => void
}

export function LuxuryMegaMenu({ activeCategory, onClose }: LuxuryMegaMenuProps) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  useEffect(() => {
    // Simulate loading featured products based on category
    if (activeCategory) {
      setFeaturedProducts(generateFeaturedProducts(activeCategory))
    }
  }, [activeCategory])

  const generateFeaturedProducts = (category: string) => {
    const baseProducts = {
      'Rings': [
        { id: 1, name: 'Classic Solitaire', price: '$2,890', rating: 4.9, reviews: 342, image: '💍', badge: 'Bestseller', oldPrice: '$3,200' },
        { id: 2, name: 'Vintage Halo', price: '$3,450', rating: 4.8, reviews: 287, image: '🔮', badge: 'New' },
        { id: 3, name: 'Modern Band', price: '$1,890', rating: 4.9, reviews: 456, image: '⭐', badge: 'Sale' },
        { id: 4, name: 'Custom Design', price: 'From $2,500', rating: 5.0, reviews: 123, image: '✨', badge: 'Featured' },
        { id: 5, name: 'Eternity Ring', price: '$2,190', rating: 4.8, reviews: 289, image: '🌟', badge: 'Popular' },
        { id: 6, name: 'Promise Ring', price: '$890', rating: 4.7, reviews: 445, image: '💫', badge: 'Trending' }
      ],
      'Necklaces': [
        { id: 7, name: 'Diamond Pendant', price: '$1,650', rating: 4.9, reviews: 278, image: '💎', badge: 'Trending' },
        { id: 8, name: 'Pearl Strand', price: '$890', rating: 4.7, reviews: 189, image: '🔗', badge: 'Classic' },
        { id: 9, name: 'Layered Chain', price: '$1,290', rating: 4.8, reviews: 234, image: '📿', badge: 'New' },
        { id: 10, name: 'Statement Piece', price: '$2,890', rating: 4.9, reviews: 167, image: '🌟', badge: 'Luxury' },
        { id: 11, name: 'Tennis Necklace', price: '$3,190', rating: 4.8, reviews: 203, image: '✨', badge: 'Elite' },
        { id: 12, name: 'Choker Set', price: '$1,450', rating: 4.7, reviews: 334, image: '🎀', badge: 'Trendy' }
      ],
      'Earrings': [
        { id: 13, name: 'Diamond Studs', price: '$1,490', rating: 4.9, reviews: 567, image: '💫', badge: 'Bestseller' },
        { id: 14, name: 'Gold Hoops', price: '$790', rating: 4.8, reviews: 423, image: '⭕', badge: 'Popular' },
        { id: 15, name: 'Drop Earrings', price: '$1,890', rating: 4.7, reviews: 298, image: '💧', badge: 'Elegant' },
        { id: 16, name: 'Ear Climbers', price: '$1,190', rating: 4.8, reviews: 156, image: '🎯', badge: 'Trendy' },
        { id: 17, name: 'Pearl Studs', price: '$690', rating: 4.9, reviews: 412, image: '🦪', badge: 'Classic' },
        { id: 18, name: 'Statement Drops', price: '$2,290', rating: 4.8, reviews: 187, image: '🌙', badge: 'Bold' }
      ],
      'Bracelets': [
        { id: 19, name: 'Tennis Bracelet', price: '$2,890', rating: 4.9, reviews: 234, image: '🎾', badge: 'Classic' },
        { id: 20, name: 'Chain Bracelet', price: '$690', rating: 4.8, reviews: 345, image: '🔗', badge: 'Versatile' },
        { id: 21, name: 'Cuff Bracelet', price: '$1,290', rating: 4.7, reviews: 178, image: '⚡', badge: 'Bold' },
        { id: 22, name: 'Charm Bracelet', price: '$890', rating: 4.9, reviews: 289, image: '🎭', badge: 'Personal' },
        { id: 23, name: 'Bangle Set', price: '$1,590', rating: 4.8, reviews: 256, image: '🌀', badge: 'Set' },
        { id: 24, name: 'Link Bracelet', price: '$2,190', rating: 4.7, reviews: 198, image: '🔄', badge: 'Modern' }
      ]
    }
    return baseProducts[category as keyof typeof baseProducts] || []
  }

  const getCategoryData = (category: string) => {
    const categoryInfo = {
      'Rings': {
        subcategories: ['Engagement', 'Wedding', 'Fashion', 'Men\'s'],
        description: 'Discover our collection of handcrafted rings',
        features: ['Free Ring Sizing', '30-Day Returns', 'Lifetime Warranty', 'Lab Certified'],
        quickLinks: ['Size Guide', 'Custom Design', 'Ring Care', 'Certification']
      },
      'Necklaces': {
        subcategories: ['Pendants', 'Chains', 'Chokers', 'Statement'],
        description: 'Elegant necklaces for every occasion',
        features: ['Adjustable Length', 'Anti-Tarnish', 'Gift Wrapping', 'Layering Guide'],
        quickLinks: ['Length Guide', 'Chain Types', 'Care Tips', 'Styling Ideas']
      },
      'Earrings': {
        subcategories: ['Studs', 'Hoops', 'Drop', 'Climbers'],
        description: 'From everyday studs to statement pieces',
        features: ['Secure Backings', 'Hypoallergenic', 'Matching Sets', 'Piercing Guide'],
        quickLinks: ['Style Guide', 'Ear Care', 'Piercing Info', 'Size Chart']
      },
      'Bracelets': {
        subcategories: ['Tennis', 'Chain', 'Cuff', 'Charm'],
        description: 'Beautiful bracelets to complement any look',
        features: ['Custom Sizing', 'Stackable Sets', 'Repair Service', 'Gift Options'],
        quickLinks: ['Size Guide', 'Stacking Tips', 'Care Guide', 'Personalization']
      },
      'Sustainability': {
        subcategories: [],
        description: 'Our commitment to ethical and sustainable practices',
        features: ['Recycled Metals', 'Lab Diamonds', 'Carbon Neutral', 'Fair Trade'],
        quickLinks: ['Our Mission', 'Certifications', 'Impact Report', 'Learn More']
      }
    }
    return categoryInfo[category as keyof typeof categoryInfo]
  }

  if (!activeCategory) return null

  const categoryData = getCategoryData(activeCategory)
  if (!categoryData) return null

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border z-[60]"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Categories & Quick Links */}
          <div className="col-span-3">
            {/* Category Header */}
            <div className="mb-6">
              <h3 className="text-xl font-headline text-foreground mb-2">{activeCategory}</h3>
              <p className="text-sm text-gray-600 font-body">{categoryData.description}</p>
            </div>

            {/* Subcategories */}
            {categoryData.subcategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3 font-body">Shop by Style</h4>
                <div className="space-y-2">
                  {categoryData.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory}
                      href={`/${activeCategory.toLowerCase()}/${subcategory.toLowerCase()}`}
                      className="block text-sm text-gray-600 hover:text-accent hover:bg-muted px-3 py-2 rounded-lg transition-all duration-200 font-body"
                    >
                      {subcategory}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3 font-body">Quick Links</h4>
              <div className="space-y-2">
                {categoryData.quickLinks.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="block text-sm text-gray-600 hover:text-accent hover:bg-muted px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between font-body"
                  >
                    {link}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <Card className="border bg-accent text-foreground">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2 font-body">
                  <Award className="w-4 h-4" />
                  Why Choose Us
                </h4>
                <div className="space-y-2">
                  {categoryData.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-foreground font-body">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Featured Products */}
          <div className="col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-medium text-foreground font-headline">Featured {activeCategory}</h4>
              <Link 
                href={`/${activeCategory.toLowerCase()}`}
                className="text-sm text-accent hover:text-foreground flex items-center gap-1 font-body"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-md transition-all duration-300 border hover:border-accent">
                  <CardContent className="p-3">
                    {/* Product Image */}
                    <div className="aspect-square bg-muted rounded-lg mb-2 relative overflow-hidden flex items-center justify-center">
                      <div className="text-2xl">{product.image}</div>
                      <Badge 
                        className={cn(
                          "absolute top-1 right-1 text-xs px-1.5 py-0.5",
                          (product.badge === 'Sale' || product.badge === 'Featured' || product.badge === 'Elite') && "bg-cta text-background",
                          (product.badge === 'New' || product.badge === 'Trending' || product.badge === 'Popular') && "bg-accent text-foreground",
                          (product.badge === 'Bestseller' || product.badge === 'Classic' || product.badge === 'Luxury') && "bg-foreground text-background",
                          (product.badge === 'Bold' || product.badge === 'Elegant' || product.badge === 'Personal') && "bg-muted text-foreground",
                          (product.badge === 'Set' || product.badge === 'Modern' || product.badge === 'Versatile') && "border text-foreground"
                        )}
                      >
                        {product.badge}
                      </Badge>
                      
                      {/* Quick Action Buttons */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1">
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-7 w-7 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-7 w-7 p-0">
                          <ShoppingCart className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-tight font-body">
                        {product.name}
                      </h5>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-2 h-2",
                                i < Math.floor(product.rating) 
                                  ? "text-accent fill-current" 
                                  : "text-gray-600"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 font-body">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground font-body">{product.price}</span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-600 line-through font-body">{product.oldPrice}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Promotions & CTA */}
          <div className="col-span-3">
            {/* Trending Now */}
            <Card className="mb-6 border bg-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-foreground" />
                  <h4 className="font-medium text-foreground font-body">Trending Now</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 font-body">
                  Most popular {activeCategory.toLowerCase()} this week
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Shop Trending
                </Button>
              </CardContent>
            </Card>

            {/* Limited Time Offer */}
            <Card className="mb-6 border bg-foreground">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-background" />
                  <h4 className="font-medium text-background font-body">Limited Time</h4>
                </div>
                <p className="text-sm text-background mb-3 font-body">
                  Save 20% on all {activeCategory.toLowerCase()}
                </p>
                <div className="text-xs text-background mb-3 font-body">
                  Ends in 2 days 14h 32m
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  Shop Sale
                </Button>
              </CardContent>
            </Card>

            {/* Custom Design CTA */}
            <Card className="border bg-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="w-4 h-4 text-foreground" />
                  <h4 className="font-medium text-foreground font-body">Custom Design</h4>
                </div>
                <p className="text-sm text-foreground mb-4 font-body">
                  Create a unique piece just for you
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Start Designing
                </Button>
              </CardContent>
            </Card>

            {/* Free Services */}
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3 font-body">Free Services</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-body">
                  <Package2 className="w-4 h-4 text-accent" />
                  <span>Free shipping over $500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-body">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Free resizing & cleaning</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-body">
                  <Award className="w-4 h-4 text-accent" />
                  <span>Lifetime warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}