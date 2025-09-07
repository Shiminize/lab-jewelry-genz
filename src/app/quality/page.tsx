'use client'

import React, { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface RegistrationForm {
  orderNumber: string
  email: string
  firstName: string
  lastName: string
  purchaseDate: string
  productName: string
  productType: string
}

export default function QualityPage() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<RegistrationForm>({
    orderNumber: '',
    email: '',
    firstName: '',
    lastName: '',
    purchaseDate: '',
    productName: '',
    productType: ''
  })

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-accent" />
              <h1 className="text-4xl font-headline text-foreground mb-6">
                You're All Set!
              </h1>
              <p className="text-xl text-aurora-nav-muted mb-8">
                Your warranty is now active. We've sent confirmation details to {formData.email}. 
                Screenshot this page or save that email – you might need it later.
              </p>
              <div className="bg-background p-6 rounded-lg border border-border mb-8">
                <h3 className="text-lg font-headline text-foreground mb-4">Your Warranty Details</h3>
                <div className="text-left text-aurora-nav-muted space-y-token-sm">
                  <p><strong>Order:</strong> {formData.orderNumber}</p>
                  <p><strong>Product:</strong> {formData.productName}</p>
                  <p><strong>Coverage:</strong> 2 years from purchase</p>
                  <p><strong>Status:</strong> Active ✅</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/'}
              >
                Back to Shopping
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-headline mb-6 text-foreground">
              Protect Your Investment
            </h1>
            <p className="text-xl text-aurora-nav-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Register your warranty in 2 minutes. If we messed up, we'll fix it. 
              2 years, no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Coverage */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
              What's Covered
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-background p-6 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-lg font-headline text-foreground mb-3">Manufacturing Issues</h3>
                <p className="text-aurora-nav-muted">Stones falling out, prongs breaking, weird discoloration – basically if it's our fault</p>
              </div>

              <div className="bg-background p-6 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📐</span>
                </div>
                <h3 className="text-lg font-headline text-foreground mb-3">Sizing Issues</h3>
                <p className="text-aurora-nav-muted">Wrong size? No worries. One free resize within 60 days (some complex designs have limits)</p>
              </div>

              <div className="bg-background p-6 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-lg font-headline text-foreground mb-3">Stone Quality</h3>
                <p className="text-aurora-nav-muted">Chips, cracks, or cloudiness that wasn't there when you got it? We'll make it right</p>
              </div>
            </div>

            <div className="bg-muted text-foreground p-6 rounded-lg">
              <h3 className="text-lg font-headline text-foreground mb-3">Not Covered (Just Being Honest)</h3>
              <div className="text-aurora-nav-muted space-y-1">
                <p>• Normal wear and tear (scratches from daily life)</p>
                <p>• Damage from accidents or rough treatment</p>
                <p>• Loss or theft (get insurance for that)</p>
                <p>• Changes in personal taste (we get it, but that's not our fault)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-muted text-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
              Register Your Warranty
            </h2>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= num 
                        ? 'bg-accent text-foreground' 
                        : 'bg-background text-aurora-nav-muted'
                    }`}>
                      {num}
                    </div>
                    {num < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step > num ? 'bg-accent' : 'bg-background'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-background p-8 rounded-lg border border-border">
              {/* Step 1: Order Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-headline text-foreground mb-4">Order Information</h3>
                  
                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-foreground mb-2">
                      Order Number
                    </label>
                    <Input
                      id="orderNumber"
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                      placeholder="Like #12345 or GLW-2024-001"
                      required
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Check your email confirmation or receipt</p>
                  </div>

                  <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-foreground mb-2">
                      When did you buy it?
                    </label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="button" 
                    onClick={nextStep}
                    variant="primary" 
                    className="w-full"
                    disabled={!formData.orderNumber || !formData.purchaseDate}
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-headline text-foreground mb-4">Your Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="where@youcheck.email"
                      required
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">We'll send your warranty confirmation here</p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="secondary" 
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      variant="primary" 
                      className="flex-1"
                      disabled={!formData.firstName || !formData.lastName || !formData.email}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Product Information */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-headline text-foreground mb-4">About Your Jewelry</h3>
                  
                  <div>
                    <label htmlFor="productType" className="block text-sm font-medium text-foreground mb-2">
                      What did you buy?
                    </label>
                    <select
                      id="productType"
                      value={formData.productType}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      required
                    >
                      <option value="">Choose one</option>
                      <option value="ring">Ring</option>
                      <option value="necklace">Necklace</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelet">Bracelet</option>
                      <option value="custom">Custom Piece</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-foreground mb-2">
                      Product Name
                    </label>
                    <Input
                      id="productName"
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Like 'Classic Solitaire' or whatever it was called"
                      required
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Check your order confirmation if you're not sure</p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="secondary" 
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      variant="primary" 
                      className="flex-1"
                      disabled={!formData.productType || !formData.productName}
                    >
                      Register Warranty
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Contact for Warranty */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-headline text-foreground mb-4">
              Questions About Your Warranty?
            </h2>
            <p className="text-aurora-nav-muted mb-6">
              Need to make a claim or have questions about coverage? 
              We're here to help.
            </p>
            <div className="space-y-token-sm text-aurora-nav-muted">
              <p><strong>Email:</strong> warranty@glowglitch.com</p>
              <p><strong>Response time:</strong> Within 24 hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}