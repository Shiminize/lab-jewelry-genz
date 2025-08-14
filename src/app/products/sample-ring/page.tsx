'use client'

import React, { useState } from 'react'
import { PageContainer, Section, Flex } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText, MutedText, CTAText } from '@/components/foundation/Typography'
import { ARTryOnCard } from '@/components/ar'

// Static mockup data for visual demonstration
const mockProduct = {
  id: 'eternal-solitaire-ring',
  name: 'Eternal Solitaire Ring',
  price: 2400,
  originalPrice: 2800,
  rating: 4.8,
  reviewCount: 127,
  description: 'A timeless solitaire ring featuring a brilliant lab-grown diamond set in premium recycled gold. This classic design represents eternal love and commitment.',
  specifications: {
    material: 'Recycled 14K Yellow Gold',
    centerStone: 'Lab-Grown Diamond',
    stoneWeight: '1.2 carats',
    stoneClarity: 'VS1',
    stoneColor: 'G',
    ringSize: 'Adjustable (4-9)',
    width: '2.1mm',
    sustainability: '100% Conflict-Free'
  },
  images: [
    '/images/eternal-solitaire-ring.jpg',
    '/images/eternal-solitaire-ring-2.jpg',
    '/images/eternal-solitaire-ring-3.jpg',
    '/images/eternal-solitaire-ring-4.jpg'
  ],
  relatedProducts: [
    { id: '1', name: 'Classic Wedding Band', price: 890, image: '/images/wedding-band.jpg' },
    { id: '2', name: 'Diamond Earrings Set', price: 1200, image: '/images/earrings-set.jpg' },
    { id: '3', name: 'Matching Pendant', price: 950, image: '/images/pendant.jpg' }
  ]
}

const mockReviews = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    title: 'Absolutely stunning!',
    content: 'The quality exceeded my expectations. The diamond sparkles beautifully and the setting is perfectly crafted.',
    helpful: 12
  },
  {
    id: '2',
    author: 'Michael R.',
    rating: 5,
    date: '1 month ago',
    verified: true,
    title: 'Perfect engagement ring',
    content: 'My fiancée loves it! The customization process was smooth and the result is exactly what we wanted.',
    helpful: 8
  },
  {
    id: '3',
    author: 'Jessica L.',
    rating: 4,
    date: '2 months ago',
    verified: true,
    title: 'Beautiful design',
    content: 'Gorgeous ring with excellent craftsmanship. Delivery was prompt and packaging was elegant.',
    helpful: 5
  }
]

export default function ProductDetailPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('6')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'size-guide'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleARWaitlistSignup = async (email: string) => {
    console.log('AR waitlist signup:', email)
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Section>
        <PageContainer>
          <nav className="text-sm text-muted mb-4">
            <span>Home</span> / <span>Rings</span> / <span className="text-foreground">{mockProduct.name}</span>
          </nav>
        </PageContainer>
      </Section>

      {/* Product Detail Section */}
      <Section>
        <PageContainer>
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-background border rounded-lg overflow-hidden relative group">
                <img 
                  src={mockProduct.images[selectedImageIndex]} 
                  alt={mockProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors cursor-zoom-in" />
                <div className="absolute top-4 right-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <span className={isWishlisted ? 'text-error' : 'text-muted'}>
                      ♥
                    </span>
                  </Button>
                </div>
              </div>

              {/* Image Thumbnails */}
              <div className="flex gap-2 overflow-x-auto">
                {mockProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-colors ${
                      selectedImageIndex === index ? 'border-accent' : 'border-border'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* 360° View Button */}
              <Button variant="outline" className="w-full">
                <span className="mr-2">🔄</span>
                360° View (Coming Soon)
              </Button>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <H1>{mockProduct.name}</H1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="text-sm font-medium">{mockProduct.rating}</span>
                  </div>
                  <MutedText size="sm">({mockProduct.reviewCount} reviews)</MutedText>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <CTAText size="lg" className="text-foreground text-2xl">${mockProduct.price.toLocaleString()}</CTAText>
                {mockProduct.originalPrice && (
                  <MutedText size="md" className="line-through text-lg">${mockProduct.originalPrice.toLocaleString()}</MutedText>
                )}
              </div>

              {/* AR Try-On */}
              <ARTryOnCard onWaitlistSignup={handleARWaitlistSignup} />

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <BodyText weight="medium">Ring Size</BodyText>
                  <Button variant="ghost" size="sm" className="text-accent">
                    Size Guide
                  </Button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['4', '5', '6', '7', '8', '9'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-center border rounded transition-colors ${
                        selectedSize === size
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <BodyText weight="medium">Quantity</BodyText>
                <div className="flex items-center gap-3 w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-border rounded flex items-center justify-center hover:bg-border-muted"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-border rounded flex items-center justify-center hover:bg-border-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full">
                  Add to Cart - ${(mockProduct.price * quantity).toLocaleString()}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" size="md">
                    Customize Design
                  </Button>
                  <Button variant="outline" size="md">
                    Request Consultation
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span>Lab-Grown Diamond</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span>Conflict-Free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span>Lifetime Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span>30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Product Details Tabs */}
      <Section>
        <PageContainer>
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'reviews', label: 'Reviews' },
                  { id: 'size-guide', label: 'Size Guide' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <BodyText size="lg">{mockProduct.description}</BodyText>
                  <div className="prose max-w-none">
                    <h4 className="font-semibold mb-3">Why Choose Lab-Grown Diamonds?</h4>
                    <ul className="space-y-2 text-muted">
                      <li>• Ethically sourced with zero environmental impact</li>
                      <li>• Chemically identical to mined diamonds</li>
                      <li>• 30-40% less expensive than traditional diamonds</li>
                      <li>• Certified by leading gemological institutes</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(mockProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-border">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-muted">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <div className="flex items-center gap-8 p-6 bg-border-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockProduct.rating}</div>
                      <div className="text-yellow-400 text-xl">★★★★★</div>
                      <div className="text-sm text-muted">{mockProduct.reviewCount} reviews</div>
                    </div>
                    <div className="flex-1">
                      <Button variant="outline">Write a Review</Button>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.author}</span>
                              {review.verified && (
                                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-yellow-400">★★★★★</div>
                              <span className="text-sm text-muted">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium mb-2">{review.title}</h4>
                        <BodyText className="text-muted mb-3">{review.content}</BodyText>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="text-muted hover:text-foreground">
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'size-guide' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <H3>Ring Size Guide</H3>
                    <BodyText className="text-muted mt-2">
                      Find your perfect fit with our comprehensive sizing guide
                    </BodyText>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <img 
                      src="/images/ring-size-guide.jpg" 
                      alt="Ring Size Guide"
                      className="w-full rounded-lg"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3">How to Measure</h4>
                      <ol className="space-y-2 text-sm text-muted">
                        <li>1. Wrap a string around your finger</li>
                        <li>2. Mark where the string overlaps</li>
                        <li>3. Measure the length with a ruler</li>
                        <li>4. Use our chart to find your size</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Size Chart</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Size 4</span><span>46.8mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size 5</span><span>49.3mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size 6</span><span>51.9mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size 7</span><span>54.4mm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Related Products */}
      <Section background="muted">
        <PageContainer>
          <div className="text-center mb-8">
            <H2>You Might Also Like</H2>
            <BodyText className="text-muted">
              Complete your collection with these complementary pieces
            </BodyText>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {mockProduct.relatedProducts.map((product) => (
              <div key={product.id} className="bg-background rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-border-muted rounded mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <h4 className="font-medium mb-2">{product.name}</h4>
                <div className="text-lg font-semibold text-accent">${product.price.toLocaleString()}</div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Quick View
                </Button>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>
    </div>
  )
}