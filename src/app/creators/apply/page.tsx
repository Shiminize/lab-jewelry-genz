'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
// Note: Using basic textarea element since Textarea component doesn't exist
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Users, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface ApplicationFormData {
  displayName: string
  email: string
  bio: string
  socialLinks: {
    instagram: string
    tiktok: string
    youtube: string
    twitter: string
    website: string
  }
  paymentInfo: {
    method: 'paypal' | 'bank' | 'stripe'
    details: string
  }
  requestedCommissionRate: number
  audience: {
    size: string
    demographics: string
    engagement: string
  }
  content: {
    type: string
    frequency: string
    platforms: string[]
  }
  agreedToTerms: boolean
}

export default function CreatorApplicationPage() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    displayName: '',
    email: '',
    bio: '',
    socialLinks: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      website: ''
    },
    paymentInfo: {
      method: 'paypal',
      details: ''
    },
    requestedCommissionRate: 15,
    audience: {
      size: '',
      demographics: '',
      engagement: ''
    },
    content: {
      type: '',
      frequency: '',
      platforms: []
    },
    agreedToTerms: false
  })

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [applicationResult, setApplicationResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('submitting')

    try {
      const response = await fetch('/api/creators/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setApplicationResult(result.data.creator)
        setSubmitMessage(result.message)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error?.message || 'Application submission failed')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please try again.')
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ApplicationFormData],
        [field]: value
      }
    }))
  }

  // Success screen
  if (submitStatus === 'success' && applicationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-lg text-gray-600">{submitMessage}</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Application ID</label>
                  <p className="font-mono text-sm">{applicationResult.applicationId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Creator Code</label>
                  <p className="font-bold text-purple-600">{applicationResult.creatorCode}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={applicationResult.status === 'approved' ? 'default' : 'secondary'}>
                    {applicationResult.status === 'approved' ? 'APPROVED' : 'PENDING REVIEW'}
                  </Badge>
                  {applicationResult.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Review Timeline</label>
                <p className="text-sm text-gray-700">{applicationResult.estimatedReviewTime}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Next Steps</label>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {applicationResult.nextSteps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Important Information</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Check your email for further instructions</li>
                  <li>• Save your Creator Code: <span className="font-mono font-bold">{applicationResult.creatorCode}</span></li>
                  <li>• Join our creator community Discord for updates</li>
                  {applicationResult.status === 'approved' && (
                    <li>• <strong>Your creator dashboard is ready!</strong> <a href="/creators/dashboard" className="text-purple-600 underline">Access it here</a></li>
                  )}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/creators/status?code=' + applicationResult.creatorCode}
                  className="flex-1"
                >
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join the Creator Program</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn industry-leading commissions promoting jewelry that aligns with your values. 
            Join 1,200+ creators earning an average of $850/month.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Up to 20% Commission</h3>
              <p className="text-sm text-gray-600">Industry-leading rates based on performance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Track performance and optimize your content</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Creator Community</h3>
              <p className="text-sm text-gray-600">Connect with like-minded creators</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Creator Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => updateFormData('displayName', e.target.value)}
                      placeholder="Your creator name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (Max 500 characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    placeholder="Tell us about yourself and your content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social Media Presence</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <Input
                      value={formData.socialLinks.instagram}
                      onChange={(e) => updateNestedFormData('socialLinks', 'instagram', e.target.value)}
                      placeholder="@username or profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                    <Input
                      value={formData.socialLinks.tiktok}
                      onChange={(e) => updateNestedFormData('socialLinks', 'tiktok', e.target.value)}
                      placeholder="@username or profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                    <Input
                      value={formData.socialLinks.youtube}
                      onChange={(e) => updateNestedFormData('socialLinks', 'youtube', e.target.value)}
                      placeholder="Channel name or URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <Input
                      type="url"
                      value={formData.socialLinks.website}
                      onChange={(e) => updateNestedFormData('socialLinks', 'website', e.target.value)}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>

              {/* Audience Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Audience Information</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follower Count</label>
                    <Input
                      value={formData.audience.size}
                      onChange={(e) => updateNestedFormData('audience', 'size', e.target.value)}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demographics</label>
                    <Input
                      value={formData.audience.demographics}
                      onChange={(e) => updateNestedFormData('audience', 'demographics', e.target.value)}
                      placeholder="e.g., Gen-Z fashion enthusiasts"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Rate</label>
                    <Input
                      value={formData.audience.engagement}
                      onChange={(e) => updateNestedFormData('audience', 'engagement', e.target.value)}
                      placeholder="e.g., 7.2%"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={formData.paymentInfo.method}
                      onChange={(e) => updateNestedFormData('paymentInfo', 'method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="stripe">Stripe Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested Commission Rate (%)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="20"
                      value={formData.requestedCommissionRate}
                      onChange={(e) => updateFormData('requestedCommissionRate', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard rates: 10-20% based on performance</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Details * 
                  </label>
                  <Input
                    value={formData.paymentInfo.details}
                    onChange={(e) => updateNestedFormData('paymentInfo', 'details', e.target.value)}
                    placeholder={
                      formData.paymentInfo.method === 'paypal' ? 'PayPal email address' :
                      formData.paymentInfo.method === 'bank' ? 'Bank account details' :
                      'Stripe account email'
                    }
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => updateFormData('agreedToTerms', e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/creator-terms" className="text-purple-600 underline" target="_blank">
                      Creator Program Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-purple-600 underline" target="_blank">
                      Privacy Policy
                    </a>
                    . I understand that my application will be reviewed and I may be contacted for additional information.
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-gray-200">
                {submitStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-700">{submitMessage}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={submitStatus === 'submitting' || !formData.agreedToTerms}
                >
                  {submitStatus === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Your application will be reviewed within 2-3 business days. 
                  High-engagement creators may be auto-approved.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}