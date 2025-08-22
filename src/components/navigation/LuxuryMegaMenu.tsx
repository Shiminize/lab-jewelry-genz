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
  Package2,
  Palette,
  Recycle,
  HeadphonesIcon
} from 'lucide-react'
import { useNavigation } from '@/contexts/NavigationProvider'
import { getNavigationItem, FEATURED_CONTENT } from '@/lib/navigation/NavigationConfig'

interface LuxuryMegaMenuProps {
  activeCategory: string | null
  onClose: () => void
}

export function LuxuryMegaMenu({ activeCategory, onClose }: LuxuryMegaMenuProps) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const { config } = useNavigation()

  useEffect(() => {
    // Load featured content based on active category
    if (activeCategory) {
      setFeaturedProducts(generateFeaturedContent(activeCategory))
    }
  }, [activeCategory])

  const generateFeaturedContent = (categoryId: string) => {
    const featuredItems = {
      'shop': [
        { id: 1, name: 'Lab Diamond Solitaire', price: '$2,890', rating: 4.9, reviews: 342, image: '💍', badge: 'Bestseller', category: 'rings' },
        { id: 2, name: 'Layered Gold Chain', price: '$1,290', rating: 4.8, reviews: 234, image: '📿', badge: 'Trending', category: 'necklaces' },
        { id: 3, name: 'Diamond Studs', price: '$1,490', rating: 4.9, reviews: 567, image: '💫', badge: 'Classic', category: 'earrings' },
        { id: 4, name: 'Tennis Bracelet', price: '$2,890', rating: 4.9, reviews: 234, image: '🎾', badge: 'Luxury', category: 'bracelets' },
        { id: 5, name: 'Custom Engagement Ring', price: 'From $2,500', rating: 5.0, reviews: 123, image: '✨', badge: 'Featured', category: 'rings' },
        { id: 6, name: 'Statement Hoops', price: '$790', rating: 4.8, reviews: 423, image: '⭕', badge: 'Popular', category: 'earrings' }
      ],
      'create': [
        { id: 11, name: '3D Ring Designer', price: 'Free Tool', rating: 4.9, reviews: 892, image: '🎨', badge: 'Popular', category: 'customizer' },
        { id: 12, name: 'Engraving Service', price: 'From $50', rating: 4.8, reviews: 456, image: '✍️', badge: 'Personal', category: 'personalization' },
        { id: 13, name: 'Custom Wedding Set', price: 'From $3,500', rating: 5.0, reviews: 234, image: '💕', badge: 'Luxury', category: 'custom-orders' },
        { id: 14, name: 'Name Necklace', price: 'From $150', rating: 4.7, reviews: 678, image: '🏷️', badge: 'Trending', category: 'personalization' },
        { id: 15, name: 'Birthstone Ring', price: 'From $400', rating: 4.8, reviews: 345, image: '🌈', badge: 'Classic', category: 'customizer' },
        { id: 16, name: 'Photo Locket', price: 'From $200', rating: 4.9, reviews: 567, image: '📸', badge: 'Meaningful', category: 'personalization' }
      ],
      'impact': [
        { id: 21, name: 'Lab-Grown Diamond', price: '70% Savings', rating: 5.0, reviews: 1234, image: '🌱', badge: 'Sustainable', category: 'sustainability' },
        { id: 22, name: 'Recycled Gold', price: 'Same Beauty', rating: 4.9, reviews: 789, image: '♻️', badge: 'Eco-Friendly', category: 'sustainability' },
        { id: 23, name: 'Creator Partnership', price: 'Earn 15%', rating: 4.8, reviews: 456, image: '🤝', badge: 'Rewarding', category: 'creators' },
        { id: 24, name: 'Carbon Neutral Shipping', price: 'Free', rating: 4.9, reviews: 2345, image: '🌍', badge: 'Green', category: 'sustainability' },
        { id: 25, name: 'Ethical Sourcing', price: '100% Certified', rating: 5.0, reviews: 3456, image: '✅', badge: 'Verified', category: 'ethics' },
        { id: 26, name: 'Community Impact', price: '1M+ Trees', rating: 4.9, reviews: 5678, image: '🌳', badge: 'Impact', category: 'sustainability' }
      ],
      'support': [
        { id: 31, name: 'Perfect Fit Guide', price: 'Free', rating: 4.9, reviews: 2345, image: '📏', badge: 'Essential', category: 'sizing' },
        { id: 32, name: 'Jewelry Care Kit', price: '$25', rating: 4.8, reviews: 1234, image: '🧼', badge: 'Popular', category: 'care' },
        { id: 33, name: 'Lifetime Warranty', price: 'Included', rating: 5.0, reviews: 4567, image: '🛡️', badge: 'Premium', category: 'quality' },
        { id: 34, name: '24/7 Expert Help', price: 'Free', rating: 4.9, reviews: 3456, image: '💬', badge: 'Support', category: 'help' },
        { id: 35, name: 'Free Resizing', price: 'Forever', rating: 4.8, reviews: 2345, image: '🔄', badge: 'Service', category: 'sizing' },
        { id: 36, name: 'Professional Cleaning', price: '$15', rating: 4.9, reviews: 1789, image: '✨', badge: 'Care', category: 'care' }
      ]
    }
    return featuredItems[categoryId as keyof typeof featuredItems] || []
  }

  const getCategoryContent = (categoryId: string) => {
    if (!categoryId) return null
    
    // Get category data from NavigationConfig
    const categoryItem = getNavigationItem(categoryId)
    if (!categoryItem) return null

    // Get featured content for this category
    const featuredContent = FEATURED_CONTENT[categoryId as keyof typeof FEATURED_CONTENT]

    return {
      ...categoryItem,
      featuredContent,
      subcategories: categoryItem.children || [],
      quickLinks: getQuickLinksForCategory(categoryId),
      features: getFeaturesForCategory(categoryId)
    }
  }

  const getQuickLinksForCategory = (categoryId: string) => {
    const quickLinks = {
      'shop': ['New Arrivals', 'Bestsellers', 'Sale Items', 'Gift Guide'],
      'create': ['3D Designer', 'Style Quiz', 'Inspiration Gallery', 'Expert Consultation'],
      'impact': ['Sustainability Report', 'Certifications', 'Community Impact', 'Partner Programs'],
      'support': ['Size Guide', 'Care Instructions', 'Warranty Info', 'Contact Support']
    }
    return quickLinks[categoryId as keyof typeof quickLinks] || []
  }

  const getFeaturesForCategory = (categoryId: string) => {
    const features = {
      'shop': ['Free Shipping $500+', '30-Day Returns', 'Lab Certified Diamonds', 'Lifetime Warranty'],
      'create': ['Free 3D Preview', 'Expert Guidance', 'Unlimited Revisions', 'Rush Orders Available'],
      'impact': ['Carbon Neutral', '70% Cost Savings', 'Ethical Sourcing', '1% Donated to Ocean Cleanup'],
      'support': ['24/7 Expert Help', 'Free Resizing Forever', 'Professional Cleaning', 'Repair Services']
    }
    return features[categoryId as keyof typeof features] || []
  }

  if (!activeCategory) return null

  const categoryData = getCategoryContent(activeCategory)
  if (!categoryData) return null

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-border z-[60]"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Categories & Quick Links */}
          <div className="col-span-3">
            {/* Category Header */}
            <div className="mb-6">
              <h3 className="text-xl font-headline text-foreground mb-2">{categoryData.label}</h3>
              <p className="text-sm text-foreground/70 font-body">{categoryData.metadata?.description}</p>
            </div>

            {/* Subcategories */}
            {categoryData.subcategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3 font-body">
                  {activeCategory === 'shop' ? 'Shop by Category' : 'Explore'}
                </h4>
                <div className="space-y-2">
                  {categoryData.subcategories.map((subcategory: any) => (
                    <Link
                      key={subcategory.id}
                      href={subcategory.href}
                      className="block text-sm text-foreground/70 hover:text-accent hover:bg-muted px-3 py-2 rounded-lg transition-all duration-200 font-body"
                    >
                      {subcategory.metadata?.genZLabel || subcategory.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3 font-body">Quick Links</h4>
              <div className="space-y-2">
                {categoryData.quickLinks.map((link: string) => (
                  <Link
                    key={link}
                    href="#"
                    className="block text-sm text-foreground/70 hover:text-accent hover:bg-muted px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between font-body"
                  >
                    {link}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Features - CLAUDE_RULES: bg-accent text-foreground */}
            <Card className="border bg-accent text-foreground">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2 font-body">
                  <Award className="w-4 h-4" />
                  Why Choose Us
                </h4>
                <div className="space-y-2">
                  {categoryData.features.map((feature: string) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-foreground font-body">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Featured Content */}
          <div className="col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-medium text-foreground font-headline">
                {activeCategory === 'shop' ? 'Featured Products' : 
                 activeCategory === 'create' ? 'Design Tools' :
                 activeCategory === 'impact' ? 'Our Impact' : 'Support Resources'}
              </h4>
              <Link 
                href={categoryData.href}
                className="text-sm text-accent hover:text-foreground flex items-center gap-1 font-body"
              >
                {activeCategory === 'shop' ? 'Shop All' : 'Learn More'} <ArrowRight className="w-3 h-3" />
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

          {/* Right Column - Category-Specific CTAs */}
          <div className="col-span-3">
            {/* Primary CTA */}
            <Card className="mb-6 border bg-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {activeCategory === 'shop' && <TrendingUp className="w-4 h-4 text-foreground" />}
                  {activeCategory === 'create' && <Palette className="w-4 h-4 text-foreground" />}
                  {activeCategory === 'impact' && <Recycle className="w-4 h-4 text-foreground" />}
                  {activeCategory === 'support' && <HeadphonesIcon className="w-4 h-4 text-foreground" />}
                  <h4 className="font-medium text-foreground font-body">
                    {activeCategory === 'shop' && 'Trending Now'}
                    {activeCategory === 'create' && '3D Designer'}
                    {activeCategory === 'impact' && 'Sustainability'}
                    {activeCategory === 'support' && 'Expert Help'}
                  </h4>
                </div>
                <p className="text-sm text-foreground/70 mb-3 font-body">
                  {activeCategory === 'shop' && 'Most popular items this week'}
                  {activeCategory === 'create' && 'Design your perfect piece in 3D'}
                  {activeCategory === 'impact' && 'Lab-grown diamonds save 70%'}
                  {activeCategory === 'support' && 'Get help from jewelry experts'}
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  {activeCategory === 'shop' && 'Shop Trending'}
                  {activeCategory === 'create' && 'Start Designing'}
                  {activeCategory === 'impact' && 'Learn More'}
                  {activeCategory === 'support' && 'Get Help'}
                </Button>
              </CardContent>
            </Card>

            {/* Featured Promotion - CLAUDE_RULES: bg-foreground text-background */}
            <Card className="mb-6 border bg-foreground">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-background" />
                  <h4 className="font-medium text-background font-body">Special Offer</h4>
                </div>
                <p className="text-sm text-background mb-3 font-body">
                  {activeCategory === 'shop' && 'Save 20% on all jewelry'}
                  {activeCategory === 'create' && 'Free 3D design consultation'}
                  {activeCategory === 'impact' && 'Plant a tree with every order'}
                  {activeCategory === 'support' && 'Free lifetime maintenance'}
                </p>
                <div className="text-xs text-background mb-3 font-body">
                  {activeCategory === 'support' ? 'Always included' : 'Limited time offer'}
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  {activeCategory === 'shop' && 'Shop Sale'}
                  {activeCategory === 'create' && 'Book Call'}
                  {activeCategory === 'impact' && 'Shop Sustainable'}
                  {activeCategory === 'support' && 'Learn More'}
                </Button>
              </CardContent>
            </Card>

            {/* Action CTA - CLAUDE_RULES: bg-accent text-foreground */}
            <Card className="border bg-accent text-foreground">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="w-4 h-4 text-foreground" />
                  <h4 className="font-medium text-foreground font-body">
                    {activeCategory === 'shop' && 'Custom Design'}
                    {activeCategory === 'create' && 'Style Quiz'}
                    {activeCategory === 'impact' && 'Join Movement'}
                    {activeCategory === 'support' && 'Live Chat'}
                  </h4>
                </div>
                <p className="text-sm text-foreground mb-4 font-body">
                  {activeCategory === 'shop' && 'Create a unique piece just for you'}
                  {activeCategory === 'create' && 'Find your perfect style in 2 minutes'}
                  {activeCategory === 'impact' && 'Be part of the sustainable jewelry revolution'}
                  {activeCategory === 'support' && 'Talk to an expert right now'}
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {activeCategory === 'shop' && 'Start Designing'}
                  {activeCategory === 'create' && 'Take Quiz'}
                  {activeCategory === 'impact' && 'Learn Impact'}
                  {activeCategory === 'support' && 'Start Chat'}
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