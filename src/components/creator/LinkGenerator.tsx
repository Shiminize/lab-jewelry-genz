'use client'

/**
 * Link Generator Component
 * Allows creators to generate referral links for products and pages
 */

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Link2,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Sparkles
} from 'lucide-react'

interface LinkGeneratorProps {
  creatorCode: string
}

interface GeneratedLink {
  id: string
  linkCode: string
  shortUrl: string
  originalUrl: string
  title?: string
  description?: string
  isActive: boolean
  createdAt: string
}

export default function LinkGenerator({ creatorCode }: LinkGeneratorProps) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // UTM Parameters
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null)
  const [copiedLink, setCopiedLink] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Predefined quick links
  const quickLinks = [
    { label: 'Homepage', url: '/', icon: '🏠' },
    { label: 'All Products', url: '/products', icon: '💎' },
    { label: 'Rings', url: '/products?category=rings', icon: '💍' },
    { label: 'Necklaces', url: '/products?category=necklaces', icon: '📿' },
    { label: 'Earrings', url: '/products?category=earrings', icon: '✨' },
    { label: 'Bracelets', url: '/products?category=bracelets', icon: '🔗' },
  ]

  const handleGenerateLink = async () => {
    if (!originalUrl.trim()) return

    try {
      setIsGenerating(true)

      const requestData = {
        originalUrl: originalUrl.startsWith('http') 
          ? originalUrl 
          : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://glowglitch.com'}${originalUrl}`,
        customAlias: customAlias.trim() || undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        utmParameters: {
          source: utmSource.trim() || undefined,
          medium: utmMedium.trim() || undefined,
          campaign: utmCampaign.trim() || undefined,
          term: utmTerm.trim() || undefined,
          content: utmContent.trim() || undefined
        }
      }

      const response = await fetch('/api/creators/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedLink(result.data.link)
        // Clear form
        setOriginalUrl('')
        setCustomAlias('')
        setTitle('')
        setDescription('')
        setUtmSource('')
        setUtmMedium('')
        setUtmCampaign('')
        setUtmTerm('')
        setUtmContent('')
      } else {
        alert(result.error?.message || 'Failed to generate link')
      }
    } catch (error) {
      console.error('Error generating link:', error)
      alert('Failed to generate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuickLink = (url: string, label: string) => {
    setOriginalUrl(url)
    setTitle(`${label} - Shared by Creator ${creatorCode}`)
    setDescription(`Check out this amazing ${label.toLowerCase()} collection from GlowGlitch!`)
  }

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(linkId)
      setTimeout(() => setCopiedLink(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareLink = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyToClipboard(url, 'share')
    }
  }

  return (
    <div className="space-y-6">
      {/* Link Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="w-5 h-5" />
            <span>Generate Referral Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Target URL *
            </label>
            <Input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://glowglitch.com/products/diamond-ring or /products/diamond-ring"
              className="w-full"
            />
            <p className="text-xs text-aurora-nav-muted mt-1">
              Enter a full URL or a path starting with /
            </p>
          </div>

          {/* Custom Alias */}
          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Custom Alias (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-aurora-nav-muted">glowglitch.com/ref/</span>
              <Input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                placeholder="my-custom-link"
                className="flex-1"
                maxLength={20}
              />
            </div>
            <p className="text-xs text-aurora-nav-muted mt-1">
              Leave empty for auto-generated link. Only letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Link Title (Optional)
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Amazing Diamond Ring Collection"
              className="w-full"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Check out this stunning collection of lab-grown diamond rings..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-aurora-nav-muted mt-1">
              {description.length}/200 characters
            </p>
          </div>

          {/* Advanced UTM Parameters */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center space-x-2 text-sm font-medium text-aurora-nav-muted hover:text-amber-600"
            >
              <span>Advanced Tracking Options</span>
              <span className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                ↓
              </span>
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 bg-muted rounded-lg border">
                <p className="text-sm text-aurora-nav-muted mb-3">
                  UTM parameters help track where your traffic comes from and measure campaign performance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-aurora-nav-muted mb-1">
                      UTM Source
                    </label>
                    <Input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="instagram, tiktok, email"
                      className="w-full text-sm"
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Where the traffic originates</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-aurora-nav-muted mb-1">
                      UTM Medium
                    </label>
                    <Input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="social, story, post, email"
                      className="w-full text-sm"
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Marketing medium</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-aurora-nav-muted mb-1">
                      UTM Campaign
                    </label>
                    <Input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="summer-sale, new-collection"
                      className="w-full text-sm"
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Campaign name</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-aurora-nav-muted mb-1">
                      UTM Content
                    </label>
                    <Input
                      type="text"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      placeholder="video-1, image-2, story-highlight"
                      className="w-full text-sm"
                    />
                    <p className="text-xs text-aurora-nav-muted mt-1">Content identifier</p>
                  </div>
                </div>
                
                <div className="text-xs text-aurora-nav-muted bg-muted p-3 rounded border-l-4 border-border">
                  <strong>Pro Tip:</strong> Use consistent naming conventions like "instagram-story", "tiktok-post" 
                  to better track which content types perform best!
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateLink}
            disabled={!originalUrl.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Referral Link'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Quick Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.url}
                onClick={() => handleQuickLink(link.url, link.label)}
                className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-border hover:bg-muted transition-colors"
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-sm font-medium text-aurora-nav-muted">{link.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Link Display */}
      {generatedLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Link Generated Successfully!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-aurora-nav-muted">Short URL:</span>
                <Badge variant="secondary">
                  {generatedLink.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-background px-3 py-2 rounded border">
                  {generatedLink.shortUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedLink.shortUrl, generatedLink.id)}
                >
                  {copiedLink === generatedLink.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareLink(generatedLink.shortUrl, generatedLink.title || 'Check this out!')}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generatedLink.shortUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {generatedLink.title && (
              <div>
                <span className="text-sm font-medium text-aurora-nav-muted">Title:</span>
                <p className="text-sm text-foreground mt-1">{generatedLink.title}</p>
              </div>
            )}

            {generatedLink.description && (
              <div>
                <span className="text-sm font-medium text-aurora-nav-muted">Description:</span>
                <p className="text-sm text-foreground mt-1">{generatedLink.description}</p>
              </div>
            )}

            <div className="text-xs text-aurora-nav-muted">
              Created: {new Date(generatedLink.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Effective Referral Links</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-aurora-nav-muted">
            <li>• Use descriptive titles and descriptions to increase click-through rates</li>
            <li>• Create custom aliases for easy sharing and brand recognition</li>
            <li>• Share links across your social media, blog, and email newsletter</li>
            <li>• Track performance in the Links tab to see which content performs best</li>
            <li>• Include calls-to-action like "Check out this amazing deal!"</li>
            <li>• Be authentic and only recommend products you genuinely love</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}