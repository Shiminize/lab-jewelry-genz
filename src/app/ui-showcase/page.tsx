'use client'

import React from 'react'
import Link from 'next/link'
import { PageContainer, Section } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'

const demoPages = [
  {
    title: '3D Jewelry Customizer',
    description: 'Interactive 3D jewelry customization with material selection, stone configuration, and real-time price updates.',
    url: '/',
    features: ['3D Visualization', 'Material Selection', 'Stone Configuration', 'Price Calculator', 'Save & Share Design'],
    status: '✅ Complete',
    image: '🎨'
  },
  {
    title: 'Product Catalog',
    description: 'Complete product browsing experience with advanced filtering, sorting, and AR integration.',
    url: '/catalog',
    features: ['Advanced Filters', 'Multiple View Modes', 'Wishlist Integration', 'AR Try-On Banner', 'Responsive Grid'],
    status: '✅ Complete',
    image: '🛍️'
  },
  {
    title: 'Product Detail Page',
    description: 'Rich product detail experience with image galleries, specifications, reviews, and size guide.',
    url: '/products/sample-ring',
    features: ['Image Gallery', 'Product Specifications', 'Customer Reviews', 'Size Guide', 'Related Products'],
    status: '✅ UI Complete',
    image: '💍'
  },
  {
    title: 'Shopping Cart System',
    description: 'Complete cart experience with sidebar interface, quantity controls, and checkout flow.',
    url: '/cart-demo',
    features: ['Slide-out Sidebar', 'Quantity Controls', 'Price Calculation', 'Empty/Full States', 'Checkout Integration'],
    status: '✅ UI Complete',
    image: '🛒'
  },
  {
    title: 'Interactive Demo',
    description: 'Full e-commerce experience combining all features with working interactions and state management.',
    url: '/interactive-demo',
    features: ['Live Cart Integration', 'Quick View Modal', 'Success Messages', 'Full Interactivity', 'State Management'],
    status: '✅ Interactive',
    image: '⚡'
  }
]

const upcomingFeatures = [
  {
    title: 'User Authentication',
    description: 'Complete login/register system with social auth and user dashboard',
    features: ['Auth Modals', 'User Dashboard', 'Profile Management', 'Order History'],
    priority: 'P0'
  },
  {
    title: 'Checkout Flow',
    description: 'Multi-step checkout with payment integration and order confirmation',
    features: ['Payment Integration', 'Shipping Options', 'Order Confirmation', 'Email Notifications'],
    priority: 'P0'
  },
  {
    title: 'AR Try-On System',
    description: 'Advanced AR visualization system for virtual jewelry try-on',
    features: ['WebXR Integration', 'Hand Tracking', 'Real-time Rendering', 'Social Sharing'],
    priority: 'P1'
  }
]

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section>
        <PageContainer>
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <H1>GlowGlitch UI Showcase</H1>
            <BodyText size="lg" className="text-muted">
              Complete visual demonstration of the GlowGlitch e-commerce platform. 
              Explore all implemented features and upcoming functionality.
            </BodyText>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <BodyText className="font-medium text-accent mb-2">📋 Visual Confirmation Status</BodyText>
              <BodyText size="sm" className="text-muted">
                Phase 1 UI implementation complete with interactive prototypes. 
                Review all features below before proceeding with backend integration.
              </BodyText>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Current Implementation */}
      <Section>
        <PageContainer>
          <div className="space-y-8">
            <div className="text-center">
              <H2>✅ Implemented Features</H2>
              <BodyText className="text-muted mt-2">
                Interactive UI components ready for your review
              </BodyText>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {demoPages.map((demo, index) => (
                <div key={index} className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{demo.image}</div>
                    <div className="flex-1 space-y-token-md">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <H3>{demo.title}</H3>
                          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                            {demo.status}
                          </span>
                        </div>
                        <BodyText size="sm" className="text-muted">{demo.description}</BodyText>
                      </div>

                      <div className="space-y-token-sm">
                        <MutedText size="sm" className="font-medium">Key Features:</MutedText>
                        <div className="flex flex-wrap gap-2">
                          {demo.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-border-muted text-muted px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link href={demo.url} className="flex-1">
                          <Button variant="primary" size="sm" className="w-full">
                            View Demo
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          📱 Mobile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Design System Overview */}
      <Section background="muted">
        <PageContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <H2>🎨 Design System</H2>
              <BodyText className="text-muted mt-2">
                Consistent design language across all components
              </BodyText>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Colors */}
              <div className="bg-background rounded-lg p-6">
                <H3 className="mb-4">Color Palette</H3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-background border rounded"></div>
                    <span className="text-sm">Ivory Mist</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent rounded"></div>
                    <span className="text-sm">Champagne Gold</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-cta rounded"></div>
                    <span className="text-sm">Coral Gold</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-foreground rounded"></div>
                    <span className="text-sm">Graphite Green</span>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-background rounded-lg p-6">
                <H3 className="mb-4">Typography</H3>
                <div className="space-y-3">
                  <div>
                    <div className="font-headline text-lg">Fraunces</div>
                    <MutedText size="sm">Headlines & Titles</MutedText>
                  </div>
                  <div>
                    <div className="font-body">Inter</div>
                    <MutedText size="sm">Body Text & UI</MutedText>
                  </div>
                  <div className="text-xs text-muted">
                    9 size variants • 3 weight options
                  </div>
                </div>
              </div>

              {/* Components */}
              <div className="bg-background rounded-lg p-6">
                <H3 className="mb-4">Components</H3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Buttons:</span> 5 variants, 4 sizes
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Cards:</span> 3 product variants
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Forms:</span> Consistent inputs
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Layout:</span> Responsive grid system
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Upcoming Features */}
      <Section>
        <PageContainer>
          <div className="space-y-8">
            <div className="text-center">
              <H2>🔮 Phase 2 Roadmap</H2>
              <BodyText className="text-muted mt-2">
                Next features to implement after UI approval
              </BodyText>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <div key={index} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <H3>{feature.title}</H3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.priority === 'P0' 
                        ? 'bg-error/10 text-error' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {feature.priority}
                    </span>
                  </div>
                  
                  <BodyText size="sm" className="text-muted mb-4">
                    {feature.description}
                  </BodyText>
                  
                  <div className="space-y-token-sm">
                    <MutedText size="sm" className="font-medium">Planned Features:</MutedText>
                    <ul className="space-y-1">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted flex items-center gap-2">
                          <span className="w-1 h-1 bg-muted rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Mobile Responsiveness */}
      <Section background="muted">
        <PageContainer>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <H2>📱 Mobile-First Design</H2>
            <BodyText className="text-muted">
              All components are designed mobile-first with responsive breakpoints for optimal user experience across devices.
            </BodyText>
            
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium mb-1">Mobile</div>
                <div className="text-sm text-muted">320px - 640px</div>
                <div className="text-xs text-muted mt-2">Touch-optimized UI</div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl mb-2">💻</div>
                <div className="font-medium mb-1">Desktop</div>
                <div className="text-sm text-muted">1024px+</div>
                <div className="text-xs text-muted mt-2">Rich interactions</div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl mb-2">⌚</div>
                <div className="font-medium mb-1">Accessibility</div>
                <div className="text-sm text-muted">WCAG 2.1 AA</div>
                <div className="text-xs text-muted mt-2">Inclusive design</div>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 mt-8">
              <H3 className="mb-4">Testing Instructions</H3>
              <div className="text-left space-y-3 text-sm text-muted">
                <div>• <strong>Desktop:</strong> Resize browser window to test responsive breakpoints</div>
                <div>• <strong>Mobile:</strong> Use browser dev tools device simulation</div>
                <div>• <strong>Touch:</strong> All interactive elements meet 44px minimum touch target</div>
                <div>• <strong>Performance:</strong> Optimized images and lazy loading implemented</div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Call to Action */}
      <Section>
        <PageContainer>
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <H2>Ready for Review</H2>
            <BodyText className="text-muted">
              All Phase 1 UI components are complete and ready for your approval. 
              Please review each demo page and provide feedback before we proceed with backend implementation.
            </BodyText>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/interactive-demo">
                <Button variant="primary" size="lg">
                  Start Full Demo ⚡
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Approve & Continue to Phase 2
              </Button>
            </div>
            
            <MutedText size="sm">
              Phase 2 will implement backend integration, user authentication, payment processing, and advanced features.
            </MutedText>
          </div>
        </PageContainer>
      </Section>
    </div>
  )
}