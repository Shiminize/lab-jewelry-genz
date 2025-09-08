/**
 * Sharing functionality for OptimizedMaterialSwitcher
 * Handles URL generation, social sharing, and state preservation
 */

interface CustomizerState {
  modelId: string
  currentMaterial: string
  currentFrame: number
  zoomLevel: number
  isAutoRotating: boolean
  isComparisonMode: boolean
  comparisonMaterials: string[]
}

interface ShareOptions {
  includeAnalytics?: boolean
  customMessage?: string
  platform?: 'url' | 'twitter' | 'facebook' | 'pinterest' | 'instagram' | 'email' | 'sms'
}

interface ShareResult {
  success: boolean
  shareUrl?: string
  shareText?: string
  error?: string
  analyticsData?: any
}

export class CustomizerSharing {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  // Generate shareable URL with customizer state
  generateShareUrl(state: CustomizerState): string {
    const params = new URLSearchParams({
      model: state.modelId,
      material: state.currentMaterial,
      frame: state.currentFrame.toString(),
      zoom: state.zoomLevel.toString(),
      autoRotate: state.isAutoRotating.toString(),
      comparison: state.isComparisonMode.toString(),
      ...(state.comparisonMaterials.length > 0 && {
        comparisonMaterials: state.comparisonMaterials.join(',')
      }),
      shared: Date.now().toString() // Track when shared
    })

    return `${this.baseUrl}/customizer?${params.toString()}`
  }

  // Parse share URL back to customizer state
  parseShareUrl(url: string): CustomizerState | null {
    try {
      const urlObj = new URL(url)
      const params = urlObj.searchParams

      if (!params.has('model')) return null

      return {
        modelId: params.get('model') || 'ring-classic-002',
        currentMaterial: params.get('material') || 'platinum',
        currentFrame: parseInt(params.get('frame') || '0'),
        zoomLevel: parseFloat(params.get('zoom') || '1'),
        isAutoRotating: params.get('autoRotate') === 'true',
        isComparisonMode: params.get('comparison') === 'true',
        comparisonMaterials: params.get('comparisonMaterials')?.split(',') || []
      }
    } catch (error) {
      console.error('Failed to parse share URL:', error)
      return null
    }
  }

  // Generate share text for social media
  generateShareText(state: CustomizerState, customMessage?: string): string {
    const materialName = state.currentMaterial.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const baseText = customMessage || `Check out this stunning ${materialName} ring I designed with the 3D customizer!`
    
    const features = []
    if (state.zoomLevel !== 1) features.push(`${state.zoomLevel}x zoom view`)
    if (state.isComparisonMode) features.push('comparison mode')
    if (state.isAutoRotating) features.push('auto-rotating')
    
    const featureText = features.length > 0 ? ` (${features.join(', ')})` : ''
    
    return `${baseText}${featureText} ✨ #CustomJewelry #3DDesign #GenZJewelry`
  }

  // Copy to clipboard functionality
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        return successful
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  // Share to specific platforms
  async shareToplatform(state: CustomizerState, platform: ShareOptions['platform'], options: ShareOptions = {}): Promise<ShareResult> {
    const shareUrl = this.generateShareUrl(state)
    const shareText = this.generateShareText(state, options.customMessage)
    
    try {
      switch (platform) {
        case 'url':
          const copied = await this.copyToClipboard(shareUrl)
          return {
            success: copied,
            shareUrl,
            error: copied ? undefined : 'Failed to copy URL to clipboard'
          }

        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
          window.open(twitterUrl, '_blank', 'width=600,height=400')
          return { success: true, shareUrl: twitterUrl, shareText }

        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
          window.open(facebookUrl, '_blank', 'width=600,height=400')
          return { success: true, shareUrl: facebookUrl, shareText }

        case 'pinterest':
          // For Pinterest, we'd need an image URL - using a placeholder for now
          const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`
          window.open(pinterestUrl, '_blank', 'width=600,height=400')
          return { success: true, shareUrl: pinterestUrl, shareText }

        case 'email':
          const subject = 'Check out this custom jewelry design!'
          const body = `${shareText}\n\nView and customize: ${shareUrl}`
          const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
          window.location.href = emailUrl
          return { success: true, shareUrl: emailUrl, shareText: body }

        case 'sms':
          const smsText = `${shareText}\n${shareUrl}`
          const smsUrl = `sms:?body=${encodeURIComponent(smsText)}`
          window.location.href = smsUrl
          return { success: true, shareUrl: smsUrl, shareText: smsText }

        default:
          // Try native Web Share API if available
          if (navigator.share) {
            await navigator.share({
              title: 'Custom Jewelry Design',
              text: shareText,
              url: shareUrl
            })
            return { success: true, shareUrl, shareText }
          } else {
            // Fallback to clipboard
            const copied = await this.copyToClipboard(shareUrl)
            return {
              success: copied,
              shareUrl,
              shareText,
              error: copied ? undefined : 'Platform not supported and clipboard failed'
            }
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sharing error'
      }
    }
  }

  // Capture customizer screenshot for sharing (requires canvas)
  async captureCustomizerImage(elementId: string): Promise<string | null> {
    try {
      // This would require html2canvas or similar library
      // For now, return placeholder

      return null
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    }
  }

  // Generate QR code for sharing
  generateQRCode(shareUrl: string): string {
    // This would integrate with a QR code library
    // For now, return API-based QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
  }

  // Analytics tracking for sharing events
  trackShareEvent(platform: string, state: CustomizerState, success: boolean) {
    // This integrates with the analytics system
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'customizer_design',
        content_id: `${state.modelId}_${state.currentMaterial}`,
        success
      })
    }

    // Also track with our internal analytics

  }

  // Get share analytics data
  getShareAnalytics(): any {
    // This would return aggregated sharing statistics
    return {
      totalShares: 0,
      platformBreakdown: {},
      popularMaterials: [],
      featureUsage: {}
    }
  }

  // Validate share URL (security check)
  isValidShareUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return (
        urlObj.origin === this.baseUrl &&
        urlObj.pathname === '/customizer' &&
        urlObj.searchParams.has('model')
      )
    } catch {
      return false
    }
  }
}

// Singleton instance
let sharingInstance: CustomizerSharing | null = null

export const getCustomizerSharing = (): CustomizerSharing => {
  if (!sharingInstance) {
    sharingInstance = new CustomizerSharing()
  }
  return sharingInstance
}

// URL parameter parsing helper for initializing from shared links
export const parseUrlParameters = (): Partial<CustomizerState> | null => {
  if (typeof window === 'undefined') return null
  
  const sharing = getCustomizerSharing()
  const currentUrl = window.location.href
  
  return sharing.parseShareUrl(currentUrl)
}